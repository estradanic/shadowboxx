import Parse from "parse";
import Object from "./ParseObject";

/** Interface defining an Image */
export interface Image {
  /** The actual saved file */
  file: Parse.File;
  /** Whether the image is the selected cover image for the album */
  isCoverImage: boolean;
}

export class ParseImage extends Object<Image> {
  get file(): Parse.File {
    return this.get("file");
  }

  set file(file) {
    this.set("file", file);
  }

  get isCoverImage(): boolean {
    return this.get("isCoverImage");
  }

  set isCoverImage(isCoverImage) {
    this.set("isCoverImage", isCoverImage);
  }
}
