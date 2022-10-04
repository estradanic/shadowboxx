import Parse from "parse";
import { removeExtension } from "../utils";
import ParsePointer from "./ParsePointer";
import ParseObject, { Attributes, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";

/** Interface defining an Image */
export interface Image extends Attributes {
  /** The actual saved file */
  file: Parse.File;
  /** User that owns this picture */
  owner: ParsePointer;
  /** Name of the image */
  name: string;
}

/**
 * Class wrapping the Parse.Image class and providing convenience methods/properties
 */
export default class ParseImage extends ParseObject<Image> {

  /**
   * Create a new image from attributes
   * @param attributes Attributes to create the image with
   * @returns The created image
   */
  static fromAttributes(attributes: Image): ParseImage {
    const newAttributes: ParsifyPointers<Image> = {
      ...attributes,
      owner: attributes.owner._pointer,
      name: attributes.name,
    };
    return new ParseImage(
      new Parse.Object<ParsifyPointers<Image>>("Image", newAttributes)
    );
  }

  /**
   * Get a Parse.Query for the "Image" class
   * @param online Whether to query online or not, defaults to true
   * @returns Parse.Query for the "Image" class
   */
  static query(online = true) {
    if (online) {
      return new Parse.Query<Parse.Object<ParsifyPointers<Image>>>("Image");
    }
    return new Parse.Query<Parse.Object<ParsifyPointers<Image>>>("Image").fromLocalDatastore();
  }

  /**
   * Sort a list of images by default compareTo or coverImage if given
   * @param images List of images to sort
   * @param coverImage Image to sort to the top
   * @returns Sorted list of images
   */
  static sort(images: ParseImage[], coverImage?: ParsePointer): ParseImage[] {
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
  static COLUMNS = {
    ...ParseObject.COLUMNS,
    file: "file",
    owner: "owner",
    name: "name",
    fileThumb: "fileThumb",
    fileMobile: "fileMobile",
    fileLegacy: "fileLegacy",
  };

  _image: Parse.Object<ParsifyPointers<Image>>;

  constructor(image: Parse.Object<ParsifyPointers<Image>>) {
    super(image);
    this._image = image;
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
    return new ParseImage(await this._image.save());
  }

  /** The actual saved file */
  get file(): Parse.File {
    return this._image.get(ParseImage.COLUMNS.file);
  }

  set file(file) {
    this._image.set(ParseImage.COLUMNS.file, file);
  }

  /** Thumbnail size of the file */
  get fileThumb(): Parse.File {
    return (
      this._image.get(ParseImage.COLUMNS.fileThumb) ??
      this.fileMobile ??
      this.file
    );
  }

  /** Mobile size of the file (700px max edge) */
  get fileMobile(): Parse.File {
    return this._image.get(ParseImage.COLUMNS.fileMobile) ?? this.file;
  }

  /** PNG version of the file for mobile Safari and IE */
  get fileLegacy(): Parse.File | undefined {
    return this._image.get(ParseImage.COLUMNS.fileLegacy);
  }

  /** Pointer to user who owns the image */
  get owner(): Image["owner"] {
    return new ParsePointer(this._image.get(ParseImage.COLUMNS.owner));
  }

  set owner(owner) {
    this._image.set(ParseImage.COLUMNS.owner, owner._pointer);
  }

  /** Image name */
  get name(): Image["name"] {
    return (
      this._image.get(ParseImage.COLUMNS.name) ??
      removeExtension(this.file.name())
    );
  }

  set name(name) {
    this._image.set(ParseImage.COLUMNS.name, name);
  }

  /** All attributes of the image */
  get attributes(): Image {
    return {
      ...this._image.attributes,
      owner: this.owner,
    }
  }
}
