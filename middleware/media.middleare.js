import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadMiddleware = upload.array("files", 12);

export default uploadMiddleware;
 