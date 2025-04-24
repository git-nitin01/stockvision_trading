import React, { useState } from "react";
import { useStockData } from "../../context/StockProvider";
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { placeOrder } from "@/services/tradeService";
import { toast } from "react-toastify";
import tradingSocketService from "@/services/tradingSocketService";
import { useWallet } from "@/context/walletProvider";

const BuyModal = ({ symbol, isOpen, onClose }) => {
  const userId = useSelector((state) => state.auth.user.uid);
  const { lastPrice } = useStockData();
  const [orderType, setOrderType] = useState("market");
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { wallet, mutateWallet, mutateTransactions } = useWallet();

  const handleBuy = async () => {
    // Check if user has enough balance
    if (lastPrice * quantity > wallet.balance) {
      toast.error("Insufficient balance to place order");
      return;
    }

    // check if limit price is valid
    if (orderType === "limit" && limitPrice <= 0) {
      toast.error("Invalid limit price");
      return;
    }

    setLoading(true);
    try {
      if (orderType === "limit") {
        tradingSocketService.send({
          type: "LIMIT_ORDER",
          orderType: "BUY",
          symbol,
          price: Number(limitPrice),
          quantity: Number(quantity),
          userId
        });
        console.log(`Sent LIMIT_ORDER for ${symbol} at ${limitPrice} via WebSocket`);
        toast.info(`Limit order for ${symbol} at $${limitPrice} placed successfully`);
      } else {
        await placeOrder({
          symbol,
          orderType: "market",
          action: "buy",
          quantity: Number(quantity),
          price: lastPrice,
          userId
        });
        mutateWallet();
        mutateTransactions();
        toast.info(`Placed market order for ${symbol} at ${lastPrice}`);
      }
      onClose();
    } catch (err) {
      toast.error("Error placing order. Please try again.");
      console.error("Order Placement Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Buy {symbol}
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
          </select>

          <label className="text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={quantity}
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
        </div>

        <div className="flex justify-between mt-4">
          <Button
            onClick={handleBuy}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Confirm Buy"}
          </Button>
          <Button onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;
