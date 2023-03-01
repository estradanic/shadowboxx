import Parse from "parse";
import { removeExtension } from "../utils";
import ParsePointer from "./ParsePointer";
import ParseObject, {
  Attributes,
  Columns,
  ParsifyPointers,
} from "./ParseObject";
import ParseUser from "./ParseUser";

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
  /** User that owns this picture */
  owner: ParsePointer<"_User">;
  /** Name of the image */
  name: string;
  /** Date that the image was taken */
  dateTaken?: Date;
  /** Hash of the image for comparisons */
  hash?: string;
}

class ImageColumns extends Columns {
  file = "file" as const;
  owner = "owner" as const;
  name = "name" as const;
  fileMobile = "fileMobile" as const;
  fileThumb = "fileThumb" as const;
  fileLegacy = "fileLegacy" as const;
  dateTaken = "dateTaken" as const;
  hash = "hash" as const;
}

/**
 * Class wrapping the Parse.Image class and providing convenience methods/properties
 */
export default class ParseImage extends ParseObject<"Image"> {
  /**
   * Get a Parse.Query for the "Image" class
   * @param online Whether to query online or not, defaults to true
   * @returns Parse.Query for the "Image" class
   */
  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<"Image">>>("Image");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<"Image">>>(
      "Image"
    ).fromLocalDatastore();
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
        if (a.id === coverImage.id) {
          return -1;
        }
        if (b.id === coverImage.id) {
          return 1;
        }
        return a.compareTo(b);
      });
    }
    return [...images].sort((a, b) => a.compareTo(b));
  }

  /**
   * Columns for the "Image" class
   */
  static COLUMNS = new ImageColumns();

  private _image: Parse.Object<ParsifyPointers<"Image">>;

  constructor(image: Parse.Object<ParsifyPointers<"Image">>) {
    super(image);
    this._image = image;
    this.pin();
  }

  /**
   * Compare to another image
   * @param image Image to compare to
   * @returns 0 if equal, -1 if this image is less than the other, 1 if this image is greater than the other
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
  async save() {
    if (!this._image.getACL()) {
      const owner = await ParseUser.query().get(this.owner.id);
      const acl = new Parse.ACL(owner);
      this._image.setACL(acl);
    }
    if (!this.dateTaken) {
      this.dateTaken = new Date();
    }
    return new ParseImage(await this._image.save());
  }

  /** The actual saved file */
  get file(): Attributes<"Image">["file"] {
    return this._image.get(ParseImage.COLUMNS.file);
  }

  set file(file) {
    this._image.set(ParseImage.COLUMNS.file, file);
  }

  /** Thumbnail size of the file */
  get fileThumb(): Attributes<"Image">["fileThumb"] {
    return (
      this._image.get(ParseImage.COLUMNS.fileThumb) ??
      this.fileMobile ??
      this.file
    );
  }

  /** Mobile size of the file (700px max edge) */
  get fileMobile(): Attributes<"Image">["fileMobile"] {
    return this._image.get(ParseImage.COLUMNS.fileMobile) ?? this.file;
  }

  /** PNG version of the file for mobile Safari and IE */
  get fileLegacy(): Attributes<"Image">["fileLegacy"] {
    return this._image.get(ParseImage.COLUMNS.fileLegacy);
  }

  /** Pointer to user who owns the image */
  get owner(): Attributes<"Image">["owner"] {
    return new ParsePointer(this._image.get(ParseImage.COLUMNS.owner));
  }

  set owner(owner) {
    this._image.set(ParseImage.COLUMNS.owner, owner.toNativePointer());
  }

  /** Image name */
  get name(): Attributes<"Image">["name"] {
    return (
      this._image.get(ParseImage.COLUMNS.name) ??
      removeExtension(this.file.name())
    );
  }

  set name(name) {
    this._image.set(ParseImage.COLUMNS.name, name);
  }

  /** Date that the image was taken */
  get dateTaken(): Required<Attributes<"Image">>["dateTaken"] {
    return this._image.get(ParseImage.COLUMNS.dateTaken) ?? this.createdAt;
  }

  set dateTaken(dateTaken) {
    this._image.set(ParseImage.COLUMNS.dateTaken, dateTaken);
  }

  /** All attributes of the image */
  get attributes(): Attributes<"Image"> {
    return {
      ...this._image.attributes,
      owner: this.owner,
    };
  }
}

export interface UnpersistedParseImageAttributes
  extends Omit<ImageAttributes, "fileMobile" | "fileLegacy" | "fileThumb"> {}

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

  get id(): Attributes<"Image">["objectId"] {
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
