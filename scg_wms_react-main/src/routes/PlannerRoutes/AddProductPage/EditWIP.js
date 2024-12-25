import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, StackDivider, Box, Text, Button, ButtonGroup, Divider } from '@chakra-ui/react'
import React, { useState, useEffect, useRef } from 'react';
import { FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { Grid as CGrid, GridItem as CGridItem } from '@chakra-ui/react'
import { Wrap, WrapItem } from '@chakra-ui/react'
import { Center, } from '@chakra-ui/react'
import { HStack } from '@chakra-ui/react'
import { SimpleGrid } from '@chakra-ui/react'
import { AbsoluteCenter } from '@chakra-ui/react'
import { CloseButton } from '@chakra-ui/react'
import { Flex, Spacer } from '@chakra-ui/react'
import moment from 'moment';
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
  } from '@chakra-ui/react'
import { Radio, RadioGroup } from '@chakra-ui/react'
import { InputGroup, InputLeftAddon, InputRightAddon } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import {
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
  } from '@chakra-ui/react'

import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
  } from '@chakra-ui/react'

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { FiEdit } from "react-icons/fi";
import { AiOutlineSave } from "react-icons/ai";
import {
    Tag,
    TagLabel,
    TagLeftIcon,
    TagRightIcon,
    TagCloseButton,
    FormErrorMessage
} from '@chakra-ui/react'

import { useFormik } from "formik";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from 'yup'

import { IconButton } from '@chakra-ui/react'

import { InputRightElement } from '@chakra-ui/react'

import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/dist/css/rsuite-table.css'; // or 'rsuite-table/dist/css/rsuite-table.css'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { SingleDatepicker, RangeDatepicker } from "chakra-dayzed-datepicker";
import {
    AsyncCreatableSelect,
    AsyncSelect,
    CreatableSelect,
    Select as ChakraReactSelect,
} from "chakra-react-select";

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react'

import { BiCog } from "react-icons/bi";
import { BiX } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { FiDelete } from "react-icons/fi";

import { Checkbox, CheckboxGroup } from '@chakra-ui/react'

import Swal from 'sweetalert2'

import Axios from 'axios';
import { bg } from 'date-fns/locale';
const client = Axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`
});
client.defaults.xsrfCookieName = 'csrftoken';
client.defaults.xsrfHeaderName = 'X-CSRFToken';
client.defaults.withXSRFToken = true
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


const HomePage = () => {

    const textColor = useColorModeValue("gray.800", "gray.200");
    const bgColorDefault = useColorModeValue("gray.100", "gray.800");
    const bgColor = useColorModeValue("white", "#28303E");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const isDarkMode = localStorage.getItem("chakra-ui-color-mode") === "dark";
    const tableBg = useColorModeValue("white", "gray.700");
    const headerColor = useColorModeValue("gray.700", "gray.300");
    const cellTextColor = useColorModeValue("gray.800", "gray.200");
    const badgeBgColor = useColorModeValue("blue.500", "blue.300");

    const [filteredTableData, setFilteredTableData] = useState([]);
    const [TableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [ zcaFilter, setZcaFilter ] = useState('');
    const [ zcaOptions, setZcaOptions] = useState([]);
    const [ iseditInfo, setIsEditInfo] = useState(null);
    const [ newRowData, setNewRowData ] = useState(null)

    const addWipRef = useRef(null)
    const formikRef = useRef(null);
    const CloseButtonRef = useRef(null);

    const pageCount = Math.ceil(filteredTableData.length / itemsPerPage);
    const firstRowIndex = (currentPage - 1) * itemsPerPage;
    const lastRowIndex = firstRowIndex + itemsPerPage;
    const currentData = filteredTableData.slice(firstRowIndex, lastRowIndex);

    const [machineState, setMachineState] = useState([])

    const handleScroll = () => {
        addWipRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < pageCount ? prev + 1 : prev));
    };

    const fetchWIPData = () => {
        // เรียก API จาก Backend โดยใช้ axios
        client.get('wms/api/get_editzcawip')
            .then(response => {
                console.log("Response Data: ", response.data)
                setTableData(response.data.data)
                setFilteredTableData(response.data.data);
                let zcaArray = response.data.data.map(item=>({
                    value: item.field_zca,
                    label: `${item.field_zca} ${item.field_name}`
                }))
                setZcaOptions(zcaArray)
            })
            .catch(error => {
                console.error('Error fetching Approve data:', error);
            });
    };


    useEffect(() => {
        fetchWIPData();
    }, []);

    const applyFilters = () => {
        let filteredData = TableData;
        if ( zcaFilter && Object.keys(zcaFilter).length > 0) {
            filteredData = filteredData.filter(item =>
                zcaFilter.value === item.field_zca
            );
        }

        if(iseditInfo != null){
            for (const fdata of filteredData){
                setMachineState(prevState => [
                    ...prevState,
                    fdata.field_mc,
                ]);
            }
        }

        setFilteredTableData(filteredData);
        setCurrentPage(1)
    };

    useEffect(() => {
        applyFilters()
    }, [zcaFilter])

 
    

    const handleDeleteRow = async (id) => {
        const postData = {
            id_select: id,
        };
        console.log('id:', id, postData);

        const confirmationResult = await Swal.fire({
            title: 'แน่ใจหรือไม่ ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ตกลง'
        });

        if (confirmationResult.isConfirmed) {
            try {
                Swal.fire({
                    title: 'กำลังอัพเดตเข้าฐานข้อมูล!',
                    html: 'โปรดรอ......',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
                // Post data to the specified URL
                const response = await client.post('wms/api/post_deletezcawip', postData);
                console.log('Post response:', response.data);
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    timer: 1000,
                    showConfirmButton: false,
                });
            } catch (error) {
                console.error('Error posting data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                    showConfirmButton: false,
                });
            }

            fetchWIPData();
        }
    };

    useEffect(() => {
        console.log(formikRef.current)
     }, [formikRef.current])


    function handleReset(){
        setIsEditInfo(null)
        setNewRowData(null)
        setZcaFilter('')
        setCurrentPage(1);
        setMachineState([])
           if (formikRef.current) {
            formikRef.current.resetForm({
                        values: {
                            // ตั้งค่าเริ่มต้นใหม่
                            zca: '',
                            mc: [],
                            nameShort:'',
                            namethai: '',
                            nameeng: '',
                            type: '',
                            brand: '',
                            prodgroup: '',
                            prodname: '',
                            size: '',
                            length: '',
                            lengthpallet: '',
                            pcsperpallet: '',
                            layer: '',
                            kgpcs: '',
                            tickness: '',

                            CT1: false,
                            CT2: false,
                            CT3: false,
                            CT4: false,
                            XY1: false,
                            CM5: false,
                            CM6: false,
                            CM7: false,
                            CM8: false,
                            AS1: false,
                            PK1: false,
                            PK2: false,
                            PK3: false,
                            PK4: false,
                            PK5: false,
                            DP1: false,
                            DET: false,
                            MS1: false,
                            OC1: false,
                            OC2: false,
                            OS1: false,
                            PL1: false,
                            RT1: false,
                            RT2: false,
                            SD1: false,
                            SEG: false,
                            DP2: false,
                            PK6: false,
                        }
                    });
        }
    }
    
    return (
        <>
            <Box pb={4} bgColor={bgColor}>
                <Formik
                    enableReinitialize
                    initialValues={{
                        zca: newRowData ? newRowData.field_zca : null,
                        mc: machineState ? machineState : [],
                        namethai: newRowData ? newRowData.field_name : null,
                        nameShort: newRowData ? newRowData.field_nameShort : null,
                        nameeng: newRowData ? newRowData.field_nameeng : null,
                        type: newRowData ? newRowData.field_type : null,
                        brand: newRowData ? newRowData.brand : null,
                        prodgroup: newRowData ? newRowData.field_prodgroup : null,
                        prodname: newRowData ? newRowData.field_prodname : null,
                        size: newRowData ? newRowData.field_size : null,
                        length: newRowData ? newRowData.field_length : null,
                        lengthpallet: newRowData ? newRowData.field_lengthpallet : "120",
                        pcsperpallet: newRowData ? newRowData.field_pcspallet : null,
                        layer: newRowData ? newRowData.field_layer : "1",
                        kgpcs: newRowData ? newRowData.field_kgpcs : null,
                        type1: newRowData ? newRowData.type1 : null,
                        tickness: newRowData ? newRowData.tickness : null,
                        
                        CT1: newRowData && newRowData.ct1 === 'ok' ?  true: false,
                        CT2: newRowData && newRowData.ct2 === 'ok' ? true : false,
                        CT3: newRowData && newRowData.ct3 === 'ok' ? true : false,
                        CT4: newRowData && newRowData.ct4 === 'ok' ? true : false,
                        XY1: newRowData && newRowData.xy1 === 'ok' ? true : false,
                        CM5: newRowData && newRowData.cm5 === 'ok' ? true : false,
                        CM6: newRowData && newRowData.cm6 === 'ok' ? true : false,
                        CM7: newRowData && newRowData.cm7 === 'ok' ? true : false,
                        CM8: newRowData && newRowData.cm8 === 'ok' ? true : false,
                        AS1: newRowData && newRowData.as1 === 'ok' ? true : false,
                        PK1: newRowData && newRowData.pk1 === 'ok' ? true : false,
                        PK2: newRowData && newRowData.pk2 === 'ok' ? true : false,
                        PK3: newRowData && newRowData.pk3 === 'ok' ? true : false,
                        PK4: newRowData && newRowData.pk4 === 'ok' ? true : false,
                        PK5: newRowData && newRowData.pk5 === 'ok' ? true : false,
                        DP1: newRowData && newRowData.dp1 === 'ok' ? true : false,
                        DET: newRowData && newRowData.det === 'ok' ? true : false,
                        MS1: newRowData && newRowData.ms1 === 'ok' ? true : false,
                        OC1: newRowData && newRowData.oc1 === 'ok' ? true : false,
                        OC2: newRowData && newRowData.oc2 === 'ok' ? true : false,
                        OS1: newRowData && newRowData.os1 === 'ok' ? true : false,
                        PL1: newRowData && newRowData.pl1 === 'ok' ? true : false,
                        RT1: newRowData && newRowData.rt1 === 'ok' ? true : false,
                        RT2: newRowData && newRowData.rt2 === 'ok' ? true : false,
                        SD1: newRowData && newRowData.sd1 === 'ok' ? true : false,
                        SEG: newRowData && newRowData.seg === 'ok' ? true : false,
                        DP2: newRowData && newRowData.dp2 === 'ok' ? true : false,
                        PK6: newRowData && newRowData.pk6 === 'ok' ? true : false,
                    }}
                    onSubmit={
                        async (values, { resetForm }) => {
                            console.log("Submit")
                            console.log(values)
                            console.log(iseditInfo,'isedisstInfo')

                            const result = await Swal.fire({
                                title: "แน่ใจแล้วใช่ไหม ?",
                                text: "กรุณาตรวจสอบข้อมูลก่อน!",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#103911",
                                confirmButtonText: "Submit",
                                closeOnConfirm: false
                            });
                            if (!result.isConfirmed) { return 0; }

                            if (iseditInfo != null) {

                                try {
                                    // Post data to the specified URL if no duplication is found
                                    const response = await client.post('wms/api/post_editzcawip_2', values);
                                    console.log('Post response:', response.data);
                            
                                    if (response.data.success === false) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error',
                                            text: response.data.message,
                                            timer: 1000,
                                            showConfirmButton: false,
                                        });
                                        return;
                                    }
                            
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Success',
                                        timer: 1000,
                                        showConfirmButton: false,
                                    });
                            
                                    // Reset the form and reload the data
                                    handleReset();
                                    fetchWIPData();
                            
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: error.message,
                                        timer: 1000,
                                        showConfirmButton: false,
                                    });
                                }
                            }

                             else {
                                try {
                                    // Post data to the specified URL
                                    console.log('value>>',values.zca)

                                    const zcaCheckResponse = await client.post('wms/api/check_zca', { zca: values.zca  , type:'WIP'});
                            
                                    if (zcaCheckResponse.data.exists === false && zcaCheckResponse.data.message.includes('Invalid ZCA format')) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Invalid ZCA Format',
                                            text: zcaCheckResponse.data.message,
                                            showConfirmButton: true,
                                        });
                                        return;
                                    }
                                
                                    if (zcaCheckResponse.data.exists) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'ZCA Already Exists',
                                            text: zcaCheckResponse.data.message,
                                            showConfirmButton: true,
                                        });
                                        return;
                                    }


                                    const response = await client.post('wms/api/post_editzcawip', values);
                                    console.log('Post responsexxx:', response.data);
                                    if (response.data.success == false) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'ผิดพลาด',
                                            text: response.data.message,
                                            timer: 1000,
                                            showConfirmButton: false,
                                        })
                                        return 0;
                                    }
                                    
                                    resetForm({
                                        values: {
                                            // ตั้งค่าเริ่มต้นใหม่
                                            zca: '',
                                            mc: [],
                                            nameShort:'',
                                            namethai: '',
                                            nameeng: '',
                                            type: '',
                                            brand: '',
                                            prodgroup: '',
                                            prodname: '',
                                            size: '',
                                            length: '',
                                            lengthpallet: '',
                                            pcsperpallet: '',
                                            layer: '',
                                            kgpcs: '',
                                            tickness: '',
    
                                            CT1: false,
                                            CT2: false,
                                            CT3: false,
                                            CT4: false,
                                            XY1: false,
                                            CM5: false,
                                            CM6: false,
                                            CM7: false,
                                            CM8: false,
                                            AS1: false,
                                            PK1: false,
                                            PK2: false,
                                            PK3: false,
                                            PK4: false,
                                            PK5: false,
                                            DP1: false,
                                            DET: false,
                                            MS1: false,
                                            OC1: false,
                                            OC2: false,
                                            OS1: false,
                                            PL1: false,
                                            RT1: false,
                                            RT2: false,
                                            SD1: false,
                                            SEG: false,
                                            DP2: false,
                                            PK6: false,
                                        }
                                    });
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'สำเร็จ',
                                        timer: 1000,
                                        showConfirmButton: false,
                                    });

                                    fetchWIPData();
    
                                } catch (error) {
                                    console.error('Error posting data:', error);
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: error,
                                        timer: 1000,
                                        showConfirmButton: false,
                                    })
                                }
                            }
                            
                        }
                    }
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form>
                            <Box
                                rounded={'lg'}
                                bg={bgColor}
                                p={8}
                                ref={addWipRef}
                            >
                                <Heading mb={4} fontSize={'xl'}>
                                    เพิ่มสินค้า WIP
                                </Heading>
                                <Stack spacing={4}>
                                    <FormControl isRequired isInvalid={formik.errors.zca}>
                                        <FormLabel>ZCA</FormLabel>
                                        <Input
                                            name="zca"
                                            type="text"
                                            bg={bgColor}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.zca}
                                            isDisabled={iseditInfo ? true : false}
                                        />
                                        {
                                            formik.errors.zca && (<FormErrorMessage>{formik.errors.zca}</FormErrorMessage>)
                                        }
                                    </FormControl>

                                    <FormControl isRequired isInvalid={formik.errors.namethai}>
                                        <FormLabel>ชื่อไทย</FormLabel>
                                        <Input
                                            name="namethai"
                                            type="text"
                                            bg={bgColor}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.namethai}
                                        />
                                        {
                                            formik.errors.namethai && (<FormErrorMessage>{formik.errors.namethai}</FormErrorMessage>)
                                        }
                                    </FormControl>

                                    <FormControl isRequired isInvalid={formik.errors.nameShort}>
                                        <FormLabel>ชื่อย่อ</FormLabel>
                                        <Input
                                            name="nameShort"
                                            type="text"
                                            bg={bgColor}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.nameShort}
                                        />
                                        {
                                            formik.errors.nameShort && (<FormErrorMessage>{formik.errors.nameShort}</FormErrorMessage>)
                                        }
                                    </FormControl>

                                    <FormControl isRequired isInvalid={formik.errors.nameeng}>
                                        <FormLabel>ชื่ออังกฤษ</FormLabel>
                                        <Input
                                            name="nameeng"
                                            type="text"
                                            bg={bgColor}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.nameeng}
                                        />
                                        {
                                            formik.errors.nameeng && (<FormErrorMessage>{formik.errors.nameeng}</FormErrorMessage>)
                                        }
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>ผลิตจากเครื่องจักร</FormLabel>
                                        <Wrap spacing={5}>
                                        {
                                            ["HS3", "HS4", "HS5", "HS6", "HS7", "HS8", "HS9",
                                            "CT1", "CT2", "CT3", "CT4",
                                            "XY1", "CM5", "CM6", "CM7", "CM8",
                                            "AS1", "PK1", "PK2", "PK3", "PK4", "PK5", "PK6",
                                            "DET", "MS1", "OC1", "OC2", "DP1", "DP2", "OS1",
                                            "PL1", "RT1", "RT2", "SD1", "SEG"].map(item => {
                                                return(
                                                    <WrapItem key={item}>
                                                        <Checkbox
                                                            isChecked={formik.values.mc.includes(item)}
                                                            onChange={(e) => {
                                                                formik.handleChange(e);
                                                                const isChecked = e.target.checked;
                                                                
                                                                if (isChecked) {
                                                                    formik.setFieldValue(
                                                                        "mc",
                                                                        [...formik.values.mc, item]
                                                                    );
                                                                } else {
                                                                    formik.setFieldValue(
                                                                        "mc",
                                                                        formik.values.mc.filter(value => value !== item)
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {item}
                                                        </Checkbox>
                                                    </WrapItem>
                                                );
                                            })
                                        }
                                        </Wrap>
                                    </FormControl>
                                    <HStack>
                                        <FormControl isRequired isInvalid={formik.errors.type}>
                                            <FormLabel>Type [ex. wood, board]</FormLabel>
                                            <Select
                                                name="type"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.type}
                                            >
                                                <option value="">Select type</option>
                                                <option value="wood">Wood</option>
                                                <option value="board">Board</option>
                                                {/* Add more options as needed */}
                                            </Select>
                                            {formik.errors.type && (<FormErrorMessage>{formik.errors.type}</FormErrorMessage>)}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={formik.errors.brand}>
                                            <FormLabel>Brand [ex. SCG, DURA, SUN,...]</FormLabel>
                                            <Select
                                                name="brand"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.brand}
                                            >
                                                <option value="">Select brand</option>
                                                <option value="SCG">SCG</option>
                                                <option value="DURA">DURA</option>
                                                <option value="SUN">SUN</option>
                                            </Select>
                                            {formik.errors.brand && (<FormErrorMessage>{formik.errors.brand}</FormErrorMessage>)}
                                        </FormControl>
                                    </HStack>

                                    <HStack>
                                        <FormControl isRequired isInvalid={formik.errors.prodgroup}>
                                            <FormLabel>Product Group [ex. ไม้ฝา, ไม้ดูร่า, ดูร่าบอร์ด, สมาร์ทบอร์ด SCG, สมาร์ทวูด SCG,...]</FormLabel>
                                            <Input
                                                name="prodgroup"
                                                type="text"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.prodgroup}
                                            />
                                            {
                                                formik.errors.prodgroup && (<FormErrorMessage>{formik.errors.prodgroup}</FormErrorMessage>)
                                            }
                                        </FormControl>

                                        <FormControl isRequired isInvalid={formik.errors.prodname}>
                                            <FormLabel>Product Name [ex. ดูร่าบอร์ด เซาะร่อง3นิ้ว]</FormLabel>
                                            <Input
                                                name="prodname"
                                                type="text"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.prodname}
                                            />
                                            {
                                                formik.errors.prodname && (<FormErrorMessage>{formik.errors.prodname}</FormErrorMessage>)
                                            }
                                        </FormControl>
                                    </HStack>
                                    
                                    <HStack>
                                        <FormControl isRequired isInvalid={formik.errors.size}>
                                            <FormLabel>Size [ex. 120.9x244x0.6 (WIP MS)]</FormLabel>
                                            <Input
                                                name="size"
                                                type="text"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.size}
                                            />
                                            {
                                                formik.errors.size && (<FormErrorMessage>{formik.errors.size}</FormErrorMessage>)
                                            }
                                        </FormControl>

                                        <FormControl isRequired isInvalid={formik.errors.length}>
                                            <FormLabel>ขนาดกว้าง (cm) [ex. 244]</FormLabel>
                                            <Input
                                                name="length"
                                                type="text"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.length}
                                            />
                                            {
                                                formik.errors.length && (<FormErrorMessage>{formik.errors.length}</FormErrorMessage>)
                                            }
                                        </FormControl>
                                    </HStack>

                                    <HStack>
                                        <FormControl isRequired isInvalid={formik.errors.lengthpallet}>
                                            <FormLabel>ขนาดของ Pallet (m)</FormLabel>
                                            <Select
                                                name="lengthpallet"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.lengthpallet}
                                            >
                                                <option value='120'>1.2 เมตร</option>
                                                <option value='240'>2.4 เมตร</option>
                                                <option value='300'>3.0 เมตร</option>
                                                <option value='400'>4.0 เมตร</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired isInvalid={formik.errors.layer}>
                                            <FormLabel>จำนวนชั้น </FormLabel>
                                            <Select
                                                name="layer"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.layer}
                                            >
                                                <option value='1'>1 ชั้น</option>
                                                <option value='2'>2 ชั้น</option>
                                                <option value='3'>3 ชั้น</option>
                                                <option value='4'>4 ชั้น</option>
                                                <option value='5'>5 ชั้น</option>
                                                <option value='6'>6 ชั้น</option>
                                            </Select>
                                            {
                                                formik.errors.layer && (<FormErrorMessage>{formik.errors.layer}</FormErrorMessage>)
                                            }
                                        </FormControl>
                                    </HStack>

                                    <HStack>
                                        <FormControl isRequired isInvalid={formik.errors.pcsperpallet}>
                                            <FormLabel>แผ่น / Pallet</FormLabel>
                                            <Input
                                                name="pcsperpallet"
                                                type="text"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.pcsperpallet}
                                            />
                                            {
                                                formik.errors.pcsperpallet && (<FormErrorMessage>{formik.errors.pcsperpallet}</FormErrorMessage>)
                                            }
                                        </FormControl>

                                        

                                        <FormControl isRequired isInvalid={formik.errors.kgpcs}>
                                            <FormLabel>Kg/Pcs</FormLabel>
                                            <Input
                                                name="kgpcs"
                                                type="number"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.kgpcs}
                                            />
                                            {
                                                formik.errors.kgpcs && (<FormErrorMessage>{formik.errors.kgpcs}</FormErrorMessage>)
                                            }
                                        </FormControl>
                                        <FormControl isRequired isInvalid={formik.errors.tickness}>
                                            <FormLabel>ความหนา (mm) [ex. 8]</FormLabel>
                                            <Input
                                                name="tickness"
                                                type="number"
                                                bg={bgColor}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.tickness}
                                            />
                                            {
                                                formik.errors.tickness && (<FormErrorMessage>{formik.errors.tickness}</FormErrorMessage>)
                                            }
                                        </FormControl>
                                    </HStack>

                                    

                                    <FormControl>
                                        <FormLabel>เครื่องจักรที่สามารถผลิตต่อได้</FormLabel>
                                        <Wrap spacing={5}>
                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CT1}
                                                    onChange={(e) => { formik.setFieldValue("CT1", e.target.checked); }}
                                                >
                                                    CT1
                                                </Checkbox>
                                            </WrapItem>
                                            
                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CT2}
                                                    onChange={(e) => { formik.setFieldValue("CT2", e.target.checked); }}
                                                >
                                                    CT2
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CT3}
                                                    onChange={(e) => { formik.setFieldValue("CT3", e.target.checked); }}
                                                >
                                                    CT3
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CT4}
                                                    onChange={(e) => { formik.setFieldValue("CT4", e.target.checked); }}
                                                >
                                                    CT4
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.XY1}
                                                    onChange={(e) => { formik.setFieldValue("XY1", e.target.checked); }}
                                                >
                                                    XY1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CM5}
                                                    onChange={(e) => { formik.setFieldValue("CM5", e.target.checked); }}
                                                >
                                                    CM5
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CM6}
                                                    onChange={(e) => { formik.setFieldValue("CM6", e.target.checked); }}
                                                >
                                                    CM6
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CM7}
                                                    onChange={(e) => { formik.setFieldValue("CM7", e.target.checked); }}
                                                >
                                                    CM7
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.CM8}
                                                    onChange={(e) => { formik.setFieldValue("CM8", e.target.checked); }}
                                                >
                                                    CM8
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.AS1}
                                                    onChange={(e) => { formik.setFieldValue("AS1", e.target.checked); }}
                                                >
                                                    AS1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PK1}
                                                    onChange={(e) => { formik.setFieldValue("PK1", e.target.checked); }}
                                                >
                                                    PK1
                                                </Checkbox>
                                            </WrapItem>
                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PK2}
                                                    onChange={(e) => { formik.setFieldValue("PK2", e.target.checked); }}
                                                >
                                                    PK2
                                                </Checkbox>
                                            </WrapItem>
                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PK3}
                                                    onChange={(e) => { formik.setFieldValue("PK3", e.target.checked); }}
                                                >
                                                    PK3
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PK4}
                                                    onChange={(e) => { formik.setFieldValue("PK4", e.target.checked); }}
                                                >
                                                    PK4
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PK5}
                                                    onChange={(e) => { formik.setFieldValue("PK5", e.target.checked); }}
                                                >
                                                    PK5
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.DP1}
                                                    onChange={(e) => { formik.setFieldValue("DP1", e.target.checked); }}
                                                >
                                                    DP1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.DET}
                                                    onChange={(e) => { formik.setFieldValue("DET", e.target.checked); }}
                                                >
                                                    DET
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.MS1}
                                                    onChange={(e) => { formik.setFieldValue("MS1", e.target.checked); }}
                                                >
                                                    MS1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.OC1}
                                                    onChange={(e) => { formik.setFieldValue("OC1", e.target.checked); }}
                                                >
                                                    OC1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.OC2}
                                                    onChange={(e) => { formik.setFieldValue("OC2", e.target.checked); }}
                                                >
                                                    OC2
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.OS1}
                                                    onChange={(e) => { formik.setFieldValue("OS1", e.target.checked); }}
                                                >
                                                    OS1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PL1}
                                                    onChange={(e) => { formik.setFieldValue("PL1", e.target.checked); }}
                                                >
                                                    PL1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.RT1}
                                                    onChange={(e) => { formik.setFieldValue("RT1", e.target.checked); }}
                                                >
                                                    RT1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.RT2}
                                                    onChange={(e) => { formik.setFieldValue("RT2", e.target.checked); }}
                                                >
                                                    RT2
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.SD1}
                                                    onChange={(e) => { formik.setFieldValue("SD1", e.target.checked); }}
                                                >
                                                    SD1
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.SEG}
                                                    onChange={(e) => { formik.setFieldValue("SEG", e.target.checked); }}
                                                >
                                                    SEG
                                                </Checkbox>
                                            </WrapItem>

                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.DP2}
                                                    onChange={(e) => { formik.setFieldValue("DP2", e.target.checked); }}
                                                >
                                                    DP2
                                                </Checkbox>
                                            </WrapItem>
                                            <WrapItem>
                                                <Checkbox
                                                    size='md'
                                                    isChecked={formik.values.PK6}
                                                    onChange={(e) => { formik.setFieldValue("PK6", e.target.checked); }}
                                                >
                                                    PK6
                                                </Checkbox>
                                            </WrapItem>
                                        </Wrap>
                                    </FormControl>

                                    
                                </Stack>
                                <HStack>
                                    <Button
                                        mt={4}
                                        px={10}
                                        size="lg"
                                        bg={ iseditInfo ? 'yellow.400' : 'blue.400' }
                                        color={'white'}
                                        _hover={{
                                            bg: iseditInfo ? 'yellow.500' : 'blue.500' ,
                                        }}
                                        type='submit'
                                    >
                                        { iseditInfo ? `แก้ไข WIP` : `เพิ่ม WIP` }
                                    </Button>
                                    { iseditInfo && (
                                        <Button
                                            mt={4}
                                            px={10}
                                            size="lg"
                                            bg={'red.400'}
                                            color={'white'}
                                            _hover={{
                                                bg: 'red.500',
                                            }}
                                            onClick={handleReset}
                                            >
                                            ยกเลิก
                                        </Button>
                                    )}
                                    
                                
                                </HStack>
                                
                                
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
            <Box p={2} w={"100%"} borderRadius={"xl"} border='1px' borderColor='gray.200'>
            <FormControl style={{ zIndex: 50 }} minW={"250px"} mb='4'>
                                            <FormLabel fontWeight={900}>
                                                Search ZCA No.
                                            </FormLabel>
                                            <ChakraReactSelect
                                                placeholder='type here...'
                                                options={zcaOptions}
                                                onChange={setZcaFilter}
                                                isClearable={true}
                                                value={zcaOptions.find(option => option.value === zcaFilter) }
                                                menuPortalTarget={document.body}
                                                styles={
                                                    { 
                                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                        menuList: base => ({
                                                            ...base,
                                                            minHeight: "400px" // your desired height
                                                        }),
                                                        option: base => ({
                                                            ...base,
                                                            padding: "5px" // your desired height
                                                        }),
                                                    }
                                                }
                                            />
            </FormControl>

                <Table height={690} data={currentData} rowHeight={65} isLoading>

                    <Column verticalAlign="middle" width={60} resizable fixed="left" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ID</HeaderCell>
                        <Cell dataKey="field_id"/>
                    </Column>

                    <Column verticalAlign="middle" width={150} resizable align="center" fullText fixed="left" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ZCA</HeaderCell>
                        <Cell dataKey="field_zca" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>เครื่องจักร</HeaderCell>
                        <Cell dataKey="field_mc" />
                    </Column>

                    <Column verticalAlign="middle" width={350} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ชื่อไทย</HeaderCell>
                        <Cell dataKey="field_name" />
                    </Column>
                    
                    <Column verticalAlign="middle" width={350} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ชื่ออังกฤษ</HeaderCell>
                        <Cell dataKey="field_nameeng" />
                    </Column>

                    <Column verticalAlign="middle" width={350} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ชื่อย่อ</HeaderCell>
                        <Cell dataKey="field_nameShort" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ประเภท</HeaderCell>
                        <Cell dataKey="field_type" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>Brand</HeaderCell>
                        <Cell dataKey="brand" />
                    </Column>

                    <Column verticalAlign="middle" width={200} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>Product Group</HeaderCell>
                        <Cell dataKey="field_prodgroup" />
                    </Column>

                    <Column verticalAlign="middle" width={200} resizable align="center" fullTex style={{ backgroundColor: bgColor }}>
                        <HeaderCell>Product Name</HeaderCell>
                        <Cell dataKey="field_prodname" />
                    </Column>

                    <Column verticalAlign="middle" width={200} resizable align="center" fullText style={{ backgroundColor: bgColor }} >
                        <HeaderCell>Size</HeaderCell>
                        <Cell dataKey="field_size" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ขนาดกว้าง</HeaderCell>
                        <Cell dataKey="field_length" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ขนาด Pallet</HeaderCell>
                        <Cell dataKey="field_lengthpallet" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>แผ่น/Pallet</HeaderCell>
                        <Cell dataKey="field_pcspallet" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ชั้น</HeaderCell>
                        <Cell dataKey="field_layer" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>Kg/Pcs</HeaderCell>
                        <Cell dataKey="field_kgpcs" />
                    </Column>
                    
                    <Column verticalAlign="middle" width={100} resizable align="center" fullText style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ความหนา</HeaderCell>
                        <Cell dataKey="tickness" />
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CT1</HeaderCell>
                        <Cell>
                        {
                            (rowData, rowIndex) => {
                                if (rowData.ct1 == "ok") {
                                    return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                }
                            }
                        }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CT2</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.ct2 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CT3</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.ct3 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CT4</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.ct4 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>XY1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.xy1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CM5</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.cm5 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CM6</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.cm6 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CM7</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.cm7 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>CM8</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.cm8 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>AS1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.as1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>PK1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.pk1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>PK2</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.pk2 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>PK3</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.pk3 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>PK4</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.pk4 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>DP1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.dp1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>


                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>DET</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.det == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>MS1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.ms1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>OC1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.oc1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>OC2</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.oc2 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>OS1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.os1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>PL1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.pl1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>RT1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.rt1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>RT2</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.rt2 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>SD1</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.sd1 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>SEG</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.seg == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>DP2</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.dp2 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>

                    <Column verticalAlign="middle" width={80} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>PK6</HeaderCell>
                        <Cell>
                            {
                                (rowData, rowIndex) => {
                                    if (rowData.pk6 == "ok") {
                                        return (<Tag p={2} size={"lg"} colorScheme='green' variant='solid' rounded={"md"}>OK</Tag>);
                                    }
                                }
                            }
                        </Cell>
                    </Column>


                    <Column verticalAlign="middle" width={100} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>วันที่เพิ่ม</HeaderCell>
                        <Cell dataKey="created_at_new" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ผู้เพิ่ม</HeaderCell>
                        <Cell dataKey="operator_keyin_new" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>วันที่แก้ไข</HeaderCell>
                        <Cell dataKey="updated_at_new" />
                    </Column>

                    <Column verticalAlign="middle" width={100} resizable align="center" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>ผู้แก้ไข</HeaderCell>
                        <Cell dataKey="operator_edit_new" />
                    </Column>

                    <Column verticalAlign="middle" width={iseditInfo ? 100 : 150} resizable align="center" fixed="right" style={{ backgroundColor: bgColor }}>
                        <HeaderCell>Action</HeaderCell>
                        <Cell>
                            {(rowData, rowIndex) => {
                                return(
                                        <HStack>
                                            
                                            {iseditInfo == null ? (
                                                <>
                                                    <IconButton size='md' icon={<FiEdit />} colorScheme='teal' onClick={ ()=> {
                                                            handleScroll()
                                                            
                                                            setZcaFilter({
                                                                value: rowData.field_zca,
                                                                label: `${rowData.field_zca} ${rowData.field_name}`
                                                            })
                                                            setCurrentPage(1);
                                                            setNewRowData(rowData)
                                                            setIsEditInfo(rowData.field_zca)
                                                    }}/>
                                                    <IconButton size='md' icon={<AiOutlineDelete />} colorScheme='red' onClick={() => { handleDeleteRow(rowData.field_id) }} />
                                                </>
                                            ) : iseditInfo === rowData.field_zca ? (
                                                    <IconButton ref={CloseButtonRef} size='md' icon={<CloseButton />} colorScheme='red' onClick={handleReset} />
                                            ) : null}
                                        </HStack>
                                );
                            }}
                        </Cell>
                    </Column>
                    </Table>
                <Divider />
                <Box mt={3} >
                    <Flex px={2}>
                        <Heading fontSize='1.4rem' style={{ alignSelf: 'center' }}>Bifröst Datatable</Heading>
                        <Spacer />
                        <HStack p={4} borderRadius={"xl"} border='1px' borderColor='gray.200'>
                            <Text size='md' mr={5}>{`รายการที่ ${firstRowIndex + 1} - ${Math.min(lastRowIndex, filteredTableData.length)} จาก ${filteredTableData.length}`}</Text>
                            <IconButton
                                size='sm'
                                icon={<BiChevronLeft />}
                                colorScheme='teal'
                                onClick={handlePrevPage}
                                isDisabled={currentPage === 1}
                            />
                            <Text size='md'>{`หน้าที่ ${currentPage} จาก ${pageCount}`}</Text>
                            <IconButton
                                size='sm'
                                icon={<BiChevronRight />}
                                colorScheme='teal'
                                onClick={handleNextPage}
                                isDisabled={currentPage === pageCount}
                            />
                        </HStack>
                    </Flex>
                </Box>

            </Box>
        </>
    );
};

export default HomePage;