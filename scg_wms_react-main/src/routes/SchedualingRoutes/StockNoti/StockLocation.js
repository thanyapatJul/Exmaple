import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Spinner,
  Heading,
  SimpleGrid,
  Button,
  HStack,
  Stack,
  Card,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import Axios from "axios";
import ReactApexChart from "react-apexcharts";
import { Select as ChakraReactSelect } from "chakra-react-select";
import StockLocationModal from "./Modal";
import StockHistoryHeatmap from "./StockHistoryHeatmap";

const ITEMS_PER_PAGE = 20;

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withCredentials = true;
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const StockLocation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyinitail, setHistoryinitail] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchItems, setSearchItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPallet, setShowPallet] = useState(false);



  
  const fetchLocation = async () => {
    try {
      setLoading(true);
      const response = await client.get("wms/api/get_stock_location");
      const stockData = response.data.all_stock_location || [];
      console.log(response.data);
      setData(stockData);
      setHistory(response.data.history_stock);
      setHistoryinitail(response.data.history_stock.slice(0, 30));

      const uniqueZCAOptions = stockData.map((loc) => ({
        value: `${loc.zca_on} - ${loc.name}`,
        label: `${loc.zca_on} - ${loc.name}`,
      }));
      setOptions(uniqueZCAOptions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const filtered = searchItems.length
      ? history.filter((entry) => {
          return searchItems.some((option) => {
            const isMatch = `${entry.name}` === option.value;
            return isMatch;
          });
        })
      : historyinitail; 
    setFilteredHistory(filtered);
  }, [searchItems, history, historyinitail]);
  

  const handleSelectChange = (selectedOptions) => {
    setSearchItems(selectedOptions);
    setCurrentPage(1);
  };

  const handleLocationClick = (loc) => {
    console.log("Location clicked:", loc);
    setSelectedLocation(loc.data_by_zone_row_column);
    setSelectedItem({ code: loc.zca_on , name:loc.name});
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };


  const handleToggle = () => {
    setShowPallet(!showPallet);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  const filteredData = searchItems.length
    ? data.filter((loc) =>
        searchItems.some(
          (option) => `${loc.zca_on} - ${loc.name}` === option.value
        )
      )
    : data;

  const totalStockQuantity = filteredData.reduce(
    (total, loc) => total + (showPallet ? loc.pallet || 0 : loc.total_qty || 0),
    0
  );

  const treeMapData = filteredData.map((loc) => ({
    x: loc?.name || "Unknown",
    y: showPallet ? loc?.pallet || 0 : loc?.total_qty || 0,
  }));

  const sortedTreeMapData = treeMapData.sort((a, b) => b.y - a.y);

  const chartOptions = {
    chart: {
      type: "treemap",
      height: 500,
    },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: true,
        shadeIntensity: 0.6,
        colorScale: {
          ranges: [
            { from: 0, to: 2000, color: "#FF4560" },
            { from: 2001, to: 6000, color: "#FEB019" },
            { from: 6001, to: 10000, color: "#00E396" },
            { from: 10001, to: 100000000, color: "#008FFB" },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return (
          opts.w.globals.labels[opts.dataPointIndex] + ": " + val + " units"
        );
      },
      style: { fontSize: "14px", fontWeight: "bold" },
    },
    tooltip: {
      y: { formatter: (val) => `${val} units` },
    },
  };

  return (
    <Box p={4}>


      <Stack spacing={4} ml={6} width="300px">
        <Card border="1px solid #ddd" borderRadius="md" boxShadow="md">
          <CardBody>
            <Text fontWeight="bold" fontSize="2xl">
              {showPallet ? "Today Pallets" : "Today Stock Quantity"}
            </Text>
            <Text fontSize="2xl" color="blue.500">
              {totalStockQuantity} {showPallet ? "pallets" : "units"}
            </Text>
            <Button onClick={handleToggle} mb={4}>
              {showPallet ? "Show Total Quantity" : "Show Pallets"}
            </Button>
          </CardBody>
        </Card>
      </Stack>
      <Box display="flex" justifyContent="space-between"  alignItems="center">
        {/* <Box>
          <ReactApexChart
            options={chartOptions}
            series={[{ data: sortedTreeMapData }]}
            type="treemap"
            height={500}
            width={600}
          />
        </Box> */}
        <Box >
          <StockHistoryHeatmap history={filteredHistory} />
        </Box>
      </Box>

      <ChakraReactSelect
        value={searchItems}
        options={options}
        onChange={handleSelectChange}
        isClearable={true}
        isMulti={true}
        placeholder="Select material codes"
        chakraStyles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            minWidth: "500px",
          }),
        }}
        mt={4}
      />

      <HStack spacing={2} mt={4} justifyContent="space-between">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>
        <Text>
          Page {currentPage} of{" "}
          {Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
        </Text>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(filteredData.length / ITEMS_PER_PAGE)
              )
            )
          }
          isDisabled={
            currentPage === Math.ceil(filteredData.length / ITEMS_PER_PAGE)
          }
        >
          Next
        </Button>
      </HStack>

      <SimpleGrid columns={5} spacing={4} mt={4}>
        {filteredData
          .slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
          )
          .map((loc, index) => (
            <Card>
              <CardBody pb={2}>
              <Text fontWeight="bold" fontSize="lg" mb={4} textAlign="center">
                  {loc.zca_on || "Unknown ZCA"}
                </Text>
                <Text textAlign="center">{loc.name || "Unknown Name"}</Text>
                <Box
                  border="1px solid"
                  borderColor="gray.300"
                  p={5}
                  mt={3}
                  mx="auto"
                  textAlign="center"
                  borderRadius="md"
                >
                  <Text fontSize="xl"  fontWeight="bold" >
                    {showPallet
                      ? `Pallet: ${loc.pallet || 0}`
                      : `Qty: ${loc.total_qty || 0}`}
                  </Text>
                </Box>
              </CardBody>
              <CardFooter pt={2}>
                <Button
                  size="md"
                  colorScheme="teal"
                  onClick={() => handleLocationClick(loc)}
                  w="100%"
                >
                  Location
                </Button>
              </CardFooter>
            </Card>



          ))}
      </SimpleGrid>

      {isModalOpen && (
        <StockLocationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          locationData={selectedLocation}
          selectedItem={selectedItem}
        />
      )}
    </Box>
  );
};

export default StockLocation;
