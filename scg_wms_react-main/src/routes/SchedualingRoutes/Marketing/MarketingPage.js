import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Spinner,
  Stat,
  StatArrow,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Axios from "axios";

Axios.defaults.xsrfCookieName = "csrftoken";
Axios.defaults.xsrfHeaderName = "X-CSRFToken";
Axios.defaults.withCredentials = true;
Axios.defaults.withXSRFToken = true;

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get("wms/api/demand");
        if (response.data.success) {
          setData(response.data.demand);
          setFilteredData(response.data.demand);
        } else {
          setData([]);
          setFilteredData([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setData([]);
        setFilteredData([]);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    setFilteredData(sortedData);
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    setFilteredData(filtered);
  };

  return (
    <Card boxShadow={"md"} marginBottom={"10"}>
      <CardBody>
        <Box w="100%" marginBottom={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>
        </Box>
        <Box w="100%">
          {loading ? (
            <Spinner size="xl" />
          ) : (
            <TableContainer>
              <Table variant="simple">
                <TableCaption>Demand Data</TableCaption>
                <Thead>
                  <Tr>
                    <Th>
                      <Button variant="link" onClick={() => handleSort("class_field")}>
                        Class
                      </Button>
                    </Th>
                    <Th>
                      <Button variant="link" onClick={() => handleSort("materialcode")}>
                        Material Code
                      </Button>
                    </Th>
                    <Th>
                      <Button variant="link" onClick={() => handleSort("nameth")}>
                        Name (TH)
                      </Button>
                    </Th>
                    <Th>
                      <Button variant="link" onClick={() => handleSort("groupdetail")}>
                        Group Detail
                      </Button>
                    </Th>
                    <Th isNumeric>
                      <Button variant="link" onClick={() => handleSort("kg_per_pcs")}>
                        KG per PCS
                      </Button>
                    </Th>
                    <Th isNumeric>
                      <Button variant="link" onClick={() => handleSort("pcs_pal")}>
                        PCS per Pal
                      </Button>
                    </Th>
                    <Th>
                      <Button variant="link" onClick={() => handleSort("sp_short")}>
                        SP Short
                      </Button>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredData.map((row, index) => (
                    <Tr key={index}>
                      <Td>{row.class_field}</Td>
                      <Td>{row.materialcode}</Td>
                      <Td>{row.nameth}</Td>
                      <Td>{row.groupdetail}</Td>
                      <Td isNumeric>{row.kg_per_pcs}</Td>
                      <Td isNumeric>{row.pcs_pal}</Td>
                      <Td>
                        <Stat>
                          <StatArrow type={row.sp_short > 0 ? "increase" : "decrease"} />
                          {row.sp_short}
                        </Stat>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default App;
