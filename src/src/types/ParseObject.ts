import Parse from "parse";

export interface Attributes {
  /** Unique id of the object in the database */
  objectId?: string;
  /** Date object is first persisted to the database */
  createdAt?: Date;
  /** Date object has been last updated in the database */
  updatedAt?: Date;
}

export default class Object<T> extends Parse.Object<Attributes & T> {
  get objectId(): string | undefined {
    return this.get("objectId");
  }
}
