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
  const [displayMode, setDisplayMode] = useState("quantity");
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [zcaOption, setzcaOption] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [chartSerieston, setChartSerieston] = useState([]);
  const [zcaFilter, setZcaFilter] = useState([]);
  const [comparezcaFilter, setcompareZcaFilter] = useState([]);

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

  const fetchProdSerie = async (startDate, endDate, zca) => {
    try {
      const response = await client.get("wms/api/get_prod_timeserie", {
        params: { start_date: startDate, end_date: endDate, zca },
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
    const filteredData = zcaFilter
      ? zcaFilter.map((filter) => filter.value)
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
    const selectedZca = zcaFilter
      ? zcaFilter.map((filter) => filter.value)
      : null;
    fetchProdSerie(startDate, endDate, selectedZca);
  };


  useEffect(() => {
    fetchZca();
  }, []);

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
                เลือกรหัส sku
              </Text>
              <Box>
                <FormControl style={{ zIndex: 30 }} minW={"350px"} bg={bgColor}>
                  <ChakraReactSelect
                    placeholder="Search ZCA No..."
                    options={zcaOption.map((option) => ({
                      value: option.zca,
                      label: `${option.zca} ${option.name_th}`,
                    }))}
                    onChange={setZcaFilter}
                    isClearable={true}
                    closeMenuOnSelect={false}
                    isMulti
                  />
                </FormControl>
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
        <Box w="full" mt={6} p={5} borderRadius="md" bgColor={bgColor}>
          <Chart
            options={chartOptions}
            series={displayMode === "quantity" ? chartSeries : chartSerieston}
            type="line"
            height={400}
          />
        </Box>
      </Card>

      <Card p={5} mt={5}>
        <Box>
          <FormControl style={{ zIndex: 30 }} minW={"350px"} bg={bgColor}>
            <ChakraReactSelect
              placeholder="Search ZCA No..."
              options={zcaFilter}
              onChange={setcompareZcaFilter}
              isClearable={true}
              closeMenuOnSelect={false}
              // isMulti
            />
          </FormControl>
        </Box>
      </Card>
    </>
  );
};

export default ProdSerie;
