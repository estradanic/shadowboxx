/** Wrapping type to force fields in Keys to be either all defined or none defined */
export type Interdependent<
  T,
  Keys extends keyof T,
  Keys2 extends keyof T = never
> = Omit<T, Keys | Keys2> &
  ({ [key in Keys]?: never } | { [key in Keys]-?: T[key] }) &
  ({ [key in Keys2]?: never } | { [key in Keys2]-?: T[key] });

/** Wrapping type to force only one field in Keys to be defined */
export type Exclusive<T, Keys extends keyof T> = Omit<T, Keys> &
  {
    [Key in Keys]: Record<Key, T[Key]> &
      Partial<Record<Exclude<Keys, Key>, never>> extends infer O
      ? { [P in keyof O]: O[P] }
      : never;
  }[Keys];

/** Wrapping type to filter specific types of keys from another type */
export type KeysOfType<T, Keys> = keyof {
  [key in keyof Keys]: Keys[key] extends T ? key : never;
};

/** Wrapping type to make specific fields optional */
export type Optional<T, Keys extends keyof T> = Omit<T, Keys> &
  Partial<Pick<T, Keys>>;

/** Wrapping type to make specific fields required */
export type Require<T, Keys extends keyof T> = Omit<T, Keys> &
  Required<Pick<T, Keys>>;

/** Wrapping type to force at least one field in Keys to be defined */
export type RequireAtLeastOne<T, Keys extends keyof T> = Omit<T, Keys> &
  {
    [Key in Keys]: Record<Key, T[Key]> &
      Partial<Record<Exclude<Keys, Key>, T[Key]>> extends infer O
      ? { [P in keyof O]: O[P] }
      : { [P in keyof T]?: T[P]};
  }[Keys];
