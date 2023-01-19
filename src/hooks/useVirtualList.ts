import { useRef } from "react";

/** Hook to allow rendering a lot of items to not block page navigation */
const useVirtualList = <T>( list?: T[]): T[] => {
  const initialized = useRef(false);

  if (!initialized.current) {
    initialized.current = true;
    return [];
  }
  return list ?? [];
};

export default useVirtualList;
