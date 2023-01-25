import {
  deleteRoles,
  mergeAlbumChanges,
  resizeImage,
  setAlbumPermissions,
  setUserPermissions,
  hashImage,
  isUserWhitelisted,
  notifyOfAlbumChange,
  deleteImageFromAlbums,
} from "./triggers";
import { findDuplicateImages, hashImages } from "./jobs";
import {
  getImage,
  GetImageParams,
  resolveDuplicates,
  ResolveDuplicatesParams,
} from "./functions";
import populateDateTaken from "./jobs/populateDateTaken";

Parse.Cloud.beforeLogin(async (request) => {
  if (!(await isUserWhitelisted(request.object))) {
    throw new Parse.Error(
      403,
      "User not whitelisted and public logins are disabled"
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
    await notifyOfAlbumChange(request.object, request.user);
  }
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  if (!request.master || !request.context?.noTrigger) {
    await setUserPermissions(request.object);
  }
});

Parse.Cloud.beforeSave(Parse.User, async (request) => {
  if (request.object.isNew() && !(await isUserWhitelisted(request.object))) {
    throw new Parse.Error(
      403,
      "User not whitelisted and public signups are disabled"
    );
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

Parse.Cloud.beforeDelete("Image", async (request) => {
  await deleteImageFromAlbums(request.object);
});

Parse.Cloud.job("findDuplicates", async (request) => {
  await findDuplicateImages();
  request.message("Done");
});

Parse.Cloud.job("hashImages", async (request) => {
  await hashImages();
  request.message("Done");
});

Parse.Cloud.job("populateDateTaken", async (request) => {
  await populateDateTaken();
  request.message("Done");
});

Parse.Cloud.define<(request: ResolveDuplicatesParams) => Promise<void>>(
  "resolveDuplicates",
  async (request) => {
    await resolveDuplicates(request.params, request.user);
  }
);

Parse.Cloud.define<(request: GetImageParams) => Promise<any>>(
  "getImage",
  async (request) => {
    return await getImage(request.params);
  }
);
