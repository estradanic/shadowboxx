import { useRef } from "react";
import Parse from "parse";
import { useSnackbar } from "../components";
import { useGlobalLoadingContext, useUserContext } from "../contexts";
import { Strings } from "../resources";
import { Interdependent, ParseAlbum, ParseImage, ParseUser } from "../types";

export type FunctionOptions = Interdependent<
  {
    successMessage?: string;
    errorMessage?: string;
    showNativeError?: boolean;
    showErrorsInSnackbar?: boolean;
    useLoader?: boolean;
    startLoader?: () => void;
    stopLoader?: () => void;
    useGlobalLoaderOnInitialRequest?: boolean;
    noGlobalLoadingAfterInitialRequest?: boolean;
  },
  "startLoader" | "stopLoader"
>;

type RequestTracker = { [key: string]: boolean };

type StartLoaderOptions = Pick<
  FunctionOptions,
  | "startLoader"
  | "useLoader"
  | "useGlobalLoaderOnInitialRequest"
  | "noGlobalLoadingAfterInitialRequest"
> & {
  requestKey: string;
};

type StopLoaderOptions = Pick<
  FunctionOptions,
  | "stopLoader"
  | "useLoader"
  | "useGlobalLoaderOnInitialRequest"
  | "noGlobalLoadingAfterInitialRequest"
> & {
  requestKey: string;
};

type HandleErrorOptions = Pick<
  FunctionOptions,
  "errorMessage" | "showNativeError" | "showErrorsInSnackbar"
> & { error: any };

const useRequests = () => {
  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingContext();
  const requestTracker = useRef<RequestTracker>({});
  const { getLoggedInUser, profilePicture } = useUserContext();

  const startLoader = ({
    startLoader: piStartLoader,
    useLoader,
    useGlobalLoaderOnInitialRequest,
    noGlobalLoadingAfterInitialRequest,
    requestKey,
  }: StartLoaderOptions) => {
    if (
      useLoader &&
      piStartLoader &&
      (!useGlobalLoaderOnInitialRequest || requestTracker.current[requestKey])
    ) {
      piStartLoader();
    } else if (
      useLoader &&
      (!noGlobalLoadingAfterInitialRequest ||
        !requestTracker.current[requestKey])
    ) {
      startGlobalLoader();
    }
  };

  const stopLoader = ({
    stopLoader: piStopLoader,
    useLoader,
    useGlobalLoaderOnInitialRequest,
    noGlobalLoadingAfterInitialRequest,
    requestKey,
  }: StopLoaderOptions) => {
    if (
      useLoader &&
      piStopLoader &&
      (!useGlobalLoaderOnInitialRequest || requestTracker.current[requestKey])
    ) {
      piStopLoader();
    } else if (
      useLoader &&
      (!noGlobalLoadingAfterInitialRequest ||
        !requestTracker.current[requestKey])
    ) {
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
    if (errorMessage && !showNativeError && showErrorsInSnackbar) {
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
    requestKey: string,
    {
      successMessage,
      errorMessage,
      useLoader = true,
      showNativeError = false,
      showErrorsInSnackbar = false,
      startLoader: piStartLoader,
      stopLoader: piStopLoader,
      useGlobalLoaderOnInitialRequest = false,
      noGlobalLoadingAfterInitialRequest = true,
    }: FunctionOptions
  ): Promise<T> => {
    let returnValue;
    startLoader({
      startLoader: piStartLoader,
      useLoader,
      useGlobalLoaderOnInitialRequest,
      noGlobalLoadingAfterInitialRequest,
      requestKey,
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
        useGlobalLoaderOnInitialRequest,
        noGlobalLoadingAfterInitialRequest,
        requestKey,
      });
      requestTracker.current[requestKey] = true;
    }
    return returnValue;
  };

  const getAllAlbumsQueryKey = () => ["GET_ALL_ALBUMS"];
  const getAllAlbumsFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseAlbum[]> => {
    return await runFunctionInTryCatch<ParseAlbum[]>(
      async () => {
        const albums = await ParseAlbum.query().findAll();
        return albums.map((album) => new ParseAlbum(album));
      },
      JSON.stringify(getAllAlbumsQueryKey()),
      { errorMessage: Strings.noAlbums(), ...options }
    );
  };

  const getAllImagesQueryKey = () => ["GET_ALL_IMAGES"];
  const getAllImagesFunction = async (
    options: FunctionOptions = {}
  ): Promise<ParseImage[]> => {
    return await runFunctionInTryCatch<ParseImage[]>(
      async () => {
        const images = await ParseImage.query().findAll();
        return images.map((image) => new ParseImage(image));
      },
      JSON.stringify(getAllImagesQueryKey()),
      { errorMessage: Strings.noImages(), ...options }
    );
  };

  const getAlbumQueryKey = (albumId: string) => ["GET_ALBUM", albumId];
  const getAlbumFunction = async (
    albumId: string,
    options: FunctionOptions = {}
  ): Promise<ParseAlbum> => {
    return await runFunctionInTryCatch<ParseAlbum>(
      async () => {
        const album = await ParseAlbum.query().get(albumId);
        return new ParseAlbum(album);
      },
      JSON.stringify(getAlbumQueryKey(albumId)),
      { errorMessage: Strings.albumNotFound(), ...options }
    );
  };

  const getImagesByIdQueryKey = (imageIds: string[]) => [
    "GET_IMAGES_BY_ID",
    imageIds,
  ];
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
      JSON.stringify(getImagesByIdQueryKey(imageIds)),
      { errorMessage: Strings.getImagesError(), ...options }
    );
  };

  const getImageByIdQueryKey = (imageId?: string) => [
    "GET_IMAGE_BY_ID",
    imageId,
  ];
  const getImageByIdFunction = async (
    imageId?: string,
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
          throw new Error();
        }
        return new ParseImage(image);
      },
      JSON.stringify(getImageByIdQueryKey(imageId)),
      { errorMessage: Strings.imageNotFound(), ...options }
    );
  };

  const getImagesByOwnerQueryKey = (owner: ParseUser) => [
    "GET_IMAGE_BY_OWNER",
    owner.id,
  ];
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
      JSON.stringify(getImagesByOwnerQueryKey(owner)),
      { errorMessage: Strings.getImageError(), ...options }
    );
  };

  const getUserByIdQueryKey = (userId: string) => ["GET_USER_BY_ID", userId];
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
      JSON.stringify(getUserByIdQueryKey(userId)),
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getUsersByEmailQueryKey = (emails: string[]) => [
    "GET_USERS_BY_EMAIL",
    emails,
  ];
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
      JSON.stringify(getUsersByEmailQueryKey(emails)),
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getUserByEmailQueryKey = (email: string) => [
    "GET_USER_BY_EMAIL",
    email,
  ];
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
      JSON.stringify(getUserByEmailQueryKey(email)),
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  const getRelatedUserEmailsQueryKey = () => ["GET_RELATED_USER_EMAILS"];
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
      JSON.stringify(getRelatedUserEmailsQueryKey()),
      { errorMessage: Strings.couldNotGetUserInfo(), ...options }
    );
  };

  return {
    getAllAlbumsFunction,
    getAllAlbumsQueryKey,
    getAllImagesFunction,
    getAllImagesQueryKey,
    getAlbumFunction,
    getAlbumQueryKey,
    getImagesByIdFunction,
    getImagesByIdQueryKey,
    getImageByIdFunction,
    getImageByIdQueryKey,
    getImagesByOwnerFunction,
    getImagesByOwnerQueryKey,
    getUserByIdQueryKey,
    getUserByIdFunction,
    getUsersByEmailFunction,
    getUsersByEmailQueryKey,
    getRelatedUserEmailsQueryKey,
    getRelatedUserEmailsFunction,
    getUserByEmailFunction,
    getUserByEmailQueryKey,
  };
};

export default useRequests;
