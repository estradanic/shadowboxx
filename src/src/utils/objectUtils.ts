export type Equalable<T> = {
  [key in keyof T]: T[key];
} & {
  equals: (that: T) => boolean;
};

export type Hashable<T> = {
  [key in keyof T]: T[key];
} & {
  hashString: () => string;
};

export const dedupeSlow = <T>(
  collection: Iterable<Equalable<T>> | ArrayLike<Equalable<T>>
): Equalable<T>[] => {
  const deduped: Equalable<T>[] = [];

  for (const entry of Array.from(collection)) {
    if (deduped.findIndex((uniqueEntry) => uniqueEntry.equals(entry)) !== -1) {
      deduped.push(entry);
    }
  }

  return deduped;
};

export const dedupeFast = <T>(
  collection: Iterable<Hashable<T>> | ArrayLike<Hashable<T>>
): Hashable<T>[] => {
  const deduped: Map<string, Hashable<T>> = new Map();

  for (const entry of Array.from(collection)) {
    deduped.set(entry.hashString(), entry);
  }

  return Array.from(deduped.values());
};
