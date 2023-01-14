import {create} from "zustand";
import { LoadingWrapperProps } from "../components/Loader/LoadingWrapper";

type StartGlobalLoaderOptions = {
  content?: LoadingWrapperProps["content"];
} & (
  | {
      type: "determinate";
      progress?: LoadingWrapperProps["progress"];
    }
  | {
      type: "indeterminate";
      progress?: undefined;
    }
);


type UpdateGlobalLoaderOptions = {
  content?: LoadingWrapperProps["content"];
  progress?: LoadingWrapperProps["progress"];
};

/** Interface describing Global loading state */
interface GlobalLoadingState {
  /** Whether the whole page is loading */
  globalLoading?: LoadingWrapperProps["loading"];
  /** Progress value (0-100) of the global loader */
  globalProgress?: LoadingWrapperProps["progress"];
  /** Type of the global loader */
  globalLoaderType?: LoadingWrapperProps["type"];
  /** Content (such as text) to show in the loader */
  globalLoaderContent?: LoadingWrapperProps["content"];
  /** Function to start a global loader */
  startGlobalLoader: (options?: StartGlobalLoaderOptions) => void;
  /** Function to update a global loader */
  updateGlobalLoader: (options: UpdateGlobalLoaderOptions) => void;
  /** Function to reset the global loader back to defaults ({loading: false, progress: 0, type: "indeterminate"}) */
  stopGlobalLoader: () => void;
}

/** Hook to manage GlobalLoadingStore */
const useGlobalLoadingStore = create<GlobalLoadingState>()((set) => ({
  globalLoading: false,
  globalProgress: 5,
  globalLoaderType: "indeterminate",
  globalLoaderContent: undefined,
  startGlobalLoader: (options?: StartGlobalLoaderOptions) => {
    if (options) {
      if (options.progress) {
        set((state) => ({...state, globalProgress: options.progress}));
      }
      set((state) => ({...state, globalLoaderType: options.type}));
      set((state) => ({...state, globalLoaderContent: options.content}));
    }
    set((state) => ({...state, globalLoading: true}));
  },
  updateGlobalLoader: (options: UpdateGlobalLoaderOptions) => {
    if (options.progress !== undefined) {
      set((state) => ({...state, globalProgress: options.progress}));
    }
    if (options.content !== undefined) {
      set((state) => ({...state, globalLoaderContent: options.content}));
    }
  },
  stopGlobalLoader: () => {
    set((state) => ({
      ...state,
      globalLoading: false,
      globalProgress: 5,
      globalLoaderType: "indeterminate",
      globalLoaderContent: undefined,
    }));
  },
}));

export default useGlobalLoadingStore;
