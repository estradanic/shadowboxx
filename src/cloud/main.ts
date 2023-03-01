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
import { NativeAttributes, ParseUser, Strings } from "./shared";

Parse.Cloud.beforeLogin(async (request) => {
  const user = request.object as Parse.User<NativeAttributes<"_User">>;
  if (!(await isUserWhitelisted(user))) {
    throw new Parse.Error(403, Strings.cloud.error.userNotWhitelisted);
  }
  if (!(await isEmailVerified(user))) {
    throw new Parse.Error(401, Strings.cloud.error.emailNotVerified);
  }
});

Parse.Cloud.afterSave<Parse.Object<NativeAttributes<"Image">>>(
  "Image",
  async (request) => {
    if (request.master && request.context?.noTrigger) {
      return;
    }
    await hashImage(request.object);
  }
);

Parse.Cloud.afterSave<Parse.Object<NativeAttributes<"Album">>>(
  "Album",
  async (request) => {
    if (request.master && request.context?.noTrigger) {
      return;
    }
    await setAlbumPermissions(request.object);
    await notifyOfAlbumChange(
      request.object,
      request.user as Parse.User<NativeAttributes<"_User">>
    );
  }
);

Parse.Cloud.afterSave(Parse.User, async (request) => {
  if (request.master && request.context?.noTrigger) {
    return;
  }
  await setUserPermissions(
    request.object as Parse.User<NativeAttributes<"_User">>
  );
});

Parse.Cloud.beforeSave(Parse.User, async (request) => {
  const user = request.object as Parse.User<NativeAttributes<"_User">>;
  if (request.master && request.context?.noTrigger) {
    return;
  }
  if (user.isNew() && !(await isUserWhitelisted(user))) {
    throw new Parse.Error(403, Strings.cloud.error.userNotWhitelisted);
  } else if (user.isNew() || user.dirty(ParseUser.COLUMNS.email)) {
    await sendVerificationEmail(user);
  }
});

Parse.Cloud.beforeSave<Parse.Object<NativeAttributes<"Image">>>(
  "Image",
  async (request) => {
    if (request.master && request.context?.noTrigger) {
      return;
    }
    await resizeImage(request.object);
    if (request.object.isNew()) {
      request.object.set("dateTaken", new Date());
    }
  }
);

Parse.Cloud.beforeSave<Parse.Object<NativeAttributes<"Album">>>(
  "Album",
  async (request) => {
    if (request.master && request.context?.noTrigger) {
      return;
    }
    await mergeAlbumChanges(request.object, request.context);
  }
);

Parse.Cloud.beforeDelete<Parse.Object<NativeAttributes<"Album">>>(
  "Album",
  async (request) => {
    await deleteRoles(request.object);
  }
);

Parse.Cloud.beforeDelete<Parse.Object<NativeAttributes<"Image">>>(
  "Image",
  async (request) => {
    await deleteImageFromAlbums(request.object);
  }
);

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
      request.user as Parse.User<NativeAttributes<"_User">>
    );
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
