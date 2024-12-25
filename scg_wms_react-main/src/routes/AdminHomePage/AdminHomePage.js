import BasicStatistics from '../../components/Stat';

import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, StackDivider, Box, Text, Button, ButtonGroup, Divider } from '@chakra-ui/react'
import React, { useState } from 'react';
import { FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { Grid as CGrid, GridItem as CGridItem } from '@chakra-ui/react'
import { Wrap, WrapItem } from '@chakra-ui/react'
import { Center, } from '@chakra-ui/react'
import { HStack } from '@chakra-ui/react'
import { SimpleGrid } from '@chakra-ui/react'
import { AbsoluteCenter } from '@chakra-ui/react'
import { CloseButton } from '@chakra-ui/react'
import { Flex, Spacer } from '@chakra-ui/react'
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
  } from '@chakra-ui/react'
import { Radio, RadioGroup } from '@chakra-ui/react'
import { InputGroup, InputLeftAddon, InputRightAddon } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import {
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
  } from '@chakra-ui/react'

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
    FiUserMinus,
    FiUserPlus
} from 'react-icons/fi'

import { Grid, _ } from 'gridjs-react';
import './GridStyles.css';

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
    Image,
    Badge
} from '@chakra-ui/react'

import { useTable } from 'react-table';

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

import Axios from 'axios';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const HomePage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFetchData = async () => {
        try {
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}`+'wms/api/test/');
            const data = response.data;
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFetchData2 = async () => {
        try {
            const response = await Axios.get(`${process.env.REACT_APP_API_URL}` + 'wms/api/check/');
            const data = response.data;
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Card mt="0" mb="10">
            <CardHeader>
                <Heading size='xl'>AdminHome</Heading>
            </CardHeader>

            <CardBody>

                <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
                    {/* <Image src={property.imageUrl} alt={property.imageAlt} /> */}

                    <Box p='6'>

                        <Box
                            mt='1'
                            fontWeight='semibold'
                            lineHeight='tight'
                            noOfLines={1}
                        >
                            <Flex align="center">
                                <FiUserPlus size={36} style={{ verticalAlign: "middle" }} />
                                <Heading size="lg" ml={2} noOfLines={1}>
                                    User Management
                                </Heading>
                            </Flex>
                        </Box>

                        <Flex mt="5">
                            <Spacer />
                            <Link to="./register" relative="path">
                                <Button leftIcon={<FiUserPlus />} colorScheme='teal' size='lg'>
                                    เพิ่มสมาชิก
                                </Button>
                            </Link>
                            <Spacer />
                            <Button leftIcon={<FiUserMinus />}  colorScheme='red' size='lg'>
                                ลบสมาชิก
                            </Button>
                            <Spacer />
                        </Flex>
                    </Box>
                </Box>
                
            </CardBody>
            <CardFooter>
                
            </CardFooter>
        </Card >
    );
};

export default HomePage;
