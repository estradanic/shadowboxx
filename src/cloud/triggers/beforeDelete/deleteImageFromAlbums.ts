import loggerWrapper from "../../loggerWrapper";
import { NativeAttributes, ParseAlbum } from "../../shared";

/** Function to delete image from the albums it appears in before destruction */
const deleteImageFromAlbums = async (
  image: Parse.Object<NativeAttributes<"Image">>
) => {
  if (!image?.id) {
    console.error("image not found for deleting from albums");
    return;
  }
  console.log(`Deleting image ${image.id} from albums`);
  const albums = await ParseAlbum.cloudQuery(Parse)
    .contains(ParseAlbum.COLUMNS.images, image.id)
    .find({ useMasterKey: true });
  console.log("Found albums", albums);
  await Promise.all(
    albums.map(async (album) => {
      console.log(`Deleting image ${image.id} from album`, album.id);
      const images = album.get(ParseAlbum.COLUMNS.images) as string[];
      album.set(
        ParseAlbum.COLUMNS.images,
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

export default loggerWrapper("deleteImageFromAlbum", deleteImageFromAlbums);
