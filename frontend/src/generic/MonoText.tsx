import { BoxProps } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/react";
import React, { FC } from "react";

export const MonoText: FC<BoxProps & { isDisabled?: boolean }> = ({
  children,
  isDisabled,
  ...rest
}) => {
  const maybeDisabled: BoxProps = isDisabled
    ? { opacity: "50%", pointerEvents: "none" }
    : {};
  return (
    <Box
      display="inline"
      fontFamily="mono"
      wordBreak="break-all"
      {...maybeDisabled}
      {...rest}
    >
      {children}
    </Box>
  );
};
