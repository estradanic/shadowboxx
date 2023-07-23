import loggerWrapper from "../loggerWrapper";
import { ParseImage } from "../shared";

/** Function to populate dateTaken with "createdAt" */
const populateDateTaken = async () => {
  let page = 0;
  const pageSize = 100;
  let exhausted = false;
  while (!exhausted) {
    console.log(`Getting batch ${page}`);
    const images = await ParseImage.cloudQuery(Parse)
      .doesNotExist(ParseImage.COLUMNS.dateTaken)
      .ascending(ParseImage.COLUMNS.createdAt)
      .limit(pageSize)
      .skip(page * pageSize)
      .find({ useMasterKey: true });
    if (images.length === 0) {
      exhausted = true;
    }
    for (const image of images) {
      console.log("Populating dateTaken for image", image.name);
      image.dateTaken = image.createdAt;
    }
    page++;
    console.log("Saving batch", page);
    await Parse.Object.saveAll(
      images.map((i) => i.toNative()),
      { useMasterKey: true }
    );
  }
};

export default loggerWrapper("populateDateTaken", populateDateTaken);
