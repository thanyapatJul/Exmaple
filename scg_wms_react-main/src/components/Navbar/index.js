import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  HStack,
  VStack,
  Container,
  Heading,
  Image,
} from "@chakra-ui/react";
import {FiChevronDown,} from "react-icons/fi";




import {
  Tag,
} from "@chakra-ui/react";


import { FiLogOut } from "react-icons/fi";

import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { ColorModeSwitcher } from "../../ColorModeSwitcher";
import { Link } from "react-router-dom";

import Clock from "react-live-clock";
import moment from "moment";

import Axios from "axios";
import Cookies from "js-cookie";
const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;

const handleLogout = async () => {
  try {
    const response = await client.get("wms/api/logout");
  } catch (error) {
    console.error("Error checking session:", error);
  }

  // Clear cookies
  const cookies = Cookies.get();
  for (const cookieName in cookies) {
    Cookies.remove(cookieName);
  }
  localStorage.clear();
  window.location.href = "/login";
};

const NavLink = (props) => {
  const { children } = props;
  return (
    <Box
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.400", "gray.300"),
      }}
      bgColor={useColorModeValue("gray.300", "gray.700")}
      href={"#"}
      textAlign={"center"}
    >
      {children}
    </Box>
  );
};

const Navbar = ({ alllink }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentMoment, setCurrentMoment] = useState(moment());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMoment(moment());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getTimeSlot = (time) => {
    const hour = time.hour();
    if (hour >= 0 && hour < 8) {
      return "C";
    } else if (hour >= 8 && hour < 16) {
      return "A";
    } else {
      return "B";
    }
  };
  return (
    <>
      <Box
        boxShadow={"sm"}
        style={{ backdropFilter: "blur(5px)" }}
        px={10}
        position="sticky"
        top={0}
        zIndex={50}
        bgColor={useColorModeValue("", "gray.800")}
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ lg: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <HStack>
                <Image
                  src="/img/Bifrost_logo.svg"
                  alt="Logo"
                  boxSize="40px"
                  filter={useColorModeValue(
                    "none",
                    "invert(100%) brightness(200%)"
                  )}
                />
                <Heading
                  as="h1"
                  fontSize={{ base: "2xl", sm: "3xl" }}
                  bgGradient="linear(to-l, #7928CA,#FF0080)"
                  bgClip="text"
                  fontFamily="monospace"
                  fontWeight="bold"
                  _focus={{ boxShadow: "none", outline: "none" }}
                  _hover={{
                    textDecoration: "none",
                    bgGradient: "linear(to-r, red.500, yellow.500)",
                    transition: "background 2.2s",
                  }}
                >
                  Bifröst
                </Heading>
              </HStack>
            </Box>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", lg: "flex" }}
            >
              {alllink.map((link) => (
                <Link to={link.link_to} key={link.name}>
                  <Text fontSize={{ base: "sm", "2xl": "lg" }}>
                    <NavLink>{link.name}</NavLink>
                  </Text>
                </Link>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <VStack
              spacing={0.5}
              display={{ base: "none", lg: "flex" }}
              fontSize={"sm"}
            >
              <HStack>
                <Text>วันที่</Text>
                <Tag colorScheme="gray">
                  <Clock
                    format={"DD/MM/YYYY"}
                    ticking={true}
                    timezone={"Asia/Bangkok"}
                  />
                </Tag>
              </HStack>
              <HStack>
                <Tag colorScheme="gray">
                  <Clock
                    format={"HH:mm:ss"}
                    ticking={true}
                    timezone={"Asia/Bangkok"}
                  />
                </Tag>
                <Text>กะ</Text>
                <Tag colorScheme="gray">{getTimeSlot(currentMoment)}</Tag>
              </HStack>
            </VStack>
            <ColorModeSwitcher justifySelf="flex-end" />
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: "none" }}
              >
                <HStack>
                  <Avatar
                    size={"sm"}
                    src={process.env.PUBLIC_URL + "/img/engineer.png"}
                    filter={useColorModeValue(
                      "none",
                      "invert(100%) brightness(200%)"
                    )}
                  />
                  <VStack
                    display={{ base: "none", md: "flex" }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm" isTruncated>
                      {localStorage.getItem("first_name")}{" "}
                      {localStorage.getItem("last_name")} :{" "}
                      {localStorage.getItem("employee_id")}
                    </Text>
                    <HStack>
                      <Text fontSize="xs" color="gray.600">
                        Role:
                      </Text>
                      {localStorage.getItem("role_name") === "Admin" ? (
                        <Tag
                          colorScheme="purple"
                          size={"sm"}
                          variant={"solid"}
                          borderRadius={"md"}
                        >
                          Admin
                        </Tag>
                      ) : localStorage.getItem("role_name") === "Planner" ? (
                        <Tag
                          colorScheme="orange"
                          size={"sm"}
                          variant={"solid"}
                          borderRadius={"md"}
                        >
                          Planner
                        </Tag>
                      ) : localStorage.getItem("role_name") === "Production" ? (
                        <Tag
                          colorScheme="yellow"
                          size={"sm"}
                          variant={"solid"}
                          borderRadius={"md"}
                        >
                          Production
                        </Tag>
                      ) : localStorage.getItem("role_name") === "Forklift" ? (
                        <Tag
                          colorScheme="gray"
                          size={"sm"}
                          variant={"solid"}
                          borderRadius={"md"}
                        >
                          Forklift
                        </Tag>
                      ) : localStorage.getItem("role_name") === "Manager" ? (
                        <Tag
                          colorScheme="red"
                          size={"sm"}
                          variant={"solid"}
                          borderRadius={"md"}
                        >
                          Manager
                        </Tag>
                      ) : localStorage.getItem("role_name") === "PIS" ? (
                        <Tag
                          colorScheme="blue"
                          size={"sm"}
                          variant={"solid"}
                          borderRadius={"md"}
                        >
                          PIS
                        </Tag>
                      ) : (
                        <Tag colorScheme="gray">Unknown</Tag>
                      )}
                    </HStack>
                  </VStack>
                  <Box display={{ base: "none", md: "flex" }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue("white", "gray.900")}
                borderColor={useColorModeValue("gray.200", "gray.700")}
              >
                <MenuItem
                  onClick={handleLogout}
                  color={"red"}
                  icon={<FiLogOut />}
                >
                  ออกจากระบบ
                </MenuItem>
                
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
        {isOpen ? (
          <Box pb={4} display={{ lg: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {alllink.map((link) => (
                <Link to={link.link_to} key={link.name}>
                  <Text fontSize={{ base: "sm", "2xl": "md" }}>
                    <NavLink>{link.name}</NavLink>
                  </Text>
                </Link>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default Navbar;
