import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Text,
  useColorModeValue,
  useToast,
  Button,
  FormControl,
  ButtonGroup,
  Card,
} from "@chakra-ui/react";
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import Axios from "axios";
import Chart from "react-apexcharts";
import { Select as ChakraReactSelect } from "chakra-react-select";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withCredentials = true;

const ProdSerie = () => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColor = useColorModeValue("white", "#28303E");
  const toast = useToast();
  const [machineFilter, setMachineFilter] = useState([]);
  const [displayMode, setDisplayMode] = useState("quantity");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [zcaOption, setzcaOption] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [chartSerieston, setChartSerieston] = useState([]);


  const chartOptions = {
    chart: {
      type: "line",
      zoom: { enabled: true }, // Enable zooming here
      toolbar: { show: true },
    },
    xaxis: {
      type: "category",
      labels: {
        style: { colors: textColor, fontSize: "12px" },
        formatter: (value) => {
          const date = new Date(value);
          date.setDate(date.getDate() + 1);
          return date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
        },
      },
    },
    yaxis: {
      title: { text: "ZCA Count", style: { color: textColor } },
      labels: { style: { colors: textColor, fontSize: "12px" } },
    },
    stroke: { curve: "smooth" },
    markers: { size: 5 },
    tooltip: {
      x: { format: "MMM yyyy" },
      y: {
        formatter: (val) => (val !== undefined ? val.toFixed(2) : "N/A"),
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: textColor },
    },
  };

  const fetchMcPerf = async (startDate, endDate, machineFilter) => {
    try {
      const response = await client.get("wms/api/get_mc_timeserie", {
        params: { start_date: startDate, end_date: endDate, machineFilter },
      });

      const processedData = processChartData(response.data.Pastproduct);
      const processedDataton = processChartData(response.data.Pastproductton);
      setChartSeries(processedData);
      setChartSerieston(processedDataton);
    } catch (error) {
      console.log(error);
      console.error("Error fetching production time series", error);
      toast({
        title: "Error fetching data.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchZca = async () => {
    try {
      const response = await client.get("wms/api/get_zca_option");
      setzcaOption(response.data.unique_zca_name);
    } catch (error) {
      console.error("Error fetching ZCA options", error);
      toast({
        title: "Error fetching data.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const processChartData = (data) => {
    const filteredData = machineFilter
      ? machineFilter.map((filter) => filter.value)
      : Object.keys(data);

    return filteredData.map((productCode) => ({
      name: productCode,
      data: data[productCode].map((entry) => ({
        x: new Date(entry.x).toISOString().split("T")[0],
        y: entry.y || 0,
      })),
    }));
  };

  const handleDateChange = (selectedDates) => {
    setDateRange(selectedDates);
  };

  const handleSearch = () => {
    const [startDate, endDate] = dateRange.map(
      (date) => date.toISOString().split("T")[0]
    );
    const selectmachineFilter = machineFilter
      ? machineFilter.map((filter) => filter.value)
      : null;
    fetchMcPerf(startDate, endDate, selectmachineFilter);
  };

  
  useEffect(() => {
    fetchZca();
  }, []);

  return (
    <>

      <Card p={5}>
      <HStack>
          <HStack >
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

          <HStack >
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

        <Box w="full" mt={6} p={5} borderRadius="md" bgColor={bgColor}>
          <Chart
            options={chartOptions}
            series={displayMode === "quantity" ? chartSeries : chartSerieston}
            type="line"
            height={400}
          />
        </Box>
      </Card>
    </>
  );
};

export default ProdSerie;
