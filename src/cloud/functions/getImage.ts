import loggerWrapper from "../loggerWrapper";
import { ParseImage, Strings } from "../shared";
import { ImageVariant } from "../types";

export interface GetImageParams {
  imageId: string;
  variant: ImageVariant;
}

/**
 * Function to get image base64 data,
 * thus skirting cors problems from getting it directly on the browser
 */
const getImage = async ({ imageId, variant = "full" }: GetImageParams) => {
  const image = await ParseImage.cloudQuery(Parse)
    .equalTo(ParseImage.COLUMNS.objectId, imageId)
    .first({ useMasterKey: true });
  if (!image) {
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      Strings.cloud.error.imageNotFound
    );
  }
  const imageFile =
    variant === "full"
      ? image.file
      : variant === "thumb"
      ? image.fileThumb
      : variant === "legacy"
      ? image.fileLegacy
      : image.fileMobile;
  const data: string = await imageFile.getData();
  return data;
};

export default loggerWrapper("getImage", getImage);
