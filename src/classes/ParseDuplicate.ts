import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, {Attributes, Columns, ParsifyPointers} from "./ParseObject";

/** Interface defining Duplicate-specific attributes */
export interface DuplicateAttributes {
  /** User that owns image1 and image2 */
  owner: ParsePointer<"Duplicate">,
  /** The first image */
  image1: ParsePointer<"Duplicate">,
  /** The second image */
  image2: ParsePointer<"Duplicate">,
  /** How similar the images are (0 - 1) */
  similarity: number,
  /** Whether the duplicate has been acknowledged by the user */
  acknowledged: boolean,
}

class DuplicateColumns extends Columns {
  owner = "owner" as const;
  image1 = "image1" as const;
  image2 = "image2" as const;
  similarity = "similarity" as const;
  acknowledged = "acknowledged" as const;
}

/**
 * Class wrapping the Parse.Duplicate class and providing convenience methods/properties
 */
export default class ParseDuplicate extends ParseObject<"Duplicate"> {
  static COLUMNS = new DuplicateColumns();

  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<"Duplicate">>>("Duplicate");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<"Duplicate">>>("Duplicate").fromLocalDatastore();
  }

  _duplicate: Parse.Object<ParsifyPointers<"Duplicate">>;

  constructor(duplicate: Parse.Object<ParsifyPointers<"Duplicate">>) {
    super(duplicate);
    this._duplicate = duplicate;
  }

  async acknowledge() {
    this._duplicate.set(ParseDuplicate.COLUMNS.acknowledged, true);
    await this._duplicate.save();
  }

  /** User that owns image1 and image2 */
  get owner(): Attributes<"Duplicate">["owner"] {
    return new ParsePointer(this._duplicate.get(ParseDuplicate.COLUMNS.owner));
  }

  /** User that owns image1 and image2 */
  get image1(): Attributes<"Duplicate">["image1"] {
    return new ParsePointer(this._duplicate.get(ParseDuplicate.COLUMNS.image1));
  }

  /** The second image */
  get image2(): Attributes<"Duplicate">["image2"] {
    return new ParsePointer(this._duplicate.get(ParseDuplicate.COLUMNS.image2));
  }

  /** How similar the images are (0 - 1) */
  get similarity(): Attributes<"Duplicate">["similarity"] {
    return this._duplicate.get(ParseDuplicate.COLUMNS.similarity);
  }

  /** Whether the duplicate has been acknowledged by the user */
  get acknowledged(): Attributes<"Duplicate">["acknowledged"] {
    return this._duplicate.get(ParseDuplicate.COLUMNS.acknowledged);
  }

  get attributes(): Attributes<"Duplicate"> {
    return {
      ...this._duplicate.attributes,
      image1: this.image1,
      image2: this.image2,
      owner: this.owner,
    }
  }
}
