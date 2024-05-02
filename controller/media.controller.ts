import MediaService from "../services/media.service.js";
import { Request, Response } from "express";
class MediaController {
  static async uploadMedia(req: any, res: any) {
    const files = req.files;
    const directoryPath = req.body.directory; // Extract directory path from the request body
    console.log(req.files);
    console.log(req.body.directory);
    if (!files) {
      return res.status(400).send({ error: "No files uploaded." });
    }

    try {
      const mediaArray = await MediaService.uploadMedia(files, directoryPath);

      res
        .status(200)
        .send({ message: "Files uploaded successfully.", media: mediaArray });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }
  static async delete(req: any, res: any) {
    var filePath = req.body.filePath;

    try {
      // Initialize the Firebase Admin SDK
      await MediaService.delete(filePath);

      res.status(200).send({ message: "File deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting file:", error);
      res
        .status(500)
        .send({
          error: `An error occurred while deleting the file.  ${error}`,
        });
    }
  }
}

export default MediaController;
