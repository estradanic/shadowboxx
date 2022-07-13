const Image = require("parse-image");

Parse.Cloud.beforeSave("Image", async (request, response) => {
  const imageRecord = request.object;
  if (!imageRecord.get("file") || !imageRecord.dirty("file")) {
    response.success();
    return imageRecord;
  }

  try {
    const buffer = await imageRecord.get("file").getData();
    const original = (await (await new Image().setData(buffer)).setFormat("webp")).data().toString("base64");
    const thumbnail = (await (await (await new Image().setData(buffer)).scale({width: 64})).setFormat("webp")).data().toString("base64");
    const mobile = (await (await (await new Image().setData(buffer)).scale({width: 900})).setFormat("webp")).data().toString("base64");
    imageRecord.set("file", await new Parse.File(imageRecord.get("name") + ".webp", {base64: original}).save());
    imageRecord.set("fileThumb", await new Parse.File(imageRecord.get("name") + "_thumb.webp", {base64: thumbnail}).save());
    imageRecord.set("fileMobile", await new Parse.File(imageRecord.get("name") + "_mobile.webp", {base64: mobile}).save());
  } catch (e) {
    throw e;
  }

  response.success();
  return imageRecord;
});
