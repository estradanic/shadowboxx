import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {get} from "../src/Database";
import Strings from "../src/resources/Strings";
import {getCookie} from "../src/utils/requestUtils";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  let sessionId;
  if (req.headers.cookie.includes("sessionId")) {
    sessionId = getCookie(req.headers.cookie, "sessionId");
  }
  if (sessionId) {
    const email = sessionId.split("|")[0];
    const userData = await get(`users/${email}`);
    if (userData && userData["sessionId"] === sessionId) {
      context.res = {
        status: 200,
        body: {
          email: userData["email"],
          firstName: userData["firstName"],
          lastName: userData["lastName"],
        },
      };
      return;
    } else if (userData) {
      context.res = {
        status: 401,
        body: Strings.wrongSessionId(),
      };
      return;
    } else {
      context.res = {
        status: 401,
        body: Strings.noEmailExists(email),
      };
      return;
    }
  }
  context.res = {
    status: 400,
    body: Strings.noSessionId(),
  };
};

export default httpTrigger;