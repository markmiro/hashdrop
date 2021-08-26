import { FC } from "react";

export const Cover: FC = ({ children }) => (
  <div
    style={{
      zIndex: 999,
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#00000055",
    }}
  >
    {children}
  </div>
);
