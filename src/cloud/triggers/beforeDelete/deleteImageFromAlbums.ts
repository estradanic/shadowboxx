/** Function to delete image from the albums it appears in before destruction */
const deleteImageFromAlbums = async (image: Parse.Object) => {
  if (!image?.id) {
    console.error("image not found for deleting from albums");
    return;
  }
  console.log(`Deleting image ${image.id} from albums`);
  const albums = await new Parse.Query("Album")
    .contains("images", image.id)
    .find({ useMasterKey: true });
  console.log("Found albums", albums);
  await Promise.all(
    albums.map(async (album) => {
      console.log(`Deleting image ${image.id} from album`, album.id);
      const images = album.get("images") as string[];
      album.set(
        "images",
        images.filter((id) => id !== image.id)
      );
      console.log("Saving album", album.id);
      await album.save(null, {
        useMasterKey: true,
        context: {
          removedImages: [image.id],
        },
      });
      console.log("Saved album", album.id);
    })
  );
  console.log(`Deleted image ${image.id} from albums`);
};

export default deleteImageFromAlbums;
