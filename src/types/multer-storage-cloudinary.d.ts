declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";
  import { ConfigOptions, UploadApiOptions } from "cloudinary";

  interface CloudinaryStorageOptions {
    cloudinary: ConfigOptions;
    params?: UploadApiOptions | ((req: Request, file: Express.Multer.File) => UploadApiOptions);
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile: (req: any, file: any, cb: any) => void;
    _removeFile: (req: any, file: any, cb: any) => void;
  }
}