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
    !(album.dirty("images") ||
      album.dirty("collaborators") ||
      album.dirty("viewers"))
  ) {
    return;
  }

  const attributes = album.attributes;

  await album.fetch({ useMasterKey: true });

  const images: string[] = album.get("images");
  const collaborators: string[] = album.get("collaborators");
  const viewers: string[] = album.get("viewers");

  if (context.addedImages) {
    images.push(...context.addedImages);
  }
  if (context.removedImages) {
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
    collaborators.push(...context.addedCollaborators);
  }
  if (context.removedCollaborators) {
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
    viewers.push(...context.addedViewers);
  }
  if (context.removedViewers) {
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
  if (!coverImage && images?.length) {
    const image = await new Parse.Query("Image").get(images[0]);
    coverImage = image.toPointer();
  }

  album.set({ ...attributes, images, collaborators, viewers, coverImage });
};

export default mergeAlbumChanges;
