import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Text,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import Chart from "react-apexcharts";

const OperatorModal = ({
  isOpen,
  onClose,
  selectedOperator,
  paginatedDetails,
  totalPages,
  page,
  handleNextPage,
  handlePrevPage,
  timeSeriesChartOptions,
  timeSeriesData,
  client, 
}) => {
  const [operatorPastData, setOperatorPastData] = useState([]); 
  const [loading, setLoading] = useState(false);

  const [donutChartData, setDonutChartData] = useState({
    series: [],
    options: {
      chart: { type: "donut" },
      labels: [],
      legend: { position: "bottom" },
      title: { text: "Reject Percentage by Machine", align: "center" },
    },
  });

  useEffect(() => {
    if (selectedOperator && selectedOperator.operator) {
      fetchOperatorPast(selectedOperator.operator);
    }
  }, [selectedOperator]);

  const fetchOperatorPast = async (operatorId) => {
    try {
      setLoading(true);
      const response = await client.get("wms/api/get_operator_past", {
        params: { operator_id: operatorId },
      });
      const fetchedData = response.data.data; // Set fetched data

      const machines = fetchedData.map((item) => item.machine);

      const reject = fetchedData.map((item) => 
        parseFloat(Number(item.total_qty_loss || 0).toFixed(2))
      );
      
      console.log(reject,'reject')
      setDonutChartData({
        series: reject,
        options: {
          chart: { type: "donut" },
          labels: machines,
          legend: { position: "bottom" },
          title: { text: "Reject Percentage by Machine", align: "center" },
        },
      });

      setOperatorPastData(fetchedData);
    } catch (error) {
      console.error("Error fetching past operator data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text fontSize="xl" fontWeight="bold">
              {selectedOperator?.operator_name}
            </Text>
            <Badge colorScheme="green" size="xl" ms={2}>
              {selectedOperator?.operator}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          <SimpleGrid columns={5} spacing={4}>
            {paginatedDetails.map((detail, index) => {
              const formattedDate = new Date(detail.send_date).toLocaleDateString("en-GB");
              return (
                <Box
                  key={index}
                  p={2}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="md"
                >
                  <Text fontWeight="bold">Machine: {detail.machine}</Text>
                  <Text>ZCA: {detail.zca_on}</Text>
                  <Text>ชื่อ: {detail.name}</Text>
                  <Text>วันที่ส่ง: {formattedDate}</Text>
                  <Text>ของดี: {detail.total_qty_good}</Text>
                  <Text>ของเสีย: {detail.total_qty_loss}</Text>
                  <Text>
                    Reject Percentage: {(detail.reject_percent * 100).toFixed(2)}%
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>


          <Box
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            mt={4}
          >
            <HStack spacing={4} mb={4}>
              <Button
                onClick={handlePrevPage}
                isDisabled={page === 1}
                colorScheme="teal"
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={handleNextPage}
                isDisabled={page === totalPages}
                colorScheme="teal"
              >
                Next
              </Button>
            </HStack>
          </Box>

          {/* Qty Loss Time Series Chart */}
          <Box mt={4}>
            <Text fontWeight="bold" fontSize="lg" mb={4}>
              Qty Loss Over Time
            </Text>
            <Chart
              options={timeSeriesChartOptions}
              series={timeSeriesData}
              type="bar"
              height={350}
            />
          </Box>

          {/* Donut Chart for Reject Percentage */}
          <Box mt={8}>
            <Text fontWeight="bold" fontSize="lg" mb={4}>
              Reject Percentage by Machine
            </Text>
            <Chart
              options={donutChartData.options}
              series={donutChartData.series}
              type="donut"
              height={350}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OperatorModal;
