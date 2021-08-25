import { FC } from "react";
import styles from "./Pulse.module.css";

export const Pulse: FC<{ pulsing: boolean; className?: string }> = ({
  children,
  pulsing,
  className,
}) => {
  if (pulsing) {
    return (
      <div className={[styles.pulse, className ?? ""].join(" ")}>
        {children}
      </div>
    );
  }
  return <>{children}</>;
};
