import Strings from "../resources/Strings";

const MAX_ALLOWED_FILE_NAME_LENGTH = 24;

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

/**
 * Parse only allows mostly alphanumeric characters in file names.
 * It also rejects file names that are too long.
 */
export const makeValidFileName = (input: string): string => {
  let fileName = input?.replaceAll(/[^A-Z0-9a-z_. ]/g, "");
  if (isNullOrWhitespace(fileName)) {
    throw new Error(Strings.invalidEmptyFilename());
  }
  if (fileName.length > MAX_ALLOWED_FILE_NAME_LENGTH) {
    fileName = fileName.substring(0, MAX_ALLOWED_FILE_NAME_LENGTH);
  }
  return fileName;
};

export const removeExtension = (input: string): string => {
  const fileName = input?.replace(/\..*$/, "");
  if (isNullOrWhitespace(fileName)) {
    throw new Error(Strings.invalidEmptyFilename());
  }
  return fileName;
};
