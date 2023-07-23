import sharp from "sharp";
import loggerWrapper from "../../loggerWrapper";
import { ParseImage } from "../../shared";

/**
 * Function to resize an image to thumbnail, mobile, and desktop sizes.
 * It also converts the image to png for iOS compatibility, and webp for smaller file size.
 */
const resizeImage = async (image: ParseImage) => {
  if (
    image.file &&
    (image.dirty(ParseImage.COLUMNS.file) || !image.hasBeenResized())
  ) {
    const { buffer } = await Parse.Cloud.httpRequest({
      url: image.file.url(),
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
    image.file = await new Parse.File(image.name + ".webp", {
      base64: original,
    }).save({ useMasterKey: true });
    image.fileThumb = await new Parse.File(image.name + "_thumb.webp", {
      base64: thumbnail,
    }).save({ useMasterKey: true });
    image.fileMobile = await new Parse.File(image.name + "_mobile.wepb", {
      base64: mobile,
    }).save({ useMasterKey: true });
    image.fileLegacy = await new Parse.File(image.name + "_legacy.png", {
      base64: legacy,
    }).save({ useMasterKey: true });
  }
};

export default loggerWrapper("resizeImage", resizeImage);
