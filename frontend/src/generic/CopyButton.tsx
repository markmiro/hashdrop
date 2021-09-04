import { CopyIcon } from "@chakra-ui/icons";
import { Box, BoxProps, useToast } from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { FC, useCallback } from "react";

export const CopyButton: FC<
  BoxProps & {
    toCopy: string;
  }
> = ({ toCopy, ...rest }) => {
  const toast = useToast();

  const handleCopy = useCallback(() => {
    copy(toCopy);
    toast({
      title: "Copied.",
      status: "success",
      duration: 1000,
    });
  }, [toCopy, toast]);

  return (
    <Box
      as="button"
      variant="link"
      title={toCopy}
      onClick={handleCopy}
      _hover={{ color: "black" }}
      transform="translate(0px, -1px)"
      {...rest}
    >
      <CopyIcon />
    </Box>
  );
};
