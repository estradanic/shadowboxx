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

  static NULL = new ParseImage(
    new Parse.Object<ParsifyPointers<Image>>("Image", {
      file: new Parse.File("", []),
      owner: ParsePointer.NATIVE_NULL,
      name: "",
    })
  );

  static query(): Parse.Query<Parse.Object<ParsifyPointers<Image>>> {
    return new Parse.Query<Parse.Object<ParsifyPointers<Image>>>("Image");
  }

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

  static COLUMNS: { [key: string]: string } = {
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

  compareTo(that: ParseImage): number {
    if (this.createdAt! > that.createdAt!) {
      return -1;
    } else if (this.createdAt! < that.createdAt!) {
      return 1;
    } else {
      return this.name.localeCompare(that.name!);
    }
  }

  async save() {
    if (!this._image.getACL()) {
      const owner = await ParseUser.query().get(this.owner.id);
      const acl = new Parse.ACL(owner);
      this._image.setACL(acl);
    }
    return new ParseImage(await this._image.save());
  }

  async destroy() {
    return await this._image.destroy();
  }

  get file(): Parse.File {
    return this._image.get(ParseImage.COLUMNS.file);
  }

  set file(file) {
    this._image.set(ParseImage.COLUMNS.file, file);
  }

  get fileThumb(): Parse.File {
    return (
      this._image.get(ParseImage.COLUMNS.fileThumb) ??
      this.fileMobile ??
      this.file
    );
  }

  get fileMobile(): Parse.File {
    return this._image.get(ParseImage.COLUMNS.fileMobile) ?? this.file;
  }

  get fileLegacy(): Parse.File {
    return this._image.get(ParseImage.COLUMNS.fileLegacy);
  }

  get owner(): Image["owner"] {
    return new ParsePointer(this._image.get(ParseImage.COLUMNS.owner));
  }

  set owner(owner) {
    this._image.set(ParseImage.COLUMNS.owner, owner._pointer);
  }

  get name(): Image["name"] {
    return (
      this._image.get(ParseImage.COLUMNS.name) ??
      removeExtension(this.file.name())
    );
  }

  set name(name) {
    this._image.set(ParseImage.COLUMNS.name, name);
  }
}
