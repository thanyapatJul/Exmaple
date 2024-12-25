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
import React, { useState } from "react";
import { FormControl, FormLabel, Input, VStack } from "@chakra-ui/react";
import { Grid as CGrid, GridItem as CGridItem } from "@chakra-ui/react";
import { Wrap, WrapItem } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import { HStack } from "@chakra-ui/react";
import { SimpleGrid } from "@chakra-ui/react";
import { AbsoluteCenter } from "@chakra-ui/react";
import { CloseButton } from "@chakra-ui/react";
import { Flex, Spacer } from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/react";
import { Select, useColorModeValue } from "@chakra-ui/react";
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from "@chakra-ui/react";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";

import { useTable } from "react-table";

import { WarningTwoIcon } from "@chakra-ui/icons";
import { CloseIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link } from "react-router-dom";
const HomePage = () => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColorDefault = useColorModeValue("gray.100", "gray.800");
  const bgColorPVP = useColorModeValue("white", "#28303E");
  return (
    <>
      <Box textAlign="center" py={10} px={6}>
        <Box display="inline-block">
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bg={"red.500"}
            rounded={"50px"}
            w={"55px"}
            h={"55px"}
            fontSize="4xl" // Increased font size here
            textAlign="center"
          >
            😵
          </Flex>
        </Box>
        <Heading as="h2" size="xl" mt={6} mb={2} color={textColor}>
          ไม่พบหน้าเพจ !
        </Heading>
        <HStack spacing={2} justifyContent="center">
          <Text color={"gray.500"}>หน้าที่ค้นหาไม่มีอยู่ในระบบ</Text>
          <ChakraLink as={Link} to="/" color="blue.500" fontWeight="bold">
            คลิ๊กเพื่อกลับสู่หน้าหลัก
          </ChakraLink>
        </HStack>
      </Box>
    </>
  );
};

export default HomePage;
