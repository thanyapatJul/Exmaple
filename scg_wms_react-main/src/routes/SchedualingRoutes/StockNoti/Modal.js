import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Flex,
  Select,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import Flow from "../CheckWIP/Flow"; // Assuming Flow component is imported here
const ITEMS_PER_PAGE = 8;

const StockLocationModal = ({
  isOpen,
  onClose,
  selectedStockCode,
  locationData,
  selectedItem,
  hierarchy,
}) => {
  console.log(
    locationData,
    "locationData in modal",
    selectedItem,
    "selectedItem"
  );

  const [filteredData, setFilteredData] = useState(locationData || []);
  const [zoneFilter, setZoneFilter] = useState("");
  const [rowFilter, setRowFilter] = useState("");
  const [colFilter, setColFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const warehouses = [...new Set(locationData?.map((loc) => loc.warehouse))];
  const zones = [...new Set(locationData?.map((loc) => loc.zone))];

  useEffect(() => {
    if (isOpen) {
      setZoneFilter("");
      setWarehouseFilter("");
      setCurrentPage(0); // Reset to first page
    }
  }, [isOpen]);

  // Effect to filter the location data based on user input
  useEffect(() => {
    if (!locationData) return;

    const filtered = locationData.filter(
      (loc) =>
        (warehouseFilter === "" ||
          loc.warehouse === parseInt(warehouseFilter)) && // Warehouse filter
        (zoneFilter === "" || loc.zone === zoneFilter)
    );

    setFilteredData(filtered);
    setCurrentPage(0); // Reset to first page after filtering
  }, [warehouseFilter, zoneFilter, locationData]);

  // Calculate the paginated data
  const paginatedData = filteredData.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  // Handle page navigation
  const handleNextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < filteredData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {selectedItem
            ? `Details for ${selectedItem.code} : ${selectedItem.name}`
            : "No Item Selected"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedItem ? (
            <Tabs variant="enclosed">
              <TabList>
                {selectedItem?.child ? <Tab>Detail</Tab> : null}
                <Tab>Stock Location</Tab>
              </TabList>

              <TabPanels>
                {/* Conditionally render the "Detail" tab only if selectedItem has a child */}
                {selectedItem?.child && (
                  <TabPanel>
                    <Box height={500}>
                      <Flex direction="column" height="100%">
                        <Box flex={3}>
                          <Flow
                            chain={hierarchy}
                            selectedStockCode={selectedStockCode}
                          />
                        </Box>
                      </Flex>
                    </Box>
                  </TabPanel>
                )}

                {/* Always render the "Stock Location" tab */}
                <TabPanel>
                  {/* Filters */}
                  <VStack spacing={4} mb={4}>
                    <HStack spacing={4}>
                      <Box>
                        <Text fontWeight={"bold"}>Warehouse</Text>
                        <Select
                          placeholder="All Warehouses"
                          value={warehouseFilter}
                          onChange={(e) => setWarehouseFilter(e.target.value)}
                        >
                          {warehouses.map((warehouse, index) => (
                            <option key={index} value={warehouse}>
                              {warehouse}
                            </option>
                          ))}
                        </Select>
                      </Box>
                      <Box>
                        <Text fontWeight={"bold"}>Zone</Text>
                        <Select
                          placeholder="All Zones"
                          value={zoneFilter}
                          onChange={(e) => setZoneFilter(e.target.value)}
                        >
                          {zones.map((zone, index) => (
                            <option key={index} value={zone}>
                              {zone}
                            </option>
                          ))}
                        </Select>
                      </Box>
                    </HStack>
                  </VStack>

                  {/* Navigation Icons */}
                  <HStack justifyContent="space-between" mb={4}>
                    <IconButton
                      icon={<ArrowLeftIcon />}
                      onClick={handlePreviousPage}
                      isDisabled={currentPage === 0}
                    />
                    <Text>
                      Page {currentPage + 1} of{" "}
                      {Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                    </Text>
                    <IconButton
                      icon={<ArrowRightIcon />}
                      onClick={handleNextPage}
                      isDisabled={
                        (currentPage + 1) * ITEMS_PER_PAGE >=
                        filteredData.length
                      }
                    />
                  </HStack>

                  {/* Horizontal Stacking of Boxes */}
                  <SimpleGrid columns={4} spacing={4} w="100%">
                    {paginatedData.map((loc, locIndex) => (
                      <Box
                        key={locIndex}
                        mb={4}
                        p={4}
                        border="1px solid #ddd"
                        borderRadius="md"
                      >
                        <Text>Warehouse: {loc.warehouse}</Text>
                        <Text>Zone: {loc.zone}</Text>
                        <Text>Row: {loc.row}</Text>
                        <Text>Column: {loc.column}</Text>
                        <Text>Total Qty: {loc.total_qty}</Text>
                        <Text>Levels:</Text>
                        <SimpleGrid columns={3} spacing={2}>
                          {Object.entries(loc.levels).map(([level, qty]) => (
                            <Box
                              key={level}
                              p={2}
                              border="1px solid gray"
                              borderRadius="md"
                            >
                              <Text>Level {level}</Text>
                              <Text>{qty}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    ))}
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text>No item selected or available.</Text>
          )}
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

export default StockLocationModal;
