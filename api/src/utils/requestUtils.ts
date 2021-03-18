/**
 * Interface defining parameters to be passed into sendHTTPRequest and sendAsyncHTTPRequest
 */
export interface RequestParams<Request, Response> {
  method: "GET" | "POST";
  url: string;
  data?: Request;
  callback?: (result: Response) => void;
  errorCallback?: (error: unknown) => void;
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
 * Helper function to send an http request using async/await
 */
export const sendAsyncHTTPRequest = async <Request, Response>({
  method,
  url,
  data,
  headers,
}: RequestParams<Request, Response>) => {
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(data),
  });

  if (response.status >= 200 && response.status < 400) {
    let result: Response;
    try {
      result = JSON.parse(await response.json()) as Response;
    } catch {
      result = ((await response.text()) as unknown) as Response;
    }
    return new Promise<Response>((resolve) => {
      resolve(result);
    });
  } else {
    return new Promise<any>((resolve) => {
      resolve(response.statusText);
    });
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
