import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    Image,
    Font,
} from "@react-pdf/renderer";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Flex, Heading, VStack } from '@chakra-ui/react';
import BoxLoader from '../../../components/BoxLoader';

import Axios from 'axios';
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

Font.register({
    family: 'SCG',
    src: '/fonts/SCG/SCG-Bol.otf'
});

Font.register({
    family: 'SCG-Reg',
    src: '/fonts/SCG/SCG-Reg.otf'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: "row",
        color: "#1B03A3",
        backgroundColor: "#fff",
    },
    section: {
        margin: 10,
        padding: 10,
    },
    viewer: {
        width: "100%",
        height: "100vh",
    },
    backgroundImage: {
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: -1, // ให้รูปภาพอยู่ด้านหลัง
    },
    content: {
        zIndex: 1, // ให้เนื้อหาอยู่ด้านหน้า
    },
});

function BasicDocument() {

    let [searchParams, setSearchParams] = useSearchParams();

    const [LoadingStatus, setLoadingStatus] = useState(true);

    const [data, setData] = useState([]);
    const [pdf_approve, setpdf_approve] = useState("");
    const [pdf_matdoc, setpdf_matdoc] = useState("");
    const [pdf_costcenter, setpdf_costcenter] = useState("");

    const [pages, setPages] = useState([]);

    useEffect(() => {
        fetchData().then((result) => {
            setData(result.data);
            setpdf_approve(result.pdf_approve);
            setpdf_matdoc(result.pdf_matdoc);
            setpdf_costcenter(result.pdf_costcenter);
        });
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            const generatedPages = generatePDFPages(data);
            setPages(generatedPages);
        }
    }, [data]);

    const fetchData = async () => {
        const queryParams = {
            date: searchParams.get("date"),
            shift: searchParams.get("shift"),
            machine: searchParams.get("machine")
        };
        // เรียก API จาก Backend โดยใช้ axios
        try {
            const response = await client.get('wms/api/getwithdraw_pdf', { params: queryParams });
            setLoadingStatus(false);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return []; // หรือจัดการข้อผิดพลาดแบบเหมาะสม
        }
    };

    const generatePDFPages = (data) => {
        const pages = [];
        let pages_num = 1;
        let pages_total = Math.ceil((data.length)/10);
        const itemsPerPage = 10; // จำนวนรายการต่อหน้า

        for (let i = 0; i < data.length; i += itemsPerPage) {
            const pageData = data.slice(i, i + itemsPerPage); // แบ่งข้อมูลเป็นหน้าละ 15 รายการ
            const pdfPage = (
                <>
                    <Page size="A5" orientation="landscape" style={styles.page}>
                        <Text style={{ width: "100%", position: 'absolute', top: 10, left: 515, fontFamily: "SCG", fontSize: 12 }}>{pdf_matdoc}</Text>
                        <Text style={{ width: "100%", position: 'absolute', top: 32, left: 455, fontFamily: "SCG", fontSize: 12 }}>C221</Text>
                        <Text style={{ width: "100%", position: 'absolute', top: 68, left: 405, fontFamily: "SCG", fontSize: 12 }}>{pdf_costcenter}</Text>
                        <Text style={{ width: "100%", position: 'absolute', top: 55, left: 115, fontFamily: "SCG", fontSize: 12 }}>C221</Text>

                        <Text style={{ width: "100%", position: 'absolute', top: 73, left: 45, fontFamily: "SCG", fontSize: 12 }}>{searchParams.get("date")}     กะ {searchParams.get("shift")}</Text>
                        <Text style={{ width: "100%", position: 'absolute', top: 90, left: 95, fontFamily: "SCG", fontSize: 12 }}>{searchParams.get("machine")}</Text>
                        <Text style={{ width: "100%", position: 'absolute', top: 90, left: 345, fontFamily: "SCG", fontSize: 12 }}>{searchParams.get("machine")}</Text>
                        <Text style={{ width: "100%", position: 'absolute', top: 360, left: 280, fontFamily: "SCG", fontSize: 12 }}>{pdf_approve}</Text>
                        {
                            pageData.map((item, i) => (
                                <>
                                    {/* <Text style={{ width: "100%", position: 'absolute', top: 143 + ((i) * 24.65), left: 7, fontFamily: "SCG", fontSize: 12 }}>{item.machine}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 143 + ((i) * 24.65), left: 37, fontFamily: "SCG", fontSize: 12 }}>{item.format_date} {item.format_shift}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 146 + ((i) * 24.65), left: 85, fontFamily: "SCG", fontSize: 10 }}>{item.name_th}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 145 + ((i) * 24.65), left: 365, fontFamily: "SCG", fontSize: 12 }}>{item.format_qty}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 145 + ((i) * 24.65), left: 420, fontFamily: "SCG", fontSize: 12 }}>{item.location_format}</Text> */}
                                    <Text style={{ width: "100%", position: 'absolute', top: 155 + ((i) * 20), left: 25, fontFamily: "SCG", fontSize: 10 }}>{item.pdf_qty}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 155 + ((i) * 20), left: 80, fontFamily: "SCG", fontSize: 10 }}>000</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 155 + ((i) * 20), left: 110, fontFamily: "SCG", fontSize: 10 }}>แผ่น</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 158 + ((i) * 20), left: 140, fontFamily: "SCG", fontSize: 8 }}>{item.name_th}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 155 + ((i) * 20), left: 430, fontFamily: "SCG", fontSize: 10 }}>{item.zca_on}</Text>
                                </>
                            ))
                        }


                        <Image src="/img/template/withdraw.jpg" style={{ position: 'absolute', zIndex: -1, top: 0, width: '100%' }} />
                    </Page>
                </>
            );
            pages.push(pdfPage); // เพิ่มหน้า PDF ลงในอาเรย์ pages
            pages_num++;
        }
        
        return pages;
    };


    return (
        <>
            {
                LoadingStatus ? (
                    <Flex
                        height="100vh" // กำหนดความสูงของ Flex container
                        justifyContent="center" // จัดกลางแนวนอน
                        alignItems="center" // จัดกลางแนวตั้ง
                    >
                        <VStack>

                            <BoxLoader />
                            <Heading fontSize={"xl"}>
                                Bifröst Loading PDF...
                            </Heading>
                        </VStack>
                    </Flex>
                ) : (
                        <PDFViewer style={styles.viewer}>
                            <Document
                                title={`ใบเบิกของ_${searchParams.get("machine")}_วันที่_${searchParams.get("date")}_กะ_${searchParams.get("shift") }`}
                                creator="Bifröst-System"
                                producer="P'Pae"
                            >
                                {
                                pages.length > 0 ? (pages) : (
                                <Page size="A5" orientation="landscape" style={styles.page}>
                                    
                                    <Text style={{ width: "100%", position: 'absolute', top: 10, left: 515, fontFamily: "SCG", fontSize: 12 }}>-</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 32, left: 455, fontFamily: "SCG", fontSize: 12 }}>C221</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 68, left: 405, fontFamily: "SCG", fontSize: 12 }}>-</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 55, left: 115, fontFamily: "SCG", fontSize: 12 }}>C221</Text>

                                    <Text style={{ width: "100%", position: 'absolute', top: 73, left: 45, fontFamily: "SCG", fontSize: 12 }}>{searchParams.get("date")}     กะ {searchParams.get("shift")}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 90, left: 95, fontFamily: "SCG", fontSize: 12 }}>{searchParams.get("machine")}</Text>
                                    <Text style={{ width: "100%", position: 'absolute', top: 90, left: 345, fontFamily: "SCG", fontSize: 12 }}>{searchParams.get("machine")}</Text>

                                    <Image src="/img/template/withdraw.jpg" style={{ position: 'absolute', zIndex: -1, top: 0, width: '100%' }} />
                                </Page>)
                                }
                            </Document>
                        </PDFViewer>
                )
            }
        </>
    );
}
export default BasicDocument;