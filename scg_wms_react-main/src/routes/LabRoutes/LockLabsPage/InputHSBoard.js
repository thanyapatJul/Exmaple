import React, { useState, useEffect, useCallback, useReducer, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card, CardHeader, CardBody, Heading, HStack, Button, Divider,
    SimpleGrid, Box, Flex, Spacer, useColorModeValue, Badge, Text, useToast, Stack, CardFooter,
    Center
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, Input, TableContainer } from '@chakra-ui/react';

import { Select } from '@chakra-ui/react'
import { Checkbox } from "@chakra-ui/react";

import Scheduler, { View } from 'devextreme-react/scheduler';
import Axios from 'axios';
import PropTypes from 'prop-types';
import Swal from "sweetalert2";

import debounce from "lodash.debounce";


import { Link as RouterLink } from "react-router-dom";

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
            // Redirect to the login page
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const InputBoardHS = ({ shift, machineSelect }) => {
    // ------------------ Set Input Field
    const [dimensionData, setDimensionData] = useState(
        Array.from({ length: 8 }, (_, index) => ({
            sheet: (index + 1).toString(),
            machine: machineSelect,
            product: '',
            date: '',
            pallet: '',
            weight: '',
            inspection1: '',
            inspection2: '',
            widthAD: '',
            widthGH: '',
            widthBC: '',
            widthAverage: '',
            lengthAB: '',
            lengthEF: '',
            lengthDC: '',
            lengthAverage: '',
            diagonalAC: '',
            diagonalBD: '',
            difflinecross: '',
            difflinewidth: '',
            difflinelength: '',
            thick1: '',
            thick2: '',
            thick3: '',
            thick4: '',
            thick5: '',
            thick6: '',
            thick7: '',
            thick8: '',
            thickAverage: '',
            thickDiff: '',
            edgemmAB: '',
            edgemmDC: '',
            edgemmBC: '',
            edgemmAD: '',
            edgeperAB: '',
            edgeperDC: '',
            edgeperBC: '',
            edgeperAD: '',
            beforepressAB: '',
            beforepressDC: '',
            beforepressBC: '',
            beforepressAD: '',
            afterpressAB: '',
            afterpressDC: '',
            afterpressBC: '',
            afterpressAD: '',
            roughness: '',
            rzAvg: '',
            wzAvg: '',
            fzAvg: '',
            liftupleft: '',
            liftupright: '',
            liftupAverage: '',
        }))
    );

    const [strengthData, setStrengthData] = useState(
        Array.from({ length: 16 }, (_, index) => ({
            sheet: Math.floor(index / 2 + 1).toString(),
            thickness11: '',
            thickness12: '',
            thickness1Average: '',
            loadPAR: '',
            usPAR: '',
            thickness21: '',
            thickness22: '',
            thickness2Average: '',
            loadPER: '',
            usPER: '',
            usAverage: '',
            isPAR: '',
            isPER: '',
            result: '',
            note: '',
            lockpallet: '',
            amountlock: '',
            symp: '',
        }))
    );

    const [densityData, setDensityData] = useState(
        Array.from({ length: 8 }, (_, index) => ({
            sheet: (index + 1).toString(),
            denweightair: '',
            denweightwater: '',
            denweightdry: '',
            densityCal: '',
            waterAbspCal: '',
            moisturebefore: '',
            moistureafter: '',
            moistureCal: '',
            dryL1: '',
            dryL2: '',
            dryCal: '',
            screwamount: '',
            screwbreak: '',
            leakage: '',
            laminaLoad: '',
            laminaLamina: '',
            laminatorn: '',
            hardpress: '',
            harddepth: '',
            hardness: '',
        }))
    );

    // ------------------- Function calculate

    const calculateMetrics = (fields, dataRow, type) => {
        const values = fields.map((field) => parseFloat(dataRow[field]))
            .filter((value) => !isNaN(value) && (type === 'difference' || type === 'edge' ? value > 0 : true));
    
        if (values.length === 0) return '';
    
        switch (type) {
            case 'average':
                const sum = values.reduce((acc, value) => acc + value, 0).toFixed(2);
                return (sum / values.length).toFixed(2);
    
            case 'difference':
                if (values.length < 2) return '';
                const max = Math.max(...values);
                const min = Math.min(...values);
                return (((max - min) / max) * 100).toFixed(2);
    
            case 'edge':
                if (values.length < 2) return 0;
                return (((values[0] * 100) / values[1]) * 100).toFixed(2);

            case 'density':
                if (values.length < 2) return '';
                return (((values[0]) / (values[1] - values[2]))).toFixed(2);

            case 'water':
                if (values.length < 2) return '';
                console.log(values)
                return (((values[0] - values[1]) * 100) / values[1]).toFixed(2);

            case 'moisdry':
                if (values.length < 2) return '';
                return (((values[0] - values[1]) * 100) / values[0]).toFixed(2);

            case 'usparper':
                if (values.length < 2) return '';
                return ((3/2)*(values[0]*spanLendata[0])*100/(spanLendata[1]*(values[1]**2))).toFixed(2);

            case 'usavg':
                const sumus = values.reduce((acc, value) => acc + value, 0).toFixed(2);
                return ((sumus / values.length)*0.0978155339805825).toFixed(2);
    
            default:
                return '';
        }
    };
    
    const handleInputChange = (setData, data, rowIndex, field, value, mappingData) => {

        const updateData = (setData, data, mappings, rowIndex, field, value) => {
            const updatedData = [...data];
            updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value };
    
            Object.entries(mappings).forEach(([type, fieldsMapping]) => {
                Object.entries(fieldsMapping).forEach(([resultField, fieldsToProcess]) => {
                    updatedData[rowIndex][resultField] = calculateMetrics(
                        fieldsToProcess,
                        updatedData[rowIndex],
                        type
                    );
                });
            });
    
            setData(updatedData);
        };
    
        if (setData && data) {
            updateData(setData, data, mappingData, rowIndex, field, value);
        }
    };

    const handlePaste = (setData, data, rowIndex, fieldIndex, clipboardData, mapping) => {
        const pastedData = clipboardData.getData('text/plain');
        const rows = pastedData.split('\n').map(row => row.split('\t'));
    
        // Update state with pasted data
        setData((prevData) => {
            const updatedData = [...prevData];
            rows.forEach((row, i) => {
                const currentRowIndex = rowIndex + i;
                if (currentRowIndex < updatedData.length) {
                    row.forEach((cellValue, j) => {
                        const fieldKeys = Object.keys(updatedData[currentRowIndex]);
                        const currentFieldIndex = fieldIndex + j;
                        const currentField = fieldKeys[currentFieldIndex];
                        if (currentField) {
                            updatedData[currentRowIndex][currentField] = cellValue;
                        }
                    });

                    const dataRow = updatedData[currentRowIndex];

                    // Iterate over each metric type in mapping
                    Object.entries(mapping).forEach(([metricType, metricFields]) => {
                        Object.entries(metricFields).forEach(([metricKey, fields]) => {
                            const calculatedValue = calculateMetrics(fields, dataRow, metricType);
                            dataRow[metricKey] = calculatedValue;
                        });
                    });
                }
                
            });
            return updatedData;
        });
    };

    const setDatetimeData = useCallback((shift) => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const baseDate = `${yyyy}-${mm}-${dd}`;

        const shiftStartHours = { C: 0, A: 8, B: 16 };

        const baseHour = shiftStartHours[shift] || 0;

        setDimensionData((prevData) =>
            prevData.map((row, index) => ({
                ...row,
                date: `${baseDate} ${String(baseHour + index).padStart(2, '0')}:00`,
            }))
        );
    }, [shift]);

    useEffect(() => {
        setDatetimeData(shift);
    }, [shift, machineSelect, setDatetimeData]);

    const mergeDataBySheet = (dimensionData, strengthData, densityData, shift) => {
        const mergedData = {};
    
        const mapBySheet = (dataArray) => {
            return dataArray.reduce((acc, curr) => {
                acc[curr.sheet] = curr;
                return acc;
            }, {});
        };
    
        const dimensionMap = mapBySheet(dimensionData);
        const densityMap = mapBySheet(densityData);
    
        const strengthMap = {};
        strengthData.forEach((entry) => {
            const { sheet, ...rest } = entry;
            if (!strengthMap[sheet]) {
                strengthMap[sheet] = {};
            }
    
            Object.keys(rest).forEach((key) => {
                const fieldKey = `${key}`;
                strengthMap[sheet][fieldKey] = rest[key];
            });
        });
    
        Object.keys(dimensionMap).forEach((sheetName) => {
            mergedData[sheetName] = {
                ...dimensionMap[sheetName],
                ...densityMap[sheetName],
                ...strengthMap[sheetName],
                status: 0,
                shift: shift,
            };
        });
    
        return mergedData;
    };
    
    const handleFormSubmit = async (dimensionData, strengthData, densityData, shift) => {
        const finalMergedData = mergeDataBySheet(dimensionData, strengthData, densityData, shift);
    
        console.log('Final Merged Data:', finalMergedData);
    
        try {
            const response = await client.post('/wms/api/post_locklab_boardhs', finalMergedData);
    
            Swal.fire({
                title: "Success!",
                icon: "success"
            });
        } catch (error) {
            console.error("Error posting new appointment:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.error || "An unexpected error occurred",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    // -------------------- Set state buttons
    const [submitButtonValue, setSubmitButtonValue] = useState(0);

    const [isChecked, setIsChecked] = useState(false);
    const [options, setOptions] = useState([]);

    // --------------------- Fetch data for edit
    const toggleCheckbox = async () => {
        setIsChecked((prev) => !prev);

        if (isChecked) {
            setOptions([]);
            setSubmitButtonValue(0);
        }
        else {
            const fetchDateEdit = await fetchEditDate(shift,machineSelect);
            setOptions(fetchDateEdit);
            setSubmitButtonValue(1);
        }
    };

    const fetchEditDate = async (shift, machineSelect) => {
        try {
            const response = await client.get('wms/api/get_editdatelocklab_boardhs',{
                params: { shift: shift,
                            machine: machineSelect 
                        },
              })
            
            if (response.data.success) {
                console.log(response.data.editdate)
                return response.data.editdate
              }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const handleSelectChange = async (e) => {
        const selectedDate = e.target.value;

        const dataForDate = await fetchDataUpdate(selectedDate);
    };

    const [globalSheetToIdMap, setGlobalSheetToIdMap] = useState({});

    const fetchDataUpdate = async (date) => {
        try {
            const response = await client.get('wms/api/get_editdatalocklab_boardhs',{
                params: { shift: shift,
                            machine: machineSelect,
                            date: date,
                        },
              })
            
            if (response.data.success) {
                const responseData = response.data.data;
                console.log(responseData)

                const updatedMap = responseData.reduce((map, item) => {
                    map[item.sheet] = item.id;
                    return map;
                }, {});
    
                setGlobalSheetToIdMap(updatedMap);

                setDimensionData((prevData) => {
                    return prevData.map((item) => {
                        const matchingData = responseData.find(
                            (responseItem) => responseItem.sheet === item.sheet
                        );
            
                        if (matchingData) {
                            const updatedItem = { ...item };
            
                            Object.keys(updatedItem).forEach((key) => {
                                const lowercaseKey = key.toLowerCase();
                                if (lowercaseKey in matchingData) {
                                    updatedItem[key] = matchingData[lowercaseKey] ?? '';
                                }
                            });
            
                            return updatedItem;
                        }
            
                        return item;
                    });
                });

                setStrengthData((prevData) => {
                    const sheetCount = {};
            
                    return prevData.map((item) => {
                        sheetCount[item.sheet] = (sheetCount[item.sheet] || 0) + 1;
            
                        const matchingData = responseData.find(
                            (responseItem) => responseItem.sheet === item.sheet
                        );
            
                        if (matchingData) {
                            const updatedItem = { ...item };
            
                            const occurrence = sheetCount[item.sheet];
                            Object.keys(updatedItem).forEach((key) => {
                                const keyWithSuffix = key + `_${occurrence}`;
                                const lowercaseKey = keyWithSuffix.toLowerCase();
            
                                if (lowercaseKey in matchingData) {
                                    updatedItem[key] = matchingData[lowercaseKey] ?? '';
                                }
                            });
            
                            return updatedItem;
                        }
            
                        return item;
                    });
                });

                setDensityData((prevData) => 
                    prevData.map((item) => {
                        const matchingData = responseData.find(
                            (responseItem) => responseItem.sheet === item.sheet
                        );
            
                        if (matchingData) {
                            const updatedItem = { ...item };
            
                            Object.keys(updatedItem).forEach((key) => {
                                const lowercaseKey = key.toLowerCase();
                                if (lowercaseKey in matchingData) {
                                    updatedItem[key] = matchingData[lowercaseKey] ?? '';
                                }
                            });
            
                            return updatedItem;
                        }
            
                        return item;
                    })
                );
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const transformDataById = (data, globalSheetToIdMap) => {
        const transformedData = Object.entries(data).reduce((result, [sheet, value]) => {
            const id = globalSheetToIdMap[sheet] || sheet;
            result[id] = value;
            return result;
        }, {});
        return transformedData;
    };

    const handleFormUpdate = async (dimensionData, strengthData, densityData, shift) => {
        const finalMergedData = mergeDataBySheet(dimensionData, strengthData, densityData, shift);

        const result = transformDataById(finalMergedData,globalSheetToIdMap);
    
        console.log('Final Merged Data:', finalMergedData);

        // console.log('ID:', globalSheetToIdMap);

        console.log('Map ID:', result);
    
        try {
            const response = await client.post('wms/api/update_locklab_boardhs', result);
    
            Swal.fire({
                title: "Update Success!",
                icon: "success"
            });
        } catch (error) {
            console.error("Error posting new appointment:", error);
            Swal.fire({
                title: "Update Error!",
                text: error.response?.data?.error || "An unexpected error occurred",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const cal_dimension = {
        average: {
            widthAverage: ['widthAD', 'widthGH', 'widthBC'],
            lengthAverage: ['lengthAB', 'lengthEF', 'lengthDC'],
            thickAverage: ['thick1', 'thick2', 'thick3', 'thick4', 'thick5', 'thick6', 'thick7', 'thick8'],
        },
        difference: {
            difflinecross: ['diagonalAC', 'diagonalBD'],
            difflinewidth: ['widthAD', 'widthGH', 'widthBC'],
            difflinelength: ['lengthAB', 'lengthEF', 'lengthDC'],
            thickDiff: ['thick1', 'thick2', 'thick3', 'thick4', 'thick5', 'thick6', 'thick7', 'thick8'],
        },
        edge: {
            edgeperAB: ['edgemmAB', 'lengthAB'],
            edgeperDC: ['edgemmDC', 'lengthDC'],
            edgeperBC: ['edgemmBC', 'widthBC'],
            edgeperAD: ['edgemmAD', 'widthAD'],
        },
    };

    const cal_strenght = { 
        average: {
            thickness1Average: ['thickness11', 'thickness12'],
            thickness2Average: ['thickness21', 'thickness22'],
        },
        usparper: {
            usPAR: ['loadPAR', 'thickness1Average'],
            usPER: ['loadPER', 'thickness2Average'],
        },
        usavg: {
            usAverage: ['usPAR', 'usPER'],
        },
    }

    const cal_density = {
        density: {
            densityCal: ['denweightdry', 'denweightair', 'denweightwater'],
        },
        water: {
            waterAbspCal: ['denweightair', 'denweightdry'],
        },
        moisdry: {
            moistureCal: ['moisturebefore', 'moistureafter'],
            dryCal: ['dryL2', 'dryL1'],
        },
    }

    const findDuplicateProducts = () => {
        const productCounts = dimensionData.reduce((acc, item) => {
            const product = item.product;
            const hasNumber = /\d/.test(product);
            if (product && hasNumber) {
                acc[item.product] = (acc[item.product] || 0) + 1;
            }
            return acc;
        }, {});

        const duplicates = Object.keys(productCounts).filter(
            (product) => productCounts[product] > 1
        );

        const cleanedDuplicates = duplicates.map((product) => product.split("\r")[0]);

        return cleanedDuplicates;
    };

    const [spanLendata, setSpanLenData] = useState([]);

    const fetchSpanLenexample = async (productname) => {
        try {
            const response = await client.get('wms/api/get_spanlenexample', {
                params: {
                    pdname: productname,
                }
            })
            if (response.data.success) {
                const responseData = response.data.value;
                // console.log(responseData)
                setSpanLenData(responseData)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        // console.log('Duplicate Products:', findDuplicateProducts());
        console.log(spanLendata)
    }, [dimensionData[3].product]);

    useEffect(() => {
        const pdname = findDuplicateProducts()[0]
        // console.log(dimensionData[3].product)
        fetchSpanLenexample(pdname)
    }, [dimensionData[3].product])

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                console.log("Submitted with value:", submitButtonValue);

                if (submitButtonValue === 0) {
                    await handleFormSubmit(dimensionData, strengthData, densityData, shift);
                }

                if (submitButtonValue === 1) {
                     await handleFormUpdate(dimensionData, strengthData, densityData, shift);
                }
                
            }}
        >

            <SimpleGrid rowGap="5">
                <Text fontSize="3xl" mb={5} textAlign="center" fontWeight="bold">
                    Shift: {shift} - Machine: {machineSelect}
                </Text>

                <Box display="flex" gap="4" alignItems="center">
                    <Button
                        colorScheme={isChecked ? "red" : "teal"}
                        onClick={toggleCheckbox}
                        variant={isChecked ? "solid" : "solid"}
                    >
                        {isChecked ? "แก้ไข" : "แก้ไข"}
                    </Button>

                    <Text fontSize="sm" textAlign="center" fontWeight="bold">
                        วันที่
                    </Text>
                    <Select width="200px" disabled={!isChecked} onChange={handleSelectChange}>
                        {options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </Select>
                </Box>

                <DimensionBox
                    data={dimensionData}
                    setData={setDimensionData}
                    handleInputChange={(rowIndex, field, value) =>
                        handleInputChange(
                            setDimensionData,
                            dimensionData,
                            rowIndex,
                            field,
                            value,
                            cal_dimension
                        )
                    }
                    handlePaste={(rowIndex, fieldIndex, clipboardData) =>
                        handlePaste(
                            setDimensionData,
                            dimensionData,
                            rowIndex,
                            fieldIndex,
                            clipboardData,
                            cal_dimension
                        )
                    }
                />

                <StrengthBox
                    data={strengthData}
                    setData={setStrengthData}
                    handleInputChange={(rowIndex, field, value) =>
                        handleInputChange(
                            setStrengthData,
                            strengthData,
                            rowIndex,
                            field,
                            value,
                            cal_strenght,
                        )
                    }
                    handlePaste={(rowIndex, fieldIndex, clipboardData) =>
                        handlePaste(
                            setStrengthData,
                            strengthData,
                            rowIndex,
                            fieldIndex,
                            clipboardData,
                            cal_strenght,
                        )
                    }
                />

                <DensityBox
                    data={densityData}
                    setData={setDensityData}
                    handleInputChange={(rowIndex, field, value) =>
                        handleInputChange(
                            setDensityData,
                            densityData,
                            rowIndex,
                            field,
                            value,
                            cal_density,
                        )
                    }
                    handlePaste={(rowIndex, fieldIndex, clipboardData) =>
                        handlePaste(
                            setDensityData,
                            densityData,
                            rowIndex,
                            fieldIndex,
                            clipboardData,
                            cal_density,
                        )
                    }
                />

                <Button mt={4} colorScheme='teal' type='submit' value={submitButtonValue}>
                    Save
                </Button>
            </SimpleGrid>
            
        </form>
        
    );
};

// Dimension Box 
const DimensionBox = memo(({ data, setData, handleInputChange, handlePaste}) => (
    <>
        <Text fontSize="xl" textAlign="center" fontWeight="semibold">
            Dimension
        </Text>
        <Box overflowX="auto" p={4}>
            <Table
                mb={5}
                colorScheme="gray"
                size="xs"
                sx={{
                    border: '1px solid',
                    borderColor: 'gray.300',
                    borderCollapse: 'collapse',
                    '& th, & td': {
                        border: '1px solid',
                        borderColor: 'gray.300',
                        textAlign: 'center',
                    },
                    '& th,': {
                        fontSize: 'md',
                        width: '250vw',
                    },
                    '#product, #datetime': {
                        width: '700vw',
                    },
                }}
            >
                <Thead>
                        <Tr>
                            <Th rowSpan={3}>แผ่นที่</Th>
                            <Th rowSpan={3}>เครื่อง</Th>
                            <Th rowSpan={3} id="product">ผลิตภัณฑ์</Th>
                            <Th rowSpan={2} id="datetime">วันที่</Th>
                            <Th rowSpan={3}>พาเลทที่</Th>
                            <Th rowSpan={2}>น้ำหนัก</Th>
                            <Th colSpan={2}>การตรวจสอบด้านรูปลักษณ์</Th>
                            <Th colSpan={4}>ความกว้าง</Th>
                            <Th colSpan={4}>ความยาว</Th>
                            <Th colSpan={5}>ความได้ฉาก</Th>
                            <Th colSpan={10}>ความหนา (จุดที่ 7,8 เฉพาะผิวลวดลายนูน)</Th>
                            <Th colSpan={4} rowSpan={2}>ความตรงของขอบ (มม.)</Th>
                            <Th colSpan={4} rowSpan={2}>ความตรงของขอบ (%)</Th>
                            <Th colSpan={4} rowSpan={2}>ความพริ้วขอบ ก่อนกดสมาร์ทบอร์ด (มม.)</Th>
                            <Th colSpan={4} rowSpan={2}>ความพริ้วขอบ หลังกดสมาร์ทบอร์ด (มม.)</Th>
                            <Th colSpan={4} rowSpan={2}>ความเรียบ (บอร์ดที่ผิวเรียบทุกชนิด ความหนา ≤ 12 มม.)</Th>
                            <Th colSpan={3}>ยกย้วย</Th>
                        </Tr>
                        <Tr>
                            <Th>1 : ผ่าน</Th>
                            <Th>สาเหตุ</Th>
                            <Th colSpan={4}>(มม.)</Th>
                            <Th colSpan={4}>(มม.)</Th>
                            <Th colSpan={2}>ทะแยงมุม (มม.)</Th>
                            <Th colSpan={3}>ผลต่างของเส้น (%)</Th>
                            <Th colSpan={10}>(มม.)</Th>
                            <Th colSpan={3}>ระยะ (มม.)</Th>
                        </Tr>
                        <Tr>
                            <Th>เวลา</Th>
                            <Th>(กก.)</Th>
                            <Th>0 : ไม่ผ่าน</Th>
                            <Th>กรณีไม่ผ่าน</Th>
                            <Th>AD</Th>
                            <Th>GH</Th>
                            <Th>BC</Th>
                            <Th>เฉลี่ย</Th>
                            <Th>AB</Th>
                            <Th>EF</Th>
                            <Th>DC</Th>
                            <Th>เฉลี่ย</Th>
                            <Th>AC</Th>
                            <Th>BD</Th>
                            <Th>ทะแยงมุม</Th>
                            <Th>ความกว้าง</Th>
                            <Th>ความยาว</Th>
                            <Th>1</Th>
                            <Th>2</Th>
                            <Th>3</Th>
                            <Th>4</Th>
                            <Th>5</Th>
                            <Th>6</Th>
                            <Th>7</Th>
                            <Th>8</Th>
                            <Th>เฉลี่ย</Th>
                            <Th>ผลต่าง (%)</Th>
                            <Th>AB</Th>
                            <Th>DC</Th>
                            <Th>BC</Th>
                            <Th>AD</Th>
                            <Th>AB</Th>
                            <Th>DC</Th>
                            <Th>BC</Th>
                            <Th>AD</Th>
                            <Th>AB</Th>
                            <Th>DC</Th>
                            <Th>BC</Th>
                            <Th>AD</Th>
                            <Th>AB</Th>
                            <Th>DC</Th>
                            <Th>BC</Th>
                            <Th>AD</Th>
                            <Th>Roughness Level</Th>
                            <Th>Rz Avg. (µm.)</Th>
                            <Th>Wz Avg. (mm.)</Th>
                            <Th>Fz Avg. (mm.)</Th>
                            <Th>ห้อย-ซ้าย</Th>
                            <Th>ห้อย-ขวา</Th>
                            <Th>ยกย้วย</Th>
                        </Tr>
                </Thead>
                <Tbody>
                    {data.map((row, rowIndex) => (
                        <Tr key={rowIndex}>
                            {Object.keys(row).map((field, fieldIndex) => (
                                <Td key={field}>
                                    <Input
                                        type={
                                            field.includes('sheet') ? 'text' : 
                                            field.includes('machine') ? 'text' : 
                                            field.includes('date') ? 'text' : 
                                            field.includes('product') ? 'text' : 
                                            field.includes('inspection2') ? 'text' : 
                                            'text'
                                        }
                                        value={row[field]}
                                        onChange={(e) =>
                                            handleInputChange(
                                                rowIndex,
                                                field,
                                                e.target.value,
                                            )
                                        }
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            handlePaste(rowIndex, fieldIndex, e.clipboardData);
                                        }}
                                        // onKeyDown={(e) => {
                                        //     const textFields = ['sheet', 'machine', 'date', 'product', 'inspection2'];
                                        //     if (textFields.some((keyword) => field.includes(keyword))) {
                                        //         return;
                                        //     }
                                        
                                        //     const integerOnlyFields = ['pallet', 'inspection1'];
                                        //     if (integerOnlyFields.some((keyword) => field.includes(keyword))) {
                                        //         const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
                                        //         if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        //             e.preventDefault();
                                        //         }
                                        //         return;
                                        //     }
                                        
                                        //     const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete", "."];
                                        //     if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        
                                        onInput={(e) => {
                                            const textFields = ['sheet', 'machine', 'date', 'product', 'inspection2'];
                                            if (textFields.some((keyword) => field.includes(keyword))) {
                                                return;
                                            }
                                        
                                            const integerOnlyFields = ['pallet', 'inspection1'];
                                            if (integerOnlyFields.some((keyword) => field.includes(keyword)) && !/^\d*$/.test(e.target.value)) {
                                                e.target.value = row[field];
                                                return;
                                            }
                                        
                                            if (!/^-?\d*\.?\d*$/.test(e.target.value)) {
                                                e.target.value = row[field];
                                            }
                                        }}

                                        disabled={
                                            field.includes('Average') ||
                                            field.toLowerCase().includes('diff') ||
                                            field.includes('edgeper')
                                        }
                                        _disabled={{
                                            bg: 'gray.200',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    </>
));

// Strength Box 
const StrengthBox = memo( ({ data, setData, handleInputChange, handlePaste }) => (
        <>
            <Text fontSize="xl" textAlign="center" fontWeight="semibold">
                Strength
            </Text>
            <Box overflowX="auto" p={4}>
                <Table
                    mb={5}
                    colorScheme="gray"
                    size="xs"
                    sx={{
                        border: '1px solid',
                        borderColor: 'gray.300',
                        borderCollapse: 'collapse',
                        '& th, & td': {
                            border: '1px solid',
                            borderColor: 'gray.300',
                            textAlign: 'center',
                        },
                        '& th,': {
                            fontSize: 'md',
                            width: '110vw',
                        },
                    }}
                >
                    <Thead>
                        <Tr>
                            <Th rowSpan={3}>แผ่นที่</Th>
                            <Th colSpan={3}>ความหนา</Th>
                            <Th rowSpan={2}>LOAD PAR</Th>
                            <Th rowSpan={2}>US PAR</Th>
                            <Th colSpan={3}>ความหนา</Th>
                            <Th rowSpan={2}>LOAD PER</Th>
                            <Th rowSpan={2}>US PER</Th>
                            <Th rowSpan={2}>US Avg.</Th>
                            <Th rowSpan={3}>IS PAR</Th>
                            <Th rowSpan={3}>IS PER</Th>
                            <Th>สรุปผล</Th>
                            <Th rowSpan={3}>หมายเหตุ</Th>
                            <Th rowSpan={3}>ล็อคไม้ที่</Th>
                            <Th rowSpan={3}>จำนวน</Th>
                            <Th rowSpan={3}>อาการ</Th>
                        </Tr>
                        <Tr>
                            <Th colSpan={3}>(มม.)</Th>
                            <Th colSpan={3}>(มม.)</Th>
                            <Th>1 : ผ่าน</Th>
                        </Tr>
                        <Tr>
                            <Th>1</Th>
                            <Th>2</Th>
                            <Th>เฉลี่ย</Th>
                            <Th>(kgf)</Th>
                            <Th>(kgf/cm3)</Th>
                            <Th>1</Th>
                            <Th>2</Th>
                            <Th>เฉลี่ย</Th>
                            <Th>(kgf)</Th>
                            <Th>(kgf/cm3)</Th>
                            <Th>(Mpa)</Th>
                            <Th>0 : ไม่ผ่าน</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((row, rowIndex) => (
                            <Tr key={rowIndex}>
                                {Object.keys(row).map((field, fieldIndex) => (
                                    <Td key={field}>
                                        <Input
                                            type={
                                                field.includes('note') ? 'text' : 
                                                field.includes('lockpallet') ? 'text' : 
                                                field.includes('symp') ? 'text' : 
                                                'text'
                                            }
                                            value={row[field]}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    rowIndex,
                                                    field,
                                                    e.target.value,
                                                )
                                            }
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                handlePaste(rowIndex, fieldIndex, e.clipboardData);
                                            }}
                                            // onKeyDown={(e) => {
                                            //     const textFields = ['note', 'lockpallet', 'symp'];
                                            //     if (textFields.some((keyword) => field.includes(keyword))) {
                                            //         return;
                                            //     }
                                            
                                            //     const integerOnlyFields = ['result'];
                                            //     if (integerOnlyFields.some((keyword) => field.includes(keyword))) {
                                            //         const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
                                            //         if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                            //             e.preventDefault();
                                            //         }
                                            //         return;
                                            //     }
                                            
                                            //     const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete", "."];
                                            //     if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                            //         e.preventDefault();
                                            //     }
                                            // }}
                                            
                                            onInput={(e) => {
                                                const textFields = ['note', 'lockpallet', 'symp'];
                                                if (textFields.some((keyword) => field.includes(keyword))) {
                                                    return;
                                                }
                                            
                                                const integerOnlyFields = ['result'];
                                                if (integerOnlyFields.some((keyword) => field.includes(keyword)) && !/^\d*$/.test(e.target.value)) {
                                                    e.target.value = row[field];
                                                    return;
                                                }
                                            
                                                if (!/^-?\d*\.?\d*$/.test(e.target.value)) {
                                                    e.target.value = row[field];
                                                }
                                            }}
                                            
                                            disabled={
                                                field.includes('Average') ||
                                                field.toLowerCase().includes('us')
                                            }
                                            _disabled={{
                                                bg: 'gray.200',
                                                cursor: 'not-allowed',
                                            }}
                                        />
                                    </Td>
                                ))}
                            </Tr>
                    ))}
                    </Tbody>
                </Table>
            </Box>
        </>
    )
);

// Density Box 
const DensityBox = memo(({ data, setData, handleInputChange, handlePaste }) => (
    <>
        <Text fontSize="xl" textAlign="center" fontWeight="semibold">
            Density
        </Text>
        <Box overflowX="auto" p={4}>
            <Table
                mb={5}
                colorScheme="gray"
                size="xs"
                sx={{
                    border: '1px solid',
                    borderColor: 'gray.300',
                    borderCollapse: 'collapse',
                    '& th, & td': {
                        border: '1px solid',
                        borderColor: 'gray.300',
                        textAlign: 'center',
                    },
                    '& th,': {
                        fontSize: 'md',
                        width: '115vw',
                    },
                }}
            >
                <Thead>
                        <Tr>
                            <Th rowSpan={3}>แผ่นที่</Th>
                            <Th colSpan={5}>Density (g/cm3)</Th>
                            <Th colSpan={3}>%Moisture</Th>
                            <Th colSpan={3}>Drying Shrinkage</Th>
                            <Th colSpan={2}>Test ตอกตะปู/ยิงสกรู</Th>
                            <Th>ความต้าน การรั่วซึม</Th>
                            <Th colSpan={3}>LAMINA (kgf/cm2) (บอร์ด ความหนา ≥ 10.0 มม.)</Th>
                            <Th colSpan={3}>ความแข็ง (เฉพาะสูตรยิบซั่ม)</Th>
                        </Tr>
                        <Tr>
                            <Th>นน. อิ่มตัว</Th>
                            <Th>นน. ชั่ง</Th>
                            <Th>นน. แห้ง</Th>
                            <Th>density</Th>
                            <Th>Water Absp.</Th>
                            <Th colSpan={2}>น้ำหนัก ตย. (g)</Th>
                            <Th>% Moisture</Th>
                            <Th>L1</Th>
                            <Th>L2</Th>
                            <Th>Drying</Th>
                            <Th>จำนวน</Th>
                            <Th>จำนวน</Th>
                            <Th>1 : ผ่าน</Th>
                            <Th>LOAD</Th>
                            <Th>Lamina</Th>
                            <Th>ระยะที่ฉีกขาด</Th>
                            <Th>แรงกด (p)</Th>
                            <Th>รอยกด (h)</Th>
                            <Th>ความแข็ง</Th>
                        </Tr>
                        <Tr>
                            <Th>ในอากาศ (g)</Th>
                            <Th>ในน้ำ (g)</Th>
                            <Th>หลังอบ (g)</Th>
                            <Th>(g/cm3)</Th>
                            <Th>(%)</Th>
                            <Th>ก่อนอบ</Th>
                            <Th>หลังอบ</Th>
                            <Th>(%)</Th>
                            <Th>(mm)</Th>
                            <Th>(mm)</Th>
                            <Th>Shrink.(%)</Th>
                            <Th>จุดที่ตอก</Th>
                            <Th>จุดที่แตก</Th>
                            <Th>0 : ไม่ผ่าน</Th>
                            <Th>(kgf)</Th>
                            <Th>(kgf/cm2)</Th>
                            <Th>(mm.)</Th>
                            <Th>(kgf)</Th>
                            <Th>(mm.)</Th>
                            <Th>(HB)</Th>
                        </Tr>
                </Thead>
                <Tbody>
                    {data.map((row, rowIndex) => (
                        <Tr key={rowIndex}>
                            {Object.keys(row).map((field, fieldIndex) => (
                                <Td key={field}>
                                    <Input
                                        type={'text'}
                                        value={row[field]}
                                        onChange={(e) =>
                                            handleInputChange(
                                                rowIndex,
                                                field,
                                                e.target.value,
                                            )
                                        }
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            handlePaste(rowIndex, fieldIndex, e.clipboardData);
                                        }}
                                        // onKeyDown={(e) => {
                                        //     const integerOnlyFields = ['screwamount', 'screwbreak', 'leakage'];
                                        //     if (integerOnlyFields.some((keyword) => field.includes(keyword))) {
                                        //         const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
                                        //         if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        //             e.preventDefault();
                                        //         }
                                        //         return;
                                        //     }
                                        
                                        //     const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete", "."];
                                        //     if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        //         e.preventDefault();
                                        //     }
                                        // }}
                                        
                                        onInput={(e) => {
                                            const integerOnlyFields = ['screwamount', 'screwbreak', 'leakage'];
                                            if (integerOnlyFields.some((keyword) => field.includes(keyword)) && !/^\d*$/.test(e.target.value)) {
                                                e.target.value = row[field];
                                                return;
                                            }
                                        
                                            if (!/^-?\d*\.?\d*$/.test(e.target.value)) {
                                                e.target.value = row[field];
                                            }
                                        }}

                                        disabled={
                                            field.includes('Average') ||
                                            field.toLowerCase().includes('cal')
                                        }
                                        _disabled={{
                                            bg: 'gray.200',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    </>
));


export default InputBoardHS;