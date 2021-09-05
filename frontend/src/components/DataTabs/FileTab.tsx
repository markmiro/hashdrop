import { DeleteIcon } from "@chakra-ui/icons";
import { Button, Center } from "@chakra-ui/react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { resetFileInput } from "../../util/resetFileInput";
import { FilePreviewWithInfo } from "./FilePreviewWithInfo";

const fillAndHide: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
};

const DropArea: FC = ({ children }) => (
  <Center
    position="relative"
    fontWeight="medium"
    rounded="md"
    border={1}
    borderStyle="dashed"
    borderColor="blackAlpha.300"
    _hover={{ bg: "blackAlpha.50" }}
    textAlign="center"
    h="20vh"
    p="4"
  >
    {children}
  </Center>
);

export function FileTab({
  onFileChange,
}: {
  onFileChange: (blob: Blob | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileDataUrl, setFileDataUrl] = useState("");

  const updateFile = useCallback(async (file: null | File) => {
    if (!file) return;
    setFile(file);
  }, []);

  const resetFile = () => {
    setFile(null);
    if (fileRef?.current) resetFileInput(fileRef.current);
  };

  useEffect(() => {
    onFileChange(file);
    if (file) {
      const dataUrl = window.URL.createObjectURL(file);
      setFileDataUrl(dataUrl);
    }
  }, [onFileChange, file]);

  if (file) {
    return (
      <FilePreviewWithInfo file={file} dataUrl={fileDataUrl}>
        <Button
          onClick={resetFile}
          disabled={!file}
          leftIcon={<DeleteIcon />}
          colorScheme="blackAlpha"
        >
          Remove
        </Button>
      </FilePreviewWithInfo>
    );
  }

  return (
    <DropArea>
      <input
        ref={fileRef}
        type="file"
        style={fillAndHide}
        onChange={(e) => updateFile(e.target?.files?.[0] ?? null)}
      />
      📄 Choose a file
    </DropArea>
  );
}
