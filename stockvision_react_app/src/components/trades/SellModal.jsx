import React, { useState } from "react";
import { useStockData } from "../../context/StockProvider";
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sellOrder } from "@/services/tradeService";
import tradingSocketService from "@/services/tradingSocketService";
import { toast } from "react-toastify";
import { useWallet } from "@/context/walletProvider";

const SellModal = ({ symbol, isOpen, onClose, holding }) => {
  const userId = useSelector((state) => state.auth.user.uid);
  const { lastPrice } = useStockData();
  const [orderType, setOrderType] = useState("market");
  const [quantity, setQuantity] = useState(1);
  const [stopPrice, setStopPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const { mutateWallet, mutateTransactions } = useWallet();

  const handleSell = async () => {
    // checks
    if (quantity > holding.quantity) {
      toast.error("You don't have enough shares to sell");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (orderType === "limit" && limitPrice <= 0) {
      toast.error("Limit price must be greater than 0");
      return;
    }
    if (orderType === "stop" && stopPrice <= 0) {
      toast.error("Stop price must be greater than 0");
      return;
    }
    if (orderType === "oco" && (limitPrice <= 0 || stopPrice <= 0)) {
      toast.error("Limit and Stop prices must be greater than 0");
      return;
    }
    if (orderType === "oco" && limitPrice <= stopPrice) {
      toast.error("Limit price must be greater than stop price");
      return;
    }

    setLoading(true);
    try {
      if (orderType === "market") {
        await sellOrder({
          symbol,
          orderType: "market",
          action: "sell",
          quantity: Number(quantity),
          price: lastPrice,
          userId
        });
        mutateWallet();
        mutateTransactions();
        console.log(`Placed market sell order for ${symbol} at ${lastPrice}`);
        toast.info(`Market sell order for ${symbol} placed successfully`);
      } else if (orderType === "stop") {
        tradingSocketService.send({
          type: "STOP_LOSS_ORDER",
          orderType: "SELL",
          symbol,
          stop: Number(stopPrice),
          quantity: Number(quantity),
          userId
        });
        console.log(`Sent STOP_LOSS_ORDER for ${symbol} at stop ${stopPrice}`);
        toast.info(`Stop Loss order for ${symbol} at $${stopPrice} placed successfully`);
      } else if (orderType === "oco") {
        tradingSocketService.send({
          type: "OCO_ORDER",
          orderType: "SELL",
          symbol,
          limit: Number(limitPrice),
          stop: Number(stopPrice),
          quantity: Number(quantity),
          userId
        });
        console.log(`Sent OCO_ORDER SELL for ${symbol}, limit ${limitPrice}, stop ${stopPrice}`);
        toast.info(`OCO order for ${symbol} placed successfully`);
      }
  
      onClose();
    } catch (err) {
      toast.error("Error placing sell order. Please try again.");
      console.error("Sell Order Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Sell {symbol}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-500 text-sm">Live Price: ${lastPrice?.toFixed(2)}</p>

        <div className="flex flex-col gap-3 mt-4">
          <label className="text-sm font-medium">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop Loss</option>
            <option value="oco">OCO (One Cancels the Other)</option>
          </select>

          <label className="text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={quantity}
            max={holding.quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="p-2 border rounded"
          />

          {orderType === "limit" && (
            <>
              <label className="text-sm font-medium">Limit Price</label>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="p-2 border rounded"
              />
            </>
          )}

          {orderType === "stop" && (
            <>
              <label className="text-sm font-medium">Stop Price</label>
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="p-2 border rounded"
              />
            </>
          )}

          {orderType === "oco" && (
            <>
              <label className="text-sm font-medium">Limit Price</label>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="p-2 border rounded"
              />

              <label className="text-sm font-medium">Stop Price</label>
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="p-2 border rounded"
              />
            </>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <Button
            onClick={handleSell}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Confirm Sell"}
          </Button>
          <Button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellModal;
