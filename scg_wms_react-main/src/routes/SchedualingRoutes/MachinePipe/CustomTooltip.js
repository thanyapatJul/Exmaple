import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const CustomTooltip = ({ data }) => {


  
  return (
    <Box p="4" boxShadow="lg" borderWidth="1px" borderRadius="md">
      <Text fontWeight="bold">ZCA: {data.appointmentData.text}</Text>
      <Text>Name: {data.appointmentData.th_name}</Text>
      <Text>Amount: {data.appointmentData.stk_frozen}</Text>
    </Box>
  );
};

export default CustomTooltip;
