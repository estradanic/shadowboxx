import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {get, put, drop} from "../src/Database";
import Strings from "../src/resources/Strings";
import {v4 as uuid} from "uuid";
import {isNullOrWhitespace} from "../src/utils/stringUtils";
import {ErrorState, validateEmail} from "../src/utils/formUtils";
import {generate as generateHash} from "password-hash";
import {getCookie} from "../src/utils/requestUtils";

const validate = (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): ErrorState<"email" | "password" | "firstName" | "lastName"> => {
  const errors = {
    email: {isError: false, errorMessage: ""},
    firstName: {isError: false, errorMessage: ""},
    lastName: {isError: false, errorMessage: ""},
    password: {isError: false, errorMessage: ""},
  };

  if (!validateEmail(email)) {
    errors.email = {
      isError: true,
      errorMessage: Strings.invalidEmail(email),
    };
  }
  if (isNullOrWhitespace(password)) {
    errors.password = {
      isError: true,
      errorMessage: Strings.invalidPassword(password),
    };
  }
  if (isNullOrWhitespace(firstName)) {
    errors.firstName = {
      isError: true,
      errorMessage: Strings.pleaseEnterA(Strings.firstName()),
    };
  }
  if (isNullOrWhitespace(lastName)) {
    errors.lastName = {
      isError: true,
      errorMessage: Strings.pleaseEnterA(Strings.firstName()),
    };
  }

  return errors;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const errors = validate(
    req.body.newInfo.email,
    req.body.newInfo.password,
    req.body.newInfo.firstName,
    req.body.newInfo.lastName,
  );
  let errorMessage = "";
  Object.keys(errors).forEach((error) => {
    if (errors[error].isError) {
      errorMessage += errors[error].errorMessage + "\n";
    }
  });
  if (!isNullOrWhitespace(errorMessage)) {
    context.log(errorMessage);
    context.res = {
      body: errorMessage,
      status: 400,
    };
    return;
  }

  const userData = await get(`users/${req.body.email}`);
  if (!userData) {
    context.log(Strings.noEmailExists(req.body.email));
    context.res = {
      body: Strings.noEmailExists(req.body.email),
      status: 401,
    };
    return;
  }

  let sessionId;
  if (req.headers.cookie.includes("sessionId")) {
    sessionId = getCookie(req.headers.cookie, "sessionId");
  } else {
    context.res = {
      status: 401,
      body: Strings.noSessionId(),
    };
    return;
  }
  if (userData["sessionId"] !== sessionId) {
    context.res = {
      status: 401,
      body: Strings.wrongSessionId(),
    };
    return;
  }

  await drop(`users/${req.body.email}`);
  sessionId = `${req.body.newInfo.email}|${uuid()}`;
  await put(`users/${req.body.newInfo.email}`, {
    email: req.body.newInfo.email,
    firstName: req.body.newInfo.firstName,
    lastName: req.body.newInfo.lastName,
    password: generateHash(req.body.newInfo.password),
    profilePicture: req.body.newInfo.profilePicture,
    sessionId,
  });

  const today = new Date();
  const nextWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7,
  );

  const secure =
    req.headers["x-forwarded-host"] == "localhost:3000" ? "" : "Secure; ";

  context.res = {
    body: {
      email: req.body.newInfo.email,
      firstName: req.body.newInfo.firstName,
      lastName: req.body.newInfo.lastName,
      profilePicture: req.body.newInfo.profilePicture,
    },
    headers: {
      "Set-Cookie": `sessionId=${sessionId}; Expires=${nextWeek.toUTCString()}; SameSite=Lax; ${secure}HttpOnly;`,
    },
  };
};

export default httpTrigger;
