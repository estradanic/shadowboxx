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
  sendVerificationEmail,
  isEmailVerified,
} from "./triggers";
import { findDuplicateImages, hashImages, populateDateTaken } from "./jobs";
import {
  getImage,
  GetImageParams,
  resendVerificationEmail,
  ResendVerificationEmailParams,
  resolveDuplicates,
  ResolveDuplicatesParams,
  verifyEmail,
  VerifyEmailParams,
} from "./functions";

Parse.Cloud.beforeLogin(async (request) => {
  if (!(await isUserWhitelisted(request.object))) {
    throw new Parse.Error(
      403,
      "User not whitelisted and public logins are disabled"
    );
  }
  if (!(await isEmailVerified(request.object))) {
    throw new Parse.Error(401, "Email not verified");
  }
});

Parse.Cloud.afterSave("Image", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await hashImage(request.object);
});

Parse.Cloud.afterSave("Album", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await setAlbumPermissions(request.object);
  await notifyOfAlbumChange(request.object, request.user);
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await setUserPermissions(request.object);
});

Parse.Cloud.beforeSave(Parse.User, async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  if (request.object.isNew() && !(await isUserWhitelisted(request.object))) {
    throw new Parse.Error(
      403,
      "User not whitelisted and public signups are disabled"
    );
  } else if (request.object.isNew() || request.object.dirty("email")) {
    await sendVerificationEmail(request.object);
  }
});

Parse.Cloud.beforeSave("Image", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await resizeImage(request.object);
});

Parse.Cloud.beforeSave("Album", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await mergeAlbumChanges(request.object, request.context);
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

Parse.Cloud.define<(params: ResolveDuplicatesParams) => Promise<void>>(
  "resolveDuplicates",
  async (request) => {
    await resolveDuplicates(request.params, request.user);
  }
);

Parse.Cloud.define<(params: GetImageParams) => Promise<string>>(
  "getImage",
  async (request) => {
    return await getImage(request.params);
  }
);

Parse.Cloud.define<(params: VerifyEmailParams) => Promise<void>>(
  "verifyEmail",
  async (request) => {
    return await verifyEmail(request.params);
  }
);

Parse.Cloud.define<(params: ResendVerificationEmailParams) => Promise<void>>(
  "resendVerificationEmail",
  async (request) => {
    await resendVerificationEmail(request.params);
  }
);
