import Parse from "parse";
import { AlbumAttributes } from "./ParseAlbum";
import { AlbumChangeNotificationAttributes } from "./ParseAlbumChangeNotification";
import { DuplicateAttributes } from "./ParseDuplicate";
import { ImageAttributes } from "./ParseImage";
import ParsePointer from "./ParsePointer";
import { UserAttributes } from "./ParseUser";

/** Type encompassing the classNames allowed for ParseObjects */
export type ClassName =
  | "Album"
  | "Image"
  | "_User"
  | "Duplicate"
  | "AlbumChangeNotification";

/** Type defining basic attributes of all ParseObjects */
export interface ObjectAttributes {
  /** Unique id of the object in the database */
  objectId: string;
  /** Date object is first persisted to the database */
  createdAt: Date;
  /** Date object has been last updated in the database */
  updatedAt: Date;
}

type ObjectKeys = Required<{
  [key in keyof ObjectAttributes]: key;
}>;

/** Type encompassing the attributes of all kinds of ParseObjects */
export type Attributes<C extends ClassName> = ObjectAttributes &
  (C extends "Album"
    ? AlbumAttributes
    : C extends "Image"
    ? ImageAttributes
    : C extends "_User"
    ? UserAttributes
    : C extends "Duplicate"
    ? DuplicateAttributes
    : C extends "AlbumChangeNotification"
    ? AlbumChangeNotificationAttributes
    : never);

/**
 * Type for converting an Attributes type to one with native Parse Pointers
 */
export type ParsifyPointers<C extends ClassName> = {
  [key in keyof Attributes<C>]: Attributes<C>[key] extends
    | ParsePointer<ClassName>
    | undefined
    ? Parse.Pointer
    : Attributes<C>[key];
};

/** Type for directly working with native parse attributes */
export type NativeAttributes<C extends ClassName> = Omit<
  ParsifyPointers<C>,
  "objectId" | "createdAt" | "updatedAt"
>;

export class Columns implements ObjectKeys {
  createdAt = "createdAt" as const;
  updatedAt = "updatedAt" as const;
  objectId = "objectId" as const;
}

/**
 * Class wrapping the Parse.Object class and providing convenience methods/properties
 */
export default class ParseObject<C extends ClassName>
  implements ObjectAttributes
{
  /** Basic columns for any class */
  static COLUMNS = new Columns();

  private _object: Parse.Object<ParsifyPointers<C>>;

  constructor(object: Parse.Object<ParsifyPointers<C>>) {
    this._object = object;
  }

  /**
   * Create a ParsePointer to this ParseObject
   * @returns A ParsePointer to this ParseObject
   */
  toPointer(): ParsePointer<C> {
    return new ParsePointer(this.toNativePointer());
  }

  /**
   * Create a native Parse.Pointer to this ParseObject
   * @returns A native Parse.Pointer to this ParseObject
   */
  toNativePointer(): Parse.Pointer {
    if (this._object.isNew()) {
      return {
        className: this._object.className,
        objectId: "",
        __type: "Pointer",
      };
    }
    return this._object.toPointer();
  }

  /**
   * Set the ACL for this ParseObject
   * @param ACL The new ACL
   */
  setACL(ACL: Parse.ACL): void {
    this._object.setACL(ACL);
  }

  /**
   * Checks to see if that ParseObject is equal to this one
   * @param that The other ParseObject to compare to
   * @returns Whether the two ParseObjects are equal
   */
  equals(that: ParseObject<C>): boolean {
    return this.objectId === that.objectId;
  }

  /**
   * Get the hashstring for this ParseObject
   * @returns Hashstring of the ParseObject
   */
  hashString(): string {
    return this.objectId ?? "";
  }

  /**
   * Delete this object from the database
   * @returns A promise that resolves when the object has been deleted
   */
  async destroy(options?: Parse.Object.DestroyOptions) {
    return await this._object.destroy(options);
  }

  /**
   * Save this object to the local datastore
   * @returns A promise that resolves when the object has been saved
   */
  async pin() {
    await this._object.pin();
  }

  get objectId() {
    return this._object.id;
  }

  get createdAt() {
    return this._object.createdAt;
  }

  get updatedAt() {
    return this._object.updatedAt;
  }

  isNew() {
    return this._object.isNew();
  }

  existed() {
    return this._object.existed();
  }

  dirty(key?: Parameters<typeof this._object.dirty>[0]) {
    return this._object.dirty(key);
  }

  toNative() {
    return this._object;
  }

  getACL() {
    return this._object.getACL();
  }

  async fetch(options?: Parse.Object.FetchOptions) {
    return new ParseObject(await this._object.fetch(options));
  }

  async cloudFetch(options?: Parse.Object.FetchOptions) {
    return new ParseObject(await this._object.fetch(options));
  }

  set(attributes: ParsifyPointers<C>, options?: Parse.Object.SetOptions) {
    return this._object.set(attributes, options);
  }
}
