import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, StackDivider, Box, Text, Button, ButtonGroup, Divider, Image, Spinner, SlideFade, ScaleFade, Progress, VisuallyHidden, Center } from '@chakra-ui/react'
import React, { Component, useState, useEffect, useRef } from 'react';
import { FormControl, FormLabel, Input, VStack,useTheme,useColorModeValue, } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react'
import { SimpleGrid } from '@chakra-ui/react'
import { Flex, Spacer } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { GiEdgeCrack } from "react-icons/gi";
import Swal from 'sweetalert2'
import { AiFillPrinter } from 'react-icons/ai';

import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";

import ReactSelect from 'react-select';
import Axios from 'axios';
import moment from 'moment-timezone';
import makeAnimated from 'react-select/animated';

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


const ReadScanner = (props) => {
    const onClose = props.CloseProps;

    const inputRef = useRef(null);
    const SendQRcode = () => {
        const queryParams = {
            id:props.id,
            zca: props.zca,
            machine:props.machine,
            numpallet:(props.numpallet)?props.numpallet:NumWood,
            qty:props.qty,
            date:(props.dateprod)?props.dateprod:defaultPDDateCarve,
            shift:(props.shift)?props.shift:shift,
            idForklift:ForkliftUsers_stage.value,
        };
        client.post('wms/api/send_help_forklift', { params: queryParams })
            .then(response => {
                // Assuming the response data is an array of options
                
            })
            .catch(error => {
                console.error('Error fetching options:', error);
            });
    };
    const [ForkliftUsers, setForkliftUsers] = useState(null);
    const [ForkliftUsers_stage, setForkliftUsers_stage] = useState(null);
    const fetch_userforklift = () => {
        client.get('wms/api/get_userForklift')
            .then(response => {
                // Assuming the response data is an array of options
                setForkliftUsers(response.data.data)
                
            })
            .catch(error => {
                console.error('Error fetching options:', error);
            });
    };


    const [activeInput, setActiveInput] = useState(''); // Start with 'qr' or 'wood' based on your default preference

    const handleInputChange = (e) => {
        setNameEmployee(e.target.value);
    };
    useEffect(() => {
        fetch_userforklift()
    },[])
    useEffect(() => {
        // fetchProductFGData();
        // fetchProductFillWIPData();
        const handleKeyDown = (event) => {
            const isLetterOrNumber = /^[0-9]$/.test(event.key);

            if (isLetterOrNumber) {
                if (activeInput === 'name' && document.activeElement !== inputRef.current) {
                    inputRef.current.focus();
                }
            }else if (isLetterOrNumber) {
                if (activeInput === 'wood' && document.activeElement !== inputWoodRef.current) {
                    inputWoodRef.current.focus();
                } else if (activeInput === 'fraction' && document.activeElement !== inputWoodFractionRef.current) {
                    inputWoodFractionRef.current.focus();
                } else if (activeInput === 'fractionPlace' && document.activeElement !== inputWoodFractionplaceRef.current) {
                    inputWoodFractionplaceRef.current.focus();
                }
            }
        };

        // Add an event listener for keyboard events
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            // Remove the event listener when the component unmounts
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeInput]); // Depend on activeInput to adjust focus as needed

    const [NameEmployee, setNameEmployee] = useState(null);

    const inputWoodRef = useRef(null);
    const inputWoodFractionRef = useRef(null);
    const inputWoodFractionplaceRef = useRef(null);
    const [NumWood, setNumWood] = useState(null);
    const [NumFractionWood, setNumFractionWood] = useState('');
    const [FractionPlaceWood, setFractionPlaceWood] = useState('');
    const [defaultPDDateCarve, setDefaultPDDateCarve] = useState('');
    const [shift, setshift] = useState(null);
    
    const PD_DateCarveRef = useRef();

    const handleShiftChange = (event) => {
        setshift(event.target.value);  // Update state with selected option value
    };
    const handleWoodInputChange = (e) => {
        setNumWood(e.target.value);
    };

    const [errors, setErrors] = useState({});

    const validateInputs = () => {
        let isValid = true;
        let isFully = true;
        const newErrors = {};

        const inputs = {
            NumWood: inputWoodRef.current,
        };
    
        // Check if required fields are empty and highlight them
        for (const key in inputs) {
            inputs[key].style.border = '';
        }

        for (const key in inputs) {
            if ( (!inputs[key].value) ) {
                inputs[key].style.border = '2px solid red';
                isValid = false;
            } else {
                inputs[key].style.border = '';
            }
        }
        if (!ForkliftUsers_stage) {
            newErrors.nameProduct = true;
            isValid = false;
        }

        if (!isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "ใส่ไม่ครบ",
                timer: 1500,
                showConfirmButton: false,
            });
            setErrors(newErrors);
            return false;
        }
        if(!isFully){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "ID ไม่ครบ 10 ตัว",
                timer: 1500,
                showConfirmButton: false,
            });
            setErrors(newErrors);
            return false;
        }

        return isValid;
    };
    

    const handleSubmit = () => {
        if (validateInputs()) {
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                timer: 1000,
                showConfirmButton: false,
            })
            SendQRcode()
        }
    };
    const handleNameOnFocus = () =>{
        setActiveInput('name');
    }
    const handleWoodOnFocus = () =>{
        setActiveInput('wood');
    }
    const handleOnBlur = () => {
        // inputRef.current.value = "" // Clear the input value when it loses focus
        setActiveInput('');
    };
    const PD_ShiftRef = useRef();
    const handleKeyDownWood = (event) => {
        if (!/^[-,0-9]$/.test(event.key) && !isControlKey(event.key)) {
            event.preventDefault();
        }
    };

    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('black', 'white');

    const isControlKey = (key) => {
        return ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(key);
    };

    const handleKeyDownName = (event) => {
       if (!/^[0-9]$/.test(event.key) && !isControlKey(event.key)) {
            event.preventDefault();
        }
    };

    const menuBgColor = useColorModeValue('white', 'black');
    const optionBgColor = useColorModeValue('gray.100', 'gray.700');
    const optionFocusedBgColor = useColorModeValue('blue', 'gray');
    const borderColor = useColorModeValue('gray.300', 'gray.600');

    const customReactSelectStyles = (hasError, bgColor, textColor, borderColor, optionFocusedBgColor, optionBgColor, menuBgColor) => ({
        control: (styles) => ({
            ...styles,
            borderColor: hasError ? 'red' : borderColor,
            boxShadow: 'none',
            backgroundColor: bgColor,
            color: textColor,
            '&:hover': { borderColor: hasError ? 'red' : 'gray.400' },
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isFocused ? optionFocusedBgColor : optionBgColor,
            color: isFocused ? 'white' : textColor,
            '&:active': {
                backgroundColor: "black",
            },
        }),
        menu: (styles) => ({
            ...styles,
            zIndex: 9999,
            backgroundColor: menuBgColor,
            borderColor: borderColor,
            borderWidth: '1px',
        }),
        singleValue: (styles) => ({
            ...styles,
            color: textColor,
        }),
        menuPortal: base => ({ ...base, zIndex: 9999})
    });

    return (
        <Box textAlign="center" py={10} px={6} minH={"70vh"} bg={useColorModeValue('gray.50', 'gray.800')}>
            <Center mt={6} mb={2}>
                <Box display="flex" alignItems="center" color={useColorModeValue('black', 'teal.200')}>
                    <Heading as="h2" size="xl" mr={2}>
                        ใส่ค่าเพื่อส่งตั๋วให้ Forklift
                    </Heading>
                </Box>
            </Center>
            <VStack spacing={5} align="stretch">
                <Flex w="full" gap={4} mt={4}>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>ZCA :</label>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.zca}</label>
                    <span>&nbsp;&nbsp;</span>
                    <Spacer/>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>machine. :</label>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.machine}</label>
                    <Spacer/>
                    <Spacer/>
                </Flex>
                <Flex w="full" gap={4} mt={4}>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>Name :</label>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.nameth}</label>
                    <Spacer y={2} />
                    {props.numpallet?
                    <>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>pallet_no :</label>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.numpallet}</label>
                    </>
                    :<>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>pallet_no :</label>
                        <Input
                            placeholder='ไม้'
                            type='text'
                            ref = {inputWoodRef}
                            onBlur={handleOnBlur}
                            onChange={handleWoodInputChange}
                            onFocus={handleWoodOnFocus}
                            onKeyDown={handleKeyDownWood}
                            variant="filled"
                            bg={bgColor}
                            color={textColor}
                        />
                    </>}
                    <Spacer y={2} />
                    {props.qty?
                    <>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>QTY :</label>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.qty}</label>
                    </>
                    :("")}
                    <Spacer y={2} />
                </Flex>
                <Flex w="full" gap={4} mt={4}>
                    {props.dateprod?
                    <>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>Date :</label>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.dateprod}</label>
                    </>
                    :<>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>Date :</label>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>Unknow</label>
                    </>}
                    <Spacer/>
                    {props.shift?
                    <>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>shift :</label>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{props.shift}</label>
                    </>
                    :<>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>shift :</label>
                        <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>Unknow</label>
                    </>}
                    <Spacer/>
                </Flex>
                <Flex w="full" gap={4} mt={4}>
                    <label htmlFor="employeeName" style={{ whiteSpace: 'nowrap' }}>{("ID พนักงาน")}</label>
                    <Box w={"100%"}>
                        <ReactSelect
                            value={ForkliftUsers_stage}
                            className="basic-single"
                            classNamePrefix="select"
                            isSearchable={true}
                            name="color"
                            options={ForkliftUsers}
                            onChange={setForkliftUsers_stage}
                            menuPortalTarget={document.body}
                            styles={customReactSelectStyles(errors.nameProduct, bgColor, textColor, borderColor, optionFocusedBgColor, optionBgColor, menuBgColor)}
                        />
                    </Box>
                </Flex>
                <Flex w="full" gap={4} mt={4}>
                    <Button colorScheme='teal' w="full" onClick={handleSubmit} size='lg'>
                        ส่ง
                    </Button>
                    <Button colorScheme='red' w="full" onClick={onClose} size='lg'>
                        ยกเลิก
                    </Button>
                </Flex>
            </VStack>
        </Box>
    );
}
export default ReadScanner;