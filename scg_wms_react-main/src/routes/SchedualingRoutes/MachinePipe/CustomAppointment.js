import React from "react";
import { Box, Text, Flex, Badge, VStack, HStack } from "@chakra-ui/react";
import "./cus_app.css"; // Import the CSS file

const CustomAppointment = ({ data, selectedMachinesCount }) => {
  let typeBadge = null;
  if (data.appointmentData.type === "MTO") {
    typeBadge = <Badge colorScheme="green">MTO</Badge>;
  } else if (data.appointmentData.type === "Committed") {
    typeBadge = <Badge colorScheme="red">CMT</Badge>;
  }

  const getShiftBadge = (startDate) => {
    const hour = new Date(startDate).getHours();
    if (hour >= 8 && hour < 16) {
      return <Badge colorScheme="blue">Shift A</Badge>;
    } else if (hour >= 16 && hour < 24) {
      return <Badge colorScheme="purple">Shift B</Badge>;
    } else {
      return <Badge colorScheme="orange">Shift C</Badge>;
    }
  };
  console.log(selectedMachinesCount, "selectedMachinesCount");
  const dynamicFontSize =
    selectedMachinesCount === 1
      ? "l"
      : selectedMachinesCount === 2
      ? "md"
      : selectedMachinesCount >= 3
      ? "s"
      : "xs";

  return (

      <VStack
        align="start"
        spacing={2}
        width="100%"
        height="100%" // Ensure the appointment takes full height
        maxWidth="100%"
        overflow="hidden" // Prevent overflow issues
      >
        <HStack>
          {typeBadge}
          {console.log(data.appointmentData)}
          <Text
            fontWeight="bold"
            fontSize="s" // Dynamically change font size
            className="custom-appointment" /* This class allows text to wrap */
            maxWidth="100%"
            aria-label="Appointment Text"
          >
            {data.appointmentData.text}
          </Text>
        </HStack>
        <Text
          fontWeight="bold"
          fontSize={dynamicFontSize} // Dynamically change font size
          className="custom-appointment" /* This class allows text to wrap */
          maxWidth="100%"
          aria-label="Appointment Name"
        >
          {data.appointmentData.th_name}
        </Text>

          {data.appointmentData.ton && (
            <Badge
              marginRight="8px"
              aria-label={`TON: ${data.appointmentData.ton}`}
            >
              {`TON: ${data.appointmentData.ton}`}
            </Badge>
          )}
          {data.appointmentData.stk_frozen && (
            <Badge
              marginRight="8px"
              aria-label={`STK: ${data.appointmentData.stk_frozen}`}
            >
              {`STK: ${data.appointmentData.stk_frozen}`}
            </Badge>
          )}

        <HStack>{getShiftBadge(data.appointmentData.startDate)}</HStack>
        <HStack>
          <Badge
            variant="subtle"
            fontSize="xx-small"
            padding="2px 4px"
            colorScheme="green"
          >
            Plan by
          </Badge>
          <Text fontSize="sm" fontWeight="bold" aria-label="Planner Name">
            {data.appointmentData.planner}
          </Text>
        </HStack>

        <HStack>
          <Badge
            variant="subtle"
            fontSize="xx-small"
            padding="2px 4px"
            colorScheme="blue"
          >
            version
          </Badge>
          <Text fontSize="sm" fontWeight="bold" aria-label="Version">
            {data.appointmentData.versionno}
          </Text>
        </HStack>
      </VStack>

  );
};

export default CustomAppointment;
