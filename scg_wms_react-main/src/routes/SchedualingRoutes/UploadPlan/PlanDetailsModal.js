import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Flex,
  SimpleGrid,
  Box,
  useColorModeValue,
  Spinner,
  HStack,
  useToast,
  Badge,
  Table,
  Thead,
  Tfoot,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Switch,
} from "@chakra-ui/react";
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

const PlanDetailsModal = ({ isOpen, onClose, planData, dateRange }) => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColorDefault = useColorModeValue("gray.100", "gray.800");
  const bgColor = useColorModeValue("white", "#28303E");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const tableBg = useColorModeValue("white", "gray.700");
  const headerColor = useColorModeValue("gray.700", "gray.300");
  const cellTextColor = useColorModeValue("gray.800", "gray.200");
  const badgeBgColor = useColorModeValue("blue.500", "blue.300");

  const [doneData, setDoneData] = useState(null);
  const [planLog, setPlanlog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState("qty"); // New state to track display mode
  const toast = useToast();

  const [start, end] = dateRange || [null, null];

  const fetchDoneData = async (zca, listmc_done, week, start) => {
    setLoading(true);
    try {
      const response = await client.get("wms/api/get_sent_approve", {
        params: {
          zca,
          listmc_done,
          week: week,
          startdate: start,
          startdate: end,
        },
      });
      console.log(response.data, "data fetching");
      setDoneData(response.data);
      setPlanlog(response.data.plan);
    } catch (error) {
      toast({
        title: "Error fetching data.",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  console.log();
  useEffect(() => {
    if (isOpen && planData && start && end) {
      const formattedStartDate = start.toISOString().split("T")[0];
      const formattedEndDate = end.toISOString().split("T")[0];

      fetchDoneData(
        planData.materialcode,
        planData.listmc_done,
        planData.planweek,
        start
      );
    }
  }, [isOpen, planData, start, end]);

  if (!planData) return null;

  const groupedData =
    doneData?.event_log?.reduce((acc, log) => {
      if (log && log.send_date && log.send_shift) {
        const date_sent = log.send_date;
        const key = `${date_sent}-${log.send_shift}`;

        if (!acc[key]) {
          acc[key] = {
            logs: [],
            total_qty_good: 0,
            total_qty_loss: 0,
            total_qty_lab: 0,
          };
        }

        acc[key].logs.push(log);
        acc[key].total_qty_good += log.qty_good;
        acc[key].total_qty_loss += log.qty_loss;
        acc[key].total_qty_lab += log.qty_lab;
      }
      return acc;
    }, {}) || {}; // Default to an empty object

  // Add `total_sum` for the last log and `0` for others
  Object.values(groupedData).forEach((group) => {
    if (group.logs.length > 0) {
      const totalSum = group.logs.reduce(
        (sum, log) => sum + log.qty_good + log.qty_loss + log.qty_lab,
        0
      );

      // Assign `0` to all logs except the last one
      group.logs.forEach((log, index) => {
        log.total_sum = index === group.logs.length - 1 ? totalSum : 0;
      });
    }
  });

  const completionPercentage =
    planData.plan > 0 ? (planData.done / planData.plan) * 100 : 0;

  const handleToggleMode = () => {
    setDisplayMode((prevMode) => (prevMode === "qty" ? "pallet" : "qty"));
  };

  let colorScheme;
  if (planData.machine_plan.startsWith("HS")) {
    colorScheme = "blue";
  } else if (planData.machine_plan.startsWith("CM")) {
    colorScheme = "green";
  } else if (planData.machine_plan.startsWith("PK")) {
    colorScheme = "purple";
  } else if (planData.machine_plan.startsWith("CT")) {
    colorScheme = "orange";
  } else {
    colorScheme = "gray";
  }

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex justify="flex-start" align="center" mt={4}>
            <Flex direction="column" gap={2}>
              <HStack spacing={2}>
                <Text fontWeight="bold" color={textColor}>
                  {planData.materialcode}
                </Text>{" "}
                <Badge colorScheme={colorScheme} fontSize="md">
                  {planData.listmc_done}
                </Badge>{" "}
              </HStack>

              <Text fontSize="sm" color={textColor}>
                {planData.name_th}
              </Text>
            </Flex>
          </Flex>
          <Box>
            <SimpleGrid columns={3} spacing={4} mt={3}>
              {planLog.map((plan, index) => (
                <Flex
                  key={index}
                  direction="column"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  p={2}
                >
                  <Text fontSize="md" color={textColor}>
                    Plan Count: {plan.plancount}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="md" color={textColor}>
                      Start Time:{" "}
                      {new Date(plan.starttime).toLocaleDateString("en-GB")}
                    </Text>
                    <Badge colorScheme={getShiftColorScheme(plan.shift)}>
                      กะ {plan.shift}
                    </Badge>
                  </HStack>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        </ModalHeader>

        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Box mt={4}>
              <Text fontWeight="bold" color={textColor}>
                Progress: {completionPercentage.toFixed(2)}%
              </Text>
              <Progress
                value={completionPercentage}
                colorScheme="green"
                size="lg"
                borderRadius="md"
              />
            </Box>
            <HStack spacing={4} mt={2}>
              <Text color={textColor}>
                Total Plan:{" "}
                {displayMode === "pallet"
                  ? planData.plan_pallet
                  : planData.plan}
              </Text>
              <Text color={textColor}>
                Approved:{" "}
                {displayMode === "pallet"
                  ? planData.done_pallet
                  : planData.done}
              </Text>
              <Text color={textColor}>
                Remaining:{" "}
                {displayMode === "pallet"
                  ? planData.remain_pallet
                  : planData.remain}
              </Text>
            </HStack>

            <Box
              mt={4}
              border="1px"
              borderColor={borderColor}
              borderRadius="md"
              p={4}
            >
              <HStack mb={3}>
                <Text fontWeight="bold" color={textColor}>
                  {displayMode === "qty"
                    ? "ประวัติการส่งยอด (แผ่น)"
                    : "ประวัติการส่งยอด (Pallet)"}
                </Text>
                <Switch
                  isChecked={displayMode === "pallet"}
                  onChange={handleToggleMode}
                  size="sm"
                />
              </HStack>
              {loading ? (
                <Spinner />
              ) : doneData && groupedData ? (
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>เครื่องจักร</Th>
                      <Th>วันที่ผลิต</Th>
                      <Th>วันที่ส่งยอด</Th>
                      <Th>ดี</Th>
                      <Th>เสีย</Th>
                      <Th>แลป</Th>
                      <Th>รวม</Th>
                      <Th>คนส่งยอด</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(groupedData).map(([key, group], index) => (
                      <React.Fragment key={index}>
                        {console.log(groupedData, "groupedData")}
                        {group.logs.map((log, logIndex) => (
                          <Tr key={logIndex}>
                            {console.log(log, "log")}
                            <Td color={textColor}>{log.machine}</Td>
                            <Td color={textColor}>
                              {log.product_date.split("T")[0]}
                            </Td>
                            <Td color={textColor}>
                              {log.send_date.split("T")[0]}
                              <Badge
                                colorScheme={getShiftColorScheme(
                                  log.send_shift
                                )}
                                ms={1}
                              >
                                กะ {log.send_shift}
                              </Badge>
                            </Td>

                            <Td color={textColor}>
                              {displayMode === "qty"
                                ? log.qty_good
                                : (
                                    log.qty_good / planData.pcsperpallet
                                  ).toFixed(2)}
                            </Td>
                            <Td color={textColor}>
                              {" "}
                              {displayMode === "qty"
                                ? log.qty_loss
                                : (
                                    log.qty_loss / planData.pcsperpallet
                                  ).toFixed(2)}
                            </Td>
                            <Td color={textColor}>
                              {" "}
                              {displayMode === "qty"
                                ? log.qty_lab
                                : (log.qty_lab / planData.pcsperpallet).toFixed(
                                    2
                                  )}
                            </Td>
                            <Td color={textColor}>
                              {displayMode === "qty"
                                ? log.total_sum === 0
                                  ? ""
                                  : log.total_sum
                                : log.total_sum / log.pcsperpallet === 0
                                ? ""
                                : (log.total_sum / log.pcsperpallet)?.toFixed(
                                    2
                                  ) ?? ""}
                            </Td>

                            <Td color={textColor}>
                              {log.operator_keyin}_{log.operator_name}
                            </Td>
                          </Tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </Tbody>
                  <Tfoot>
                    <Tr>
                      <Td
                        colSpan={8}
                        textAlign="center"
                        fontWeight="bold"
                        color={textColor}
                      >
                        รวมยอด:
                        {displayMode === "qty"
                          ? planData.done
                          : (planData.done / planData.pcsperpallet).toFixed(2)}
                      </Td>
                    </Tr>
                  </Tfoot>
                </Table>
              ) : (
                <Text color={textColor}>No done data available</Text>
              )}
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlanDetailsModal;
