import loggerWrapper from "../loggerWrapper";
import {
  ParseAlbum,
  ParseDuplicate,
  ParseImage,
  ParseUser,
  getObjectId,
} from "../shared";

export interface ResolveDuplicatesParams {
  duplicateIds: string[];
}

const resolveDuplicates = async (
  { duplicateIds }: ResolveDuplicatesParams,
  user?: ParseUser
) => {
  const duplicates = await ParseDuplicate.cloudQuery(Parse)
    .containedIn(ParseDuplicate.COLUMNS.objectId, duplicateIds)
    .find({ useMasterKey: true });
  for (const duplicate of duplicates) {
    try {
      console.log("Resolving duplicate", duplicate.id);
      const imageToDelete = await ParseImage.cloudQuery(Parse)
        .equalTo(
          ParseImage.COLUMNS.objectId,
          getObjectId(duplicate.get(ParseDuplicate.COLUMNS.image1))
        )
        .first({ useMasterKey: true });
      const imageToKeep = await ParseImage.cloudQuery(Parse)
        .equalTo(
          ParseImage.COLUMNS.objectId,
          getObjectId(duplicate.get(ParseDuplicate.COLUMNS.image2))
        )
        .first({ useMasterKey: true });
      if (!imageToDelete) {
        console.log("Image to delete not found");
        await duplicate.destroy({ useMasterKey: true });
        continue;
      } else if (!imageToKeep) {
        console.log("Image to keep not found");
        await duplicate.destroy({ useMasterKey: true });
        continue;
      }
      const albumsToCorrect = await ParseAlbum.cloudQuery(Parse)
        .contains(ParseAlbum.COLUMNS.images, imageToDelete.objectId)
        .find({ useMasterKey: true });
      for (const album of albumsToCorrect) {
        try {
          console.log("Correcting album", album.get(ParseAlbum.COLUMNS.name));
          const imageIds: string[] = album.get(ParseAlbum.COLUMNS.images);
          if (imageIds.includes(imageToKeep.objectId)) {
            album.set(
              ParseAlbum.COLUMNS.images,
              imageIds.filter((id) => id !== imageToDelete.objectId)
            );
          } else {
            album.set(
              ParseAlbum.COLUMNS.images,
              imageIds.map((id) =>
                id === imageToDelete.objectId ? imageToKeep.objectId : id
              )
            );
          }
          await album.save(null, {
            useMasterKey: true,
            context: {
              removedImages: [imageToDelete.objectId],
            },
          });
        } catch (error) {
          console.error(
            "Error correcting album",
            album.get(ParseAlbum.COLUMNS.name),
            error
          );
        }
      }
      if (user) {
        await user.cloudFetch();
        if (getObjectId(user.profilePicture) === imageToDelete.objectId) {
          console.log("Fixing profile picture for user", user.email);
          user.profilePicture = imageToKeep.toPointer();
          await user.cloudSave({
            useMasterKey: true,
            context: { noTrigger: true },
          });
        }
      }
      console.log("Deleting image", imageToDelete.name);
      await imageToDelete.destroy({ useMasterKey: true });
      console.log("Deleting duplicate", duplicate.id);
      await duplicate.destroy({ useMasterKey: true });
    } catch (error) {
      console.error("Error resolving duplicate", duplicate.id, error);
    }
  }
};

export default loggerWrapper("resolveDuplicates", resolveDuplicates);
