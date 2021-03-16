import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {generate as generateHash} from "password-hash";
import {validateEmail, ErrorState} from "../src/utils/formUtils";
import {isNullOrWhitespace} from "../src/utils/stringUtils";
import Strings from "../src/resources/Strings";
import {get, put} from "../src/Database";
import {v4 as uuid} from "uuid";

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
    req.body.email,
    req.body.password,
    req.body.firstName,
    req.body.lastName,
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
      status: 400,
      error: errorMessage,
    };
    return;
  }

  const existingUserData = await get(`users/${req.body.email}`);
  if (existingUserData) {
    context.log(Strings.emailExists(req.body.email));
    context.res = {
      status: 409,
      error: Strings.emailExists(req.body.email),
    };
    return;
  }

  const sessionId = uuid();
  const userData = {
    email: req.body.email,
    password: generateHash(req.body.password),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    sessionId,
  };
  await put(`users/${req.body.email}`, userData);

  const today = new Date();
  const nextWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7,
  );

  const secure =
    req.headers["x-forwarded-host"] == "localhost:3000" ? "" : "Secure; ";

  context.res = {
    body: userData,
    headers: {
      "Set-Cookie": `sessionid=${sessionId}; Expires=${nextWeek.toUTCString()}; SameSite=Lax; ${secure}HttpOnly;`,
    },
  };
};

export default httpTrigger;
