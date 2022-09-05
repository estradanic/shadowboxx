import {
  deleteRoles,
  mergeAlbumChanges,
  resizeImage,
  setAlbumPermissions,
  setUserPermissions,
} from "./triggers";

Parse.Cloud.afterSave("Album", async (request) => {
  await setAlbumPermissions(request.object);
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  await setUserPermissions(request.object);
});

Parse.Cloud.beforeSave("Image", async (request) => {
  await resizeImage(request.object);
});

Parse.Cloud.beforeSave("Album", async (request) => {
  await mergeAlbumChanges(
    request.object,
    request.context,
  );
});

Parse.Cloud.beforeDelete("Album", async (request) => {
  await deleteRoles(request.object);
});
