import { Express } from "express";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;      // un seul fichier
      files?: Express.Multer.File[];   // plusieurs fichiers
    }
  }
}
