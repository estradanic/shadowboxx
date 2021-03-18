/**
 * Helper function to check if a string is null or whitespace
 * @param input
 * @returns
 */
export const isNullOrWhitespace = (input: string) => {
  return !input || !input.trim();
};
