/**
 * Helper function to check if a string is null or whitespace
 */
export const isNullOrWhitespace = (input: string | null | undefined) => {
  return !input || !input.trim();
};

export const elide = (
  input?: string,
  startLength?: number,
  endLength?: number
) => {
  if (!input || !startLength || !endLength) {
    return input;
  }
  if (input.length <= startLength + endLength + 1) {
    return input;
  }
  return `${input.substring(0, startLength)}…${input.substring(
    input.length - endLength - 1
  )}`;
};
