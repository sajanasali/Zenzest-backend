import axios from "axios";
import DoctorRepository from "../repositories/doctor.Repository";
import DoctorBody from "../interfaces/DoctorBody";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpStatus } from "../enums/httpStatus";
import OtpRepository from "../repositories/otpRepository";
import nodemailer from "nodemailer";
import tokenRepository from "../repositories/tokenRepository";
import { token } from "morgan";
import MyJWTPayLoad from "../interfaces/jwt";
import { UserRole } from "../enums/UserroleEnum";
import { query, response } from "express";
import Doctors from "../model/doctor.Model";
import cloudinary from "../configs/cloudinary";
const secret = process.env.secretkey || "itssecret";

dotenv.config();

class DoctorUsecases {
  private doctorRepository: DoctorRepository;
  private otpRepository: OtpRepository;
  private tokenRepository: tokenRepository;
  private decodeToken(token: string): MyJWTPayLoad {
    return jwt.verify(token, "itssecret") as MyJWTPayLoad;
  }
  constructor(
    doctorRepository: DoctorRepository,
    otpRepository: OtpRepository,
    tokenRepository: tokenRepository
  ) {
    this.doctorRepository = doctorRepository;
    this.otpRepository = otpRepository;
    this.tokenRepository = tokenRepository;
  }

  async createUser(body: any) {
    try {
      console.log("inside of usecases");
      const { email, name, password, cpassword } = body;
      console.log("body", body);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

      if (!emailRegex.test(email)) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Give a valid Email",
          },
        };
      }

      if (password != cpassword || !passwordRegex.test(password as string)) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Retry another password by matching confirmation",
          },
        };
      }

      const emailExist = await this.doctorRepository.authenticateDoctor(email);
      if (emailExist.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "User email exist already",
          },
        };
      }
      console.log("password bcryting");
      const hashedPassword = await bcrypt.hash(password as string, 10);
      console.log("hashed password", hashedPassword);
      const response = await this.doctorRepository.createUser({
        email,
        name,
        password: hashedPassword,
        role: "Doctor",
        experience: "",
        slots: [],
        bookedSlots: [],
        status: "Pending",
        education: "",
        qualification: "",
        image: "",
        certification: "",
        compensation:0
      });
      if (!response.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      const token = jwt.sign(response.data, secret, {
        expiresIn: "1h", // Set token expiry to 1 hour
      });
      console.log("token", token);
      //  const decodedToken = this.decodeToken(token)
      //  console.log(decodedToken)
      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          token: token,
          email: email,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "server error",
        },
      };
    }
  }
  async googleAuthentication(body: any) {
    try {
      const { googleAccessToken } = body;

      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        }
      );
      const name = response.data.given_name;
      const email = response.data.email;

      const res = await this.doctorRepository.authenticateDoctor(email);

      if (res.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Account Exist already",
          },
        };
      }

      const result = await this.doctorRepository.createUser({
        email,
        name,
        experience: "",
        slots: [],
        bookedSlots: [],
        status: "Pending",
        education: "",
        qualification: "",
        image: "",
        certification: "",
        compensation:0,
      });
      if (!result.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: result.message,
          },
        };
      }
      //const token = jwt.sign(result.data, process.env.secretkey);
      const token = jwt.sign(result.data, secret, { expiresIn: "1h" });
      return {
        status: result.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: result.success,
          message: result.message,
          token: token,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "server error",
        },
      };
    }
  }
  async sendOTP(body: any) {
    try {
      const { email } = body;
      console.log("gmail", email, process.env.mailUser, process.env.mailpass);
      //const emailExist = await this.userRepository.authenticateUser(email);
      // if (emailExist.data) {
      //   return {
      //     status: HttpStatus.ServerError,
      //     data: {
      //       success: false,
      //       message: "User email exist already",
      //     },
      //   };
      // }
      const otp: string = `${Math.floor(1000 + Math.random() * 9000)}`;
      await this.otpRepository.deleteOtp(email);
      const response = await this.otpRepository.storeOTP({ email, otp });
      console.log("response", response);
      if (!response.success) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      console.log(response);
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.mailUser,
          pass: process.env.mailpass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: process.env.mailUser,
        to: email,
        subject: "Verify Your Email from Zenzest Medcare",
        html: `<p>Hey ${email} Here is your Verification OTP: <br> Your OTP is <b>${otp}</b> </p><br>
                <i>Otp will Expire in 30 seconds</i>`,
      };
      console.log("inside nodemailer", otp);
      transporter.sendMail(mailOptions, (err: any) => {
        console.log("inside transportr", otp);
        if (err) {
          console.log("Error occurred");
          console.log(err.message);
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: "server error",
            },
          };
        } else {
          console.log("Code is sent");
        }
      });
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "OTP generated and send",
          otp: otp,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "server error",
        },
      };
    }
  }

  async verifyOTP(body: any) {
    try {
      const { email, otp } = body;
      const isValid = await this.otpRepository.checkOtp({ email, otp });

      return {
        status: isValid.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: isValid.success,
          message: isValid.message,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "server error",
        },
      };
    }
  }

  async loginUser(body: any) {
    try {
      const { email, password } = body;
      console.log("usecase body", body);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!emailRegex.test(email)) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: "Invalid email or password format",
          },
        };
      }
      console.log("regex checking");
      const response = await this.doctorRepository.authenticateDoctor(email);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      if (response.data.isBlocked) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: "User is blocked by Admin",
          },
        };
      }

      const comparedPassword = await bcrypt.compare(
        password,
        response.data.password
      );
      console.log("password matching", comparedPassword);
      if (!comparedPassword) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: "Password is not match",
          },
        };
      }

      const token = jwt.sign(
        {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
        },
        secret,
        {
          expiresIn: "1h", // Set token expiry to 1 hour
        }
      );
      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        //status:  HttpStatus.Success,
        data: {
          success: response.success,
          //success:true,
          message: "User Authenticated",
          token: token,
          role: response.data.role === UserRole.User,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "server error",
        },
      };
    }
  }
  async sendEmail(body: any) {
    try {
      const { email } = body;
      const Emailcheck = await this.doctorRepository.authenticateDoctor(email);
      console.log(Emailcheck, "response from send email");
      if (!Emailcheck.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: Emailcheck.message,
          },
        };
      }

      const payload = {
        email: Emailcheck.data.email,
      };
      const userid = await this.doctorRepository.findUserIdByEmail(email);
      const Usertoken = jwt.sign(payload, secret);
      const response = await this.tokenRepository.storeToken({
        userId: userid,
        token: Usertoken,
      });

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.mailUser,
          pass: process.env.mailpass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      // const resetLink = ``;
      const mailOptions = {
        from: process.env.mailUser,
        to: email,
        subject: "Verify Your Email from Zenzest Medcare",
        html: `
            <html>
              <head>
              <title>Password reset request</title>
              </head> 
          <body>

          <p>Dear ${email}</p>
          <p>We have recieved a request to reset your password for your account with zenzest Medcare.To complete the password reset process
          please click the below link</p>
          <a href=${process.env.LIVE_URL}/changePassword/${encodeURIComponent(
          Usertoken
        )}><button>Reset Password</button></a>
          
          <p>Please note that this link is avaiable for 5 mint sonly</p>
          </body>
            </html>
            `,
      };
      transporter.sendMail(mailOptions, (err: any) => {
        console.log("inside transportr");
        if (err) {
          console.log("Error occurred");
          console.log(err.message);
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: "server error",
            },
          };
        } else {
          console.log("Code is sent");
        }
      });
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "email generated  and send",
          email: email,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "server error",
        },
      };
    }
  }

  async resetPassword(body: any) {
    try {
      const { email, password, token } = body;
      console.log(body, "resetpassword body");
      //const verifyResult = jwt.verify(token,secret);
      try {
        const decodedToken = this.decodeToken(token);
        console.log(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
      const verifyResult = this.decodeToken(token);
      console.log("jwt verifying");
      const tokenDecoded = this.decodeToken(token);
      console.log(tokenDecoded, "decoded token");
      const userEmail = tokenDecoded.email;
      console.log(userEmail, "userEmail for updation");
      if (!verifyResult) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Link is expired or invalid",
          },
        };
      }

      const user = await this.doctorRepository.authenticateDoctor(userEmail);

      if (!user) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "User not found",
          },
        };
      }

      //const salt = await bcrypt.genSalt(10);
      //const encryptedPassword = await bcrypt.hash(password, salt);
      console.log("checking for hashed password");
      const hashedPassword = await bcrypt.hash(password as string, 10);
      console.log("hashed password", hashedPassword);
      console.log("email", email);
      const updateResult = await this.doctorRepository.updatePasswordByEmail(
        userEmail,
        hashedPassword
      );
      console.log("updated result", updateResult);
      if (updateResult) {
        return {
          status: HttpStatus.Success,
          data: {
            success: true,
            message: "Password updated successfully",
            token: token,
          },
        };
      } else {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Failed to update password",
          },
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }

  async profiledetails(req: any, userid: any) {
    try {
      const id = userid;
      console.log(id, "id in usecase");
      // const { id } = query;
      console.log("inside the usecase profileeeeeeeeeee");

      const response = await this.doctorRepository.findUserId(userid);
      console.log(response, "profile responseeeeeeeeeee");
      return {
        status: response?.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response?.success,
          message: response?.message,
          user: response,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }
  async profileEdit(body: any, userId: string) {
    try {
      console.log("inside usecase");
      const id = userId;
      const { qualification, education, certification, experience } = body;
      const updatedFields = {
        qualification,
        education,
        certification,
        experience,
      };
      console.log(updatedFields, "updatedfield");

      const response = await this.doctorRepository.findByIdAndUpdate(
        id,
        updatedFields
      );
      console.log(response, "response");
      if (response) {
        return {
          status: HttpStatus.Success,
          data: {
            success: true,
            message: "profile updated successfully",
            token: token,
          },
        };
      } else {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Failed to update profile",
          },
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }
  async doctordata(req: any) {
    try {
      const response = await this.doctorRepository.findallDoctor();
      console.log(response, "profile responseeeeeeeeeee");
      return {
        status: response?.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response?.success,
          message: response?.message,
          user: response,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }
  async uploadImage(req: any, userId: string) {
    try {
      console.log("inside usecase");
      const imagePath = req.file?.path;

      const id = userId;
      console.log(imagePath, id, "ghjhgjgjjh");
      // const res = await cloudinary.uploader.upload(imagePath!, {
      //   folder: `dxqtb7bi9/profile_images`,
      //   unique_filename: true,
      // });
      const res = await cloudinary.uploader.upload(
        imagePath,
        {},
        (err, url) => {}
      );
      const secureUrl = res.secure_url;
      //const id = (req as any).user;
      console.log(id, "user id in image uploading");
      const response = await this.doctorRepository.findByIdAndUpdate(id, {
        image: secureUrl,
      });
      if (response) {
        return {
          status: HttpStatus.Success,
          data: {
            success: true,
            message: "image updated successfully",
            token: token,
          },
        };
      } else {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Failed to update image",
          },
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }

  async medicalHistory(body: any, req: any) {
    try {
      const {
        dob,
        gender,
        address,
        reason,
        height,
        weight,
        city,
        state,
        zip,
        blood,
        allergies,
      } = body;
      //const updatedField=body;
      const updatedFields = {
        dob,
        gender,
        address,
        reason,
        height,
        weight,
        city,
        state,
        zip,
        blood,
        allergies,
      };

      const id = req.user.id;
      console.log(id, "userId");
      const response = await this.doctorRepository.findByIdAndUpdate(
        id,
        updatedFields
      );
      if (response) {
        return {
          status: HttpStatus.Success,
          data: {
            success: true,
            message: "profile updated successfully",
            token: token,
          },
        };
      } else {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Failed to update profile",
          },
        };
      }
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }
  async addTimeslot(req: any, userId: string) {
    console.log("insider the usecase");
    const id = userId;
    console.log(req, "bodyyyyyyyyyyyyyyyyyyyyyyyyyy");
    const { date, timeslots } = req[0];
    console.log(date, "dateeeeeeeee"),
      console.log(timeslots, "timeslotssssssssssss");
    const response = await this.doctorRepository.findSlotsByDate(
      id,
      date,
      timeslots
    );
    console.log(response, "responsess sssssssssssssssss");
    if (response) {
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "profile updated successfully",
          token: token,
        },
      };
    } else {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "Failed to update profile",
        },
      };
    }
  }

  async getAvailSlots(req: any, userid: any, date: any) {
    console.log("inside the usecase");

    const dates = date;
    console.log(date, "date");
    const id = userid;
  console.log(id,"doctoriddddddddddddd")
    const response = await this.doctorRepository.findTimeSlotsByDate(id, date);
    console.log("response", response);
    console.log(response, "response inavailable slotssssssssssssssssssssss");
    if (response) {
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "get available slots",
          response: response,
        },
      };
    } else {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "Failed to get available slots",
        },
      };
    }
  }

  async getBookedSlots(req: any, userid: any, date: any) {
    console.log("inside the usecase");

    const dates = date;
    console.log(date, "date");
    const id = userid;

    const response = await this.doctorRepository.findBookedSlotsByDate(
      id,
      date
    );
    console.log("response", response);
    console.log(response, "response in usecase getavailable");
    if (response) {
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "profile updated successfully",
          response: response,
        },
      };
    } else {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "Failed to update profile",
        },
      };
    }
  }

  async getAppointments(req: any) {
    try {
      const response = await this.doctorRepository.findallAppointments();
      console.log(response, "profile responseeeeeeeeeee");
      return {
        status: response?.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response?.success,
          message: response?.message,
          user: response,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }
  async todayAppointments(req:any,userId:string){
    try{
        let id=userId
   
      const  response=await this.doctorRepository.todayAppointments(id);
        return {
          status: response?.success? HttpStatus.Success : HttpStatus.ServerError,
          data: {
            success: response?.success,
            message: response?.message,
            user: response,
          },
        };
    }catch(error){
      return{
        status:HttpStatus.ServerError,
        data:{
          success:false,
          message:'Server Error'
        }
      }
    }
  }


  async cancelAppointment(req:any,userId:string){
    try{
        let id=userId
   
      const  response=await this.doctorRepository.cancelAppointment(id);
        return {
          status: response?.success? HttpStatus.Success : HttpStatus.ServerError,
          data: {
            success: response?.success,
            message: response?.message,
            user: response,
          },
        };
    }catch(error){
      return{
        status:HttpStatus.ServerError,
        data:{
          success:false,
          message:'Server Error'
        }
      }
    }
  }

  async confirmAppointment(req:any,userId:string){
    try{
        let id=userId
   
      const  response=await this.doctorRepository.confirmAppointment(id);
        return {
          status: response?.success? HttpStatus.Success : HttpStatus.ServerError,
          data: {
            success: response?.success,
            message: response?.message,
            user: response,
          },
        };
    }catch(error){
      return{
        status:HttpStatus.ServerError,
        data:{
          success:false,
          message:'Server Error'
        }
      }
    }
  }


  async getStatus(req: any,id:string) {
    try {
      const response = await this.doctorRepository.AppointmentById(id);
      console.log(response, "profile responseeeeeeeeeee");
      return {
        status: response?.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response?.success,
          message: response?.message,
          user: response,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: `Server error`,
        },
      };
    }
  }
}

export default DoctorUsecases;
