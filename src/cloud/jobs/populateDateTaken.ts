/** Function to hash all images */
const hashImages = async () => {
  let page = 0;
  const pageSize = 100;
  let exhausted = false;
  while (!exhausted) {
    console.log(`Getting batch ${page}`);
    const images = await new Parse.Query("Image")
      .ascending("createdAt")
      .limit(pageSize)
      .skip(page * pageSize)
      .find({ useMasterKey: true });
    if (images.length === 0) {
      exhausted = true;
    }
    for (const image of images) {
      console.log("Populating dateTaken for image", image.get("name"));
      image.set("dateTaken", image.createdAt);
    }
    page++;
    console.log("Saving batch", page);
    await Parse.Object.saveAll(images, { useMasterKey: true });
  }
};

export default hashImages;
