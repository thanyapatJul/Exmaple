import React, { useEffect, useState } from "react";
import { Box, HStack, Text, Button, ButtonGroup } from "@chakra-ui/react";
import Chart from "react-apexcharts";
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import Axios from "axios";
import { useToast, useColorModeValue } from "@chakra-ui/react";

import { Select as ChakraReactSelect } from "chakra-react-select";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
} from "@chakra-ui/react";
const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const dynamicFontSize = (categories) => {
  if (categories.length > 10) {
    return "12px"; // Smaller font for larger data sets
  } else if (categories.length > 5) {
    return "16px"; // Medium font for moderate data sets
  } else {
    return "20px"; // Larger font for smaller data sets
  }
};

const Machine_pef = () => {
  const [rawData, setRawData] = useState({
    rejectDataZcaMcTotal: [],
    rejectDataMcTotal: [],
  });
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColorDefault = useColorModeValue("gray.100", "gray.800");
  const bgColor = useColorModeValue("white", "#28303E");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const isDarkMode = localStorage.getItem("chakra-ui-color-mode") === "dark";
  const tableBg = useColorModeValue("white", "gray.700");
  const headerColor = useColorModeValue("gray.700", "gray.300");
  const cellTextColor = useColorModeValue("gray.800", "gray.200");
  const badgeBgColor = useColorModeValue("blue.500", "blue.300");
  const textChart = isDarkMode ? ["#FFF", "#FFF"] : ["#000", "#000"];
  const [chartCategories, setChartCategories] = useState([]);
  const [chartCategorieszca, setChartCategorieszca] = useState([]);

  const [displayMode, setDisplayMode] = useState("quantity");

  const [machineFilter, setMachineFilter] = useState([]);
  // ZCA Percentage Chart
  const [chartSeriesZCA, setChartSeriesZCA] = useState([]);

  const chartOptionsZCA = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`, // Display the data value
      offsetX: 10, // Adjust the position of data labels if needed
      style: {
        colors: ["#FFFFFF"], // Set label color for contrast
        fontWeight: "bold",
      },
      background: {
        enabled: true,
        foreColor: "#000",
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: "#fff",
      },
    },
    xaxis: {
      categories: chartCategorieszca, // Dynamically set categories
      labels: {
        style: {
          colors: textChart[0],
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: textChart[0],
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
      labels: {
        colors: textChart[0],
      },
    },
    fill: {
      opacity: 1,
    },
    title: {
      text: "Reject %",
      style: {
        color: textChart[0],
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`, // Show values as numbers
      },
      theme: isDarkMode ? "dark" : "light",
      style: {
        color: isDarkMode ? "#FFFFFF" : "#000000",
        background: isDarkMode ? "#333333" : "#FFFFFF",
      },
    },
    colors: [], // Define colors for the stacked bars here
  };

  // New ZCA Qty Chart for Total Reject Qty
  const [chartSeriesZCAQty, setChartSeriesZCAQty] = useState([]);

  const chartOptionsZCAQty = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}`, // Display the data value
      offsetX: 10, // Adjust position if needed
      style: {
        colors: ["#FFFFFF"], // Set label color to white for better contrast
        fontWeight: "bold",
      },
      background: {
        enabled: true,
        foreColor: "#000",
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: "#fff",
      },
    },
    xaxis: {
      categories: chartCategorieszca,
      labels: {
        style: {
          colors: textChart[0],
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: textChart[0],
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
      labels: {
        colors: textChart[0],
      },
    },
    fill: {
      opacity: 1,
    },
    title: {
      text: displayMode === "quantity" ? "Reject (แผ่น)" : "Reject (ตัน)",
      style: {
        color: textChart[0],
      },
    },

    tooltip: {
      y: {
        formatter: (val) => `${val}`, // Show values as numbers
      },
      theme: isDarkMode ? "dark" : "light",
      style: {
        color: isDarkMode ? "#FFFFFF" : "#000000",
        background: isDarkMode ? "#333333" : "#FFFFFF",
      },
    },
    colors: [], // You can specify your color palette here
  };

  // Machine Chart

  const chartOptionsMC = {
    chart: {
      type: "bar",
      height: "auto",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        endingShape: "rounded",
        dataLabels: {
          position: "top", // Ensure data labels are at the top of each bar
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -10, // Position the labels slightly above the bars
      style: {
        colors: ["#FFFFFF"],
        fontWeight: "bold",
      },
      background: {
        enabled: true,
        foreColor: "#000",
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: "#fff",
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartCategories, // Dynamically set categories
      labels: {
        style: {
          colors: textChart[0], // Apply textChart[0] color to x-axis labels
        },
      },
    },
    yaxis: [
      {
        title: {
          text:
            displayMode === "quantity"
              ? "Total Reject Qty"
              : "Total Reject Ton",
          style: {
            color: textChart[0], // Apply textChart[0] color to y-axis title
          },
        },
        labels: {
          style: {
            colors: textChart[0], // Apply textChart[0] color to y-axis labels
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Reject Percentage (%)",
          style: {
            color: textChart[0], // Apply textChart[0] color to secondary y-axis title
          },
        },
        labels: {
          style: {
            colors: textChart[0], // Apply textChart[0] color to secondary y-axis labels
          },
        },
      },
    ],
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
      theme: isDarkMode ? "dark" : "light",
      style: {
        color: isDarkMode ? "#FFFFFF" : "#000000", // Tooltip text color based on mode
        background: isDarkMode ? "#333333" : "#FFFFFF", // Tooltip background color based on mode
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: textChart[0], // Set legend label color to textChart[0]
      },
    },
    colors: ["#B03052", "#F56565"], // Colors for the bars
  };

  const [chartSeriesMC, setChartSeriesMC] = useState([]);

  const [chartSeriesMCPercentage, setChartSeriesMCPercentage] = useState([]);

  const chartOptionsMCPercentage = {
    chart: {
      type: "bar",
      height: "auto",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        endingShape: "rounded",
        dataLabels: {
          position: "top", // Position the data labels at the top of each bar
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -10, // Adjust the offset to position the labels above the bars
      style: {
        colors: ["#FFFFFF"],
        fontWeight: "bold",
      },
      background: {
        enabled: true,
        foreColor: "#000",
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: "#fff",
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        style: {
          colors: textChart[0],
        },
      },
    },
    yaxis: [
      {
        title: {
          text:
            displayMode === "quantity" ? "Total Good Qty" : "Total Good Ton",
          style: {
            color: textChart[0],
          },
        },
        labels: {
          style: {
            colors: textChart[0],
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Good Percentage (%)",
          style: {
            color: textChart[0],
          },
        },
        labels: {
          style: {
            colors: textChart[0],
          },
        },
      },
    ],
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
      theme: isDarkMode ? "dark" : "light",
      style: {
        fontSize: "12px",
        color: "#FFFFFF",
        background: "#333333",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: textChart[0],
      },
    },
    colors: ["#1c4d31", "#48BB78"],
  };

  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const toast = useToast();

  const handleSearch = () => {
    const [start, end] = dateRange;
    if (start && end) {
      const selectedMachines = machineFilter.map((machine) => machine.value); // Get the selected machine values
      fetchReject(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0],
        selectedMachines // Pass selected machines to the fetch function
      );
    } else {
      toast({
        title: "Please select a date range.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchReject = async (startDate, endDate, machines) => {
    try {
      console.log(machines, "machines");
      const response = await client.get("wms/api/get_reject", {
        params: {
          start_date: startDate,
          end_date: endDate,
          machines: machines,
        },
      });
      console.log(response.data);

      // Process ZCA-specific reject data
      const zcaData = response.data.reject_data_zca_mc_total;
      setRawData({
        rejectDataZcaMcTotal: response.data.reject_data_zca_mc_total,
        rejectDataMcTotal: response.data.reject_data_mc_total,
      });
      const zcaCategories = [];
      const machineSeriesZCA = {};

      zcaData.forEach((item) => {
        const { name_th, machine, reject_percentage_qty, total_reject_qty } =
          item;

        if (!zcaCategories.includes(name_th)) {
          zcaCategories.push(name_th);
        }

        if (!machineSeriesZCA[machine]) {
          machineSeriesZCA[machine] = [];
        }

        machineSeriesZCA[machine].push(reject_percentage_qty || 0);
      });

      const zcaSeries = Object.keys(machineSeriesZCA).map((machine) => ({
        name: machine,
        data: zcaCategories.map(
          (zca) =>
            zcaData.find(
              (item) => item.name_th === zca && item.machine === machine
            )?.reject_percentage_qty || 0
        ),
      }));
      setChartSeriesZCA(zcaSeries);

      // Build ZCA quantity chart series (total reject quantities by machine)
      const zcaSeriesQty = Object.keys(machineSeriesZCA).map((machine) => ({
        name: machine,
        data: zcaCategories.map((zca) => {
          const item = zcaData.find(
            (entry) => entry.name_th === zca && entry.machine === machine
          );
          return displayMode === "ton"
            ? item?.sum_ton_reject || 0
            : item?.total_reject_qty || 0;
        }),
      }));
      setChartSeriesZCAQty(zcaSeriesQty);

      // Process total machine reject data
      const machineData = response.data.reject_data_mc_total;
      const machineNames = machineData.map((item) => item.machine);
      const totalRejectQty = machineData.map((item) => item.total_reject_qty);
      const totalGoodQty = machineData.map((item) => item.total_good_qty);
      const totalRejectTon = machineData.map((item) => item.sum_ton_reject);
      const totalGoodTon = machineData.map((item) => item.sum_ton_good);

      const splitTextByLength = (text, maxLength) => {
        const result = [];
        for (let i = 0; i < text.length; i += maxLength) {
          result.push(text.slice(i, i + maxLength));
        }
        return result;
      };

      // Only process zcaCategories if it's not empty
      const ChartCategorieszca =
        zcaCategories && zcaCategories.length > 0
          ? zcaCategories.map((name) => splitTextByLength(name, 20))
          : [];
      console.log(ChartCategorieszca, "ChartCategorieszca");
      setChartCategories(machineNames);
      setChartCategorieszca(ChartCategorieszca);
      const rejectPercentage = machineData.map(
        (item) => item.reject_percentage_qty
      );
      const goodPercentage = machineData.map(
        (item) => item.good_percentage_qty
      );

      setChartSeriesMC([
        {
          name: displayMode === "ton" ? "Total Reject Ton" : "Total Reject Qty",
          type: "bar",
          data: displayMode === "ton" ? totalRejectTon : totalRejectQty,
        },
        {
          name:
            displayMode === "ton"
              ? "Reject Ton Percentage (%)"
              : "Reject Percentage (%)",
          type: "bar",
          data: rejectPercentage,
        },
      ]);

      setChartSeriesMCPercentage([
        {
          name: displayMode === "ton" ? "Total Good Ton" : "Total Good Qty",
          type: "bar",
          data: displayMode === "ton" ? totalGoodTon : totalGoodQty,
        },
        {
          name:
            displayMode === "ton"
              ? "Good Ton Percentage (%)"
              : "Good Percentage (%)",
          type: "bar",
          data: goodPercentage,
        },
      ]);
    } catch (error) {
      console.error("Error fetching reject data", error);
      toast({
        title: "Error fetching reject data.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateChartSeries = () => {
    const { rejectDataZcaMcTotal, rejectDataMcTotal } = rawData;

    const zcaCategories = [];
    const machineSeriesZCA = {};

    rejectDataZcaMcTotal.forEach((item) => {
      const {
        name_th,
        machine,
        reject_percentage_qty,
        total_reject_qty,
        total_reject_ton,
      } = item;

      if (!zcaCategories.includes(name_th)) {
        zcaCategories.push(name_th);
      }

      if (!machineSeriesZCA[machine]) {
        machineSeriesZCA[machine] = [];
      }

      machineSeriesZCA[machine].push(
        displayMode === "ton"
          ? total_reject_ton || 0
          : reject_percentage_qty || 0
      );
    });

    const zcaSeriesQty = Object.keys(machineSeriesZCA).map((machine) => ({
      name: machine,
      data: zcaCategories.map((zca) => {
        const item = rejectDataZcaMcTotal.find(
          (entry) => entry.name_th === zca && entry.machine === machine
        );
        return displayMode === "ton"
          ? item?.sum_ton_reject || 0
          : item?.total_reject_qty || 0;
      }),
    }));
    setChartSeriesZCAQty(zcaSeriesQty);

    // Update machine chart
    const machineNames = rejectDataMcTotal.map((item) => item.machine);
    const totalRejectQty = rejectDataMcTotal.map(
      (item) => item.total_reject_qty
    );
    const totalGoodQty = rejectDataMcTotal.map((item) => item.total_good_qty);
    const totalRejectTon = rejectDataMcTotal.map((item) => item.sum_ton_reject);
    const totalGoodTon = rejectDataMcTotal.map((item) => item.sum_ton_good);
    const rejectPercentage = rejectDataMcTotal.map(
      (item) => `${item.reject_percentage_qty}%`
    );
    const goodPercentage = rejectDataMcTotal.map(
      (item) => `${item.good_percentage_qty}%`
    );

    const splitByFirstNumber = (text) => {
      const match = text.match(/(\D*)(\d.*)/); // Matches everything before and after the first number
      if (match) {
        return [match[1].trim(), match[2].trim()]; // Return the parts as an array
      }
      return [text.trim()]; // If no number is found, return the whole text
    };

    // Only process zcaCategories if it's not empty
    const ChartCategorieszca =
      zcaCategories && zcaCategories.length > 0
        ? zcaCategories.map((name) => splitByFirstNumber(name))
        : [];


    setChartCategories(machineNames);
    setChartCategorieszca(ChartCategorieszca);

    setChartSeriesMC([
      {
        name: displayMode === "ton" ? "Total Reject Ton" : "Total Reject Qty",
        type: "bar",
        data: displayMode === "ton" ? totalRejectTon : totalRejectQty,
      },
      {
        name:
          displayMode === "ton"
            ? "Reject Ton Percentage (%)"
            : "Reject Percentage (%)",
        type: "bar",
        data: rejectPercentage,
      },
    ]);

    setChartSeriesMCPercentage([
      {
        name: displayMode === "ton" ? "Total Good Ton" : "Total Good Qty",
        type: "bar",
        data: displayMode === "ton" ? totalGoodTon : totalGoodQty,
      },
      {
        name:
          displayMode === "ton"
            ? "Good Ton Percentage (%)"
            : "Good Percentage (%)",
        type: "bar",
        data: goodPercentage,
      },
    ]);
  };

  useEffect(() => {
    updateChartSeries(); // Call update when display mode changes
  }, [displayMode, rawData]);

  const handleDateChange = (selectedDates) => {
    setDateRange(selectedDates);
  };

  return (
    <>
      <Card p={5}>
        <HStack>
          <HStack>
            <Box zIndex={50} p={2} borderRadius="md" boxShadow="sm">
              <Text fontWeight="bold" fontSize="md" mb={1} color={textColor}>
                เลือกช่วงการผลิต
              </Text>
              <Box w="400px">
                <RangeDatepicker
                  selectedDates={dateRange}
                  onDateChange={handleDateChange}
                  configs={{
                    dateFormat: "dd/MM/yyyy",
                    dayNames: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
                    monthNames: [
                      "มกราคม",
                      "กุมภาพันธ์",
                      "มีนาคม",
                      "เมษายน",
                      "พฤษภาคม",
                      "มิถุนายน",
                      "กรกฎาคม",
                      "สิงหาคม",
                      "กันยายน",
                      "ตุลาคม",
                      "พฤศจิกายน",
                      "ธันวาคม",
                    ],
                  }}
                  placeholderText="Select Date Range"
                  rangeStartLabel="Start"
                  rangeEndLabel="End"
                />
              </Box>
            </Box>
          </HStack>

          <HStack>
            <Box zIndex={50} p={2} borderRadius="md" boxShadow="sm">
              <Text fontWeight="bold" fontSize="md" mb={1} color={textColor}>
                เลือกเครื่องการผลิต
              </Text>
              <Box width="600px">
                <ChakraReactSelect
                  isMulti
                  placeholder="Select Machines"
                  options={[
                    { label: "HS3", value: "HS3", colorScheme: "blue" },
                    { label: "HS4", value: "HS4", colorScheme: "blue" },
                    { label: "HS5", value: "HS5", colorScheme: "blue" },
                    { label: "HS6", value: "HS6", colorScheme: "blue" },
                    { label: "HS7", value: "HS7", colorScheme: "blue" },
                    { label: "HS8", value: "HS8", colorScheme: "blue" },
                    { label: "HS9", value: "HS9", colorScheme: "blue" },
                    { label: "CT1", value: "CT1", colorScheme: "orange" },
                    { label: "CT2", value: "CT2", colorScheme: "orange" },
                    { label: "CT3", value: "CT3", colorScheme: "orange" },
                    { label: "CT4", value: "CT4", colorScheme: "orange" },
                    { label: "XY1", value: "XY1" },
                    { label: "CM5", value: "CM5", colorScheme: "green" },
                    { label: "CM6", value: "CM6", colorScheme: "green" },
                    { label: "CM7", value: "CM7", colorScheme: "green" },
                    { label: "CM8", value: "CM8", colorScheme: "green" },
                    { label: "AS1", value: "AS1" },
                    { label: "PK1", value: "PK1", colorScheme: "purple" },
                    { label: "PK2", value: "PK2", colorScheme: "purple" },
                    { label: "PK3", value: "PK3", colorScheme: "purple" },
                    { label: "PK4", value: "PK4", colorScheme: "purple" },
                    { label: "PK5", value: "PK5", colorScheme: "purple" },
                    { label: "PK6", value: "PK6", colorScheme: "purple" },
                    { label: "DET", value: "DET" },
                    { label: "MS1", value: "MS1" },
                    { label: "OC1", value: "OC1" },
                    { label: "OC2", value: "OC2" },
                    { label: "DP1", value: "DP1" },
                    { label: "DP2", value: "DP2" },
                    { label: "OS1", value: "OS1" },
                    { label: "PL1", value: "PL1" },
                    { label: "RT1", value: "RT1" },
                    { label: "RT2", value: "RT2" },
                    { label: "SD1", value: "SD1" },
                    { label: "SEG1", value: "SEG1" },
                  ]}
                  onChange={setMachineFilter}
                  isClearable={true}
                  closeMenuOnSelect={false}
                />
              </Box>
            </Box>
          </HStack>

          <Button onClick={handleSearch} colorScheme="teal" mt={5}>
            Search
          </Button>
        </HStack>

        <HStack my={4}>
          <ButtonGroup
            size="sm"
            isAttached
            variant="outline"
            colorScheme="teal"
          >
            <Button
              onClick={() => setDisplayMode("quantity")}
              isActive={displayMode === "quantity"}
            >
              Display Quantity
            </Button>
            <Button
              onClick={() => setDisplayMode("ton")}
              isActive={displayMode === "ton"}
            >
              Display Ton
            </Button>
          </ButtonGroup>
        </HStack>

        <HStack
          spacing={4}
          flexDirection={{ base: "column", md: "row" }} // Stacks vertically on small screens
          alignItems="stretch"
        >
          <Box
            mt={4}
            border="1px"
            borderColor="gray.300"
            borderRadius="md"
            p={5}
            width={{ base: "100%", md: "50%" }}
          >
            {chartSeriesMC && chartSeriesMC.length > 0 ? (
              <Chart
                options={chartOptionsMC}
                series={chartSeriesMC}
                type="bar"
                height={400}
              />
            ) : (
              <Text>No data available for Machine Chart</Text>
            )}
          </Box>
          <Box
            mt={4}
            border="1px"
            borderColor="gray.300"
            borderRadius="md"
            p={5}
            width={{ base: "100%", md: "50%" }} // Takes full width on small screens, half on medium and up
          >
            {chartSeriesMC && chartSeriesMC.length > 0 ? (
              <Chart
                options={chartOptionsMCPercentage}
                series={chartSeriesMCPercentage}
                type="bar"
                height={400}
              />
            ) : (
              <Text>No data available for Machine Chart</Text>
            )}
          </Box>
        </HStack>

        <Tabs variant="soft-rounded" colorScheme="teal" mt={5}>
          <TabList>
            <Tab>ZCA Reject Percentage</Tab>
            <Tab>
              {displayMode === "quantity"
                ? "ZCA Total Reject Quantity"
                : "ZCA Total Reject Weight"}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box
                mt={4}
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                p={5}
              >
                <Chart
                  options={chartOptionsZCA}
                  series={chartSeriesZCA}
                  type="bar"
                  height={
                    chartCategorieszca && chartCategorieszca.length > 0
                      ? chartCategorieszca.length * 50
                      : 400
                  }
                />
              </Box>
            </TabPanel>
            <TabPanel>
              <Box
                mt={4}
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                p={5}
              >
                <Chart
                  options={chartOptionsZCAQty}
                  series={chartSeriesZCAQty}
                  type="bar"
                  height={
                    chartCategorieszca && chartCategorieszca.length > 0
                      ? chartCategorieszca.length * 50
                      : 400
                  }
                />

              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </>
  );
};

export default Machine_pef;
