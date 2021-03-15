import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/lightBlue";
import {UserContextProvider} from "./app/UserContext";
import {NavigationContextProvider} from "./app/NavigationContext";

const theme = createMuiTheme({
  palette: {
    primary: {
      ...blue,
      "500": "#01579B",
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
