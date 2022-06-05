import Parse from "parse";
import Object, { Attributes } from "./ParseObject";

/** Interface defining an Image */
export interface Image extends Attributes {
  /** The actual saved file */
  file: Parse.File;
  /** Whether the image is the selected cover image for the album */
  isCoverImage: boolean;
}

/**
 * Class wrapping the Parse.Image class and providing convenience methods/properties
 */
export class ParseImage extends Object<Image> {
  static fromAttributes(attributes: Image) {
    return new ParseImage(new Parse.Object<Image>("Image", attributes));
  }

  static COLUMNS: { [key: string]: string } = {
    ...Object.COLUMNS,
    file: "file",
    isCoverImage: "isCoverImage",
  };

  _image: Parse.Object<Image>;

  constructor(image: Parse.Object<Image>) {
    super(image);
    this._image = image;
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
}
