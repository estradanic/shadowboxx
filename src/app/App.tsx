import React, { Suspense, useEffect } from "react";
import Parse from "parse";
import { Routes, Route } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  Theme,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createTheme,
} from "@material-ui/core/styles";
import DiscFullIcon from "@material-ui/icons/DiscFull";
import { get, set, entries, createStore, del, clear } from "idb-keyval";
import { useNotificationsContext, useUserContext } from "../contexts";
import { ActionDialogContextProvider, DefaultLayout } from "../components";
import { Strings } from "../resources";
import routes from "./routes";
import { darkThemeSettings } from "./theme";
import {
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_KEY,
  SHARE_TARGET_STORE_NAME,
} from "../serviceWorker/sharedExports";

Parse.serverURL = window.__env__?.PARSE_HOST_URL;
Parse.initialize(
  window.__env__?.PARSE_APPLICATION_ID,
  window.__env__?.PARSE_JAVASCRIPT_KEY
);
const parseDB = createStore("parseDB", "parseStore");
Parse.setLocalDatastoreController({
  fromPinWithName(name: string) {
    return get(name, parseDB);
  },
  pinWithName(name: string, value: any) {
    return set(name, value, parseDB);
  },
  unPinWithName(name: string) {
    return del(name, parseDB);
  },
  async getAllContents() {
    return Object.fromEntries(await entries(parseDB));
  },
  clear() {
    return clear(parseDB);
  },
});
Parse.enableLocalDatastore(false);

const shareTargetStore = createStore(
  SHARE_TARGET_DB_NAME,
  SHARE_TARGET_STORE_NAME
);

const App = () => {
  const channel = new BroadcastChannel(SHARE_TARGET_STORE_KEY);
  channel.addEventListener("message", async (event) => {
    await set(SHARE_TARGET_STORE_KEY, event.data, shareTargetStore);
  });

  const { getLoggedInUser, isUserLoggedIn } = useUserContext();
  const { addNotification } = useNotificationsContext();

  const darkTheme = (lightThemeSettings: Theme) =>
    createTheme(
      isUserLoggedIn && getLoggedInUser()?.isDarkThemeEnabled
        ? darkThemeSettings
        : lightThemeSettings
    );

  useEffect(() => {
    navigator?.storage?.persisted?.()?.then?.((initialIsPersisted) => {
      if (!initialIsPersisted) {
        navigator.storage
          .persist?.()
          ?.then((isPersisted) =>
            console.log(
              "Storage ",
              isPersisted ? "persisted!" : "not persisted..."
            )
          );
      } else {
        console.log("Storage persisted!");
      }
    });
    navigator?.storage?.estimate?.()?.then?.((estimate) => {
      if (
        estimate &&
        estimate.quota !== undefined &&
        estimate.usage !== undefined
      ) {
        const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
        console.log("Percent of storage used:", percent + "%");
        console.log("Storage left:", estimate.quota / 1000000, "Megabytes");
        if (estimate.quota - estimate.usage < 500000000) {
          addNotification({
            id: "low-storage-notification",
            title: Strings.notEnoughSpace(),
            detail: Strings.limitedOffline(),
            icon: <DiscFullIcon />,
          });
        }
      }
    });
  }, [addNotification]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ActionDialogContextProvider>
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
          <Routes>
            {Object.values(routes).map((route) => (
              <Route
                key={route.viewName}
                element={
                  <DefaultLayout viewId={route.viewId}>
                    <route.View />
                  </DefaultLayout>
                }
                path={route.path}
              />
            ))}
          </Routes>
        </Suspense>
      </ActionDialogContextProvider>
    </ThemeProvider>
  );
};

export default App;
