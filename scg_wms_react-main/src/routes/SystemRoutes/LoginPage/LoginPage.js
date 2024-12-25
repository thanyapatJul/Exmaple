import {
  Flex,
  Text,
  Heading,
  Input,
  Stack,
  Image,
  Box,
  AbsoluteCenter,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";

import {
  Button,
  InputGroup,
  InputRightElement,
  Center,
  Spacer,
} from "@chakra-ui/react";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import { useColorModeValue } from "@chakra-ui/react";

import { Divider } from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import SCGlogo from "./image/SCG.png";
import BG1 from "./image/SCG-siam-cement-group.jpg";
import BG2 from "./image/SCG_Buiding-e0a97982-scaled-1.jpg.webp";

import { ColorModeSwitcher } from "../../../ColorModeSwitcher";

import Axios from "axios";
import { HStack } from "rsuite";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;

export default function SplitScreen() {
  const [backgroundImage, setBackgroundImage] = useState(BG1);
  const [username, setUsername] = useState(""); // Add state to store username
  const [password, setPassword] = useState(""); // Add state to store password
  const [showAlert, setShowAlert] = useState(false);
  const [modeAlert, setModeAlert] = useState("error");
  const [titleAlert, setTitleAlert] = useState("Error!");
  const [responseMessage, setResponseMessage] = useState("");
  let navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  useEffect(() => {
    // Toggle background image every 5 seconds
    const interval = setInterval(() => {
      setBackgroundImage((prevImage) => (prevImage === BG1 ? BG2 : BG1));
    }, 5000); // Adjust the interval time as needed

    return () => clearInterval(interval);
  }, []);

  const bgColor_theme = useColorModeValue("white", "gray.900");
  const LogoColor = useColorModeValue("none", "invert(100%) brightness(200%)");
  return (
    <Stack
      spacing={0}
      minH={"100vh"}
      direction={{ base: "column", md: "row" }}
      bgColor={useColorModeValue("white", "gray.900")}
    >

        
      <Flex position="absolute" top="0" left="0" m={5} align="center">
        <Image src={SCGlogo} alt="SCG Logo" width="100px" height="40px" />
      </Flex>
      <Flex position="absolute" top="0" right="0" m={5}>
        <ColorModeSwitcher />
      </Flex>
      <Flex position="absolute" bottom="0" right="0" m={5}>
        version 1.3
      </Flex>
      <Flex flex={0} hideBelow="md">
        <Image
          alt={"Login Image"}
          objectFit={"cover"}
          src={process.env.PUBLIC_URL + "/img/WIPTL.jpg"}
        />
      </Flex>
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Formik
          enableReinitialize
          initialValues={{
            username: "",
            password: "",
          }}
          validateOnBlur={false}
          validationSchema={Yup.object().shape({
            username: Yup.string().required("กรุณาระบุชื่อผู้ใช้"),
            password: Yup.string().required("กรุณาระบุรหัสผ่าน"),
          })}
          onSubmit={async (values) => {
            try {
              const response = await client.post("/wms/api/login", {
                username: values.username,
                password: values.password,
              });

              if (response.data.success) {
                setModeAlert("success");
                setTitleAlert("Success!");
                setResponseMessage(response.data.message);
                setShowAlert(true);
                localStorage.setItem("first_name", response.data.first_name);
                localStorage.setItem("last_name", response.data.last_name);
                localStorage.setItem("employee_id", response.data.employee_id);
                localStorage.setItem("role_id", response.data.role_id);
                localStorage.setItem("role_name", response.data.role_name);
                navigate(response.data.redirect_url);
              } else {
                setModeAlert("error");
                setTitleAlert("Error!");
                setShowAlert(true);
                setResponseMessage(response.data.message);
                setShowAlert(true);
              }
            } catch (error) {
              console.error("Error submitting login:", error);
              setModeAlert("error");
              setTitleAlert("Error!");
              setResponseMessage(
                error.message + " : ติดต่อกับเซิฟเวอร์ Backend ไม่ได้"
              );
              setShowAlert(true);
            } finally {
              // Clear the password field after login attempt
              values.password = "";
            }
          }}
        >
          {(formik) => (
            <Form>
              <Stack spacing={4} w={"full"} maxW={"md"}>
                <Center>
                  <Image
                    src="/img/logo.svg"
                    alt="Logo"
                    boxSize="80px"
                    filter={LogoColor}
                  />{" "}
                </Center>
                <Heading fontSize={"4xl"}>FutureForce - SCGTL</Heading>
                <Box position="relative" padding="2">
                  <Divider />
                  <AbsoluteCenter px="4" bgColor={bgColor_theme}>
                    Login
                  </AbsoluteCenter>
                </Box>
                <FormControl id="username" isInvalid={formik.errors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.username}
                  />
                  {formik.errors.username && (
                    <FormErrorMessage>
                      {formik.errors.username}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl id="password" isInvalid={formik.errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup size="md">
                    <Input
                      type={show ? "text" : "password"}
                      pr="4.5rem"
                      name="password"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {formik.errors.password && (
                    <FormErrorMessage>
                      {formik.errors.password}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <Stack spacing={6}>
                  <Button
                    colorScheme={"blue"}
                    variant={"solid"}
                    type="submit"
                    isLoading={formik.isSubmitting}
                  >
                    ล็อกอิน
                  </Button>
                </Stack>
                {showAlert && (
                  <Alert status={modeAlert}>
                    <AlertIcon />
                    <AlertTitle>{titleAlert}</AlertTitle>
                    <AlertDescription>{responseMessage}</AlertDescription>
                  </Alert>
                )}

                <Flex p={8} flex={1} align={"center"} justify={"center"}>
                  {/* Your content components here */}
                  <Image
                    src={SCGlogo}
                    alt="SCG Logo"
                    width="100px"
                    position="absolute"
                    top="0"
                    left="0"
                    m={5}
                  />
                  {/* Form, headings, etc. */}
                </Flex>
              </Stack>
            </Form>
          )}
        </Formik>
      </Flex>
    </Stack>
  );
}
