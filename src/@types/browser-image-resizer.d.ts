declare module "browser-image-resizer" {
  type ImageResizerConfig = {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    autoRotate?: boolean;
    debug?: boolean;
    mimeType?: "image/jpeg" | "image/png" | "image/webp";
  };
  const readAndCompressImage: (
    file: File,
    config: ImageResizerConfig
  ) => Promise<File>;

  export { readAndCompressImage };
}
