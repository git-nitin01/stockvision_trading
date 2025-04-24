import axios from 'axios';

export async function executeOrder(ws, order, price) {
  const BUY_URL = 'http://localhost:7070/stockvision/api/orders/buy';
  const SELL_URL = 'http://localhost:7070/stockvision/api/orders/sell';
  const url = order.orderType === 'BUY' ? BUY_URL : SELL_URL;

  try {
    const res = await axios.post(
      url,
      {
        symbol: order.symbol,
        price,
        action: order.orderType,
        quantity: order.quantity,
        orderType: order.type,
        userId: order.userId,
      },
      {
        headers: { Authorization: `Bearer ${order.token}` },
      }
    );
    console.log('Order executed:', res.data);
  } catch (err) {
    ws.send(JSON.stringify({
      type: 'ORDER_ERROR',
      orderId: order.orderId,
      error: err.response.data,
    }));
  }
}

