import React from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import ViewWrapper from "./RouteWrapper";
import { useRoutes } from "./routes";
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import Parse from "parse";
import { initializeParse } from "@parse/react";

const PARSE_APPLICATION_ID = "aX17fiOL3N1Lklz83UnWMP6oympHLszezxXAXokH";
const PARSE_JAVASCRIPT_KEY = "otMMK0SVH7LEIL1TbqlIbemXf0jpfEurJ9FQ7gri";
const PARSE_HOST_URL = "shadowbox.b4a.io";
initializeParse(PARSE_HOST_URL, PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);

const App = () => {
  const { routes } = useRoutes();

  const darkTheme = (lightTheme: Theme) =>
    createMuiTheme(
      Parse.User.current()?.get("isDarkThemeEnabled")
        ? {
            palette: {
              primary: {
                main: "#003F6F",
                dark: "#003156",
                contrastText: "#FFFFFF",
                light: "#01579B",
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
              background: {
                default: "#00182B",
                paper: "#0F1111",
              },
              text: {
                primary: "#FFFFFF",
                secondary: "#DDDDDD",
                disabled: "#DDDDDD",
                hint: "#DDDDDD",
              },
            },
          }
        : { ...lightTheme }
    );

  if (window.location.host.match(/^www\./) !== null) {
    window.location.host = window.location.host.substring(4);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Switch>
          {Object.keys(routes).map((routeKey) => (
            <ViewWrapper key={routeKey} {...routes[routeKey]} />
          ))}
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;
