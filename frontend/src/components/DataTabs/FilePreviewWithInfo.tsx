import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { FC } from "react";
import { FilePreview } from "./FilePreview";

export const FilePreviewWithInfo: FC<{
  file: File | null;
  dataUrl: string;
}> = ({ file, dataUrl, children }) => {
  if (!file) return null;
  const fileName = file?.name || "";

  return (
    <div>
      <Box borderWidth={1}>
        <FilePreview file={file} dataUrl={dataUrl} />
      </Box>
      <Flex bg="blackAlpha.100" p={2}>
        <div style={{ overflow: "hidden" }}>
          <Text fontWeight="semibold" isTruncated>
            {fileName}
          </Text>
          {file?.type && (
            <Text fontSize="xs" color="blackAlpha.700">
              {file.type}
            </Text>
          )}
        </div>
        <Spacer />
        <Box flexShrink={0}>{children}</Box>
      </Flex>
    </div>
  );
};
