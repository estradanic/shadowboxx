import { useState } from "react";
import { SortDirection } from "../../types";

const useFilterBar = () => {
  const [captionSearch, setCaptionSearch] = useState("");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("descending");
  const [tagSearch, setTagSearch] = useState<string[]>([]);

  return {
    captionSearch,
    setCaptionSearch,
    sortDirection,
    setSortDirection,
    tagSearch,
    setTagSearch,
  };
};

export default useFilterBar;
