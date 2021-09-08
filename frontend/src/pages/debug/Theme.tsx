import { useTheme } from "@chakra-ui/react";
// import ReactJson from "react-json-view";

export function Theme() {
  const theme = useTheme();

  return (
    <>
      <pre>{JSON.stringify(theme, null, "  ")}</pre>
    </>
  );
}
