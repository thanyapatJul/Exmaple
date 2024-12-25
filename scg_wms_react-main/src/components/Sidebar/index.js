import React, { useState, useEffect } from "react";
import { ColorModeSwitcher } from "../../ColorModeSwitcher";
import { RiProfileLine } from "react-icons/ri";
import { useMediaQuery } from "@chakra-ui/react";
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Spacer,
} from "@chakra-ui/react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import {
  IconButton,
  Avatar,
  Box,
  Button,
  CloseButton,
  Flex,
  Stack,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  Portal,
  MenuDivider,
  MenuItem,
  MenuList,
  Select,
  Image,
  Center,
} from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Divider } from "@chakra-ui/react";

import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiGrid,
  FiFileText,
  FiMap,
  FiTruck,
  FiUserCheck,
  FiInbox,
  FiShoppingCart,
} from "react-icons/fi";

import { MdCheckCircle, MdSettings } from "react-icons/md";
import { BsBoxes } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";

import { Badge } from "@chakra-ui/react";

import { BiChevronRight } from "react-icons/bi";

import {
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
} from "@chakra-ui/react";

import { IconType } from "react-icons";
import { Link, useLocation } from "react-router-dom";
import Axios from "axios";
import Cookies from "js-cookie";
import Clock from "react-live-clock";
import moment from "moment";
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

const SidebarContent = ({
  onClose,
  linkItems,
  isCollapsed,
  setIsCollapsed,
  ...rest
}) => {
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const textColor = useColorModeValue("gray.800", "gray.200");
  return (
    <Box
      transition="0.3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      borderRadius="lg"
      w={isCollapsed ? "80px" : { base: "full", xl: "240px" }}
      pos="fixed"
      h="calc(100% - 20px)"
      mt="10px"
      mb="10px"
      // ml="10px"
      overflowX="hidden"
      overflowY="auto"
      zIndex={11000}
      display="flex"
      flexDirection="column"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="5" justifyContent="space-between">
        <HStack>
          <Image
            src="/img/logo.svg"
            alt="Logo"
            boxSize="35px"
            borderRadius="md"
          />
          {!isCollapsed && (
            <Text
              fontSize="md"
              fontFamily="monospace"
              fontWeight="bold"
              color={textColor}
            >
              FutureForce
            </Text>
          )}
        </HStack>
        <IconButton
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
        />
        <CloseButton display={{ base: "flex", xl: "none" }} onClick={onClose} />
      </Flex>
      <Accordion allowToggle>
        {linkItems.map((link) => {
          if (link.list_menu) {
            return (
              <NavItemMenu
                onClose={onClose}
                linkDetail={link}
                key={link.name}
                isCollapsed={isCollapsed}
              />
            );
          } else {
            return (
              <Link
                to={link.link_to}
                key={link.name}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <NavItem
                  onClose={onClose}
                  to={link.link_to}
                  icon={link.icon}
                  isCollapsed={isCollapsed}
                >
                  {link.name}
                </NavItem>
              </Link>
            );
          }
        })}
      </Accordion>
      <Box flex="1" />{" "}
      <Box
        position="absolute"
        bottom={5}
        w={isCollapsed ? "80px" : "full"} // Set fixed width in collapsed state
        px={4}
        display="flex"
        flexDirection="column"
        alignItems={isCollapsed ? "center" : "flex-start"}
      >
        <Divider mb="2" />
        <Menu>
          <MenuButton
            py={2}
            transition="all 0.3s"
            _focus={{ boxShadow: "none" }}
          >
            <HStack spacing={isCollapsed ? "0" : "4"}>
              <Avatar
                size={"sm"}
                src={process.env.PUBLIC_URL + "/img/engineer.png"}
              />
              {!isCollapsed && (
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <HStack>
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
                    ) : localStorage.getItem("role_name") === "Plantco" ? (
                      <Tag
                        colorScheme="teal"
                        size={"sm"}
                        variant={"solid"}
                        borderRadius={"md"}
                      >
                        PlantCo
                      </Tag>
                    ) : localStorage.getItem("role_name") === "Lab" ? (
                      <Tag size={"sm"} variant={"solid"} borderRadius={"md"}>
                        Lab
                      </Tag>
                    ) : localStorage.getItem("role_name") === "SCM" ? (
                      <Tag
                        colorScheme="blue"
                        size={"sm"}
                        variant={"solid"}
                        borderRadius={"md"}
                      >
                        SCM
                      </Tag>
                    ) : (
                      <Tag colorScheme="gray">Unknown</Tag>
                    )}
                  </HStack>
                  <Text fontSize="sm" isTruncated color={textColor}>
                    {localStorage.getItem("first_name")}{" "}
                    {localStorage.getItem("last_name")}{" "}
                  </Text>
                  <Badge size="xs">
                    {" "}
                    {localStorage.getItem("employee_id")}
                  </Badge>
                </VStack>
              )}
            </HStack>
          </MenuButton>
          <Portal>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
              zIndex={9999} // Make sure the dropdown stays on top
              maxHeight="200px" // Control height to avoid overflowing
              overflowY="auto" // Allow scrolling for long lists
              // Adjust the left position dynamically based on whether the sidebar is collapsed
              left={isCollapsed ? "60px" : "230px"} // Move menu to the right based on the sidebar width
              top="-60px" // Adjust the vertical position to align with the avatar
              position="absolute" // Ensure the dropdown is positioned correctly
            >
              <MenuItem
                onClick={handleLogout}
                color={"red"}
                icon={<FiLogOut />}
              >
                ออกจากระบบ
              </MenuItem>
            </MenuList>
          </Portal>
        </Menu>
      </Box>
    </Box>
  );
};

const NavItem = ({ icon, children, onClose, to, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeBg =
    "linear-gradient(90deg, #0E4397 0%, #0C3A81 0%, #08285A 29%, #08285A 81%)";
  const hoverBg = activeBg; // Same gradient for hover and active
  const textColor = useColorModeValue("gray.800", "gray.200");
  return (
    <Box
      onClick={onClose}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      w="full"
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : "transparent"}
        color={isActive ? "white" : "inherit"}
        _hover={{
          bg: hoverBg,
          color: "white",
        }}
      >
        {icon && (
          <Icon
            mr={isCollapsed ? 0 : 4}
            fontSize="16"
            color={isActive ? "white" : textColor}
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
        )}
        {!isCollapsed && (
          <Text
            color={isActive ? "white" : textColor}
            _groupHover={{ color: "white" }}
            align="left"
          >
            {children}
          </Text>
        )}
      </Flex>
    </Box>
  );
};

// Menu
const NavItemMenu = ({ onClose, linkDetail, isCollapsed }) => {
  const location = useLocation();
  const isActive = linkDetail.list_menu.some(
    (link) => link.link_to === location.pathname
  );
  const textColor = useColorModeValue("gray.800", "gray.200");

  return (
    <AccordionItem border="none">
      <AccordionButton p="0" m="0" _hover={"none"}>
        <Box
          style={{ textDecoration: "none" }}
          _focus={{ boxShadow: "none" }}
          w={"100%"}
        >
          <Flex
            align="center"
            p="4"
            py="5"
            ps="4"
            mx="4"
            my="1"
            borderRadius={"lg"}
            role="group"
            cursor="pointer"
            bgGradient={
              isActive
                ? "linear-gradient(90deg, #0E4397 0%, #0C3A81 0%, #08285A 29%, #08285A 81%)"
                : "transparent"
            }
            color={isActive ? "white" : "inherit"}
            _hover={{
              bgGradient:
                "linear-gradient(90deg, #0E4397 0%, #0C3A81 0%, #08285A 29%, #08285A 81%)",
              color: "white",
            }}
          >
            {linkDetail.icon && (
              <Icon
                mr="4"
                fontSize="16"
                color={isActive ? "white" : textColor}
                _groupHover={{
                  color: "white",
                }}
                as={linkDetail.icon}
              />
            )}
            {!isCollapsed && (
              <Text
                color={isActive ? "white" : textColor}
                _groupHover={{ color: "white" }}
                align="left"
              >
                {linkDetail.name}
              </Text>
            )}
            <Spacer />
          </Flex>
        </Box>
      </AccordionButton>

      <AccordionPanel m="0" p="0" pb={4}>
        <Center>
          <Divider mx="5" />
        </Center>
        {linkDetail.list_menu.map((link_in) => (
          <Link to={link_in.link_to} key={link_in.name}>
            <NavItemMenuList
              onClose={onClose}
              to={link_in.link_to}
              icon={link_in.icon}
            >
              {!isCollapsed && link_in.name}
            </NavItemMenuList>
          </Link>
        ))}
        <Center>
          <Divider mx="5" />
        </Center>
      </AccordionPanel>
    </AccordionItem>
  );
};

// ลูกย่อย
const NavItemMenuList = ({ icon, onClose, children, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === rest.to;
  const textColor = useColorModeValue("gray.800", "gray.200");

  return (
    <Box
      onClick={onClose}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        py="2"
        ps="4"
        mx="4"
        my="1"
        ml="6"
        borderRadius={"lg"}
        role="group"
        cursor="pointer"
        bgGradient={
          isActive
            ? "linear-gradient(90deg, #0E4397 0%, #0C3A81 0%, #08285A 29%, #08285A 81%)"
            : "transparent"
        }
        color={isActive ? "white" : "inherit"}
        _hover={{
          bgGradient:
            "linear-gradient(90deg, #0E4397 0%, #0C3A81 0%, #08285A 29%, #08285A 81%)",
          color: "white",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
        )}
        <Text
          color={isActive ? "white" : textColor}
          _groupHover={{ color: "white" }}
        >
          {children}
        </Text>
      </Flex>
    </Box>
  );
};

const TimeNav = ({ onOpen, isCollapsed, ...rest }) => {
  const [currentMoment, setCurrentMoment] = useState(moment());
  const [weekNum, setWeekNum] = useState(null); // Add state for the week number
  const textColor = useColorModeValue("gray.800", "gray.200");
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMoment(moment());
    }, 1000);

    // Fetch the week number when component mounts

    return () => clearInterval(intervalId);
  }, [currentMoment]); // Add currentMoment as a dependency so it updates the week num as time changes

  useEffect(() => {
    getWeeknum(currentMoment); // Call it just once on mount
  }, []);

  const getWeeknum = async (time) => {
    const formattedDate = moment(time).format("YYYY-MM-DD");
    try {
      const response = await client.get(`wms/api/getweek`, {
        params: {
          date: formattedDate, // Pass the formatted date as a query parameter
        },
      });
      console.log(response.data);
      setWeekNum(response.data.week_number); // Set the response data (week number) in the state
    } catch (error) {
      console.error("Error sending date to backend:", error);
      setWeekNum(null); // Set a default value in case of error
    }
  };

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
    <Flex
      px={{ base: 2, xl: 3 }}
      height="14"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      transition="margin 0.3s ease"
      justifyContent={{ base: "space-between", xl: "flex-end" }}
      {...rest}
    >
      <HStack spacing={{ base: "0", xl: "6" }}>
        <VStack spacing={0.5}>
          <HStack>
            <Text color={textColor}>วันที่</Text>
            <Tag colorScheme="gray">
              <Clock
                format={"DD/MM/YYYY"}
                ticking={true}
                timezone={"Asia/Bangkok"}
              />
            </Tag>
            <Text color={textColor}> Week</Text>
            <Tag colorScheme="gray">{weekNum}</Tag>
            <Text color={textColor}>เวลา</Text>
            <Tag colorScheme="gray">
              <Clock
                format={"HH:mm:ss"}
                ticking={true}
                timezone={"Asia/Bangkok"}
              />
            </Tag>
            <Text color={textColor}>กะ</Text>
            <Tag colorScheme="gray">{getTimeSlot(currentMoment)}</Tag>
          </HStack>
        </VStack>
        <ColorModeSwitcher justifySelf="flex-end" />
      </HStack>
    </Flex>
  );
};

const MobileNav = ({ onOpen, isCollapsed, ...rest }) => {
  const [currentMoment, setCurrentMoment] = useState(moment());
  const [weekNum, setWeekNum] = useState(null); // Add state for the week number
  const textColor = useColorModeValue("gray.800", "gray.200");
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMoment(moment());
    }, 1000);

    // Fetch the week number when component mounts

    return () => clearInterval(intervalId);
  }, [currentMoment]); // Add currentMoment as a dependency so it updates the week num as time changes

  useEffect(() => {
    getWeeknum(currentMoment); // Call it just once on mount
  }, []);

  const getWeeknum = async (time) => {
    const formattedDate = moment(time).format("YYYY-MM-DD");
    try {
      const response = await client.get(`wms/api/getweek`, {
        params: {
          date: formattedDate, // Pass the formatted date as a query parameter
        },
      });
      console.log(response.data);
      setWeekNum(response.data.week_number); // Set the response data (week number) in the state
    } catch (error) {
      console.error("Error sending date to backend:", error);
      setWeekNum(null); // Set a default value in case of error
    }
  };

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
    <Flex
      ml={{ base: 0, xl: isCollapsed ? 20 : 60 }}
      px={{ base: 2, xl: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      transition="margin 0.3s ease"
      justifyContent={{ base: "space-between", xl: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", xl: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <HStack>
        <Image
          src="/img/logo.svg"
          alt="Logo"
          boxSize="35px"
          display={{ base: "flex", xl: "none" }}
        />
        <Text
          display={{ base: "flex", xl: "none" }}
          fontSize="2xl"
          fontFamily="monospace"
          fontWeight="bold"
          color={textColor}
        >
          FutureForce
        </Text>
      </HStack>

      <HStack spacing={{ base: "0", xl: "6" }}>
        <VStack spacing={0.5}>
          <HStack>
            <Text color={textColor}>วันที่</Text>
            <Tag colorScheme="gray">
              <Clock
                format={"DD/MM/YYYY"}
                ticking={true}
                timezone={"Asia/Bangkok"}
              />
            </Tag>
            <Text color={textColor}>Week</Text>
            <Tag colorScheme="gray">{weekNum}</Tag>
          </HStack>
          <HStack>
            <Tag colorScheme="gray">
              <Clock
                format={"HH:mm:ss"}
                ticking={true}
                timezone={"Asia/Bangkok"}
              />
            </Tag>
            <Text color={textColor}>กะ</Text>
            <Tag colorScheme="gray">{getTimeSlot(currentMoment)}</Tag>
          </HStack>
        </VStack>
        <ColorModeSwitcher justifySelf="flex-end" />
        <Flex alignItems={"center"}>
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
                    ) : localStorage.getItem("role_name") === "PlantCo" ? (
                      <Tag
                        colorScheme="teal"
                        size={"sm"}
                        variant={"solid"}
                        borderRadius={"md"}
                      >
                        Planner
                      </Tag>
                    ) : localStorage.getItem("role_name") === "Lab" ? (
                      <Tag size={"sm"} variant={"solid"} borderRadius={"md"}>
                        Lab
                      </Tag>
                    ) : localStorage.getItem("role_name") === "SCM" ? (
                      <Tag
                        colorScheme="blue"
                        size={"sm"}
                        variant={"solid"}
                        borderRadius={"md"}
                      >
                        SCM
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
              <MenuItem onClick={handleLogout} icon={<RiProfileLine />}>
                Profile
              </MenuItem>

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
      </HStack>
    </Flex>
  );
};

const SidebarWithHeader = ({ linkItems, children }) => {
  const [isMobile] = useMediaQuery("(max-width: 1280px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [marginLeft, setMarginLeft] = useState("240px");

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    setMarginLeft(isCollapsed ? "100px" : "240px");
  }, [isCollapsed]);

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", xl: "block" }}
        linkItems={linkItems}
        isCollapsed={isCollapsed}
        setIsCollapsed={handleToggleCollapse}
      />

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="md"
      >
        <DrawerContent zIndex={10000}>
          <SidebarContent
            onClose={onClose}
            linkItems={linkItems}
            isCollapsed={isCollapsed}
            setIsCollapsed={handleToggleCollapse}
          />
        </DrawerContent>
      </Drawer>

      {isMobile ? (
        <MobileNav onOpen={onOpen} isCollapsed={isCollapsed} />
      ) : (
        <TimeNav onOpen={onOpen} isCollapsed={isCollapsed} />
      )}

      <Box ml={{ base: 0, xl: marginLeft }} transition="margin 0.3s ease" p="4">
        {children}
      </Box>
    </Box>
  );
};

export default SidebarWithHeader;
