import Parse from "parse";
import { AlbumAttributes } from "./ParseAlbum";
import { AlbumChangeNotificationAttributes } from "./ParseAlbumChangeNotification";
import { DuplicateAttributes } from "./ParseDuplicate";
import { ImageAttributes } from "./ParseImage";
import ParsePointer from "./ParsePointer";
import { UserAttributes } from "./ParseUser";

/** Type encompassing the classNames allowed for ParseObjects */
export type ClassName = "Album" | "Image" | "_User" | "_Role" | "Duplicate" | "AlbumChangeNotification";

/** Type defining basic attributes of all ParseObjects */
export interface ObjectAttributes {
  /** Unique id of the object in the database */
  objectId: string;
  /** Date object is first persisted to the database */
  createdAt: Date;
  /** Date object has been last updated in the database */
  updatedAt: Date;
}

/** Type encompassing the attributes of all kinds of ParseObjects */
export type Attributes<C extends ClassName> = ObjectAttributes & (
  C extends "Album" ? AlbumAttributes
    : C extends "Image" ? ImageAttributes
    : C extends "_User" ? UserAttributes
    : C extends "Duplicate" ? DuplicateAttributes
    : C extends "AlbumChangeNotification" ? AlbumChangeNotificationAttributes
    : {}
);

/**
 * Type for converting an Attributes type to one with native Parse Pointers
 */
export type ParsifyPointers<C extends ClassName> = {
  [key in keyof Attributes<C>]: Attributes<C>[key] extends (ParsePointer<ClassName> | undefined)
    ? Parse.Pointer
    : Attributes<C>[key];
};

export class Columns {
  objectId = "objectId" as const;
  createdAt = "createdAt" as const;
  updatedAt = "updatedAt" as const;
  id = "objectId" as const;
}

/**
 * Class wrapping the Parse.Object class and providing convenience methods/properties
 */
export default class ParseObject<C extends ClassName> {
  /** Basic columns for any class */
  static COLUMNS = new Columns();

  protected _object: Parse.Object<ParsifyPointers<C>>;

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
      return { className: this._object.className, objectId: "null", __type: "Pointer" };
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
   * @returns Whether the two ParseObjects are equal or not
   */
  equals(that: ParseObject<C>): boolean {
    return this.id === that.id;
  }

  /**
   * Get the hashstring for this ParseObject
   * @returns Hashstring of the ParseObject
   */
  hashString(): string {
    return this.id ?? "";
  }

  /**
   * Delete this object from the database
   * @returns A promise that resolves when the object has been deleted
   */
  async destroy() {
    return await this._object.destroy();
  }

  /**
   * Save this object to the local datastore
   * @returns A promise that resolves when the object has been saved
   */
  async pin() {
    await this._object.pin();
  }

  /** ObjectId for this object */
  get id(): ObjectAttributes["objectId"] {
    return this._object.id || (this._object as any).objectId;
  }

  /** Date that the object was saved to the db */
  get createdAt(): ObjectAttributes["createdAt"] {
    return this._object.createdAt;
  }

  /** Date that the object was last updated in the db */
  get updatedAt(): ObjectAttributes["updatedAt"] {
    return this._object.updatedAt;
  }
}
