import { useState } from "react";
import { SortDirection } from "../../types";
import { useDebounce } from "use-debounce";

const useFilterBar = () => {
  const [captionSearch, setCaptionSearch] = useState("");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("descending");
  const [tagSearch, setTagSearch] = useState<string[]>([]);
  const [debouncedCaptionSearch] = useDebounce(captionSearch, 300);

  return {
    /** What to search captions for */
    captionSearch,
    /** The state setter for captionSearch */
    setCaptionSearch,
    /** The current sort direction */
    sortDirection,
    /** The state setter for sortDirection */
    setSortDirection,
    /** What to search tags for */
    tagSearch,
    /** The state setter for tagSearch */
    setTagSearch,
    /** captionSearch debounced by 300ms (for effects) */
    debouncedCaptionSearch,
  };
};

export default useFilterBar;
