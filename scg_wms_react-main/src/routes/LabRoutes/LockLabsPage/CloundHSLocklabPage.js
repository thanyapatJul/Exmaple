import React, { useState, useEffect, useCallback, useReducer, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card, CardHeader, CardBody, Heading, HStack, Button, Divider,
    SimpleGrid, Box, Flex, Spacer, useColorModeValue, Badge, Text, useToast, Stack, CardFooter,
    Center
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, Input, TableContainer } from '@chakra-ui/react';

import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon} from '@chakra-ui/react';

import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

import { Select } from '@chakra-ui/react'
import { Checkbox } from "@chakra-ui/react";

import { RangeDatepicker } from "chakra-dayzed-datepicker";

import Scheduler, { View } from 'devextreme-react/scheduler';
import Axios from 'axios';
import PropTypes from 'prop-types';
import Swal from "sweetalert2";


import { Link as RouterLink } from "react-router-dom";

const client = Axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`
});
client.defaults.xsrfCookieName = 'csrftoken';
client.defaults.xsrfHeaderName = 'X-CSRFToken';
client.defaults.withXSRFToken = true;
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


const CloundHSLocklabPage = ({ shift, machineSelect }) => {

    const [dateRange, setDateRange] = useState([new Date(), new Date()]);

    const [groupedDate, setGroupedDate] = useState([]);
    const [cloundData, setCloundData] = useState({});
    // const [checkedStatus, setCheckedStatus] = useState({});

    const fetchDataDate = async ( machineSelect ) => {
        try {
            const response = await client.get('wms/api/get_clounddate',{
                params: { machine: machineSelect },
              })

            if (response.data.success) {
                console.log(response.data.date)
                setGroupedDate(response.data.date)
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const handleFocus = async (date, machineSelect) => {
        try {
            const response = await client.get(`wms/api/get_clounddata`, {
                params: { date:date , machine:machineSelect},
            });
            if (response.data.success) {
                console.log(response.data.data);
                setCloundData(response.data.data);
            }
            
        } catch (error) {
            console.error(`Failed to fetch data for date ${date}:`, error);
        }
    };

    useEffect(() => {
        if (machineSelect) {
          fetchDataDate(machineSelect);
        }
      }, [machineSelect]);

    const changeStatus = async (updatedStatus) => {
        console.log(updatedStatus)

        // API call
        try {
            const response = await client.post('wms/api/update_statusboard', updatedStatus)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    
    const handleToggleStatus = () => {
        const updatedCloundData = { ...cloundData };
        Object.keys(updatedCloundData).forEach((date) => {
            updatedCloundData[date] = updatedCloundData[date].map((row) => ({
                ...row,
                status: row.status === 0 ? 1 : 0,
            }));
        });

        setCloundData(updatedCloundData);

        const updatedStatus = Object.keys(cloundData).map((date) =>
            cloundData[date].map((row) => ({
                rowdataid: row.rowdataid,
                status: row.status === 0 ? 1 : 0,
            }))
        );
        changeStatus(updatedStatus);
    };
    
    const toggleStatusDate = (targetDate) => {
        const updatedEntries = Object.entries(groupedDate).map(([date, status]) =>
            date === targetDate ? [date, status === 0 ? 1 : 0] : [date, status]
        );
    
        const updatedData = Object.fromEntries(updatedEntries);
    
        setGroupedDate(updatedData);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
    
        return `${year}-${month}-${day}`;
    };

    const fetchSelectDate = async (dates) => {
        try {
            const response = await client.get('wms/api/get_selectdate',{
                params: { machine: machineSelect,
                          startdate: dates[0],
                          enddate: dates[1]
                 },
              })

            if (response.data.success) {
                console.log(response.data.date)
                setGroupedDate(response.data.date)
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const handleDateChange = (selectedDates) => {
        setDateRange(selectedDates);
        const [start, end] = selectedDates;

        const formattedDates = [start, end].map(formatDate);
        console.log(formattedDates)
        
        fetchSelectDate(formattedDates);
      };

    // ------------------------------------------------------------------------- Paginate
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const totalPages = Math.ceil(Object.entries(groupedDate).length / itemsPerPage);

    const currentPageData = Object.entries(groupedDate).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNext = () => {
        if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        }
    };
    // -------------------------------------------------------------------------

    return (
        <Box>
            <Box
                w="400px"
                mb={4}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}         
            >
                <Text fontWeight="bold" fontSize="md">
                    เลือกช่วงวันที่
                </Text>
                <RangeDatepicker
                  selectedDates={dateRange}
                  onDateChange={handleDateChange}
                  configs={{
                    dateFormat: "yyyy/MM/dd",
                    dayNames: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
                    monthNames: [
                      "มกราคม",
                      "กุมภาพันธ์",
                      "มีนาคม",
                      "เมษายน",
                      "พฤษภาคม",
                      "มิถุนายน",
                      "กรกฎาคม",
                      "สิงหาคม",
                      "กันยายน",
                      "ตุลาคม",
                      "พฤศจิกายน",
                      "ธันวาคม",
                    ],
                  }}
                  placeholderText="เลือกช่วงวันที่"
                  rangeStartLabel="เริ่มต้น"
                  rangeEndLabel="สิ้นสุด"
                />
 
            </Box>
            <Accordion allowToggle>
                {/* {Object.entries(groupedDate).map(([date, status]) => { */}
                {currentPageData.map(([date, status]) => {
                    const isConditionMet = status == 1 ? true:false ;

                return (
                    <AccordionItem key={date}>
                    <h2>
                        <AccordionButton
                            onFocus={() => {
                                handleFocus(date, machineSelect)
                                console.log(`Accordion focused on date: ${date}`);
                            }}
                        >
                        <Box as="span" flex="1" textAlign="left">
                            ข้อมูลวันที่ : {date}
                        </Box>

                        <Box 
                            as="span" 
                            textAlign="right" 
                            color={isConditionMet ? "green.500" : "red.500"}
                            bg={isConditionMet ? "green.100" : "red.100"}
                            borderRadius="md"
                            px={2}
                            py={1}
                        >
                            {isConditionMet ? "✓ Approved" : "✗ Approved"}
                        </Box>

                        <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        <Box overflow="auto" maxH="300px" border="1px solid #ddd">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                            {Object.keys(cloundData).length > 0 &&
                                Object.keys(cloundData[Object.keys(cloundData)[0]][0])
                                    .filter((key) => key !== "rowdataid" && key !== "status")
                                    .map((key) => (
                                        <th
                                            key={key}
                                            style={{
                                                border: "1px solid #ddd",
                                                padding: "8px",
                                                textAlign: "left",
                                                backgroundColor: "#f2f2f2",
                                            }}
                                        >
                                            {key}
                                        </th>
                            ))}
                            </tr>
                            </thead>
                            <tbody>
                                {Object.keys(cloundData).map((date) =>
                                    cloundData[date].map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.keys(row)
                                                .filter((key) => key !== "rowdataid" && key !== "status")
                                                .map((key) => (
                                                    <td
                                                        key={key}
                                                        style={{
                                                            border: "1px solid #ddd",
                                                            padding: "8px",
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        {row[key]}
                                                    </td>
                                                ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        </Box>
                        <Box mt={4} textAlign="center">
                            <Button
                                colorScheme={
                                    Object.keys(cloundData).some((date) =>
                                        cloundData[date].some((row) => row.status === 1)
                                    )
                                        ? "red"
                                        : "teal"
                                }

                                onClick={() => {
                                    handleToggleStatus()
                                    toggleStatusDate(date)
                                }}

                                variant="solid"
                            >
                                {Object.keys(cloundData).every((date) =>
                                    cloundData[date].every((row) => row.status === 1)
                                )
                                    ? "Disapprove All"
                                    : "Approve All"}
                            </Button>
                        </Box>
                    </AccordionPanel>
                    </AccordionItem>
                );
                })}
            </Accordion>

            {/* Pagination Controls */}
            <HStack mt={4} justifyContent="center">
                <Button onClick={handlePrevious} isDisabled={currentPage === 1}>
                Previous
                </Button>
                <Box>
                Page {currentPage} of {totalPages}
                </Box>
                <Button onClick={handleNext} isDisabled={currentPage === totalPages}>
                Next
                </Button>
            </HStack>
        </Box>
    );
};




export default CloundHSLocklabPage;