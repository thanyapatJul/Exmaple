import React, { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import {
  Box,
  HStack,
  Button,
  IconButton,
  Text,
  Flex,
  Spacer,
  ButtonGroup,
  useColorModeValue,
  FormControl,
  Badge,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { Select as ChakraReactSelect } from "chakra-react-select";
import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import PropTypes from "prop-types";
import "rsuite-table/dist/css/rsuite-table.css";

const Productwithoutplan = ({ datalog }) => {
  const textColor = useColorModeValue("gray.800", "gray.200");
  const bgColor = useColorModeValue("white", "#28303E");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [filteredPlans, setFilteredPlans] = useState([]);
  const [zcaFilter, setZcaFilter] = useState(null);
  const [machineFilter, setMachineFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const rowsPerPage = 10;


  useEffect(() => {
    setFilteredPlans(datalog);
  }, [datalog]);


  const applyFilters = () => {
    setIsLoading(true);

    setTimeout(() => {
      let filteredData = [...datalog];

      if (zcaFilter) {
        filteredData = filteredData.filter(
          (item) => item.materialcode === zcaFilter.value
        );
      }

      if (machineFilter.length > 0) {
        const selectedMachines = machineFilter.map((machine) => machine.value);
        filteredData = filteredData.filter((item) =>
          selectedMachines.includes(item.machine)
        );
      }

      setFilteredPlans(filteredData);
      setCurrentPage(1);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    applyFilters();
  }, [zcaFilter, machineFilter]);


  const pageCount = Math.ceil(filteredPlans.length / rowsPerPage);
  const firstRowIndex = (currentPage - 1) * rowsPerPage;
  const lastRowIndex = currentPage * rowsPerPage;
  const currentData = filteredPlans.slice(firstRowIndex, lastRowIndex);

  return (
    <Box
      mt={5}
      p={2}
      borderRadius="xl"
      backgroundColor={bgColor}
      border="1px"
      borderColor={borderColor}
    >
      <HStack my={4}>
        <FormControl minW="250px" style={{ zIndex: 30 }}>
          <ChakraReactSelect
            placeholder="Search ZCA No..."
            options={datalog.map((plan) => ({
              value: plan.materialcode,
              label: `${plan.materialcode} ${plan.name_th}`,
            }))}
            onChange={setZcaFilter}
            isClearable
          />
        </FormControl>
        <FormControl minW="250px" style={{ zIndex: 30 }}>
          <ChakraReactSelect
            isMulti
            placeholder="Select Machines"
            options={[
              { label: "HS5", value: "HS5" },
              { label: "PK2", value: "PK2" },
            ]}
            onChange={setMachineFilter}
            isClearable
          />
        </FormControl>
      </HStack>

      {isLoading ? (
        <Box
          height={510}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="xl" color="teal" />
        </Box>
      ) : filteredPlans.length > 0 ? (
        <Table height={510} data={currentData} bordered>
          <Column flexGrow={1} minWidth={150}>
            <HeaderCell>ZCA</HeaderCell>
            <Cell dataKey="materialcode" />
          </Column>

          <Column flexGrow={2} minWidth={200}>
            <HeaderCell>ชื่อไทย</HeaderCell>
            <Cell dataKey="name_th" />
          </Column>

          <Column flexGrow={1} minWidth={150}>
            <HeaderCell>Pcs per Pallet</HeaderCell>
            <Cell dataKey="pcsperpallet" />
          </Column>

          <Column flexGrow={1} minWidth={150}>
            <HeaderCell>Total Good Count</HeaderCell>
            <Cell dataKey="total_goodcount" />
          </Column>

          <Column flexGrow={1} minWidth={150}>
            <HeaderCell>Total Loss</HeaderCell>
            <Cell>
              {(rowData) => (
                <Text color={rowData.total_loss > 0 ? "red.500" : "green.500"}>
                  {rowData.total_loss}
                </Text>
              )}
            </Cell>
          </Column>

          <Column flexGrow={1} minWidth={100}>
            <HeaderCell>Machine</HeaderCell>
            <Cell dataKey="machine" />
          </Column>
        </Table>
      ) : (
        <Box
          height={510}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="lg" color="gray.500">
            No remaining production found.
          </Text>
        </Box>
      )}

      <Divider />
      <Flex mt={3}>
        <Spacer />
        <HStack p={4} borderRadius="xl" border="1px" borderColor="gray.200">
          <Text>{`Items ${firstRowIndex + 1} - ${Math.min(
            lastRowIndex,
            filteredPlans.length
          )} of ${filteredPlans.length}`}</Text>
          <IconButton
            icon={<BiChevronLeft />}
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            isDisabled={currentPage === 1}
          />
          <Text>{currentPage}</Text>
          <IconButton
            icon={<BiChevronRight />}
            onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
            isDisabled={currentPage === pageCount}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

// Productwithoutplan.propTypes = {
//   datalog: PropTypes.arrayOf(
//     PropTypes.shape({
//       materialcode: PropTypes.string,
//       name_th: PropTypes.string,
//       pcsperpallet: PropTypes.number,
//       total_goodcount: PropTypes.number,
//       total_loss: PropTypes.number,
//       machine: PropTypes.string,
//     })
//   ),
// };

// Productwithoutplan.defaultProps = {
//   datalog: [],
// };

export default Productwithoutplan;
