import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC, ReactNode } from "react";
import { useEffect } from "react";
import { usePortals } from "react-portal-hook";

type OpenDialogFunc = () => void;
type OnConfirmFunc = () => void;

/** A simple component to verify if the user wants to take a certain action */
export const Confirm: FC<{
  children?: (openDialog: OpenDialogFunc) => ReactNode;
  onConfirm: OnConfirmFunc;
  title?: string;
  message?: ReactNode;
}> = ({ children, onConfirm, title = "Are you sure?", message }) => {
  const { isOpen, onOpen: openDialog, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  useEffect(() => {
    if (!children) {
      openDialog();
    }
  }, [children, openDialog]);

  return (
    <>
      {children && children(openDialog)}
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          {message && <AlertDialogBody>{message}</AlertDialogBody>}
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isFullWidth size="lg">
              No
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              ml={3}
              isFullWidth
              size="lg"
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

type Options = { title?: string };

export function useConfirm() {
  const portalManager = usePortals();

  return (call: () => void, options?: Options) => {
    portalManager.open(<Confirm title={options?.title} onConfirm={call} />);
  };
}
