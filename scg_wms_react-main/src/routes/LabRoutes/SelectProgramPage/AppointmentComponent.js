import React from 'react';
import { Box, Text, Flex, Badge } from '@chakra-ui/react';

const AppointmentComponent = ({ data }) => {
    const { appointmentData } = data;
    

    // Format the times
    const startTime = new Date(appointmentData.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(appointmentData.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine the shift
    const startHour = new Date(appointmentData.startDate).getHours();
    let shift = '';
    let shiftColor = '';
    if (startHour >= 0 && startHour < 8) {
        shift = 'C';
        shiftColor = 'purple';
    } else if (startHour >= 8 && startHour < 16) {
        shift = 'A';
        shiftColor = 'blue';
    } else {
        shift = 'B';
        shiftColor = 'orange';
    }

    // Determine the avatar image based on appointment type
    let typeBadge = null;
    if (appointmentData.type === 'MTO') {
        typeBadge = <Badge colorScheme="green" marginRight="8px" marginBottom="15px">MTO</Badge>;
    } else if (appointmentData.type === "Committed") {
        typeBadge = <Badge colorScheme="red" marginRight="8px" marginBottom="15px">CMT</Badge>;
    }

    // Calculate total done out of frozen stock
    const totalDone = appointmentData.totalActualStk || 0; 
    const frozenStk = appointmentData.frozenStk || 0; 

    // Determine badge color based on totalDone and frozenStk
    const totalBadgeColor = totalDone < frozenStk ? 'red' : 'teal';

    return (
        <Flex alignItems="center" padding="2" borderRadius="md">
            {typeBadge}
            <Box>
                <Text fontWeight="bold" fontSize="sm">{appointmentData.text}</Text>
                <Flex justifyContent="space-between" fontSize="sm" alignItems="center">
                    {appointmentData.text !== 'Cleaning' && (
                        <Badge colorScheme={totalBadgeColor} variant='outline' marginRight="8px">
                            {`Total: ${totalDone} / ${frozenStk}`}
                        </Badge>
                    )}
                    <Text fontSize="sm" marginRight="8px">{appointmentData.th_name}</Text>
                    <Badge colorScheme={shiftColor} marginRight="8px">{`Shift: ${shift}`}</Badge>
                    <Badge marginRight="8px">{`Start: ${startTime}`}</Badge>
                    <Badge marginRight="8px">{`End: ${endTime}`}</Badge>
                </Flex>
            </Box>
        </Flex>
    );
};

export default AppointmentComponent;
