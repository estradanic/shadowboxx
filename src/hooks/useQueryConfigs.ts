import Parse from "parse";
import { useSnackbar } from "../components";
import { useGlobalLoadingContext, useUserContext } from "../contexts";
import { Strings } from "../resources";
import { Interdependent, ParseAlbum, ParseImage, ParseUser } from "../types";
import { QueryObserverOptions } from "@tanstack/react-query";

export type FunctionOptions = Interdependent<
  {
    successMessage?: string;
    errorMessage?: string;
    showNativeError?: boolean;
    showErrorsInSnackbar?: boolean;
    useLoader?: boolean;
    startLoader?: () => void;
    stopLoader?: () => void;
  },
  "startLoader" | "stopLoader"
>;

export type QueryOptionsFunction<TData> = (
  options?: Partial<QueryObserverOptions<TData, Error>>
) => QueryObserverOptions<TData, Error>;

type StartLoaderOptions = Pick<FunctionOptions, "startLoader" | "useLoader">;

type StopLoaderOptions = Pick<FunctionOptions, "stopLoader" | "useLoader">;

type HandleErrorOptions = Pick<
  FunctionOptions,
  "errorMessage" | "showNativeError" | "showErrorsInSnackbar"
> & { error: any };

const useQueryConfigs = () => {
  const {
    enqueueErrorSnackbar,
    enqueueSuccessSnackbar,
    enqueueWarningSnackbar,
  } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingContext();
  const { getLoggedInUser, profilePicture, updateLoggedInUser } =
    useUserContext();

  // #region Helper methods

  const startLoader = ({
    startLoader: piStartLoader,
    useLoader,
  }: StartLoaderOptions) => {
    if (useLoader && piStartLoader) {
      piStartLoader();
    } else if (useLoader) {
      startGlobalLoader();
    }
  };

  const stopLoader = ({
    stopLoader: piStopLoader,
    useLoader,
  }: StopLoaderOptions) => {
    if (useLoader && piStopLoader) {
      piStopLoader();
    } else if (useLoader) {
      stopGlobalLoader();
    }
  };

  const handleError = ({
    errorMessage,
    showNativeError,
    error,
    showErrorsInSnackbar,
  }: HandleErrorOptions): Error => {
    console.error(error);
    if (error?.message === "Invalid session token") {
      enqueueWarningSnackbar(Strings.sessionExpired());
      getLoggedInUser().logout(updateLoggedInUser);
    } else if (errorMessage && !showNativeError && showErrorsInSnackbar) {
      enqueueErrorSnackbar(errorMessage);
      throw new Error(errorMessage);
    } else if (showNativeError && showErrorsInSnackbar) {
      enqueueErrorSnackbar(error?.message);
    }
    throw new Error(error?.message ?? errorMessage);
  };

  const handleSuccess = (successMessage?: string) => {
    if (successMessage) {
      enqueueSuccessSnackbar(successMessage);
    }
  };

  const runFunctionInTryCatch = async <T>(
    requestFunction: () => Promise<T>,
    {
      successMessage,
      errorMessage,
      useLoader = false,
      showNativeError = false,
      showErrorsInSnackbar = false,
      startLoader: piStartLoader,
      stopLoader: piStopLoader,
    }: FunctionOptions
  ): Promise<T> => {
    let returnValue;
    startLoader({
      startLoader: piStartLoader,
      useLoader,
    });
    try {
      returnValue = await requestFunction();
      handleSuccess(successMessage);
    } catch (error: any) {
      throw handleError({
        error,
        errorMessage,
        showNativeError,
        showErrorsInSnackbar,
      });
    } finally {
      stopLoader({
        stopLoader: piStopLoader,
        useLoader,
      });
    }
    return returnValue;
  };

  // #endregion

  // #region Return values

  const getAllAlbumsQueryKey = () => ["GET_ALL_ALBUMS"];
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
        const albums = await ParseAlbum.query().findAll();
        return albums.map((album) => new ParseAlbum(album));
      },
      { errorMessage: Strings.noAlbums(), ...options }
    );
  };

  const getAllImagesQueryKey = () => ["GET_ALL_IMAGES"];
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
        const images = await ParseImage.query().findAll();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.noImages(), ...options }
    );
  };

  const getAlbumQueryKey = (albumId?: string) => ["GET_ALBUM", albumId];
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
        const album = await ParseAlbum.query().get(albumId);
        return new ParseAlbum(album);
      },
      { errorMessage: Strings.albumNotFound(), ...options }
    );
  };

  const getImagesByIdQueryKey = (imageIds: string[]) => [
    "GET_IMAGES_BY_ID",
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
        const images = await ParseImage.query()
          .containedIn(ParseImage.COLUMNS.id, imageIds)
          .findAll();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.getImagesError(), ...options }
    );
  };

  const getImageByIdQueryKey = (imageId: string) => [
    "GET_IMAGE_BY_ID",
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
        const image = await ParseImage.query()
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
    "GET_IMAGE_BY_OWNER",
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
        const images = await ParseImage.query()
          .equalTo(ParseImage.COLUMNS.owner, owner.toNativePointer())
          .findAll();
        return images.map((image) => new ParseImage(image));
      },
      { errorMessage: Strings.getImageError(), ...options }
    );
  };

  const getUserByIdQueryKey = (userId: string) => ["GET_USER_BY_ID", userId];
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
        const user = await ParseUser.query().get(userId);
        return new ParseUser(user);
      },
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getUsersByEmailQueryKey = (emails: string[]) => [
    "GET_USERS_BY_EMAIL",
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
        const users = await ParseUser.query()
          .containedIn(ParseUser.COLUMNS.email, emails)
          .findAll();
        return users.map((user) => new ParseUser(user));
      },
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getUserByEmailQueryKey = (email: string) => [
    "GET_USER_BY_EMAIL",
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
        const user = await ParseUser.query()
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

  const getRelatedUserEmailsQueryKey = () => ["GET_RELATED_USER_EMAILS"];
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
        const albums = await Parse.Query.or(
          ParseAlbum.query().equalTo(
            ParseAlbum.COLUMNS.owner,
            getLoggedInUser().toNativePointer()
          ),
          ParseAlbum.query().containsAll(ParseAlbum.COLUMNS.collaborators, [
            getLoggedInUser().email,
          ]),
          ParseAlbum.query().containsAll(ParseAlbum.COLUMNS.viewers, [
            getLoggedInUser().email,
          ])
        ).findAll();
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
