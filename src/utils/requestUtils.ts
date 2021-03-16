export interface RequestParams<Request> {
  method: "GET" | "POST";
  url: string;
  data?: Request;
  callback?: (result: any) => void;
  errorCallback?: (error: any) => void;
  headers?: {[key: string]: string};
}

export const sendHTTPRequest = <Request>({
  method = "POST",
  url,
  data,
  callback,
  errorCallback,
  headers,
}: RequestParams<Request>) => {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  if (callback) {
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 400) {
        let result;
        try {
          result = JSON.parse(xhr.response) as Response;
        } catch {
          result = xhr.response as Response;
        }
        callback(result);
      }
    };
  }
  if (errorCallback) {
    xhr.onerror = (error) => {
      errorCallback(error);
    };
  }
  if (headers) {
    Object.keys(headers).forEach((header) => {
      xhr.setRequestHeader(header, headers[header]);
    });
  }
  if (data) {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send();
  }
};
