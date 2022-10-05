import {
  deleteRoles,
  mergeAlbumChanges,
  resizeImage,
  setAlbumPermissions,
  setUserPermissions,
  hashImage,
  isUserWhitelisted,
} from "./triggers";
import { findDuplicateImages, hashImages } from "./jobs";
import { resolveDuplicates, ResolveDuplicatesParams } from "./functions";

Parse.Cloud.beforeLogin(async (request) => {
  if (!(await isUserWhitelisted(request.object))) {
    throw new Parse.Error(
      403,
      "User not whitelisted and public signups are disabled"
    );
  }
});

Parse.Cloud.afterSave("Image", async (request) => {
  if (!request.master || !request.context?.noTrigger) {
    await hashImage(request.object);
  }
});

Parse.Cloud.afterSave("Album", async (request) => {
  if (!request.master || !request.context?.noTrigger) {
    await setAlbumPermissions(request.object);
  }
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  if (!request.master || !request.context?.noTrigger) {
    await setUserPermissions(request.object);
  }
});

Parse.Cloud.beforeSave("Image", async (request) => {
  if (!request.master || !request.context?.noTrigger) {
    await resizeImage(request.object);
  }
});

Parse.Cloud.beforeSave("Album", async (request) => {
  if (!request.master || !request.context?.noTrigger) {
    await mergeAlbumChanges(request.object, request.context);
  }
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
    await resolveDuplicates(request.params, request.user);
  }
);
