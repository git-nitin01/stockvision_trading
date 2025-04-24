import { WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import { connectRedis } from './redisClient.js';
import { handleOrderMessage, getUserOrders } from './orderHandler.js';
import redis from './redisClient.js';

dotenv.config();
connectRedis();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const clients = new Map(); // Map of connected clients

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'AUTH') {
        clients.set(ws, { token: data.token });
        ws.send(JSON.stringify({ type: 'AUTH_ACK' }));
      }

      else if (['LIMIT_ORDER', 'STOP_LOSS_ORDER', 'OCO_ORDER'].includes(data.type)) {
        const clientInfo = clients.get(ws);
        if (!clientInfo?.token) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized' }));
          return;
        }

        data.token = clientInfo.token;
        await handleOrderMessage(ws, data);
      }

      else if (data.type === 'GET_ORDERS') {
        const orders = await getUserOrders(data.userId);
        ws.send(JSON.stringify({
          type: 'USER_ORDERS',
          orders
        }));
      }

      else if (data.type === 'CANCEL_ORDER') {
        const { orderId, userId } = data;
      
        const orderStr = await redis.get(orderId);
        if (!orderStr) {
          ws.send(JSON.stringify({
            type: 'CANCEL_CONFIRMATION',
            orderId,
            status: 'NOT_FOUND'
          }));
          return;
        }
      
        await redis.del(orderId);
        await redis.sRem(`user:${userId}:orders`, orderId);
      
        ws.send(JSON.stringify({
          type: 'CANCEL_CONFIRMATION',
          orderId,
          status: 'CANCELLED'
        }));
      }

    } catch (err) {
      console.error('Message error:', err);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on port 8080');
