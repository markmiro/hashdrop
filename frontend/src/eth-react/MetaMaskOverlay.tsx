import {
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import { FC } from "react";
import { Portal, usePortals } from "react-portal-hook";
import src from "./metamask-fox.svg";

export const MetaMaskOverlay: FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      motionPreset="scale"
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

export function useMetaMaskOverlay() {
  const portalManager = usePortals();

  const openFor = async (func: () => Promise<void>) => {
    let _portal: Portal = { close: () => {} };
    portalManager.open((portal) => {
      _portal = portal;
      return <MetaMaskOverlay isOpen={true} onClose={portal.close} />;
    });

    try {
      await func();
    } catch (err) {
      // Makes sure portal is closed if there's an error;
      _portal.close();
      throw err;
    }
    _portal.close();
  };

  return { openFor };
}
