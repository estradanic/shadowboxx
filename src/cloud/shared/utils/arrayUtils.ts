/** Make an array distinct */
export const distinct = <T, K>(
  /** The array to operate on */
  array: T[],
  /** Function to get a unique id for each element of the array */
  getUniqueId?: (item: T) => K
): T[] => {
  if (!getUniqueId) {
    return [...new Set(array)];
  }
  return [...new Map(array.map((item) => [getUniqueId(item), item])).values()];
};
