import Parse from "parse";

/** Interface defining an Image */
export default interface Image {
  /** Unique Id of the image in the database */
  objectId?: string,
  /** The actual saved file */
  file: Parse.File,
  /** Whether the image is the selected cover image for the album */
  isCoverImage: boolean,
}
