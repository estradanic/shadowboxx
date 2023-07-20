export const distinctBy = <T, K>(array: T[], getUniqueId?: (item: T) => K): T[] => {
  if (!getUniqueId) {
    return [...new Set(array)];
  }
  return [...new Map(array.map((item) => [getUniqueId(item), item])).values()];
};
