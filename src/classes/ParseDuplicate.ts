import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, {Attributes, ParsifyPointers} from "./ParseObject";

/** Interface defining a Duplicate */
export interface Duplicate extends Attributes {
  /** User that owns image1 and image2 */
  owner: ParsePointer,
  /** The first image */
  image1: ParsePointer,
  /** The second image */
  image2: ParsePointer,
  /** How similar the images are (0 - 1) */
  similarity: number,
  /** Whether the duplicate has been acknowledged by the user */
  acknowledged: boolean,
  /** The objectId of the duplicate.
   * Overridden here to be required because these are never created on the frontend
   */
  objectId: string,
}

/**
 * Class wrapping the Parse.Duplicate class and providing convenience methods/properties
 */
export default class ParseDuplicate extends ParseObject<Duplicate> {
  static COLUMNS = {
    ...ParseObject.COLUMNS,
    owner: "owner",
    image1: "image1",
    image2: "image2",
    similarity: "similarity",
    acknowledged: "acknowledged",
  };

  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<Duplicate>>>("Duplicate");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<Duplicate>>>("Duplicate").fromLocalDatastore();
  }

  _duplicate: Parse.Object<ParsifyPointers<Duplicate>>;
  _isDuplicate: boolean;

  constructor(duplicate: Parse.Object<ParsifyPointers<Duplicate>>) {
    super(duplicate);
    this._duplicate = duplicate;
    this._isDuplicate = false;
  }

  async acknowledge() {
    this._duplicate.set(ParseDuplicate.COLUMNS.acknowledged, true);
    await this._duplicate.save();
  }

  /** User that owns image1 and image2 */
  get owner(): Duplicate["owner"] {
    return new ParsePointer(this._duplicate.get(ParseDuplicate.COLUMNS.owner));
  }

  /** User that owns image1 and image2 */
  get image1(): Duplicate["image1"] {
    return new ParsePointer(this._duplicate.get(ParseDuplicate.COLUMNS.image1));
  }

  /** The second image */
  get image2(): Duplicate["image2"] {
    return new ParsePointer(this._duplicate.get(ParseDuplicate.COLUMNS.image2));
  }

  /** How similar the images are (0 - 1) */
  get similarity(): Duplicate["similarity"] {
    return this._duplicate.get(ParseDuplicate.COLUMNS.similarity);
  }

  /** Whether the duplicate has been acknowledged by the user */
  get acknowledged(): Duplicate["acknowledged"] {
    return this._duplicate.get(ParseDuplicate.COLUMNS.acknowledged);
  }

  /** The objectId. Overridden because these are always retrieved from the db */
  get id(): Duplicate["objectId"] {
    return this._duplicate.id;
  }

  get attributes(): Duplicate {
    return {
      ...this._duplicate.attributes,
      image1: this.image1,
      image2: this.image2,
      owner: this.owner,
    }
  }
}
