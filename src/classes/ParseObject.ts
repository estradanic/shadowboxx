import Parse from "parse";
import ParsePointer from "./ParsePointer";

export interface Attributes {
  /** Unique id of the object in the database */
  objectId?: string;
  /** Date object is first persisted to the database */
  createdAt?: Date;
  /** Date object has been last updated in the database */
  updatedAt?: Date;

  [key: string]: any;
}

export type ParsifyPointers<A extends Attributes> = {
  [key in keyof A]: A[key] extends ParsePointer | undefined
    ? Parse.Pointer
    : A[key];
};

export const isPointer = (candidate: any) => {
  if (candidate === null || candidate === undefined) {
    return false;
  }
  return !!candidate.className && !candidate.exists;
};

/**
 * Class wrapping the Parse.Object class and providing convenience methods/properties
 */
export default class ParseObject<A extends Attributes> {
  static COLUMNS: { [key: string]: string } = {
    id: "objectId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };

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

  toPointer(): ParsePointer {
    return new ParsePointer(this._object.toPointer());
  }

  toNativePointer(): Parse.Pointer {
    return this._object.toPointer();
  }

  setACL(acl: Parse.ACL): void {
    this._object.setACL(acl);
  }

  equals(that: ParseObject<A>): boolean {
    return this.id === that.id;
  }

  hashString(): string {
    return this.id ?? "";
  }

  get exists(): boolean {
    return !!this._object;
  }

  get attributes(): A {
    const attributes: any = {};
    for (const key in this._object.attributes) {
      if (isPointer(this._object.attributes[key])) {
        attributes[key] = new ParsePointer(this._object.attributes[key]);
      } else {
        attributes[key] = this._object.attributes[key];
      }
    }
    return attributes;
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
