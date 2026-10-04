// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title GitHubBounty
 * @dev ERC20 escrow paying a solver when the issuer (or an issuer-authorized
 * maintainer) approves a GitHub issue/PR resolution.
 *
 * Lifecycle: `createBounty` pulls the reward into escrow, `claimBounty` marks the
 * winning solver, `releaseBounty` pays that solver, and `cancelBounty` refunds
 * the issuer if the bounty was never released. Funds are held by this contract
 * between creation and release/cancel.
 */
contract GitHubBounty {
    struct Bounty {
        address issuer;
        address token;
        string issueUrl;
        uint256 rewardUsdc;
        address solver;
        bool isReleased;
        bool isCancelled;
    }

    mapping(bytes32 => Bounty) public bounties;

    // bountyId => maintainer => authorized to mark the solver / release the reward.
    mapping(bytes32 => mapping(address => bool)) public maintainers;

    event BountyCreated(
        bytes32 indexed bountyId,
        address indexed issuer,
        address token,
        string issueUrl,
        uint256 rewardUsdc
    );
    event MaintainerUpdated(bytes32 indexed bountyId, address indexed maintainer, bool status);
    event BountyClaimed(bytes32 indexed bountyId, address indexed solver);
    event BountyReleased(bytes32 indexed bountyId, address indexed solver, uint256 rewardUsdc);
    event BountyCancelled(bytes32 indexed bountyId, address indexed issuer, uint256 refundedUsdc);

    // Hand-rolled reentrancy guard (no forge-std / OZ dependency). 1 = unlocked, 2 = entered.
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "GitHubBounty: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    modifier onlyBountyIssuer(bytes32 bountyId) {
        require(bounties[bountyId].issuer == msg.sender, "GitHubBounty: only issuer");
        _;
    }

    /**
     * @dev True when the caller is the issuer or a maintainer the issuer authorized.
     */
    function _isAuthorized(bytes32 bountyId) internal view returns (bool) {
        return msg.sender == bounties[bountyId].issuer || maintainers[bountyId][msg.sender];
    }

    /**
     * @dev Creates a bounty and escrows `rewardUsdc` of `token` from the caller.
     * Duplicate ids are rejected so an existing bounty (and its escrow) can never
     * be silently overwritten.
     */
    function createBounty(
        bytes32 bountyId,
        string calldata issueUrl,
        address token,
        uint256 rewardUsdc
    ) external nonReentrant {
        require(bounties[bountyId].issuer == address(0), "GitHubBounty: bounty already exists");
        require(token != address(0), "GitHubBounty: invalid token");
        require(rewardUsdc > 0, "GitHubBounty: reward must be positive");

        // Effects before interactions: the bounty is recorded before the pull so a
        // re-entrant token cannot re-create the same id mid-transfer.
        bounties[bountyId] = Bounty({
            issuer: msg.sender,
            token: token,
            issueUrl: issueUrl,
            rewardUsdc: rewardUsdc,
            solver: address(0),
            isReleased: false,
            isCancelled: false
        });

        emit BountyCreated(bountyId, msg.sender, token, issueUrl, rewardUsdc);

        _safeTransferFrom(token, msg.sender, address(this), rewardUsdc);
    }

    /**
     * @dev Authorizes (or revokes) a maintainer for a single bounty. Issuer only.
     */
    function setMaintainer(bytes32 bountyId, address maintainer, bool status) external onlyBountyIssuer(bountyId) {
        require(maintainer != address(0), "GitHubBounty: invalid maintainer");
        maintainers[bountyId][maintainer] = status;
        emit MaintainerUpdated(bountyId, maintainer, status);
    }

    /**
     * @dev Marks the winning solver. The issuer or an authorized maintainer may call
     * this, and may re-mark the solver until the bounty is released.
     */
    function claimBounty(bytes32 bountyId, address solver) external {
        Bounty storage b = bounties[bountyId];
        require(b.issuer != address(0), "GitHubBounty: unknown bounty");
        require(_isAuthorized(bountyId), "GitHubBounty: caller is not authorized");
        require(!b.isReleased, "GitHubBounty: bounty already released");
        require(!b.isCancelled, "GitHubBounty: bounty already cancelled");
        require(solver != address(0), "GitHubBounty: invalid solver");

        b.solver = solver;

        emit BountyClaimed(bountyId, solver);
    }

    /**
     * @dev Releases the escrowed reward to the marked solver. Issuer or an authorized
     * maintainer only; requires a solver to have been marked and the escrow to be intact.
     */
    function releaseBounty(bytes32 bountyId) external nonReentrant {
        Bounty storage b = bounties[bountyId];
        require(b.issuer != address(0), "GitHubBounty: unknown bounty");
        require(_isAuthorized(bountyId), "GitHubBounty: caller is not authorized");
        require(!b.isReleased, "GitHubBounty: bounty already released");
        require(!b.isCancelled, "GitHubBounty: bounty already cancelled");
        require(b.solver != address(0), "GitHubBounty: solver not set");
        require(
            IERC20(b.token).balanceOf(address(this)) >= b.rewardUsdc,
            "GitHubBounty: insufficient escrow"
        );

        // Effects before interactions.
        b.isReleased = true;

        emit BountyReleased(bountyId, b.solver, b.rewardUsdc);

        _safeTransfer(b.token, b.solver, b.rewardUsdc);
    }

    /**
     * @dev Refunds the escrow to the issuer. Issuer only, and only before release;
     * a released bounty can never be cancelled (and a cancelled one never released).
     */
    function cancelBounty(bytes32 bountyId) external nonReentrant onlyBountyIssuer(bountyId) {
        Bounty storage b = bounties[bountyId];
        require(!b.isReleased, "GitHubBounty: bounty already released");
        require(!b.isCancelled, "GitHubBounty: bounty already cancelled");
        require(
            IERC20(b.token).balanceOf(address(this)) >= b.rewardUsdc,
            "GitHubBounty: insufficient escrow"
        );

        // Effects before interactions.
        b.isCancelled = true;

        emit BountyCancelled(bountyId, b.issuer, b.rewardUsdc);

        _safeTransfer(b.token, b.issuer, b.rewardUsdc);
    }

    /**
     * @dev ERC20 `transfer` that reverts unless the token reports success.
     * Handles both boolean-returning tokens and tokens that return no data.
     */
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "GitHubBounty: ERC20 transfer failed");
    }

    /**
     * @dev ERC20 `transferFrom` that reverts unless the token reports success.
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "GitHubBounty: ERC20 transferFrom failed");
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
