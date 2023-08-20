/** Return value of the getImage cloud function */
export default interface GetImageReturn {
  /** Image data in base64 */
  base64: string;
  /** Mime-type of the image */
  mimeType: "image/webp" | "image/png" | "image/gif" | "video/mp4";
}
