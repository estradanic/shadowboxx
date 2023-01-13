declare global {
  interface Window {
    __env__: {
      PARSE_APPLICATION_ID: string;
      PARSE_JAVASCRIPT_KEY: string;
      PARSE_HOST_URL: string;
    };
  }

  namespace Parse {
    function enableLocalDatastore(poll?: boolean): void;
  }
}

export {};
