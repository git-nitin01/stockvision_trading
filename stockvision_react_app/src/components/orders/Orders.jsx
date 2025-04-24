import React, { useState } from "react";
import OrderHistory from "./Orders";
import PendingOrdersTab from "./PendingOrdersTab";
import ExecutedOrdersTab from "./ExecutedOrdersTab";
import { Button } from "@mui/material";
import { Card } from "@/components/ui/card";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("executed");

  return (
    <div className="p-6 w-[90vw] mx-auto space-y-6">
      <div className="flex gap-4 mb-4">
        <Button
          variant={activeTab === "executed" ? "contained" : "outlined"}
          onClick={() => setActiveTab("executed")}
          className="rounded-full text-sm px-4 py-1 capitalize"
        >
          Executed Orders
        </Button>
        <Button
          variant={activeTab === "pending" ? "contained" : "outlined"}
          onClick={() => setActiveTab("pending")}
          className="rounded-full text-sm px-4 py-1 capitalize"
        >
          Pending Orders
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm p-4">
        {activeTab === "executed" && <ExecutedOrdersTab />}
        {activeTab === "pending" && <PendingOrdersTab />}
      </Card>
    </div>
  );
};

export default Orders;
