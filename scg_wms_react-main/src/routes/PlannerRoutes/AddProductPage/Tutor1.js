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
} from "@chakra-ui/react";
import { FaCreditCard } from "react-icons/fa";
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
import { FiEdit } from "react-icons/fi";
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
  FormErrorMessage,
} from "@chakra-ui/react";

import { useFormik } from "formik";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import { IconButton } from "@chakra-ui/react";

import { InputRightElement } from "@chakra-ui/react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

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
import { AiOutlineDelete } from "react-icons/ai";
import { FiDelete } from "react-icons/fi";

import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

import Swal from "sweetalert2";

import Axios from "axios";
import { fromPairs } from "lodash";

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

const Basic = () => {
  const [TableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [zcaFilter, setZcaFilter] = useState("");

  const [zcaOptions, setZcaOptions] = useState([]);

  const [formData, setFormData] = useState({
    hscode: "",
    zca: "",
    name_th: "",
    name_en: "",
    weight_p_stk: "",
    sqr_p_stk: "",
    stk_p_shift: "",
    stk_p_hr: "",
    ton_p_shift: "",
    ton_p_hr: "",
    badge: "",
    hs: "",
    compressed: "",
    noted: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditRow = (rowData) => {
    console.log(rowData)
    setFormData(rowData); 
    setIsModalOpen(true); 

  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setFormData({}); // Clear the form data
  };

  const handleFormEdit = async () => {
    try {
      const response = await client.post("wms/api/edit_material", formData);

      fetchMasterSTK(); // Refresh the table data
      setIsModalOpen(false); // Close the modal
      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        showConfirmButton: false,
      });
    }
  };

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
        // Post data to the specified URL
        const response = await client.post(
          "wms/api/delete_material",
          postData
        );

        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          timer: 1000,
          showConfirmButton: false,
        });
        fetchMasterSTK(); // Refresh table data after deletion
      } catch (error) {
        console.error("Error posting data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message,
          showConfirmButton: false,
        });
      }
    }
    fetchMasterSTK();
  };

  const handleChange = (e) => {
    console.log(e.target);

    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const fetchMasterSTK = () => {
    client
      .get("wms/api/get_material")
      .then((response) => {
        console.log(response.data.data,'response.data.data')
        setTableData(response.data.data); 
        setFilteredTableData(response.data.data); // Initialize with all data

        const sortedData = response.data.data.sort((a, b) => a.id - b.id);

        const zcaArray = sortedData.map((item) => ({
          value: item.zca,
          label: `${item.zca} ${item.name_th} ${item.hs}`,
        }));

        setZcaOptions(zcaArray);
      })
      .catch((error) => {
        console.error("Error fetching MasterWIPSTK data:", error);
      });
  };
  // console.log('Alldata,',TableData)
  // console.log('option for user',zcaOptions)
  console.log(formData,'enter input')
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      stk_p_shift: prevData.stk_p_hr ? prevData.stk_p_hr * 8 : "",
      ton_p_shift: prevData.ton_p_hr ? prevData.ton_p_hr * 8 : "",
    }));
  }, [formData.stk_p_hr, formData.ton_p_hr]);


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await client.post("wms/api/post_material", formData);
      // console.log("formData", formData);
      // console.log("Form Susbmssitted", response.data);
      // console.log(formData);

      setFormData({});

      Swal.fire({
        icon: "success",
        title: "Submitted Successfully",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error submitting form data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        showConfirmButton: false,
      });
    }
  };

  const applyFilters = () => {
    let filteredData = TableData;

    if (zcaFilter && zcaFilter.value) {
      filteredData = filteredData.filter(
        (item) => item.zca === zcaFilter.value
      );
    }
    // console.log('User selected this zcas',zcaFilter)
    // console.log('filteredData',filteredData)
    setFilteredTableData(filteredData);
  };

  useEffect(() => {
    fetchMasterSTK();
  }, []);



  useEffect(() => {
    applyFilters();
  }, [zcaFilter]);

  


  return (
    <>
      <Box p={4} maxW="1200px" mx="auto">
        <h1>Basic Form</h1>
        <form onSubmit={handleSubmit}>
          <SimpleGrid columns={4} spacing={4} w="100%">
            <FormControl id="zca" isRequired>
              <FormLabel>ZCA</FormLabel>
              <Input name="zca" value={formData.zca} onChange={handleChange} />
            </FormControl>

            <FormControl id="name_th" isRequired>
              <FormLabel>ชื่อไทย</FormLabel>
              <Input
                name="name_th"
                value={formData.name_th}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl id="name_en">
              <FormLabel>ชื่ออังกฤษ</FormLabel>
              <Input
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl id="weight_p_stk">
              <FormLabel>Weight/Pallet</FormLabel>
              <Input
                name="weight_p_stk"
                value={formData.weight_p_stk}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="sqr_p_stk">
              <FormLabel>Sqr/Pallet</FormLabel>
              <Input
                name="sqr_p_stk"
                value={formData.sqr_p_stk}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="stk_p_hr" isRequired>
              <FormLabel>Stack/Hour</FormLabel>
              <Input
                name="stk_p_hr"
                value={formData.stk_p_hr}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="stk_p_shift" isDisabled>
              <FormLabel>Stack/Shift</FormLabel>
              <Input
                name="stk_p_shift"
                value={formData.stk_p_shift}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="ton_p_hr" isRequired>
              <FormLabel>Ton/Hour</FormLabel>
              <Input
                name="ton_p_hr"
                value={formData.ton_p_hr}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="ton_p_shift" isDisabled>
              <FormLabel>Ton/Shift</FormLabel>
              <Input
                name="ton_p_shift"
                value={formData.ton_p_shift}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="hs" isRequired>
              <FormLabel>Machine</FormLabel>
              <Input name="hs" value={formData.hs} onChange={handleChange} />
            </FormControl>
            <FormControl id="badge">
              <FormLabel>Badge</FormLabel>
              <Input
                name="badge"
                value={formData.badge}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="compressed">
              <FormLabel>Compressed</FormLabel>
              <Input
                name="compressed"
                value={formData.compressed}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl id="compressed">
              <FormLabel>หมายเหตุ</FormLabel>
              <Input
                name="noted"
                value={formData.noted}
                onChange={handleChange}
              />
            </FormControl>
          </SimpleGrid>
          <Button mt={4} colorScheme="blue" type="submit">
            Save
          </Button>
        </form>
      </Box>
      <FormControl style={{ zIndex: 50 }} minW={"250px"} mb="4">
          <FormLabel fontWeight={900}>Search ZCA No.</FormLabel>
          <ChakraReactSelect
            placeholder="type here..."
            options={zcaOptions}
            onChange={setZcaFilter}
            isClearable={true}
            value={zcaOptions.find(
              (option) => option.value === zcaFilter?.value
            )}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({
                ...base,
                minHeight: "400px",
              }),
              option: (base) => ({
                ...base,
                padding: "5px",
              }),
            }}
          />
        </FormControl>
      <Table
        height={690}
        data={filteredTableData}
        rowHeight={65}
        isLoading={filteredTableData.length === 0}
      >
        <Column verticalAlign="middle" width={60} resizable fixed="left">
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Code</HeaderCell>
          <Cell dataKey="hscode" />
        </Column>

        <Column
          verticalAlign="middle"
          width={120}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Machine</HeaderCell>
          <Cell dataKey="hs" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>ZCA</HeaderCell>
          <Cell dataKey="zca" />
        </Column>

        <Column
          verticalAlign="middle"
          width={350}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>ชื่อไทย</HeaderCell>
          <Cell dataKey="name_th" />
        </Column>

        <Column
          verticalAlign="middle"
          width={350}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>ชื่ออังกฤษ</HeaderCell>
          <Cell dataKey="name_en" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Weight/Pallet</HeaderCell>
          <Cell dataKey="weight_p_stk" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Sqr/Pallet</HeaderCell>
          <Cell dataKey="sqr_p_stk" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Stock/Shift</HeaderCell>
          <Cell dataKey="stk_p_shift" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Stock/Hour</HeaderCell>
          <Cell dataKey="stk_p_hr" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Ton/Shift</HeaderCell>
          <Cell dataKey="ton_p_shift" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Ton/Hour</HeaderCell>
          <Cell dataKey="ton_p_hr" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Badge</HeaderCell>
          <Cell dataKey="badge" />
        </Column>

        <Column
          verticalAlign="middle"
          width={150}
          resizable
          align="center"
          fullText
        >
          <HeaderCell>Compressed</HeaderCell>
          <Cell dataKey="compressed" />
        </Column>


        <Column
            verticalAlign="middle"
            width={100}
            resizable

            align="center"
            fixed="right"
          >
            <HeaderCell>Edit</HeaderCell>
            <Cell>
              {(rowData) => {
                return (
                  <IconButton
                    ml={2}
                    size="md"
                    icon={<FiEdit />}
                    
                    colorScheme="blue"
                    onClick={() => {
                      handleEditRow(rowData);
                    }}
                  />
                );
              }}
            </Cell>
          </Column>
          <Column
            verticalAlign="middle"
            width={100}
            resizable

            align="center"
            fixed="right"
          >
            <HeaderCell>Delete</HeaderCell>
            <Cell>
              {(rowData) => {
                return (
                  <>
                    <IconButton
                      ml={2}
                      size="md"
                      icon={<AiOutlineDelete />}
                      colorScheme="red"
                      onClick={() => {
                        handleDeleteRow(rowData.id);
                      }}
                    />
                  </>
                );
              }}
            </Cell>
          </Column>
      </Table>




      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader >Edit Material</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack spacing={4} align="start">
              <VStack spacing={4} flex="1">
                <FormControl>
                  <FormLabel >Code</FormLabel>
                  <Input
                    name="hscode"
                    
                    value={formData.hscode || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >ZCA</FormLabel>
                  <Input
                    name="zca"
                    value={formData.zca || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >ชื่อไทย</FormLabel>
                  <Input
                    name="name_th"
                    value={formData.name_th || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Weight/Pallet</FormLabel>
                  <Input
                    name="weight_p_stk"
                    value={formData.weight_p_stk || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Stock/Shift</FormLabel>
                  <Input
                    name="stk_p_shift"
                    value={formData.stk_p_shift || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Ton/Shift</FormLabel>
                  <Input
                    name="ton_p_shift"
                    value={formData.ton_p_shift || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Badge</FormLabel>
                  <Input
                    name="badge"
                    value={formData.badge || ""}
                    onChange={handleChange} 
                  />
                </FormControl>
              </VStack>
              <VStack spacing={4} flex="1">
                <FormControl>
                  <FormLabel >Machine</FormLabel>
                  <Input
                    name="hs"
                    value={formData.hs || ""}
                    onChange={handleChange} 
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >ชื่ออังกฤษ</FormLabel>
                  <Input
                    name="name_en"
                    value={formData.name_en || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Sqr/Pallet</FormLabel> 
                  <Input
                    name="sqr_p_stk"
                    value={formData.sqr_p_stk || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Stock/Hour</FormLabel>
                  <Input
                    name="stk_p_hr"
                    value={formData.stk_p_hr || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Ton/Hour</FormLabel>
                  <Input
                    name="ton_p_hr"
                    value={formData.ton_p_hr || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel >Compressed</FormLabel>
                  <Input
                    name="compressed"
                    value={formData.compressed || ""}
                    onChange={handleChange} 
                  />
                </FormControl>
              </VStack>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleFormEdit}>
              Save
            </Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



    </>
  );
};

export default Basic;
