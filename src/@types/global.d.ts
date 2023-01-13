declare global {
  interface Window {
    __env__: {
      PARSE_APPLICATION_ID: string;
      PARSE_JAVASCRIPT_KEY: string;
      PARSE_HOST_URL: string;
      SERVICE_WORKER_VERSION_NUMBER: string;
    };
  }

  namespace Parse.CoreManager {
    function setStorageController(controller: any): void;
  }

  namespace Parse {
    function enableLocalDatastore(poll?: boolean): void;
    const IndexedDB: any;
  }
}

export {};
