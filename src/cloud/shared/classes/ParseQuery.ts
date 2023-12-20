import Parse from "parse";
import ParseObject, { ClassName, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";
import ParseAlbum from "./ParseAlbum";
import ParseImage from "./ParseImage";
import ParseAlbumChangeNotification from "./ParseAlbumChangeNotification";
import ParseDuplicate from "./ParseDuplicate";

/**
 * Shorthand to get the Parse.User or Parse.Object type
 * depending on the ClassName (C) passed in
 */
type P<C extends ClassName> = C extends "_User"
  ? Parse.User<ParsifyPointers<C>>
  : Parse.Object<ParsifyPointers<C>>;

/**
 * Shorthand to get the ParseObject child type
 * depending on the ClassName (C) passed in
 */
type PO<C extends ClassName> = C extends "_User"
  ? ParseUser
  : C extends "Album"
  ? ParseAlbum
  : C extends "Image"
  ? ParseImage
  : C extends "AlbumChangeNotification"
  ? ParseAlbumChangeNotification
  : C extends "Duplicate"
  ? ParseDuplicate
  : ParseObject<C>;

/**
 * Function to get a ParseObject child object
 * depending on the className passed in
 * @param obj Parse.Object - the object to wrap
 * @param className ClassName - the className of the object
 * @param cloud boolean - whether this is called on the cloud or not
 */
const getParseObject = <C extends ClassName>(
  obj: P<C>,
  className: C,
  cloud: boolean
): PO<C> => {
  if (className === "_User") {
    return new ParseUser(obj as P<"_User">, cloud) as PO<C>;
  }
  if (className === "Album") {
    return new ParseAlbum(obj as P<"Album">, cloud) as PO<C>;
  }
  if (className === "Image") {
    return new ParseImage(obj as P<"Image">, cloud) as PO<C>;
  }
  if (className === "AlbumChangeNotification") {
    return new ParseAlbumChangeNotification(
      obj as P<"AlbumChangeNotification">
    ) as PO<C>;
  }
  if (className === "Duplicate") {
    return new ParseDuplicate(obj as P<"Duplicate">) as PO<C>;
  }
  return new ParseObject(obj) as PO<C>;
};

/** Sparse type for JSONified queries */
type QueryJSON = {
  where: Record<string, any>;
  [key: string]: any;
};

/**
 * Object wrapping the Parse.Query class
 * providing built-in conversion to ParseObject children from Parse.Object results
 */
export default class ParseQuery<C extends ClassName> {
  static for<Fc extends ClassName>(className: Fc, parse: typeof Parse = Parse) {
    const query = (
      className === "_User"
        ? new parse.Query<Parse.User<ParsifyPointers<Fc>>>(className)
        : new parse.Query<Parse.Object<ParsifyPointers<Fc>>>(className)
    ) as Parse.Query<P<Fc>>;
    return new ParseQuery<Fc>(query, true);
  }

  private _query: Parse.Query<P<C>>;
  private _className: C;
  private _cloud: boolean;

  constructor(query: Parse.Query<P<C>>, cloud = false) {
    this._query = query;
    this._className = query.className as C;
    this._cloud = cloud;
  }

  /** Constructs a ParseQuery that is the OR of the passed in queries */
  static or<C extends ClassName>(...queries: ParseQuery<C>[]) {
    const orQuery = Parse.Query.or(...queries.map((q) => q._query));
    return new ParseQuery(orQuery as Parse.Query<P<C>>);
  }

  /** Creates a new instance of ParseQuery from a JSON represenatation */
  static fromJSON<C extends ClassName>(className: C, json: QueryJSON) {
    const query = Parse.Query.fromJSON(className, json);
    return new ParseQuery(query as Parse.Query<P<C>>);
  }

  /**
   * Sorts the results in ascending order by the given key,
   * but can also add secondary sort descriptors without overwriting _order
   */
  addAscending<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K | K[]
  ): this {
    this._query = this._query.addAscending(key);
    return this;
  }

  /**
   * Sorts the results in descending order by the given key,
   * but can also add secondary sort descriptors without overwriting _order
   */
  addDescending<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K | K[]): this {
    this._query = this._query.addDescending(key);
    return this;
  }

  /** Sorts the results in ascending order by the given key */
  ascending<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K | K[]
  ): this {
    this._query = this._query.ascending(key);
    return this;
  }

  /** Executs an aggregate query and returns aggregate results */
  async aggregate<V = any>(
    pipeline: Parse.Query.AggregationOptions | Parse.Query.AggregationOptions[]
  ): Promise<V> {
    return await this._query.aggregate(pipeline);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be contained by the provided list of values.
   * Get objects where all array elements match.
   */
  containedBy<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    values: (
      | P<C>["attributes"][K]
      | (P<C>["attributes"][K] extends Parse.Object<Parse.Attributes>
          ? string
          : never)
    )[]
  ): this {
    this._query = this._query.containedBy(key, values);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be contained in the provided list of values.
   */
  containedIn<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    values: (
      | P<C>["attributes"][K]
      | (P<C>["attributes"][K] extends Parse.Object<Parse.Attributes>
          ? string
          : never)
    )[]
  ): this {
    this._query = this._query.containedIn(key, values);
    return this;
  }

  /**
   * Adds a constraint for finding string values that contain a provided string
   */
  contains<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    substring: string
  ): this {
    this._query = this._query.contains(key, substring);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to contain each one of the provided list of values.
   */
  containsAll<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    values: any[]
  ): this {
    this._query = this._query.containsAll(key, values);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to contain each one of the provided list of values starting with given strings.
   */
  containsAllStartingWith<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, values: any[]): this {
    this._query = this._query.containsAllStartingWith(key, values);
    return this;
  }

  /** Counts the number of objects that match this query */
  async count(options?: Parse.Query.CountOptions | undefined): Promise<number> {
    return await this._query.count(options);
  }

  /** Sorts the results in descending order by the given key */
  descending<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K | K[]
  ): this {
    this._query = this._query.descending(key);
    return this;
  }

  /** Adds a constraint for finding objects that do not contain a given key */
  doesNotExist<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K
  ): this {
    this._query = this._query.doesNotExist(key);
    return this;
  }

  /** Executes a distinct query and returns unique values */
  async distinct<K extends keyof P<C>["attributes"], V = P<C>["attributes"][K]>(
    key: K
  ): Promise<V[]> {
    return await this._query.distinct(key);
  }

  /**
   * Iterates over each result of a query, calling a callback for each one.
   * The callback must return a boolean or a promise that resolves to a boolean,
   * indicating whether the result should be included in the returned value.
   * The query may not have any sort order, and may not use limit or skip.
   */
  async filter(
    callback: (
      currentObject: P<C>,
      index: number,
      query: Parse.Query<Parse.Object<Parse.Attributes>>
    ) => boolean | PromiseLike<boolean>,
    options?: Parse.Query.BatchOptions | undefined
  ): Promise<PO<C>[]> {
    const result = await this._query.filter(callback, options);
    return result.map((obj) =>
      getParseObject(obj, this._className, this._cloud)
    );
  }

  /**
   * Adds a constraint for finding string values that end with a provided string.
   */
  endsWith<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    suffix: string
  ): this {
    this._query = this._query.endsWith(key, suffix);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be equal to the provided value.
   */
  equalTo<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value:
      | P<C>["attributes"][K]
      | (P<C>["attributes"][K] extends Parse.Object<Parse.Attributes>
          ? Parse.Pointer
          : P<C>["attributes"][K] extends (infer E)[]
          ? E
          : never)
  ): this {
    this._query = this._query.equalTo(key, value);
    return this;
  }

  /** Restricts the fields of the returned Parse.Objects to all keys except the provided keys */
  exclude<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    ...keys: K[]
  ): this {
    this._query = this._query.exclude(...keys);
    return this;
  }

  /** Adds a constraint for finding objects that contain the given key */
  exists<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K
  ): this {
    this._query = this._query.exists(key);
    return this;
  }

  /** Retrieves a list of ParseObjects that satisfy this query */
  async find(options?: Parse.Query.FindOptions | undefined): Promise<PO<C>[]> {
    const result = await this._query.find(options);
    return result.map((obj) =>
      getParseObject(obj, this._className, this._cloud)
    );
  }

  /** Retrieves a complete list of ParseObjects that satisfy this query */
  async findAll(
    options?: Parse.Query.BatchOptions | undefined
  ): Promise<PO<C>[]> {
    const result = await this._query.findAll(options);
    return result.map((obj) =>
      getParseObject(obj, this._className, this._cloud)
    );
  }

  /**
   * Retrieves at most one Parse.Object that satisfies this query
   * Returns the object if there is one, otherwise undefined
   */
  async first(
    options?: Parse.Query.FirstOptions | undefined
  ): Promise<PO<C> | undefined> {
    const result = await this._query.first(options);
    return result
      ? getParseObject(result, this._className, this._cloud)
      : undefined;
  }

  /** Change the source of this query to the server */
  fromNetwork(): this {
    this._query = this._query.fromNetwork();
    return this;
  }

  /** Changes the source of this query to all pinned objects */
  fromLocalDatastore(): this {
    this._query = this._query.fromLocalDatastore();
    return this;
  }

  /**
   * Constructs a ParseObject whose id is already known by fetching data from the server
   * @throws error if the object is not found
   */
  async get(
    objectId: string,
    options?: Parse.Query.GetOptions | undefined
  ): Promise<PO<C>> {
    const result = await this._query.get(objectId, options);
    return getParseObject(result, this._className, this._cloud);
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be greater than the provided value
   */
  greaterThan<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value: P<C>["attributes"][K]
  ): this {
    this._query = this._query.greaterThan(key, value);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be greater than or equal to the provided value
   */
  greaterThanOrEqualTo<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, value: P<C>["attributes"][K]): this {
    this._query = this._query.greaterThanOrEqualTo(key, value);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be less than the provided value
   */
  lessThan<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value: P<C>["attributes"][K]
  ): this {
    this._query = this._query.lessThan(key, value);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be less than or equal to the provided value
   */
  lessThanOrEqualTo<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, value: P<C>["attributes"][K]): this {
    this._query = this._query.lessThanOrEqualTo(key, value);
    return this;
  }

  /** Sets the limit of the number of results to return. The default limit is 100 */
  limit(n: number): ParseQuery<C> {
    return new ParseQuery(this._query.limit(n));
  }

  /** Adds a regular expression constraint for finding string values that match the provided regular expression */
  matches<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    regex: RegExp,
    modifiers?: string | undefined
  ): this {
    this._query = this._query.matches(key, regex, modifiers);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to not be contained in the provided list of values
   */
  notContainedIn<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, values: P<C>["attributes"][K][]): this {
    this._query = this._query.notContainedIn(key, values);
    return this;
  }

  /**
   * Adds a constraint to the query that requires a particular key's value to be not equal to the provided value
   */
  notEqualTo<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value:
      | P<C>["attributes"][K]
      | (P<C>["attributes"][K] extends Parse.Object<Parse.Attributes>
          ? Parse.Pointer
          : P<C>["attributes"][K] extends (infer E)[]
          ? E
          : never)
  ): this {
    this._query = this._query.notEqualTo(key, value);
    return this;
  }

  /**
   * Sets the number of results to skip before returning any results for paging
   * Default is to skip zero results
   */
  skip(n: number): ParseQuery<C> {
    return new ParseQuery(this._query.skip(n));
  }

  /**
   * Adds a constraint for finding string values that start with a provided string
   */
  startsWith<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    prefix: string
  ): this {
    this._query = this._query.startsWith(key, prefix);
    return this;
  }

  /** Returns a JSON representation of this query */
  toJSON() {
    return this._query.toJSON();
  }

  /** Overwrite all constraints in this query with the JSON provided */
  withJSON(json: any): this {
    this._query = this._query.withJSON(json);
    return this;
  }

  /**
   * Restricts the fields of the returned Parse.Objects to include only the provided keys.
   * If this is called multiple times, then all of the keys specified in each of the calls will be included
   */
  select<K extends keyof P<C>["attributes"]>(...keys: K[]): this {
    this._query = this._query.select(...keys);
    return this;
  }

  /** ClassName of this query */
  get className() {
    return this._className;
  }

  /** Get the underlying Parse.Query */
  toNativeQuery() {
    return this._query;
  }
}
