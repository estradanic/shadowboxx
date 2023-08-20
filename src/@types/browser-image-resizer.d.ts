declare module "browser-image-resizer" {
  type ImageResizerConfig = {
    /** The quality of the image (default: 0.5) */
    quality?: number;
    /** The maximum width for the downscaled image (default: 800) */
    maxWidth?: number;
    /** Th emaximum height for the downscaled image (default: 600) */
    maxHeight?: number;
    /** Reads EXIF data on the image to determine orientation (default: true) */
    autoRotate?: boolean;
    /** console.log image update operations (default: false) */
    debug?: boolean;
    /** Specify image output type (default "image/jpeg") */
    mimeType?: "image/jpeg" | "image/png" | "image/webp";
  };
  const readAndCompressImage: (
    /** A File object, usually from an <input> */
    file: File,
    /** Configuration options */
    config: ImageResizerConfig
  ) => Promise<File>;

  export { readAndCompressImage };
}
