import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardBody,
  Box,
  HStack,
  Spinner,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Wrap,
  WrapItem,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  ButtonGroup,
  Checkbox,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  StatHelpText,
  StatArrow,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Text,
  AccordionIcon,
} from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";
import { Scheduler } from "@bitnoi.se/react-scheduler";
import "@bitnoi.se/react-scheduler/dist/style.css";
import Axios from "axios";
import ReactSelect from "react-select";
import Flow from "./Flow";
import ProductionLine from "../MachinePipe/Schedualer";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { RangeDatepicker } from "chakra-dayzed-datepicker";

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
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const DashboardOverview = () => {
  const { state } = useLocation();
  console.log(state, "state");
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Increase z-index value
      minWidth: "500px",
    }),
  };

  const [selectedTile, setSelectedTile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterButtonState, setFilterButtonState] = useState(0);
  const [schedulerData, setSchedulerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchItem, setSearchItem] = useState("");
  const [error, setError] = useState(null);
  const [options, setOptions] = useState([]);
  const [chain, setChain] = useState(null);
  const [machines, setMachines] = useState([]);
  const [refreshData, setRefreshData] = useState(false); // State to trigger data refresh
  const [colors, setColors] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI modal hooks
  const [zcaMachine, setzcaMachine] = useState([]);
  const [selectedTab, setSelectedTab] = useState([]);
  const [dateRange, setDateRange] = useState(getCurrentWeekRange()); // State for date range

  // Function to get the current week range
  function getCurrentWeekRange() {
    const currentDate = new Date();
    const firstDay = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );
    const lastDay = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
    );
    return [firstDay, lastDay];
  }

  // Recursive function to find last children in the chain
  const findLastChildren = (node, lastChildren = []) => {
    if (node.children.length === 0) {
      lastChildren.push(node.code);
    } else {
      node.children.forEach((child) => findLastChildren(child, lastChildren));
    }
    return lastChildren;
  };

  const fetchData = async (materialCode) => {
    try {
      setIsLoading(true);
      if (dateRange.length === 1) {
        setIsLoading(false);
        return; // Stop the fetch operation if dateRange length is 1
      }

      const [startDate, endDate] = dateRange;
      const response = await client.get("wms/api/get_Sche", {
        params: {
          zca: materialCode.value,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          planid: materialCode.planid,
        },
      });
      const data = response.data.data;
      const chainData = response.data.Chain_mat;
      const machinesData = response.data.Machines;

      setzcaMachine(machinesData);
      const uniqueMachines = [];
      Object.values(machinesData).forEach((hsList) => {
        hsList.forEach((hs) => {
          if (!uniqueMachines.includes(hs)) {
            uniqueMachines.push(hs);
          }
        });
      });

      setChain(chainData);
      setMachines(uniqueMachines);
      setIsLoading(false);

      const colorsArray = [
        "#77B0AA",
        "#135D66",
        "#86B6F6",
        "#B4D4FF",
        "#526D82",
        "#9DB2BF",
        "#8294C4",
        "#144272",
        "#205295",
        "#2C74B3",
        "#F0A8D0",
        "#F7B5CA",
        "#B692C2",
        "#C75B7A",
        "#921A40",
        "#694F8E",
        "#B692C2",
        "#0A6847",
        "#7ABA78",
        "#87A922",
        "#90D26D",
        "#A5DD9B",
      ];
      const assignedColors = {};
      let colorIndex = 0;

      const getColorForCode = (code, stock) => {
        if (stock < 0) {
          return "#C80036";
        }
        if (!assignedColors[code]) {
          assignedColors[code] = colorsArray[colorIndex % colorsArray.length];
          colorIndex += 1;
        }
        return assignedColors[code];
      };

      const generateSVGIcon = (color, text = "") => {
        const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="${color}">
            <circle cx="20" cy="20" r="30" />

        </svg>`;

        // Encode the SVG as a data URL
        const encodedSvg = encodeURIComponent(svgString)
          .replace(/'/g, "%27")
          .replace(/"/g, "%22");
        return `data:image/svg+xml,${encodedSvg}`;
      };

      // Get all last children codes
      const lastChildrenCodes = findLastChildren(chainData);

      const groupedData = data.reduce((acc, item) => {
        const { code, date_start, date_end, stock, frozen, actual } = item;
        const idBase = `${code}`;
        const bgColor = getColorForCode(code, stock);

        // Get the list of machines that match the zca code
        const matchingMachines = machinesData[code] || [];
        const machinesSubtitle = matchingMachines.join(", ");
        const svgIcon = generateSVGIcon(bgColor);

        if (!acc[idBase + "Frozen"]) {
          acc[idBase + "Frozen"] = {
            id: idBase + "Frozen",
            label: {
              icon: svgIcon,
              title: code,
              subtitle: `Frozen: ${machinesSubtitle}`,
            },
            data: [],
          };
        }

        if (!acc[idBase + "Act"]) {
          acc[idBase + "Act"] = {
            id: idBase + "Act",
            label: {
              icon: svgIcon,
              title: code,
              subtitle: `Actual: ${machinesSubtitle}`,
            },
            data: [],
          };
        }

        if (!lastChildrenCodes.includes(code)) {
          if (!acc[idBase + "Stock"]) {
            acc[idBase + "Stock"] = {
              id: idBase + "Stock",
              label: {
                icon: svgIcon,
                title: code,
                subtitle: `Stock: ${machinesSubtitle}`,
              },
              data: [],
            };
          }
        }
        if (actual !== 0) {
          acc[idBase + "Act"].data.push({
            id: `${code}-actual-${date_start}`,
            startDate: new Date(date_start),
            endDate: new Date(date_start),
            occupancy: stock,
            title: "Actual",
            subtitle: `${actual}`,
            description: "",
            bgColor: bgColor,
          });
        }

        if (frozen !== 0) {
          acc[idBase + "Frozen"].data.push({
            id: `${code}-frozen-${date_start}`,
            startDate: new Date(date_start),
            endDate: new Date(date_start),
            occupancy: stock,
            title: "Frozen",
            subtitle: `${frozen}`,
            description: "",
            bgColor: bgColor,
          });
        }

        if (stock !== 0 && !lastChildrenCodes.includes(code)) {
          acc[idBase + "Stock"].data.push({
            id: `${code}-stock-${date_start}`,
            startDate: new Date(date_start),
            endDate: new Date(date_end),
            occupancy: stock,
            title: "Stock",
            subtitle: `${stock}`,
            description: "",
            bgColor: bgColor,
          });
        }

        return acc;
      }, {});

      const transformedData = Object.values(groupedData);
      setSchedulerData(transformedData);
      setColors(assignedColors); // Set colors for use in ProductionLine
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
      setIsLoading(false);
    }
  };

  const fetchCardsData = async () => {
    try {
      const response = await client.get("wms/api/get_machine");
      if (response.data.success) {
        const machinesData = response.data.data;
        const uniqueMachines = [];
        Object.values(machinesData).forEach((hsList) => {
          hsList.forEach((hs) => {
            if (!uniqueMachines.includes(hs)) {
              uniqueMachines.push(hs);
            }
          });
        });
        setMachines(uniqueMachines);
      } else {
        setMachines([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMachines([]);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await client.get("wms/api/get_options");
        if (response.data.success) {
          setOptions(response.data.options);
        } else {
          console.error("Failed to fetch options:", response.data.error);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching options:", error);
        setIsLoading(false);
      }
    };

    fetchOptions();
    fetchCardsData();
  }, []);

  useEffect(() => {
    // Listen for incoming postMessage events
    const handleMessage = (event) => {
      // Ensure the message comes from the same origin
      if (event.origin !== window.location.origin) return;

      const { uniqueName } = event.data;
      if (uniqueName) {
        const selectedOption = options.find(
          (option) => option.value === uniqueName
        );
        if (selectedOption) {
          setSearchItem(selectedOption); // Set the item to trigger data fetching
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [options]); // Re-run this effect when 'options' changes

  useEffect(() => {
    if (searchItem) {
      fetchData(searchItem);
    } else {
      fetchCardsData();
    }
  }, [searchItem, refreshData, dateRange]); // Added refreshData and dateRange as dependencies

  const handleSelectChange = (selectedOption) => {
    setSearchItem(selectedOption);
  };

  const handlePlanPosted = () => {
    setRefreshData(!refreshData); // Toggle the refreshData state to trigger useEffect
  };

  const renderModalContent = () => {
    if (selectedTile) {
      const zca = selectedTile.id.split("-")[0]; // Extract the first part of the id
      return (
        <>
          <p>
            <strong>ZCA:</strong> {zca}
          </p>
          <p>
            <strong>Type:</strong> {selectedTile.title}
          </p>
          <p>
            <strong>Value:</strong> {selectedTile.subtitle}
          </p>
        </>
      );
    }
    return null;
  };

  const toggleMachineSelection = (machine) => {
    setSelectedTab((prevSelected) => {
      if (prevSelected.includes(machine)) {
        return prevSelected.filter((m) => m !== machine);
      } else {
        return [...prevSelected, machine];
      }
    });
  };

  return (
    <>
      <Flex position="absolute" bottom="0" right="0" m={5}>
        version 1.3
      </Flex>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        marginBottom="22px"
      >
        <Card marginStart="" boxShadow={"lg"} marginBottom={"0"} width="1100px">
          <CardBody>
            <HStack spacing="20px">
              <p>Select ZCA</p>
              <Box width="500px" marginRight="20px">
                <ReactSelect
                  value={searchItem}
                  options={options}
                  onChange={handleSelectChange}
                  styles={customStyles}
                  placeholder="Select material code"
                  isClearable
                />
              </Box>

              {/* <p>Select Range</p>
              <Box width="230px">
                <RangeDatepicker
                  selectedDates={dateRange} // Note the property name change to selectedDates
                  onDateChange={(value) => setDateRange(value)} // Property name change to onDateChange
                />
              </Box> */}
            </HStack>
          </CardBody>
        </Card>
      </Box>

      <Accordion allowToggle marginBottom="20px" bg="white" borderRadius="20">
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <Text fontWeight="500">Flow Diagram</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} bg="white">
            <Box height="500px">
              {isLoading ? (
                <Spinner size="xl" />
              ) : searchItem ? ( // Check if searchItem is present
                <Flow
                  chain={chain}
                  selectedStockCode={searchItem}
                  zcaMachine={zcaMachine}
                />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  color="gray"
                  fontSize="lg"
                >
                  Please select a stock code to display data.
                </Box>
              )}
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* <Box>
        <Card height="900px" marginBottom={"10"}>
          <CardBody>
            {isLoading ? (
              <Spinner size="xl" />
            ) : error ? (
              <Box color="red.500">{error}</Box>
            ) : (
              <section>
                <Scheduler
                  data={schedulerData}
                  isLoading={isLoading}
                  onFilterData={() => {
                    setFilterButtonState(1);
                  }}
                  onClearFilterData={() => {
                    setFilterButtonState(0);
                  }}
                  config={{
                    zoom: 1,
                    showTooltip: false,
                    showThemeToggle: true,
                    filterButtonState,
                  }}
                  onTileClick={handleTileClick}
                  showTooltip={false}
                />
              </section>
            )}
          </CardBody>
        </Card>
      </Box> */}

      <Box>
        <Card boxShadow={"lg"} marginBottom={"10"}>
          <CardBody>
            <Wrap spacing={4}>
              {machines.map((machine, index) => (
                <WrapItem key={index}>
                  <Button
                    variant={
                      selectedTab.includes(machine) ? "solid" : "outline"
                    }
                    colorScheme={
                      selectedTab.includes(machine) ? "teal" : "gray"
                    }
                    onClick={() => toggleMachineSelection(machine)} // Toggle machine selection
                  >
                    {machine}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>

            <ProductionLine
              machines={machines}
              onPlanPosted={handlePlanPosted}
              colors={colors}
              selectedTab={selectedTab} // Pass the selected machines to ProductionLine
            />
          </CardBody>
        </Card>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedTile?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{renderModalContent()}</ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DashboardOverview;
