import Parse from "parse";
import Pointer from "./ParsePointer";

export interface Attributes {
  /** Unique id of the object in the database */
  objectId?: string;
  /** Date object is first persisted to the database */
  createdAt?: Date;
  /** Date object has been last updated in the database */
  updatedAt?: Date;

  [key: string]: any;
}

/**
 * Class wrapping the Parse.Object class and providing convenience methods/properties
 */
export default class ParseObject<A extends Attributes> {
  static COLUMNS: { [key: string]: string } = {
    id: "objectId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

  _object: Parse.Object<A>;

  constructor(object: Parse.Object<A>) {
    this._object = object;
  }

  toPointer(): Pointer {
    return new Pointer(this._object.toPointer());
  }

  get exists(): boolean {
    return !!this._object;
  }

  get attributes(): A {
    return this._object.attributes;
  }

  get id(): A["objectId"] {
    return this._object.id || (this._object as any).objectId;
  }

  get createdAt(): A["createdAt"] {
    return this._object.createdAt;
  }

  get updatedAt(): A["updatedAt"] {
    return this._object.updatedAt;
  }
}
