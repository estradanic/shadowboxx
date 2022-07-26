const sharp = require("sharp");

Parse.Cloud.beforeSave("Image", async (request) => {
  const imageRecord = request.object;
  if (
    !!imageRecord.get("file") &&
    (imageRecord.dirty("file") ||
      !imageRecord.get("fileThumb") ||
      !imageRecord.get("fileMobile"))
  ) {
    try {
      const { buffer } = await Parse.Cloud.httpRequest({
        url: imageRecord.get("file").url(),
      });
      const thumbnail = (
        await sharp(buffer).resize(64).webp().toBuffer()
      ).toString("base64");
      const mobile = (
        await sharp(buffer).resize(900).webp().toBuffer()
      ).toString("base64");
      const original = (await sharp(buffer).webp().toBuffer()).toString(
        "base64"
      );
      imageRecord.set(
        "file",
        await new Parse.File(imageRecord.get("name") + ".webp", {
          base64: original,
        }).save()
      );
      imageRecord.set(
        "fileThumb",
        await new Parse.File(imageRecord.get("name") + "_thumb.webp", {
          base64: thumbnail,
        }).save()
      );
      imageRecord.set(
        "fileMobile",
        await new Parse.File(imageRecord.get("name") + "_mobile.wepb", {
          base64: mobile,
        }).save()
      );
    } catch (e) {
      console.error(e);
    }
  }
});
