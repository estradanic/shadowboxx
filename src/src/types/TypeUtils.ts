/** Wrapping type to force fields in Keys to be either all defined or none defined */
export type Interdependent<T, Keys extends keyof T> = Omit<T, Keys> &
  ({ [key in Keys]?: never } | { [key in Keys]: T[key] });
