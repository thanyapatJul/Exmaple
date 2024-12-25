import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Button,
  useDisclosure,
  Text,
  Flex,
  Image,
} from "@chakra-ui/react";
import { FiHelpCircle } from "react-icons/fi";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"; // Import the arrow icons

const TutorialModal = ({ title }) => {
  // Array of tutorial steps
  const tutorialPages = [
    "Step 1: การเพิ่ม / ลบ / ช่อง Process",
    "Step 2: เลือก Option Source , Destination",
    "Step 3: การใส่ค่า Source และ Destination",
    "Step 4: ใส่ Process ที่ต้องการเพิ่ม",
    "ตัวอย่าง: ตัวอย่าง Process ที่ได้.",
  ];

  // Array of image paths for each page
  const tutorialImages = [
    require("./tutor_img/15.png"), // Image for Step 1
    require("./tutor_img/16.png"), // Image for Step 2
    require("./tutor_img/17.png"), // Image for Step 3
    require("./tutor_img/18.png"), // Image for Step 4
    require("./tutor_img/19.png"), // Image for Step 4
  ];

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPage, setCurrentPage] = useState(0);

  const handleNextPage = () => {
    if (currentPage < tutorialPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      {/* Help Icon Button */}
      <IconButton
        icon={<FiHelpCircle />}
        aria-label="Help"
        onClick={onOpen}
        variant="outline"
        colorScheme="blue"
        size="xs"
        marginBottom="12px"
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="65%">
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Display tutorial text */}
            <Text>{tutorialPages[currentPage]}</Text>

            {/* Display corresponding tutorial image */}
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Image
                src={tutorialImages[currentPage]}
                alt={`Tutorial Step ${currentPage + 1}`}
                maxW="100%" // Ensures the image doesn't exceed the width of its container
                maxH="400px" // Set a maximum height
                objectFit="contain" // Ensures the image scales without distortion
              />
            </Flex>

            {/* Pagination Buttons */}
            <Flex
              w="100%"
              justifyContent="space-between"
              alignItems="center"
              mt={4}
            >
              <IconButton
                icon={<BiChevronLeft />}
                aria-label="Previous Page"
                onClick={handlePrevPage}
                isDisabled={currentPage === 0}
                colorScheme="gray"
                size="md"
              />
              <IconButton
                icon={<BiChevronRight />}
                aria-label="Next Page"
                onClick={handleNextPage}
                isDisabled={currentPage === tutorialPages.length - 1}
                colorScheme="gray"
                size="md"
              />
            </Flex>
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

export default TutorialModal;
