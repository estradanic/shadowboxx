import {AzureFunction, Context, HttpRequest} from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  const secure =
    req.headers["x-forwarded-host"] == "localhost:3000" ? "" : "Secure; ";

  const today = new Date();
  const lastYear = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate(),
  );

  context.res = {
    headers: {
      "Set-Cookie": `sessionId=; Expires=${lastYear.toUTCString()}; SameSite=Lax; ${secure}HttpOnly;`,
    },
  };
};

export default httpTrigger;
