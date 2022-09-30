export interface ResolveDuplicatesParams {
  duplicateIds: string[];
}

const resolveDuplicates = async (
  { duplicateIds }: ResolveDuplicatesParams,
  user?: Parse.User
) => {
  const duplicates = await new Parse.Query("Duplicate")
    .containedIn("objectId", duplicateIds)
    .find({ useMasterKey: true });
  for (const duplicate of duplicates) {
    try {
      console.log("Resolving duplicate", duplicate.id);
      const imageToDelete = await new Parse.Query("Image")
        .equalTo("objectId", duplicate.get("image1").id)
        .first({ useMasterKey: true });
      const imageToKeep = await new Parse.Query("Image")
        .equalTo("objectId", duplicate.get("image2").id)
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
      const albumsToCorrect = await new Parse.Query("Album")
        .contains("images", imageToDelete.id)
        .find({ useMasterKey: true });
      for (const album of albumsToCorrect) {
        try {
          console.log("Correcting album", album.get("name"));
          const imageIds: string[] = album.get("images");
          if (imageIds.includes(imageToKeep.id)) {
            album.set(
              "images",
              imageIds.filter((id) => id !== imageToDelete.id)
            );
          } else {
            album.set(
              "images",
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
          console.error("Error correcting album", album.get("name"), error);
        }
      }
      if (user) {
        await user.fetch();
        if (user.get("profilePicture").id === imageToDelete.id) {
          console.log("Fixing profile picture for user", user.get("email"));
          user.set("profilePicture", imageToKeep.toPointer());
          await user.save(null, {
            useMasterKey: true,
            context: { noTrigger: true },
          });
        }
      }
      console.log("Deleting image", imageToDelete.get("name"));
      await imageToDelete.destroy({ useMasterKey: true });
      console.log("Deleting duplicate", duplicate.id);
      await duplicate.destroy({ useMasterKey: true });
    } catch (error) {
      console.error("Error resolving duplicate", duplicate.id, error);
    }
  }
};

export default resolveDuplicates;
