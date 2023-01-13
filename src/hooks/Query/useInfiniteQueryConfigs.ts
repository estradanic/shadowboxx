import { useUserContext } from "../../contexts";
import { Strings } from "../../resources";
import { ParseAlbum, ParseImage, ParseUser } from "../../classes";
import { InfiniteQueryObserverOptions } from "@tanstack/react-query";
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
  const { runFunctionInTryCatch } = useQueryConfigHelpers();

  /** ["GET_ALL_ALBUMS_INFINITE"] */
  const getAllAlbumsInfiniteQueryKey = () => [
    QueryCacheGroups.GET_ALL_ALBUMS_INFINITE,
  ];
  /** Defaults to default + refetch interval: 5 minutes */
  const getAllAlbumsInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseAlbum[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  /** Infinite function to get all albums, sorted by favoriteAlbums, then desc updatedAt */
  const getAllAlbumsInfiniteFunction = async (
    online: boolean,
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseAlbum[]> => {
    return await runFunctionInTryCatch<ParseAlbum[]>(
      async () => {
        const favoriteAlbums =
          options.page === 0
            ? await ParseAlbum.query(online)
                .containedIn(
                  ParseAlbum.COLUMNS.id,
                  getLoggedInUser().favoriteAlbums
                )
                .descending(ParseAlbum.COLUMNS.updatedAt)
                .limit(1000)
                .find()
            : [];
        const nonFavoriteAlbums = await ParseAlbum.query(online)
          .notContainedIn(
            ParseAlbum.COLUMNS.id,
            getLoggedInUser().favoriteAlbums
          )
          .descending(ParseAlbum.COLUMNS.updatedAt)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize)
          .find();

        return [...favoriteAlbums, ...nonFavoriteAlbums].map(
          (album) => new ParseAlbum(album)
        );
      },
      { errorMessage: Strings.noAlbums(), ...options }
    );
  };

  /** ["GET_ALL_IMAGES_INFINITE"] */
  const getAllImagesInfiniteQueryKey = () => [
    QueryCacheGroups.GET_ALL_IMAGES_INFINITE,
  ];
  /** Defaults to default */
  const getAllImagesInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseImage[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    ...options,
  });
  /** Infinite function to get all images, sorted desc by createdAt */
  const getAllImagesInfiniteFunction = async (
    online: boolean,
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

  /** ["GET_IMAGES_BY_ID_INFINITE", imageIds] */
  const getImagesByIdInfiniteQueryKey = (imageIds: string[]) => [
    QueryCacheGroups.GET_IMAGES_BY_ID_INFINITE,
    imageIds,
  ];
  /** Defaults to default */
  const getImagesByIdInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseImage[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    ...options,
  });
  /** Infinite function to get images by id, sorted desc by createdAt */
  const getImagesByIdInfiniteFunction = async (
    online: boolean,
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

  /** ["GET_IMAGES_BY_OWNER_INFINITE", owner.id] */
  const getImagesByOwnerInfiniteQueryKey = (owner: ParseUser) => [
    QueryCacheGroups.GET_IMAGES_BY_OWNER_INFINITE,
    owner.id,
  ];
  /** Defaults to default + refetch on window focus: false */
  const getImagesByOwnerInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseImage[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchOnWindowFocus: false,
    ...options,
  });
  /** Infinite function to get images by owner, sorted desc by createdAt */
  const getImagesByOwnerInfiniteFunction = async (
    online: boolean,
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
  };
};

export default useInfiniteQueryConfigs;
