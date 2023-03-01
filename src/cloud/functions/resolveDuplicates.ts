import {
  ParseAlbum,
  ParseDuplicate,
  ParseImage,
  ParseUser,
  NativeAttributes,
  getObjectId,
} from "../shared";

export interface ResolveDuplicatesParams {
  duplicateIds: string[];
}

const resolveDuplicates = async (
  { duplicateIds }: ResolveDuplicatesParams,
  user?: Parse.User<NativeAttributes<"_User">>
) => {
  const duplicates = await ParseDuplicate.query()
    .containedIn(ParseDuplicate.COLUMNS.objectId, duplicateIds)
    .find({ useMasterKey: true });
  for (const duplicate of duplicates) {
    try {
      console.log("Resolving duplicate", duplicate.id);
      const imageToDelete = await ParseImage.query()
        .equalTo(
          ParseImage.COLUMNS.objectId,
          getObjectId(duplicate.get(ParseDuplicate.COLUMNS.image1))
        )
        .first({ useMasterKey: true });
      const imageToKeep = await ParseImage.query()
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
      const albumsToCorrect = await ParseAlbum.query()
        .contains(ParseAlbum.COLUMNS.images, imageToDelete.id)
        .find({ useMasterKey: true });
      for (const album of albumsToCorrect) {
        try {
          console.log("Correcting album", album.get(ParseAlbum.COLUMNS.name));
          const imageIds: string[] = album.get(ParseAlbum.COLUMNS.images);
          if (imageIds.includes(imageToKeep.id)) {
            album.set(
              ParseAlbum.COLUMNS.images,
              imageIds.filter((id) => id !== imageToDelete.id)
            );
          } else {
            album.set(
              ParseAlbum.COLUMNS.images,
              imageIds.map((id) =>
                id === imageToDelete.id ? imageToKeep.id : id
              )
            );
          }
          await album.save(null, {
            useMasterKey: true,
            context: {
              removedImages: [imageToDelete.id],
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
        await user.fetch();
        if (
          getObjectId(user.get(ParseUser.COLUMNS.profilePicture)) ===
          imageToDelete.id
        ) {
          console.log("Fixing profile picture for user", user.get("email"));
          user.set(ParseUser.COLUMNS.profilePicture, imageToKeep.toPointer());
          await user.save(null, {
            useMasterKey: true,
            context: { noTrigger: true },
          });
        }
      }
      console.log("Deleting image", imageToDelete.get(ParseImage.COLUMNS.name));
      await imageToDelete.destroy({ useMasterKey: true });
      console.log("Deleting duplicate", duplicate.id);
      await duplicate.destroy({ useMasterKey: true });
    } catch (error) {
      console.error("Error resolving duplicate", duplicate.id, error);
    }
  }
};

export default resolveDuplicates;
