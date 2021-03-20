/**
 * Interface defining parameters to be passed into sendHTTPRequest and sendAsyncHTTPRequest
 */
export interface RequestParams<Request, Response> {
  method: "GET" | "POST";
  url: string;
  data?: Request;
  callback?: (result: Response) => void;
  errorCallback?: (error: any) => void;
  headers?: {[key: string]: string};
}

/**
 * Helper function to send an http request using callbacks
 */
export const sendHTTPRequest = <Request, Response>({
  method = "POST",
  url,
  data,
  callback,
  errorCallback,
  headers,
}: RequestParams<Request, Response>) => {
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
      } else if (errorCallback) {
        errorCallback(xhr.response as string);
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

/**
 * Helper function to extract individual cookies from the cookie header string
 * @param cookies
 * @param cookieName
 * @returns
 */
export const getCookie = (cookies: string, cookieName: string) => {
  const cookiePart = cookies.split(`${cookieName}=`)[1];
  if (cookiePart) {
    return cookiePart.split(";")[0];
  }
  return null;
};
