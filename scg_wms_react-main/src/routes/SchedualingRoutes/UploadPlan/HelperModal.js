import React from "react";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

const HeaderCellWithHelp = ({ displayMode, textColor }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box >
        <IconButton
          aria-label="Help"
          icon={<InfoOutlineIcon />}
          onClick={onOpen}
          variant="ghost"
          size="sm"
          color={textColor || "gray.500"}
          _hover={{ color: "blue.500" }}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remain</ModalHeader>
          <ModalBody>
            <Text>
              ในส่วน ยอดคงเหลือหลัง Aprrove
            </Text>
            <Text>
                ติดลบหมายถึง การส่งยอดเกินแผน 
            </Text>
            <Text>
            บวกหมายถึงจำนวนที่ยังเดินไม่ครบแผน
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HeaderCellWithHelp;
