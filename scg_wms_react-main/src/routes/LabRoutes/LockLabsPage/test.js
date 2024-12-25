import React, { useState, useEffect, useCallback, useReducer, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card, CardHeader, CardBody, Heading, HStack, Button, Divider,
    SimpleGrid, Box, Flex, Spacer, useColorModeValue, Badge, Text, useToast, Stack, CardFooter,
    Center
} from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td, Input, TableContainer } from '@chakra-ui/react';
import Scheduler, { View } from 'devextreme-react/scheduler';
import Axios from 'axios';
import PropTypes from 'prop-types';

import { Link as RouterLink } from "react-router-dom";

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
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const InputBoardHS = ({ shift, machineSelect }) => {
    // -------------------------------------------------------------------------------------------------------------------------
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
            difflinelenght: '',
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
        }))
    );

    const [strengthData, setStrengthData] = useState(
        Array.from({ length: 16 }, (_, index) => ({
            sheet: Math.floor(index / 2 + 1).toString(), // Alternates between 1, 1, 2, 2, ..., 8, 8
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
        }))
    );

    // const [strength1Data, setStrength1Data] = useState(
    //     Array.from({ length: 8 }, (_, index) => ({
    //         sheet: (index + 1).toString(),
    //         thickness111: '',
    //         thickness121: '',
    //         thickness1Average1: '',
    //         loadPAR1: '',
    //         usPAR1: '',
    //         thickness211: '',
    //         thickness221: '',
    //         thickness2Average1: '',
    //         loadPER1: '',
    //         usPER1: '',
    //         usAverage1: '',
    //         isPAR1: '',
    //         isPER1: '',
    //         result1: '',
    //     }))
    // );

    // const [strength2Data, setStrength2Data] = useState(
    //     Array.from({ length: 8 }, (_, index) => ({
    //         sheet: (index + 1).toString(),
    //         thickness112: '',
    //         thickness122: '',
    //         thickness1Average2: '',
    //         loadPAR2: '',
    //         usPAR2: '',
    //         thickness212: '',
    //         thickness222: '',
    //         thickness2Average2: '',
    //         loadPER2: '',
    //         usPER2: '',
    //         usAverage2: '',
    //         isPAR2: '',
    //         isPER2: '',
    //         result2: '',
    //     }))
    // );

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

    // --------------------------------------------------------------------------------------------------------------------------

    const calculateMetrics = (fields, dataRow, type) => {
        const values = fields.map((field) => parseFloat(dataRow[field]))
            .filter((value) => !isNaN(value) && (type === 'difference' || type === 'edge' ? value > 0 : true));
    
        if (values.length === 0) return '';
    
        switch (type) {
            case 'average':
                const sum = values.reduce((acc, value) => acc + value, 0);
                return (sum / values.length).toFixed(2);
    
            case 'difference':
                if (values.length < 2) return '';
                const max = Math.max(...values);
                const min = Math.min(...values);
                return (((max - min) / max) * 100).toFixed(2);
    
            case 'edge':
                if (values.length < 2) return '';
                return (((values[0] * 100) / values[1]) * 100).toFixed(2);

            case 'density':
                if (values.length < 2) return '';
                return (((values[0]) / (values[1] - values[2]))).toFixed(2);

            case 'water':
                if (values.length < 2) return '';
                return (((values[0] - values[1]) * 100) / values[1]).toFixed(2);

            case 'moisdry':
                if (values.length < 2) return '';
                return (((values[0] - values[1]) * 100) / values[0]).toFixed(2);

            case 'usparper':
                if (values.length < 2) return '';
                return ((3/2)*(values[0]*values[1])*100/(values[2]*(values[3]**2))).toFixed(2);

            case 'usavg':
                const sumus = values.reduce((acc, value) => acc + value, 0);
                return ((sumus / values.length)*0.0978155339805825).toFixed(2);
    
            default:
                return '';
        }
    };
    
    const handleInputChange = (
        setData1,
        data1,
        setData2 = null,
        data2 = null,
        rowIndex,
        field,
        value,
        averageMapping1 = null,
        differenceMapping1 = null,
        averageMapping2 = null,
        differenceMapping2 = null
    ) => {
        const updateData = (setData, data, mappings, rowIndex, field, value) => {
            const updatedData = [...data];
            updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value };
    
            Object.entries(mappings).forEach(([resultField, fieldsToProcess]) => {
                updatedData[rowIndex][resultField] = calculateMetrics(
                    fieldsToProcess,
                    updatedData[rowIndex],
                    resultField.toLowerCase().includes('average') ? 'average' : 'difference'
                );
            });
    
            setData(updatedData);
        };
    
        if (setData1 && data1) {
            updateData(setData1, data1, { ...averageMapping1, ...differenceMapping1 }, rowIndex, field, value);
        }
    
        if (setData2 && data2) {
            updateData(setData2, data2, { ...averageMapping2, ...differenceMapping2 }, rowIndex, field, value);
        }
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

    return (
        <SimpleGrid rowGap="5">
            <Text fontSize="3xl" mb={5} textAlign="center" fontWeight="bold">
                Shift: {shift} - Machine: {machineSelect}
            </Text>

            <DimensionBox
                data={dimensionData}
                setData={setDimensionData}
                handleInputChange={(rowIndex, field, value) =>
                    handleInputChange(
                        setDimensionData,
                        dimensionData,
                        null,
                        null,
                        rowIndex,
                        field,
                        value,
                        {
                            widthAverage: ['widthAD', 'widthGH', 'widthBC'],
                            lengthAverage: ['lengthAB', 'lengthEF', 'lengthDC'],
                            thickAverage: ['thick1', 'thick2', 'thick3', 'thick4', 'thick5', 'thick6', 'thick7', 'thick8'],
                        },
                        {
                            difflinecross: ['diagonalAC', 'diagonalBD'],
                            difflinewidth: ['widthAD', 'widthGH', 'widthBC'],
                            difflinelenght: ['lengthAB', 'lengthEF', 'lengthDC'],
                            thickDiff: ['thick1', 'thick2', 'thick3', 'thick4', 'thick5', 'thick6', 'thick7', 'thick8'],
                        }
                    )
                }
            />

            {/* <StrengthBox
                strength1Data={strength1Data}
                setStrength1Data={setStrength1Data}
                strength2Data={strength2Data}
                setStrength2Data={setStrength2Data}
                handleInputChange={(rowIndex, field, value) =>
                    handleInputChange(
                        setStrength1Data,
                        strength1Data,
                        setStrength2Data,
                        strength2Data,
                        rowIndex,
                        field,
                        value,
                        { },
                        { }
                    )
                }
            /> */}

            <StrengthBox
                data={strengthData}
                setData={setStrengthData}
                handleInputChange={(rowIndex, field, value) =>
                    handleInputChange(
                        setStrengthData,
                        strengthData,
                        null,
                        null,
                        rowIndex,
                        field,
                        value,
                        { },
                        { }
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
                        null,
                        null,
                        rowIndex,
                        field,
                        value,
                        { },
                        { }
                    )
                }
            />
        </SimpleGrid>
    );
};

// Dimension Box Component
const DimensionBox = memo(({ data, setData, handleInputChange }) => (
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
                        </Tr>
                        <Tr>
                            <Th>1 : ผ่าน</Th>
                            <Th>สาเหตุ</Th>
                            <Th colSpan={4}>(มม.)</Th>
                            <Th colSpan={4}>(มม.)</Th>
                            <Th colSpan={2}>ทะแยงมุม (มม.)</Th>
                            <Th colSpan={3}>ผลต่างของเส้น (%)</Th>
                            <Th colSpan={10}>(มม.)</Th>
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
                        </Tr>
                </Thead>
                <Tbody>
                    {data.map((row, rowIndex) => (
                        <Tr key={rowIndex}>
                            {Object.keys(row).map((field) => (
                                <Td key={field}>
                                    <Input
                                        value={row[field]}
                                        onChange={(e) =>
                                            handleInputChange(
                                                rowIndex,
                                                field,
                                                e.target.value,
                                            )
                                        }
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

// Strength Box Component
// const StrengthBox = memo(
//     ({ strength1Data, setStrength1Data, strength2Data, setStrength2Data, handleInputChange }) => (
//         <>
//             <Text fontSize="xl" textAlign="center" fontWeight="semibold">
//                 Strength
//             </Text>
//             <Box overflowX="auto" p={4}>
//                 <Table
//                     mb={5}
//                     colorScheme="gray"
//                     size="xs"
//                     sx={{
//                         border: '1px solid',
//                         borderColor: 'gray.300',
//                         borderCollapse: 'collapse',
//                         '& th, & td': {
//                             border: '1px solid',
//                             borderColor: 'gray.300',
//                             textAlign: 'center',
//                         },
//                         '& th,': {
//                             fontSize: 'md',
//                         },
//                     }}
//                 >
//                     <Thead>
//                         <Tr>
//                             <Th rowSpan={3}>แผ่นที่</Th>
//                             <Th colSpan={3}>ความหนา</Th>
//                             <Th rowSpan={2}>LOAD PAR</Th>
//                             <Th rowSpan={2}>US PAR</Th>
//                             <Th colSpan={3}>ความหนา</Th>
//                             <Th rowSpan={2}>LOAD PER</Th>
//                             <Th rowSpan={2}>US PER</Th>
//                             <Th rowSpan={2}>US Avg.</Th>
//                             <Th rowSpan={3}>IS PAR</Th>
//                             <Th rowSpan={3}>IS PER</Th>
//                             <Th>สรุปผล</Th>
//                         </Tr>
//                         <Tr>
//                             <Th colSpan={3}>(มม.)</Th>
//                             <Th colSpan={3}>(มม.)</Th>
//                             <Th>1 : ผ่าน</Th>
//                         </Tr>
//                         <Tr>
//                             <Th>1</Th>
//                             <Th>2</Th>
//                             <Th>เฉลี่ย</Th>
//                             <Th>(kgf)</Th>
//                             <Th>(kgf/cm3)</Th>
//                             <Th>1</Th>
//                             <Th>2</Th>
//                             <Th>เฉลี่ย</Th>
//                             <Th>(kgf)</Th>
//                             <Th>(kgf/cm3)</Th>
//                             <Th>(Mpa)</Th>
//                             <Th>0 : ไม่ผ่าน</Th>
//                         </Tr>
//                     </Thead>
//                     <Tbody>
//                         {strength1Data.map((row1, rowIndex) => (
//                             <React.Fragment key={`row-${rowIndex}`}>
//                                 <Tr>
//                                     <Td>{row1.sheet}</Td>
//                                     {Object.keys(row1).map(
//                                         (field) =>
//                                             field !== 'sheet' && (
//                                                 <Td key={`strength1-${field}`}>
//                                                     <Input
//                                                         value={row1[field]}
//                                                         onChange={(e) =>
//                                                             handleInputChange(
//                                                                 rowIndex,
//                                                                 field,
//                                                                 e.target.value,
//                                                             )
//                                                         }
//                                                         disabled={
//                                                             field.includes('Average') ||
//                                                             field.toLowerCase().includes('us')
//                                                         }
//                                                         _disabled={{
//                                                             bg: 'gray.200',
//                                                             cursor: 'not-allowed',
//                                                         }}
//                                                     />
//                                                 </Td>
//                                             )
//                                     )}
//                                 </Tr>
//                                 <Tr>
//                                     <Td>{strength2Data[rowIndex]?.sheet}</Td>
//                                         {strength2Data[rowIndex] &&
//                                             Object.keys(strength2Data[rowIndex]).map(
//                                                 (field) =>
//                                                     field !== 'sheet' && (
//                                                         <Td key={`strength2-${field}`}>
//                                                             <Input
//                                                                 value={strength2Data[rowIndex][field]}
//                                                                 onChange={(e) =>
//                                                                     handleInputChange(
//                                                                         rowIndex,
//                                                                         field,
//                                                                         e.target.value,
//                                                                     )
//                                                                 }
//                                                                 disabled={
//                                                                     field.includes('Average') ||
//                                                                     field.toLowerCase().includes('us')
//                                                                 }
//                                                                 _disabled={{
//                                                                     bg: 'gray.200',
//                                                                     cursor: 'not-allowed',
//                                                                 }}
//                                                             />
//                                                         </Td>
//                                                     )
//                                             )}
//                                 </Tr>
//                             </React.Fragment>
//                         ))}
//                     </Tbody>
//                 </Table>
//             </Box>
//         </>
//     )
// );

const StrengthBox = memo(
    ({ data, setData, handleInputChange }) => (
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
                                {Object.keys(row).map((field) => (
                                    <Td key={field}>
                                        <Input
                                            value={row[field]}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    rowIndex,
                                                    field,
                                                    e.target.value,
                                                )
                                            }
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

// Density Box Component
const DensityBox = memo(({ data, setData, handleInputChange }) => (
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
                            {Object.keys(row).map((field) => (
                                <Td key={field}>
                                    <Input
                                        value={row[field]}
                                        onChange={(e) =>
                                            handleInputChange(
                                                rowIndex,
                                                field,
                                                e.target.value,
                                            )
                                        }
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