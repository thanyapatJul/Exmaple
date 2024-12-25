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

import { Grid, _ } from 'gridjs-react';

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
} from '@chakra-ui/react'

import { useTable } from 'react-table';

import {
    InputRightElement,
    useColorModeValue,
    Link,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

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
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const HomePage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFetchData = async () => {
        try {
            const userData = {
                username: 'thavvee',
                password: '2507',
                email: 'glory.taee@gmail.com',
                first_name: 'Thaweesuk',
                last_name: 'Suthaweesup',
                employee_id: '8888888888',
                role_id: 1
            };

            const response = await client.post('wms/api/register', userData); // Send POST request with user data
            const data = response.data;
            
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const [showPassword, setShowPassword] = useState(false)

    return (
        <Card mt="0" mb="10">
            <CardHeader>
                <Heading size='xl'>Regsiter</Heading>
            </CardHeader>

            <CardBody>

                <Flex
                    minH={'100vh'}
                    align={'center'}
                    justify={'center'}
                    bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                        <Stack align={'center'}>
                            <Heading fontSize={'4xl'} textAlign={'center'}>
                                Sign up
                            </Heading>
                            <Text fontSize={'lg'} color={'gray.600'}>
                                to enjoy all of our cool features ✌️
                            </Text>
                        </Stack>
                        <Box
                            rounded={'lg'}
                            bg={useColorModeValue('white', 'gray.700')}
                            boxShadow={'lg'}
                            p={8}>
                            <Stack spacing={4}>
                                <HStack>
                                    <Box>
                                        <FormControl id="firstName" isRequired>
                                            <FormLabel>First Name</FormLabel>
                                            <Input type="text" />
                                        </FormControl>
                                    </Box>
                                    <Box>
                                        <FormControl id="lastName">
                                            <FormLabel>Last Name</FormLabel>
                                            <Input type="text" />
                                        </FormControl>
                                    </Box>
                                </HStack>
                                <FormControl id="email" isRequired>
                                    <FormLabel>Email address</FormLabel>
                                    <Input type="email" />
                                </FormControl>
                                <FormControl id="password" isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <Input type={showPassword ? 'text' : 'password'} />
                                        <InputRightElement h={'full'}>
                                            <Button
                                                variant={'ghost'}
                                                onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                <Stack spacing={10} pt={2}>
                                    <Button
                                        loadingText="Submitting"
                                        size="lg"
                                        bg={'blue.400'}
                                        color={'white'}
                                        _hover={{
                                            bg: 'blue.500',
                                        }}
                                        onClick={handleFetchData}
                                    >
                                        Sign up
                                    </Button>
                                </Stack>
                                <Stack pt={6}>
                                    <Text align={'center'}>
                                        Already a user? <Link color={'blue.400'}>Login</Link>
                                    </Text>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </Flex>
                <Button onClick={handleFetchData} colorScheme="blue">
                    Fetch Data from /wms/api/check/
                </Button>
                
            </CardBody>
            <CardFooter>
                
            </CardFooter>
        </Card >
    );
};

export default HomePage;
