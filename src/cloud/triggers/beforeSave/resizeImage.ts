import sharp from "sharp";

/**
 * Function to resize an image to thumbnail, mobile, and desktop sizes.
 * It also converts the image to png for iOS compatibility, and webp for smaller file size.
 */
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
    const mobile = (
      await sharp(buffer).rotate().resize(900).webp().toBuffer()
    ).toString("base64");
    const original = (await sharp(buffer).rotate().webp().toBuffer()).toString(
      "base64"
    );
    const legacy = (
      await sharp(buffer).rotate().resize(900).png().toBuffer()
    ).toString("base64");
    image.set(
      "file",
      await new Parse.File(image.get("name") + ".webp", {
        base64: original,
      }).save({useMasterKey: true})
    );
    image.set(
      "fileThumb",
      await new Parse.File(image.get("name") + "_thumb.webp", {
        base64: thumbnail,
      }).save({useMasterKey: true})
    );
    image.set(
      "fileMobile",
      await new Parse.File(image.get("name") + "_mobile.wepb", {
        base64: mobile,
      }).save({useMasterKey: true})
    );
    image.set(
      "fileLegacy",
      await new Parse.File(image.get("name") + "_legacy.png", {
        base64: legacy,
      }).save({useMasterKey: true})
    );
  }
};

export default resizeImage;
