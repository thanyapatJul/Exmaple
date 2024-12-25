import { 
    Flex, 
    VStack, 
    Heading, 
    Text, 
    Box, 
    HStack, 
    Input, 
    Button 
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

    const [matDoc, setMatDoc] = useState('');

    const handleInputChange = (e) => {
        setMatDoc(e.target.value);
    };

    const handleCopyToClipboard = () => {
        const workText = work.map(item => 
            `${item.zca_on} ${item.qty} 1234 SomeCostCT TL ${item.machine} ${item.id} MovementTYPE`
        ).join('\n');

        navigator.clipboard.writeText(workText)
            .then(() => {
                
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleCopyDateToClipboard = () => {
        const currentDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '.');
        navigator.clipboard.writeText(currentDate)
            .then(() => {
                
            })
            .catch(err => {
                console.error('Failed to copy date: ', err);
            });
    };

    return (
        <Flex align="center" justify="center" height="100vh" direction="column">
            <Heading size="2xl">Job รับยอด : {work2.length}</Heading>
            <Button onClick={handleCopyDateToClipboard} marginTop='12px' bgColor='blue' color='white'>Date2Clipboard</Button>
            <VStack align="start" margin='50px'>
                {work2.slice(0, 19).map((item, index) => (
                    <HStack key={index} spacing={4} fontSize='10px'>
                        <Text>{item.zca_on}</Text>
                        <Text>{item.qty}</Text>
                        <Text>{1234}</Text>
                        <Text>{'SomeCostCT'}</Text>
                        <Text>{'TL'}</Text>
                        <Text>{item.machine}</Text>
                        <Text>{item.id}</Text>
                        <Text>{'MovementTYPE'}</Text>
                    </HStack>
                ))}
            </VStack>
            <Button onClick={handleCopyToClipboard} marginTop='12px' bgColor='red' color='white'>Data2Clipboard</Button>
            <Heading size="md" color='red' marginTop='100px'>Submit MatDoc</Heading>
            <HStack spacing={4} fontSize='2xl' marginTop='20px'>
                <Heading size="md">MatDoc</Heading>
                <Input value={matDoc} onChange={handleInputChange} borderColor="black" />
            </HStack>
        </Flex>
    );
};

export default HomePage;
