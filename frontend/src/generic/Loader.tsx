import { ReactNode } from "react";
import styles from "./Loader.module.css";
import { Box } from "@chakra-ui/react";

export function Loader({ children }: { children?: ReactNode }) {
  return (
    <Box opacity="50%">
      {children && <>{children} </>}
      <span className={styles.dot1}>•</span>
      <span className={styles.dot2}>•</span>
      <span className={styles.dot3}>•</span>
    </Box>
  );
}
