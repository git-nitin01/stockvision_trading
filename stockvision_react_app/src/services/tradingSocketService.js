class TradingSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();  // Subscribers for incoming messages
  }

  connect(token) {
    if (this.socket) return; // Prevent reconnect

    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      // Send auth message
      this.send({
        type: 'AUTH',
        token
      });
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach((callback) => callback(data));
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.socket = null;
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready. Message not sent:', message);
    }
  }

  // Subscribe to incoming messages
  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Utility methods
  sendGetOrders(userId) {
    this.send({
      type: 'GET_ORDERS',
      userId
    });
  }

  sendCancelOrder(orderId, userId) {
    this.send({
      type: 'CANCEL_ORDER',
      orderId,
      userId
    });
  }
}

// Export singleton instance
const tradingSocketService = new TradingSocketService();
export default tradingSocketService;
