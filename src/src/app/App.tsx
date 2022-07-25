import React, { Suspense, useEffect } from "react";
import { Switch } from "react-router-dom";
import {
  CircularProgress,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import { DiscFull } from "@material-ui/icons";
import Parse from "parse";
import { useNotificationsContext, useUserContext } from "../contexts";
import { ActionDialogContextProvider, SnackbarProvider } from "../components";
import { Strings } from "../resources";
import routes from "./routes";
import ViewWrapper from "./RouteWrapper";
declare const globalThis: any;

Parse.serverURL = globalThis.__env__?.PARSE_HOST_URL;
Parse.initialize(
  globalThis.__env__?.PARSE_APPLICATION_ID,
  globalThis.__env__?.PARSE_JAVASCRIPT_KEY
);

// @ts-ignore: TODO remove this comment when the types are actually correct again
Parse.enableLocalDatastore(false);

const App = () => {
  const { loggedInUser } = useUserContext();
  const { addNotification } = useNotificationsContext();

  const darkTheme = (lightTheme: Theme) =>
    createMuiTheme(
      loggedInUser?.isDarkThemeEnabled
        ? {
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
              },
            },
          }
        : { ...lightTheme }
    );

  if (window.location.host.match(/^www\./) !== null) {
    window.location.host = window.location.host.substring(4);
  }

  useEffect(() => {
    navigator.storage.estimate().then((estimate) => {
      if (estimate && estimate.quota !== undefined) {
        if (estimate.quota < 500000000) {
          addNotification({
            title: Strings.notEnoughSpace(),
            detail: Strings.limitedOffline(),
            icon: <DiscFull />,
          });
        }
      }
    });
  }, [addNotification]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ActionDialogContextProvider>
        <SnackbarProvider>
          <Suspense
            fallback={
              <div
                style={{
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "#1B71B5",
                  paddingTop: "calc(50vh - 40px)",
                  paddingLeft: "calc(50vw - 40px)",
                }}
              >
                <CircularProgress style={{ color: "#C14E4E" }} />
              </div>
            }
          >
            <Switch>
              {Object.keys(routes).map((routeKey) => (
                <ViewWrapper key={routeKey} {...routes[routeKey]} />
              ))}
            </Switch>
          </Suspense>
        </SnackbarProvider>
      </ActionDialogContextProvider>
    </ThemeProvider>
  );
};

export default App;
