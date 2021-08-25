import React, { FC } from "react";

export const ErrorMessage: FC = ({ children }) => {
  if (!children) return null;
  return <div className="red">{children}</div>;
};
