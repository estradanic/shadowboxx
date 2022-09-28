export interface ResolveDuplicatesParams {
  duplicateIds: string[];
}

const resolveDuplicates = async ({ duplicateIds }: ResolveDuplicatesParams) => {
  const duplicates = await new Parse.Query("Duplicate")
    .containedIn("objectId", duplicateIds)
    .find();
  for (const duplicate of duplicates) {
    try {
      console.log("Resolving duplicate", duplicate.id);
      const imageToDelete = await new Parse.Query("Image")
        .equalTo("objectId", duplicate.get("image1").id)
        .first();
      const imageToKeep = await new Parse.Query("Image")
        .equalTo("objectId", duplicate.get("image2").id)
        .first();
      if (!imageToDelete) {
        console.log("Image to delete not found");
        await duplicate.destroy();
        continue;
      } else if (!imageToKeep) {
        console.log("Image to keep not found");
        await duplicate.destroy();
        continue;
      }
      const albumsToCorrect = await new Parse.Query("Album")
        .contains("images", imageToDelete.id)
        .find();
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
          await album.save();
        } catch (error) {
          console.error("Error correcting album", album.get("name"), error);
        }
      }
      await imageToDelete.destroy();
      await duplicate.destroy();
    } catch (error) {
      console.error("Error resolving duplicate", duplicate.id, error);
    }
  }
};

export default resolveDuplicates;
