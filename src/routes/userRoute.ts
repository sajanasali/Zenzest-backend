import express, { Request, Response } from "express";
import userController from "../controller/userController";
import userUsecases from "../usecases/userUsecases";
import UserRepository from "../repositories/userRepository";
import OtpRepository from "../repositories/otpRepository";
import { resolve } from "path/win32";
import tokenRepository from "../repositories/tokenRepository";
import { userAthentication } from "../middlewares/userAuth";
import { protect } from "../middlewares/authMiddleware";
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const Router = express.Router();
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const tokenrepository = new tokenRepository();
const userUsecase = new userUsecases(
  userRepository,
  otpRepository,
  tokenrepository
);
const Usercontroller = new userController(userUsecase);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "careNcure_Uploads",
    resource_type: "auto",
    allowed_formats: ["jpg", "png"],
    transformation: [{ width: "auto", crop: "scale" }],
  },
});

const upload = multer({ storage: storage });
Router.post("/register", (req: Request, res: Response) =>
  Usercontroller.createUser(req, res)
);


Router.post("/otp", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");

  Usercontroller.sendOTP(req, res);
});
Router.post("/otp/verify", (req: Request, res: Response) => {
  console.log(req.body, "from router");
  Usercontroller.verifyOTP(req, res);
});

Router.post("/login", (req: Request, res: Response) => {
  console.log(req.header, "Request header");
  Usercontroller.loginUser(req, res);
});
Router.post("/forgotpassword", (req: Request, res: Response) => {
  Usercontroller.sendEmail(req, res);
});
Router.post("/changepassword", (req: Request, res: Response) => {
  Usercontroller.sendEmail(req, res);
});
Router.patch("/Updatepassword", (req: Request, res: Response) => {
  Usercontroller.resetPassword(req, res);
});

Router.post("/medicalhistory", protect, (req: Request, res: Response) => {
  Usercontroller.medicalhistory(req, res);
});

Router.get("/profile", protect, (req: Request, res: Response) => {
  Usercontroller.profile(req, res);
});
Router.post("/paymentonline", protect, (req: Request, res: Response) => {
  console.log(req.body, "body in payment");
  Usercontroller.StripePayment(req, res);
});
Router.post(
  "/paymentonline/webhook",
  express.raw({ type: "application/json" }),
  (req: Request, res: Response) => {
    console.log("inside the webhookkkkkkkkkkkkkkkkkkkkkkkkkkkk router");
    Usercontroller.webhooks(req, res);
  }
);
Router.post("/createAppointment", (req: Request, res: Response) => {
  console.log(req.body, "body in payment");
  Usercontroller.appointment(req, res);
});
Router.get("/getusers", (req: Request, res: Response) => {
  Usercontroller.getUsers(req, res);
});
Router.get("/appointmentDetail", protect, (req: Request, res: Response) => {
  Usercontroller.appointmentDetail(req, res);
});
Router.post("/cancelAppointment", (req: Request, res: Response) => {
  console.log(req.body, "body in payment");
  Usercontroller.cancelAppointment(req, res);
});
Router.get('/getAppstatus/:id',(req:Request,res:Response)=>{
  console.log("inside user router")
  Usercontroller.getStatus(req,res)
})
export default Router;
