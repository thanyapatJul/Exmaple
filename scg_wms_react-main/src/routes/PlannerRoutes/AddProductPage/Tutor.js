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

import Basicform from "./Tutor1";
import BasicReact from "./Tutor2"
import Operator_chart from './Operator_tutor'

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
  return (
    <>
      <Tabs size={"lg"} variant="none" isLazy>
        <TabList>
          <HStack px={1} py={1} borderRadius={"lg"} spacing={2}>
            <Tab
              _selected={{ bg: "white", boxShadow: "md", color: "black" }}
              borderRadius={"lg"}
              color={"gray.500"}
            >
              <Heading fontSize={"xl"}>Basic React</Heading>
            </Tab>
            <Tab
              _selected={{ bg: "white", boxShadow: "md", color: "black" }}
              borderRadius={"md"}
              color={"gray.500"}
            >
              <Heading fontSize={"xl"}>Material Form</Heading>
            </Tab>

            <Tab
              _selected={{ bg: "white", boxShadow: "md", color: "black" }}
              borderRadius={"md"}
              color={"gray.500"}
            >
              <Heading fontSize={"xl"}>Operator chart</Heading>
            </Tab>
          </HStack>
        </TabList>



        <TabPanels>
          <TabPanel>
            <BasicReact></BasicReact>
          </TabPanel>

          <TabPanel>
            <Box bg="white">
              <Basicform></Basicform>
            </Box>
          </TabPanel>

          <TabPanel>
            <Box bg="white">
              <Operator_chart></Operator_chart>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default HomePage;
