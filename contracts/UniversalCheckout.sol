// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title UniversalCheckout
 * @dev Multi-token payment routing and merchant stablecoin settlement engine.
 */
contract UniversalCheckout {
    address public owner;
    address public feeRecipient;
    uint256 public feeBps = 25; // 0.25% protocol fee, charged on the merchant payout
    uint256 public constant MAX_FEE_BPS = 1000; // 10% hard cap

    struct MerchantAccount {
        address preferredStablecoin;
        uint256 totalVolumeUsd;
        bool isActive;
    }

    mapping(address => MerchantAccount) public merchants;

    event PaymentProcessed(
        bytes32 indexed invoiceId,
        address indexed merchant,
        address indexed payer,
        address inputToken,
        uint256 inputAmount,
        uint256 merchantPayoutUsd
    );

    event FeeBpsUpdated(uint256 feeBps);
    event FeeRecipientUpdated(address indexed feeRecipient);

    // Hand-rolled reentrancy guard (no forge-std / OZ dependency). 1 = unlocked, 2 = entered.
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "Checkout: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Checkout: caller is not owner");
        _;
    }

    constructor(address feeRecipient_) {
        require(feeRecipient_ != address(0), "Checkout: invalid fee recipient");
        owner = msg.sender;
        feeRecipient = feeRecipient_;
    }

    /**
     * @dev Updates the protocol fee. Capped at `MAX_FEE_BPS` so the merchant payout cannot be
     * silently drained by an owner key compromise.
     */
    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Checkout: fee too high");
        feeBps = newFeeBps;
        emit FeeBpsUpdated(newFeeBps);
    }

    /**
     * @dev Updates the fee sink. A zero recipient would strand fees, so it is rejected.
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Checkout: invalid fee recipient");
        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(newFeeRecipient);
    }

    function registerMerchant(address preferredStablecoin) external {
        merchants[msg.sender] = MerchantAccount({
            preferredStablecoin: preferredStablecoin,
            totalVolumeUsd: 0,
            isActive: true
        });
    }

    /**
     * @dev Splits `inputAmount` into a protocol fee and a merchant payout.
     * Integer division rounds the fee **down**, so any remainder is left with the merchant
     * (rounding in favour of the merchant). The fee is 0 whenever `inputAmount * feeBps < 10_000`.
     */
    function _splitFee(uint256 inputAmount) internal view returns (uint256 feeAmount, uint256 merchantAmount) {
        feeAmount = (inputAmount * feeBps) / 10_000;
        merchantAmount = inputAmount - feeAmount;
    }

    function payInvoice(
        bytes32 invoiceId,
        address merchant,
        address inputToken,
        uint256 inputAmount,
        uint256 expectedPayoutUsd
    ) external payable nonReentrant {
        require(merchant != address(0), "Checkout: invalid merchant");
        require(merchants[merchant].isActive, "Checkout: merchant not registered");

        // Checks.
        if (inputToken == address(0)) {
            require(msg.value == inputAmount, "Checkout: incorrect ETH value");
        }

        (uint256 feeAmount, uint256 merchantAmount) = _splitFee(inputAmount);

        // Effects: all accounting is written and the event is emitted BEFORE any external
        // call, so a re-entrant callee can never observe or exploit stale accounting.
        merchants[merchant].totalVolumeUsd += expectedPayoutUsd;

        emit PaymentProcessed(
            invoiceId,
            merchant,
            msg.sender,
            inputToken,
            inputAmount,
            expectedPayoutUsd
        );

        // Interactions.
        if (inputToken == address(0)) {
            payable(merchant).transfer(merchantAmount);
            if (feeAmount > 0) {
                payable(feeRecipient).transfer(feeAmount);
            }
        } else {
            _safeTransferFrom(inputToken, msg.sender, merchant, merchantAmount);
            if (feeAmount > 0) {
                _safeTransferFrom(inputToken, msg.sender, feeRecipient, feeAmount);
            }
        }
    }

    /**
     * @dev ERC20 `transferFrom` that reverts unless the token reports success.
     * Handles both boolean-returning tokens and tokens that return no data.
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "Checkout: ERC20 transferFrom failed");
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
