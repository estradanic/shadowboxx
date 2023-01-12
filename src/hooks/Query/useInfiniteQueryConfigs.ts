import Parse from "parse";
import { useNetworkDetectionContext, useUserContext } from "../../contexts";
import { Strings } from "../../resources";
import { ParseAlbum, ParseImage, ParseUser } from "../../classes";
import { InfiniteQueryObserverOptions } from "@tanstack/react-query";
import useQueryConfigs from "./useQueryConfigs";
import useQueryConfigHelpers, {
  FunctionOptions,
} from "./useQueryConfigHelpers";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import QueryCacheGroups from "./QueryCacheGroups";

export type InfiniteFunctionOptions = FunctionOptions & {
  /** Page index */
  page: number;
  /** Number of items to fetch in this page */
  pageSize: number;
};

export type InfiniteQueryOptionsFunction<TData> = (
  options?: Partial<InfiniteQueryObserverOptions<TData, Error>>
) => InfiniteQueryObserverOptions<TData, Error>;

const DEFAULT_OPTIONS: Pick<
  InfiniteQueryObserverOptions<any[], Error>,
  "getNextPageParam"
> = {
  getNextPageParam: (lastPage, allPages) => {
    if (lastPage.length > 0) {
      return allPages.length;
    }
    return undefined;
  },
};

const DEFAULT_FUNCTION_OPTIONS: InfiniteFunctionOptions = {
  pageSize: DEFAULT_PAGE_SIZE,
  page: 0,
};

/**
 * Hook to provide configurations for queries.
 * To be used with the useInfiniteQuery hook
 */
const useInfiniteQueryConfigs = () => {
  const { getLoggedInUser } = useUserContext();
  const { online } = useNetworkDetectionContext();
  const { runFunctionInTryCatch } = useQueryConfigHelpers();
  const { getUserByIdFunction } = useQueryConfigs();

  const getAllAlbumsInfiniteQueryKey = () => [
    QueryCacheGroups.GET_ALL_ALBUMS_INFINITE,
  ];
  const getAllAlbumsInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseAlbum[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  const getAllAlbumsInfiniteFunction = async (
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseAlbum[]> => {
    return await runFunctionInTryCatch<ParseAlbum[]>(
      async () => {
        const albums = await ParseAlbum.query(online)
          .descending(ParseAlbum.COLUMNS.createdAt)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();
        return albums.map((album) => new ParseAlbum(album));
      },
      { errorMessage: Strings.noAlbums(), ...options }
    );
  };

  const getAllImagesInfiniteQueryKey = () => [
    QueryCacheGroups.GET_ALL_IMAGES_INFINITE,
  ];
  const getAllImagesInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseImage[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    ...options,
  });
  const getAllImagesInfiniteFunction = async (
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query(online)
          .descending(ParseImage.COLUMNS.createdAt)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.noImages(), ...options }
    );
  };

  const getImagesByIdInfiniteQueryKey = (imageIds: string[]) => [
    QueryCacheGroups.GET_IMAGES_BY_ID_INFINITE,
    imageIds,
  ];
  const getImagesByIdInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseImage[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    ...options,
  });
  const getImagesByIdInfiniteFunction = async (
    imageIds: string[],
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query(online)
          .containedIn(ParseImage.COLUMNS.id, imageIds)
          .descending(ParseImage.COLUMNS.createdAt)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.getImagesError(), ...options }
    );
  };

  const getImagesByOwnerInfiniteQueryKey = (owner: ParseUser) => [
    QueryCacheGroups.GET_IMAGE_BY_OWNER_INFINITE,
    owner.id,
  ];
  const getImagesByOwnerInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseImage[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchOnWindowFocus: false,
    ...options,
  });
  const getImagesByOwnerInfiniteFunction = async (
    owner: ParseUser,
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query(online)
          .equalTo(ParseImage.COLUMNS.owner, owner.toNativePointer())
          .descending(ParseImage.COLUMNS.createdAt)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.getImageError(), ...options }
    );
  };

  const getUsersByEmailInfiniteQueryKey = (emails: string[]) => [
    QueryCacheGroups.GET_USERS_BY_EMAIL_INFINITE,
    emails,
  ];
  const getUsersByEmailInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseUser[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchOnWindowFocus: false,
    ...options,
  });
  const getUsersByEmailInfiniteFunction = async (
    emails: string[],
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseUser[]> => {
    return await runFunctionInTryCatch<ParseUser[]>(
      async () => {
        const users = await ParseUser.query(online)
          .containedIn(ParseUser.COLUMNS.email, emails)
          .ascending(ParseUser.COLUMNS.firstName)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();
        return users.map((user) => new ParseUser(user));
      },
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getRelatedUserEmailsInfiniteQueryKey = () => [
    QueryCacheGroups.GET_RELATED_USER_EMAILS_INFINITE,
  ];
  const getRelatedUserEmailsInfiniteOptions: InfiniteQueryOptionsFunction<
    string[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchOnWindowFocus: false,
    ...options,
  });
  const getRelatedUserEmailsInfiniteFunction = async (
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
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
        const albums = await query
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();
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

  // #endregion

  return {
    getAllAlbumsInfiniteFunction,
    getAllAlbumsInfiniteQueryKey,
    getAllAlbumsInfiniteOptions,
    getAllImagesInfiniteOptions,
    getAllImagesInfiniteQueryKey,
    getImagesByIdInfiniteOptions,
    getImagesByOwnerInfiniteFunction,
    getImagesByOwnerInfiniteQueryKey,
    getImagesByIdInfiniteFunction,
    getImagesByOwnerInfiniteOptions,
    getImagesByIdInfiniteQueryKey,
    getAllImagesInfiniteFunction,
    getUsersByEmailInfiniteFunction,
    getUsersByEmailInfiniteOptions,
    getUsersByEmailInfiniteQueryKey,
    getRelatedUserEmailsInfiniteQueryKey,
    getRelatedUserEmailsInfiniteFunction,
    getRelatedUserEmailsInfiniteOptions,
  };
};

export default useInfiniteQueryConfigs;
