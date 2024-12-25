import React, { useState, useEffect } from "react";
import { Box, Input, Text, VStack, Button } from "@chakra-ui/react";
import Chart from "react-apexcharts";
import Axios from "axios";
import { Select as ChakraReactSelect } from "chakra-react-select";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withCredentials = true;
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const Matform = () => {
  const [chartData, setChartData] = useState([]);
  const [zca, setZca] = useState("");
  const [options, setOptions] = useState([]);

  const fetchMasterSTK = () => {
    client
      .get("wms/api/get_material")
      .then((response) => {
        console.log(response.data.data, "response.data.data");

        const sortedData = response.data.data.sort((a, b) => a.id - b.id);

        const zcaArray = sortedData.map((item) => ({
          value: item.zca,
          label: `${item.zca} ${item.name_th} ${item.hs}`,
        }));
        console.log("zcaArray", zcaArray);
        setOptions(zcaArray);
      })
      .catch((error) => {
        console.error("Error fetching MasterWIPSTK data:", error);
      });
  };

  const fetchzcarate = async () => {
    try {
      const response = await client.get("wms/api/get_zca_machinerate", {
        params: { zca: zca.join(",") }, // Send as a comma-separated string
      });
      if (response.data && response.data.data) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching remaining plans", error);
    }
  };

  const handleInputChange = (selectedOptions) => {
    const selectedZca = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setZca(selectedZca);
  };
  console.log(zca);
  const handleSearchClick = () => {
    fetchzcarate();
  };

  const categories = chartData.map((item) => item.hs); // Extract HS values for x-axis
  const seriesData = chartData.map((item) => item.stk_p_hr); // Extract rates for y-axis

  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      title: {
        text: "HS",
      },
    },
    yaxis: {
      title: {
        text: "Rate",
      },
    },
    title: {
      text: "HS Rate Comparison",
      align: "center",
    },
  };

  useEffect(() => {
    fetchMasterSTK();
  }, []);

  return (
    <VStack spacing={4} mt={6} align="stretch">
      <Box>
        <Text fontSize="lg" fontWeight="bold">
          Enter ZCA Code
        </Text>
        <ChakraReactSelect
          value={options.find((option) => option.value === zca?.value)}
          options={options}
          onChange={handleInputChange}
          isClearable={true}
          isMulti={true}
          placeholder="Select material codes"
          chakraStyles={{
            menu: (provided) => ({
              ...provided,
              zIndex: 9999,
              minWidth: "500px",
            }),
          }}
          mt={4}
        />
        <Button colorScheme="blue" mt={2} onClick={handleSearchClick}>
          Search
        </Button>
      </Box>
      <Box>
        <Text fontSize="lg" fontWeight="bold">
          Histogram Chart
        </Text>
        {chartData.length > 0 ? (
          <Chart
            options={chartOptions}
            series={[{ name: "Rate", data: seriesData }]}
            type="bar"
            height={350}
          />
        ) : (
          <Text>No data available. Please search for ZCA code.</Text>
        )}
      </Box>
    </VStack>
  );
};

export default Matform;
