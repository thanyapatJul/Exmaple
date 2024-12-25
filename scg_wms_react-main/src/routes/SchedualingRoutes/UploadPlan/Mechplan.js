import React, { useEffect, useState } from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { VStack } from "@chakra-ui/react";
import { BiArrowFromBottom } from "react-icons/bi";
import { BiArrowToBottom } from "react-icons/bi";
import { motion } from "framer-motion";
import { FiDelete } from "react-icons/fi";
import { DownloadIcon } from "@chakra-ui/icons";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  HStack,
  useToast,
  Flex,
  Spacer,
  Select,
  Button,
  IconButton,
  Divider,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Table, Column, HeaderCell, Cell, ColumnGroup } from "rsuite-table";
import { useFormik, Formik, Form } from "formik";
import "rsuite-table/dist/css/rsuite-table.css";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { Select as ChakraReactSelect } from "chakra-react-select";
import Swal from "sweetalert2";
import Axios from "axios";
import DataGrid, { Scrolling, Paging } from "devextreme-react/data-grid";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;

const mockData = [
  { machine: "HS3", date: "2024-09-25", status: "Active", operator: "John Doe" },
  { machine: "CM5", date: "2024-09-26", status: "Inactive", operator: "Jane Smith" },
  { machine: "PK1", date: "2024-09-27", status: "Active", operator: "Mike Johnson" },
  { machine: "HS4", date: "2024-09-28", status: "Inactive", operator: "Anna Brown" },
  { machine: "XY1", date: "2024-09-29", status: "Active", operator: "Paul Black" },
];

const MechPlan = () => {
  const [data] = useState(mockData);

  return (
    <DataGrid
      height={440}
      dataSource={data}
      keyExpr="machine"
      showBorders={true}
      columnWidth={100}
    >
      <Scrolling columnRenderingMode="virtual" />
      <Paging enabled={false} />

      {/* Parent Column: Machine Details */}
      <Column caption="Machine Details">
        {/* Sub-column 1: Machine */}
        <Column dataField="machine" caption="Machine" />
        
        {/* Sub-column 2: Date */}
        <Column 
          dataField="date" 
          caption="Date" 
          dataType="date" 
          format="yyyy-MM-dd" 
        />
      </Column>

      {/* Parent Column: Additional Info */}
      <Column caption="Additional Info">
        {/* Sub-column 3: Status */}
        <Column dataField="status" caption="Status" />
        
        {/* Sub-column 4: Operator */}
        <Column dataField="operator" caption="Operator" />
      </Column>

    </DataGrid>
  );
};

export default MechPlan;