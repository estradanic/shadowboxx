import Parse from "parse";
import { removeExtension } from "../utils";
import ParsePointer from "./ParsePointer";
import ParseObject, {
  Attributes,
  Columns,
  ParsifyPointers,
} from "./ParseObject";
import ParseUser from "./ParseUser";
import ParseQuery from "./ParseQuery";

export type ImageType = "image" | "video" | "gif";

/** Interface defining Image-specific attributes */
export interface ImageAttributes {
  /** The actual saved file */
  file: Parse.File;
  /** The file resized for mobile */
  fileMobile: Parse.File;
  /** The file resized for thumbnails */
  fileThumb: Parse.File;
  /** The file in png format for older iPhones */
  fileLegacy: Parse.File;
  /** User that owns this image */
  owner: ParsePointer<"_User">;
  /** Name of the image */
  name: string;
  /** Date that the image was taken */
  dateTaken?: Date;
  /** Hash of the image for comparisons */
  hash?: string;
  /** Type of the image */
  type: ImageType;
  /** Tags on the image */
  tags?: string[];
}

type ImageKeys = Required<{
  [key in keyof ImageAttributes]: key;
}>;

class ImageColumns extends Columns implements ImageKeys {
  file = "file" as const;
  owner = "owner" as const;
  name = "name" as const;
  fileMobile = "fileMobile" as const;
  fileThumb = "fileThumb" as const;
  fileLegacy = "fileLegacy" as const;
  dateTaken = "dateTaken" as const;
  hash = "hash" as const;
  type = "type" as const;
  tags = "tags" as const;
}

/**
 * Class wrapping the Parse.Image class and providing convenience methods/properties
 */
export default class ParseImage
  extends ParseObject<"Image">
  implements ImageAttributes
{
  /**
   * Get a Parse.Query for the "Image" class. For client code only.
   * @param online Whether to query online, defaults to true
   * @returns Parse.Query for the "Image" class
   */
  static query(online = true) {
    let nativeQuery;
    if (online) {
      nativeQuery = new Parse.Query<Parse.Object<ParsifyPointers<"Image">>>(
        "Image"
      );
    } else {
      nativeQuery = new Parse.Query<Parse.Object<ParsifyPointers<"Image">>>(
        "Image"
      ).fromLocalDatastore();
    }
    return new ParseQuery(nativeQuery);
  }

  /**
   * Get a Parse.Query for the "Image" class. For cloud code only.
   * @param parse instance of Parse
   * @returns Parse.Query for the "Image" class
   */
  static cloudQuery(parse: typeof Parse) {
    return ParseQuery.for("Image", parse);
  }

  /**
   * Sort a list of images by default compareTo or coverImage if given
   * @param images List of images to sort
   * @param coverImage Image to sort to the top
   * @returns Sorted list of images
   */
  static sort(
    images: ParseImage[],
    coverImage?: ParsePointer<"Image">
  ): ParseImage[] {
    if (coverImage) {
      return [...images].sort((a, b) => {
        if (a.objectId === coverImage.id) {
          return -1;
        }
        if (b.objectId === coverImage.id) {
          return 1;
        }
        return a.compareTo(b);
      });
    }
    return [...images].sort((a, b) => a.compareTo(b));
  }

  /** Columns for the "Image" class */
  static COLUMNS = new ImageColumns();

  private _image: Parse.Object<ParsifyPointers<"Image">>;

  constructor(
    image: Parse.Object<ParsifyPointers<"Image">>,
    noPin: boolean = false
  ) {
    super(image);
    this._image = image;
    if (!noPin) {
      this.pin();
    }
  }

  /**
   * Compare to another image by createdAt date, then name
   * @param image Image to compare to
   */
  compareTo(that: ParseImage): number {
    if (this.createdAt! > that.createdAt!) {
      return -1;
    } else if (this.createdAt! < that.createdAt!) {
      return 1;
    } else {
      return this.name.localeCompare(that.name!);
    }
  }

  /**
   * Save the image
   * @param options Options to pass to Parse.Object.save
   * @returns The saved image
   */
  async save(options?: Parse.Object.SaveOptions) {
    if (!this._image.getACL()) {
      const owner = await ParseUser.cloudQuery(Parse).get(this.owner.id);
      const acl = new Parse.ACL(owner.toNative());
      this._image.setACL(acl);
    }
    if (!this.dateTaken) {
      this.dateTaken = new Date();
    }
    return new ParseImage(await this._image.save(null, options));
  }

  /** Save the image - Only for cloud code */
  async cloudSave(options?: Parse.Object.SaveOptions) {
    if (!this._image.getACL()) {
      const owner = await ParseUser.cloudQuery(Parse).get(this.owner.id);
      const acl = new Parse.ACL(owner.toNative());
      this._image.setACL(acl);
    }
    if (!this.dateTaken) {
      this.dateTaken = new Date();
    }
    return new ParseImage(await this._image.save(null, options), true);
  }

  /** Whether image has been changed */
  dirty(column?: keyof Attributes<"Image">) {
    return this._image.dirty(column);
  }

  get file() {
    return this._image.get(ParseImage.COLUMNS.file);
  }

  set file(file) {
    this._image.set(ParseImage.COLUMNS.file, file);
  }

  get fileThumb() {
    return (
      this._image.get(ParseImage.COLUMNS.fileThumb) ??
      this.fileMobile ??
      this.file
    );
  }

  set fileThumb(fileThumb) {
    this._image.set(ParseImage.COLUMNS.fileThumb, fileThumb);
  }

  get fileMobile() {
    return this._image.get(ParseImage.COLUMNS.fileMobile) ?? this.file;
  }

  set fileMobile(fileMobile) {
    this._image.set(ParseImage.COLUMNS.fileMobile, fileMobile);
  }

  get fileLegacy() {
    if (this.type !== "image") {
      return this.file;
    }
    return this._image.get(ParseImage.COLUMNS.fileLegacy);
  }

  set fileLegacy(fileLegacy) {
    this._image.set(ParseImage.COLUMNS.fileLegacy, fileLegacy);
  }

  get owner() {
    return new ParsePointer<"_User">(this._image.get(ParseImage.COLUMNS.owner));
  }

  set owner(owner) {
    this._image.set(ParseImage.COLUMNS.owner, owner.toNativePointer());
  }

  get name() {
    return (
      this._image.get(ParseImage.COLUMNS.name) ??
      removeExtension(this.file.name())
    );
  }

  set name(name) {
    this._image.set(ParseImage.COLUMNS.name, name);
  }

  get dateTaken() {
    return this._image.get(ParseImage.COLUMNS.dateTaken) ?? this.createdAt;
  }

  set dateTaken(dateTaken) {
    this._image.set(ParseImage.COLUMNS.dateTaken, dateTaken);
  }

  get type() {
    return this._image.get(ParseImage.COLUMNS.type) ?? "image";
  }

  get hash() {
    return this._image.get(ParseImage.COLUMNS.hash);
  }

  set hash(hash) {
    this._image.set(ParseImage.COLUMNS.hash, hash);
  }

  get tags() {
    return this._image.get(ParseImage.COLUMNS.tags);
  }

  set tags(tags) {
    this._image.set(ParseImage.COLUMNS.tags, tags);
  }

  hasBeenResized() {
    return !(this.file =
      this.fileMobile ||
      this.file === this.fileThumb ||
      this.file === this.fileLegacy);
  }

  /** All attributes of the image */
  get attributes(): Attributes<"Image"> {
    return {
      ...this._image.attributes,
      owner: this.owner,
    };
  }
}

/** Class for unpersisted ParseImages */
export class UnpersistedParseImage extends ParseImage {
  constructor(attributes: Partial<Attributes<"Image">> = {}) {
    super(
      // @ts-expect-error
      new Parse.Object<ParsifyPointers<"Image">>("Image", {
        name: "",
        file: new Parse.File("", [0]),
        ...attributes,
        owner: attributes.owner?.toNativePointer() ?? {
          __type: "Pointer",
          className: "_User",
          objectId: "",
        },
      })
    );
  }

  get objectId(): Attributes<"Image">["objectId"] {
    console.warn("Unpersisted image has no id");
    return "";
  }

  get createdAt(): Attributes<"Image">["createdAt"] {
    console.warn("Unpersisted image has no createdAt");
    return new Date();
  }

  get updatedAt(): Attributes<"Image">["updatedAt"] {
    console.warn("Unpersisted image has no updatedAt");
    return new Date();
  }

  get fileLegacy(): Attributes<"Image">["fileLegacy"] {
    console.warn("Unpersisted image has no fileLegacy");
    return new Parse.File("", [0]);
  }

  get fileMobile(): Attributes<"Image">["fileMobile"] {
    console.warn("Unpersisted image has no fileMobile");
    return new Parse.File("", [0]);
  }

  get fileThumb(): Attributes<"Image">["fileThumb"] {
    console.warn("Unpersisted image has no fileThumb");
    return new Parse.File("", [0]);
  }
}
