export type ErrorState<FieldNames extends string> = Record<
  FieldNames,
  {isError: boolean; errorMessage: string}
>;

export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email,
  );
};

export const validatePassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(
    password,
  );
};
