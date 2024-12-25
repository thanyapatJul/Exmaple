import React, { useEffect, useState } from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { VStack } from "@chakra-ui/react";
import { BiArrowFromBottom } from "react-icons/bi";
import { BiArrowToBottom } from "react-icons/bi";
import { motion } from "framer-motion";
import { FiDelete } from "react-icons/fi";
import TutorialModal from "./TutorialModal";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Flex,
  Spacer,
  Select,
  useColorModeValue,
  Button,
  IconButton,
  Divider,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik, Formik, Form } from "formik";
import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { Select as ChakraReactSelect } from "chakra-react-select";
import Swal from "sweetalert2";
import Axios from "axios";

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

const fetchZCAData = async (zca, index, setFieldValue) => {
  try {
    const response = await client.get("wms/api/get_zca_data", {
      params: { zca },
    });
    const data = response.data;

    setFieldValue(`process.${index}.name`, data.name);
    setFieldValue(`process.${index}.Machine`, data.machine);
    setFieldValue(`process.${index}.Type`, data.type);
  } catch (error) {
    console.error("Error fetching ZCA data:", error);
  }
};

const fetchModalZCAData = async (zca, index, setFieldValue) => {
  try {
    const response = await client.get("wms/api/get_zca_data", {
      params: { zca },
    });
    const data = response.data;

    setFieldValue(`process.${index}.field_name`, data.name);
    setFieldValue(`process.${index}.field_mc`, data.machine);
    setFieldValue(`process.${index}.field_type`, data.type);
  } catch (error) {
    console.error("Error fetching ZCA data:", error);
  }
};

const HomePage = () => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColorDefault = useColorModeValue("gray.100", "gray.800");
  const bgColor = useColorModeValue("white", "#28303E");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const isDarkMode = localStorage.getItem("chakra-ui-color-mode") === "dark";
  const tableBg = useColorModeValue("white", "gray.700");
  const headerColor = useColorModeValue("gray.700", "gray.300");
  const cellTextColor = useColorModeValue("gray.800", "gray.200");
  const badgeBgColor = useColorModeValue("blue.500", "blue.300");



  const [filteredTableData, setFilteredTableData] = useState([]);
  const [TableData, setTableData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]); // Initialize as an empty array
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [zcaFilter, setZcaFilter] = useState("");
  const [zcaOptions, setZcaOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageCount = Math.ceil(filteredTableData.length / itemsPerPage);
  const firstRowIndex = (currentPage - 1) * itemsPerPage;
  const lastRowIndex = firstRowIndex + itemsPerPage;
  const currentData = filteredTableData.slice(firstRowIndex, lastRowIndex);
  const [swappingIndex, setSwappingIndex] = useState(null);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };
  const swapAnimationVariants = {
    initial: { opacity: 1, scale: 1, y: 0 },
    hover: { scale: 1.02 },
    swap: { scale: 1.1, backgroundColor: "#e2e8f0" },
    exit: { opacity: 0.5, scale: 1, y: 10 },
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < pageCount ? prev + 1 : prev));
  };

  const fetchProcessLockData = () => {
    client
      .get("wms/api/get_editprocesslock")
      .then((response) => {
        const sortedData = response.data.data.sort(
          (a, b) => a.field_id - b.field_id
        );
        setTableData(sortedData);
        setFilteredTableData(sortedData);

        let zcaArray = sortedData.map((item) => ({
          value: item.field_zca,
          label: `${item.field_zca} ${item.field_name}`,
        }));
        setZcaOptions(zcaArray);
      })
      .catch((error) => {
        console.error("Error fetching Approve data:", error);
      });
  };

  useEffect(() => {
    fetchProcessLockData();
  }, []);

  const applyFilters = (tableData) => {
    let filteredData = tableData || TableData;

    // If a ZCA filter is selected
    if (zcaFilter && Object.keys(zcaFilter).length > 0) {
      // Find all planids associated with the selected ZCA
      const matchingPlanIds = filteredData
        .filter((item) => item.field_zca === zcaFilter.value)
        .map((item) => item.planid);

      // If there are matching planids, filter the data to show all rows with those planids
      if (matchingPlanIds.length > 0) {
        filteredData = filteredData.filter((item) =>
          matchingPlanIds.includes(item.planid)
        );
      }
    }

    // Sort the filtered data by planid and then by order
    filteredData.sort((a, b) => {
      if (a.planid !== b.planid) {
        return a.planid - b.planid; // Sort by planid first
      }
      return a.order - b.order; // Then sort by order
    });

    return filteredData;
  };

  useEffect(() => {
    setFilteredTableData(applyFilters(TableData));
  }, [TableData, zcaFilter]);

  const handleDeleteRow = async (id) => {
    const postData = {
      id_select: id,
    };

    const confirmationResult = await Swal.fire({
      title: "แน่ใจหรือไม่ ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ตกลง",
    });

    if (confirmationResult.isConfirmed) {
      try {
        Swal.fire({
          title: "กำลังอัพเดตเข้าฐานข้อมูล!",
          html: "โปรดรอ......",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        await client.post("wms/api/post_deleteprocesslock", postData);
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          timer: 1000,
          showConfirmButton: false,
        });

        fetchProcessLockData();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || error,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleToggleDisable = async (id, currentStatus) => {
    const postData = {
      id_select: id,
      disable: !currentStatus,
    };

    try {
      await client.post("wms/api/toggle_disable", postData);

      // Update the TableData state with the toggled disable status
      setTableData((prevTableData) => {
        const updatedTableData = prevTableData.map((item) =>
          item.field_id === id ? { ...item, disable: !currentStatus } : item
        );
        // Apply the current filter after updating the state
        const filteredData = applyFilters(updatedTableData);
        setFilteredTableData(filteredData);
        return updatedTableData;
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || error,
        showConfirmButton: false,
      });
    }
  };

  const sourceDestinationOptions = [
    { value: "NULL", label: "-" },
    { value: "*", label: "*" },
    { value: "1", label: "1" },
    { value: "1*", label: "1*" },
  ];
  const handleEditRow = (rowData) => {
    const filteredData = TableData.filter(
      (item) => item.planid === rowData.planid
    ).sort((a, b) => a.order - b.order);
    setSelectedRowData(filteredData);
    onEditOpen();
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    // Add first page
    pageNumbers.push(
      <Button
        key={1}
        size="xs"
        onClick={() => handlePageClick(1)}
        colorScheme={currentPage === 1 ? "teal" : "gray"}
      >
        1
      </Button>
    );

    // Add ellipsis if currentPage is greater than 4
    if (currentPage > 4) {
      pageNumbers.push(<Text key="start-ellipsis">...</Text>);
    }

    // Add pages around the current page
    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(pageCount - 1, currentPage + 2);
      i++
    ) {
      pageNumbers.push(
        <Button
          key={i}
          size="xs"
          onClick={() => handlePageClick(i)}
          colorScheme={currentPage === i ? "teal" : "gray"}
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis if currentPage is not close to the last page
    if (currentPage < pageCount - 3) {
      pageNumbers.push(<Text key="end-ellipsis">...</Text>);
    }

    // Add last page
    pageNumbers.push(
      <Button
        key={pageCount}
        size="xs"
        onClick={() => handlePageClick(pageCount)}
        colorScheme={currentPage === pageCount ? "teal" : "gray"}
      >
        {pageCount}
      </Button>
    );

    return pageNumbers;
  };

  return (
    <>
      <Box pb={4}bg={bgColor}>
        <Formik
          enableReinitialize
          initialValues={{
            planID: "",
            process: [
              {
                zca: "",
                Machine: "",
                Type: "",
                name: "",
                source: "1",
                destination: "",
              },
            ],
          }}
          onSubmit={async (values, { resetForm }) => {
            const payload = values.process.map((item, index) => ({
              planID: values.planID,
              zca: item.zca,
              name: item.name,
              source: item.source,
              destination: item.destination,
              Type: item.Type,
              Machine: item.Machine,
              order: index + 1, // Auto-increment order, starting from 1
            }));

            const result = await Swal.fire({
              title: "แน่ใจแล้วใช่ไหม ?",
              text: "กรุณาตรวจสอบข้อมูลก่อน!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#103911",
              confirmButtonText: "Submit",
              closeOnConfirm: false,
            });
            if (!result.isConfirmed) {
              return;
            }
            try {
              const response = await client.post(
                "wms/api/post_editprocesslock",
                {
                  process: payload,
                }
              );
              if (response.data.success === false) {
                Swal.fire({
                  icon: "error",
                  title: "ผิดพลาด",
                  text: response.data.message,
                  timer: 1000,
                  showConfirmButton: false,
                });
                return;
              }

              resetForm({
                values: {
                  planID: "",
                  process: [
                    {
                      zca: "",
                      Machine: "",
                      Type: "",
                      name: "",
                      source: "",
                      destination: "",
                    },
                  ],
                },
              });
              Swal.fire({
                icon: "success",
                title: "สำเร็จ",
                timer: 1000,
                showConfirmButton: false,
              });
            } catch (error) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.message || error,
                timer: 1000,
                showConfirmButton: false,
              });
            }
            fetchProcessLockData();
          }}
        >
          {(formik) => (
            <Form>
              <Box rounded={"lg"} bg={bgColor} p={8}>
                <HStack>
                  <Heading mb={4} fontSize={"xl"}>
                    เพิ่ม ProcessLock
                  </Heading>
                  <TutorialModal title="วิธีการเพิ่ม Process" />
                </HStack>

                {formik.values.process.map((item, index) => (
                  <HStack spacing={4} key={index} mb={3} alignItems="flex-end">
                    <FormControl isRequired>
                      <FormLabel>ZCA</FormLabel>
                      <Input
                        name={`process.${index}.zca`}
                        type="text"
                        bgColor={bgColor}
                        onChange={async (e) => {
                          const { value } = e.target;
                          formik.handleChange(e);

                          try {
                            const response = await client.get(
                              "wms/api/check_zca_existence",
                              {
                                params: { zca: value },
                              }
                            );

                            if (response.data.exists) {
                              formik.setFieldValue(`process.${0}.source`, "1*");

                              Swal.fire({
                                icon: "info",
                                title: "ZCA Exists",
                                text: `${value} อยู่ใน Process อื่นแล้ว Source = '1*'.`,
                              });
                            }
                          } catch (error) {
                            console.error(
                              "Error checking ZCA existence:",
                              error
                            );
                          }

                          if (
                            value.startsWith("ZCA") &&
                            !value.startsWith("ZCAW")
                          ) {
                            formik.setFieldValue(
                              `process.${index}.destination`,
                              "*"
                            );
                          }

                          fetchZCAData(value, index, formik.setFieldValue);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.process[index].zca}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Machine</FormLabel>
                      <Select
                        name={`process.${index}.Machine`}
                        bgColor={bgColor}
                        onChange={(e) => {
                          formik.setFieldValue(
                            `process.${index}.Machine`,
                            e.target.value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.process[index].Machine}
                        // maxH={100}{}
                      >
                        <option value="" disabled>
                          Select a Machine
                        </option>
                        <option value="HS">HS</option>
                        {/* <option value="HS4">HS4</option>
                        <option value="HS5">HS5</option>
                        <option value="HS6">HS6</option>
                        <option value="HS7">HS7</option>
                        <option value="HS8">HS8</option>
                        <option value="HS9">HS9</option> */}
                        <option value="CT">CT</option>
                        {/* <option value="CT2">CT2</option>
                        <option value="CT3">CT3</option>
                        <option value="CT4">CT4</option> */}
                        <option value="XY1">XY1</option>
                        <option value="CM">CM</option>
                        {/* <option value="CM6">CM6</option>
                        <option value="CM7">CM7</option>
                        <option value="CM8">CM8</option> */}
                        <option value="AS1">AS1</option>
                        <option value="PK">PK</option>
                        {/* <option value="PK2">PK2</option>
                        <option value="PK3">PK3</option> */}
                        {/* <option value="PK4">PK4</option>
                        <option value="PK5">PK5</option>
                        <option value="PK6">PK6</option> */}
                        <option value="DET">DET</option>
                        <option value="MS1">MS1</option>
                        <option value="OC">OC</option>
                        {/* <option value="OC2">OC2</option> */}
                        <option value="DP">DP</option>
                        {/* <option value="DP2">DP2</option> */}
                        <option value="OS1">OS1</option>
                        <option value="PL1">PL1</option>
                        <option value="RT">RT</option>
                        {/* <option value="RT2">RT2</option> */}
                        <option value="SD1">SD1</option>
                        <option value="SEG">SEG</option>
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Type</FormLabel>
                      <Select
                        name={`process.${index}.Type`}
                        bgColor={bgColor}
                        onChange={(e) => {
                          formik.setFieldValue(
                            `process.${index}.Type`,
                            e.target.value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.process[index].Type}
                      >
                        <option value="" disabled>
                          Select a Type
                        </option>
                        <option value="Board">Board</option>
                        <option value="Wood">Wood</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>ชื่อ</FormLabel>
                      <Input
                        name={`process.${index}.name`}
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.process[index].name}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Source</FormLabel>
                      <Select
                        name={`process.${index}.source`}
                        bgColor={
                          formik.values.process[index].destination === "*" // Green if destination is *
                            ? "green.200"
                            : formik.values.process[index].source === "1" ||
                              formik.values.process[index].source === "1*" // Blue if source is 1 or 1*
                            ? "blue.200"
                            : formik.values.process[index].source === "" &&
                              formik.values.process[index].destination === "" // Yellow if both source and destination are empty
                            ? "yellow.200"
                            : "white" // Default color if none of the conditions match
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value === "NULL" ? null : e.target.value;
                          formik.setFieldValue(
                            `process.${index}.source`,
                            value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        value={
                          formik.values.process[index].source ||
                          (index === 0 ? "1" : "NULL")
                        }
                      >
                        <option value="NULL">-</option>
                        <option value="*">*</option>
                        <option value="1">1</option>
                        <option value="1*">1*</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Destination</FormLabel>
                      <Select
                        name={`process.${index}.destination`}
                        bgColor={
                          formik.values.process[index].destination === "*" // Green if destination is *
                            ? "green.200"
                            : formik.values.process[index].source === "1" ||
                              formik.values.process[index].source === "1*" // Blue if source is 1 or 1*
                            ? "blue.200"
                            : formik.values.process[index].source === "" &&
                              formik.values.process[index].destination === "" // Yellow if both source and destination are empty
                            ? "yellow.200"
                            : "white" // Default color if none of the conditions match
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value === "NULL" ? null : e.target.value;
                          formik.setFieldValue(
                            `process.${index}.destination`,
                            value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        value={
                          formik.values.process[index].destination || "NULL"
                        }
                      >
                        <option value="NULL">-</option>
                        <option value="*">*</option>
                      </Select>
                    </FormControl>

                    <Button
                      colorScheme="red"
                      onClick={() => {
                        const newProcess = [...formik.values.process];
                        newProcess.splice(index, 1);
                        formik.setFieldValue("process", newProcess);
                      }}
                    >
                      X
                    </Button>
                  </HStack>
                ))}
                <Flex>
                  <Button
                    me={5}
                    px={10}
                    size="lg"
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
                    }}
                    type="submit"
                  >
                    เพิ่ม Process
                  </Button>

                  <Button
                    px={10}
                    size="lg"
                    colorScheme="teal"
                    onClick={() => {
                      const newProcess = [
                        ...formik.values.process,
                        {
                          planID: formik.values.planID,
                          zca: "",
                          Machine: "",
                          Type: "",
                          name: "",
                          source: "",
                          destination: "",
                        },
                      ];
                      formik.setFieldValue("process", newProcess);
                    }}
                  >
                    +
                  </Button>
                </Flex>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
      <Box
        p={2}
        w={"100%"}
        borderRadius={"xl"}
        border="1px"
        borderColor="gray.200"
      >
        <FormControl style={{ zIndex: 50 }} minW={"250px"} mb="4">
          <FormLabel fontWeight={900}>Search ZCA No.</FormLabel>
          <ChakraReactSelect
            placeholder="type here..."
            options={zcaOptions}
            onChange={setZcaFilter}
            isClearable={true}
            value={zcaOptions.find((option) => option.value === zcaFilter)}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({
                ...base,
                minHeight: "400px", // your desired height
              }),
              option: (base) => ({
                ...base,
                padding: "5px", // your desired height
              }),
            }}
          />
        </FormControl>

        <Flex justify="center">
          <Box width="100%">
            <Table height={690} data={currentData} rowHeight={65}>
              <Column verticalAlign="middle" width={100} resizable fixed="left"  style={{ backgroundColor: bgColor }}>
                <HeaderCell>planID</HeaderCell>
                <Cell dataKey="planid" />
              </Column>
              <Column verticalAlign="middle" width={50} resizable fixed="left"  style={{ backgroundColor: bgColor }}>
                <HeaderCell>ID</HeaderCell>
                <Cell dataKey="field_id" />
              </Column>
              <Column
                verticalAlign="middle"
                width={150}
                resizable
                align="center"
                fullText
                fixed="left"
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>ZCA</HeaderCell>
                <Cell dataKey="field_zca" />
              </Column>
              <Column
                verticalAlign="middle"
                width={180}
                resizable
                align="center"
                fullText
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>เครื่องจักร</HeaderCell>
                <Cell dataKey="field_mc" />
              </Column>
              <Column
                verticalAlign="middle"
                width={70}
                resizable
                align="center"
                fullText
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Type No.</HeaderCell>
                <Cell dataKey="field_typeno" />
              </Column>
              <Column
                verticalAlign="middle"
                width={100}
                resizable
                align="center"
                fullText
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Type</HeaderCell>
                <Cell dataKey="field_type" />
              </Column>
              <Column
                verticalAlign="middle"
                width={350}
                resizable
                align="center"
                fullText
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>ชื่อ</HeaderCell>
                <Cell dataKey="field_name" />
              </Column>
              <Column
                verticalAlign="middle"
                width={200}
                resizable
                align="center"
                fullText
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Source</HeaderCell>
                <Cell dataKey="field_source" />
              </Column>
              <Column
                verticalAlign="middle"
                width={200}
                resizable
                align="center"
                fullText
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Destination</HeaderCell>
                <Cell dataKey="field_destination" />
              </Column>
              <Column
                verticalAlign="middle"
                width={100}
                resizable
                align="center"
                fixed="right"
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Action</HeaderCell>
                <Cell>
                  {(rowData, rowIndex) => (
                    <IconButton
                      ml={2}
                      size="md"
                      icon={<AiOutlineDelete />}
                      colorScheme="red"
                      onClick={() => {
                        handleDeleteRow(rowData.field_id);
                      }}
                    />
                  )}
                </Cell>
              </Column>
              <Column
                verticalAlign="middle"
                width={100}
                resizable
                align="center"
                fixed="right"
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Edit</HeaderCell>
                <Cell>
                  {(rowData, rowIndex) => (
                    <IconButton
                      ml={2}
                      size="md"
                      icon={<FiEdit />}
                      colorScheme="blue"
                      onClick={() => {
                        handleEditRow(rowData);
                      }}
                    />
                  )}
                </Cell>
              </Column>
              <Column
                verticalAlign="middle"
                width={180}
                resizable
                align="center"
                fixed="right"
                style={{ backgroundColor: bgColor }}
              >
                <HeaderCell>Disable</HeaderCell>
                <Cell>
                  {(rowData, rowIndex) => (
                    <Button
                      size="sm"
                      colorScheme={rowData.disable ? "red" : "green"}
                      onClick={() =>
                        handleToggleDisable(rowData.field_id, rowData.disable)
                      }
                    >
                      {rowData.disable ? "Disabled" : "Enabled"}
                    </Button>
                  )}
                </Cell>
              </Column>
            </Table>
          </Box>
        </Flex>
        <Divider />

        <Box mt={3}>
          <Flex px={2}>
            <Spacer />
            <HStack
              p={4}
              borderRadius={"xl"}
              border="1px"
              borderColor="gray.200"
            >
              <Text size="md" mr={5}>{`Items ${firstRowIndex + 1} - ${Math.min(
                lastRowIndex,
                filteredTableData.length
              )} of ${filteredTableData.length}`}</Text>
              <IconButton
                size="sm"
                icon={<BiChevronLeft />}
                colorScheme="teal"
                onClick={handlePrevPage}
                isDisabled={currentPage === 1}
              />
              <HStack spacing={2} justify="center">
                {renderPageNumbers()}
              </HStack>
              <IconButton
                size="sm"
                icon={<BiChevronRight />}
                colorScheme="teal"
                onClick={handleNextPage}
                isDisabled={currentPage === pageCount}
              />
            </HStack>
          </Flex>

        </Box>
      </Box>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="70%">
          <ModalHeader>Edit Rows</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              enableReinitialize
              initialValues={{ process: selectedRowData }}
              onSubmit={async (values) => {
                const processWithOrder = values.process.map((item, index) => ({
                  ...item,
                  order: index + 1,
                }));

                try {
                  await client.post("wms/api/update_rows", {
                    process: processWithOrder,
                  });
                  Swal.fire({
                    icon: "success",
                    title: "Update successful",
                    timer: 1000,
                    showConfirmButton: false,
                  });
                  fetchProcessLockData();
                  onEditClose();
                } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.message || error,
                    showConfirmButton: false,
                  });
                }
              }}
            >
              {(formik) => {
                const handleDeleteRowModal = async (id) => {
                  const confirmationResult = await Swal.fire({
                    title: "แน่ใจหรือไม่?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "ตกลง",
                  });

                  if (confirmationResult.isConfirmed) {
                    try {
                      Swal.fire({
                        title: "กำลังอัพเดตเข้าฐานข้อมูล!",
                        html: "โปรดรอ......",
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        },
                      });

                      // Send the delete request to the backend
                      await client.post("wms/api/post_deleteprocesslock", {
                        id_select: id,
                      });

                      // Update the formik state and selectedRowData to remove the deleted item
                      const updatedProcess = formik.values.process.filter(
                        (item) => item.field_id !== id
                      );

                      formik.setFieldValue("process", updatedProcess);
                      setSelectedRowData(updatedProcess);

                      Swal.fire({
                        icon: "success",
                        title: "สำเร็จ",
                        timer: 1000,
                        showConfirmButton: false,
                      });

                      // Refresh the main table data
                      fetchProcessLockData();
                    } catch (error) {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: error.message || error,
                        showConfirmButton: false,
                      });
                    }
                  }
                };

                const handleDeletePlan = async (selectedRowData) => {
                  const planid = selectedRowData[0].planid; // Assuming all rows share the same planid

                  const confirmationResult = await Swal.fire({
                    title: "แน่ใจหรือไม่ที่จะลบแผนนี้ออก?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "ตกลง",
                  });

                  if (confirmationResult.isConfirmed) {
                    try {
                      Swal.fire({
                        title: "กำลังอัพเดตเข้าฐานข้อมูล!",
                        html: "โปรดรอ......",
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        },
                      });

                      // Send the delete request to the backend
                      await client.post("wms/api/post_deleteplan", {
                        planid: planid,
                      });

                      Swal.fire({
                        icon: "success",
                        title: "สำเร็จ",
                        timer: 1000,
                        showConfirmButton: false,
                      });

                      // Refresh the main table data
                      fetchProcessLockData();
                      onEditClose();
                    } catch (error) {
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: error.message || error,
                        showConfirmButton: false,
                      });
                    }
                  }
                };

                return (
                  <Form>
                    <Box rounded={"lg"} bg={bgColor} p={8}>
                      {formik.values.process.map((item, index) => (
                        <motion.div
                          key={index}
                          variants={swapAnimationVariants}
                          initial="initial"
                          animate={swappingIndex === index ? "swap" : "initial"}
                          whileHover="hover"
                          layout
                          transition={{ duration: 0.3 }}
                        >
                          <HStack spacing={4} mb={3} alignItems="flex-end">
                            <VStack>
                              <IconButton
                                icon={<FiArrowUp boxSize="14px" />}
                                onClick={() => {
                                  const newProcess = [...formik.values.process];
                                  if (index > 0) {
                                    const temp = newProcess[index - 1];
                                    newProcess[index - 1] = newProcess[index];
                                    newProcess[index] = temp;
                                    setSwappingIndex(index - 1);
                                    formik.setFieldValue("process", newProcess);
                                    setTimeout(
                                      () => setSwappingIndex(null),
                                      300
                                    );
                                  }
                                }}
                                size="12px"
                              />
                              <IconButton
                                icon={<FiArrowDown boxSize="14px" />}
                                onClick={() => {
                                  const newProcess = [...formik.values.process];
                                  if (index < newProcess.length - 1) {
                                    const temp = newProcess[index + 1];
                                    newProcess[index + 1] = newProcess[index];
                                    newProcess[index] = temp;
                                    setSwappingIndex(index + 1);
                                    formik.setFieldValue("process", newProcess);
                                    setTimeout(
                                      () => setSwappingIndex(null),
                                      300
                                    );
                                  }
                                }}
                                size="12px"
                              />
                            </VStack>

                            {/* Order Input */}
                            <FormControl flex="0.2">
                              <FormLabel>Order</FormLabel>
                              <Input
                                name={`process.${index}.order`}
                                type="number"
                                bgColor={bgColor}
                                value={index + 1} // Displaying order as index + 1
                                readOnly
                                fontSize="sm"
                              />
                            </FormControl>

                            {/* ZCA Field */}
                            <FormControl isRequired flex="1.5">
                              <FormLabel>ZCA</FormLabel>
                              <Input
                                name={`process.${index}.field_zca`}
                                type="text"
                                bgColor={bgColor}
                                onChange={async (e) => {
                                  formik.handleChange(e);
                                  await fetchModalZCAData(
                                    e.target.value,
                                    index,
                                    formik.setFieldValue
                                  );
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.process[index].field_zca}
                                fontSize="sm"
                              />
                            </FormControl>

                            {/* Machine Field */}
                            <FormControl flex="0.5">
                              <FormLabel>Machine</FormLabel>
                              <Input
                                name={`process.${index}.field_mc`}
                                type="text"
                                bgColor={bgColor}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.process[index].field_mc}
                                fontSize="sm"
                              />
                            </FormControl>

                            {/* Type Field */}
                            <FormControl flex="0.5">
                              <FormLabel>Type</FormLabel>
                              <Input
                                name={`process.${index}.field_type`}
                                type="text"
                                bgColor={bgColor}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.process[index].field_type}
                                fontSize="sm"
                              />
                            </FormControl>

                            {/* Name Field */}
                            <FormControl flex="2">
                              <FormLabel>Name</FormLabel>
                              <Input
                                name={`process.${index}.field_name`}
                                type="text"
                                bgColor={bgColor}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.process[index].field_name}
                                fontSize="sm"
                              />
                            </FormControl>

                            {/* Source Field */}
                            <FormControl flex="0.5">
                              <FormLabel>Source</FormLabel>
                              <Select
                                name={`process.${index}.field_source`}
                                bgColor={
                                  formik.values.process[index]
                                    .field_destination === "*" // Green if destination is *
                                    ? "green.200"
                                    : formik.values.process[index]
                                        .field_source === "1" ||
                                      formik.values.process[index]
                                        .field_source === "1*" // Blue if source is 1 or 1*
                                    ? "blue.200"
                                    : formik.values.process[index]
                                        .field_source === "" &&
                                      formik.values.process[index]
                                        .field_destination === "" // Yellow if both source and destination are empty strings
                                    ? "yellow.200"
                                    : "white" // Default color if none of the conditions match
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={
                                  formik.values.process[index].field_source ||
                                  "NULL"
                                }
                              >
                                {sourceDestinationOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Destination Field */}
                            <FormControl flex="0.5">
                              <FormLabel>Destination</FormLabel>
                              <Select
                                name={`process.${index}.field_destination`}
                                bgColor={
                                  formik.values.process[index]
                                    .field_destination === "*" // Green if destination is *
                                    ? "green.200"
                                    : formik.values.process[index]
                                        .field_source === "1" ||
                                      formik.values.process[index]
                                        .field_source === "1*" // Blue if source is 1 or 1*
                                    ? "blue.200"
                                    : formik.values.process[index]
                                        .field_source === "" &&
                                      formik.values.process[index]
                                        .field_destination === "" // Yellow if both source and destination are empty strings
                                    ? "yellow.200"
                                    : "white" // Default color if none of the conditions match
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={
                                  formik.values.process[index]
                                    .field_destination || "NULL"
                                }
                              >
                                {sourceDestinationOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Disable Button */}
                            <Button
                              size="sm"
                              colorScheme={item.disable ? "red" : "green"}
                              onClick={() =>
                                formik.setFieldValue(
                                  `process.${index}.disable`,
                                  !item.disable
                                )
                              }
                            >
                              {item.disable ? "✗" : "✓"}
                            </Button>

                            <VStack>
                              <IconButton
                                icon={<BiArrowFromBottom boxSize="14px" />}
                                onClick={() => {
                                  const existingPlanId =
                                    formik.values.process.find(
                                      (p) => p.planid
                                    )?.planid;

                                  const planid = existingPlanId || 1;

                                  const newProcess = [...formik.values.process];
                                  newProcess.splice(index, 0, {
                                    field_zca: "",
                                    field_mc: "",
                                    field_type: "",
                                    field_name: "",
                                    field_source: "",
                                    field_destination: "",
                                    disable: false,
                                    planid: planid,
                                  });
                                  formik.setFieldValue("process", newProcess);
                                }}
                                size="14px"
                              />
                              <IconButton
                                icon={<BiArrowToBottom boxSize="14px" />} // Reduced icon size
                                onClick={() => {
                                  const existingPlanId =
                                    formik.values.process.find(
                                      (p) => p.planid
                                    )?.planid;

                                  const planid = existingPlanId || 1;

                                  const newProcess = [...formik.values.process];
                                  newProcess.splice(index + 1, 0, {
                                    field_zca: "",
                                    field_mc: "",
                                    field_type: "",
                                    field_name: "",
                                    field_source: "",
                                    field_destination: "",
                                    disable: false,
                                    planid: planid,
                                  });
                                  formik.setFieldValue("process", newProcess);
                                }}
                                size="14px"
                              />
                            </VStack>

                            {/* Delete Row Button */}
                            <IconButton
                              icon={<FiDelete />}
                              colorScheme="red"
                              onClick={() =>
                                handleDeleteRowModal(item.field_id)
                              }
                            />
                          </HStack>
                        </motion.div>
                      ))}

                      <Box
                        mt={12}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Button colorScheme="blue" type="submit">
                          Save
                        </Button>
                        <HStack>
                          <Text>DeletePlan</Text>
                          <IconButton
                            icon={<AiOutlineDelete />}
                            colorScheme="red"
                            onClick={() =>
                              handleDeletePlan(formik.values.process)
                            }
                          />
                        </HStack>
                      </Box>
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HomePage;
