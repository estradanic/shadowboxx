import { useState } from "react";
import { SortDirection } from "../../types";

const useFilterBar = () => {
  const [captionSearch, setCaptionSearch] = useState("");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("descending");

  return {
    captionSearch,
    setCaptionSearch,
    sortDirection,
    setSortDirection,
  };
};

export default useFilterBar;
