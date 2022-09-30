import { bmvbhash } from "blockhash-core";
import Image, { imageFromBuffer, getImageData } from "@canvas/image";

/** Function to convert hexadecimal to binary */
const hexToBinary = (hex: string) => {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
};

/** Function to hash an image for finding duplicates */
const hashImage = async (image: Parse.Object) => {
  if (!image.dirty("file") && image.get("hash")) {
    // If the image file hasn't changed and the hash already exists,
    // then don't do anything
    return;
  }
  const file =
    image.get("fileThumb") ?? image.get("fileMobile") ?? image.get("file");
  if (!file) {
    console.error("No file found for image", image.id);
    return;
  }
  const { buffer } = await Parse.Cloud.httpRequest({
    url: file.url(),
  });
  if (!buffer) {
    console.error("Could not get buffer for image", image.id);
    return;
  }
  const imageData = await getImageData(await imageFromBuffer(buffer));
  if (!imageData) {
    console.error("Could not get ImageData for image", image.id);
    return;
  }
  const hash = hexToBinary(await bmvbhash(imageData, 16));

  image.set("hash", hash);
  await image.save(null, { useMasterKey: true, context: { noTrigger: true } });
};

export default hashImage;
