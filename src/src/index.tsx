import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import {
  MuiThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { NavigationContextProvider } from "./app/NavigationContext";
import { SnackbarProvider } from "./components";
import { NotificationsContextProvider } from "./app/NotificationsContext";
import { ActionDialogContextProvider } from "./components/Dialog/ActionDialog";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#01579B",
      dark: "#01467C",
      contrastText: "#FFFFFF",
      light: "#1B71B5",
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
    background: {
      default: "#1B71B5",
      paper: "#FFFFFF",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <SnackbarProvider>
        <NavigationContextProvider>
          <NotificationsContextProvider>
            <ActionDialogContextProvider>
              <App />
            </ActionDialogContextProvider>
          </NotificationsContextProvider>
        </NavigationContextProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
