/** Function to calculate similarity between image hashes */
const similarity = (hash1: string, hash2: string) => {
  if (!hash1 || !hash2) {
    return 0;
  }
  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) {
      matches++;
    }
  }
  return matches / hash1.length;
};

/** Function to find duplicate images in the database. */
const findDuplicateImages = async () => {
  // Loop over all users in the db, one at a time
  let userSkip = 0;
  let user: Parse.User;
  do {
    [user] = await new Parse.Query(Parse.User)
      .ascending("createdAt")
      .limit(1)
      .skip(userSkip++)
      .find({ useMasterKey: true });
    console.log("Checking images for user", user.get("email"));

    // Loop over all images for this user, one at a time
    let imageSkip = 0;
    let image: Parse.Object;
    do {
      [image] = await new Parse.Query("Image")
        .equalTo("owner", user.id)
        .ascending("objectId")
        .limit(1)
        .skip(imageSkip++)
        .find({ useMasterKey: true });
      console.log("Checking duplicates for image", image.get("name"));
      if (image?.get("hash")) {
        let page = 0;
        const pageSize = 100;
        let exhausted = false;
        while (!exhausted) {
          console.log(`Getting batch ${page} for image ${image.get("name")}`);
          const otherImages = await new Parse.Query("Image")
            .equalTo("owner", user.id)
            .notEqualTo("objectId", image.id)
            .ascending("createdAt")
            .limit(pageSize)
            .skip(page * pageSize)
            .find({ useMasterKey: true });
          if (otherImages.length === 0) {
            exhausted = true;
          }
          const duplicates = [];
          for (const otherImage of otherImages) {
            console.log("Checking image", otherImage.get("name"));
            const existingDuplicateQuery = await Parse.Query.or(
              new Parse.Query("Duplicate")
                .equalTo("image1", image.toPointer())
                .equalTo("image2", otherImage.toPointer()),
              new Parse.Query("Duplicate")
                .equalTo("image1", otherImage.toPointer())
                .equalTo("image2", image.toPointer())
            ).find({ useMasterKey: true });
            if (existingDuplicateQuery.length > 0) {
              console.log(
                "Duplicate already exists",
                image.get("name"),
                otherImage.get("name")
              );
              continue;
            }
            const similarityScore = similarity(
              image.get("hash"),
              otherImage.get("hash")
            );
            if (similarityScore > 0.9) {
              console.log(
                `Found duplicate images: ${image.get(
                  "name"
                )} and ${otherImage.get(
                  "name"
                )} with similarity ${similarityScore}`
              );
              duplicates.push(
                new Parse.Object("Duplicate", {
                  image1: image.toPointer(),
                  image2: otherImage.toPointer(),
                  similarity: similarityScore,
                })
              );
            }
          }
          console.log("Saving duplicates", duplicates);
          await Parse.Object.saveAll(duplicates, { useMasterKey: true });
        }
      }
    } while (image);
  } while (user);
};

export default findDuplicateImages;
