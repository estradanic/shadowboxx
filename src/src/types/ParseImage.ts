import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, { Attributes, ParsifyPointers } from "./ParseObject";
import ParseUser from "./ParseUser";

/** Interface defining an Image */
export interface Image extends Attributes {
  /** The actual saved file */
  file: Parse.File;
  /** Whether the image is the selected cover image for the album */
  isCoverImage: boolean;
  /** User that owns this picture */
  owner: ParsePointer;
}

/**
 * Class wrapping the Parse.Image class and providing convenience methods/properties
 */
export default class ParseImage extends ParseObject<Image> {
  static fromAttributes(attributes: Image): ParseImage {
    const newAttributes: ParsifyPointers<Image> = {
      ...attributes,
      owner: attributes.owner._pointer,
    };
    return new ParseImage(
      new Parse.Object<ParsifyPointers<Image>>("Image", newAttributes)
    );
  }

  static query() {
    return new Parse.Query<Parse.Object<ParsifyPointers<Image>>>("Image");
  }

  static COLUMNS: { [key: string]: string } = {
    ...ParseObject.COLUMNS,
    file: "file",
    isCoverImage: "isCoverImage",
    owner: "owner",
  };

  _image: Parse.Object<ParsifyPointers<Image>>;

  constructor(image: Parse.Object<ParsifyPointers<Image>>) {
    super(image);
    this._image = image;
  }

  compareTo(that: ParseImage): number {
    if (this.isCoverImage) {
      return -1;
    } else if (that.isCoverImage) {
      return 1;
    } else if (this.createdAt! > that.createdAt!) {
      return 1;
    } else if (this.createdAt! < that.createdAt!) {
      return -1;
    } else {
      return this.file?.name().localeCompare(that.file?.name()!);
    }
  }

  async save() {
    if (!this._image.getACL()) {
      const owner = await ParseUser.query()
        .equalTo(ParseUser.COLUMNS.id, this.owner.id)
        .first();
      const acl = new Parse.ACL(owner);
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
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

  get isCoverImage(): boolean {
    return this._image.get(ParseImage.COLUMNS.isCoverImage);
  }

  set isCoverImage(isCoverImage) {
    this._image.set(ParseImage.COLUMNS.isCoverImage, isCoverImage);
  }

  get owner(): Image["owner"] {
    return new ParsePointer(this._image.get(ParseImage.COLUMNS.owner));
  }

  set owner(owner) {
    this._image.set(ParseImage.COLUMNS.owner, owner._pointer);
  }
}
