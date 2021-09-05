import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    gray: {
      "50": "#FCFCFC",
      "100": "#F1F1F1",
      "200": "#DBDBDB",
      "300": "#ADADAD",
      "400": "#969696",
      "500": "#808080",
      "600": "#666666",
      "700": "#4D4D4D",
      "800": "#333333",
      "900": "#1A1A1A",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
        // bg: "blackAlpha.50",
      },
      variants: {
        link: {
          textDecoration: "underline",
        },
      },
    },
  },
});
