import Parse from "parse";

export interface Attributes {
  /** Unique id of the object in the database */
  objectId?: string;
  /** Date object is first persisted to the database */
  createdAt?: Date;
  /** Date object has been last updated in the database */
  updatedAt?: Date;

  [key: string]: any;
}

export default class Object<A extends Attributes = Attributes> {
  object: Parse.Object<A>;

  constructor(object: Parse.Object<A>) {
    this.object = object;
  }

  toPointer(): Parse.Pointer {
    return this.object.toPointer();
  }

  get attributes(): A {
    return this.object.attributes;
  }

  get objectId(): A["objectId"] {
    return this.object.id;
  }

  get createdAt(): A["createdAt"] {
    return this.object.createdAt;
  }

  get updatedAt(): A["updatedAt"] {
    return this.object.updatedAt;
  }
}
