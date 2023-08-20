import loggerWrapper from "../loggerWrapper";
import { ParseImage, Strings, GetImageReturn, ImageVariant } from "../shared";

export interface GetImageParams {
  /** Id of the requested image */
  imageId: string;
  /** Variant of the requested image */
  variant: ImageVariant;
}

/**
 * Function to get image base64 data,
 * thus skirting cors problems from getting it directly on the browser
 */
const getImage = async ({
  imageId,
  variant = "full",
}: GetImageParams): Promise<GetImageReturn> => {
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
  const base64 = await imageFile.getData();
  return {
    base64,
    mimeType:
      image.type === "gif"
        ? "image/gif"
        : image.type === "video"
        ? "video/mp4"
        : variant === "legacy"
        ? "image/png"
        : "image/webp",
  };
};

export default loggerWrapper("getImage", getImage);
