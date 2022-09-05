import sharp from "sharp";

const resizeImage = async (image: Parse.Object) => {
  if (
    !!image.get("file") &&
    (image.dirty("file") || !image.get("fileThumb") || !image.get("fileMobile"))
  ) {
    const { buffer } = await Parse.Cloud.httpRequest({
      url: image.get("file").url(),
    });
    const thumbnail = (
      await sharp(buffer).resize(64).webp().toBuffer()
    ).toString("base64");
    const mobile = (await sharp(buffer).resize(900).webp().toBuffer()).toString(
      "base64"
    );
    const original = (await sharp(buffer).webp().toBuffer()).toString("base64");
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
  }
};

export default resizeImage;
