import React, { useEffect, useState } from "react";
import { getPortfolio } from "@/services/tradeService";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@mui/material";
import StockModal from "../charts/StockModal";

const HoldingsTab = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [Stockholding, setStockHolding] = useState(null);

  const handleOpenModal = (holding) => {
    setSelectedStock(holding.symbol);
    setStockHolding(holding);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    getPortfolio()
      .then(res => setPortfolio(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading holdings...</p>;
  if (!portfolio) return <p>No data.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Total Invested</CardTitle>
          </CardHeader>
          <p className="text-2xl font-semibold mt-2">${portfolio.totalInvested.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <p className={`text-2xl font-semibold mt-2 ${portfolio.totalValue < portfolio.totalInvested ? "text-red-500" : "text-green-500"}`}>
            ${portfolio.totalValue.toFixed(2)}
            {portfolio.totalValue < portfolio.totalInvested ? "  (" : "  (+"}
            {((portfolio.totalValue - portfolio.totalInvested) / portfolio.totalInvested * 100).toFixed(2)}%
            {")"}
          </p>
        </div>
      </div>

      <div>
        <CardTitle className="mb-2">Holdings</CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Avg Price</TableCell>
              <TableCell>Invested</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolio.holdings.map(holding => (
              <TableRow key={holding.id}>
                <TableCell>{holding.symbol}</TableCell>
                <TableCell>{holding.quantity}</TableCell>
                <TableCell>${holding.averagePrice.toFixed(2)}</TableCell>
                <TableCell>${holding.totalInvested.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenModal(holding)}>Track & Sell</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {modalOpen && <StockModal open={modalOpen} onClose={handleCloseModal} holding={Stockholding} symbol={selectedStock} mode="sell"/>}
    </div>
  );
};

export default HoldingsTab;
