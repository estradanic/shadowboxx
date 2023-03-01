import Strings from "../resources/Strings";

const MAX_ALLOWED_FILE_NAME_LENGTH = 24;

/**
 * Helper function to check if a string is null or whitespace
 */
export const isNullOrWhitespace = (input: string | null | undefined) => {
  return !input || !input.trim();
};

/**
 * Function to elide a string with an ellipsis (...)
 * @param input The string to elide
 * @param startLength The length of the part before the ellipsis
 * @param endLength The length of the part after the ellipsis
 * @returns The elided string
 */
export const elide = (
  input?: string,
  startLength?: number,
  endLength: number = -1
) => {
  if (!input || !startLength) {
    return input;
  }
  if (input.length <= startLength + endLength + 1) {
    return input;
  }
  return `${input.substring(0, startLength)}…${input.substring(
    input.length - endLength - 1
  )}`;
};

/** Function to return a unique string prefixed by the prefix */
export const uniqueId = (prefix: string = ""): string => {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`;
};

/**
 * Parse only allows mostly alphanumeric characters in file names.
 * It also rejects file names that are too long.
 */
export const makeValidFileName = (input: string): string => {
  let fileName = input?.replaceAll(/[^A-Z0-9a-z_. ]/g, "");
  if (isNullOrWhitespace(fileName)) {
    throw new Error(Strings.error.invalidEmptyFilename);
  }
  if (fileName.length > MAX_ALLOWED_FILE_NAME_LENGTH) {
    fileName = fileName.substring(0, MAX_ALLOWED_FILE_NAME_LENGTH);
  }
  return fileName;
};

/** Function to remove file extension from the end of a string */
export const removeExtension = (input: string): string => {
  const fileName = input?.replace(/\..*$/, "");
  if (isNullOrWhitespace(fileName)) {
    throw new Error(Strings.error.invalidEmptyFilename);
  }
  return fileName;
};
