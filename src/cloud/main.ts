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
  undoEmailChange,
  UndoEmailChangeParams,
  verifyEmail,
  VerifyEmailParams,
} from "./functions";
import {
  GetImageReturn,
  ParseAlbum,
  ParseImage,
  ParseUser,
  ParsifyPointers,
  Strings,
} from "./shared";

type Image = Parse.Object<ParsifyPointers<"Image">>;
type Album = Parse.Object<ParsifyPointers<"Album">>;
type User = Parse.User<ParsifyPointers<"_User">>;

Parse.Cloud.beforeLogin(async (request) => {
  const user = new ParseUser(request.object as User, true);
  if (!(await isUserWhitelisted(user))) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      Strings.cloud.error.userNotWhitelisted
    );
  }
  if (!(await isEmailVerified(user))) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      Strings.cloud.error.emailNotVerified
    );
  }
});

Parse.Cloud.afterSave<Image>("Image", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  const image = new ParseImage(request.object as Image, true);
  if (image.type !== "image") {
    return;
  }
  await hashImage(image);
});

Parse.Cloud.afterSave<Album>("Album", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  const album = new ParseAlbum(request.object as Album, true);
  await setAlbumPermissions(album);
  await notifyOfAlbumChange(album, new ParseUser(request.user as User, true));
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await setUserPermissions(new ParseUser(request.object as User, true));
});

Parse.Cloud.beforeSave(Parse.User, async (request) => {
  const user = new ParseUser(request.object as User, true);
  if (request.master && request.context?.noTrigger) {
    return;
  }
  if (user.isNew() && !(await isUserWhitelisted(user))) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      Strings.cloud.error.userNotWhitelisted
    );
  } else if (user.isNew() || user.dirty(ParseUser.COLUMNS.email)) {
    await sendVerificationEmail(user);
  }
});

Parse.Cloud.beforeSave<Image>("Image", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  const image = new ParseImage(request.object as Image, true);
  if (image.isNew()) {
    image.dateTaken = new Date();
  }
  if (image.type !== "image") {
    return;
  }
  await resizeImage(image);
});

Parse.Cloud.beforeSave<Album>("Album", async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await mergeAlbumChanges(
    new ParseAlbum(request.object as Album, true),
    request.context
  );
});

Parse.Cloud.beforeDelete<Album>("Album", async (request) => {
  await deleteRoles(new ParseAlbum(request.object as Album, true));
});

Parse.Cloud.beforeDelete<Image>("Image", async (request) => {
  await deleteImageFromAlbums(new ParseImage(request.object as Image, true));
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
    await resolveDuplicates(
      request.params,
      new ParseUser(request.user as User, true)
    );
  }
);

Parse.Cloud.define<(params: GetImageParams) => Promise<GetImageReturn>>(
  "getImage",
  async (request) => {
    return await getImage(request.params);
  }
);

Parse.Cloud.define<(params: VerifyEmailParams) => Promise<void>>(
  "verifyEmail",
  async (request) => {
    await verifyEmail(request.params);
  }
);

Parse.Cloud.define<(params: ResendVerificationEmailParams) => Promise<void>>(
  "resendVerificationEmail",
  async (request) => {
    await resendVerificationEmail(request.params);
  }
);

Parse.Cloud.define<(params: UndoEmailChangeParams) => Promise<void>>(
  "undoEmailChange",
  async (request) => {
    await undoEmailChange(request.params);
  }
);

Parse.Cloud.define<
  (params: {
    name: string;
    type: "info" | "warn" | "error";
    user: string;
    logs: Record<string, any[]>;
  }) => Promise<void>
>("log", async (request) => {
  const log =
    request.params.type === "info"
      ? console.info
      : request.params.type === "warn"
      ? console.warn
      : console.error;
  Object.keys(request.params.logs)
    .sort()
    .reverse()
    .forEach((key) => {
      log(
        `[${request.params.user}] [${request.params.name}] ${key}`,
        ...request.params.logs[key]
      );
    });
});
