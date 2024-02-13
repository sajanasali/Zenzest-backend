import {Request,Response} from 'express';

import DoctorUsecases from '../usecases/doctor.Usecases';


class DoctorController{
   
  
      private doctorUsecase;
      constructor(doctorUsecase:DoctorUsecases){
        this.doctorUsecase=doctorUsecase
      }

    async createUser(req: Request, res: Response) {
        try {
          
          const response = await this.doctorUsecase.createUser(req.body);
          console.log("doctor controller in",req.body)
          res.status(response.status).send(response.data);
          console.log(response,"resaponse")
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
      async googleAuthentication(req: Request, res: Response) {
        try {
          
          const response = await this.doctorUsecase.googleAuthentication(req.body);
          console.log("user controller in",req.body)
          res.status(response.status).send(response.data);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }

      async  sendOTP(req:Request,res:Response){
        try{

          console.log("otyp sending in controller")
           console.log('Received email:', req.body);

               const response=await this.doctorUsecase.sendOTP(req.body);
               res.status(response.status).send(response.data)
        }
        catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
           
          })
        }
      }
      

      async verifyOTP(req: Request, res: Response) {
        try {
          const response = await this.doctorUsecase.verifyOTP(req.body);
          res.status(response.status).send(response.data);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
    


      async loginUser(req:Request,res:Response){
        try{
             const response=await this.doctorUsecase.loginUser(req.body)
             console.log(response)
             res.status(response.status).send(response.data)
        }
        catch(error){
          res.status(500).send({
            success:false,
            message:"server error",
           
          })
        }
      }

      async sendEmail(req:Request,res:Response){
        try{
          const response=await this.doctorUsecase.sendEmail(req.body)
          res.status(response.status).send(response.data)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error",
            
          })
        }

      }

      async resetPassword(req:Request,res:Response){
        try{
       const response=await this.doctorUsecase.resetPassword(req.body)
       res.status(response.status).send(response.data)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }
}
export default DoctorController;