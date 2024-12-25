import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Text,
  Box,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Badge,
  HStack,
  Button,
  CardHeader,
  VStack,
  Heading,
} from "@chakra-ui/react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import StockLocationModal from "./Modal";

// S8FFCaj112PZdK3UOPqjlpqZgDWU1IbtvU9Ayk0SJsu

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

const App = () => {


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [selectedStockCode, setSelectedStockCode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);
  const navigate = useNavigate();
  console.log(data, "fetcghing");
  const colorSchemes = [
    "orange",
    "teal",
    "blue",
    "green",
    "yellow",
    "purple",
    "red",
  ];

  const fetchStockEstimate = () => {
    client
      .get("wms/api/get_stockestimate")
      .then((response) => {
        setData(response.data.forecast);

        setLoading(false);
        console.log("responsees", response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStockEstimate();
  }, []);

  //  ==============================
  
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  
  const sendLineNotify = (message) => {
    client
      .post("wms/api/sent_notift", { message: message })
      .then((response) => {
        if (response.data.success) {
          console.log("Notification sent successfully");
        } else {
          console.error("Error sending notification:", response.data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const generateNegativeStockMessage = (data) => {
    let message = "Negative Stock Alert:\n\n";

    data.forEach((plan) => {
      console.log(plan);
      const negativeStocks = Object.keys(plan.data).flatMap((materialCode) =>
        plan.data[materialCode]
          .filter((item) => item.stock < 0)
          .map((item) => ({
            planId: plan.PlanId,
            uniqueName: item.name,
            stock: item.stock,
            date: item.date_start,
          }))
      );

      if (negativeStocks.length > 0) {
        message += `PlanID: ${plan.PlanId}\n`;
        negativeStocks.forEach((item) => {
          message += `- ${item.uniqueName}, Stock: ${item.stock} หมดในวันที่ ${item.date}\n`;
        });
        message += "\n";
      }
    });

    return message !== "Negative Stock Alert:\n\n" ? message : null;
  };

  //  ==============================

  const handleStockClick = (stockCode, plan, item) => {
    setSelectedStockCode(stockCode);
    setSelectedItem(item);
    setHierarchy(plan.hierarchy);
    if (plan.location && plan.location[stockCode]) {
      setLocationData(plan.location[stockCode]);
    } else {
      setLocationData([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGoToDashboardOverview = (firstZCA) => {
    setLoading(true); // Trigger loading state
    const newTab = window.open("/planner/dashboard_warehouse", "_blank");

    // Wait for the new tab to open and load before sending the message
    setTimeout(() => {
      newTab.postMessage(
        {
          uniqueName: firstZCA,
        },
        window.location.origin
      );
      setLoading(false); // Reset loading after navigation
    }, 500); // Adjust the delay if necessary
  };

  return (
    <Box>
      <Heading fontSize="xl">Stock Notify</Heading>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Spinner size="xl" />
        </Box>
      ) : (
        <Accordion allowMultiple>
          {data.map((plan) => {
            const hasNegativeStock = Object.keys(plan.data).some(
              (materialCode) =>
                plan.data[materialCode].some((item) => item.stock < 0)
            );
            const firstZCA = Object.keys(plan.data).find((materialCode) =>
              plan.data[materialCode].some((item) => item.stock < 0)
            );
            if (!hasNegativeStock) {
              return null;
            }

            return (
              <AccordionItem key={plan.PlanId}>
                {({ isExpanded }) => (
                  <>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="sm" fontWeight="bold">
                            PlanId: {plan.PlanId}
                          </Text>

                          {Array.from(
                            new Set(
                              Object.keys(plan.data).flatMap((materialCode) =>
                                plan.data[materialCode]

                                  .filter((item) => item.stock < 0)
                                  .map((item) => item.name)
                              )
                            )
                          ).map((uniqueName, index) => (
                            <Badge
                              // className="badge-custom"
                              key={index}
                              colorScheme={
                                colorSchemes[index % colorSchemes.length]
                              }
                              ml={2}
                              fontSize="sm" // Ensure the fontSize is set
                              size="sm" // Use size="sm" to be explicit
                              p={1}
                            >
                              {uniqueName}
                            </Badge>
                          ))}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {Object.keys(plan.data).map((materialCode, index) => (
                        <VStack
                          key={index}
                          p={2}
                          alignItems="flex-start"
                          spacing={4}
                        >
                          {plan.data[materialCode]
                            .filter((item) => item.stock < 0)
                            .map((item, subIndex) => {
                              const uniqueNameIndex = Array.from(
                                new Set(
                                  Object.keys(plan.data).flatMap((code) =>
                                    plan.data[code]
                                      .filter((it) => it.stock < 0)
                                      .map((it) => it.name)
                                  )
                                )
                              ).indexOf(item.name);

                              const badgeColorScheme =
                                colorSchemes[
                                  uniqueNameIndex % colorSchemes.length
                                ];

                              return (
                                <HStack
                                  key={subIndex}
                                  p={2}
                                  alignItems="flex-start"
                                  spacing={4}
                                >
                                  {/* Parent Box */}
                                  <Box
                                    border="1px solid #ddd"
                                    borderRadius="md"
                                    p={6}
                                  >
                                    <HStack>
                                      <Box
                                        w="12px"
                                        h="12px"
                                        borderRadius="50%"
                                        bg={`${badgeColorScheme}.200`}
                                      />
                                      <Text fontSize="lg" fontWeight="bold">
                                        {item.name}
                                      </Text>
                                    </HStack>
                                    <Text>ZCA: {item.code}</Text>
                                    <Text>Date: {formatDate(item.date_start)}</Text>
                                    <Box
                                      p={2}
                                      border="1px solid #ddd"
                                      borderRadius="md"
                                      my={2}
                                    >
                                      <HStack>
                                        <Text>Stock:</Text>
                                        <Badge colorScheme="red">
                                          {item.stock}
                                        </Badge>
                                      </HStack>
                                    </Box>

                                    <Text
                                      cursor="pointer"
                                      color="blue.500"
                                      onClick={() =>
                                        handleStockClick(item.code, plan, item)
                                      }
                                    >
                                      Previous Stock: {item.previous_stock}
                                    </Text>
                                  </Box>

                                  {/* Child Box */}
                                  {item.child && item.child.length > 0 && (
                                    <Box>
                                      <HStack
                                        alignItems="flex-start"
                                        spacing={4}
                                      >
                                        {item.child.map(
                                          (childItem, childIndex) => (
                                            <Box
                                              key={childIndex}
                                              p={5}
                                              border="1px solid #ddd"
                                              borderRadius="md"
                                            >
                                              <HStack spacing={4}>
                                                <VStack align="flex-start">
                                                  <Text
                                                    fontSize="lg"
                                                    fontWeight="bold"
                                                  >
                                                    {childItem.child_name}
                                                  </Text>
                                                  <Text>
                                                    ZCA: {childItem.child_code}
                                                  </Text>
                                                  <Text>Date: {formatDate(item.date_start)}</Text>
                                                  <HStack>
                                                    {" "}
                                                    <Box
                                                      mt={2}
                                                      ml={4}
                                                      p={2}
                                                      border="1px solid #ddd"
                                                      borderRadius="md"
                                                    >
                                                      <HStack
                                                        key={childIndex}
                                                        spacing={4}
                                                        alignItems="center"
                                                      >
                                                        <Text>
                                                          Ratio:{" "}
                                                          {childItem.ratio}
                                                        </Text>
                                                        <Divider
                                                          orientation="vertical"
                                                          height="20px"
                                                          borderColor="#ddd"
                                                        />
                                                        <Text>
                                                          Frozen:{" "}
                                                          {childItem.frozen}
                                                        </Text>
                                                        <Divider
                                                          orientation="vertical"
                                                          height="20px"
                                                          borderColor="#ddd"
                                                        />
                                                        <Text>
                                                          Actual:{" "}
                                                          {childItem.actual}
                                                        </Text>
                                                      </HStack>
                                                    </Box>
                                                  </HStack>
                                                </VStack>
                                              </HStack>
                                            </Box>
                                          )
                                        )}
                                      </HStack>
                                    </Box>
                                  )}
                                </HStack>
                              );
                            })}
                        </VStack>
                      ))}

                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mb={4}
                      >
                        <Button
                          size="sm"
                          onClick={() => handleGoToDashboardOverview(firstZCA)}
                        >
                          Go to Dashboard Warehouse
                        </Button>
                      </Box>
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <StockLocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedStockCode={selectedStockCode}
        locationData={locationData}
        selectedItem={selectedItem}
        hierarchy={hierarchy}
      />
    </Box>
  );
};

export default App;
