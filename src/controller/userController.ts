import {NextFunction, Request,Response} from 'express';
import userUsecase from '../usecases/userUsecases'


class userController{
   
  
      private userUsecase;
      constructor(userUsecase:userUsecase){
        this.userUsecase=userUsecase
      }

    async createUser(req: Request, res: Response) {
        try {
          
          const response = await this.userUsecase.createUser(req.body);
          console.log("user controller in",req.body)
          res.status(response.status).send(response.data);
          console.log(response,"response")
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

               const response=await this.userUsecase.sendOTP(req.body);
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
          const response = await this.userUsecase.verifyOTP(req.body);
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
             const response=await this.userUsecase.loginUser(req.body)
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
          const response=await this.userUsecase.sendEmail(req.body)
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
       const response=await this.userUsecase.resetPassword(req.body)
       //res.status(response.status).send(response.data)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }

      async medicalhistory(req:Request,res:Response){
        try{
          const userId=req.user.id
          console.log(userId,"userId from control")
          const response=await this.userUsecase.medicalHistory(req.body,userId)
          res.status(response.status).send(response.data)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }
      

      async profile(req:Request,res:Response){
        try{
          const userId=req.user.id
          console.log(userId,"userId from control")
          const response=await this.userUsecase.profile(req.body,userId)
          res.status(response.status).send(response.data.user)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }
      async appointment(req:Request,res:Response){
        //try{
          
         
        //   const response=await this.userUsecase.createAppointment(metadata,paymentdata,req,res)
        //   res.status(response.status).send(response.data.user)
        // }catch(error){
        //   res.status(500).send({
        //     success:false,
        //     message:"server error"
        //   })
        //}
      }
      async StripePayment(req:Request,res:Response){
        try{
          console.log("stripe payment")
          const userId=req.user.id
          console.log(req.body,"requested body")
          const{doctorData,slot}=req.body
          console.log(userId,"userId from control stripe payment",doctorData,slot)
          const response=await this.userUsecase.StripePayment(doctorData,slot,userId)
          res.send(response.data.user)
          console.log(response.data,"response from stripe")
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }

      async webhooks(req:Request,res:Response){
        try{
          
         console.log("inside the payment controller")
          const response=await this.userUsecase.webhooks(req,res)
          //res.status(response.status).send(response.data.session)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }
      async getUsers(req: Request, res: Response) {
        try {
          
         
          const response = await this.userUsecase.getUsers(req);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      } 

      async appointmentDetail(req: Request, res: Response) {
        try {
          
          const userId=req.user.id
          const response = await this.userUsecase.appointmentDetail(req,userId);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      } 
      async cancelAppointment(req: Request, res: Response) {
        try {
          
          console.log("inside cancel appointment controller")
          const response = await this.userUsecase.cancelAppointment(req);
         console.log(response,"responseeeeeeeeeee")
         // res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      } 
  
      async getStatus(req: Request, res: Response) {
        try {
          console.log("inside usercontroller")
         const appId=req.params.id
         console.log("appointment id in usercontrol",appId )
          const response = await this.userUsecase.getStatus(req,appId);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
}
export default userController;