import { 
    Flex, 
    VStack, 
    Heading, 
    Text, 
    HStack, 
    Select 
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

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
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const HomePage = () => {
    const [work, setWork] = useState([]);
    const [work2, setWork2] = useState([]);

    const [selections, setSelections] = useState({
        receive: { text: 'RECEIVE', priority: 1 },
        sent: { text: 'SENT', priority: 1 },
        unlock: { text: 'UNLOCK', priority: 1 },
        lock: { text: 'LOCK', priority: 1 },
        return: { text: 'RETURN', priority: 1 }
    });

    const handleSelectChange = (key, field, value) => {
        setSelections(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    useEffect(() => {
        client.get('wms/api/get_workload')
            .then(response => {
                
                if (response.data.success && Array.isArray(response.data.workload)) {
                    setWork(response.data.workload);
                    setWork2(response.data.workload2);
                } else {
                    console.error('Unexpected response format:', response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    

    return (
        <Flex align="center" justify="center" height="100vh" direction="column">
            <Flex justify="center" width="100%">
                <Heading size="2xl">RPA : WorkLoad ✨</Heading>
            </Flex>
            <Text marginBottom="4" fontSize="xl">
                Total Work Items: {work.length + work2.length}
            </Text>
            <VStack spacing={4} align="start">
                <HStack spacing={4} fontSize='2xl'>
                    <Text color="green" fontWeight='bold' fontSize='2xl'>1.RECEIVE</Text>
                    <Text minWidth="80px">work =</Text>
                    <Text color="blue" fontWeight='bold' fontSize='5xl'>{work.length}</Text>
                    <Select value={selections.receive.priority} onChange={(e) => handleSelectChange('receive', 'priority', e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </Select>
                </HStack>
                <HStack spacing={4} fontSize='2xl'>
                    <Text color="green" fontWeight='bold' fontSize='2xl'>2.SENT</Text>
                    <Text minWidth="80px">work =</Text>
                    <Text color="blue" fontWeight='bold' fontSize='5xl'>{work.length}</Text>
                    <Select value={selections.sent.priority} onChange={(e) => handleSelectChange('sent', 'priority', e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </Select>
                </HStack>
                <HStack spacing={4} fontSize='2xl'>

                    <Text color="green" fontWeight='bold' fontSize='2xl'>3.UNLOCK</Text>
                    <Text minWidth="80px">work =</Text>
                    <Text color="blue" fontWeight='bold' fontSize='5xl'>{work.length}</Text>
                    <Select value={selections.unlock.priority} onChange={(e) => handleSelectChange('unlock', 'priority', e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </Select>
                </HStack>
                <HStack spacing={4} fontSize='2xl'>
                    <Text color="green" fontWeight='bold' fontSize='2xl'>4.LOCK</Text>
                    <Text minWidth="80px">work =</Text>
                    <Text color="blue" fontWeight='bold' fontSize='5xl'>{work2.length}</Text>
                    <Select value={selections.lock.priority} onChange={(e) => handleSelectChange('lock', 'priority', e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </Select>
                </HStack>
                <HStack spacing={4} fontSize='2xl'>
                    <Text color="green" fontWeight='bold' fontSize='2xl'>5.RETURN</Text>
                    <Text minWidth="80px">work =</Text>
                    <Text color="blue" fontWeight='bold' fontSize='5xl'>{work.length}</Text>
                    <Select value={selections.return.priority} onChange={(e) => handleSelectChange('return', 'priority', e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </Select>
                </HStack>
            </VStack>
        </Flex>
    );
};

export default HomePage;
