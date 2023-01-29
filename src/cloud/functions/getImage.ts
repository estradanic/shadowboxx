export interface GetImageParams {
  imageId: string;
}

/**
 * Function to get image base64 data,
 * thus skirting cors problems from getting it directly on the browser
 */
const getImage = async ({ imageId }: GetImageParams) => {
  const image = await new Parse.Query("Image")
    .equalTo("objectId", imageId)
    .first({ useMasterKey: true });
  if (!image) {
    throw new Parse.Error(404, "Image not found");
  }
  const data: string = image.get("file").getData();
  return data;
};

export default getImage;
