import express,{Request,Response} from 'express';

import DoctorUsecases from '../usecases/doctor.Usecases';
import DoctorController from '../controller/doctor.contoller';
import DoctorRepository from '../repositories/doctor.Repository';
import OtpRepository from '../repositories/otpRepository';
import { resolve } from 'path/win32';
import tokenRepository from '../repositories/tokenRepository';



const Router=express.Router();
const doctorRepository=new DoctorRepository;
const otpRepository=new OtpRepository()
const tokenrepository=new tokenRepository()
const doctorUsecase=new DoctorUsecases(doctorRepository,otpRepository,tokenrepository)
const doctorcontroller=new DoctorController(doctorUsecase);



Router.post('/register',(req:Request,res:Response)=>{
  console.log(req.body,"doctor  router")
doctorcontroller .createUser(req,res)
    
})
Router.post('/register/google',(req:Request,res:Response)=>{
      
      doctorcontroller.googleAuthentication(req,res)
    
})

Router.post("/otp", (req: Request, res: Response) =>{
  res.setHeader('Content-Type', 'application/json');
 
  doctorcontroller.sendOTP(req, res)
}


);
Router.post("/otp/verify", (req: Request, res: Response) =>{
  console.log(req.body,"from router")
  doctorcontroller.verifyOTP(req, res)
});

 Router.post('/login',(req:Request,res:Response)=>{
    console.log(req.header,"Request header")
    doctorcontroller.loginUser(req,res)
  
})
Router.post('/forgotpassword',(req:Request,res:Response)=>{
  
    doctorcontroller.sendEmail(req,res)
  
})
Router.post('/changepassword',(req:Request,res:Response)=>{
  
    doctorcontroller.sendEmail(req,res)
  
})
Router.post('/Updatepassword',(req:Request,res:Response)=>{
  
    doctorcontroller.resetPassword(req,res)
  
})

export default Router;