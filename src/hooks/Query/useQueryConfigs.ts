import Parse from "parse";
import { QueryObserverOptions } from "@tanstack/react-query";
import { useNetworkDetectionContext, useUserContext } from "../../contexts";
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

export type QueryOptionsFunction<TData> = (
  options?: Partial<QueryObserverOptions<TData, Error>>
) => QueryObserverOptions<TData, Error>;

/**
 * Hook to provide configs for queries.
 * To be used with the useQuery hook.
 */
const useQueryConfigs = () => {
  const { getLoggedInUser, profilePicture } = useUserContext();
  const { online } = useNetworkDetectionContext();
  const { runFunctionInTryCatch } = useQueryConfigHelpers();

  const getAllAlbumsQueryKey = () => [QueryCacheGroups.GET_ALL_ALBUMS];
  const getAllAlbumsOptions: QueryOptionsFunction<ParseAlbum[]> = (
    options = {}
  ) => ({
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  const getAllAlbumsFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseAlbum[]> => {
    return await runFunctionInTryCatch<ParseAlbum[]>(
      async () => {
        const albums = await ParseAlbum.query(online).limit(1000).find();
        return albums.map((album) => new ParseAlbum(album));
      },
      { errorMessage: Strings.noAlbums(), ...options }
    );
  };

  const getAllImagesQueryKey = () => [QueryCacheGroups.GET_ALL_IMAGES];
  const getAllImagesOptions: QueryOptionsFunction<ParseImage[]> = (
    options = {}
  ) => ({
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  const getAllImagesFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query(online).limit(1000).find();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.noImages(), ...options }
    );
  };

  const getAlbumQueryKey = (albumId?: string) => [
    QueryCacheGroups.GET_ALBUM,
    albumId,
  ];
  const getAlbumOptions: QueryOptionsFunction<ParseAlbum> = (options = {}) => ({
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  const getAlbumFunction = async (
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
      { errorMessage: Strings.albumNotFound(), ...options }
    );
  };

  const getImagesByIdQueryKey = (imageIds: string[]) => [
    QueryCacheGroups.GET_IMAGES_BY_ID,
    imageIds,
  ];
  const getImagesByIdOptions: QueryOptionsFunction<ParseImage[]> = (
    options = {}
  ) => ({
    ...options,
  });
  const getImagesByIdFunction = async (
    imageIds: string[],
    options: FunctionOptions = {}
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query(online)
          .containedIn(ParseImage.COLUMNS.id, imageIds)
          .limit(1000)
          .find();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.getImagesError(), ...options }
    );
  };

  const getImageByIdQueryKey = (imageId: string) => [
    QueryCacheGroups.GET_IMAGE_BY_ID,
    imageId,
  ];
  const getImageByIdOptions: QueryOptionsFunction<ParseImage> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  const getImageByIdFunction = async (
    imageId: string,
    options: FunctionOptions = {}
  ): Promise<ParseImage> => {
    return await runFunctionInTryCatch<ParseImage>(
      async () => {
        if (profilePicture && imageId === profilePicture?.id) {
          return profilePicture;
        }
        const image = await ParseImage.query(online)
          .equalTo(ParseImage.COLUMNS.id, imageId)
          .first();
        if (!image) {
          throw new Error(Strings.imageNotFound(imageId));
        }
        return new ParseImage(image);
      },
      { errorMessage: Strings.imageNotFound(), ...options }
    );
  };

  const getImagesByOwnerQueryKey = (owner: ParseUser) => [
    QueryCacheGroups.GET_IMAGES_BY_OWNER,
    owner.id,
  ];
  const getImagesByOwnerOptions: QueryOptionsFunction<ParseImage[]> = (
    options = {}
  ) => ({
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
  const getImagesByOwnerFunction = async (
    owner: ParseUser,
    options: FunctionOptions = {}
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query(online)
          .equalTo(ParseImage.COLUMNS.owner, owner.toNativePointer())
          .limit(1000)
          .find();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.getImageError(), ...options }
    );
  };

  const getUserByIdQueryKey = (userId: string) => [
    QueryCacheGroups.GET_USER_BY_ID,
    userId,
  ];
  const getUserByIdOptions: QueryOptionsFunction<ParseUser> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  const getUserByIdFunction = async (
    userId: string,
    options: FunctionOptions = {}
  ): Promise<ParseUser> => {
    return await runFunctionInTryCatch<ParseUser>(
      async () => {
        if (userId === getLoggedInUser().id) {
          return getLoggedInUser();
        }
        const user = await ParseUser.query(online).get(userId);
        return new ParseUser(user);
      },
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getUsersByEmailQueryKey = (emails: string[]) => [
    QueryCacheGroups.GET_USERS_BY_EMAIL,
    emails,
  ];
  const getUsersByEmailOptions: QueryOptionsFunction<ParseUser[]> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  const getUsersByEmailFunction = async (
    emails: string[],
    options: FunctionOptions = {}
  ): Promise<ParseUser[]> => {
    return await runFunctionInTryCatch<ParseUser[]>(
      async () => {
        const users = await ParseUser.query(online)
          .containedIn(ParseUser.COLUMNS.email, emails)
          .limit(1000)
          .find();
        return users.map((user) => new ParseUser(user));
      },
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getUserByEmailQueryKey = (email: string) => [
    QueryCacheGroups.GET_USER_BY_EMAIL,
    email,
  ];
  const getUserByEmailOptions: QueryOptionsFunction<ParseUser> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  const getUserByEmailFunction = async (
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
          throw new Error(Strings.couldNotGetUserInfo());
        }
        return new ParseUser(user);
      },
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getRelatedUserEmailsQueryKey = () => [
    QueryCacheGroups.GET_RELATED_USER_EMAILS,
  ];
  const getRelatedUserEmailsOptions: QueryOptionsFunction<string[]> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    ...options,
  });
  const getRelatedUserEmailsFunction = async (
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
        const albums = await query.limit(1000).find();
        const relatedEmails = [];
        const gotUsers: { [key: string]: ParseUser } = {};
        for (const albumResponse of albums) {
          const album = new ParseAlbum(albumResponse);
          relatedEmails.push(...album.collaborators, ...album.viewers);
          if (!gotUsers[album.owner.id]) {
            gotUsers[album.owner.id] = await getUserByIdFunction(
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
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getDuplicatesQueryKey = () => [QueryCacheGroups.GET_DUPLICATES];
  const getDuplicatesOptions: QueryOptionsFunction<ParseDuplicate[]> = (
    options = {}
  ) => ({
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  const getDuplicatesFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseDuplicate[]> => {
    return await runFunctionInTryCatch<ParseDuplicate[]>(
      async () => {
        const duplicates = await ParseDuplicate.query(online)
          .equalTo(ParseDuplicate.COLUMNS.acknowledged, false)
          .ascending(ParseDuplicate.COLUMNS.createdAt)
          .find();
        return duplicates.map((duplicate) => new ParseDuplicate(duplicate));
      },
      { errorMessage: Strings.couldNotGetDuplicates(), ...options }
    );
  };

  const getAlbumChangeNotificationsQueryKey = () => [
    QueryCacheGroups.GET_ALBUM_CHANGE_NOTIFICATIONS,
  ];
  const getAlbumChangeNotificationsOptions: QueryOptionsFunction<
    ParseAlbumChangeNotification[]
  > = (options = {}) => ({
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  const getAlbumChangeNotificationsFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseAlbumChangeNotification[]> => {
    return await runFunctionInTryCatch<ParseAlbumChangeNotification[]>(
      async () => {
        const albumChangeNotifications =
          await ParseAlbumChangeNotification.query(online)
            .notEqualTo("user", getLoggedInUser().toNativePointer())
            .greaterThan(ParseAlbumChangeNotification.COLUMNS.count, 0)
            .ascending(ParseAlbumChangeNotification.COLUMNS.createdAt)
            .find();
        return albumChangeNotifications.map(
          (albumChangeNotification) =>
            new ParseAlbumChangeNotification(albumChangeNotification)
        );
      },
      { errorMessage: Strings.couldNotGetDuplicates(), ...options }
    );
  };

  return {
    getAlbumChangeNotificationsQueryKey,
    getAlbumChangeNotificationsOptions,
    getAlbumChangeNotificationsFunction,
    getDuplicatesQueryKey,
    getDuplicatesOptions,
    getDuplicatesFunction,
    getAllAlbumsFunction,
    getAllAlbumsQueryKey,
    getAllAlbumsOptions,
    getAllImagesFunction,
    getAllImagesQueryKey,
    getAllImagesOptions,
    getAlbumFunction,
    getAlbumOptions,
    getAlbumQueryKey,
    getImagesByIdFunction,
    getImagesByIdOptions,
    getImagesByIdQueryKey,
    getImageByIdOptions,
    getImageByIdFunction,
    getImageByIdQueryKey,
    getImagesByOwnerFunction,
    getImagesByOwnerOptions,
    getImagesByOwnerQueryKey,
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
