/** Wrapping type to force fields in Keys to be either all defined or none defined */
export type Interdependent<
  T,
  Keys extends keyof T,
  Keys2 extends keyof T = never
> = Omit<T, Keys | Keys2> &
  ({ [key in Keys]?: never } | { [key in Keys]-?: T[key] }) &
  ({ [key in Keys2]?: never } | { [key in Keys2]-?: T[key] });

/** Wrapping type to filter specific types of keys from another type */
export type KeysOfType<T, Keys> = keyof {
  [key in keyof Keys]: Keys[key] extends T ? key : never;
};

/** Wrapping type to "Optionalize" only specific fields */
export type Optional<T, Keys extends keyof T> = Omit<T, Keys> &
  Partial<Pick<T, Keys>>;
