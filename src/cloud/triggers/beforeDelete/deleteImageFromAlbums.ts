import loggerWrapper from "../../loggerWrapper";
import { ParseAlbum, ParseImage } from "../../shared";

/** Function to delete image from the albums it appears in before destruction */
const deleteImageFromAlbums = async (image: ParseImage) => {
  if (!image?.objectId) {
    console.error("image not found for deleting from albums");
    return;
  }
  console.log(`Deleting image ${image.objectId} from albums`);
  const albums = await ParseAlbum.cloudQuery(Parse)
    .contains(ParseAlbum.COLUMNS.images, image.objectId)
    .find({ useMasterKey: true });
  console.log("Found albums", albums);
  await Promise.all(
    albums.map(async (album) => {
      console.log(`Deleting image ${image.objectId} from album`, album.id);
      const images = album.get(ParseAlbum.COLUMNS.images) as string[];
      album.set(
        ParseAlbum.COLUMNS.images,
        images.filter((id) => id !== image.objectId)
      );
      console.log("Saving album", album.id);
      await album.save(null, {
        useMasterKey: true,
        context: {
          removedImages: [image.objectId],
        },
      });
      console.log("Saved album", album.id);
    })
  );
  console.log(`Deleted image ${image.objectId} from albums`);
};

export default loggerWrapper("deleteImageFromAlbum", deleteImageFromAlbums);
