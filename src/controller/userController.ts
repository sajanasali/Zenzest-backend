import {Request,Response} from 'express';
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
          
          const response = await this.userUsecase.googleAuthentication(req.body);
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
       res.status(response.status).send(response.data)
        }catch(error){
          res.status(500).send({
            success:false,
            message:"server error"
          })
        }
      }
}
export default userController;