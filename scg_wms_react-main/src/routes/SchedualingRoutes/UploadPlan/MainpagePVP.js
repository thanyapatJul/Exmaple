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
  useColorModeValue,
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
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
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

import UploadPlan from "./UploadPlan";
import PVP from "./Plan_V_Product";
import PlanPerf from "./PlanPerformance";
// import EditProcessLock from './EditProcessLock'
import PVPOld from "./Plan_V_Product_old";
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

const MainPVP = () => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColorDefault = useColorModeValue("gray.100", "gray.800");
  const bgColorPVP = useColorModeValue("white", "#28303E");
  const role_name = localStorage.getItem("role_name");

  return (
    <>
      <Box bgColor={bgColorPVP} p={5} borderRadius="md">
        <Tabs size={"lg"} variant="none" isLazy>
          <TabList>
            <HStack
              px={1}
              py={1}
              backgroundColor={bgColorDefault}
              borderRadius={"lg"}
              spacing={2}
            >
              {role_name !== "SCM" && (
                <Tab
                  _selected={{
                    color: textColor,
                    bg: bgColorPVP,
                    boxShadow: "md",
                  }}
                  borderRadius={"lg"}
                  color={"gray.500"}
                >
                  <Heading fontSize={"xl"}>Upload Plan</Heading>
                </Tab>
              )}
              <Tab
                _selected={{
                  color: textColor,
                  bg: bgColorPVP,
                  boxShadow: "md",
                }}
                borderRadius={"md"}
                color={"gray.500"}
              >
                <Heading fontSize={"xl"}>Plan Performance</Heading>
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
                <Heading fontSize={"xl"}>PVP (BETA)</Heading>
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
                <Heading fontSize={"xl"}>PVP</Heading>
              </Tab>
            </HStack>
          </TabList>

          <TabPanels>
          {role_name !== "SCM" && (
              <TabPanel>
                <UploadPlan />
              </TabPanel>
            )}

            <TabPanel>
              <PlanPerf />
            </TabPanel>

            <TabPanel>
              <PVP />
            </TabPanel>


            <TabPanel>
              <PVPOld />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};

export default MainPVP;
