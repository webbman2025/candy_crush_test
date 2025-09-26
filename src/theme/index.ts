"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    grey: string;
    greyLight: string;
  }
  interface TypeText {
    dark: string;
    light: string;
    lighter: string;
  }
}

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-noto-sans-tc)",
  },
});

export default theme;
