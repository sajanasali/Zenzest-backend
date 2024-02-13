import axios from 'axios';
import UserRepository from '../repositories/userRepository';
import userBody from '../interfaces/userBody';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import { HttpStatus } from '../enums/httpStatus';
import OtpRepository from '../repositories/otpRepository';
import nodemailer from "nodemailer";
import tokenRepository from '../repositories/tokenRepository';
import { token } from 'morgan';
import MyJWTPayLoad from '../interfaces/jwt';
import { UserRole } from '../enums/UserroleEnum';
const secret=process.env.secretkey||"itssecret";
dotenv.config();

class userUsecases{
    private userRepository:UserRepository
    private otpRepository:OtpRepository
    private tokenRepository:tokenRepository
    private decodeToken(token: string): MyJWTPayLoad {
      return jwt.verify(token, "itssecret") as MyJWTPayLoad;
    }
    constructor(userRepository:UserRepository,otpRepository:OtpRepository,tokenRepository:tokenRepository){
        this.userRepository=userRepository;
        this.otpRepository=otpRepository;
        this.tokenRepository=tokenRepository
    }


    async createUser(body: any) {
        try {
          
         
            console.log("inside of usecases")
            const { email, name, password, cpassword } = body;
            console.log("body",body)
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
            
            if (
              password != cpassword ||
              !passwordRegex.test(password as string)
              
            ) {
              return {
                
                status: HttpStatus.ServerError,
                data: {
                  success: false,
                  message: "Retry another password by matching confirmation",
                },
              };
            }
          
            const emailExist = await this.userRepository.authenticateUser(email);
            if (emailExist.data) {
              return {
                status: HttpStatus.ServerError,
                data: {
                  success: false,
                  message: "User email exist already",
                },
              };
            }
            console.log("password bcryting")
            const hashedPassword = await bcrypt.hash(password as string, 10);
            console.log("hashed password",hashedPassword)
            const response = await this.userRepository.createUser({
                email,
                name,
                password: hashedPassword,
                role:"User"

               
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
            const token = jwt.sign(response.data, secret,{
              expiresIn: '1h' // Set token expiry to 1 hour
            });
           console.log("token",token)
           const decodedToken = this.decodeToken(token)
           console.log(decodedToken)
            return {
              status: response.success
                ? HttpStatus.Success
                : HttpStatus.ServerError,
              data: {
                success: response.success,
                message: response.message,
                token: token,
                email:email
                
                
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
 async googleAuthentication(body:any){
  try{
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

    const res = await this.userRepository.authenticateUser(email);

    if (res.data) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: "Account Exist already",
        },
      };
    }

    const result = await this.userRepository.createUser({
        email,
        name
       
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
    const token = jwt.sign(result.data, secret, { expiresIn: '1h' });
    return {
      status: result.success ? HttpStatus.Success : HttpStatus.ServerError,
      data: {
        success: result.success,
        message: result.message,
        token: token,
      },
    };
  }catch(error){
    return {
      status: HttpStatus.ServerError,
      data: {
        success: false,
        message: "server error",
      },
    };
  }
 }
      async sendOTP(body:any){
             try{
              const { email} = body;
              console.log("gmail",email,process.env.mailUser,process.env.mailpass)
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
        console.log("response",response)
        if (!response.success) {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: response.message,
            },
          };
        }
         console.log(response)
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.mailUser,
            pass: process.env.mailpass,
          },
          tls: {
            rejectUnauthorized: false
        }
        });
         
        const mailOptions = {
          from: process.env.mailUser,
          to: email,
          subject: "Verify Your Email from Zenzest Medcare",
          html: `<p>Hey ${email} Here is your Verification OTP: <br> Your OTP is <b>${otp}</b> </p><br>
                <i>Otp will Expire in 30 seconds</i>`,
        };
        console.log("inside nodemailer",otp)
        transporter.sendMail(mailOptions, (err: any) => {
          console.log("inside transportr",otp)
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
             }
             catch(error){
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

     async loginUser(body:any){
      try{
          const {email,password}=body
          console.log("usecase body",body)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const passwordRegex =
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
          if (!emailRegex.test(email) ) {
            return {
              status: HttpStatus.NotFound,
              data: {
                success: false,
                message: "Invalid email or password format",
              },
            };
          }
          console.log("regex checking")
          const response = await this.userRepository.authenticateUser(email);
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
        console.log("password matching",comparedPassword)
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
            role:response.data.role
            
          },
          secret,
          {
            expiresIn: '1h' // Set token expiry to 1 hour
          }
        );
        return {
          status: response.success
            ? HttpStatus.Success
            : HttpStatus.ServerError,
        //status:  HttpStatus.Success,
          data: {
            success: response.success,
           //success:true,
            message: "User Authenticated",
            token: token,
            role:response.data.role===UserRole.User
            
          },
        };
              }
      catch(error){
        return{
          status:HttpStatus.ServerError,
          data:{
            success:false,
            message:"server error"
          }
        }
      }
     }
     async sendEmail(body:any){
        try{
        const {email}=body
        const Emailcheck=await this.userRepository.authenticateUser(email)
        console.log(Emailcheck,"response from send email")
        if (!Emailcheck.data) {
          return {
            status: HttpStatus.NotFound,
            data: {
              success: false,
              message: Emailcheck.message,
            },
          };
        }

        const payload={
             email:Emailcheck.data.email
        }
        const userid=await this.userRepository.findUserIdByEmail(email)
        const Usertoken = jwt.sign(payload, secret );
          const response=await this.tokenRepository.storeToken({
            userId:userid,
            token:Usertoken
          })
           
            
            
          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.mailUser,
              pass: process.env.mailpass,
            },
            tls: {
              rejectUnauthorized: false
          }
          });
         // const resetLink = ``;
          const mailOptions = {
            from: process.env.mailUser,
            to: email,
            subject: "Verify Your Email from Zenzest Medcare",
            html: 
            `
            <html>
              <head>
              <title>Password reset request</title>
              </head> 
          <body>

          <p>Dear ${email}</p>
          <p>We have recieved a request to reset your password for your account with zenzest Medcare.To complete the password reset process
          please click the below link</p>
          <a href=${process.env.LIVE_URL}/changePassword/${encodeURIComponent(Usertoken)}><button>Reset Password</button></a>
          
          <p>Please note that this link is avaiable for 5 mint sonly</p>
          </body>
            </html>
            `,}
            transporter.sendMail(mailOptions, (err: any) => {
              console.log("inside transportr")
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
        }catch(error){
          return{
            status:HttpStatus.ServerError,
            data:{
              success:false,
              message:"server error"
            }
          }
        }
     }

     async  resetPassword(body: any) {
      try {
        const { email, password, token } = body;
      console.log(body,"resetpassword body")
        //const verifyResult = jwt.verify(token,secret);
        try {
          const decodedToken = this.decodeToken(token);
          console.log(decodedToken);
      } catch (error) {
          console.error('Error decoding token:', error);
      }
      const verifyResult = this.decodeToken(token)
        console.log("jwt verifying")
         const tokenDecoded=this.decodeToken(token)
         console.log(tokenDecoded,"decoded token")
        const  userEmail=tokenDecoded.email
        console.log(userEmail,"userEmail for updation")
        if (!verifyResult) {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: "Link is expired or invalid",
            },
          };
        }
    
        const user = await this.userRepository.authenticateUser(userEmail);
    
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
        console.log("checking for hashed password")
        const hashedPassword = await bcrypt.hash(password as string, 10);
        console.log("hashed password",hashedPassword)
        console.log("email",email)
        const updateResult = await this.userRepository.updatePasswordByEmail(
          userEmail,
          hashedPassword
        );
           console.log("updated result",updateResult)
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
      
}
export default userUsecases;