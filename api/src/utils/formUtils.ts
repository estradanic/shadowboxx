/**
 * Type allowing for structured tracking of form validation errors
 */
export type ErrorState<FieldNames extends string> = Record<
  FieldNames,
  {isError: boolean; errorMessage: string}
>;

/**
 * Helper function to validate email addresses
 * @param email
 * @returns
 */
export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email,
  );
};

/**
 * Helper function to validate passwords
 * @param password
 * @returns
 */
export const validatePassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(
    password,
  );
};
