import { Box } from "@chakra-ui/react";
import { FC } from "react";

export const ErrorMessage: FC = ({ children }) => {
  if (!children) return null;
  return <Box color="red.500">{children}</Box>;
};
