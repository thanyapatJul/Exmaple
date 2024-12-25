import React, { useEffect, useState } from "react";
import { Box, Heading } from "@chakra-ui/react";
import ReactApexChart from "react-apexcharts";

const StockHistoryHeatmap = ({ history }) => {
  const [heatmapSeries, setHeatmapSeries] = useState([]);

  useEffect(() => {
    // Transform history data into the required heatmap format
    const seriesData = history.map((item) => ({
      name: item.name, // This becomes the y-axis label for each ZCA
      data: item.data.map((entry) => ({
        x: new Date(entry.x).toLocaleDateString("en-CA"), // Format date as YYYY-MM-DD
        y: entry.y, // Value for the heatmap cell
      })),
    }));

    setHeatmapSeries(seriesData);
  }, [history]);

  const chartOptions = {
    chart: {
      type: "heatmap",
      height: 500,
      
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category", // Changed from "datetime" to "category" for custom-formatted dates
      title: { text: "Date" },
    },
    yaxis: {
      title: { text: "ZCA" },
      labels: {
        formatter: (val) => val, // Display ZCA as is
      },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        distributed: true, // Enables different colors for each ZCA
        colorScale: {
          inverse: false, // Higher values are darker
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} units`,
      },
    },
  };

  return (
    <Box p={4}>
      <Heading fontSize="xl">
        Stock History Heatmap
      </Heading>
      <ReactApexChart
        options={chartOptions}
        series={heatmapSeries}
        type="heatmap"
        height={500}
        width={1500}
      />
    </Box>
  );
};

export default StockHistoryHeatmap;
