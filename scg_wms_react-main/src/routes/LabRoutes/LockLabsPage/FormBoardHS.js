import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card, CardHeader, CardBody, Heading, HStack, Button, Divider,
    SimpleGrid, Box, Flex, Spacer, useColorModeValue, Badge, Text, useToast, Stack, CardFooter
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Scheduler, { View } from 'devextreme-react/scheduler';
import Axios from 'axios';
import PropTypes from 'prop-types';

import InputBoardHS from './InputHSBoard';
import CloundHSLocklabPage from './CloundHSLocklabPage';

const client = Axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`
});
client.defaults.xsrfCookieName = 'csrftoken';
client.defaults.xsrfHeaderName = 'X-CSRFToken';
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

const FormBoardHS = ({ machineSelect }) => {
    return (
        <Card>
            <CardBody>
                <Tabs isFitted variant="enclosed">
                    <TabList>
                        <Tab
                            _selected={{
                                color: 'white',
                                bg: 'black',
                            }}
                            _hover={{
                                bg: 'gray.200',
                            }}
                            color="gray.700"
                            border="1px solid"
                            borderColor="gray.500"
                            borderRadius="md"
                            px={4}
                            py={2}
                            mx={2}
                        >
                            Shift C
                        </Tab>
                        <Tab
                            _selected={{
                                color: 'white',
                                bg: 'black',
                            }}
                            _hover={{
                                bg: 'gray.200',
                            }}
                            color="gray.700"
                            border="1px solid"
                            borderColor="gray.500"
                            borderRadius="md"
                            px={4}
                            py={2}
                            mx={2}
                        >
                            Shift A
                        </Tab>
                        <Tab
                            _selected={{
                                color: 'white',
                                bg: 'black',
                            }}
                            _hover={{
                                bg: 'gray.200',
                            }}
                            color="gray.700"
                            border="1px solid"
                            borderColor="gray.500"
                            borderRadius="md"
                            px={4}
                            py={2}
                            mx={2}
                        >
                            Shift B
                        </Tab>
                        <Tab
                            _selected={{
                                color: 'white',
                                bg: 'black',
                            }}
                            _hover={{
                                bg: 'gray.200',
                            }}
                            color="gray.700"
                            border="1px solid"
                            borderColor="gray.500"
                            borderRadius="md"
                            px={4}
                            py={2}
                            mx={2}
                        >
                            DatalockLabs
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <InputBoardHS shift="C" machineSelect={machineSelect}/>
                        </TabPanel>
                        <TabPanel>
                            <InputBoardHS shift="A" machineSelect={machineSelect}/>
                        </TabPanel>
                        <TabPanel>
                            <InputBoardHS shift="B" machineSelect={machineSelect}/>
                        </TabPanel>
                        <TabPanel>
                            <CloundHSLocklabPage shift="boardData" machineSelect={machineSelect}/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </CardBody>
        </Card>

    );
};

FormBoardHS.propTypes = {
    machineSelect: PropTypes.string.isRequired,
};

export default FormBoardHS;