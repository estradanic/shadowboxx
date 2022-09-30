import Parse from "parse";
import ParsePointer from "./ParsePointer";

/** Interface defining basic attributes of parse objects */
export interface Attributes {
  /** Unique id of the object in the database */
  objectId?: string;
  /** Date object is first persisted to the database */
  createdAt?: Date;
  /** Date object has been last updated in the database */
  updatedAt?: Date;
  /** Other columns */
  [key: string]: any;
}

/**
 * Type for converting an Attributes type to one with native Parse Pointers
 */
export type ParsifyPointers<A extends Attributes> = {
  [key in keyof A]: A[key] extends ParsePointer | undefined
    ? Parse.Pointer
    : A[key];
};

/**
 * Class wrapping the Parse.Object class and providing convenience methods/properties
 */
export default class ParseObject<A extends Attributes> {
  /** Basic columns for any class */
  static COLUMNS = {
    id: "objectId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  /**
   * Get a Parse.Query
   * @param online Whether to query the online database or the local database
   * @returns A Parse.Query object
   */
  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<Attributes>>>(
        Parse.Object
      );
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<Attributes>>>(
      Parse.Object
    ).fromLocalDatastore();
  }

  _object: Parse.Object<ParsifyPointers<A>>;

  constructor(object: Parse.Object<ParsifyPointers<A>>) {
    this._object = object;
    object.pin()
  }

  /**
   * Create a ParsePointer to this ParseObject
   * @returns A ParsePointer to this ParseObject
   */
  toPointer(): ParsePointer {
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
  equals(that: ParseObject<A>): boolean {
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


  /** ObjectId for this object */
  get id(): A["objectId"] {
    return this._object.id || (this._object as any).objectId;
  }

  /** Date that the object was saved to the db */
  get createdAt(): A["createdAt"] {
    return this._object.createdAt;
  }

  /** Date that the object was last updated in the db */
  get updatedAt(): A["updatedAt"] {
    return this._object.updatedAt;
  }
}
