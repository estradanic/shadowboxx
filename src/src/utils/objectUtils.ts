export type Equalable<T> = {
  [key in keyof T]: T[key];
} & (
  | {
      equals: (that: T) => boolean;
      compareTo?: (that: T) => number;
    }
  | {
      equals?: (that: T) => boolean;
      compareTo: (that: T) => number;
    }
);

export type Hashable<T> = {
  [key in keyof T]: T[key];
} & {
  hashString: () => string;
};

/**
 * Function for deduping a collection of items if they have an `equals` or `compareTo` method
 * Note: Don't use this if you can have a `hashCode` method. Use `dedupeFast` in that case.
 */
export const dedupeSlow = <T>(
  collection: Iterable<Equalable<T>> | ArrayLike<Equalable<T>>
): Equalable<T>[] => {
  const deduped: Equalable<T>[] = [];

  const isEqual = (one: Equalable<T>, two: Equalable<T>): boolean => {
    return one.equals?.(two) ?? one.compareTo?.(two) === 0;
  };

  for (const entry of Array.from(collection)) {
    if (
      deduped.findIndex((uniqueEntry) => isEqual(uniqueEntry, entry)) !== -1
    ) {
      deduped.push(entry);
    }
  }

  return deduped;
};

/**
 * Function for deduping a collection of items if they have a `hashString` method
 */
export const dedupeFast = <T>(
  collection: Iterable<Hashable<T>> | ArrayLike<Hashable<T>>
): Hashable<T>[] => {
  const deduped: Map<string, Hashable<T>> = new Map();

  for (const entry of Array.from(collection)) {
    deduped.set(entry.hashString(), entry);
  }

  return Array.from(deduped.values());
};
