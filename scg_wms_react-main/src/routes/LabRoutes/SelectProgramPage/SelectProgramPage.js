import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card, CardHeader, CardBody, Heading, HStack, Button, Divider,
    SimpleGrid, Box, Flex, Spacer, useColorModeValue, Badge, Text, useToast
} from '@chakra-ui/react';
import Scheduler, { View } from 'devextreme-react/scheduler';
import Axios from 'axios';
import PropTypes from 'prop-types';

import FillMonitorTable from './FillMonitorTable';
import WithdrawMonitorTable from './WithdrawMonitorTable';
import AppointmentComponent from './AppointmentComponent';
import AppointmentDetailsModal from './AppointmentDetailsModal'; // Import the modal component

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
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const useFetchStatMachineData = (machineSelect, defaultPDDate, setPlanStatState) => {
    useEffect(() => {
        const fetchStatMachineData = async () => {
            try {
                const queryParams = { machine: machineSelect, date: defaultPDDate };
                const response = await client.get('wms/api/get_statmachine', { params: queryParams });
                setPlanStatState(response.data.data);
            } catch (error) {
                console.error('Error fetching stat machine data:', error);
            }
        };
        fetchStatMachineData();
    }, [machineSelect, defaultPDDate, setPlanStatState]);
};

const useFetchAppointments = (machineSelect, setAppointments) => {
    const fetchAppointments = useCallback(async () => {
        try {
            const response = await client.get('/wms/api/get_appointments', {
                params: { machines: [machineSelect] },
            });

            if (response.data.success) {
                const fetchedAppointments = await Promise.all(response.data.appointments.map(async (appointment) => {
                    const actualResponse = await client.get('wms/api/get_actual', {
                        params: { appointment_id: appointment.id_frozen },
                    });

                    let totalActualStk = 0;
                    let frozenStk = 0;
                    if (actualResponse.data.success) {
                        const { frozen_data, actual_data } = actualResponse.data.data;
                        frozenStk = frozen_data.length ? frozen_data[0].stk_frozen : 0;
                        totalActualStk = actual_data.reduce((sum, item) => sum + item.stk_actual, 0);
                    }

                    return {
                        id: appointment.id_frozen,
                        text: appointment.zca,
                        priorityId: appointment.machine,
                        th_name: appointment.th_name,
                        startDate: new Date(appointment.date_start),
                        endDate: new Date(appointment.date_end),
                        type: appointment.type,
                        totalActualStk,
                        frozenStk
                    };
                }));

                setAppointments(fetchedAppointments);
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error.message);
        }
    }, [machineSelect, setAppointments]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return fetchAppointments;
};

const HomePage = ({ machineSelect }) => {
    const [defaultPDDate, setDefaultPDDate] = useState(new Date().toISOString().split('T')[0]);
    const [planStatState, setPlanStatState] = useState("-");
    const [appointments, setAppointments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const toast = useToast();

    useFetchStatMachineData(machineSelect, defaultPDDate, setPlanStatState);
    const fetchAppointments = useFetchAppointments(machineSelect, setAppointments);

    const navigate = useNavigate();
    const location = useLocation();
    const bgColor = useColorModeValue('white', 'gray.800');
    const buttonBgColor = useColorModeValue('#151f21', 'gray.900');

    const handleAppointmentClick = (e) => {
        setSelectedAppointment(e.appointmentData);
        setIsModalOpen(true);
    };

    const handleAppointmentTooltipShowing = (e) => {
        e.cancel = true;
    };

    return (
        <>
            <Card mt="0" mb="10" margin={10} padding={5}>
                <CardHeader>
                    <HStack spacing='24px'>
                        <Button
                            color={useColorModeValue('gray.700')}
                            size='lg'
                            onClick={() => navigate(location.pathname.slice(0, location.pathname.lastIndexOf("/")))}
                        >
                            กลับ
                        </Button>
                        <Heading>แผนการเดินเครื่อง {machineSelect}</Heading>
                    </HStack>
                </CardHeader>

                <CardBody>
                    <HStack marginBottom="15px">
                        <Badge colorScheme="green">MTO</Badge>
                        <Text fontWeight="bold" fontSize="sm" marginEnd='20px'>สินค้าที่ต้องผลิตสินค้าตามวัน และจำนวนที่สั่งผลิตเท่านั้น</Text>
                        <Badge colorScheme="red">Commit</Badge>
                        <Text fontWeight="bold" fontSize="sm">สินค้า Committed, สินค้าโอน (ลูกค้าต้องการด่วน)</Text>
                    </HStack>

                    <Scheduler
                        dataSource={appointments}
                        defaultCurrentView="agenda"
                        showAllDayPanel={false}
                        startDayHour={0}
                        endDayHour={24}
                        cellDuration={120}
                        height={900}
                        editing={false}
                        appointmentComponent={AppointmentComponent}
                        timeCellTemplate={(e) =>
                            new Date(e.date).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })
                          }
                        onAppointmentClick={handleAppointmentClick} // Handle appointment click
                        onAppointmentTooltipShowing={handleAppointmentTooltipShowing} // Disable tooltip
                    >
                        <View type="agenda" name="Agenda" />
                        <View type="day" name="Day" />
                        <View type="week" name="Week" />
                        <View type="month" name="Month" />
                    </Scheduler>

                    <Divider my={12} />

                    <SimpleGrid columns={{ sm: 1, md: 1, lg: 1, xl: 1, '2xl': 2 }} spacing={10}>
                        <Box>
                            <Flex pr={5}>
                                <Spacer />
                                <Heading size='lg' textTransform='uppercase' mb={3}>
                                    เบิกผลิต
                                </Heading>
                            </Flex>
                            <WithdrawMonitorTable machineSelect={machineSelect} />
                        </Box>
                        <Box>
                            <Flex pr={5}>
                                <Spacer />
                                <Heading size='lg' textTransform='uppercase' mb={3}>
                                    ส่งยอด
                                </Heading>
                            </Flex>
                            <FillMonitorTable machineSelect={machineSelect} />
                        </Box>
                    </SimpleGrid>
                </CardBody>
            </Card>

            <AppointmentDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                appointment={selectedAppointment}
                onSendSuccess={fetchAppointments} // Pass the callback function
            />
        </>
    );
};

HomePage.propTypes = {
    machineSelect: PropTypes.string.isRequired,
};

export default HomePage;