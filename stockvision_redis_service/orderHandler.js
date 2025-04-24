import redis from './redisClient.js';
import { subscribeToSymbol, unsubscribeFromSymbol } from './finnhubSocket.js';
import { executeOrder } from './backendClient.js';

export async function handleOrderMessage(ws, order) {
  const orderId = `order:${Date.now()}:${Math.floor(Math.random() * 1000000)}`; // Ensures string

  await redis.set(orderId, JSON.stringify(order));
  const userOrdersKey = `user:${order.userId}:orders`;
  await redis.sAdd(userOrdersKey, orderId);

  const lockKey = `lock:${orderId}`;

  const priceCallback = async (price) => {
    try {
      const luaScript = `
        if redis.call("exists", KEYS[1]) == 1 then
          if redis.call("setnx", KEYS[2], "locked") == 1 then
            redis.call("expire", KEYS[2], 10)
            return 1
          else
            return 0
          end
        else
          return 0
        end
      `;

      const result = await redis.eval(luaScript, {
        keys: [orderId.toString(), lockKey.toString()],
        arguments: []
      });

      if (result === 1) {
        const storedOrderStr = await redis.get(orderId);
        const storedOrder = JSON.parse(storedOrderStr);

        if (isPriceMatch(storedOrder, price)) {
          unsubscribeFromSymbol(order.symbol, priceCallback);
          await redis.del(orderId); // Delete order
          await redis.del(lockKey);

          await executeOrder(ws, storedOrder, price);
          ws.send(JSON.stringify({
            type: 'ORDER_EXECUTED',
            orderId,
            symbol: storedOrder.symbol,
            priceExecuted: price,
            orderType: storedOrder.type,
          }));
        }
      }
    } catch (err) {
      console.error('Lua lock error:', err);
    }
  };

  subscribeToSymbol(order.symbol, priceCallback);
}

function isPriceMatch(order, price) {
  if (order.type === 'LIMIT_ORDER') {
    if (order.orderType !== 'BUY') return false;
    return price <= order.price;
  }
  if (order.type === 'STOP_LOSS_ORDER') {
    if (order.orderType !== 'SELL') return false;
    return price <= order.stop;
  }
  if (order.type === 'OCO_ORDER') {
    if (order.orderType !== 'SELL') return false;
    return price >= order.limit || price <= order.stop;
  }
  return false;
}

export async function getUserOrders(userId) {
  const userOrdersKey = `user:${userId}:orders`;
  const orderIds = await redis.sMembers(userOrdersKey);

  if (!orderIds || orderIds.length === 0) return [];

  const pipeline = redis.multi();
  orderIds.forEach(id => pipeline.get(id));
  const results = await pipeline.exec();

  const validOrders = results
    .map((res, i) => {
      if (!res) return null;  // Skip missing
      try {
        const order = JSON.parse(res);
        const { token, ...sanitizedOrder } = order;
        sanitizedOrder.orderId = orderIds[i];
        return sanitizedOrder;
      } catch (e) {
        console.error('JSON parse error:', e);
        return null;
      }
    })
    .filter(Boolean);

  return validOrders;
}
