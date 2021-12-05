import Parse from "parse";
import Object from "./ParseObject";

/** Interface defining an Image */
export interface Image {
  /** The actual saved file */
  file: Parse.File;
  /** Whether the image is the selected cover image for the album */
  isCoverImage: boolean;
}

// TODO ADD GETTERS AND SETTERS
export class ParseImage extends Object<Image> {}
