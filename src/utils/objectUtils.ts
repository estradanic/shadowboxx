export type Hashable = {
  hashString: () => string;
};

/**
 * Function for deduping a collection of items if they have a `hashString` method
 */
export const dedupeFast = <T extends Hashable | string>(
  collection: Iterable<T> | ArrayLike<T>
): T[] => {
  const deduped: Map<string, T> = new Map();

  const hashString = (entry: T) => {
    if (typeof entry === "string") {
      return entry;
    }
    return entry.hashString();
  }

  for (const entry of Array.from(collection)) {
    deduped.set(hashString(entry), entry);
  }

  return Array.from(deduped.values());
};

export const fromEntries = <Key extends PropertyKey, Value>(
  entries: [Key, Value][]
): { [key in Key]: Value } => {
  return Object.fromEntries(entries) as { [key in Key]: Value };
};
