import React from "react";
import HoldingsTab from "./HoldingsTab";
import { Button } from "@mui/material";
import { Card } from "@/components/ui/card";

const Portfolio = () => {
  return (
    <div className="p-6 w-[90vw] mx-auto space-y-6">
      <Card className="rounded-2xl shadow-sm p-4">
        <HoldingsTab />
      </Card>
    </div>
  );
};

export default Portfolio;
