export default interface GetImageReturn {
  base64: string;
  mimeType: "image/webp" | "image/png" | "image/gif" | "video/mp4";
}
