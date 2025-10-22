import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import SockJS from 'sockjs-client';

class WebSocketService {
	constructor() {
		this.stompClient = null;
		this.connected = false;
		this.subscribers = new Map();
		this.connecting = false;
		this.socketFactory = null;
		this.connectionPromise = null;
		this.pendingSubscriptions = [];
		this.usageCount = 0;
		this.onConnectCallbacks = new Set();
		this.onDisconnectCallbacks = new Set();
	}

	connect() {
		this.usageCount = Math.max(0, this.usageCount) + 1;
		if (this.connected) return Promise.resolve();
		if (this.connecting && this.connectionPromise) return this.connectionPromise;

		this.connecting = true;

		this.connectionPromise = new Promise((resolve, reject) => {
			try {
				// ============================
				// 🔹 LOCAL DEVELOPMENT MODE
				// Trỏ trực tiếp tới backend port 8080
				// ============================
				this.socketFactory = () => new SockJS('http://localhost:8080/ws');

				// ============================
				// 🔸 DOCKER / DEPLOY MODE (Ghi chú)
				// Khi dùng Docker + Vite proxy, có thể dùng:
				// this.socketFactory = () => new SockJS('/ws');
				// và bật proxy '/ws' trong vite.config.js
				// ============================

				this.stompClient = Stomp.over(this.socketFactory);

				this.stompClient.configure({
					reconnectDelay: 5000,
					heartbeatIncoming: 4000,
					heartbeatOutgoing: 4000,
					debug: (str) => {
						if (import.meta.env.DEV) {
							console.log('STOMP:', str);
						}
					},
				});

				this.stompClient.connect(
					{},
					(frame) => {
						console.log('✅ WebSocket connected:', frame);
						this.connected = true;
						this.connecting = false;

						this.onConnectCallbacks.forEach((cb) => {
							try {
								cb();
							} catch {
								/* ignore */
							}
						});

						// Drain pending subscriptions
						if (this.pendingSubscriptions.length > 0) {
							this.pendingSubscriptions.forEach(({ destination, callback }) => {
								const sub = this.stompClient.subscribe(destination, callback);
								this.subscribers.set(destination, sub);
							});
							this.pendingSubscriptions = [];
						}

						resolve();
					},
					(error) => {
						console.error('❌ WebSocket connection error:', error);
						this.connected = false;
						this.connecting = false;
						this.connectionPromise = null;
						reject(error);
					}
				);
			} catch (error) {
				console.error('Failed to create WebSocket connection:', error);
				this.connecting = false;
				this.connectionPromise = null;
				reject(error);
			}
		});

		return this.connectionPromise;
	}

	disconnect() {
		this.usageCount = Math.max(0, this.usageCount - 1);
		if (this.usageCount > 0) return;

		if (this.stompClient) {
			this.subscribers.forEach((subscription) => {
				subscription.unsubscribe();
			});
			this.subscribers.clear();

			try {
				if (this.stompClient.connected) {
					this.stompClient.disconnect();
				}
			} catch (e) {
				console.error('Failed to disconnect WebSocket:', e);
				toast.error('Failed to disconnect WebSocket');
			}

			this.connected = false;
			this.connecting = false;
			this.connectionPromise = null;

			this.onDisconnectCallbacks.forEach((cb) => {
				try {
					cb();
				} catch {
					/* ignore */
				}
			});
		}
	}

	subscribe(destination, callback) {
		const hasClient = !!this.stompClient;
		const isStompConnected = hasClient && this.stompClient.connected === true;

		if (!this.connected || !isStompConnected) {
			this.pendingSubscriptions.push({ destination, callback });
			this.connect().catch(() => {});
			return null;
		}

		const subscription = this.stompClient.subscribe(destination, callback);
		this.subscribers.set(destination, subscription);
		return subscription;
	}

	unsubscribe(destination) {
		const subscription = this.subscribers.get(destination);
		if (subscription) {
			subscription.unsubscribe();
			this.subscribers.delete(destination);
		}
	}

	send(destination, body) {
		if (!this.connected) {
			console.error('WebSocket not connected');
			return;
		}
		this.stompClient.send(destination, {}, JSON.stringify(body));
	}

	isConnected() {
		return this.connected;
	}

	onConnect(callback) {
		this.onConnectCallbacks.add(callback);
		return () => this.onConnectCallbacks.delete(callback);
	}

	onDisconnect(callback) {
		this.onDisconnectCallbacks.add(callback);
		return () => this.onDisconnectCallbacks.delete(callback);
	}
}

const websocketService = new WebSocketService();
export default websocketService;
