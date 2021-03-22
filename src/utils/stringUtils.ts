/**
 * Helper function to check if a string is null or whitespace
 * @param input
 * @returns
 */
export const isNullOrWhitespace = (input: string) => {
  return !input || !input.trim();
};

export const elide = (
  input: string,
  startLength: number,
  endLength: number,
) => {
  if (input.length <= startLength + endLength + 1) {
    return input;
  }
  return `${input.substring(0, startLength)}…${input.substring(
    input.length - endLength - 1,
  )}`;
};
