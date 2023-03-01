import { bmvbhash } from "blockhash-core";
import { imageFromBuffer, getImageData } from "@canvas/image";
import { NativeAttributes, ParseImage } from "../../shared";

/** Function to convert hexadecimal to binary */
const hexToBinary = (hex: string) => {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
};

/** Function to hash an image for finding duplicates */
const hashImage = async (image: Parse.Object<NativeAttributes<"Image">>) => {
  if (
    !image.dirty(ParseImage.COLUMNS.file) &&
    image.get(ParseImage.COLUMNS.hash)
  ) {
    // If the image file hasn't changed and the hash already exists,
    // then don't do anything
    return;
  }
  const file =
    image.get(ParseImage.COLUMNS.fileThumb) ??
    image.get(ParseImage.COLUMNS.fileMobile) ??
    image.get(ParseImage.COLUMNS.file);
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

  image.set(ParseImage.COLUMNS.hash, hash);
  await image.save(null, { useMasterKey: true, context: { noTrigger: true } });
};

export default hashImage;
