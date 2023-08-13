import loggerWrapper from "../loggerWrapper";
import { ParseDuplicate, ParseImage, ParseUser } from "../shared";
import { NativeAttributes } from "../shared/classes/ParseObject";

const SIMILARITY_THRESHOLD = 0.95;

/** Function to calculate similarity between image hashes */
const similarity = (hash1?: string, hash2?: string) => {
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
  let user: ParseUser | undefined;
  do {
    user = (
      await ParseUser.cloudQuery(Parse)
        .ascending(ParseUser.COLUMNS.createdAt)
        .limit(1)
        .skip(userSkip++)
        .find({ useMasterKey: true })
    )[0];
    console.log("Checking images for user", user.email);
    // Loop over all images for this user, one at a time
    let imageSkip = 0;
    let image: ParseImage | undefined;
    do {
      image = (
        await ParseImage.cloudQuery(Parse)
          .equalTo(ParseImage.COLUMNS.owner, user.toNativePointer())
          .ascending(ParseImage.COLUMNS.objectId)
          .limit(1)
          .skip(imageSkip++)
          .find({ useMasterKey: true })
      )?.[0];
      console.log("Checking duplicates for image", image?.name);
      if (!image || !image.hash) {
        console.warn("Image does not exist or does not have hash", image?.name);
        continue;
      }
      let page = 0;
      const pageSize = 100;
      let exhausted = false;
      while (!exhausted) {
        console.log(`Getting batch ${page} for image ${image.name}`);
        const otherImages = await ParseImage.cloudQuery(Parse)
          .equalTo(ParseImage.COLUMNS.owner, user.toNativePointer())
          .notEqualTo(ParseImage.COLUMNS.objectId, image.objectId)
          .ascending(ParseImage.COLUMNS.createdAt)
          .limit(pageSize)
          .skip(page * pageSize)
          .find({ useMasterKey: true });
        page++;
        if (otherImages.length === 0) {
          exhausted = true;
        }
        const duplicates = [];
        for (const otherImage of otherImages) {
          console.log("Checking image", otherImage.name);
          const existingDuplicateQuery = await Parse.Query.or(
            ParseDuplicate.cloudQuery(Parse)
              .equalTo(ParseDuplicate.COLUMNS.image1, image.toNativePointer())
              .equalTo(
                ParseDuplicate.COLUMNS.image2,
                otherImage.toNativePointer()
              ),
            ParseDuplicate.cloudQuery(Parse)
              .equalTo(
                ParseDuplicate.COLUMNS.image1,
                otherImage.toNativePointer()
              )
              .equalTo(ParseDuplicate.COLUMNS.image2, image.toNativePointer())
          ).find({ useMasterKey: true });
          if (existingDuplicateQuery.length > 0) {
            console.log(
              "Duplicate already exists",
              image.name,
              otherImage.name
            );
            continue;
          }
          const similarityScore = similarity(image.hash, otherImage.hash);
          if (similarityScore > SIMILARITY_THRESHOLD) {
            console.log(
              `Found duplicate images: ${image.name} and ${otherImage.name} with similarity ${similarityScore}`
            );
            duplicates.push(
              new Parse.Object<NativeAttributes<"Duplicate">>("Duplicate", {
                image1: image.toNativePointer(),
                image2: otherImage.toNativePointer(),
                similarity: similarityScore,
                owner: user.toNativePointer(),
                acknowledged: false,
              })
            );
          }
        }
        if (duplicates.length) {
          console.log("Saving duplicates");
          await Parse.Object.saveAll(duplicates, { useMasterKey: true });
        } else {
          console.log("No duplicates were found");
        }
      }
    } while (image);
  } while (user);
};

export default loggerWrapper("findDuplicateImages", findDuplicateImages);
