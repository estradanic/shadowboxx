import create from "zustand";

interface ScrollPositionState {
  /** Scroll positions of the PageContainers across pages */
  scrollPositions: {
    [path: string]: number;
  };
  /** Pushes a scroll position to the store */
  pushScrollPosition: (path: string, scrollPosition: number) => void;
  /** Gets a scroll position for a path */
  getScrollPosition: (path: string) => number;
}

/** Hook to manage ScrollPositionStore */
const useScrollPositionStore = create<ScrollPositionState>()((set, get) => ({
  scrollPositions: {},
  pushScrollPosition: (path: string, scrollPosition: number) => {
    set((state) => ({
      scrollPositions: {
        ...state.scrollPositions,
        [path]: scrollPosition,
      },
    }));
  },
  getScrollPosition: (path: string) => {
    return get().scrollPositions[path] ?? 0;
  },
}));

export default useScrollPositionStore;
