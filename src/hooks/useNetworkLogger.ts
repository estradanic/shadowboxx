import { useEffect, useRef } from "react";
import Parse from "parse";
import { useUserContext } from "../contexts";

type Timestamp = string;

/** Hook for getting a logger that will send data to the server to be logged */
const useNetworkLogger = (name: string) => {
  const { getLoggedInUser } = useUserContext();

  const infoQueue = useRef<Record<Timestamp, any[]>>({});
  const errorQueue = useRef<Record<Timestamp, any[]>>({});
  const warnQueue = useRef<Record<Timestamp, any[]>>({});

  const infoLock = useRef(false);
  const errorLock = useRef(false);
  const warnLock = useRef(false);

  useEffect(() => {
    const logTimer = setInterval(async () => {
      if (Object.keys(infoQueue.current).length > 0 && !infoLock.current) {
        infoLock.current = true;
        const logs = infoQueue.current;
        infoQueue.current = {};
        await Parse.Cloud.run("log", {
          logs,
          name,
          type: "info",
          user: getLoggedInUser().email,
        });
        infoLock.current = false;
      }

      if (Object.keys(errorQueue.current).length > 0 && !errorLock.current) {
        errorLock.current = true;
        const logs = errorQueue.current;
        errorQueue.current = {};
        await Parse.Cloud.run("log", {
          logs,
          name,
          type: "error",
          user: getLoggedInUser().email,
        });
        errorLock.current = false;
      }

      if (Object.keys(warnQueue.current).length > 0 && !warnLock.current) {
        warnLock.current = true;
        const logs = warnQueue.current;
        warnQueue.current = {};
        await Parse.Cloud.run("log", {
          logs,
          name,
          type: "warn",
          user: getLoggedInUser().email,
        });
        warnLock.current = false;
      }
    }, 1000);

    return () => clearInterval(logTimer);
  }, [name, getLoggedInUser]);

  const info = (...data: any[]) => {
    infoQueue.current[Date.now().toString()] = data;
    console.info(...data);
  };

  const error = (...data: any[]) => {
    errorQueue.current[Date.now().toString()] = data;
    console.error(...data);
  };

  const warn = (...data: any[]) => {
    warnQueue.current[Date.now().toString()] = data;
    console.warn(...data);
  };

  return { info, error, warn };
};

export default useNetworkLogger;
