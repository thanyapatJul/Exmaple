import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';

const CustomModal = ({ isOpen, onClose, data }) => {
  const { Name, startDate, endDate, shift, machine, priority } = data || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={Name || ''} isReadOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Start Date</FormLabel>
            <Input type="datetime-local" value={startDate || ''} isReadOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>End Date</FormLabel>
            <Input type="datetime-local" value={endDate || ''} isReadOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Shift</FormLabel>
            <Select value={shift || ''} isReadOnly>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Machine</FormLabel>
            <Input value={machine || ''} isReadOnly />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Priority</FormLabel>
            <Input value={priority || ''} isReadOnly />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
