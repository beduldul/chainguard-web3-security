// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RecurringBilling
 * @dev Smart contract managing automated onchain subscription streaming allowances and merchant pulls.
 */
contract RecurringBilling {
    struct Subscription {
        address subscriber;
        address merchant;
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
        uint256 amountUsdc,
        uint256 intervalSeconds
    ) external {
        subscriptions[subId] = Subscription({
            subscriber: msg.sender,
            merchant: merchant,
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
        emit SubscriptionBilled(subId, block.timestamp);
    }

    function cancelSubscription(bytes32 subId) external {
        Subscription storage sub = subscriptions[subId];
        require(sub.subscriber == msg.sender, "RecurringBilling: caller is not subscriber");
        sub.isActive = false;

        emit SubscriptionCancelled(subId);
    }
}
