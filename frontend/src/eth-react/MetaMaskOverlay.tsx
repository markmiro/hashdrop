import {
  Button,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalProps,
  VStack,
} from "@chakra-ui/react";
import { FC } from "react";
import src from "./metamask-fox.svg";

export const MetaMaskOverlay: FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      motionPreset="none"
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay
        bg="whiteAlpha.800"
        style={{ backdropFilter: "blur(5px)" }}
      />
      <ModalContent bg="transparent" shadow="none">
        <VStack spacing={2} textAlign="center">
          <Image boxSize="50px" src={src} />
          <b>Check MetaMask Extension</b>
          {children}
        </VStack>
      </ModalContent>
    </Modal>
  );
};
