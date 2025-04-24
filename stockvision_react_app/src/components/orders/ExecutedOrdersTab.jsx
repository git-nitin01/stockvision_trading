import React, { useEffect, useState } from "react";
import { getExecutedOrders } from "../../services/tradeService";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

const ExecutedOrdersTab = () => {
  const [executedOrders, setExecutedOrders] = useState([]);

  useEffect(() => {
    getExecutedOrders()
      .then(res => setExecutedOrders(res.data))
      .catch(err => console.error("Executed orders error:", err));
  }, []);

  if (executedOrders.length === 0) return <p className="text-gray-500">No executed orders.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Symbol</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executedOrders.map(order => (
          <TableRow key={order.id}>
            <TableCell>{order.symbol}</TableCell>
            <TableCell>{order.orderType}</TableCell>
            <TableCell>${order.price.toFixed(2)}</TableCell>
            <TableCell>{order.quantity}</TableCell>
            <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExecutedOrdersTab;