import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import {UserContextProvider} from "./app/UserContext";
import {NavigationContextProvider} from "./app/NavigationContext";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#01579B",
      dark: "#01467C",
      contrastText: "#FFFFFF",
      light: "#1B71B5",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <NavigationContextProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </NavigationContextProvider>
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
