import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, Text, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper,
    NumberIncrementStepper, NumberDecrementStepper, Table, Thead, Tbody, Tfoot, Tr, Th, Td,
    useToast, HStack, Spinner, Box
} from '@chakra-ui/react';
import Axios from 'axios';
import PropTypes from 'prop-types';

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

const useFetchAppointmentDetails = (isOpen, appointment, shouldRefetch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ frozenStk: 0, actualData: [], totalActualStk: 0 });

    useEffect(() => {
        if (isOpen && appointment && appointment.id) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await client.get('wms/api/get_actual', {
                        params: { appointment_id: appointment.id },
                    });
                    if (response.data.success) {
                        const { frozen_data, actual_data } = response.data.data;
                        const frozenStk = frozen_data.length ? frozen_data[0].stk_frozen : 0;
                        const totalActualStk = actual_data.reduce((sum, item) => sum + item.stk_actual, 0);
                        setData({ frozenStk, actualData: actual_data, totalActualStk });
                    } else {
                        throw new Error(response.data.error);
                    }
                } catch (err) {
                    setError('Failed to fetch appointment details');
                    console.error('Error fetching data:', err);
                }
                setLoading(false);
            };

            fetchData();
        }
    }, [isOpen, appointment, shouldRefetch]);

    return { data, loading, error };
};

const AppointmentDetailsModal = ({ isOpen, onClose, appointment, onSendSuccess }) => {
    const [stk, setStk] = useState(0);
    const [shouldRefetch, setShouldRefetch] = useState(false);
    const { data, loading, error } = useFetchAppointmentDetails(isOpen, appointment, shouldRefetch);
    const toast = useToast();

    const handleStkChange = (valueString) => setStk(parseFloat(valueString));

    const handleSend = async () => {
        if (appointment && stk) {
            try {
                const response = await client.post('/wms/api/post_actual', {
                    text: appointment.text,
                    startDate: appointment.startDate,
                    endDate: appointment.endDate,
                    stk_actual: stk,
                    frozen_id: appointment.id,
                });

                if (response.data.success) {
                    toast({
                        title: "Success",
                        description: "Data sent successfully",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    setShouldRefetch(prev => !prev); // Trigger refetch
                    onSendSuccess(); // Trigger the callback to refetch data in HomePage
                } else {
                    throw new Error(response.data.error);
                }
            } catch (error) {
                console.error('Error sending data:', error);
                toast({
                    title: "Error",
                    description: "Failed to send data",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Appointment Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {loading ? (
                        <Box textAlign="center" py={10}>
                            <Spinner size="xl" />
                        </Box>
                    ) : error ? (
                        <Text color="red.500">{error}</Text>
                    ) : appointment ? (
                        <>
                            <HStack>
                                <Text><strong>ID:</strong> {appointment.id}</Text>
                                <Text><strong>Machine:</strong> {appointment.priorityId}</Text>
                            </HStack>
                            <HStack>
                                <Text><strong>Start Date:</strong> {new Date(appointment.startDate).toLocaleString()}</Text>
                                <Text><strong>End Date:</strong> {new Date(appointment.endDate).toLocaleString()}</Text>
                            </HStack>
                            <HStack>
                                <Text><strong>Amount:</strong> {data.totalActualStk + stk}/{data.frozenStk}</Text>
                            </HStack>
                            <FormControl mt={4}>
                                <FormLabel>Amount</FormLabel>
                                <NumberInput
                                    value={stk}
                                    onChange={handleStkChange}
                                    min={0}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                            <Text mt={4}><strong>Commit history</strong></Text>
                            <Table variant="simple" mt={4}>
                                <Thead>
                                    <Tr>
                                        <Th>ID</Th>
                                        <Th>ZCA</Th>
                                        <Th>STK Actual</Th>
                                        <Th>Date added</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data.actualData.map(data => (
                                        <Tr key={data.id_actual}>
                                            <Td>{data.id_actual}</Td>
                                            <Td>{data.zca}</Td>
                                            <Td>{data.stk_actual}</Td>
                                            <Td>{new Date(data.date_start).toLocaleString()}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                                <Tfoot>
                                    <Tr>
                                        <Td colSpan="4" style={{ paddingTop: '0', paddingBottom: '10px', textAlign: 'center' }}>
                                            <Text mt={4} textAlign="center"><strong>Total Actual Committed:</strong> {data.totalActualStk}</Text>
                                        </Td>
                                    </Tr>
                                </Tfoot>
                            </Table>
                        </>
                    ) : (
                        <Text>No appointment selected</Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSend} isDisabled={loading}>
                        Send
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

AppointmentDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    appointment: PropTypes.object,
    onSendSuccess: PropTypes.func.isRequired,
};

export default AppointmentDetailsModal;
