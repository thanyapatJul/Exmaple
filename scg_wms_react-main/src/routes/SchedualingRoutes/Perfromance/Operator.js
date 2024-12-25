import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Text,
  Button,
  useToast,
  VStack,
  Stack,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Badge,
  ModalFooter,
  SimpleGrid,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import Chart from "react-apexcharts";
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import Axios from "axios";
import { useColorModeValue } from "@chakra-ui/react";
import { Select as ChakraReactSelect } from "chakra-react-select";
import OperatorModal from "./OperatorModal";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
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

const Operator_pef = () => {
  const [rawData, setRawData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [machineFilter, setMachineFilter] = useState([]);
  const [sortedOperators, setSortedOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null); // Holds data for the selected operator
  const [page, setPage] = useState(1); // Current page for pagination
  const itemsPerPage = 5; // Set the number of items per page

  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal controls

  const [operatorPastData, setOperatorPastData] = useState([]);

  const toast = useToast();
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

  const handleSearch = () => {
    const [start, end] = dateRange;
    if (start && end) {
      const selectedMachines = machineFilter.map((machine) => machine.value);
      fetchReject(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0],
        selectedMachines
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
      const response = await client.get("wms/api/get_operator_pef", {
        params: {
          start_date: startDate,
          end_date: endDate,
          machines: machines,
        },
      });

      const data = response.data.data;
      console.log(data);
      setRawData(data);
      transformChartData(data); // Transform data for the chart
      sortOperatorsByRejectPercentage(data); // Sort operators for card display
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

  const paginatedDetails = selectedOperator
    ? selectedOperator.details.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      )
    : [];
  console.log(paginatedDetails, "paginatedDetails");

  const totalPages = selectedOperator
    ? Math.ceil(selectedOperator.details.length / itemsPerPage)
    : 0;

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const transformChartData = (data) => {
    const operators = Object.keys(data);
    const operatorNames = operators.map(
      (operator) => data[operator].operator_name
    );

    const rejectTotals = operators.map(
      (operator) => data[operator].total_qty_loss
    );

    setChartCategories(operatorNames);
    setChartData([
      {
        name: "Total Reject",
        data: rejectTotals,
      },
    ]);
  };

  const sortOperatorsByRejectPercentage = (data) => {
    const sorted = Object.entries(data)
      .map(([operator, details]) => ({
        operator, // Operator ID
        total_cost: details.total_cost.toFixed(2),
        operator_name: details.operator_name,
        rejectPercentage: details.reject_percent,
        total_qty_good: details.total_qty_good,
        total_qty_loss: details.total_qty_loss,
        details: details.details,
      }))
      .sort((a, b) => b.rejectPercentage - a.rejectPercentage);

    setSortedOperators(sorted);
  };

  const openModal = (operator) => {
    setSelectedOperator(operator);
    setPage(1);
    onOpen();
  };

  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartCategories,
      title: {
        text: "Operators",
      },
      labels: {
        style: {
          colors: textChart[0], // Set color based on mode
        },
      },
    },

    yaxis: {
      title: {
        text: "Reject Totals",
        style: {
          color: textChart[0], // Set color based on mode
        },
      },
      labels: {
        style: {
          colors: textChart[0], // Set color based on mode

          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} แผ่น`,
      },
      theme: isDarkMode ? "dark" : "light",
      style: {
        color: isDarkMode ? "#FFFFFF" : "#000000",
        background: isDarkMode ? "#333333" : "#FFFFFF",
      },
    },
    colors: ["#FF4560"],
  };

  const handleDateChange = (selectedDates) => {
    setDateRange(selectedDates);
  };

  const timeSeriesChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      zoom: { enabled: false },
    },
    xaxis: {
      type: "datetime",
      title: {
        text: "Date",
      },
      labels: {
        style: {
          colors: textChart[0], // Set color based on mode
        },
      },
    },
    yaxis: {
      title: {
        text: "Qty Loss",
      },
      style: {
        color: textChart[0], // Set color based on mode
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%", // Adjust column width for readability
      },
    },
    colors: ["#FF4560"], // Customize the bar color
  };

  const timeSeriesData = selectedOperator
    ? [
        {
          name: "Qty Loss",
          data: selectedOperator.details.map((detail) => [
            new Date(detail.send_date).getTime(),
            detail.total_qty_loss,
          ]),
        },
      ]
    : [];

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

        <VStack mt={8} spacing={4} align="stretch">
          <Text fontWeight="bold" fontSize="lg">
            Operators Sorted by Reject Percentage
          </Text>
          <Stack direction="row" wrap="wrap" spacing={4}>
            {sortedOperators.map((operator) => (
              <Card
                key={operator.operator}
                boxShadow="lg"
                borderRadius="md"
                bgColor={bgColor}
              >
                <CardBody>
                  <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Text fontSize="md" fontWeight="bold">
                      {operator.operator_name}
                    </Text>
                    <Badge colorScheme="green" size="md" ms={2}>
                      {operator.operator}
                    </Badge>
                  </Flex>

                  <HStack spacing={4} justifyContent="center" mt={4}>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                    >
                      <Text fontSize="sm" color={textColor}>
                        Reject%
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.500">
                        {(operator.rejectPercentage * 100).toFixed(2)}%
                      </Text>
                    </Box>

                    {/* Total Good Box */}
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                    >
                      <Text fontSize="sm" color={textColor}>
                        Good
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="green.500">
                        {operator.total_qty_good}
                      </Text>
                    </Box>

                    {/* Total Loss Box */}
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                    >
                      <Text fontSize="sm" color={textColor}>
                        Loss
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="orange.500">
                        {operator.total_qty_loss}
                      </Text>
                    </Box>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                    >
                      <Text fontSize="sm" color={textColor}>
                        Total Reject Cost
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="orange.500">
                        {operator.total_cost}
                        {console.log(operator)}
                      </Text>
                    </Box>
                  </HStack>

                  <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={() => openModal(operator)}
                    size="xs"
                  >
                    View Details
                  </Button>
                </CardBody>
              </Card>
            ))}
          </Stack>
        </VStack>

        <Box
          mt={8}
          p={4}
          bg="white"
          rounded="md"
          boxShadow="lg"
          bgColor={bgColor}
        >
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            Operator Reject Totals
          </Text>
          <Chart
            options={chartOptions}
            series={chartData}
            type="bar"
            height={350}
          />
        </Box>

        {selectedOperator && (
          <OperatorModal
            isOpen={isOpen}
            onClose={onClose}
            selectedOperator={selectedOperator}
            paginatedDetails={paginatedDetails}
            totalPages={totalPages}
            page={page}
            handleNextPage={handleNextPage}
            handlePrevPage={handlePrevPage}
            timeSeriesChartOptions={timeSeriesChartOptions}
            timeSeriesData={timeSeriesData}
            client={client}
          />
        )}
      </Card>
    </>
  );
};

export default Operator_pef;
