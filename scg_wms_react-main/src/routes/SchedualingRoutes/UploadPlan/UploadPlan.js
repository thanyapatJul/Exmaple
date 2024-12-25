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
  useColorModeValue,
  CardHeader,
  Heading,
  Progress,
} from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
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

const UploadPlan = () => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColorDefault = useColorModeValue("gray.100", "gray.800");
  const bgColor = useColorModeValue("white", "#28303E");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const tableBg = useColorModeValue("white", "gray.700");
  const headerColor = useColorModeValue("gray.700", "gray.300");
  const cellTextColor = useColorModeValue("gray.800", "gray.200");
  const badgeBgColor = useColorModeValue("blue.500", "blue.300");

  const [file, setFile] = useState(null);
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

  const userRole = localStorage.getItem("role_id");

  const [totalPlans, setTotalPlans] = useState(0);
  const [donePlans, setDonePlans] = useState(0);
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
  const [weekVersions, setWeekVersions] = useState([]);

  const toast = useToast();

  // State for modal


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      let fileName = selectedFile.name.trim();
      fileName = fileName.replace(/\s+\.xlsb$/, ".xlsb");
      const rPattern = /-R\d{2}\.xlsb$/i;

      if (!rPattern.test(fileName)) {
        Swal.fire({
          title: "Invalid file name format",
          text: "ชื่อไฟล์ต้องระบุ Version ตัวอย่าง FQ-GG-DS-001-TL-W38-R02",
          icon: "error",
          confirmButtonText: "OK",
        });
        e.target.value = ""; // Clear the file input to prevent upload
        return;
      }

      // Proceed if the file name is valid
      setFile(selectedFile);
      console.log("File selected:", fileName);
    }
  };

  const handleImportClick = async () => {
    if (!file) {
      Swal.fire({
        title: "No file selected.",
        text: "Please select a file to upload.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    // Show SweetAlert confirmation
    const result = await Swal.fire({
      title: "Confirm Upload",
      text: "Do you want to upload this Excel file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, upload it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      // If confirmed, upload the file
      ImportExcel();
    }
  };

  const ImportExcel = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const first_name = localStorage.getItem("first_name");
    const last_name = localStorage.getItem("last_name");
    const full_name = `${first_name} ${last_name}`;

    formData.append("full_name", full_name);
    Swal.fire({
      title: "Uploading...",
      text: "Please wait while the file is being uploaded.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await client.post("wms/api/upload_plan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Upload Successful",
        text: `${response.data.message} `,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Upload Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong during file upload.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchPlan = async (startDate, endDate) => {
    try {
      const response = await client.get("wms/api/get_plans", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      if (response.data && response.data.plans) {
        console.log("response", response.data);
        setRemainPlans(response.data.plans);

        setFilteredPlans(response.data.plans);
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

  const fetchWeekVersions = async (startDate, endDate) => {
    try {
      const response = await client.get("wms/api/get_version", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      if (response.data && response.data.week_versions) {
        setWeekVersions(Object.entries(response.data.week_versions));
        console.log("weekVersions");
      }
    } catch (error) {
      console.error("Error fetching week versions", error);
      toast({
        title: "Error fetching week versions.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDateChange = (selectedDates) => {
    setDateRange(selectedDates);
    const [start, end] = selectedDates;
    if (start && end) {
      fetchPlan(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      fetchweeks(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );

      fetchWeekVersions(
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
        selectedMachines.includes(item.machine)
      );
    }

    setFilteredPlans(filteredData);
    setCurrentPage(1);
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
      {(userRole === "4" || userRole === "1") && (
        <HStack spacing={4} my={6}>
          <Input
            bgColor={bgColor}
            type="file"
            accept=".xlsx, .xls ,.xlsb"
            onChange={handleFileChange}
          />
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="teal"
            onClick={handleImportClick}
          >
            Upload excel
          </Button>
        </HStack>
      )}

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

        {weekVersions.map(([weekNo, version], index) => (
          <Box
            key={index}
            border="1px"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
          >
            <Text>Week: {weekNo}</Text>
            <Text>Version: {version}</Text>
          </Box>
        ))}
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
            <ButtonGroup isAttached variant="outline" size="md" mb="4">
              <Button
                onClick={() => setDisplayMode("quantity")}
                colorScheme={displayMode === "quantity" ? "teal" : "gray"}
              >
                Quantity
              </Button>
              <Button
                onClick={() => setDisplayMode("pallet")}
                colorScheme={displayMode === "pallet" ? "teal" : "gray"}
              >
                Pallets
              </Button>
              <Button
                onClick={() => setDisplayMode("ton")}
                colorScheme={displayMode === "ton" ? "teal" : "gray"}
              >
                Ton
              </Button>
            </ButtonGroup>
            <FormControl style={{ zIndex: 3 }} minW={"250px"} mb="4">
              <ChakraReactSelect
                placeholder="Search ZCA No..."
                options={filteredPlans.map((plan) => ({
                  value: plan.materialcode,
                  label: `${plan.materialcode} ${plan.materialname}`,
                }))}
                onChange={setZcaFilter}
                isClearable={true}
                closeMenuOnSelect={false}
              />
            </FormControl>
            <FormControl style={{ zIndex: 3 }} minW={"250px"} mb="4">
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
                  width={200}
                  align="center"
                  resizable
                  fixed
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>ZCA</HeaderCell>
                  <Cell dataKey="materialcode" />
                </Column>

                <Column
                  width={350}
                  align="center"
                  resizable
                  fixed
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell >ชื่อ (ไทย)</HeaderCell>
                  <Cell dataKey="materialname" />
                </Column>

                <Column
                  width={100}
                  align="center"
                  resizable
                  fixed
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>เครื่องจักร</HeaderCell>
                  <Cell>
                    {(rowData) => {
                      // Determine the color based on machine prefix
                      let colorScheme;
                      if (rowData.machine.startsWith("HS")) {
                        colorScheme = "blue";
                      } else if (rowData.machine.startsWith("CM")) {
                        colorScheme = "green";
                      } else if (rowData.machine.startsWith("PK")) {
                        colorScheme = "purple";
                      } else if (rowData.machine.startsWith("CT")) {
                        colorScheme = "orange";
                      } else {
                        colorScheme = "gray";
                      }

                      return (
                        <Badge
                          colorScheme={colorScheme}
                          p={2}
                          borderRadius="md"
                        >
                          {rowData.machine}
                        </Badge>
                      );
                    }}
                  </Cell>
                </Column>

                <Column
                  width={300}
                  align="center"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>Date-Shift</HeaderCell>
                  <Cell>
                    {(rowData) => {
                      const startTime = new Date(rowData.starttime); // Convert starttime to a Date object
                      const formattedDate =
                        startTime.toLocaleDateString("en-GB"); // Format to dd/mm/yyyy
                      const shift = rowData.shift;
                      const shiftColor = getShiftColorScheme(shift);

                      return (
                        <HStack justifyContent="center">
                          <Text>{formattedDate}</Text>
                          <Badge
                            colorScheme={shiftColor}
                            p={1}
                            borderRadius="md"
                          >
                            กะ {shift}
                          </Badge>
                        </HStack>
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
                  <HeaderCell>เวลาเดินเครื่อง (นาที)</HeaderCell>
                  <Cell dataKey="duration" />
                </Column>

                <Column
                  width={200}
                  align="center"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>เวลาsetup (นาที)</HeaderCell>
                  <Cell dataKey="setupduration" />
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
                      ? "จำนวน"
                      : displayMode === "pallet"
                      ? "จำนวน (PALLET)"
                      : "จำนวน (TON)"}
                  </HeaderCell>
                  <Cell>
                    {(rowData) =>
                      displayMode === "quantity"
                        ? rowData.plancount
                        : displayMode === "pallet"
                        ? rowData.planpallet
                        : rowData.planweight
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
                  <HeaderCell>Version</HeaderCell>
                  <Cell dataKey="versionno" />
                </Column>

                <Column
                  width={150}
                  align="center"
                  fixed="right"
                  resizable
                  fullText
                  style={{ backgroundColor: bgColor }}
                >
                  <HeaderCell>Created by</HeaderCell>
                  <Cell dataKey="created_by" />
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
                  No plans found.
                </Text>
              </Box>
            )}
          </Box>

          <Divider />
          <Box mt={3}>
            <Flex px={2}>
              <Spacer />
              <HStack
                p={4}
                borderRadius={"xl"}
                border="1px"
                borderColor={borderColor}
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

export default UploadPlan;
