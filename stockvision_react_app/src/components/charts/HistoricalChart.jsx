import React, { useState, useEffect } from "react";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { fetchData } from "../../services/stockService";

const StockCanvas = CanvasJSReact.CanvasJSStockChart;

const HistoricalChart = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [navigatorData, setNavigatorData] = useState([]);
  const [alignment, setAlignment] = useState("spline");

  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!symbol) return;

      try {
        const data = await fetchData(symbol);
        const stockData = [];
        const volumeData = [];
        const navigatorData = [];

        data.forEach((c) => {
          stockData.push({
            x: new Date(c.time),
            y: [Number(c.open), Number(c.high), Number(c.low), Number(c.close)],
          });
          volumeData.push({
            x: new Date(c.time),
            y: Number(c.volume),
          });
          navigatorData.push({
            x: new Date(c.time),
            y: Number(c.adjClose),
          });
        });

        setStockData(stockData);
        setVolumeData(volumeData);
        setNavigatorData(navigatorData);
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      }
    };

    loadHistoricalData();
  }, [symbol]);

  const options = {
    theme: "light2",
    charts: [{
      axisX: {
        lineThickness: 5,
        tickLength: 0,
        labelFormatter: function(e) {
          return "";
        },
        crosshair: {
          enabled: true,
          snapToDataPoint: true,
          labelFormatter: function(e) {
            return "";
          }
        }
      },
      axisY: {
        title: `${symbol} Price`,
        prefix: "$",
        tickLength: 0
      },
      toolTip: {
        shared: true
      },
      data: [{
        name: "Price (in USD)",
        yValueFormatString: "$#,###.##",
        type: "candlestick",
        risingColor: "green",
        fallingColor: "red",
        dataPoints : stockData
      }]
    },{
      height: 100,
      axisX: {
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      axisY: {
        title: "Volume",
        prefix: "$",
        tickLength: 0
      },
      toolTip: {
        shared: true
      },
      data: [{
        name: "Volume",
        yValueFormatString: "$#,###.##",
        type: "column",
        dataPoints : volumeData
      }]
    }],
    navigator: {
      data: [{
        dataPoints: navigatorData
      }],
      slider: {
        minimum: navigatorData[0]?.x,
        maximum: navigatorData[navigatorData.length - 1]?.x
      }
    }
  };

  const optionsSpline = {
    theme: "light2",
    charts: [{
      axisX: {
        crosshair: {
          enabled: true,
          snapToDataPoint: true,
          valueFormatString: "MMM DD YYYY"
        }
      },
      axisY: {
        title: `${symbol} Price`,
        prefix: "$",
        crosshair: {
          enabled: true,
          snapToDataPoint: true,
          valueFormatString: "$#,###.##"
        }
      },
      toolTip: {
        shared: true
      },
      data: [{
        name: "Price (in USD)",
        type: "splineArea",
        color: "#3576a8",
        yValueFormatString: "$#,###.##",
        xValueFormatString: "MMM DD YYYY",
        dataPoints : navigatorData
      }]
    }],
    navigator: {
      slider: {
        minimum: navigatorData[0]?.x,
        maximum: navigatorData[navigatorData.length - 1]?.x
      }
    }
  };

  const handleChange = (event) => {
    setAlignment(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        <ToggleButton value="spline">Spline</ToggleButton>
        <ToggleButton value="candle">Candle</ToggleButton>
      </ToggleButtonGroup>
      {
        alignment === "spline" ?
        <StockCanvas options={optionsSpline} containerProps={{ width: "100%", height: "500px" }}/> :
        <StockCanvas options={options} containerProps={{ width: "100%", height: "500px" }}/>
      }
    </Paper>
  );
};

export default HistoricalChart;
