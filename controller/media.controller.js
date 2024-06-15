import MediaService from "../services/media.service.js";
class MediaController {
  static async uploadMedia(req, res) {
    const files = req.files;
    const directoryPaths = req.body.directory; // Extract directory path from the request body
    const qualities = req.body.qualities;
   
    if (!files) {
      return res.status(400).send({ error: "No files uploaded." });
    }

    try {
      const mediaArray = await MediaService.uploadMedia(
        files,
        directoryPaths,
        qualities
      );

      res
        .status(200)
        .send({ message: "Files uploaded successfully.", media: mediaArray });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
  static async moveFile(req, res) {
    try {
      await MediaService.move(req.body.files);
      res.status(200).send({
        message: `File moved successfully to path ${req.body.filePath2}.`,
      });
    } catch (error) {
      console.error("Error moving file:", error);
      res.status(500).send({
        error: `An error occurred while moving the file.  ${error}`,
      });
    }
  }
  static async delete(req, res) {
    var filePaths = req.body.filePaths;

    try {
      // Initialize the Firebase Admin SDK
      await MediaService.delete(filePaths);

      res.status(200).send({ message: "File deleted successfully." });
    } catch (error) {
      console.log("Error deleting file:", error);
      console.error("Error deleting file:", error);
      res.status(500).send({
        error: `An error occurred while deleting the file.  ${error}`,
      });
    }
  }
}

export default MediaController;
