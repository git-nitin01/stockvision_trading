import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import tradingSocketService from "@/services/tradingSocketService";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@mui/material";

const PendingOrdersTab = () => {
  const userId = useSelector(state => state.auth.user.uid);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    tradingSocketService.sendGetOrders(userId);

    const handleSocket = (data) => {
      if (data.type === "USER_ORDERS") {
        setPendingOrders(data.orders);
      }
    };

    tradingSocketService.addListener(handleSocket);
    return () => tradingSocketService.removeListener(handleSocket);
  }, [userId]);

  if (pendingOrders.length === 0) return <p className="text-gray-500">No pending orders.</p>;

  const mutatePendingOrders = () => {
    tradingSocketService.sendGetOrders(userId);
    tradingSocketService.addListener((data) => {
      if (data.type === "USER_ORDERS") {
        setPendingOrders(data.orders);
      }
    });
  }

  const cancelOrder = (orderId) => {
    tradingSocketService.sendCancelOrder(orderId, userId);
    tradingSocketService.addListener((data) => {
      if (data.type === "ORDER_CANCELLED") {
        mutatePendingOrders();
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Symbol</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingOrders.map(order => (
          <TableRow key={order.orderId}>
            <TableCell>{order.symbol}</TableCell>
            <TableCell>{order.type}</TableCell>
            <TableCell>${order.price || order.limit || order.stop}</TableCell>
            <TableCell>{order.quantity}</TableCell>
            <TableCell>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => cancelOrder(order.orderId)}
              >
                Cancel
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PendingOrdersTab;
