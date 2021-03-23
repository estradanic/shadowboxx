import React from "react";
import {BrowserRouter as Router, Switch} from "react-router-dom";
import ViewWrapper from "./RouteWrapper";
import {useRoutes} from "./routes";
import {useUserContext} from "./UserContext";
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";

const App = () => {
  const {routes} = useRoutes();
  const {darkThemeEnabled} = useUserContext();

  const darkTheme = (lightTheme: Theme) =>
    createMuiTheme(
      darkThemeEnabled
        ? {
            palette: {
              primary: {
                main: "#01467C",
                dark: "#003156",
                contrastText: "#FFFFFF",
                light: "#01579B",
              },
              secondary: {
                main: "#003156", // app background since I can't use default or primary
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
                default: "#222222",
                paper: "#222222",
              },
              text: {
                primary: "#FFFFFF",
                secondary: "#DDDDDD",
                disabled: "#DDDDDD",
                hint: "#DDDDDD",
              },
            },
          }
        : {...lightTheme},
    );

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
