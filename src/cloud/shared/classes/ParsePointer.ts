import Parse from "parse";
import { getObjectId } from "../utils";
import ParseAlbum from "./ParseAlbum";
import ParseDuplicate from "./ParseDuplicate";
import ParseImage from "./ParseImage";
import ParseObject, { ClassName, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";

/**
 * Class wrapping the Parse.Pointer class and providing convenience methods/properties
 */
export default class ParsePointer<C extends ClassName> {
  private _pointer: Parse.Pointer;

  constructor(pointer: Parse.Pointer) {
    this._pointer = pointer;
  }

  /**
   * Fetch the object pointed to by this pointer. For client code only.
   * @param online Whether to fetch online with local datastore
   * @returns The object pointed to by this pointer
   */
  async fetch<P extends ParseObject<C>>(online: boolean = true): Promise<P> {
    const query = new Parse.Query<Parse.Object<ParsifyPointers<C>>>(
      this.className
    );
    if (!online) {
      query.fromLocalDatastore();
    }
    const fetchedObject = await query.get(this.id);
    switch (this.className) {
      case "Image":
        return new ParseImage(
          fetchedObject as Parse.Object<ParsifyPointers<"Image">>
        ) as unknown as P;
      case "Duplicate":
        return new ParseDuplicate(
          fetchedObject as Parse.Object<ParsifyPointers<"Duplicate">>
        ) as unknown as P;
      case "_User":
        return new ParseUser(
          fetchedObject as Parse.User<ParsifyPointers<"_User">>
        ) as unknown as P;
      case "Album":
        return new ParseAlbum(
          fetchedObject as Parse.Object<ParsifyPointers<"Album">>
        ) as unknown as P;
      default:
        return new ParseObject(await query.get(this.id)) as P;
    }
  }

  /**
   * Fetch the object pointed to by this pointer. For cloud code only.
   * @param parse instance of Parse
   * @returns The object pointed to by this pointer
   */
  async cloudFetch<P extends ParseObject<C>>(parse: typeof Parse): Promise<P> {
    const query = new parse.Query<Parse.Object<ParsifyPointers<C>>>(
      this.className
    );
    const fetchedObject = await query.get(this.id);
    switch (this.className) {
      case "Image":
        return new ParseImage(
          fetchedObject as Parse.Object<ParsifyPointers<"Image">>,
          true,
        ) as unknown as P;
      case "Duplicate":
        return new ParseDuplicate(
          fetchedObject as Parse.Object<ParsifyPointers<"Duplicate">>,
        ) as unknown as P;
      case "_User":
        return new ParseUser(
          fetchedObject as Parse.User<ParsifyPointers<"_User">>,
          true,
        ) as unknown as P;
      case "Album":
        return new ParseAlbum(
          fetchedObject as Parse.Object<ParsifyPointers<"Album">>,
          true,
        ) as unknown as P;
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
    return getObjectId(this._pointer);
  }

  toNativePointer(): Parse.Pointer {
    return this._pointer;
  }
}
