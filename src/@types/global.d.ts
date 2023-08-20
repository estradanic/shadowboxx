declare global {
  interface Window {
    /** Contains configuration globals */
    __env__: {
      /** Application id on back4app */
      PARSE_APPLICATION_ID: string;
      /** Javascript SDK key to make calls */
      PARSE_JAVASCRIPT_KEY: string;
      /** URL to make Parse calls to */
      PARSE_HOST_URL: string;
    };
  }

  namespace Parse {
    /** Enable pinning objects to local datastore */
    function enableLocalDatastore(poll?: boolean): void;
  }
}

export {};
