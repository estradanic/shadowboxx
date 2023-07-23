import loggerWrapper from "../loggerWrapper";
import { ParseImage, Strings } from "../shared";

export interface GetImageParams {
  imageId: string;
}

/**
 * Function to get image base64 data,
 * thus skirting cors problems from getting it directly on the browser
 */
const getImage = async ({ imageId }: GetImageParams) => {
  const image = await ParseImage.cloudQuery(Parse)
    .equalTo(ParseImage.COLUMNS.objectId, imageId)
    .first({ useMasterKey: true });
  if (!image) {
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      Strings.cloud.error.imageNotFound
    );
  }
  const data: string = await image.file.getData();
  return data;
};

export default loggerWrapper("getImage", getImage);
