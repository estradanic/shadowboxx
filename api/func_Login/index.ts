import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {get, put} from "../src/Database";
import {v4 as uuid} from "uuid";
import Strings from "../src/resources/Strings";
import {isNullOrWhitespace} from "../src/utils/stringUtils";
import {ErrorState} from "../src/utils/formUtils";
import {verify} from "password-hash";

const validate = (
  email: string,
  password: string,
): ErrorState<"email" | "password"> => {
  const errors: ErrorState<"email" | "password"> = {
    email: {isError: false, errorMessage: ""},
    password: {isError: false, errorMessage: ""},
  };

  if (isNullOrWhitespace(email)) {
    errors.email = {isError: true, errorMessage: Strings.pleaseEnterA("email")};
  }
  if (isNullOrWhitespace(password)) {
    errors.password = {
      isError: true,
      errorMessage: Strings.pleaseEnterA("password"),
    };
  }
  return errors;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const errors = validate(req.body.email, req.body.password);
  let errorMessage = "";
  Object.keys(errors).forEach((error) => {
    if (errors[error].isError) {
      errorMessage += errors[error].errorMessage + "\n";
    }
  });
  if (!isNullOrWhitespace(errorMessage)) {
    context.log(errorMessage);
    context.res = {
      error: errorMessage,
      status: 400,
    };
    return;
  }

  const existingUserData = await get(`users/${req.body.email}`);
  if (!existingUserData) {
    context.log(Strings.noEmailExists(req.body.email));
    context.res = {
      error: Strings.noEmailExists(req.body.email),
      status: 401,
    };
    return;
  }

  if (!verify(req.body.password, existingUserData["password"])) {
    context.log(Strings.incorrectPassword());
    context.res = {
      status: 401,
      error: Strings.incorrectPassword(),
    };
    return;
  }

  const sessionId = uuid();
  existingUserData["sessionId"] = sessionId;
  await put(`users/${req.body.email}`, existingUserData);

  const today = new Date();
  const nextWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7,
  );

  const secure =
    req.headers["x-forwarded-host"] == "localhost:3000" ? "" : "Secure; ";

  context.res = {
    body: existingUserData,
    headers: {
      "Set-Cookie": `sessionid=${sessionId}; Expires=${nextWeek.toUTCString()}; SameSite=Lax; ${secure}HttpOnly;`,
    },
  };
};

export default httpTrigger;
