// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title OnchainCreditScore
 * @dev Verifiable credit rating registry where a score carries economic weight:
 * an account stakes ERC20 collateral to back its credential and can only withdraw
 * that stake once the authorized writer has cleared the score to zero.
 *
 * Staking is a two-sided gate — collateral cannot be withdrawn while a non-zero
 * score is outstanding, and the writer can only (re)compute a score once the
 * account has posted at least the requested collateral.
 */
contract OnchainCreditScore {
    address public owner;

    struct CreditCredential {
        uint256 score; // 0 - 100
        string ratingTier; // "EXCELLENT", "GOOD", "FAIR"
        uint256 walletAgeDays;
        uint256 successfulRepayments;
        uint256 issuedAt;
    }

    mapping(address => CreditCredential) public credentials;

    // Collateral backing a wallet's score.
    mapping(address => address) public stakeToken;
    mapping(address => uint256) public stakedAmount;

    event CreditScoreUpdated(address indexed wallet, uint256 score, string ratingTier);
    event CollateralStaked(address indexed wallet, address indexed token, uint256 amount);
    event CollateralWithdrawn(address indexed wallet, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "CreditScore: caller is not owner");
        _;
    }

    // Hand-rolled reentrancy guard (no forge-std / OZ dependency). 1 = unlocked, 2 = entered.
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "CreditScore: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev (Re)computes a wallet's credential. The wallet must have posted at least
     * `requiredCollateral` of a single token, so a credential cannot be minted
     * without economic weight behind it.
     */
    function issueCredential(
        address wallet,
        uint256 score,
        string calldata ratingTier,
        uint256 walletAgeDays,
        uint256 successfulRepayments,
        uint256 requiredCollateral
    ) external onlyOwner {
        require(score <= 100, "CreditScore: score max 100");
        require(stakedAmount[wallet] >= requiredCollateral, "CreditScore: insufficient collateral");

        credentials[wallet] = CreditCredential({
            score: score,
            ratingTier: ratingTier,
            walletAgeDays: walletAgeDays,
            successfulRepayments: successfulRepayments,
            issuedAt: block.timestamp
        });

        emit CreditScoreUpdated(wallet, score, ratingTier);
    }

    /**
     * @dev Stakes `amount` of `token` as collateral for the caller's score. A wallet
     * may only use a single collateral token; switching tokens requires withdrawing
     * first (which itself requires a cleared score).
     */
    function stakeCollateral(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "CreditScore: invalid token");
        require(amount > 0, "CreditScore: amount must be positive");

        address existing = stakeToken[msg.sender];
        require(existing == address(0) || existing == token, "CreditScore: collateral token mismatch");

        // Effects before interactions.
        stakeToken[msg.sender] = token;
        stakedAmount[msg.sender] += amount;

        emit CollateralStaked(msg.sender, token, amount);

        _safeTransferFrom(token, msg.sender, address(this), amount);
    }

    /**
     * @dev Withdraws the caller's full stake. Only the staker may withdraw, and only
     * once the score is zero (cleared by the writer) so the collateral keeps backing
     * a live credential.
     */
    function withdrawCollateral() external nonReentrant {
        uint256 amount = stakedAmount[msg.sender];
        require(amount > 0, "CreditScore: no stake to withdraw");
        require(credentials[msg.sender].score == 0, "CreditScore: score must be cleared");

        address token = stakeToken[msg.sender];

        // Effects before interactions.
        stakedAmount[msg.sender] = 0;

        emit CollateralWithdrawn(msg.sender, token, amount);

        _safeTransfer(token, msg.sender, amount);
    }

    /**
     * @dev ERC20 `transfer` that reverts unless the token reports success.
     * Handles both boolean-returning tokens and tokens that return no data.
     */
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "CreditScore: ERC20 transfer failed");
    }

    /**
     * @dev ERC20 `transferFrom` that reverts unless the token reports success.
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "CreditScore: ERC20 transferFrom failed");
    }

    /// @dev True for no data (token returns nothing) or a 32-byte word equal to 1.
    /// Any other return — `false`, a non-boolean word, or a malformed length — is failure.
    function _tokenReturnedTrue(bytes memory data) internal pure returns (bool) {
        if (data.length == 0) {
            return true;
        }
        if (data.length != 32) {
            return false;
        }
        uint256 word;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            word := mload(add(data, 0x20))
        }
        return word == 1;
    }
}
