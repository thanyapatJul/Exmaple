import React, { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import {
  Box,
  HStack,
  Button,
  IconButton,
  Text,
  Input,
  Flex,
  Spacer,
  ButtonGroup,
  useColorModeValue,
  FormControl,
  useToast,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Progress,
} from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";
import { Select as ChakraReactSelect } from "chakra-react-select";
import Axios from "axios";
import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import Chart from "react-apexcharts";
import Swal from "sweetalert2";
import "rsuite-table/dist/css/rsuite-table.css";
import { RangeDatepicker } from "chakra-dayzed-datepicker";
import { DownloadIcon } from "@chakra-ui/icons";
import PlanDetailsModal from "./PlanDetailsModal"; // Import your PlanDetailsModal component
import { VStack } from "rsuite";

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
      // Redirect to the login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const PlanPef = () => {
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

  const [showMachineDeliveringTotals, setShowMachineDeliveringTotals] =
    useState(true);
  const toggleMachineDeliveringTotals = () => {
    setShowMachineDeliveringTotals((prev) => !prev);
  };

  const [filteredPlans, setFilteredPlans] = useState([]);
  const [remainPlans, setRemainPlans] = useState([]);
  const [zcaFilter, setZcaFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const pageCount = Math.ceil(filteredPlans.length / rowsPerPage);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [displayMode, setDisplayMode] = useState("quantity");
  const [machineFilter, setMachineFilter] = useState([]);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortType, setSortType] = useState("asc");

  const [totalPlans, setTotalPlans] = useState(0);
  const [donePlans, setDonePlans] = useState(0);

  const [totalReject, settotalReject] = useState(0);
  const [totalRejectPlt, setTotalRejectPlt] = useState(0);
  const [totalRejectTon, setTotalRejectTon] = useState(0);

  const [unfinishPlans, setUnfinishPlans] = useState(0);

  const [donePalletTotal, setDonetotalPallet] = useState(0);
  const [undonePalletTotal, setUndonetotalPallet] = useState(0);

  const [donetotalTon, setDonetotalTon] = useState(0);
  const [undonetotalTon, setUndonetotalTon] = useState(0);

  const [doneData, setDoneData] = useState({});
  const [undoneData, setUndoneData] = useState({});

  const [donePallet, setDonePallet] = useState({});
  const [undonePallet, setUndonePallet] = useState({});

  const [doneDataTon, setDoneDataTon] = useState({});
  const [undoneDataTon, setUndoneDataTon] = useState({});

  const [chartData, setChartData] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);
  const [weekrange, setweekrange] = useState([]);

  const toast = useToast();

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  //   const exportTableToExcel = async () => {
  //     try {
  //       const response = await client.post(
  //         "wms/api/export_to_excel",
  //         {
  //           data: filteredPlans,
  //         },
  //         { responseType: "blob" }
  //       );

  //       if (!response.data) {
  //         console.error("No data returned from API");
  //         return;
  //       }

  //       const url = window.URL.createObjectURL(
  //         new Blob([response.data], { type: "application/vnd.ms-excel" })
  //       );

  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute("download", "exported_data.xlsx");
  //       document.body.appendChild(link);
  //       link.click();

  //       // Clean up by removing the link element
  //       document.body.removeChild(link);
  //     } catch (error) {
  //       console.error("Error exporting table to excel:", error);
  //     }
  //   };

  const fetchRemainPlan = async (startDate, endDate) => {
    try {
      const response = await client.get("wms/api/get_plan_pef", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      console.log(response.data);
      if (response.data && response.data.data) {
        // console.log("response", response.data);
        setRemainPlans(response.data.data);
        setFilteredPlans(response.data.data);

        setDonePlans(response.data.count_finish);
        setUnfinishPlans(response.data.count_unfinish);

        setTotalPlans(
          response.data.count_finish + response.data.count_unfinish
        );
        const machineDone = response.data.machine_done;
        const machineUndone = response.data.machine_undone;

        const machine_done_ton = response.data.machine_done_ton;
        const machine_undone_ton = response.data.machine_undone_ton;

        settotalReject(response.data.losscount);
        setTotalRejectPlt(response.data.losscount_plt);
        setTotalRejectTon(response.data.losscount_ton);

        setDoneData(machineDone);
        setUndoneData(machineUndone);

        setDonePallet(response.data.machine_done_pallet);
        setUndonePallet(response.data.machine_undone_pallet);

        setDoneDataTon(machine_done_ton);
        setUndoneDataTon(machine_undone_ton);

        setDonetotalTon(response.data.ton_done);
        setUndonetotalTon(response.data.ton_undone);

        setDonetotalPallet(response.data.total_pallet_done);
        setUndonetotalPallet(response.data.total_pallet_undone);
      }
    } catch (error) {
      console.error("Error fetching remaining plans", error);
      toast({
        title: "Error fetching remaining plans.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchweeks = async (startDate, endDate) => {
    try {
      const response = await client.get("wms/api/GetWeeksRange", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      if (response.data) {
        const weeks = response.data.week_number;
        const weekDisplay =
          weeks[0] === weeks[1] ? weeks[0] : `${weeks[0]} - ${weeks[1]}`;
        setweekrange(weekDisplay);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching weeks range", error);
      toast({
        title: "Error fetching weeks range.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const chartOptions = {
    chart: {
      type: "bar",

      stacked: true,

      toolbar: {
        show: true,
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,

        borderRadius: 5,
      },
    },

    xaxis: {
      categories: chartCategories,

      labels: {
        style: {
          colors: textChart[0], // Set color based on mode

          fontSize: "12px",
        },
      },
    },

    yaxis: {
      title: {
        text: "ZCA Count",

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

    fill: {
      opacity: 1,
    },

    tooltip: {
      y: {
        formatter: (val) => val.toFixed(2),
      },
    },

    legend: {
      position: "top",

      horizontalAlign: "left",

      labels: {
        colors: textChart[0], // Set legend text color based on mode
      },
    },

    colors: ["#F56565", "#48BB78"],
  };

  const handleDateChange = (selectedDates) => {
    setDateRange(selectedDates);
    const [start, end] = selectedDates;
    if (start && end) {
      fetchRemainPlan(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      fetchweeks(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
    }
  };

  const applyFilters = () => {
    let filteredData = remainPlans;

    if (zcaFilter) {
      filteredData = filteredData.filter(
        (item) => item.materialcode === zcaFilter.value
      );
    }

    if (machineFilter.length > 0) {
      const selectedMachines = machineFilter.map((machine) => machine.value);
      filteredData = filteredData.filter((item) =>
        selectedMachines.includes(item.machine_plan)
      );
    }

    setFilteredPlans(filteredData);
    setCurrentPage(1);
    console.log(filteredData, "filteredData");
  };

  useEffect(() => {
    const updateChartData = () => {
      const machines = Array.from(
        new Set([...Object.keys(doneData), ...Object.keys(undoneData)])
      );

      const doneSeries = [];
      const undoneSeries = [];

      machines.forEach((machine) => {
        if (displayMode === "ton") {
          // Use tonnage data for ton mode
          doneSeries.push(doneDataTon[machine].toFixed(0) || 0);
          undoneSeries.push(undoneDataTon[machine].toFixed(0) || 0);
        } else if (displayMode === "pallet") {
          // Use tonnage data for ton mode
          doneSeries.push(donePallet[machine].toFixed(0) || 0);
          undoneSeries.push(undonePallet[machine].toFixed(0) || 0);
        } else {
          doneSeries.push(doneData[machine]?.length || 0);
          undoneSeries.push(undoneData[machine]?.length || 0);
        }
      });

      // console.log(undoneSeries);
      setChartCategories(machines);
      setChartData([
        { name: "Undone", data: undoneSeries },
        { name: "Done", data: doneSeries },
      ]);
    };

    updateChartData();
  }, [displayMode, doneData, undoneData, doneDataTon, undoneDataTon]);

  useEffect(() => {
    applyFilters();
  }, [zcaFilter, machineFilter, remainPlans]);

  const firstRowIndex = (currentPage - 1) * rowsPerPage;
  const lastRowIndex = currentPage * rowsPerPage;

  const currentData = filteredPlans.slice(firstRowIndex, lastRowIndex);

  // console.log(filteredPlans, "filteredPlans");
  const handleRowClick = (rowData) => {
    setSelectedPlan(rowData);
    setIsModalOpen(true);
  };

  const getShiftColorScheme = (shift) => {
    switch (shift) {
      case "A":
        return "blue";
      case "B":
        return "orange";
      case "C":
        return "purple";
      default:
        return "gray";
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    pageNumbers.push(
      <Button
        key={1}
        size="xs"
        onClick={() => setCurrentPage(1)}
        colorScheme={currentPage === 1 ? "teal" : "gray"}
      >
        1
      </Button>
    );

    if (currentPage > 4) {
      pageNumbers.push(<Text key="start-ellipsis">...</Text>);
    }

    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(pageCount - 1, currentPage + 2);
      i++
    ) {
      pageNumbers.push(
        <Button
          key={i}
          size="xs"
          onClick={() => setCurrentPage(i)}
          colorScheme={currentPage === i ? "teal" : "gray"}
        >
          {i}
        </Button>
      );
    }

    if (currentPage < pageCount - 3) {
      pageNumbers.push(<Text key="end-ellipsis">...</Text>);
    }

    pageNumbers.push(
      <Button
        key={pageCount}
        size="xs"
        onClick={() => setCurrentPage(pageCount)}
        colorScheme={currentPage === pageCount ? "teal" : "gray"}
      >
        {pageCount}
      </Button>
    );

    return pageNumbers;
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 20) return "red";
    if (percentage <= 50) return "orange";
    if (percentage <= 99) return "yellow";
    return "green";
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
    // console.log('sortColumn',sortColumn);
    // console.log(sortType);
    let sortedData = [...filteredPlans];

    if (sortColumn === "per_done") {
      sortedData.sort((a, b) => {
        const percentA = a.plan > 0 ? (a.done / a.plan) * 100 : 0;
        const percentB = b.plan > 0 ? (b.done / b.plan) * 100 : 0;
        if (sortType === "asc") {
          return percentA - percentB;
        }
        return percentB - percentA;
      });
    } else {
      sortedData.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (sortType === "asc") {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    setFilteredPlans(sortedData);
    // console.log(sortedData);
  };

  return (
    <>
      <HStack>
        <VStack>
          <HStack my={4}>
            <Box
              zIndex={50}
              bg={bgColor}
              p={2}
              borderRadius="md"
              boxShadow="sm"
              color={textColor}
            >
              <Text fontWeight="bold" fontSize="md" mb={1} color={textColor}>
                ช่วงแผนผลิต
              </Text>
              <Box w="400px">
                {" "}
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
                  placeholderText="เลือกช่วงวันที่"
                  rangeStartLabel="เริ่มต้น"
                  rangeEndLabel="สิ้นสุด"
                />
              </Box>
            </Box>
          </HStack>

          <HStack spacing={4} mb={4}>
            <Card borderRadius="md" background={bgColor}>
              <CardBody>
                <Stat>
                  <StatLabel fontSize="sm">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>ทั้งหมด </Box>
                      {weekrange ? (
                        <Box
                          as="span"
                          p={0.5}
                          borderRadius="md"
                          bg={weekrange.length > 1 ? "teal.500" : "blue.500"}
                          color="white"
                          display="inline-block"
                          fontSize="xs"
                        >
                          WK {weekrange}
                        </Box>
                      ) : (
                        <Box>No week range selected</Box>
                      )}
                    </Flex>
                  </StatLabel>

                  <StatNumber fontSize="xl">
                    {displayMode === "ton"
                      ? (donetotalTon + undonetotalTon).toFixed(2)
                      : displayMode === "pallet"
                      ? (donePalletTotal + undonePalletTotal).toFixed(2)
                      : totalPlans}
                  </StatNumber>
                  <StatHelpText fontSize="11px" mt={1}>
                    วันที่{" "}
                    {dateRange[0]
                      ? dateRange[0].toLocaleDateString()
                      : "ไม่ระบุ"}{" "}
                    -{" "}
                    {dateRange[1]
                      ? dateRange[1].toLocaleDateString()
                      : "ไม่ระบุ"}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card borderRadius="md" background={bgColor}>
              <CardBody>
                <Stat>
                  <StatLabel>แผนเดินครบกำหนด</StatLabel>
                  <HStack>
                    <Box w={2} h={2} borderRadius="50%" bg="green.400" />
                    <StatNumber color="green.500" fontSize="xl">
                      {totalPlans > 0
                        ? (displayMode === "ton"
                            ? (donetotalTon / (donetotalTon + undonetotalTon)) *
                              100
                            : displayMode === "pallet"
                            ? (donePalletTotal /
                                (donePalletTotal + undonePalletTotal)) *
                              100
                            : (donePlans / totalPlans) * 100
                          ).toFixed(2)
                        : 0}
                      %
                    </StatNumber>
                  </HStack>
                  <StatHelpText>
                    จำนวนแผน
                    {displayMode === "ton"
                      ? `${donetotalTon.toFixed(2)} ตัน`
                      : displayMode === "pallet"
                      ? `${donePalletTotal.toFixed(2)} พาเลท`
                      : `${donePlans} แผน`}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card borderRadius="md" background={bgColor}>
              <CardBody>
                <Stat>
                  <StatLabel>แผนคงเหลือ</StatLabel>
                  <HStack>
                    <Box w={2} h={2} borderRadius="50%" bg="red.300" />
                    <StatNumber color="red.400" fontSize="xl">
                      {totalPlans > 0
                        ? (displayMode === "ton"
                            ? (undonetotalTon /
                                (donetotalTon + undonetotalTon)) *
                              100
                            : displayMode === "pallet"
                            ? (undonePalletTotal /
                                (donePalletTotal + undonePalletTotal)) *
                              100
                            : (unfinishPlans / totalPlans) * 100
                          ).toFixed(2)
                        : 0}
                      %
                    </StatNumber>
                  </HStack>
                  <StatHelpText>
                    ยอดคงเหลือ
                    {displayMode === "ton"
                      ? `${undonetotalTon.toFixed(2)} ตัน`
                      : displayMode === "pallet"
                      ? `${undonePalletTotal.toFixed(2)} พาเลท`
                      : `${unfinishPlans} แผน`}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </HStack>
        </VStack>

        <Box
          width="60%"
          background="white"
          borderRadius="md"
          boxShadow="sm"
          ms={3}
          bgColor={bgColor}
        >
          <Chart
            options={chartOptions}
            series={chartData} // Stacked bar data series
            type="bar"
            height={220}
          />
        </Box>
      </HStack>

      <VStack>
        <Box
          mt={5}
          p={2}
          w={"100%"}
          borderRadius={"xl"}
          backgroundColor={bgColor}
          border="1px"
          borderColor={borderColor}
        >
          <HStack my={4}>

            <FormControl style={{ zIndex: 30 }} minW={"250px"} mb="4">
              <ChakraReactSelect
                placeholder="Search ZCA No..."
                options={remainPlans.map((plan) => ({
                  value: plan.materialcode,
                  label: `${plan.materialcode} ${plan.name_th}`,
                }))}
                onChange={setZcaFilter}
                isClearable={true}
                closeMenuOnSelect={false}
              />
            </FormControl>
            <FormControl style={{ zIndex: 30 }} minW={"250px"} mb="4">
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
                  { label: "SEG", value: "SEG" },
                ]}
                onChange={setMachineFilter}
                isClearable={true}
              />
            </FormControl>

          </HStack>

          <Box mt={4}>
            {filteredPlans.length > 0 ? (
              <Table
                height={510}
                data={currentData}
                onSortColumn={handleSortColumn}
                sortColumn={sortColumn}
                sortType={sortType}
                onRowClick={handleRowClick}
                style={{ backgroundColor: bgColor }}
              >
                <Column
                  width={80}
                  align="center"
                  resizable
                  fixed
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>PlanWeek</HeaderCell>
                  <Cell dataKey="planweek" />
                </Column>
                <Column
                  width={350}
                  resizable
                  fixed
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>ZCA / ชื่อไทย</HeaderCell>
                  <Cell>
                    {(rowData) => (
                      <VStack spacing={1} align="start" mb={4}>
                        <HStack>
                          {rowData.materialcode.includes("ZCAW") ? (
                            <Badge colorScheme="gray">WIP</Badge>
                          ) : rowData.materialcode.includes("ZCA") ? (
                            <Badge colorScheme="blue">FG</Badge>
                          ) : null}
                          <Text fontWeight="bold">{rowData.materialcode}</Text>{" "}
                        </HStack>
                        <Text color={textColor}>{rowData.name_th}</Text>{" "}
                        {/* Name in Thai */}
                      </VStack>
                    )}
                  </Cell>
                </Column>

                <Column
                  width={100}
                  align="center"
                  resizable
                  fixed
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>เครื่องจักรแผน</HeaderCell>
                  <Cell>
                    {(rowData) => {
                      // Determine the color based on machine prefix
                      let colorScheme;
                      if (rowData.machine_plan.startsWith("HS")) {
                        colorScheme = "blue";
                      } else if (rowData.machine_plan.startsWith("CM")) {
                        colorScheme = "green";
                      } else if (rowData.machine_plan.startsWith("PK")) {
                        colorScheme = "purple";
                      } else if (rowData.machine_plan.startsWith("CT")) {
                        colorScheme = "orange";
                      } else {
                        colorScheme = "gray";
                      }

                      return (
                        <Badge colorScheme="gray" p={2} borderRadius="md">
                          {rowData.machine_plan}
                        </Badge>
                      );
                    }}
                  </Cell>
                </Column>


                <Column
                  width={200}
                  align="center"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>
                    {displayMode === "quantity"
                      ? "ยอดรวมแผน"
                      : displayMode === "pallet"
                      ? "ยอดรวมแผน (PALLET)"
                      : "ยอดรวมแผน (TON)"}
                  </HeaderCell>
                  <Cell>
                    {(rowData) =>
                      displayMode === "quantity"
                        ? rowData.plan
                        : displayMode === "pallet"
                        ? rowData.plan_pallet
                        : rowData.plan_ton
                    }
                  </Cell>
                </Column>

                <Column
                  width={200}
                  align="center"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>
                    {displayMode === "quantity"
                      ? "รวมรับยอด Approve(แผ่น)"
                      : displayMode === "pallet"
                      ? "รวมรับยอด Approve (PALLET)"
                      : "รวมรับยอด Approve (TON)"}
                  </HeaderCell>
                  <Cell>
                    {
                      (rowData) =>
                        displayMode === "quantity"
                          ? rowData.done
                          : displayMode === "pallet"
                          ? rowData.done_pallet
                          : rowData.done_ton // Assuming done_ton is the ton data
                    }
                  </Cell>
                </Column>

                <Column
                  width={200}
                  align="center"
                  fixed="right"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>
                    {displayMode === "quantity"
                      ? "คงเหลือหลัง Approve (แผ่น)"
                      : displayMode === "pallet"
                      ? "คงเหลือหลัง Approve (PALLET)"
                      : "คงเหลือหลัง Approve (TON)"}
                  </HeaderCell>
                  <Cell>
                    {
                      (rowData) =>
                        displayMode === "quantity"
                          ? rowData.remain
                          : displayMode === "pallet"
                          ? rowData.remain_pallet
                          : rowData.remain_ton // Assuming remain_ton is the ton data
                    }
                  </Cell>
                </Column>

                <Column
                  width={250}
                  align="center"
                  fixed="right"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>Date/Shift</HeaderCell>
                  <Cell>
                    {(rowData) => {


                      // Get the color scheme for the shift badge
                      const shiftColor = getShiftColorScheme(rowData.planshift);

                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Text>{rowData.plandate}</Text>
                          <Badge colorScheme={shiftColor}>
                            กะ{rowData.planshift}
                          </Badge>
                        </div>
                      );
                    }}
                  </Cell>
                </Column>

                <Column
                  width={150}
                  align="center"
                  fixed="right"
                  sortable
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>% Done</HeaderCell>
                  <Cell dataKey="per_done">
                    {(rowData) => {
                      const percentage = rowData.plan
                        ? ((rowData.done / rowData.plan) * 100).toFixed(2)
                        : 0;
                      return (
                        <Box>
                          <Text>{`${percentage}%`}</Text>
                          <Progress
                            value={percentage}
                            colorScheme={getProgressColor(percentage)}
                            size="sm"
                            hasStripe
                          />
                        </Box>
                      );
                    }}
                  </Cell>
                </Column>
              </Table>
            ) : (
              <Box
                height={510}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Text textAlign="center" mt={4} fontSize="lg" color="gray.500">
                  No remaining plans found.
                </Text>
              </Box>
            )}
          </Box>

          <Divider />
          <Box mt={3} color={bgColor}>
            <Flex px={2}>
              <Spacer />
              <HStack
                p={4}
                borderRadius={"xl"}
                border="1px"
                borderColor="gray.200"
              >
                <Text size="md" mr={5} color={textColor}>{`Items ${
                  firstRowIndex + 1
                } - ${Math.min(lastRowIndex, filteredPlans.length)} of ${
                  filteredPlans.length
                }`}</Text>
                <IconButton
                  size="sm"
                  icon={<BiChevronLeft />}
                  colorScheme="teal"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  isDisabled={currentPage === 1}
                />
                <HStack spacing={2} justify="center">
                  {renderPageNumbers()}
                </HStack>
                <IconButton
                  size="sm"
                  icon={<BiChevronRight />}
                  colorScheme="teal"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                  }
                  isDisabled={currentPage === pageCount}
                />
              </HStack>
            </Flex>
          </Box>
        </Box>
      </VStack>


    </>
  );
};

export default PlanPef;
