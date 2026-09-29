// src/middleware/upload.ts
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ storage });


// Set up multer to handle up to 10 files with a maximum size of 10MB each
// export const upload = multer({
//   storage: storage,
//   limits: {
//     files: 10,
//     fileSize: 10 * 1024 * 1024, // 10MB
//   },
// });
