import Parse from "parse";
import ParseAlbum from "./ParseAlbum";
import ParseDuplicate from "./ParseDuplicate";
import ParseImage from "./ParseImage";
import ParseObject, { ClassName, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";

/**
 * Class wrapping the Parse.Pointer class and providing convenience methods/properties
 */
export default class ParsePointer<C extends ClassName> {
  _pointer: Parse.Pointer;

  constructor(pointer: Parse.Pointer) {
    this._pointer = pointer;
  }

  async fetch<P extends ParseObject<C>>(online: boolean = true): Promise<P> {
    const query = new Parse.Query<Parse.Object<ParsifyPointers<C>>>(this.className);
    if (!online) {
      query.fromLocalDatastore();
    }
    const fetchedObject = await query.get(this.id);
    switch (this.className) {
      case "Image":
        return new ParseImage(fetchedObject as Parse.Object<ParsifyPointers<"Image">>) as unknown as P;
      case "Duplicate":
        return new ParseDuplicate(fetchedObject as Parse.Object<ParsifyPointers<"Duplicate">>) as unknown as P;
      case "_User":
        return new ParseUser(fetchedObject as Parse.User<ParsifyPointers<"_User">>) as unknown as P;
      case "Album":
        return new ParseAlbum(fetchedObject as Parse.Object<ParsifyPointers<"Album">>) as unknown as P;
      default:
        return new ParseObject(await query.get(this.id)) as P;
    }
  }

  /** The class that this pointer points to */
  get className(): C {
    return this._pointer.className as C;
  }

  /** The objectId of the object that this pointer points to */
  get id(): string {
    // The type for Pointer in the parse npm module isn't reliable.
    // Check for either objectId or id here.
    return this._pointer?.objectId ?? (this._pointer as any)?.id ?? "";
  }
}
