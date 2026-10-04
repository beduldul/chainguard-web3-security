// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title RecurringBilling
 * @dev Smart contract managing automated onchain subscription streaming allowances and merchant pulls.
 *
 * The design is allowance-based: the subscriber approves this contract for `amountUsdc` and
 * `processBilling` pulls one period's worth from the subscriber directly to the merchant. The
 * contract never custodies funds, so it is stateless with respect to balances.
 */
contract RecurringBilling {
    struct Subscription {
        address subscriber;
        address merchant;
        address token;
        uint256 amountUsdc;
        uint256 intervalSeconds;
        uint256 lastBilledAt;
        bool isActive;
        uint256 maxPulls; // 0 = unlimited; subscriber-settable cap on merchant pulls
        uint256 pullsCount; // number of successful billing pulls so far
    }

    mapping(bytes32 => Subscription) public subscriptions;

    event SubscriptionCreated(bytes32 indexed subId, address indexed subscriber, address indexed merchant, uint256 amountUsdc);
    event SubscriptionBilled(bytes32 indexed subId, uint256 timestamp);
    event SubscriptionCancelled(bytes32 indexed subId);
    event MaxPullsUpdated(bytes32 indexed subId, uint256 maxPulls);

    // Hand-rolled reentrancy guard (no forge-std / OZ dependency). 1 = unlocked, 2 = entered.
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "RecurringBilling: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    function createSubscription(
        bytes32 subId,
        address merchant,
        address token,
        uint256 amountUsdc,
        uint256 intervalSeconds
    ) external {
        require(merchant != address(0), "RecurringBilling: invalid merchant");
        require(token != address(0), "RecurringBilling: invalid token");
        require(amountUsdc > 0, "RecurringBilling: amount must be positive");
        require(intervalSeconds > 0, "RecurringBilling: interval must be positive");

        subscriptions[subId] = Subscription({
            subscriber: msg.sender,
            merchant: merchant,
            token: token,
            amountUsdc: amountUsdc,
            intervalSeconds: intervalSeconds,
            lastBilledAt: block.timestamp,
            isActive: true,
            maxPulls: 0,
            pullsCount: 0
        });

        emit SubscriptionCreated(subId, msg.sender, merchant, amountUsdc);
    }

    function processBilling(bytes32 subId) external nonReentrant {
        Subscription storage sub = subscriptions[subId];
        require(sub.isActive, "RecurringBilling: subscription is not active");
        require(block.timestamp >= sub.lastBilledAt + sub.intervalSeconds, "RecurringBilling: interval has not elapsed");
        require(sub.maxPulls == 0 || sub.pullsCount < sub.maxPulls, "RecurringBilling: max pulls reached");

        // Effects before interactions: advancing the timestamp first means a re-entrant
        // caller would hit "interval has not elapsed" rather than double-billing the period.
        sub.lastBilledAt = block.timestamp;
        sub.pullsCount += 1;

        emit SubscriptionBilled(subId, block.timestamp);

        _safeTransferFrom(sub.token, sub.subscriber, sub.merchant, sub.amountUsdc);
    }

    /**
     * @dev Sets the subscriber's cap on the number of billing pulls. `0` means unlimited.
     * Only the subscriber may set it, and it can never be lowered below the number of
     * pulls already made.
     */
    function setMaxPulls(bytes32 subId, uint256 maxPulls) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.subscriber == msg.sender, "RecurringBilling: caller is not subscriber");
        require(maxPulls == 0 || maxPulls >= sub.pullsCount, "RecurringBilling: max pulls below pulls made");

        sub.maxPulls = maxPulls;

        emit MaxPullsUpdated(subId, maxPulls);
    }

    function cancelSubscription(bytes32 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.subscriber == msg.sender, "RecurringBilling: caller is not subscriber");
        sub.isActive = false;

        emit SubscriptionCancelled(subId);
    }

    /**
     * @dev ERC20 `transferFrom` that reverts unless the token reports success.
     * Handles both boolean-returning tokens and tokens that return no data.
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "RecurringBilling: ERC20 transferFrom failed");
    }
}
