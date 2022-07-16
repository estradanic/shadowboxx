const resizeImg = require("resize-image-buffer");

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
        await resizeImg(buffer, { width: 64, format: "png" })
      ).toString("base64");
      const mobile = (
        await resizeImg(buffer, { width: 700, format: "png" })
      ).toString("base64");
      imageRecord.set(
        "fileThumb",
        await new Parse.File(imageRecord.get("name") + "_thumb.png", {
          base64: thumbnail,
        }).save()
      );
      imageRecord.set(
        "fileMobile",
        await new Parse.File(imageRecord.get("name") + "_mobile.png", {
          base64: mobile,
        }).save()
      );
    } catch (e) {
      console.error(e);
    }
  }
});
