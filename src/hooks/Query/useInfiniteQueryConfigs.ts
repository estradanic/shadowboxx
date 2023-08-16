import Parse from "parse";
import { Strings } from "../../resources";
import { ParseAlbum, ParseImage, ParseUser } from "../../classes";
import { InfiniteQueryObserverOptions } from "@tanstack/react-query";
import useQueryConfigHelpers, {
  FunctionOptions,
} from "./useQueryConfigHelpers";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import QueryCacheGroups from "./QueryCacheGroups";
import { useUserContext } from "../../contexts/UserContext";
import { SortDirection } from "../../types";

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
  const { runFunctionInTryCatch, applyTagSearch, applyCaptionSearch } =
    useQueryConfigHelpers();

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
                  ParseAlbum.COLUMNS.objectId,
                  getLoggedInUser().favoriteAlbums
                )
                .descending(ParseAlbum.COLUMNS.updatedAt)
                .limit(1000)
                .find()
            : [];
        const nonFavoriteAlbums = await ParseAlbum.query(online)
          .notContainedIn(
            ParseAlbum.COLUMNS.objectId,
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
      { errorMessage: Strings.message.noAlbums, ...options }
    );
  };

  interface GetAllImagesInfiniteFilters {
    sortDirection: SortDirection;
    tagSearch?: string[];
  }
  /** ["GET_ALL_IMAGES_INFINITE"] */
  const getAllImagesInfiniteQueryKey = (
    filters: GetAllImagesInfiniteFilters = { sortDirection: "descending" }
  ) => [QueryCacheGroups.GET_ALL_IMAGES_INFINITE, filters];
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
    filters: GetAllImagesInfiniteFilters = { sortDirection: "descending" },
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const query = ParseImage.query(online)
          [filters.sortDirection](ParseImage.COLUMNS.dateTaken)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize);
        applyTagSearch(query, filters.tagSearch);
        return await query.find();
      },
      { errorMessage: Strings.message.noImages, ...options }
    );
  };

  type GetImagesByIdInfiniteFilters = GetAllImagesInfiniteFilters &
    (
      | {
          captionSearch?: never;
          captions?: never;
        }
      | {
          captionSearch: string;
          captions: Record<string, string>;
        }
    );
  /** ["GET_IMAGES_BY_ID_INFINITE", imageIds] */
  const getImagesByIdInfiniteQueryKey = (
    imageIds: string[],
    filters: GetImagesByIdInfiniteFilters = { sortDirection: "descending" }
  ) => [QueryCacheGroups.GET_IMAGES_BY_ID_INFINITE, imageIds, filters];
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
    filters: GetImagesByIdInfiniteFilters = { sortDirection: "descending" },
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const query = ParseImage.query(online)
          .containedIn(ParseImage.COLUMNS.objectId, imageIds)
          [filters.sortDirection](ParseImage.COLUMNS.dateTaken)
          .limit(options.pageSize)
          .skip(options.page * options.pageSize);
        applyCaptionSearch(query, filters.captionSearch, filters.captions);
        applyTagSearch(query, filters.tagSearch);
        return await query.find();
      },
      { errorMessage: Strings.error.gettingImages, ...options }
    );
  };

  type GetImagesByOwnerFilters = GetAllImagesInfiniteFilters;
  /** ["GET_IMAGES_BY_OWNER_INFINITE", owner.id] */
  const getImagesByOwnerInfiniteQueryKey = (
    owner: ParseUser,
    filters: GetImagesByOwnerFilters = { sortDirection: "descending" }
  ) => [QueryCacheGroups.GET_IMAGES_BY_OWNER_INFINITE, owner.objectId, filters];
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
    filters: GetImagesByOwnerFilters = { sortDirection: "descending" },
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        let query = ParseImage.query(online)
          [filters.sortDirection](ParseImage.COLUMNS.dateTaken)
          .equalTo(ParseImage.COLUMNS.owner, owner.toNativePointer())
          .limit(options.pageSize)
          .skip(options.page * options.pageSize);
        applyTagSearch(query, filters.tagSearch);
        return await query.find();
      },
      { errorMessage: Strings.error.gettingImage, ...options }
    );
  };

  /** ["GET_ALL_MODIFYABLE_ALBUMS_INFINITE"] */
  const getAllModifyableAlbumsInfiniteQueryKey = () => [
    QueryCacheGroups.GET_ALL_MODIFYABLE_ALBUMS_INFINITE,
  ];
  /** Defaults to default + refetch interval: 5 minutes */
  const getAllModifyableAlbumsInfiniteOptions: InfiniteQueryOptionsFunction<
    ParseAlbum[]
  > = (options = {}) => ({
    ...DEFAULT_OPTIONS,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
  /** Infinite function to get all albums wher the current user is a collaborator or owner
   *  Sorted by favoriteAlbums, then desc updatedAt
   */
  const getAllModifyableAlbumsInfiniteFunction = async (
    online: boolean,
    options: InfiniteFunctionOptions = DEFAULT_FUNCTION_OPTIONS
  ): Promise<ParseAlbum[]> => {
    return await runFunctionInTryCatch<ParseAlbum[]>(
      async () => {
        const favoriteAlbums =
          options.page === 0
            ? await Parse.Query.or(
                ParseAlbum.query(online).contains(
                  ParseAlbum.COLUMNS.collaborators,
                  getLoggedInUser().email
                ),
                ParseAlbum.query(online).equalTo(
                  ParseAlbum.COLUMNS.owner,
                  getLoggedInUser().toNativePointer()
                )
              )
                .containedIn(
                  ParseAlbum.COLUMNS.objectId,
                  getLoggedInUser().favoriteAlbums
                )
                .descending(ParseAlbum.COLUMNS.updatedAt)
                .limit(1000)
                .find()
            : [];
        const nonFavoriteAlbums = await Parse.Query.or(
          ParseAlbum.query(online).contains(
            ParseAlbum.COLUMNS.collaborators,
            getLoggedInUser().email
          ),
          ParseAlbum.query(online).equalTo(
            ParseAlbum.COLUMNS.owner,
            getLoggedInUser().toNativePointer()
          )
        )
          .notContainedIn(
            ParseAlbum.COLUMNS.objectId,
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
      { errorMessage: Strings.message.noAlbums, ...options }
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
    getAllModifyableAlbumsInfiniteFunction,
    getAllModifyableAlbumsInfiniteQueryKey,
    getAllModifyableAlbumsInfiniteOptions,
  };
};

export default useInfiniteQueryConfigs;
