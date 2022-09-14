import sharp from "sharp";

const convertImages = async () => {
  let exhausted = false;
  let page = 0;
  const pageSize = 10;

  while (!exhausted) {
    console.log("Getting batch " + page + " of Images");
    const images = await new Parse.Query("Image")
      .ascending("createdAt")
      .limit(pageSize)
      .skip(page * pageSize)
      .find({ useMasterKey: true });
    if (images.length === 0) {
      exhausted = true;
    } else {
      const toDelete: (Parse.File | undefined)[] = [];
      for (let image of images) {
        if (image.get("fileLegacy")) {
          console.log("Already converted " + image.get("name") + ". Skipping.");
          continue;
        }
        try {
          console.log("Converting image " + image.get("name"));
          toDelete.push(
            image.get("file"),
            image.get("fileThumb"),
            image.get("fileLegacy"),
            image.get("fileMobile")
          );
          const { buffer } = await Parse.Cloud.httpRequest({
            url: image.get("file").url(),
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
          const legacy = (
            await sharp(buffer).resize(900).png().toBuffer()
          ).toString("base64");
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
          console.log("Converted image " + image.get("name"));
        } catch (e) {
          console.error("Could not convert " + image.get("name"));
          console.error(e);
        }
      }
      try {
        console.log("Saving batch " + page);
        await Parse.Object.saveAll(images, { useMasterKey: true });
      } catch (e) {
        console.error("Could not save batch " + page);
        console.error(e);
      }
      try {
        console.log("Deleting old files for batch " + page);
        for (let file of toDelete) {
          await file?.destroy();
        }
      } catch (e) {
        console.error("Could not delete files for batch " + page);
        console.error(e);
      }
      console.log("Converted batch " + page);
      page++;
    }
  }
};

export default convertImages;
