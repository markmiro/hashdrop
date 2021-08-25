import { ReactNode } from "react";
import styles from "./Loader.module.css";

export function Loader({ children }: { children?: ReactNode }) {
  return (
    <span className="o-60">
      {children && <>{children} </>}
      <span className={styles.dot1}>•</span>
      <span className={styles.dot2}>•</span>
      <span className={styles.dot3}>•</span>
    </span>
  );
}
