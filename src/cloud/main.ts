import {
  deleteRoles,
  mergeAlbumChanges,
  resizeImage,
  setAlbumPermissions,
  setUserPermissions,
  hashImage,
} from "./triggers";

import { findDuplicateImages, hashImages } from "./jobs";
import { resolveDuplicates, ResolveDuplicatesParams } from "./functions";

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

Parse.Cloud.job("findDuplicates", async (request) => {
  await findDuplicateImages();
  request.message("Done");
});

Parse.Cloud.job("hashImages", async (request) => {
  await hashImages();
  request.message("Done");
});

Parse.Cloud.define<(request: ResolveDuplicatesParams) => Promise<void>>(
  "resolveDuplicates",
  async (request) => {
    await resolveDuplicates(request.params);
  }
);
