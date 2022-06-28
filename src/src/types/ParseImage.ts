import Parse from "parse";
import ParsePointer from "./ParsePointer";
import ParseObject, { Attributes, ParsifyPointers } from "./ParseObject";

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
    return !this.file?.name() && !that?.file?.name()
      ? 0
      : !this.file?.name()
      ? 1
      : !that?.file?.name()
      ? -1
      : this.isCoverImage
      ? -1
      : that.isCoverImage
      ? 1
      : this.file?.name().localeCompare(that.file?.name()!);
  }

  async save() {
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
