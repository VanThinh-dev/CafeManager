import { useCallback, useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocket';

export const useWebSocket = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState(null);
	const reconnectTimeoutRef = useRef(null);
	const reconnectAttemptsRef = useRef(0);
	const maxReconnectAttempts = 5;
	const isConnectingRef = useRef(false);
	const offHandlersRef = useRef([]);

	const connect = useCallback(async () => {
		// Prevent multiple simultaneous connection attempts
		if (isConnectingRef.current || websocketService.isConnected()) {
			return;
		}

		isConnectingRef.current = true;

		try {
			await websocketService.connect();
			setIsConnected(true);
			setError(null);
			reconnectAttemptsRef.current = 0;
		} catch (err) {
			setError(err.message);
			setIsConnected(false);

			// Auto-reconnect with exponential backoff
			if (reconnectAttemptsRef.current < maxReconnectAttempts) {
				const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
				reconnectTimeoutRef.current = setTimeout(() => {
					reconnectAttemptsRef.current++;
					isConnectingRef.current = false;
					connect();
				}, delay);
			}
		} finally {
			isConnectingRef.current = false;
		}
	}, []);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
		websocketService.disconnect();
		// isConnected will be updated by onDisconnect callback as needed
		reconnectAttemptsRef.current = 0;
		isConnectingRef.current = false;
	}, []);

	const subscribe = useCallback((destination, callback) => {
		return websocketService.subscribe(destination, callback);
	}, []);

	const unsubscribe = useCallback(destination => {
		websocketService.unsubscribe(destination);
	}, []);

	const send = useCallback((destination, body) => {
		websocketService.send(destination, body);
	}, []);

	useEffect(() => {
		// initial connect
		connect();
		// subscribe to global connection events
		const offConnect = websocketService.onConnect(() => setIsConnected(true));
		const offDisconnect = websocketService.onDisconnect(() => setIsConnected(false));
		offHandlersRef.current = [offConnect, offDisconnect];

		return () => {
			// remove listeners first
			offHandlersRef.current.forEach(off => {
				try { off && off(); } catch (e) {
					console.error('Lỗi', e)
				}
			});
			offHandlersRef.current = [];
			// then reduce usage count / maybe disconnect
			disconnect();
		};
	}, [connect, disconnect]);

	return {
		isConnected,
		error,
		connect,
		disconnect,
		subscribe,
		unsubscribe,
		send,
	};
};
