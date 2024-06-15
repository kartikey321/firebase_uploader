import firebaseAdmin from "../config/firebase.js";
import sharp from "sharp";
class MediaService {
  static async uploadMedia(files, directoryPaths, qualities = []) {
    const bucket = firebaseAdmin.storage().bucket();
    const urls = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let directoryPath = directoryPaths[i];
      let quality = qualities[i] !== undefined ? qualities[i] : 100; // Default quality to 100 if not specified

      // Determine the new file name
      const isImage = file.mimetype.startsWith("image/");
      const newFileName =
        isImage && quality < 100
          ? `${file.originalname.split(".")[0]}.png`
          : file.originalname;

      const blob = bucket.file(`${directoryPath}/${newFileName}`);
      console.log(`path:  ${directoryPath}/${newFileName}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: isImage && quality < 100 ? "image/png" : file.mimetype,
        },
      });

      const urlPromise = new Promise(async (resolve, reject) => {
        try {
          if (isImage && quality < 100) {
            // Resize and convert to PNG with specified quality
            const processedBuffer = await sharp(file.buffer)
              .png({ quality: quality })
              .toBuffer();
            blobStream.end(processedBuffer);
          } else {
            // If not an image or quality is 100, just upload the file as is
            blobStream.end(file.buffer);
          }

          blobStream.on("error", (err) => {
            console.error("Stream error:", err);
            reject(err);
          });

          blobStream.on("finish", async () => {
            try {
              await blob.makePublic();
              const url = blob.publicUrl();
              urls.push(url);
              resolve(url);
            } catch (err) {
              console.error(
                "Error making the file public or generating the URL:",
                err
              ); // Log errors
              reject(err);
            }
          });
        } catch (err) {
          console.error("Sharp processing error:", err); // Log errors from sharp processing
          reject(err);
        }
      });

      await urlPromise.catch((err) => console.error("Promise error:", err)); // Catch and log promise errors
    }

    return urls;
  }
  static async delete(filePaths) {
    var bucket = firebaseAdmin.storage().bucket();

    // Iterate over each file path and delete the file
    console.log(filePaths);
    await Promise.all(
      filePaths.map(async (filePath) => {
        var file = bucket.file(filePath);
        await file.delete();
      })
    );
  }

  static async move(files) {
    const bucket = firebaseAdmin.storage().bucket();
    const urls = [];

    try {
      for (const file of files) {
        const { originalPath, destinationPath } = file;
        const file1 = bucket.file(originalPath);
        await file1.move(destinationPath);
        console.log(
          `Successfully moved file from ${originalPath} to ${destinationPath}`
        );

        const newFile = bucket.file(destinationPath);
        await newFile.makePublic();
        const url = newFile.publicUrl();
        urls.push(url);
      }
      return urls;
    } catch (error) {
      console.error("Error moving files: ", error);
      throw error;
    }
  }
}

export default MediaService;
