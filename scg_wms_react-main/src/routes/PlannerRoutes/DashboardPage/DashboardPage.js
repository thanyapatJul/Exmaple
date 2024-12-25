import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  HStack,
  IconButton,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import Chart from 'react-apexcharts';
import { RangeDatepicker } from 'chakra-dayzed-datepicker';
import Axios from "axios";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Redirect to the login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const HomePage = () => {
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);

  const materialsData = {
    series: [
      {
        data: [
          { x: 'Material A', y: 30 },
          { x: 'Material B', y: 20 },
          { x: 'Material C', y: 50 },
          { x: 'Material D', y: 40 },
          { x: 'Material E', y: 70 },
        ],
      },
    ],
    options: {
      chart: {
        type: 'treemap',
        height: 350,
      },
      title: {
        text: 'Materials Used in Past Month',
        align: 'center',
      },
      colors: ['#FF4560', '#008FFB', '#00E396', '#775DD0', '#FEB019'],
    },
  };

  return (
    <Box p={5}>
      <HStack justifyContent="space-between" mb={5}>
        <Heading as="h1" size="lg">Dashboard</Heading>
        <IconButton icon={<FiMenu />} aria-label="Menu" />
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <Card bg="white" shadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Total Amount</StatLabel>
              <StatNumber>34,000</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" shadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Delayed Product</StatLabel>
              <StatNumber>345</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                9.05%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" shadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Rejected rate</StatLabel>
              <StatNumber>12.4%</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                5.25%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card bg="white" shadow="md">
          <CardHeader>
            <Heading as="h3" size="md">Materials Usage</Heading>
          </CardHeader>
          <CardBody>

            <RangeDatepicker
              selectedDates={selectedDates}
              onDateChange={setSelectedDates}
            />
            <Box mt={5}>
              <Chart options={materialsData.options} series={materialsData.series} type="treemap" height={350} />
            </Box>
          </CardBody>
        </Card>
        <Card bg="white" shadow="md">
          <CardHeader>
            <Heading as="h3" size="md">Machine Delay history</Heading>
          </CardHeader>
          <CardBody>
            <Chart options={materialsData.options} series={materialsData.series} type="donut" height={350} />
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default HomePage;
