import Parse from "parse";
import Object, { Attributes } from "./ParseObject";

/** Interface defining an Image */
export interface Image extends Attributes {
  /** The actual saved file */
  file: Parse.File;
  /** Whether the image is the selected cover image for the album */
  isCoverImage: boolean;
}

export class ParseImage extends Object<Image> {
  static fromAttributes(attributes: Image) {
    return new ParseImage(new Parse.Object<Image>("Image", attributes));
  }

  image: Parse.Object<Image>;

  constructor(image: Parse.Object<Image>) {
    super(image);
    this.image = image;
  }

  async save() {
    return new ParseImage(await this.image.save());
  }

  async destroy() {
    return await this.image.destroy();
  }

  get file(): Parse.File {
    return this.image.get("file");
  }

  set file(file) {
    this.image.set("file", file);
  }

  get isCoverImage(): boolean {
    return this.image.get("isCoverImage");
  }

  set isCoverImage(isCoverImage) {
    this.image.set("isCoverImage", isCoverImage);
  }
}
