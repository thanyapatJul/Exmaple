import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card, CardHeader, CardBody, Heading, HStack, Button, Divider,
    SimpleGrid, Box, Flex, Spacer, useColorModeValue, Badge, Text, useToast, Stack, CardFooter
} from '@chakra-ui/react';
import Scheduler, { View } from 'devextreme-react/scheduler';
import Axios from 'axios';
import PropTypes from 'prop-types';

import { Link as RouterLink } from "react-router-dom";

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


const HomePage = ({ machineSelect }) => {


    return (
        <SimpleGrid spacing={2} templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
            <Card>
                <CardHeader>
                <Heading size='lg'>Board</Heading>
                </CardHeader>
                <CardFooter>
                <Button
                    as={RouterLink}
                    to="./board"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                >เลือก</Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                <Heading size='lg'>Wood</Heading>
                </CardHeader>
                <CardFooter>
                <Button
                    as={RouterLink}
                    to="./wood"
                    style={{ color: "white" }}
                    w="150px"
                    size="lg"
                    bg={useColorModeValue("#151f21", "gray.900")}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                      bg: "green.400",
                    }}
                >เลือก</Button>
                </CardFooter>
            </Card>
        </SimpleGrid>

    );
};

HomePage.propTypes = {
    machineSelect: PropTypes.string.isRequired,
};

export default HomePage;
