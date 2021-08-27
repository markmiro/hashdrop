import { FC } from "react";

// TODO: Consider making this add to a portal, so that it sizes itself to viewport and not parent. Call it <PageCover />
// TODO: Consider making it prevent parent from scrolling.

export const Cover: FC = ({ children }) => (
  <div
    style={{
      zIndex: 999,
      // TODO: position: "fixed" makes it cover the whole viewport, but would need to make this a <PageCover /> to make it make sense.
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
