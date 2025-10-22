import { useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Hook để quản lý WebSocket subscriptions với auto-cleanup
 * @param {Array} subscriptions - Array of subscription configs
 */
export const useWebSocketSubscriptions = (subscriptions = []) => {
	const { isConnected, subscribe, unsubscribe } = useWebSocket();
	const subscriptionsRef = useRef(new Set());

	const addSubscription = useCallback(
		(destination, callback) => {
			if (subscriptionsRef.current.has(destination)) {
				return; // Already subscribed
			}

			subscribe(destination, callback);
			subscriptionsRef.current.add(destination);
		},
		[subscribe],
	);

	const removeSubscription = useCallback(
		destination => {
			if (subscriptionsRef.current.has(destination)) {
				unsubscribe(destination);
				subscriptionsRef.current.delete(destination);
			}
		},
		[unsubscribe],
	);

	const clearAllSubscriptions = useCallback(
		() => {
			subscriptionsRef.current.forEach(destination => {
				unsubscribe(destination);
			});
			subscriptionsRef.current.clear();
		},
		[unsubscribe],
	);

	useEffect(
		() => {
			if (!isConnected) return;

			// Add all subscriptions
			subscriptions.forEach(({ destination, callback }) => {
				addSubscription(destination, callback);
			});

			// Cleanup on unmount or dependency change
			return () => {
				clearAllSubscriptions();
			};
		},
		[isConnected, addSubscription, clearAllSubscriptions],
	);

	return {
		addSubscription,
		removeSubscription,
		clearAllSubscriptions,
		isConnected,
	};
};
