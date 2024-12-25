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
import React from "react";
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

import {
  Container,
  Icon,
  useColorModeValue,
  createIcon,
} from "@chakra-ui/react";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
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

import { Link as RouterLink } from "react-router-dom";

const HomePage = (props) => {
  return (
    <>
      <Flex position="absolute" bottom="0" right="0" m={5}>
          version 1.3
      </Flex>
      <Box>
        <Stack as={Box} textAlign={"center"} pt={10} pb={10}>
          <Box>
            <Center>

              <br />
            </Center>
            <Text
              fontWeight={600}
              fontSize={{ base: "xl", sm: "3xl", md: "4xl" }}
              as={"span"}
              color={"green.400"}
            >
              เลือกเครื่องจักรการผลิต
            </Text>
          </Box>
        </Stack>
        <Center px={5} pt={12}>
          <Stack
            direction={{ base: "column", xl: "row" }}
            spacing="100px"
            maxW={"1500px"}
            alignItems="flex-start"
          >
            <Box
              padding={6}
              border={"3px solid"}
              borderColor={useColorModeValue("gray.800", "gray.500")}
              rounded={"lg"}
              position="relative"
            >
              <Text
                fontSize="5xl"
                fontWeight="bold"
                color={useColorModeValue("gray.900", "gray.100")}
                position="absolute"
                top="-50px" // Adjust this value as needed to position the text
                left="30px" // Center the text horizontally
                rounded={"lg"}
                bgColor={useColorModeValue("#E6E7EC", "gray.800")}
                paddingX={2}
                transform={"none"}
                textAlign={"left"}
              >
                HS
              </Text>
              <Wrap spacing="20px" justify={"center"}>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS3"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS3
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS4"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS4
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS5"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS5
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS6"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS6
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS7"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS7
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS8"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS8
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./HS9"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    HS9
                  </Button>
                </WrapItem>
              </Wrap>
            </Box>

            <Box
              padding={6}
              border={"3px solid"}
              borderColor={useColorModeValue("gray.800", "gray.500")}
              rounded={"lg"}
              position="relative"
            >
              <Text
                fontSize="5xl"
                fontWeight="bold"
                color={useColorModeValue("gray.900", "gray.100")}
                position="absolute"
                top="-50px" // Adjust this value as needed to position the text
                left="30px" // Center the text horizontally
                rounded={"lg"}
                bgColor={useColorModeValue("#E6E7EC", "gray.800")}
                paddingX={2}
                transform={"none"}
                textAlign={"left"}
              >
                FM
              </Text>
              <Wrap spacing="20px" justify="center">
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./DET"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    DET
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./SD1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    SD1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./MS1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    MS1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./PL1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    PL1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./XY1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    XY1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./OC1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    OC1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./OC2"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    OC2
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./RT1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    RT1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./RT2"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    RT2
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CT1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CT1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CT2"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CT2
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CT3"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CT3
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CT4"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CT4
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./DP1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    DP1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./DP2"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    DP2
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./SEG"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    SEG
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./AS1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    AS1
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./OS1"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    OS1
                  </Button>
                </WrapItem>
              </Wrap>
            </Box>

            <Box
              padding={6}
              border={"3px solid"}
              borderColor={useColorModeValue("gray.800", "gray.500")}
              rounded={"lg"}
              position="relative"
            >
              <Text
                fontSize="5xl"
                fontWeight="bold"
                color={useColorModeValue("gray.900", "gray.100")}
                position="absolute"
                top="-50px" // Adjust this value as needed to position the text
                left="20px" // Center the text horizontally
                rounded={"lg"}
                bgColor={useColorModeValue("#E6E7EC", "gray.800")}
                paddingX={2}
                transform={"none"}
                textAlign={"left"}
              >
                CM/PK
              </Text>
              <Wrap spacing="20px" justify="center">
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CM5"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CM5
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CM6"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CM6
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CM7"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CM7
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./CM8"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    CM8
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./PK2"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    PK2
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./PK3"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    PK3
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./PK4"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    PK4
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./PK5"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    PK5
                  </Button>
                </WrapItem>
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./PK6"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    PK6
                  </Button>
                </WrapItem>
              </Wrap>
            </Box>

            <Box
              padding={6}
              border={"3px solid"}
              borderColor={useColorModeValue("gray.800", "gray.500")}
              rounded={"lg"}
              position="relative"
            >
              <Text
                fontSize="5xl"
                fontWeight="bold"
                color={useColorModeValue("gray.900", "gray.100")}
                position="absolute"
                top="-50px" // Adjust this value as needed to position the text
                left="20px" // Center the text horizontally
                rounded={"lg"}
                bgColor={useColorModeValue("#E6E7EC", "gray.800")}
                paddingX={2}
                transform={"none"}
                textAlign={"left"}
              >
                Lab
              </Text>
              <Wrap spacing="20px" justify="center">
                <WrapItem>
                  <Button
                    as={RouterLink}
                    to="./LAB"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                  >
                    LAB
                  </Button>
                </WrapItem>
              </Wrap>
            </Box>
          </Stack>
        </Center>
      </Box>
    </>
  );
};

export default HomePage;
