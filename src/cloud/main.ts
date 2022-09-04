import { Image, Album, User, AlbumSaveContext } from "../types";
import {
  deleteRoles,
  mergeAlbumChanges,
  resizeImage,
  setAlbumPermissions,
  setUserPermissions,
} from "./triggers";

Parse.Cloud.afterSave("Album", async (request) => {
  await setAlbumPermissions(request.object as Parse.Object<Album>);
});

Parse.Cloud.afterSave(Parse.User, async (request) => {
  await setUserPermissions(request.object as Parse.User<User>);
});

Parse.Cloud.beforeSave("Image", async (request) => {
  await resizeImage(request.object as Parse.Object<Image>);
});

Parse.Cloud.beforeSave("Album", async (request) => {
  await mergeAlbumChanges(
    request.object as Parse.Object<Album>,
    request.original as Parse.Object<Album>,
    request.context as AlbumSaveContext
  );
});

Parse.Cloud.beforeDelete("Album", async (request) => {
  await deleteRoles(request.object as Parse.Object<Album>);
});
