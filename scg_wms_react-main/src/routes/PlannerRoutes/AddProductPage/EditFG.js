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
  useColorModeValue,
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



  const [filteredTableData, setFilteredTableData] = useState([]);
  const [TableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageCount = Math.ceil(filteredTableData.length / itemsPerPage);
  const [zcaFilter, setZcaFilter] = useState("");
  const [zcaOptions, setZcaOptions] = useState([]);
  const [iseditInfo, setIsEditInfo] = useState(null);
  const [newRowData, setNewRowData] = useState(null);

  const addFgRef = useRef(null);
  const formikRef = useRef(null);
  const CloseButtonRef = useRef(null);

  const firstRowIndex = (currentPage - 1) * itemsPerPage;
  const lastRowIndex = firstRowIndex + itemsPerPage;
  const currentData = filteredTableData.slice(firstRowIndex, lastRowIndex);

  const handleScroll = () => {
    addFgRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < pageCount ? prev + 1 : prev));
  };

  useEffect(() => {
    console.log("newRowData>>>", newRowData);
  }, [newRowData]);

  const fetchFGData = () => {
    // เรียก API จาก Backend โดยใช้ axios
    client
      .get("wms/api/get_editzcafg")
      .then((response) => {
        console.log("Response Data: ", response);
        setTableData(response.data.data);
        setFilteredTableData(response.data.data);
        let zcaArray = response.data.data.map((item) => ({
          value: item.zca,
          label: `${item.zca} ${item.name}`,
        }));
        setZcaOptions(zcaArray);
      })
      .catch((error) => {
        console.error("Error fetching Approve data:", error);
      });
  };

  useEffect(() => {
    fetchFGData();
  }, []);

  const applyFilters = () => {
    let filteredData = TableData;
    if (zcaFilter && Object.keys(zcaFilter).length > 0) {
      filteredData = filteredData.filter(
        (item) => zcaFilter.value === item.zca
      );
    }
    setFilteredTableData(filteredData);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [zcaFilter]);

  function handleReset() {
    setIsEditInfo(null);
    setNewRowData(null);
    setZcaFilter("");
    setCurrentPage(1);
    if (formikRef.current) {
      formikRef.current.resetForm({
        values: {
          zca: "",
          namethai: "",
          nameshort: "",
          nameeng: "",
          type: "",
          pcsperpallet: "",
          kgpcs: "",
          brand: "",
          size: "",
          sizemm: "",
          tis: "",
          format: "",
          zcacustomer: "",

          HS3: false,
          HS4: false,
          HS5: false,
          HS6: false,
          HS7: false,
          HS8: false,
          HS9: false,
          CT1: false,
          CT2: false,
          CT3: false,
          CT4: false,
          CM5: false,
          CM6: false,
          CM7: false,
          CM8: false,
          DP1: false,
          DP2: false,
          DET: false,
          MS1: false,
          OC1: false,
          OC2: false,
          OS1: false,
          PK1: false,
          PK2: false,
          PK3: false,
          PK4: false,
          PK5: false,
          PK6: false,
          PL1: false,
          RT1: false,
          RT2: false,
          SD1: false,
          SEG: false,
        },
      });
    }
  }

  const handleDeleteRow = async (id) => {
    const postData = {
      id_select: id,
    };
    console.log("id:", id, postData);

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
          "wms/api/post_deletezcafg",
          postData
        );
        console.log("Post response:", response.data);
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
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

      fetchFGData();
    }
  };

  return (
    <>
      <Box pb={4}>
        <Formik
          enableReinitialize
          initialValues={{
            zca: newRowData ? newRowData.zca : null,
            namethai: newRowData ? newRowData.name : null,
            nameshort: newRowData ? newRowData.nameshort : null,
            nameeng: newRowData ? newRowData.nameen : null,
            type: newRowData ? newRowData.type : null,
            pcsperpallet: newRowData ? newRowData.pcpallet : null,
            kgpcs: newRowData ? newRowData.kg : null,
            brand: newRowData ? newRowData.brand : null,
            size: newRowData ? newRowData.size : null,
            sizemm: newRowData ? newRowData.sizemm : null,
            // tis: newRowData ? (parseInt(newRowData.tis) == 1 ? '1': '0') : null,
            tis: newRowData ? (newRowData.tis ? "1" : "0") : null,
            format: newRowData ? newRowData.format : null,
            zcacustomer: newRowData ? newRowData.zcacustomer : null,

            HS3: newRowData && newRowData.hs3_tl === "1" ? true : false,
            HS4: newRowData && newRowData.hs4_tl === "1" ? true : false,
            HS5: newRowData && newRowData.hs5_tl === "1" ? true : false,
            HS6: newRowData && newRowData.hs6_tl === "1" ? true : false,
            HS7: newRowData && newRowData.hs7_tl === "1" ? true : false,
            HS8: newRowData && newRowData.hs8_tl === "1" ? true : false,
            HS9: newRowData && newRowData.hs9_tl === "1" ? true : false,
            CT1: newRowData && newRowData.ct1_tl === "1" ? true : false,
            CT2: newRowData && newRowData.ct2_tl === "1" ? true : false,
            CT3: newRowData && newRowData.ct3_tl === "1" ? true : false,
            CT4: newRowData && newRowData.ct4_tl === "1" ? true : false,
            CM5: newRowData && newRowData.cm5_tl === "1" ? true : false,
            CM6: newRowData && newRowData.cm6_tl === "1" ? true : false,
            CM7: newRowData && newRowData.cm7_tl === "1" ? true : false,
            CM8: newRowData && newRowData.cm8_tl === "1" ? true : false,
            DP1: newRowData && newRowData.dp1_tl === "1" ? true : false,
            DP2: newRowData && newRowData.dp2_tl === "1" ? true : false,
            DET: newRowData && newRowData.det_tl === "1" ? true : false,
            MS1: newRowData && newRowData.ms1_tl === "1" ? true : false,
            OC1: newRowData && newRowData.oc1_tl === "1" ? true : false,
            OC2: newRowData && newRowData.oc2_tl === "1" ? true : false,
            OS1: newRowData && newRowData.os1_tl === "1" ? true : false,
            PK1: newRowData && newRowData.pk1_tl === "1" ? true : false,
            PK2: newRowData && newRowData.pk2_tl === "1" ? true : false,
            PK3: newRowData && newRowData.pk3_tl === "1" ? true : false,
            PK4: newRowData && newRowData.pk4_tl === "1" ? true : false,
            PK5: newRowData && newRowData.pk5_tl === "1" ? true : false,
            PK6: newRowData && newRowData.pk6_tl === "1" ? true : false,
            PL1: newRowData && newRowData.pl1_tl === "1" ? true : false,
            RT1: newRowData && newRowData.rt1_tl === "1" ? true : false,
            RT2: newRowData && newRowData.rt2_tl === "1" ? true : false,
            SD1: newRowData && newRowData.sd1_tl === "1" ? true : false,
            SEG: newRowData && newRowData.seg_tl === "1" ? true : false,
          }}
          onSubmit={async (values, { resetForm }) => {
            console.log("Submit");
            console.log(values);

            const result = await Swal.fire({
              title: "แน่ใจแล้วใช่ไหม ?",
              text: "กรุณาตรวจสอบข้อมูลก่อน!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#103911",
              confirmButtonText: "Submit",
              closeOnConfirm: false,
            });
            if (!result.isConfirmed) {
              return 0;
            }

            if (iseditInfo != null) {
              try {
                // Post data to the specified URL
                const response = await client.post(
                  "wms/api/post_editzcafg_2",
                  values
                );
                console.log("Post responsexxx:", response.data);
                if (response.data.success == false) {
                  Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: response.data.message,
                    timer: 1000,
                    showConfirmButton: false,
                  });
                  return 0;
                }

                Swal.fire({
                  icon: "success",
                  title: "สำเร็จ",
                  timer: 1000,
                  showConfirmButton: false,
                });
                handleReset();
                fetchFGData();
              } catch (error) {
                console.error("Error posting data:", error);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: error,
                  timer: 1000,
                  showConfirmButton: false,
                });
              }
            } else {
              try {
                // Post data to the specified URL

                const zcaCheckResponse = await client.post(
                  "wms/api/check_zca",
                  { zca: values.zca, type: "FG" }
                );

                if (
                  zcaCheckResponse.data.exists === false &&
                  zcaCheckResponse.data.message.includes("Invalid ZCA format")
                ) {
                  Swal.fire({
                    icon: "warning",
                    title: "Invalid ZCA Format",
                    text: zcaCheckResponse.data.message,
                    showConfirmButton: true,
                  });
                  return;
                }

                if (zcaCheckResponse.data.exists) {
                  Swal.fire({
                    icon: "warning",
                    title: "ZCA Already Exists",
                    text: zcaCheckResponse.data.message,
                    showConfirmButton: true,
                  });
                  return;
                }

                const response = await client.post(
                  "wms/api/post_editzcafg",
                  values
                );
                console.log("Post responsexxx:", response.data);
                if (response.data.success == false) {
                  Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: response.data.message,
                    timer: 1000,
                    showConfirmButton: false,
                  });
                  return 0;
                }

                resetForm({
                  values: {
                    // ตั้งค่าเริ่มต้นใหม่
                    zca: "",
                    namethai: "",
                    nameshort: "",
                    nameeng: "",
                    type: "",
                    pcsperpallet: "",
                    kgpcs: "",
                    brand: "",
                    size: "",
                    sizemm: "",
                    tis: "",
                    format: "",
                    zcacustomer: "",

                    HS3: false,
                    HS4: false,
                    HS5: false,
                    HS6: false,
                    HS7: false,
                    HS8: false,
                    HS9: false,
                    CT1: false,
                    CT2: false,
                    CT3: false,
                    CT4: false,
                    CM5: false,
                    CM6: false,
                    CM7: false,
                    CM8: false,
                    DP1: false,
                    DP2: false,
                    DET: false,
                    MS1: false,
                    OC1: false,
                    OC2: false,
                    OS1: false,
                    PK1: false,
                    PK2: false,
                    PK3: false,
                    PK4: false,
                    PK5: false,
                    PK6: false,
                    PL1: false,
                    RT1: false,
                    RT2: false,
                    SD1: false,
                    SEG: false,
                  },
                });
                Swal.fire({
                  icon: "success",
                  title: "สำเร็จ",
                  timer: 1000,
                  showConfirmButton: false,
                });
                fetchFGData();
              } catch (error) {
                console.error("Error posting data:", error);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: error,
                  timer: 1000,
                  showConfirmButton: false,
                });
              }
            }
          }}
          innerRef={formikRef}
        >
          {(formik) => (
            <Form>
              <Box rounded={"lg"} bg={bgColor} p={8} ref={addFgRef}>
                <Heading mb={4} fontSize={"xl"}>
                  เพิ่มสินค้า FG
                </Heading>
                <Stack spacing={4}>
                  <FormControl isRequired isInvalid={formik.errors.zca}>
                    <FormLabel>ZCA</FormLabel>
                    <Input
                      name="zca"
                      type="text"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.zca}
                      isDisabled={iseditInfo ? true : false}
                    />
                    {formik.errors.zca && (
                      <FormErrorMessage>{formik.errors.zca}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={formik.errors.namethai}>
                    <FormLabel>ชื่อไทย</FormLabel>
                    <Input
                      name="namethai"
                      type="text"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.namethai}
                    />
                    {formik.errors.namethai && (
                      <FormErrorMessage>
                        {formik.errors.namethai}
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={formik.errors.nameshort}>
                    <FormLabel>ชื่อย่อ</FormLabel>
                    <Input
                      name="nameshort"
                      type="text"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.nameshort}
                    />
                    {formik.errors.nameshort && (
                      <FormErrorMessage>
                        {formik.errors.nameshort}
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={formik.errors.nameeng}>
                    <FormLabel>ชื่ออังกฤษ</FormLabel>
                    <Input
                      name="nameeng"
                      type="text"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.nameeng}
                    />
                    {formik.errors.nameeng && (
                      <FormErrorMessage>
                        {formik.errors.nameeng}
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  <Flex gap={4}>
                    <FormControl isRequired isInvalid={formik.errors.type}>
                      <FormLabel>Type [ex. wood, board, TG, ...]</FormLabel>
                      <Select
                        name="type"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.type}
                      >
                        <option value="">Select type</option>
                        <option value="wood">Wood</option>
                        <option value="board">Board</option>
                        {/* Add more options as needed */}
                      </Select>
                      {formik.errors.type && (
                        <FormErrorMessage>
                          {formik.errors.type}
                        </FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isRequired isInvalid={formik.errors.brand}>
                      <FormLabel>
                        Brand [ex. SCG, DURA, SUN, Umbrella,...]
                      </FormLabel>
                      <Select
                        name="brand"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.brand}
                      >
                        <option value="">Select brand</option>
                        <option value="SCG">SCG</option>
                        <option value="DURA">DURA</option>
                        <option value="SUN">SUN</option>
                      </Select>
                      {formik.errors.brand && (
                        <FormErrorMessage>
                          {formik.errors.brand}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Flex>

                  <Flex gap={4}>
                    <FormControl isRequired isInvalid={formik.errors.size}>
                      <FormLabel>Size [ex. 120.9x244x0.6]</FormLabel>
                      <Input
                        name="size"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.size}
                      />
                      {formik.errors.size && (
                        <FormErrorMessage>
                          {formik.errors.size}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl isRequired isInvalid={formik.errors.sizemm}>
                      <FormLabel>Size mm [ex. 120.9x244x0.6mm]</FormLabel>
                      <Input
                        name="sizemm"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.sizemm}
                      />
                      {formik.errors.sizemm && (
                        <FormErrorMessage>
                          {formik.errors.sizemm}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Flex>

                  <Flex gap={4}>
                    <FormControl
                      isRequired
                      isInvalid={formik.errors.pcsperpallet}
                    >
                      <FormLabel>แผ่น / Pallet</FormLabel>
                      <Input
                        name="pcsperpallet"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.pcsperpallet}
                      />
                      {formik.errors.pcsperpallet && (
                        <FormErrorMessage>
                          {formik.errors.pcsperpallet}
                        </FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isRequired isInvalid={formik.errors.kgpcs}>
                      <FormLabel>Kg/Pcs</FormLabel>
                      <Input
                        name="kgpcs"
                        type="number"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.kgpcs}
                      />
                      {formik.errors.kgpcs && (
                        <FormErrorMessage>
                          {formik.errors.kgpcs}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Flex>

                  <Flex gap={4}>
                    <FormControl isRequired isInvalid={formik.errors.tis}>
                      <FormLabel>มอก. (TIS)</FormLabel>
                      <Select
                        name="tis"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.tis}
                      >
                        <option value="">Select TIS</option>
                        <option value="1">มี</option>
                        <option value="0">ไม่มี</option>
                      </Select>
                      {formik.errors.tis && (
                        <FormErrorMessage>{formik.errors.tis}</FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl isRequired isInvalid={formik.errors.format}>
                      <FormLabel>รูปแบบตั๋ว</FormLabel>
                      <Select
                        name="format"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.format}
                      >
                        <option value="">Select format</option>
                        <option value="TH">Thailand</option>
                        <option value="MM">Myanmar</option>
                        <option value="AU">Austraria</option>
                        <option value="KR">Korea</option>
                        <option value="LOGO">LOGO (ตัว L)</option>
                      </Select>
                      {formik.errors.format && (
                        <FormErrorMessage>
                          {formik.errors.format}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl>
                      <FormLabel>ZCA Customer</FormLabel>
                      <Input
                        name="zcacustomer"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.zcacustomer}
                      />
                      {/* {
                                                formik.errors.brand && (<FormErrorMessage>{formik.errors.brand}</FormErrorMessage>)
                                            } */}
                    </FormControl>
                  </Flex>

                  <FormControl>
                    <FormLabel>ผลิตจากเครื่องจักร</FormLabel>
                    <Wrap spacing={5}>
                      {[
                        "HS3",
                        "HS4",
                        "HS5",
                        "HS6",
                        "HS7",
                        "HS8",
                        "HS9",
                        "CT1",
                        "CT2",
                        "CT3",
                        "CT4",
                        "CM5",
                        "CM6",
                        "CM7",
                        "CM8",
                        "DP1",
                        "DP2",
                        "DET",
                        "MS1",
                        "OC1",
                        "OC2",
                        "OS1",
                        "PK1",
                        "PK2",
                        "PK3",
                        "PK4",
                        "PK5",
                        "PK6",
                        "PL1",
                        "RT1",
                        "RT2",
                        "SD1",
                        "SEG",
                      ].map((mc) => (
                        <WrapItem>
                          <Checkbox
                            size="md"
                            isChecked={formik.values[mc]}
                            onChange={(e) => {
                              formik.setFieldValue(mc, e.target.checked);
                            }}
                          >
                            {mc}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </FormControl>
                </Stack>
                <HStack>
                  <Button
                    mt={4}
                    px={10}
                    size="lg"
                    bg={iseditInfo ? "yellow.400" : "blue.400"}
                    color={"white"}
                    _hover={{
                      bg: iseditInfo ? "yellow.500" : "blue.500",
                    }}
                    type="submit"
                  >
                    {iseditInfo ? `แก้ไข FG` : `เพิ่ม FG`}
                  </Button>
                  {iseditInfo && (
                    <Button
                      mt={4}
                      px={10}
                      size="lg"
                      bg={"red.400"}
                      color={"white"}
                      _hover={{
                        bg: "red.500",
                      }}
                      onClick={handleReset}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </HStack>
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
        <Table height={690} data={currentData} rowHeight={65} isLoading    style={{ backgroundColor: bgColor }}>
          <Column verticalAlign="middle" width={60} resizable fixed="left"   style={{ backgroundColor: bgColor }}>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id" />
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
            <Cell dataKey="zca" />
          </Column>

          <Column
            verticalAlign="middle"
            width={350}
            resizable
            align="center"
            fullText
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>ชื่อไทย</HeaderCell>
            <Cell dataKey="name" />
          </Column>

          <Column
            verticalAlign="middle"
            width={350}
            resizable
            align="center"
            fullText
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>ชื่ออังกฤษ</HeaderCell>
            <Cell dataKey="nameen" />
          </Column>

          <Column
            verticalAlign="middle"
            width={350}
            resizable
            align="center"
            fullText
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>ชื่อย่อ</HeaderCell>
            <Cell dataKey="nameshort" />
          </Column>

          <Column
            verticalAlign="middle"
            width={150}
            resizable
            align="center"
            fullText
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>ประเภท</HeaderCell>
            <Cell dataKey="type" />
          </Column>

          <Column
            verticalAlign="middle"
            width={100}
            resizable
            align="center"
            fullText
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>Brand</HeaderCell>
            <Cell dataKey="brand" />
          </Column>

          <Column
            verticalAlign="middle"
            width={180}
            resizable
            align="center"
            fullText
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>Size</HeaderCell>
            <Cell dataKey="size" />
          </Column>

          <Column verticalAlign="middle" width={130} resizable align="center"    style={{ backgroundColor: bgColor }}>
            <HeaderCell>แผ่น/Pallet</HeaderCell>
            <Cell dataKey="pcpallet" />
          </Column>

          <Column verticalAlign="middle" width={130} resizable align="center"    style={{ backgroundColor: bgColor }}>
            <HeaderCell>Kg/Pcs</HeaderCell>
            <Cell dataKey="kg" />
          </Column>

          {[
            "HS3",
            "HS4",
            "HS5",
            "HS6",
            "HS7",
            "HS8",
            "HS9",
            "CT1",
            "CT2",
            "CT3",
            "CT4",
            "CM5",
            "CM6",
            "CM7",
            "CM8",
            "DP1",
            "DP2",
            "DET",
            "MS1",
            "OC1",
            "OC2",
            "OS1",
            "PK1",
            "PK2",
            "PK3",
            "PK4",
            "PK5",
            "PK6",
            "PL1",
            "RT1",
            "RT2",
            "SD1",
            "SEG",
          ].map((mc) => (
            <Column verticalAlign="middle" width={80} resizable align="center">
              <HeaderCell>{mc}</HeaderCell>
              <Cell>
                {(rowData, rowIndex) => {
                  if (rowData[mc.toLowerCase() + "_tl"] == "1") {
                    return (
                      <Tag
                        p={2}
                        size={"lg"}
                        colorScheme="green"
                        variant="solid"
                        rounded={"md"}
                      >
                        OK
                      </Tag>
                    );
                  }
                }}
              </Cell>
            </Column>
          ))}

          <Column verticalAlign="middle" width={100} resizable align="center"    style={{ backgroundColor: bgColor }}>
            <HeaderCell>วันที่เพิ่ม</HeaderCell>
            <Cell dataKey="created_at_new" />
          </Column>

          <Column verticalAlign="middle" width={100} resizable align="center"    style={{ backgroundColor: bgColor }}>
            <HeaderCell>ผู้เพิ่ม</HeaderCell>
            <Cell dataKey="operator_keyin_new" />
          </Column>

          <Column verticalAlign="middle" width={100} resizable align="center"    style={{ backgroundColor: bgColor }}>
            <HeaderCell>วันที่แก้ไข</HeaderCell>
            <Cell dataKey="updated_at_new" />
          </Column>

          <Column verticalAlign="middle" width={100} resizable align="center"    style={{ backgroundColor: bgColor }}>
            <HeaderCell>ผู้แก้ไข</HeaderCell>
            <Cell dataKey="operator_edit_new" />
          </Column>

          <Column
            verticalAlign="middle"
            width={iseditInfo ? 100 : 150}
            resizable
            align="center"
            fixed="right"
            style={{ backgroundColor: bgColor }}
          >
            <HeaderCell>Action</HeaderCell>
            <Cell>
              {(rowData, rowIndex) => {
                return (
                  <HStack>
                    {iseditInfo == null ? (
                      <>
                        <IconButton
                          size="md"
                          icon={<FiEdit />}
                          colorScheme="teal"
                          onClick={() => {
                            handleScroll();
                            setZcaFilter({
                              value: rowData.zca,
                              label: `${rowData.zca} ${rowData.name}`,
                            });
                            setCurrentPage(1);
                            setNewRowData(rowData);
                            setIsEditInfo(rowData.zca);
                          }}
                        />
                        <IconButton
                          size="md"
                          icon={<AiOutlineDelete />}
                          colorScheme="red"
                          onClick={() => {
                            handleDeleteRow(rowData.id);
                          }}
                        />
                      </>
                    ) : iseditInfo === rowData.zca ? (
                      <IconButton
                        ref={CloseButtonRef}
                        size="md"
                        icon={<CloseButton />}
                        colorScheme="red"
                        onClick={handleReset}
                      />
                    ) : null}
                  </HStack>
                );
              }}
            </Cell>
          </Column>
        </Table>
        <Divider />
        <Box mt={3}>
          <Flex px={2}>
            <Heading fontSize="1.4rem" style={{ alignSelf: "center" }}>
              Bifröst Datatable
            </Heading>
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
