import { FC } from "react";

export const ErrorMessage: FC = ({ children }) => {
  if (!children) return null;
  return <div className="text-red-500">{children}</div>;
};
