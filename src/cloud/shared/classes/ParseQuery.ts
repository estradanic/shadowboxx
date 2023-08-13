import Parse from "parse";
import ParseObject, { ClassName, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";
import ParseAlbum from "./ParseAlbum";
import ParseImage from "./ParseImage";
import ParseAlbumChangeNotification from "./ParseAlbumChangeNotification";
import ParseDuplicate from "./ParseDuplicate";

type P<C extends ClassName> = C extends "_User"
  ? Parse.User<ParsifyPointers<C>>
  : Parse.Object<ParsifyPointers<C>>;

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

const getParseObject = <C extends ClassName>(
  obj: P<C>,
  className: C,
  cloud: boolean
): PO<C> => {
  if (className === "_User") {
    return new ParseUser(obj as P<"_User">, !cloud) as PO<C>;
  }
  if (className === "Album") {
    return new ParseAlbum(obj as P<"Album">, !cloud) as PO<C>;
  }
  if (className === "Image") {
    return new ParseImage(obj as P<"Image">, !cloud) as PO<C>;
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

  addAscending<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K | K[]
  ): this {
    this._query = this._query.addAscending(key);
    return this;
  }
  addDescending<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K | K[]): this {
    this._query = this._query.addDescending(key);
    return this;
  }
  ascending<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K | K[]
  ): this {
    this._query = this._query.ascending(key);
    return this;
  }
  async aggregate<V = any>(
    pipeline: Parse.Query.AggregationOptions | Parse.Query.AggregationOptions[]
  ): Promise<V> {
    return await this._query.aggregate(pipeline);
  }
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
  contains<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    substring: string
  ): this {
    this._query = this._query.contains(key, substring);
    return this;
  }
  containsAll<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    values: any[]
  ): this {
    this._query = this._query.containsAll(key, values);
    return this;
  }
  containsAllStartingWith<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, values: any[]): this {
    this._query = this._query.containsAllStartingWith(key, values);
    return this;
  }
  async count(options?: Parse.Query.CountOptions | undefined): Promise<number> {
    return await this._query.count(options);
  }
  descending<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K | K[]
  ): this {
    this._query = this._query.descending(key);
    return this;
  }
  doesNotExist<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K
  ): this {
    this._query = this._query.doesNotExist(key);
    return this;
  }
  doesNotMatchKeyInQuery<
    U extends Parse.Object<Parse.Attributes>,
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"],
    X extends Extract<keyof U["attributes"], string>
  >(key: K, queryKey: X, query: Parse.Query<U>): this {
    this._query = this._query.doesNotMatchKeyInQuery(key, queryKey, query);
    return this;
  }
  doesNotMatchQuery<
    U extends Parse.Object<Parse.Attributes>,
    K extends keyof P<C>["attributes"]
  >(key: K, query: Parse.Query<U>): this {
    this._query = this._query.doesNotMatchQuery(key, query);
    return this;
  }
  async distinct<K extends keyof P<C>["attributes"], V = P<C>["attributes"][K]>(
    key: K
  ): Promise<V[]> {
    return await this._query.distinct(key);
  }
  async eachBatch(
    callback: (objs: P<C>[]) => void | PromiseLike<void>,
    options?: Parse.Query.BatchOptions | undefined
  ): Promise<void> {
    this._query.eachBatch(callback, options);
  }
  async each(
    callback: (obj: P<C>) => void | PromiseLike<void>,
    options?: Parse.Query.BatchOptions | undefined
  ): Promise<void> {
    this._query.each(callback, options);
  }
  hint(value: string | object): this {
    this._query = this._query.hint(value);
    return this;
  }
  explain(explain: boolean): this {
    this._query = this._query.explain(explain);
    return this;
  }
  async map<U>(
    callback: (
      currentObject: P<C>,
      index: number,
      query: Parse.Query<Parse.Object<Parse.Attributes>>
    ) => U | PromiseLike<U>,
    options?: Parse.Query.BatchOptions | undefined
  ): Promise<U[]> {
    return await this._query.map(callback, options);
  }
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
  endsWith<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    suffix: string
  ): this {
    this._query = this._query.endsWith(key, suffix);
    return this;
  }
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
  exclude<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    ...keys: K[]
  ): this {
    this._query = this._query.exclude(...keys);
    return this;
  }
  exists<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K
  ): this {
    this._query = this._query.exists(key);
    return this;
  }
  async find(options?: Parse.Query.FindOptions | undefined): Promise<PO<C>[]> {
    const result = await this._query.find(options);
    return result.map((obj) =>
      getParseObject(obj, this._className, this._cloud)
    );
  }
  async findAll(
    options?: Parse.Query.BatchOptions | undefined
  ): Promise<PO<C>[]> {
    const result = await this._query.findAll(options);
    return result.map((obj) =>
      getParseObject(obj, this._className, this._cloud)
    );
  }
  async first(
    options?: Parse.Query.FirstOptions | undefined
  ): Promise<PO<C> | undefined> {
    const result = await this._query.first(options);
    return result
      ? getParseObject(result, this._className, this._cloud)
      : undefined;
  }
  fromNetwork(): this {
    this._query = this._query.fromNetwork();
    return this;
  }
  fromLocalDatastore(): this {
    this._query = this._query.fromLocalDatastore();
    return this;
  }
  fromPin(): this {
    this._query = this._query.fromPin();
    return this;
  }
  fromPinWithName(name: string): this {
    this._query = this._query.fromPinWithName(name);
    return this;
  }
  cancel(): this {
    this._query = this._query.cancel();
    return this;
  }
  fullText<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value: string,
    options?: Parse.Query.FullTextOptions | undefined
  ): this {
    this._query = this._query.fullText(key, value, options);
    return this;
  }
  async get(
    objectId: string,
    options?: Parse.Query.GetOptions | undefined
  ): Promise<PO<C>> {
    const result = await this._query.get(objectId, options);
    return getParseObject(result, this._className, this._cloud);
  }
  greaterThan<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value: P<C>["attributes"][K]
  ): this {
    this._query = this._query.greaterThan(key, value);
    return this;
  }
  greaterThanOrEqualTo<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, value: P<C>["attributes"][K]): this {
    this._query = this._query.greaterThanOrEqualTo(key, value);
    return this;
  }
  includeAll(): ParseQuery<C> {
    return new ParseQuery(this._query.includeAll());
  }
  lessThan<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    value: P<C>["attributes"][K]
  ): this {
    this._query = this._query.lessThan(key, value);
    return this;
  }
  lessThanOrEqualTo<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, value: P<C>["attributes"][K]): this {
    this._query = this._query.lessThanOrEqualTo(key, value);
    return this;
  }
  limit(n: number): ParseQuery<C> {
    return new ParseQuery(this._query.limit(n));
  }
  matches<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    regex: RegExp,
    modifiers?: string | undefined
  ): this {
    this._query = this._query.matches(key, regex, modifiers);
    return this;
  }
  matchesKeyInQuery<
    U extends Parse.Object<Parse.Attributes>,
    K extends keyof P<C>["attributes"],
    X extends Extract<keyof U["attributes"], string>
  >(key: K, queryKey: X, query: Parse.Query<U>): this {
    this._query = this._query.matchesKeyInQuery(key, queryKey, query);
    return this;
  }
  matchesQuery<
    U extends Parse.Object<Parse.Attributes>,
    K extends keyof P<C>["attributes"]
  >(key: K, query: Parse.Query<U>): this {
    this._query = this._query.matchesQuery(key, query);
    return this;
  }
  near<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    point: Parse.GeoPoint
  ): this {
    this._query = this._query.near(key, point);
    return this;
  }
  notContainedIn<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, values: P<C>["attributes"][K][]): this {
    this._query = this._query.notContainedIn(key, values);
    return this;
  }
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
  polygonContains<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, point: Parse.GeoPoint): this {
    this._query = this._query.polygonContains(key, point);
    return this;
  }
  skip(n: number): ParseQuery<C> {
    return new ParseQuery(this._query.skip(n));
  }
  sortByTextScore(): this {
    this._query = this._query.sortByTextScore();
    return this;
  }
  startsWith<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    prefix: string
  ): this {
    this._query = this._query.startsWith(key, prefix);
    return this;
  }
  async subscribe(
    sessionToken?: string | undefined
  ): Promise<Parse.LiveQuerySubscription> {
    return await this._query.subscribe(sessionToken);
  }
  toJSON() {
    return this._query.toJSON();
  }
  withJSON(json: any): this {
    this._query = this._query.withJSON(json);
    return this;
  }
  withCount(includeCount?: boolean | undefined): this {
    this._query = this._query.withCount(includeCount);
    return this;
  }
  withinGeoBox<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    southwest: Parse.GeoPoint,
    northeast: Parse.GeoPoint
  ): this {
    this._query = this._query.withinGeoBox(key, southwest, northeast);
    return this;
  }
  withinKilometers<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(
    key: K,
    point: Parse.GeoPoint,
    maxDistance: number,
    sorted?: boolean | undefined
  ): this {
    this._query = this._query.withinKilometers(key, point, maxDistance, sorted);
    return this;
  }
  withinMiles<K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]>(
    key: K,
    point: Parse.GeoPoint,
    maxDistance: number,
    sorted?: boolean | undefined
  ): this {
    this._query = this._query.withinMiles(key, point, maxDistance, sorted);
    return this;
  }
  withinPolygon<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, points: number[][]): this {
    this._query = this._query.withinPolygon(key, points);
    return this;
  }
  withinRadians<
    K extends keyof Parse.BaseAttributes | keyof P<C>["attributes"]
  >(key: K, point: Parse.GeoPoint, maxDistance: number): this {
    this._query = this._query.withinRadians(key, point, maxDistance);
    return this;
  }
  select<K extends keyof P<C>["attributes"]>(...keys: K[]): this {
    this._query = this._query.select(...keys);
    return this;
  }
  toNativeQuery() {
    return this._query;
  }
}
