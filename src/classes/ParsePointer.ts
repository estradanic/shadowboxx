import Parse from "parse";

export type ClassName = "Album" | "Image" | "_User" | "_Role" | null;

/**
 * Class wrapping the Parse.Pointer class and providing convenience methods/properties
 */
export default class ParsePointer {
  _pointer: Parse.Pointer;

  constructor(pointer: Parse.Pointer) {
    this._pointer = pointer;
  }

  /** The class that this pointer points to */
  get className(): ClassName {
    return (this._pointer?.className ?? null) as ClassName;
  }

  /** The objectId of the object that this pointer points to */
  get id(): string {
    // The type for Pointer in the parse npm module isn't reliable.
    // Check for either objectId or id here.
    return this._pointer?.objectId ?? (this._pointer as any)?.id ?? "";
  }
}
