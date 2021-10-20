import { Box, BoxProps } from "@chakra-ui/react";
import { FC } from "react";
import styles from "./Loader.module.css";

export const Loader: FC<BoxProps> = (props) => {
  const { children, ...rest } = props;
  return (
    <Box opacity="50%" {...rest}>
      {children && <>{children} </>}
      <span className={styles.dot1}>•</span>
      <span className={styles.dot2}>•</span>
      <span className={styles.dot3}>•</span>
    </Box>
  );
};
