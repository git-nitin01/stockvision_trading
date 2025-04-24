import WebSocket from 'ws';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

const subscribers = new Map(); // symbol → Set of callbacks

finnhubWs.on('open', () => {
  console.log('Connected to Finnhub');
});

finnhubWs.on('message', (msg) => {
  const data = JSON.parse(msg);
  if (data.type === 'trade') {
    data.data.forEach((trade) => {
      const { s: symbol, p: price } = trade;
      const callbacks = subscribers.get(symbol);
      if (callbacks) {
        callbacks.forEach((cb) => cb(price));
      }
    });
  }
});

export function subscribeToSymbol(symbol, callback) {
  if (!subscribers.has(symbol)) {
    subscribers.set(symbol, new Set());
    finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol }));
  }
  subscribers.get(symbol).add(callback);
}

export function unsubscribeFromSymbol(symbol, callback) {
  const callbacks = subscribers.get(symbol);
  if (!callbacks) return;

  callbacks.delete(callback);
  if (callbacks.size === 0) {
    subscribers.delete(symbol);
    finnhubWs.send(JSON.stringify({ type: 'unsubscribe', symbol }));
  }
}