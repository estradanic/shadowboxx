import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { put, get } from "../src/Database";

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  await put("test", "testing database");
  const data = await get("test");

  context.log("HTTP trigger function processed a request.");

  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = name
    ? `Hello, ${name}. We are testing the database. Here's the data: ${data}`
    : `Hello, anonymous. We are testing the database. Here's the data: ${data}`;

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage
  };
};

export default httpTrigger;
