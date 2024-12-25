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
import moment from "moment";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  useColorModeValue,
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

import { IconButton } from "@chakra-ui/react";

import { InputRightElement } from "@chakra-ui/react";

import { useFormik } from "formik";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import Swal from "sweetalert2";

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

import { BiCog } from "react-icons/bi";
import { BiX } from "react-icons/bi";

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
  return (
    <>
      <Box pb={4} bg={bgColor} borderRadius='md'>
        <Formik
          enableReinitialize
          initialValues={{
            username: null,
            password: null,
            email: null,
            first_name: null,
            last_name: null,
            employee_id: null,
            role_id: 1,
          }}
          onSubmit={async (values, { resetForm }) => {
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
            try {
              // Post data to the specified URL
              const response = await client.post("wms/api/register", values);

              if (response.data.success == false) {
                Swal.fire({
                  icon: "error",
                  title: "ผิดผลาด",
                  text: response.data.message,
                  timer: 1000,
                  showConfirmButton: false,
                });
                return 0;
              }
              resetForm({
                values: {
                  // ตั้งค่าเริ่มต้นใหม่
                  username: "",
                  password: "",
                  email: "",
                  first_name: "",
                  last_name: "",
                  employee_id: "",
                  role_id: 1,
                },
              });
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
                timer: 1000,
                showConfirmButton: false,
              });
            }
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string()
              .min(2, "Too Short!")
              .max(50, "Too Long!")
              .required("Required"),
            password: Yup.string().required("Password is Required"),
            email: Yup.string()
              .email("Invalid email")
              .matches(/@scg\.com$/, "Email must be from @scg.com domain")
              .required("Email is Required"),
            first_name: Yup.string()
              .min(2, "Too Short!")
              .max(50, "Too Long!")
              .required("Required"),
            last_name: Yup.string()
              .min(2, "Too Short!")
              .max(50, "Too Long!")
              .required("Required"),
            employee_id: Yup.string()
              .matches(/^\d{10}$/, "Employee ID must be exactly 10 digits")
              .required("Required"),
          })}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {(formik) => (
            <Form>
              <Box rounded={"lg"} bg={bgColor} p={5}>
                <Heading mb={4} fontSize={"4xl"}>
                  เพิ่มสมาชิก
                </Heading>
                <Stack spacing={4}>
                  <HStack spacing={4}>
                    <FormControl isRequired isInvalid={formik.errors.username} bg={bgColor}>
                      <FormLabel>Username</FormLabel>
                      <Input
                        name="username"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                      />
                      {formik.errors.username && (
                        <FormErrorMessage>
                          {formik.errors.username}
                        </FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isRequired isInvalid={formik.errors.password} bg={bgColor}>
                      <FormLabel>Password</FormLabel>
                      <Input
                        name="password"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                      />
                      {formik.errors.password && (
                        <FormErrorMessage>
                          {formik.errors.password}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl
                      isRequired
                      isInvalid={formik.errors.first_name}
                    >
                      <FormLabel>First Name</FormLabel>
                      <Input
                        name="first_name"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.first_name}
                      />
                      {formik.errors.first_name && (
                        <FormErrorMessage>
                          {formik.errors.first_name}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl isRequired isInvalid={formik.errors.last_name}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        name="last_name"
                        type="text"
                        bgColor={bgColor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.last_name}
                      />
                      {formik.errors.last_name && (
                        <FormErrorMessage>
                          {formik.errors.last_name}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </HStack>
                  
                  <HStack spacing={4}>
                  <FormControl isRequired isInvalid={formik.errors.employee_id}>
                    <FormLabel>Employee ID</FormLabel>
                    <Input
                      name="employee_id"
                      type="text"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.employee_id}
                    />
                    {formik.errors.employee_id && (
                      <FormErrorMessage>
                        {formik.errors.employee_id}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl isRequired isInvalid={formik.errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="text"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                    />
                    {formik.errors.email && (
                      <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
                    )}
                  </FormControl>
                  </HStack>


                  <FormControl isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select
                      name="role_id"
                      bgColor={bgColor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.role_id}
                    >
                      <option value="1" >Admin</option>
                      <option value="2">Planner</option>
                      <option value="3">Production</option>
                      <option value="4">Plantco</option>
                      <option value="5">Lab</option>
                      <option value="6">SCM</option>
                    </Select>
                  </FormControl>

                  <Stack spacing={10} pt={2}>
                    <Button
                      size="lg"
                      bg={"blue.400"}
                      color={"white"}
                      _hover={{
                        bg: "blue.500",
                      }}
                      type="submit"
                    >
                      เพิ่มรายชื่อในระบบ
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
};

export default HomePage;
