import {
  deleteRoles,
  mergeAlbumChanges,
  resizeImage,
  setAlbumPermissions,
  setUserPermissions,
  hashImage,
} from "./triggers";

import { findDuplicateImages } from "./jobs";

Parse.Cloud.afterSave("Image", async (request) => {
  await hashImage(request.object);
});

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
  await mergeAlbumChanges(request.object, request.context);
});

Parse.Cloud.beforeDelete("Album", async (request) => {
  await deleteRoles(request.object);
});

Parse.Cloud.job("findDuplicates", async () => {
  await findDuplicateImages();
});
