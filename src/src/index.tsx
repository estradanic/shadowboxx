import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  MuiThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import {
  UserContextProvider,
  NotificationsContextProvider,
  GlobalLoadingContextProvider,
} from "./contexts";
import App from "./app/App";
import "./index.css";

const theme = createMuiTheme({
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
    },
    text: {
      primary: "#000000",
      secondary: "#FFFFFF",
      disabled: "#222222",
      hint: "#222222",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <GlobalLoadingContextProvider>
        <NotificationsContextProvider>
          <Router>
            <UserContextProvider>
              <App />
            </UserContextProvider>
          </Router>
        </NotificationsContextProvider>
      </GlobalLoadingContextProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
