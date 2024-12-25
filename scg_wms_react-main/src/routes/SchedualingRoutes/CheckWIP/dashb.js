import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";

const MultiSelectTabs = ({ machines, onTabSelectionChange }) => {
  const [selectedTabs, setSelectedTabs] = useState(["all"]);

  const handleTabClick = (tab) => {
    setSelectedTabs((prevSelectedTabs) => {
      if (prevSelectedTabs.includes(tab)) {
        // If the tab is already selected, deselect it
        return prevSelectedTabs.filter((selectedTab) => selectedTab !== tab);
      } else {
        // Otherwise, add the tab to the selection
        return [...prevSelectedTabs, tab];
      }
    });
  };

  const isTabSelected = (tab) => selectedTabs.includes(tab);

  // Notify parent component of the selected tabs
  useEffect(() => {
    onTabSelectionChange(selectedTabs);
  }, [selectedTabs, onTabSelectionChange]);

  return (
    <Tabs variant="enclosed">
      <TabList>
        <Tab
          onClick={() => handleTabClick("all")}
          isSelected={isTabSelected("all")}
        >
          {isTabSelected("all") && <Badge colorScheme="green" mr="1">Selected</Badge>}
          All Machines
        </Tab>
        {machines.map((machine, index) => (
          <Tab
            key={index}
            onClick={() => handleTabClick(machine)}
            isSelected={isTabSelected(machine)}
          >
            {isTabSelected(machine) && <Badge colorScheme="green" mr="1">Selected</Badge>}
            {machine}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {/* You can render content for selected tabs here */}
        <TabPanel>{/* Content for All Machines */}</TabPanel>
        {machines.map((machine, index) => (
          <TabPanel key={index}>
            {/* Content for each Machine */}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};

export default MultiSelectTabs;
