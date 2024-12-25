      
const Operator_pef = () => {
    const [machineFilter, setMachineFilter] = useState([]);
    const [sortedOperators, setSortedOperators] = useState([]);
  

    const fetchReject = async (startDate, endDate, machines) => {
        try {
            // ส่งข้อมูลไปที่ api เพื่อ filter ข้อมูลโดยเครื่องจักร filter ข้อมูล
          const response = await client.get("wms/api/get_something", {
            params: {
              machines: machines,
            },
          });
    
           // response.data.data คือข้อมูลที่หลังบ้านส่งกลับมา
          const data = response.data.data;
          setSortedOperators(data); 

        } catch (error) {
          console.error("Error fetching reject data", error);
          toast({
            title: "Error fetching reject data.",
            description: error.response?.data?.message || "Something went wrong",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      };
    



    return (
  
  // section 1
      <>
        <HStack>
  
            <HStack >
              <Box>
                <Text>
                เลือกเครื่องการผลิต
                </Text>
                <Box width="600px">
                  <ChakraReactSelect
                    placeholder="Select Machines"
                    options={[
                      { label: "HS3", value: "HS3", colorScheme: "blue" },
                      { label: "HS4", value: "HS4", colorScheme: "blue" },
                      { label: "HS5", value: "HS5", colorScheme: "blue" },
                    ]}


                    onChange={setMachineFilter} // <-----


                  />
                </Box>
              </Box>
            </HStack>
  
            <Button onClick={handleSearch} colorScheme="teal" mt={5}>
              Search
            </Button>


          </HStack>
  
  
  // section 2
          <VStack mt={8} spacing={4} align="stretch">
            <Text fontWeight="bold" fontSize="lg">
              Operators Sorted by Reject Percentage
            </Text>
            <Stack direction="row" wrap="wrap" spacing={4}>

              {sortedOperators.map((operator) => (


                <Card key={operator.operator} >
                  <CardBody>
                    <Flex
                      alignItems="center"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Text fontSize="md" fontWeight="bold">
                        {operator.operator_name}
                      </Text>
                      <Badge colorScheme="green" size="md" ms={2}>
                        {operator.operator}
                      </Badge>
                    </Flex>
  
                    <HStack spacing={4} justifyContent="center" mt={4}>
                      <Box>
                        <Text fontSize="sm" color={textColor}>
                          Reject%
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="red.500">
                          {(operator.rejectPercentage * 100).toFixed(2)}%
                        </Text>
                      </Box>
  
  
                    </HStack>
  
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </VStack>
      </>
    );
  };
  
  export default Operator_pef;
  