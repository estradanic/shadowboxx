import sharp from "sharp";
import loggerWrapper from "../../loggerWrapper";
import { NativeAttributes, ParseImage } from "../../shared";

/**
 * Function to resize an image to thumbnail, mobile, and desktop sizes.
 * It also converts the image to png for iOS compatibility, and webp for smaller file size.
 */
const resizeImage = async (image: Parse.Object<NativeAttributes<"Image">>) => {
  if (
    !!image.get(ParseImage.COLUMNS.file) &&
    (image.dirty(ParseImage.COLUMNS.file) ||
      !image.get(ParseImage.COLUMNS.fileThumb) ||
      !image.get(ParseImage.COLUMNS.fileMobile) ||
      !image.get(ParseImage.COLUMNS.fileLegacy))
  ) {
    const { buffer } = await Parse.Cloud.httpRequest({
      url: image.get(ParseImage.COLUMNS.file).url(),
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
      ParseImage.COLUMNS.file,
      await new Parse.File(image.get(ParseImage.COLUMNS.name) + ".webp", {
        base64: original,
      }).save({ useMasterKey: true })
    );
    image.set(
      ParseImage.COLUMNS.fileThumb,
      await new Parse.File(image.get(ParseImage.COLUMNS.name) + "_thumb.webp", {
        base64: thumbnail,
      }).save({ useMasterKey: true })
    );
    image.set(
      ParseImage.COLUMNS.fileMobile,
      await new Parse.File(
        image.get(ParseImage.COLUMNS.name) + "_mobile.wepb",
        {
          base64: mobile,
        }
      ).save({ useMasterKey: true })
    );
    image.set(
      ParseImage.COLUMNS.fileLegacy,
      await new Parse.File(image.get(ParseImage.COLUMNS.name) + "_legacy.png", {
        base64: legacy,
      }).save({ useMasterKey: true })
    );
  }
};

export default loggerWrapper("resizeImage", resizeImage);
