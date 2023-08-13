import Parse from "parse";
import { QueryObserverOptions } from "@tanstack/react-query";
import { Strings } from "../../resources";
import {
  ParseAlbum,
  ParseImage,
  ParseUser,
  ParseDuplicate,
  ParseAlbumChangeNotification,
} from "../../classes";
import useQueryConfigHelpers, {
  FunctionOptions,
} from "./useQueryConfigHelpers";
import QueryCacheGroups from "./QueryCacheGroups";
import { useUserContext } from "../../contexts/UserContext";
import { ImageVariant, GetImageReturn } from "../../types";
import { get, set, createStore, del } from "idb-keyval";
import b64 from "base64-js";
import { dedupe } from "../../utils";

const imageStore = createStore("images", "images");

export type QueryOptionsFunction<TData> = (
  options?: Partial<QueryObserverOptions<TData, Error>>
) => QueryObserverOptions<TData, Error>;

/**
 * Hook to provide configs for queries.
 * To be used with the useQuery hook.
 */
const useQueryConfigs = () => {
  const { getLoggedInUser, profilePicture } = useUserContext();
  const { runFunctionInTryCatch } = useQueryConfigHelpers();

  /** ["GET_ALBUM", albumId] */
  const getAlbumQueryKey = (albumId?: string) => [
    QueryCacheGroups.GET_ALBUM,
    albumId,
  ];
  /** Defaults to default + refetch interval: 5 minutes */
  const getAlbumOptions: QueryOptionsFunction<ParseAlbum> = (options = {}) => ({
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  /** Function to get album by id */
  const getAlbumFunction = async (
    online: boolean,
    albumId?: string,
    options: FunctionOptions = {}
  ): Promise<ParseAlbum> => {
    if (!albumId) {
      throw new Error("albumId must be defined!");
    }
    return await runFunctionInTryCatch<ParseAlbum>(
      async () => {
        const album = await ParseAlbum.query(online).get(albumId);
        return new ParseAlbum(album);
      },
      { errorMessage: Strings.error.albumNotFound(), ...options }
    );
  };

  /** ["GET_IMAGES_BY_ID", imageIds] */
  const getImagesByIdQueryKey = (imageIds: string[]) => [
    QueryCacheGroups.GET_IMAGES_BY_ID,
    imageIds,
  ];
  /** Defaults to default */
  const getImagesByIdOptions: QueryOptionsFunction<ParseImage[]> = (
    options = {}
  ) => ({
    ...options,
  });
  /** Function to get images by id, unsorted */
  const getImagesByIdFunction = async (
    online: boolean,
    imageIds: string[],
    options: FunctionOptions = {}
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        return await ParseImage.query(online)
          .containedIn(ParseImage.COLUMNS.objectId, imageIds)
          .findAll();
      },
      { errorMessage: Strings.error.gettingImages, ...options }
    );
  };

  /** ["GET_IMAGE_BY_ID", imageId] */
  const getImageByIdQueryKey = (imageId: string) => [
    QueryCacheGroups.GET_IMAGE_BY_ID,
    imageId,
  ];
  /** Defaults to default + refetch on window focus: false */
  const getImageByIdOptions: QueryOptionsFunction<ParseImage> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  /** Function to get image by id */
  const getImageByIdFunction = async (
    online: boolean,
    imageId: string,
    options: FunctionOptions = {}
  ): Promise<ParseImage> => {
    return await runFunctionInTryCatch<ParseImage>(
      async () => {
        if (profilePicture && imageId === profilePicture?.objectId) {
          return profilePicture;
        }
        const image = await ParseImage.query(online)
          .equalTo(ParseImage.COLUMNS.objectId, imageId)
          .first();
        if (!image) {
          throw new Error(Strings.error.imageNotFound(imageId));
        }
        return image;
      },
      { errorMessage: Strings.error.imageNotFound(), ...options }
    );
  };

  /** ["GET_USER_BY_ID", userId] */
  const getUserByIdQueryKey = (userId: string) => [
    QueryCacheGroups.GET_USER_BY_ID,
    userId,
  ];
  /** Defaults to default + refetch on window focus: false */
  const getUserByIdOptions: QueryOptionsFunction<ParseUser> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  /** Function to get user by id */
  const getUserByIdFunction = async (
    online: boolean,
    userId: string,
    options: FunctionOptions = {}
  ): Promise<ParseUser> => {
    return await runFunctionInTryCatch<ParseUser>(
      async () => {
        if (userId === getLoggedInUser().objectId) {
          return getLoggedInUser();
        }
        return await ParseUser.query(online).get(userId);
      },
      { errorMessage: Strings.error.gettingUserInfo, ...options }
    );
  };

  /** ["GET_USERS_BY_EMAIL", emails] */
  const getUsersByEmailQueryKey = (emails: string[]) => [
    QueryCacheGroups.GET_USERS_BY_EMAIL,
    emails,
  ];
  /** Defaults to default */
  const getUsersByEmailOptions: QueryOptionsFunction<ParseUser[]> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  /** Function to get users by email, unsorted */
  const getUsersByEmailFunction = async (
    online: boolean,
    emails: string[],
    options: FunctionOptions = {}
  ): Promise<ParseUser[]> => {
    return await runFunctionInTryCatch<ParseUser[]>(
      async () => {
        const users = await ParseUser.query(online)
          .containedIn(ParseUser.COLUMNS.email, emails)
          .findAll();
        return users;
      },
      { errorMessage: Strings.error.gettingUserInfo, ...options }
    );
  };

  /** ["GET_USER_BY_EMAIL", email] */
  const getUserByEmailQueryKey = (email: string) => [
    QueryCacheGroups.GET_USER_BY_EMAIL,
    email,
  ];
  /** Defaults to default + refetch on window focus: false */
  const getUserByEmailOptions: QueryOptionsFunction<ParseUser> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  /** Function to get user by email */
  const getUserByEmailFunction = async (
    online: boolean,
    email: string,
    options: FunctionOptions = {}
  ): Promise<ParseUser> => {
    return await runFunctionInTryCatch<ParseUser>(
      async () => {
        if (email === getLoggedInUser().email) {
          return getLoggedInUser();
        }
        const user = await ParseUser.query(online)
          .equalTo(ParseUser.COLUMNS.email, email)
          .first();
        if (!user) {
          throw new Error(Strings.error.gettingUserInfo);
        }
        return user;
      },
      { errorMessage: Strings.error.gettingUserInfo, ...options }
    );
  };

  /** ["GET_RELATED_USER_EMAILS"] */
  const getRelatedUserEmailsQueryKey = () => [
    QueryCacheGroups.GET_RELATED_USER_EMAILS,
  ];
  /** Defaults to default + refetch on window focus: false */
  const getRelatedUserEmailsOptions: QueryOptionsFunction<string[]> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  /** Function to get related user emails, unsorted */
  const getRelatedUserEmailsFunction = async (
    online: boolean,
    options: FunctionOptions = {}
  ): Promise<string[]> => {
    return await runFunctionInTryCatch<string[]>(
      async () => {
        const query = Parse.Query.or(
          ParseAlbum.query(online).equalTo(
            ParseAlbum.COLUMNS.owner,
            getLoggedInUser().toNativePointer()
          ),
          ParseAlbum.query(online).containsAll(
            ParseAlbum.COLUMNS.collaborators,
            [getLoggedInUser().email]
          ),
          ParseAlbum.query(online).containsAll(ParseAlbum.COLUMNS.viewers, [
            getLoggedInUser().email,
          ])
        );
        if (!online) {
          query.fromLocalDatastore();
        }
        const albums = await query.findAll();
        const relatedEmails = [];
        const gotUsers: { [key: string]: ParseUser } = {};
        for (const albumResponse of albums) {
          const album = new ParseAlbum(albumResponse);
          relatedEmails.push(...album.collaborators, ...album.viewers);
          if (!gotUsers[album.owner.id]) {
            gotUsers[album.owner.id] = await getUserByIdFunction(
              online,
              album.owner.id,
              options
            );
          }
        }
        relatedEmails.push(
          ...Object.values(gotUsers).map((user) => user.email)
        );
        return Array.from(
          new Set(
            relatedEmails.filter((email) => email !== getLoggedInUser().email)
          )
        );
      },
      { errorMessage: Strings.error.gettingUserInfo, ...options }
    );
  };

  /** ["GET_DUPLICATES"] */
  const getDuplicatesQueryKey = () => [QueryCacheGroups.GET_DUPLICATES];
  /** Defaults to default + refetch on window focus: false + refetch interval: 5 minutes + network mode: online */
  const getDuplicatesOptions: QueryOptionsFunction<ParseDuplicate[]> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
    networkMode: "online",
    ...options,
  });
  /** Function to get duplicates, unsorted */
  const getDuplicatesFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseDuplicate[]> => {
    return await runFunctionInTryCatch<ParseDuplicate[]>(
      async () => {
        const duplicates = await Parse.Query.or(
          ParseDuplicate.query().equalTo(
            ParseDuplicate.COLUMNS.acknowledged,
            false
          ),
          ParseDuplicate.query().doesNotExist(
            ParseDuplicate.COLUMNS.acknowledged
          )
        ).findAll();
        return duplicates.map((duplicate) => new ParseDuplicate(duplicate));
      },
      { errorMessage: Strings.error.gettingDuplicates, ...options }
    );
  };

  /** ["GET_ALBUM_CHANGE_NOTIFICATIONS"] */
  const getAlbumChangeNotificationsQueryKey = () => [
    QueryCacheGroups.GET_ALBUM_CHANGE_NOTIFICATIONS,
  ];
  /** Defaults to default + refetch on window focus: false + refetch interval: 5 minutes + network mode: online */
  const getAlbumChangeNotificationsOptions: QueryOptionsFunction<
    ParseAlbumChangeNotification[]
  > = (options = {}) => ({
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
    networkMode: "online",
    ...options,
  });
  /** Function to get album change notifications, unsorted */
  const getAlbumChangeNotificationsFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseAlbumChangeNotification[]> => {
    return await runFunctionInTryCatch<ParseAlbumChangeNotification[]>(
      async () => {
        return await ParseAlbumChangeNotification.query()
          .notEqualTo("user", getLoggedInUser().toNativePointer())
          .greaterThan(ParseAlbumChangeNotification.COLUMNS.count, 0)
          .ascending(ParseAlbumChangeNotification.COLUMNS.createdAt)
          .find();
      },
      { errorMessage: Strings.error.gettingDuplicates, ...options }
    );
  };

  /** ["GET_IMAGE_URL", imageId, variant] */
  const getImageUrlQueryKey = (imageId: string, variant: ImageVariant) => [
    QueryCacheGroups.GET_IMAGE_URL,
    imageId,
    variant,
  ];
  /** Defaults to default + refetch on window focus: false + enabled: false */
  const getImageUrlOptions: QueryOptionsFunction<string> = (options = {}) => ({
    refetchOnWindowFocus: false,
    enabled: false,
    ...options,
  });
  /** Function to get image url */
  const getImageUrlFunction = async (
    imageId: string,
    variant: ImageVariant,
    options: FunctionOptions = {}
  ): Promise<string> => {
    return await runFunctionInTryCatch<string>(
      async () => {
        const cacheKey = JSON.stringify(getImageUrlQueryKey(imageId, variant));
        let blob = await get<Blob>(cacheKey, imageStore);
        if (typeof blob === "string") {
          // Legacy
          await del(cacheKey, imageStore);
          blob = undefined;
        }
        if (!blob) {
          const result = (await Parse.Cloud.run("getImage", {
            imageId,
            variant,
          })) as GetImageReturn;
          const arrayBuffer = b64.toByteArray(result.base64).buffer;
          blob = new Blob([arrayBuffer], { type: result.mimeType });
          await set(cacheKey, blob, imageStore);
        }
        return URL.createObjectURL(blob);
      },
      { errorMessage: Strings.error.gettingImageUrl, ...options }
    );
  };

  /** ["GET_ALL_TAGS"] */
  const getAllTagsQueryKey = () => [QueryCacheGroups.GET_ALL_TAGS];
  /** Defaults to default + placeholder=[] */
  const getAllTagsOptions: QueryOptionsFunction<string[]> = (options = {}) => ({
    placeholderData: [],
    ...options,
  });
  /** Function to get all tags */
  const getAllTagsFunction = async (
    options: FunctionOptions = {}
  ): Promise<string[]> => {
    return await runFunctionInTryCatch<string[]>(
      async () => {
        const images = await ParseImage.query()
          .select(ParseImage.COLUMNS.tags)
          .exists(ParseImage.COLUMNS.tags)
          .findAll();
        return dedupe(images.flatMap((tag) => tag.tags as string[]));
      },
      { errorMessage: Strings.error.gettingTags, ...options }
    );
  };

  return {
    getAllTagsQueryKey,
    getAllTagsOptions,
    getAllTagsFunction,
    getImageUrlQueryKey,
    getImageUrlOptions,
    getImageUrlFunction,
    getAlbumChangeNotificationsQueryKey,
    getAlbumChangeNotificationsOptions,
    getAlbumChangeNotificationsFunction,
    getDuplicatesQueryKey,
    getDuplicatesOptions,
    getDuplicatesFunction,
    getAlbumFunction,
    getAlbumOptions,
    getAlbumQueryKey,
    getImagesByIdFunction,
    getImagesByIdOptions,
    getImagesByIdQueryKey,
    getImageByIdOptions,
    getImageByIdFunction,
    getImageByIdQueryKey,
    getUserByIdQueryKey,
    getUserByIdOptions,
    getUserByIdFunction,
    getUsersByEmailFunction,
    getUsersByEmailOptions,
    getUsersByEmailQueryKey,
    getRelatedUserEmailsQueryKey,
    getRelatedUserEmailsFunction,
    getUserByEmailFunction,
    getUserByEmailOptions,
    getUserByEmailQueryKey,
    getRelatedUserEmailsOptions,
  };
};

export default useQueryConfigs;
