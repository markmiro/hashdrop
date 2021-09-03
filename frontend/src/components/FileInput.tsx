import {
  Badge,
  Box,
  Button,
  ButtonProps,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  label?: string;
  file: File | null;
  keepFile?: boolean;
  onFileChange: (file: File | null) => void;
  acceptTypes: string[];
  buttonProps?: ButtonProps;
};

export const FileInput = ({
  label,
  file,
  keepFile,
  onFileChange,
  acceptTypes,
  buttonProps,
}: Props) => {
  const toast = useToast();
  const [openedFile, setOpenedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Clear file input if file is cleared
  useEffect(() => {
    if (!file && !keepFile) {
      setOpenedFile(null);
    }
  }, [file, keepFile]);

  const handleOpenFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newFile = e.target?.files?.[0] ?? null;
    if (newFile && acceptTypes && acceptTypes.includes(newFile.type)) {
      onFileChange(newFile);
      setOpenedFile(newFile);
    } else {
      toast({
        status: "error",
        title: "File type not accepted",
        description: `Accepted types: ${acceptTypes.join(", ")}`,
        isClosable: true,
      });
    }
  };

  const isModified = !file && keepFile;

  return (
    <HStack spacing={2} overflow="hidden" flex="0 1 auto">
      {!openedFile && (
        <Button position="relative" flex="1 0 auto" {...buttonProps}>
          {label || "Choose File"}
          <input
            ref={fileRef}
            type="file"
            accept={acceptTypes.join(",")}
            onChange={handleOpenFile}
            style={{
              cursor: "default",
              position: "absolute",
              display: "block",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "red",
              opacity: 0,
            }}
          />
        </Button>
      )}
      {openedFile && (
        <Box
          flex="0 1 auto"
          cursor="default"
          overflow="hidden"
          lineHeight="short"
        >
          <Text isTruncated fontWeight="medium">
            {openedFile.name}
          </Text>
          <Text fontSize="xs">
            {openedFile.type}
            {isModified && (
              <Badge colorScheme="yellow" ml="1">
                Modified
              </Badge>
            )}
          </Text>
        </Box>
      )}
    </HStack>
  );
};
