import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { useridGetting } from "../middlewares/doctorAuth";
import DoctorUsecases from "../usecases/doctor.Usecases";
//import DoctorController from '../controller/doctor.contoller';
import DoctorController from "../controller/doctor.Contoller";
import DoctorRepository from "../repositories/doctor.Repository";
import OtpRepository from "../repositories/otpRepository";
import { resolve } from "path/win32";
import tokenRepository from "../repositories/tokenRepository";
import { protectDoctor } from "../middlewares/authMiddleware";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage, Options } from "multer-storage-cloudinary";
import { upload, uploadToCloudinary } from "../configs/multer";
import { protect } from "../middlewares/authMiddleware";
//const multer = require('multer');

const Router = express.Router();
const doctorRepository = new DoctorRepository();
const otpRepository = new OtpRepository();
const tokenrepository = new tokenRepository();
const doctorUsecase = new DoctorUsecases(
  doctorRepository,
  otpRepository,
  tokenrepository
);
const doctorcontroller = new DoctorController(doctorUsecase);



Router.post("/register", (req: Request, res: Response) => {
  console.log(req.body, "doctor  router");
  doctorcontroller.createUser(req, res);
});
Router.post("/register/google", (req: Request, res: Response) => {
  doctorcontroller.googleAuthentication(req, res);
});

Router.post("/otp", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");

  doctorcontroller.sendOTP(req, res);
});
Router.post("/otp/verify", (req: Request, res: Response) => {
  console.log(req.body, "from router");
  doctorcontroller.verifyOTP(req, res);
});

Router.post("/login", (req: Request, res: Response) => {
  console.log(req.header, "Request header");
  doctorcontroller.loginUser(req, res);
});
Router.post("/forgotpassword", (req: Request, res: Response) => {
  doctorcontroller.sendEmail(req, res);
});
Router.post("/changepassword", (req: Request, res: Response) => {
  doctorcontroller.sendEmail(req, res);
});
Router.patch("/Updatepassword", (req: Request, res: Response) => {
  doctorcontroller.resetPassword(req, res);
});
Router.get("/profiledata", protectDoctor, (req: Request, res: Response) => {
  doctorcontroller.profiledata(req, res);
});
Router.put("/profileEdit", protectDoctor, (req: Request, res: Response) => {
  doctorcontroller.profileEdit(req, res);
});
Router.get("/getdoctordata", (req: Request, res: Response) => {
  doctorcontroller.doctorData(req, res);
});
Router.post(
  "/uploadImage",
  protectDoctor,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      console.log("inside the upload router");
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      } else {
        console.log(req.file?.path, "image");
        doctorcontroller.uploadImage(req, res);
      }

      //const imageUrl = await uploadToCloudinary(req.file);
      // res.status(200).json({ success: true, imageUrl });
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

Router.post("/addtimeslot", protectDoctor, (req: Request, res: Response) => {
  console.log(req.body, "requsted body");
  doctorcontroller.addTimeslot(req, res);
});
Router.get("/getAvailSlots", protectDoctor, (req: Request, res: Response) => {
  const date = req.query.date;
  console.log(date, "inside the router");
  doctorcontroller.getAvailSlots(req, res);
});

Router.get("/getBookedSlots", protectDoctor, (req: Request, res: Response) => {
  doctorcontroller.getBookedSlots(req, res);
});
Router.get("/getAppointments", (req: Request, res: Response) => {
  doctorcontroller.getAppointments(req, res);
});

// Router.get('/profileedit/:userId',upload.single('profilePic'),(req:Request,res:Response)=>{
//   console.log(req.body)
//   doctorcontroller.profileEdit(req,res)

// })
Router.get('/todaysAppointment',protectDoctor,(req:Request,res:Response)=>{
  doctorcontroller.todayAppointment(req,res)
})

Router.patch('/cancelAppointment/:id',(req:Request,res:Response)=>{
  doctorcontroller.cancelAppointment(req,res)
})
Router.patch('/confirmAppointment/:id',(req:Request,res:Response)=>{
  doctorcontroller.confirmAppointment(req,res)
})
Router.get('/getStatus/:id',(req:Request,res:Response)=>{
  doctorcontroller.getStatus(req,res)
})
export default Router;
