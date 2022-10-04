export type Hashable = {
  hashString: () => string;
};

const hashString = <T extends Hashable | string>(entry: T) => {
  if (typeof entry === "string") {
    return entry;
  }
  return entry.hashString();
};

/**
 * Function for deduping a collection of items if they have a `hashString` method
 */
export const dedupe = <T extends Hashable | string>(
  collection: Iterable<T> | ArrayLike<T>
): T[] => {
  const deduped: Map<string, T> = new Map();
  for (const entry of Array.from(collection)) {
    deduped.set(hashString(entry), entry);
  }
  return Array.from(deduped.values());
};

export const difference = <T extends Hashable | string> (
  collection1: Iterable<T> | ArrayLike<T>,
  collection2: Iterable<T> | ArrayLike<T>,
): T[] => {
  return Array.from(collection1).filter((entry1) => 
    !Array.from(collection2).map((entry2) => hashString(entry2))
      .includes(hashString(entry1))
  );
}

export const fromEntries = <Key extends PropertyKey, Value>(
  entries: [Key, Value][]
): { [key in Key]: Value } => {
  return Object.fromEntries(entries) as { [key in Key]: Value };
};
