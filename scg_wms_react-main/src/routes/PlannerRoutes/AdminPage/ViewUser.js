import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  StackDivider,
  Box,
  Text,
  Button,
  ButtonGroup,
  Divider,
  
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { FormControl, FormLabel, Input, VStack } from "@chakra-ui/react";
import { Grid as CGrid, GridItem as CGridItem } from "@chakra-ui/react";
import { Wrap, WrapItem } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import { HStack } from "@chakra-ui/react";
import { SimpleGrid } from "@chakra-ui/react";
import { AbsoluteCenter } from "@chakra-ui/react";
import { CloseButton } from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";
import moment from "moment";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from "@chakra-ui/react";

import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

import {
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
} from "@chakra-ui/react";

import { useFormik } from "formik";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import { IconButton } from "@chakra-ui/react";

import { InputRightElement } from "@chakra-ui/react";

import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css"; // or 'rsuite-table/dist/css/rsuite-table.css'
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { SingleDatepicker, RangeDatepicker } from "chakra-dayzed-datepicker";
import {
  AsyncCreatableSelect,
  AsyncSelect,
  CreatableSelect,
  Select as ChakraReactSelect,
} from "chakra-react-select";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

import { BiCog } from "react-icons/bi";
import { BiX } from "react-icons/bi";
import { AiOutlineUserDelete } from "react-icons/ai";

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

  const [TableData, setTableData] = useState([]);
  const [userFilter, setUserFilter] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageCount = Math.ceil(TableData.length / itemsPerPage);
  const firstRowIndex = (currentPage - 1) * itemsPerPage;
  const lastRowIndex = firstRowIndex + itemsPerPage;
  const currentData = TableData.slice(firstRowIndex, lastRowIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < pageCount ? prev + 1 : prev));
  };

  const fetchUserData = () => {
    // เรียก API จาก Backend โดยใช้ axios
    client
      .get("wms/api/getalluser")
      .then((response) => {
        setTableData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching Approve data:", error);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleDeleteUser = async (id) => {
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
        // Post data to the specified URL
        const response = await client.post("wms/api/deleteuser", postData);

        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: response.data.success,
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error posting data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
          showConfirmButton: false,
        });
      }

      fetchUserData();
    }
  };

  function EditPasswordDialog(rowData) {
    console.log("row", rowData);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const id_select = rowData.id;
    return (
      <>
        <IconButton
          size="md"
          icon={<BiCog />}
          colorScheme="teal"
          onClick={onOpen}
        />

        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Update User Information
              </AlertDialogHeader>
              <AlertDialogCloseButton />

              <AlertDialogBody>
                <Formik
                  enableReinitialize
                  initialValues={{
                    id_select: rowData.id,
                    first_name: rowData.first_name,
                    last_name: rowData.last_name,
                    email: rowData.email,
                    new_password: "",
                  }}
                  onSubmit={async (values) => {
                    const result = await Swal.fire({
                      title: "Are you sure?",
                      text: "Please review the information before submission!",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#103911",
                      confirmButtonText: "Submit",
                    });

                    if (!result.isConfirmed) return;

                    try {
                      console.log("values", values);
                      await client.post("wms/api/setpassword", values);
                      Swal.fire({
                        icon: "success",
                        title: "Success",
                        timer: 1000,
                        showConfirmButton: false,
                      });
                      onClose();
                      fetchUserData(); // refresh data after successful submission
                    } catch (error) {
                      console.error("Error posting data:", error);
                      Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: error.message,
                        showConfirmButton: false,
                      });
                    }
                  }}
                  validationSchema={Yup.object({
                    first_name: Yup.string().required("First name is required"),
                    last_name: Yup.string().required("Last name is required"),
                    email: Yup.string()
                      .email("Invalid email format")
                      .required("Email is required"),
                    new_password: Yup.string().required("Password is required"),
                  })}
                  validateOnChange={false}
                  validateOnBlur={false}
                >
                  {(formik) => (
                    <Form>
                      <Text mb={2}>
                        <b>Username:</b> {rowData.username}
                      </Text>

                      <Input
                        mb={3}
                        placeholder="First Name"
                        name="first_name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.first_name}
                        isRequired
                      />

                      <Input
                        mb={3}
                        placeholder="Last Name"
                        name="last_name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.last_name}
                        isRequired
                      />

                      <Input
                        mb={3}
                        placeholder="Email"
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        isRequired
                      />

                      <Input
                        mb={5}
                        placeholder="New Password"
                        name="new_password"
                        type="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.new_password}
                        isRequired
                      />

                      <Center>
                        <Button
                          w={"180px"}
                          bg={"blue.400"}
                          color={"white"}
                          _hover={{ bg: "blue.500" }}
                          type="submit"
                        >
                          Update Information
                        </Button>
                      </Center>
                    </Form>
                  )}
                </Formik>
              </AlertDialogBody>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  }

  useEffect(() => {
    if (userFilter) {
      const filtered = TableData.filter((user) =>
        user.username.toLowerCase().includes(userFilter.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(TableData);
    }
  }, [userFilter, TableData]);

  return (
    <>
      <Box
        p={2}
        mt={5}
        w={"100%"}
        borderRadius={"xl"}
        border="1px"
        borderColor={borderColor}
        bg={bgColor}
      >
        <FormControl style={{ zIndex: 30 }} minW={"250px"} mb="4">
          <ChakraReactSelect
            placeholder="Search user"
            options={TableData.map((user) => ({
              value: user.username,
              label: user.username,
            }))}
            onChange={(selectedUser) => {
              setUserFilter(selectedUser ? selectedUser.value : null);
            }}
            isClearable={true}
            closeMenuOnSelect={true}
          />
        </FormControl>

        <Table height={690} data={filteredData.slice(firstRowIndex, lastRowIndex)} rowHeight={65}  style={{ backgroundColor: bgColor }}>
          <Column verticalAlign="middle" width={60} resizable style={{ backgroundColor: bgColor }}>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column verticalAlign="middle" width={180} resizable align="center"  style={{ backgroundColor: bgColor }}>
            <HeaderCell>วันที่สร้าง User</HeaderCell>
            <Cell>
              {(rowData, rowIndex) => {
                return moment(rowData.date_joined).format(
                  "DD/MM/YYYY HH:mm:ss"
                );
              }}
            </Cell>
          </Column>

          <Column verticalAlign="middle" width={120} resizable align="center"  style={{ backgroundColor: bgColor }}>
            <HeaderCell>Username</HeaderCell>
            <Cell dataKey="username" />
          </Column>

          <Column verticalAlign="middle" width={120} resizable align="center"  style={{ backgroundColor: bgColor }}>
            <HeaderCell>Firstname</HeaderCell>
            <Cell dataKey="first_name" />
          </Column>

          <Column verticalAlign="middle" width={120} resizable align="center"  style={{ backgroundColor: bgColor }}>
            <HeaderCell>Lastname</HeaderCell>
            <Cell dataKey="last_name" />
          </Column>

          <Column verticalAlign="middle" width={120} resizable align="center"  style={{ backgroundColor: bgColor }}>
            <HeaderCell>Employee ID</HeaderCell>
            <Cell dataKey="employee_id" />
          </Column>

          <Column verticalAlign="middle" width={220} resizable align="center" style={{ backgroundColor: bgColor }}>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column
            verticalAlign="middle"
            minWidth={150}
            flexGrow={1}
            resizable
            align="center"
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>Role</HeaderCell>
            <Cell>
              {(rowData, rowIndex) => {
                if (rowData.role_id == 1) {
                  return (
                    <Tag
                      p={2}
                      size={"xs"}
                      colorScheme="purple"
                      variant="solid"
                      rounded={"md"}
                    >
                      <Heading fontSize={"xs"}>Admin</Heading>
                    </Tag>
                  );
                } else if (rowData.role_id == 2) {
                  return (
                    <Tag
                      p={2}
                      size={"xs"}
                      colorScheme="orange"
                      variant="solid"
                      rounded={"md"}
                    >
                      <Heading fontSize={"xs"}>Planner</Heading>
                    </Tag>
                  );
                } else if (rowData.role_id == 3) {
                  return (
                    <Tag
                      p={2}
                      size={"xs"}
                      colorScheme="yellow"
                      variant="solid"
                      rounded={"md"}
                    >
                      <Heading fontSize={"xs"}>Production</Heading>
                    </Tag>
                  );
                } else if (rowData.role_id == 4) {
                  return (
                    <Tag
                      p={2}
                      size={"xs"}
                      colorScheme="teal"
                      variant="solid"
                      rounded={"md"}
                    >
                      <Heading fontSize={"xs"}>PlantCo</Heading>
                    </Tag>
                  );
                } else if (rowData.role_id == 5) {
                  return (
                    <Tag
                      p={2}
                      size={"xs"}

                      variant="solid"
                      rounded={"md"}
                    >
                      <Heading fontSize={"xs"}>LAB</Heading>
                    </Tag>
                  );
                } else if (rowData.role_id == 6) {
                  return (
                    <Tag
                      p={2}
                      size={"xs"}
                      colorScheme="blue"
                      variant="solid"
                      rounded={"md"}
                    >
                      <Heading fontSize={"xs"}>SCM</Heading>
                    </Tag>
                  );
                }
                
              }}
            </Cell>
          </Column>
          <Column
            verticalAlign="middle"
            minWidth={150}
            flexGrow={1}
            resizable
            align="center"
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>Action</HeaderCell>
            <Cell>
              {(rowData, rowIndex) => {
                return (
                  <>
                    {/* <IconButton size='md' icon={<BiCog />} colorScheme='teal' onClick={() => handleSettingsClick(rowData.id)} /> */}
                    {EditPasswordDialog(rowData)}
                    <IconButton
                      ml={2}
                      size="md"
                      icon={<AiOutlineUserDelete />}
                      colorScheme="red"
                      onClick={() => {
                        handleDeleteUser(rowData.id);
                      }}
                    />
                  </>
                );
              }}
            </Cell>
          </Column>
        </Table>
        <Divider />
        <Box mt={3}>
          <Flex px={2}>
            {/* <Heading fontSize='1.4rem' style={{ alignSelf: 'center' }}>Bifröst Datatable</Heading> */}
            <Spacer />
            <HStack
              p={4}
              borderRadius={"xl"}
              border="1px"
              borderColor="gray.200"
            >
              <Text size="md" mr={5}>{`รายการที่ ${
                firstRowIndex + 1
              } - ${Math.min(lastRowIndex, TableData.length)} จาก ${
                TableData.length
              }`}</Text>
              <IconButton
                size="sm"
                icon={<BiChevronLeft />}
                colorScheme="teal"
                onClick={handlePrevPage}
                isDisabled={currentPage === 1}
              />
              <Text size="md">{`หน้าที่ ${currentPage} จาก ${pageCount}`}</Text>
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
    </>
  );
};

export default HomePage;
