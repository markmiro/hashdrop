import { FC } from "react";
import styles from "./Disabled.module.css";

export const Disabled: FC<{
  disabled: boolean;
  pulsing?: boolean;
  className?: string;
}> = ({ children, disabled, pulsing, className }) => {
  if (disabled) {
    return (
      <div
        className={[
          styles.disabled,
          pulsing && styles.pulsing,
          className ?? "",
        ].join(" ")}
      >
        {children}
      </div>
    );
  }
  return <>{children}</>;
};
