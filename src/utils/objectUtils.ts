export type Hashable = {
  hashString: () => string;
};

const hashString = <T extends Hashable | string>(entry: T) => {
  if (!entry) {
    return "";
  }
  if (typeof entry === "string") {
    return entry;
  }
  return entry.hashString();
};

/**
 * Function for deduping a collection of items if they have a `hashString` method
 */
export const dedupe = <T extends Hashable | string | undefined | null>(
  collection: Iterable<T> | ArrayLike<T>
): T[] => {
  const deduped: Map<string, T> = new Map();
  for (const entry of Array.from(collection)) {
    if (entry === undefined || entry === null) {
      continue;
    }
    deduped.set(hashString(entry), entry);
  }
  return Array.from(deduped.values());
};

/** Function for getting the difference between two collections */
export const difference = <T extends Hashable | string>(
  collection1: Iterable<T> | ArrayLike<T>,
  collection2: Iterable<T> | ArrayLike<T>
): T[] => {
  return Array.from(collection1).filter(
    (entry1) =>
      !Array.from(collection2)
        .map((entry2) => hashString(entry2))
        .includes(hashString(entry1))
  );
};

/** Function for getting deep equality of two objects */
export const deepEqual = (
  obj1: Record<any, any>,
  obj2: Record<any, any>
): boolean => {
  if (obj1 === obj2) {
    return true;
  }
  if (!obj1 || !obj2) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  let equal = true;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        equal = deepEqual(obj1[key], obj2[key]);
      } else {
        equal = false;
      }
    }
    if (!equal) {
      break;
    }
  }
  return equal;
};

/** Typed wrapper for {@link Object.fromEntries} */
export const fromEntries = <Key extends PropertyKey, Value>(
  entries: [Key, Value][]
): { [key in Key]: Value } => {
  return Object.fromEntries(entries) as { [key in Key]: Value };
};
