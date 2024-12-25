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
import { useColorModeValue } from "@chakra-ui/react";
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
  Link,
  FormErrorMessage,
} from "@chakra-ui/react";

import { IconButton } from "@chakra-ui/react";

import { InputRightElement } from "@chakra-ui/react";

import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css"; // or 'rsuite-table/dist/css/rsuite-table.css'
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { SingleDatepicker, RangeDatepicker } from "chakra-dayzed-datepicker";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  AsyncCreatableSelect,
  AsyncSelect,
  CreatableSelect,
  Select as ChakraReactSelect,
} from "chakra-react-select";

import { useFormik } from "formik";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import Swal from "sweetalert2";
import Material from "./Material";
import EditWIP from "./EditWIP";
import EditFG from "./EditFG";
import EditProcessLock from "./EditProcessLock";

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
  const bgColorPVP = useColorModeValue("white", "#28303E");
  return (
    <>
      <Card>
        <CardBody>
          <Heading mb={3} size="xl">
            Material
          </Heading>
          {/* <Tabs variant='enclosed' size="lg" isLazy> */}
          <Tabs size={"lg"} variant="none" isLazy>
            <TabList>
              <HStack
                px={1}
                py={1}
                backgroundColor={bgColorDefault}
                borderRadius={"lg"}
                spacing={2}
              >
                <Tab
                  _selected={{
                    color: textColor,
                    bg: bgColorPVP,
                    boxShadow: "md",
                  }}
                  borderRadius={"lg"}
                  color={"gray.500"}
                >
                  <Heading fontSize={"xl"}>Material</Heading>
                </Tab>
                <Tab
                  _selected={{
                    color: textColor,
                    bg: bgColorPVP,
                    boxShadow: "md",
                  }}
                  borderRadius={"md"}
                  color={"gray.500"}
                >
                  <Heading fontSize={"xl"}>WIP</Heading>
                </Tab>

                <Tab
                  _selected={{
                    color: textColor,
                    bg: bgColorPVP,
                    boxShadow: "md",
                  }}
                  borderRadius={"lg"}
                  color={"gray.500"}
                >
                  <Heading fontSize={"xl"}>FG</Heading>
                </Tab>

                <Tab
                  _selected={{
                    color: textColor,
                    bg: bgColorPVP,
                    boxShadow: "md",
                  }}
                  borderRadius={"lg"}
                  color={"gray.500"}
                >
                  <Heading fontSize={"xl"}>ProcessLock</Heading>
                </Tab>
              </HStack>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Material />
              </TabPanel>
              <TabPanel>
                <EditWIP />
              </TabPanel>
              <TabPanel>
                <EditFG />
              </TabPanel>
              <TabPanel>
                <EditProcessLock />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </>
  );
};

export default HomePage;
