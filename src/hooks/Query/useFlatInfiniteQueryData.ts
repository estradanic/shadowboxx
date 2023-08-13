import { useEffect, useRef, useState } from "react";
import { InfiniteData } from "@tanstack/react-query";
import { ParseObject, ClassName } from "../../classes";

type In<T> = InfiniteData<T[]> | undefined;

const equal = <T extends ParseObject<ClassName>>(a: In<T>, b: In<T>) => {
  if ((!a && !!b) || (!b && !!a)) {
    return false;
  }
  if (!a && !b) {
    return true;
  }
  if (a?.pages?.length !== b?.pages?.length) {
    return false;
  }
  let equal = true;
  a?.pages?.forEach((page, i) => {
    if (page.length !== b?.pages[i].length) {
      equal = false;
      return false;
    }
    page.forEach((object, j) => {
      if (object.objectId !== b?.pages[i][j].objectId) {
        equal = false;
        return false;
      }
    });
    if (!equal) return false;
  });
  return equal;
};

const useFlatInfiniteQueryData = <T extends ParseObject<ClassName>>(
  data: In<T>
) => {
  const [flatData, setFlatData] = useState<T[]>([]);
  const oldData = useRef<In<T>>();

  useEffect(() => {
    if (!equal(oldData.current, data)) {
      setFlatData(data?.pages?.flat?.() ?? []);
    }
    oldData.current = data;
  }, [data, oldData, setFlatData]);

  return flatData;
};

export default useFlatInfiniteQueryData;
