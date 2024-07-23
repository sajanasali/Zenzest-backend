import { Request, Response } from "express";

import DoctorUsecases from "../usecases/doctor.Usecases";

class DoctorController {
  private doctorUsecase;
  constructor(doctorUsecase: DoctorUsecases) {
    this.doctorUsecase = doctorUsecase;
  }

  async createUser(req: Request, res: Response) {
    try {
      const response = await this.doctorUsecase.createUser(req.body);
      console.log("doctor controller in", req.body);
      res.status(response.status).send(response.data);
      console.log(response, "resaponse");
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
      console.log("user controller in", req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async sendOTP(req: Request, res: Response) {
    try {
      console.log("otyp sending in controller");
      console.log("Received email:", req.body);

      const response = await this.doctorUsecase.sendOTP(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
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

  async loginUser(req: Request, res: Response) {
    try {
      const response = await this.doctorUsecase.loginUser(req.body);
      console.log(response);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async sendEmail(req: Request, res: Response) {
    try {
      const response = await this.doctorUsecase.sendEmail(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const response = await this.doctorUsecase.resetPassword(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async profiledata(req: Request, res: Response) {
    try {
      const userId=req.user.id
      console.log(userId,"userrrrrrrrrrrrrrrr")
      const response = await this.doctorUsecase.profiledetails(req,userId);
      res.status(response.status).send(response.data.user);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async doctorData(req: Request, res: Response) {
    try {
      
     
      const response = await this.doctorUsecase.doctordata(req);
     console.log(response,"responseeeeeeeeeee")
      res.status(response.status).send(response.data.user);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async profileEdit(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const rb=req.body
      console.log(rb,"request body")
      const response = await this.doctorUsecase.profileEdit(req.body, userId);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }
  async uploadImage(req: Request, res: Response) {
    try {
      console.log("inside doctor cotroller");
      const userId = req.user.id;
      // const path=req.file?.path
      console.log("userid", userId);
      const response = await this.doctorUsecase.uploadImage(req, userId);
      res.status(response.status).send(response.data);
      //       }catch(error){
      //         res.status(500).send({
      //           success:false,
      //           message:"server error"
      //         })
    } catch (error) {
      console.log(error);
    }
  }
  async addTimeslot(req: Request, res: Response) {
    try {
      const userid = req.user.id;
      console.log(userid,"userId")
      const response = await this.doctorUsecase.addTimeslot(req.body, userid);
       res.status(response.status).send(response.data)
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }
  async getAvailSlots (req:Request,res:Response){
    try{
      console.log("inside the controleer")
      const userid = req.user.id;
      console.log(userid,"userid")
      const date = req.query.date;
      console.log(date,"date i controller")
      const response = await this.doctorUsecase.getAvailSlots(req.body, userid,date);
       res.status(response.status).send(response.data.response)
    }catch(error){
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
}
async getBookedSlots (req:Request,res:Response){
  try{
    console.log("inside the controleer")
    const userid = req.user.id;
    console.log(userid,"userid")
    const date = req.query.date;
    console.log(date,"date i controller")
    const response = await this.doctorUsecase.getBookedSlots(req.body, userid,date);
     res.status(response.status).send(response.data.response)
  }catch(error){
    res.status(500).send({
      success: false,
      message: "server error",
    });
  }
}



async getAppointments(req: Request, res: Response) {
  try {
    
   
    const response = await this.doctorUsecase.getAppointments(req);
   console.log(response,"responseeeeeeeeeee")
    res.status(response.status).send(response.data.user);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "server error",
    });
  }
}

async todayAppointment(req:Request,res:Response){
  try{
    const userid = req.user.id;
    const response=await this.doctorUsecase.todayAppointments(req,userid) 
    res.status(response.status).send(response.data) 
}catch (error){
  res.status(500).send({
    sucess:false,
    message:"server error"
  })
}
  }
  
  async confirmAppointment(req:Request,res:Response){
    try{
      const userid = req.params.id
      const response=await this.doctorUsecase.confirmAppointment(req,userid) 
      res.status(response.status).send(response.data) 
  }catch (error){
    res.status(500).send({
      sucess:false,
      message:"server error"
    })
  }
    } 


    async cancelAppointment(req:Request,res:Response){
      try{
        const userid = req.params.id
        const response=await this.doctorUsecase.cancelAppointment(req,userid) 
        res.status(response.status).send(response.data) 
    }catch (error){
      res.status(500).send({
        sucess:false,
        message:"server error"
      })
    }
      } 


      async getStatus(req: Request, res: Response) {
        try {
          
         const appId=req.params.id
         console.log("appointment id",appId)
          const response = await this.doctorUsecase.getStatus(req,appId);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }

      async prescription(req: Request, res: Response) {
        try {
          
         const appId=req.params.id
         console.log("appointment id",appId)
          const response = await this.doctorUsecase.prescription(req,appId);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.user);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }
      async completed(req: Request, res: Response) {
        try {
          
         const appId=req.params.id
         console.log("appointment id",appId)
          const response = await this.doctorUsecase.completed(appId);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.appointment);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }

      async prescriptioncompleted(req: Request, res: Response) {
        try {
          
         const appId=req.params.id
         console.log("appointment id",appId)
          const response = await this.doctorUsecase.prescriptioncompleted(appId);
         console.log(response,"responseeeeeeeeeee")
          res.status(response.status).send(response.data.appointment);
        } catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }

      async getDashdata(req:Request,res:Response){
        try{
          console.log()
          const doctorId=req.user.id
     const response=await this.doctorUsecase.getDashdata(req,doctorId)
     res.status(response.status).send(response.data)
        }catch (error) {
          res.status(500).send({
            success: false,
            message: "server error",
          });
        }
      }

}

export default DoctorController;
