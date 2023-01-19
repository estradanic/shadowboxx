/**
 * Function to avoid a race condition when saving an album.
 * Applies changes to the album in the db rather than just blindly saving the uploaded object.
 */
const mergeAlbumChanges = async (
  album: Parse.Object,
  context: Record<string, any>
) => {
  if (
    album.isNew() ||
    !(
      album.dirty("images") ||
      album.dirty("collaborators") ||
      album.dirty("viewers") ||
      album.dirty("coverImage")
    )
  ) {
    console.log("No changes to merge in album", album.id);
    return;
  }
  console.log("Merging changes in album", album.id);

  const attributes = album.attributes;

  await album.fetch({ useMasterKey: true });

  const images: string[] = album.get("images");
  const collaborators: string[] = album.get("collaborators");
  const viewers: string[] = album.get("viewers");

  if (context.addedImages) {
    console.log("Adding images", context.addedImages);
    images.push(...context.addedImages);
  }
  if (context.removedImages) {
    console.log("Removing images", context.removedImages);
    for (let i = 0; i < context.removedImages.length; i++) {
      images.splice(
        images.findIndex(
          (image: string) => image === context.removedImages?.[i]
        ),
        1
      );
    }
  }
  if (context.addedCollaborators) {
    console.log("Adding collaborators", context.addedCollaborators);
    collaborators.push(...context.addedCollaborators);
  }
  if (context.removedCollaborators) {
    console.log("Removing collaborators", context.removedCollaborators);
    for (let i = 0; i < context.removedCollaborators.length; i++) {
      collaborators.splice(
        collaborators.findIndex(
          (collaborator: string) =>
            collaborator === context.removedCollaborators?.[i]
        ),
        1
      );
    }
  }
  if (context.addedViewers) {
    console.log("Adding viewers", context.addedViewers);
    viewers.push(...context.addedViewers);
  }
  if (context.removedViewers) {
    console.log("Removing viewers", context.removedViewers);
    for (let i = 0; i < context.removedViewers.length; i++) {
      viewers.splice(
        viewers.findIndex(
          (viewer: string) => viewer === context.removedViewers?.[i]
        ),
        1
      );
    }
  }

  let coverImage = attributes.coverImage;
  if (images && (!coverImage || !images.includes(coverImage.id))) {
    console.log("Setting fallback for cover image");
    const image = await new Parse.Query("Image")
      .equalTo("objectId", images[0])
      .first({ useMasterKey: true });
    coverImage = image?.toPointer();
  }

  console.log("Saving album", album.id);
  album.set({ ...attributes, images, collaborators, viewers, coverImage });
};

export default mergeAlbumChanges;
