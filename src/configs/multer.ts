import multer from "multer";
import { Request } from "express";
import cloudinary from "./cloudinary";
import path from "path";


// const storage = multer.diskStorage({
// 	filename: (req, file, cb) => {
// 		cb(null, Date.now() + "-" + file.originalname);
// 	}
// });

//const storage = multer.memoryStorage();
const storage = multer.diskStorage({
   
    destination: function (req, file, cb) {
        console.log("inside the multer")
      cb(null, "src/uploads/"); 
    },
    
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      ); 
    },
  });
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(new  Error("Invalid file type! Only JPEG & PNG are allowed"), false);
	}
};
console.log(fileFilter,"filefilter")

export const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
    
  // const imgPath=req.file.path
// Function to upload file to Cloudinary
export const uploadToCloudinary = (file: Express.Multer.File) => {
    return new Promise((resolve, reject) => {
        const base64String = file.buffer.toString('base64');
        cloudinary.uploader.upload(base64String, (result: any) => {
            if (!result || result.error) {
                reject(result.error);
            } else {
                resolve(result.url);
            }
        });
    });
};