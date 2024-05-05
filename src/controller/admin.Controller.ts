import { Request,Response} from 'express';
import AdminUsecase from '../usecases/admin.Usecase';


class AdminController {
    private adminUsecase;
    constructor(adminUsecase: AdminUsecase) {
      this.adminUsecase = adminUsecase;
    }



    async loginUser(req: Request, res: Response) {
        try {
          const response = await this.adminUsecase.loginUser(req.body);
          console.log(response);
          res.status(response.status).send(response.data);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
      async getAppointments(req: Request, res: Response) {
        try {
          
         
          const response = await this.adminUsecase.getAppointments(req);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
      async blockDoctor(req: Request, res: Response) {
        try {
            const id=req.body.doctorId
             console.log(req.body,"reqbodyyyyyyyyyyyyyyyyyyyyy",id)
            
          const response = await this.adminUsecase.blockDoctor(id);
         console.log(response,"responseeeeeeeeeee")
          //res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
      async blockuser(req: Request, res: Response) {
        try {
            const id=req.body.userId
             console.log(req.body,"reqbodyyyyyyyyyyyyyyyyyyyyy",id)
            
          const response = await this.adminUsecase.blockuser(id);
         console.log(response,"responseeeeeeeeeee")
          //res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }

      async createDoctor(req: Request, res: Response) {
        try {
          const response = await this.adminUsecase.createDoctor(req.body);
          console.log(response);
          res.status(response.status).send(response.data);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
}
export default  AdminController;