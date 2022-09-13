import sharp from "sharp";

const resizeImage = async (image: Parse.Object) => {
  if (
    !!image.get("file") &&
    (image.dirty("file") ||
      !image.get("fileThumb") ||
      !image.get("fileMobile") ||
      !image.get("fileLegacy"))
  ) {
    const { buffer } = await Parse.Cloud.httpRequest({
      url: image.get("file").url(),
    });
    const thumbnail = (
      await sharp(buffer).rotate().resize(64).webp().toBuffer()
    ).toString("base64");
    const mobile = (await sharp(buffer).rotate().resize(900).webp().toBuffer()).toString(
      "base64"
    );
    const original = (await sharp(buffer).rotate().webp().toBuffer()).toString("base64");
    const legacy = (await sharp(buffer).rotate().resize(900).png().toBuffer()).toString(
      "base64"
    );
    image.set(
      "file",
      await new Parse.File(image.get("name") + ".webp", {
        base64: original,
      }).save()
    );
    image.set(
      "fileThumb",
      await new Parse.File(image.get("name") + "_thumb.webp", {
        base64: thumbnail,
      }).save()
    );
    image.set(
      "fileMobile",
      await new Parse.File(image.get("name") + "_mobile.wepb", {
        base64: mobile,
      }).save()
    );
    image.set(
      "fileLegacy",
      await new Parse.File(image.get("name") + "_legacy.png", {
        base64: legacy,
      }).save()
    );
  }
};

export default resizeImage;
