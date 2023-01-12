import { ThemeOptions } from "@material-ui/core/styles";

export const lightThemeSettings: ThemeOptions = {
  overrides: {
    MuiFilledInput: {
      underline: {
        "&::before,&:hover::before": {
          borderBottom: "none",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#01579B",
      dark: "#01467C",
      contrastText: "#FFFFFF",
      light: "#1B71B5",
    },
    secondary: {
      main: "#B22222",
      dark: "#A01E1E",
      light: "#C14E4E",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#B22222",
      dark: "#A01E1E",
      light: "#C14E4E",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#24A56C",
      dark: "#209461",
      light: "#4CA980",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#01579B",
      dark: "#01467C",
      contrastText: "#FFFFFF",
      light: "#1B71B5",
    },
    warning: {
      main: "#FB8C00",
      dark: "#E17E00",
      contrastText: "#FFFFFF",
      light: "#E79732",
    },
    divider: "#111111",
    background: {
      default: "#1B71B5",
      paper: "#FFFFFF",
    },
    grey: {
      50: "#EEEEEE",
      200: "#CCCCCC",
    },
    text: {
      primary: "#000000",
      secondary: "#FFFFFF",
      disabled: "#222222",
      hint: "#222222",
    },
  },
};

export const darkThemeSettings: ThemeOptions = {
  ...lightThemeSettings,
  palette: {
    primary: {
      main: "#003F6F",
      dark: "#003156",
      contrastText: "#FFFFFF",
      light: "#01579B",
    },
    secondary: {
      main: "#A01E1E",
      dark: "#601212",
      light: "#B22222",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#A01E1E",
      dark: "#601212",
      light: "#B22222",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#209461",
      dark: "#166743",
      light: "#24A56C",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#01467C",
      dark: "#003156",
      contrastText: "#FFFFFF",
      light: "#01579B",
    },
    warning: {
      main: "#E17E00",
      dark: "#874B00",
      contrastText: "#FFFFFF",
      light: "#FB8C00",
    },
    divider: "#EEEEEE",
    background: {
      default: "#00182B",
      paper: "#0F1111",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#000000",
      disabled: "#DDDDDD",
      hint: "#DDDDDD",
    },
    grey: {
      50: "#111111",
      200: "#333333",
    },
  },
};
