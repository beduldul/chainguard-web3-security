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
    }

    mapping(bytes32 => Subscription) public subscriptions;

    event SubscriptionCreated(bytes32 indexed subId, address indexed subscriber, address indexed merchant, uint256 amountUsdc);
    event SubscriptionBilled(bytes32 indexed subId, uint256 timestamp);
    event SubscriptionCancelled(bytes32 indexed subId);

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
            isActive: true
        });

        emit SubscriptionCreated(subId, msg.sender, merchant, amountUsdc);
    }

    function processBilling(bytes32 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.isActive, "RecurringBilling: subscription is not active");
        require(block.timestamp >= sub.lastBilledAt + sub.intervalSeconds, "RecurringBilling: interval has not elapsed");

        sub.lastBilledAt = block.timestamp;

        _safeTransferFrom(sub.token, sub.subscriber, sub.merchant, sub.amountUsdc);

        emit SubscriptionBilled(subId, block.timestamp);
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
