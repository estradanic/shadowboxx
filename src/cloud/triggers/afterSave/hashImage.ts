import { bmvbhash } from "blockhash-core";
import { imageFromBuffer, getImageData } from "@canvas/image";
import { ParseImage } from "../../shared";
import loggerWrapper from "../../loggerWrapper";

/** Function to convert hexadecimal to binary */
const hexToBinary = (hex: string) => {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
};

/** Function to hash an image for finding duplicates */
const hashImage = async (image: ParseImage) => {
  if (!image.dirty(ParseImage.COLUMNS.file) && image.hash) {
    // If the image file hasn't changed and the hash already exists,
    // then don't do anything
    return;
  }
  const file = image.fileThumb ?? image.fileMobile ?? image.file;
  if (!file) {
    console.error("No file found for image", image.objectId);
    return;
  }
  const { buffer } = await Parse.Cloud.httpRequest({
    url: file.url(),
  });
  if (!buffer) {
    console.error("Could not get buffer for image", image.objectId);
    return;
  }
  const imageData = getImageData(await imageFromBuffer(buffer));
  if (!imageData) {
    console.error("Could not get ImageData for image", image.objectId);
    return;
  }
  const hash = hexToBinary(bmvbhash(imageData, 16));

  image.hash = hash;
  await image.cloudSave({ useMasterKey: true, context: { noTrigger: true } });
};

export default loggerWrapper("hashImage", hashImage);
