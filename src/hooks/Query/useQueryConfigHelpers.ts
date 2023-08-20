import { useSnackbar } from "../../components";
import { useGlobalLoadingStore } from "../../stores";
import { Strings } from "../../resources";
import { Interdependent, OwnershipFilter } from "../../types";
import { useUserContext } from "../../contexts/UserContext";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import { ParseAlbum, ParseImage, ParseQuery } from "../../classes";

export type FunctionOptions = Interdependent<
  {
    /** Message to show when query is successful */
    successMessage?: string;
    /** Message to show when query produces an error */
    errorMessage?: string;
    /** Whether to show the error.message from the query instead of `errorMessage` */
    showNativeError?: boolean;
    /** Whether to use a snackbar to show errors */
    showErrorsInSnackbar?: boolean;
    /**
     * Whether to start/stop a loader for the duration of the query.
     * If startLoader/stopLoader are not provided, the global loader is used.
     */
    useLoader?: boolean;
    /** Function to start a loader. Must be provided if stopLoader is provided */
    startLoader?: () => void;
    /** Function to stop the loader. Must be provided if startLoader is provided */
    stopLoader?: () => void;
  },
  "startLoader" | "stopLoader"
>;

type StartLoaderOptions = Pick<FunctionOptions, "startLoader" | "useLoader">;

type StopLoaderOptions = Pick<FunctionOptions, "stopLoader" | "useLoader">;

type HandleErrorOptions = Pick<
  FunctionOptions,
  "errorMessage" | "showNativeError" | "showErrorsInSnackbar"
> & { error: any };

/**
 * Hook to provide a helper method to useInfiniteQueryConfigs and useQueryConfigs
 */
const useQueryConfigHelpers = () => {
  const {
    enqueueErrorSnackbar,
    enqueueSuccessSnackbar,
    enqueueWarningSnackbar,
  } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );
  const { getLoggedInUser, updateLoggedInUser } = useUserContext();
  const { online } = useNetworkDetectionContext();

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
      enqueueWarningSnackbar(Strings.message.sessionExpired);
      getLoggedInUser().logout(updateLoggedInUser);
    } else if (
      errorMessage &&
      !showNativeError &&
      showErrorsInSnackbar &&
      online
    ) {
      enqueueErrorSnackbar(errorMessage);
      throw new Error(errorMessage);
    } else if (showNativeError && showErrorsInSnackbar && online) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.common);
    }
    throw new Error(error?.message ?? errorMessage);
  };

  const handleSuccess = (successMessage?: string) => {
    if (successMessage) {
      enqueueSuccessSnackbar(successMessage);
    }
  };

  /** Mutates query to apply the given tagSearch to it */
  const applyTagSearch = (query: ParseQuery<"Image">, tagSearch?: string[]) => {
    if (tagSearch?.includes("video")) {
      query.equalTo(ParseImage.COLUMNS.type, "video");
      tagSearch = tagSearch.filter((tag) => tag !== "video");
    } else if (tagSearch?.includes("image")) {
      query.equalTo(ParseImage.COLUMNS.type, "image");
      tagSearch = tagSearch.filter((tag) => tag !== "image");
    } else if (tagSearch?.includes("gif")) {
      query.equalTo(ParseImage.COLUMNS.type, "gif");
      tagSearch = tagSearch.filter((tag) => tag !== "gif");
    }
    if (tagSearch?.length) {
      query.containsAll(ParseImage.COLUMNS.tags, tagSearch);
    }
  };

  /** Mutates query to apply the given captionSearch to it */
  const applyCaptionSearch = (
    query: ParseQuery<"Image">,
    captionSearch?: string,
    captions?: Record<string, string>
  ) => {
    if (captionSearch && captions) {
      const search = captionSearch.toLowerCase();
      const captionsToApply = Object.keys(captions).filter((key) =>
        captions?.[key].toLowerCase().includes(search)
      );
      query.containedIn(ParseImage.COLUMNS.objectId, captionsToApply);
    }
  };

  /** Mutates query to apply the given OwnershipFilter to it */
  const applyOwnershipFilter = (
    query: ParseQuery<"Album">,
    ownership: OwnershipFilter
  ) => {
    if (ownership === "mine") {
      query.equalTo(
        ParseAlbum.COLUMNS.owner,
        getLoggedInUser().toNativePointer()
      );
    } else if (ownership === "shared") {
      query.notEqualTo(
        ParseAlbum.COLUMNS.owner,
        getLoggedInUser().toNativePointer()
      );
    }
  };

  /** Returns new query w/ the given name/description search applied to it */
  const applyNameDescriptionSearch = (
    query: ParseQuery<"Album">,
    nameDescriptionSearch?: string
  ) => {
    if (nameDescriptionSearch) {
      const queryJSON = query.toJSON();
      const orJSON = ParseQuery.or(
        ParseQuery.for("Album").contains(
          ParseAlbum.COLUMNS.name,
          nameDescriptionSearch
        ),
        ParseQuery.for("Album").contains(
          ParseAlbum.COLUMNS.description,
          nameDescriptionSearch
        )
      ).toJSON();
      queryJSON.where.$or = orJSON.where.$or;
      return ParseQuery.fromJSON("Album", queryJSON);
    }
    return query;
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

  return {
    runFunctionInTryCatch,
    applyTagSearch,
    applyCaptionSearch,
    applyOwnershipFilter,
    applyNameDescriptionSearch,
  };
};

export default useQueryConfigHelpers;
