import Parse from "parse";

/**
 * Class wrapping the Parse.Pointer class and providing convenience methods/properties
 */
export default class Pointer {
  _pointer: Parse.Pointer;

  constructor(pointer: Parse.Pointer) {
    this._pointer = pointer;
  }

  get className(): string {
    return this._pointer?.className ?? "";
  }

  get exists(): boolean {
    return !!this._pointer;
  }

  get id(): string {
    // The type for Pointer in the parse npm module isn't reliable.
    // Check for either objectId or id here.
    return this._pointer?.objectId ?? (this._pointer as any)?.id ?? "";
  }
}
