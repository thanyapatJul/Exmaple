import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, StackDivider, Box, Text, Button, ButtonGroup, Divider, Spinner } from '@chakra-ui/react'
import React, { useState, useEffect, useRef } from 'react';
import { FormControl, FormLabel, Input, VStack, useColorMode } from '@chakra-ui/react';
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

import {

    Container,
    Icon,
    useColorModeValue,
    createIcon,
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



import { SingleDatepicker, RangeDatepicker } from "chakra-dayzed-datepicker";
import ReactApexCharts from 'react-apexcharts'
import { Switch } from '@chakra-ui/react'
import {
    FormHelperText,
    InputRightElement,
} from '@chakra-ui/react'

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

import { ChevronRightIcon } from '@chakra-ui/icons'

import { Link as RouterLink } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/dist/css/rsuite-table.css'; // or 'rsuite-table/dist/css/rsuite-table.css'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import {
    Tag,
    TagLabel,
    TagLeftIcon,
    TagRightIcon,
    TagCloseButton,
} from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'

import moment from 'moment';

import Axios from 'axios';
const client = Axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`
});
client.defaults.xsrfCookieName = 'csrftoken';
client.defaults.xsrfHeaderName = 'X-CSRFToken';
client.defaults.withXSRFToken = true
client.defaults.withCredentials = true;
client.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Redirect to the login page
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const HomePage = (props) => {
    const machineSelect = props.machineSelect;

    const [defaultPDDate, setDefaultPDDate] = useState(new Date().toISOString().split('T')[0]);

    const [PlanStat_State, setPlanStat_State] = useState("-");

    useEffect(() => {
        fetchWithdrawData();
    }, []);

    const [selectedRangeDates, setSelectedRangeDates] = useState([
        new Date(new Date().setMonth(new Date().getMonth() - 1)),
        new Date()
    ]);
    const resetRangeDates = () => {
        setSelectedRangeDates([
            new Date(new Date().setMonth(new Date().getMonth() - 1)),
            new Date()
        ]);
    };

    const selectedDate = useRef();

    const navigate = useNavigate();
    const location = useLocation();
    const buttonBgColor = useColorModeValue('#151f21', 'gray.900');

    const [IsLoading, setIsLoading] = useState(false);
    const [TableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const pageCount = Math.ceil(TableData.length / itemsPerPage);
    const firstRowIndex = (currentPage - 1) * itemsPerPage;
    const lastRowIndex = firstRowIndex + itemsPerPage;
    const currentData = TableData.slice(firstRowIndex, lastRowIndex);

    const handlePrevPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < pageCount ? prev + 1 : prev));
    };

    const fetchWithdrawData = () => {
        const queryParams = {
            machine: machineSelect,
        };
        client.get('wms/api/get_monitorfillplan', { params: queryParams })
            .then(response => {
                // Assuming the response data is an array of options
                setTableData(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching options:', error);
            });
    };

    const { colorMode } = useColorMode();

    const bgColor = { light: 'gray.100', dark: 'gray.800' };
    const borderColor = { light: 'gray.200', dark: 'gray.700' };
    const textColor = { light: 'black', dark: 'gray.100' };
    const headerTextColor = { light: 'gray.600', dark: 'white' };
    const headerBgColor = { light: '#f5f5f5', dark: '#2e2e2e' };

    return (
        <Box p={2} w={"100%"} borderRadius={"xl"} border='1px' borderColor={borderColor[colorMode]} bgColor={bgColor[colorMode]}>
            <Table
                height={365}
                data={currentData}
                rowHeight={65}
                loading={IsLoading}
                bgColor={bgColor[colorMode]}
                renderEmpty={() => {
                    return (
                        <div className="rs-table-body-info">
                            <Heading fontSize={"lg"} color={textColor[colorMode]}>ไม่มีงานค้าง</Heading>
                        </div>
                    );
                }}
            >

                <Column verticalAlign="middle" width={80} resizable align="center" bgColor={bgColor[colorMode]}>
                    <HeaderCell style={{ backgroundColor: headerBgColor[colorMode] }}><Text color={headerTextColor[colorMode]} >PLAN ID</Text></HeaderCell>
                    <Cell style={{ backgroundColor: headerBgColor[colorMode] }} dataKey="plan_link_id" />
                </Column>

                <Column verticalAlign="middle" width={100} resizable align="center">
                    <HeaderCell style={{ backgroundColor: headerBgColor[colorMode] }}><Text color={headerTextColor[colorMode]}>วันแผน</Text></HeaderCell>
                    <Cell style={{ backgroundColor: headerBgColor[colorMode] }}>
                        {(rowData, rowIndex) => {
                            return moment(rowData.plan_date).format('DD/MM/YYYY');
                        }}
                    </Cell>
                </Column>

                <Column verticalAlign="middle" width={70} resizable align="center">
                    <HeaderCell style={{ backgroundColor: headerBgColor[colorMode] }}><Text color={headerTextColor[colorMode]}>กะแผน</Text></HeaderCell>
                    <Cell style={{ backgroundColor: headerBgColor[colorMode] }} dataKey="plan_shift" />
                </Column>

                <Column verticalAlign="middle" minWidth={300} flexGrow={2} fullText>
                    <HeaderCell style={{ backgroundColor: headerBgColor[colorMode] }}><Text color={headerTextColor[colorMode]}>ชื่อสินค้า</Text></HeaderCell>
                    <Cell style={{ backgroundColor: headerBgColor[colorMode] }}>
                        {(rowData, rowIndex) => {
                            return (
                                <VStack align={"start"} spacing={0}>
                                    <Text>
                                        {rowData["zca_on"]}
                                        {" "}
                                        {
                                            (rowData["product_type"] == "FG") ? (<Tag size={"sm"} colorScheme='blue' variant='solid' rounded={"md"}>FG</Tag>) : (<Tag size={"sm"} colorScheme='gray' variant='solid' rounded={"md"}>WIP</Tag>)
                                        }
                                    </Text>
                                    <Text>{rowData["name_th"]}</Text>
                                </VStack>
                            );
                        }}
                    </Cell>
                </Column>

                <Column verticalAlign="middle" width={160} resizable>
                    <HeaderCell style={{ backgroundColor: headerBgColor[colorMode] }}><Text color={headerTextColor[colorMode]}>Last Updated</Text></HeaderCell>
                    <Cell style={{ backgroundColor: headerBgColor[colorMode] }}>
                        {(rowData, rowIndex) => {
                            return moment(rowData.updated_at).format('DD/MM/YYYY HH:mm:ss');
                        }}
                    </Cell>
                </Column>

                <Column verticalAlign="middle" width={140} resizable align="center">
                    <HeaderCell style={{ backgroundColor: headerBgColor[colorMode] }}><Text color={headerTextColor[colorMode]}>Status</Text></HeaderCell>
                    <Cell style={{ backgroundColor: headerBgColor[colorMode] }}>
                        {(rowData, rowIndex) => {
                            return (<Tag p={2} size={"sm"} colorScheme='red' variant='solid' rounded={"md"}>ยังไม่ได้ส่งยอด</Tag>);
                        }}
                    </Cell>
                </Column>
            </Table>
            <Divider />
            <Box mt={3}>
                <Flex px={2}>
                    <Spacer />
                    <HStack p={4} borderRadius={"xl"} border='1px' borderColor={borderColor[colorMode]} bgColor={bgColor[colorMode]}>
                        <Text size='md' mr={5} color={textColor[colorMode]}>{`รายการที่ ${firstRowIndex + 1} - ${Math.min(lastRowIndex, TableData.length)} จาก ${TableData.length}`}</Text>
                        <IconButton
                            size='sm'
                            icon={<BiChevronLeft />}
                            colorScheme='teal'
                            onClick={handlePrevPage}
                            isDisabled={currentPage === 1}
                        />
                        <Text size='md' color={textColor[colorMode]}>{`หน้าที่ ${currentPage} จาก ${pageCount}`}</Text>
                        <IconButton
                            size='sm'
                            icon={<BiChevronRight />}
                            colorScheme='teal'
                            onClick={handleNextPage}
                            isDisabled={currentPage === pageCount}
                        />
                    </HStack>
                </Flex>
            </Box>
        </Box>
    );
};

export default HomePage;
