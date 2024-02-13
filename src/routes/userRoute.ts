import express,{Request,Response} from 'express';
import userController from '../controller/userController';
import userUsecases from '../usecases/userUsecases';
import UserRepository from '../repositories/userRepository';
import OtpRepository from '../repositories/otpRepository';
import { resolve } from 'path/win32';
import tokenRepository from '../repositories/tokenRepository';
import { userAthentication } from '../middlewares/userAuth';


const Router=express.Router();
const userRepository=new UserRepository();
const otpRepository=new OtpRepository()
const tokenrepository=new tokenRepository()
const userUsecase=new userUsecases(userRepository,otpRepository,tokenrepository)
const Usercontroller=new userController(userUsecase);



Router.post('/register',(req:Request,res:Response)=>

    Usercontroller.createUser(req,res)
    
)
Router.post('/register/google',(req:Request,res:Response)=>{
      console.log(req.body,"user router")
    Usercontroller.googleAuthentication(req,res)
    
})

Router.post("/otp", (req: Request, res: Response) =>{
  res.setHeader('Content-Type', 'application/json');
 
  Usercontroller.sendOTP(req, res)
}


);
Router.post("/otp/verify", (req: Request, res: Response) =>{
  console.log(req.body,"from router")
  Usercontroller.verifyOTP(req, res)
});

 Router.post('/login',(req:Request,res:Response)=>{
    console.log(req.header,"Request header")
  Usercontroller.loginUser(req,res)
  
})
Router.post('/forgotpassword',(req:Request,res:Response)=>{
  
  Usercontroller.sendEmail(req,res)
  
})
Router.post('/changepassword',(req:Request,res:Response)=>{
  
  Usercontroller.sendEmail(req,res)
  
})
Router.post('/Updatepassword',(req:Request,res:Response)=>{
  
  Usercontroller.resetPassword(req,res)
  
})

 


export default Router;