import axios from "axios";
import UserRepository from "../repositories/userRepository";
import userBody from "../interfaces/userBody";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpStatus } from "../enums/httpStatus";
import OtpRepository from "../repositories/otpRepository";
import nodemailer from "nodemailer";
import tokenRepository from "../repositories/tokenRepository";
import { token } from "morgan";
import MyJWTPayLoad from "../interfaces/jwt";
import { Slot } from "../interfaces/doctors";
import { UserRole } from "../enums/UserroleEnum";
const secret = process.env.secretkey || "itssecret";
import Stripe from "stripe";
import Appointment from "../model/appointment.Model";
dotenv.config();
const stripeSecretKey = process.env.stripe_key || "";
const stripe = new Stripe(stripeSecretKey);

class userUsecases {
  private userRepository: UserRepository;
  private otpRepository: OtpRepository;
  private tokenRepository: tokenRepository;
  private decodeToken(token: string): MyJWTPayLoad {
    return jwt.verify(token, secret) as MyJWTPayLoad;
  }
  constructor(
    userRepository: UserRepository,
    otpRepository: OtpRepository,
    tokenRepository: tokenRepository
  ) {
    this.userRepository = userRepository;
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
            message: "Retry another password by matching confirmation like uppercase,lowercase,numbers and symbols",
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
      console.log("password bcryting");
      const hashedPassword = await bcrypt.hash(password as string, 10);
      console.log("hashed password", hashedPassword);
      const response = await this.userRepository.createUser({
        email,
        name,
        password: hashedPassword,
        role: "User",
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
      const decodedToken = this.decodeToken(token);
      console.log(decodedToken);
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
          const user=await this.userRepository.findUserByEmail(email)
      
      if (isValid.success) {
        if (user && user.data) {
          // Update the isVerified property
          user.data.isVerified = true; // Assign the new value
          // Now isVerified is set to true
      } else {
          console.error("User or user data is not available");
      }
        
        return {
          status: HttpStatus.Success,
          data: {
            success: true,
            message: "OTP matched successfully",
          },
        };
      } else {
        return {
          status: HttpStatus.BadRequest,
          data: {
            success: false,
            message: "Invalid OTP. Please try again.",
          },
        };
      }
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
      if (response.data.isVerified) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: "User is not verified",
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
      console.log(secret, "secret");
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
      const Emailcheck = await this.userRepository.authenticateUser(email);
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
      const userid = await this.userRepository.findUserIdByEmail(email);
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
      console.log("checking for hashed password");
      const hashedPassword = await bcrypt.hash(password as string, 10);
      console.log("hashed password", hashedPassword);
      console.log("email", email);
      const updateResult = await this.userRepository.updatePasswordByEmail(
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

  async medicalHistory(body: any, userId: string) {
    try {
      console.log("inside the usecase medicalhistory");
      const { gender, address, reason, height, weight, bloodgroup, allergies } =
        body;
      //const updatedField=body;
      const updatedFields = {
        gender,
        address,
        reason,
        height,
        weight,

        bloodgroup,
        allergies,
      };
      console.log("updated fiels", updatedFields);
      console.log("user checking");
      const id = userId;
      console.log(id, "userId");
      const response = await this.userRepository.findByIdAndUpdate(
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
  async profile(body: any, userId: string) {
    const id = userId;
    const response = await this.userRepository.findUserId(id);
    console.log(response, "profile responseeeeeeeeeee");
    return {
      status: response?.success ? HttpStatus.Success : HttpStatus.ServerError,
      data: {
        success: response?.success,
        message: response?.message,
        user: response,
      },
    };
  }
  catch(error: any) {
    return {
      status: HttpStatus.ServerError,
      data: {
        success: false,
        message: `Server error`,
      },
    };
  }
  async createAppointment(metadata: any, paymentdata: any, req: any, res: any) {
    try {
      console.log("inside the appointment");
      const { userId, doctorId, slotBooked, slotDate, slotTime } = metadata;
      console.log(slotDate, "slotdateeeeeeeeeeeeeee");

      const appointment = new Appointment({
        userId,
        doctorId,
        slotBooked,
        // appointmentId: Math.floor(Math.random() * 1000000 + 1),
        paymentMode: paymentdata.payment_method_types,
        paymentStatus: paymentdata.status,
        amountPaid: paymentdata.amount_received / 100,
      });
      appointment.save();
      console.log("inside the create appoinrment");
      const doctor = await this.userRepository.findUserById(doctorId);
      console.log(doctor, "doctorrrrrrrrrrrrrrrrr");
      const slots = doctor?.data?.slots ?? [];
      console.log(slots, "slotsssssssss");
      const parsedDate = new Date(slotDate);

      // Get the month, day, and year components
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so we add 1
      const day = String(parsedDate.getDate()).padStart(2, "0");
      const year = String(parsedDate.getFullYear());

      // Construct the formatted date string
      const formattedDate = `${month}/${day}/${year}`;

      console.log(formattedDate);
      // const bookedSlot= slots?.find((slot:any) => {
      //   return slot.date === slotDate && slot.timeslots.includes(slotTime);
      // });
      // console.log( bookedSlot,"bookedslots")
      const slotIndex = slots?.findIndex((slot: any) => {
        return slot.date === formattedDate && slot.timeslots.includes(slotTime);
      });

      console.log(slotIndex, "slotIndexxxxxxxxxxxxxxxxxxx");
      if (slotIndex !== undefined && slotIndex !== -1) {
        // Remove the specific time slot from the doctor's slots
        slots[slotIndex].timeslots = slots[slotIndex].timeslots.filter(
          (slot: Slot) => slot !== slotTime
        );

        // If there are no more timeslots for that date, remove the entire slot
        if (slots[slotIndex].timeslots.length === 0) {
          slots?.splice(slotIndex, 1);
        }
        const bookedSlotIndex = doctor?.data?.bookedSlots.findIndex(
          (dateExist) => dateExist.date === formattedDate
        );
        console.log(bookedSlotIndex, "bookedSlotIndex");
        //    if(bookedSlot){
        //   const dateExist= doctor?.data?.bookedSlots.find((dateExist)=>dateExist.date === bookedSlot.date);
        //   if(dateExist){
        //     dateExist.timeslots.push(slotTime);
        //   }else{
        //     doctor?.data?.bookedSlots.push({
        //       date: bookedSlot.date,
        //        timeslots: [slotTime],
        //     })
        //   }
        // }
        if (bookedSlotIndex !== undefined && bookedSlotIndex !== -1) {

          console.log("inside the booked slots")
          // If date already exists in bookedSlots, add time slot to it
          if (
            doctor?.data?.bookedSlots &&
            typeof doctor.data.bookedSlots[bookedSlotIndex] === "object"
          ) {
            // If date already exists in bookedSlots, add time slot to it
            doctor.data.bookedSlots[bookedSlotIndex].timeslots.push(slotTime);
          }
        } else {
          // If date doesn't exist in bookedSlots, create a new entry
          doctor?.data?.bookedSlots.push({
            date: formattedDate,
            timeslots: [slotTime],
          });
        }
        await doctor?.data?.save();
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
  async StripePayment(doctorData: any, slot: any, userid: any) {
    try {
      const id = userid;
      console.log("id from stripe payment", id);
      
      console.log("doctordata", doctorData, slot);
      console.log(3199, doctorData, userid, slot);
      const slotString = `${slot.date} ${slot.time}`;
      console.log(slotString, "slotstring");
      const users = await this.userRepository.findUserId(id);

      const customer = await stripe.customers.create({
        name: users?.data?.name,
        address: {
          line1: users?.data?.address,
          // Add other address fields as needed
        },
        metadata: {
          userId: userid,
          doctorId: doctorData.doctorId,
          slotBooked: slotString,
          slotDate: slot.date,
          slotTime: slot.time,
        },
      });
      console.log("Customer created:", customer);

      //console.log(customer,"customer")
      const unit_amount =
        typeof doctorData.fees === "number" ? doctorData.fees * 100 : 50000;
      const session = await stripe.checkout.sessions
        .create({
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: `Dr.${doctorData.fullName}`,
                },
                unit_amount: unit_amount,
              },
              quantity: 1,
            },
          ],
          payment_method_types: ["card"],


          customer: customer.id,

          mode: "payment",
          success_url: "http://localhost:4200/dashboard/bookingSuccess",
          cancel_url: "https://localhost:4200/dashboard/bookingfailed",
        })
        .catch((error) => {
          console.error("Error creating Stripe session:", error);
          // Handle error appropriately (e.g., return error message to user)
        });
      console.log(session, "response");
      return {
        data: {
          user: session,
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
  async webhooks(req: any, res: any) {
    console.log("inside webhook");
    let endpointSecret: string | undefined;
    //Define endpointSecret as string or undefined
    // let endpointSecret=' whsec_722c51fafaf17e48ff190337e27aaf12ff2cb1ac6de9c37efa3a2c385bdf19b1'
    const payload = req.body;
    console.log(366, payload);
    const sig = req.headers["stripe-signature"];
    console.log(369, sig);
    let data: any;
    let eventType: string | undefined; // Define eventType as string or undefined

    if (endpointSecret) {
      let event;

      try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        console.log(324, "webhooks verified");
      } catch (err) {
        //console.log(32666, err.message);
        res.status(400).json({ success: true });
        return;
      }
    } else {
      data = req.body.data.object;
      eventType = req.body.type;

      if (eventType === "payment_intent.succeeded") {
        // Assuming createAppointment function is defined somewhere
        stripe.customers
          .retrieve(data.customer)
          .then(async (customer: any) => {
            const metadata = customer?.metadata;
            if (customer && !customer.deleted && metadata) {
              // Check if customer exists, is not deleted, and has metadata
              await this.createAppointment(metadata, data, req, res);
            } else {
              console.error("Error: Customer not found or metadata missing");
              res
                .status(400)

                .json({
                  success: false,
                  message: "Customer not found or metadata missing",
                });
            }
          })
          .catch((error) => {
            console.error("Error retrieving customer:", error);
            res
              .status(500)
              .json({ success: false, message: "Error retrieving customer" });
          });
      }
    }
  }
  async getUsers(req: any) {
    try {
      const response = await this.userRepository.findallusers();
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
  async appointmentDetail(req: any, userId: any) {
    try {
      const response = await this.userRepository.findAppointmentById(userId);
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

  async cancelAppointment(req: any) {
    try {
      console.log(req.body,"bodyyyyyyyyyyyyy")
      const id=req.body[0]._id
      const response = await this.userRepository.findAppointmentByIdChangeStatus(id);
      console.log(response, "appointment");
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
  async getStatus(req: any,id:string) {
    try {
      console.log("inside usecases")
      const response = await this.userRepository.AppointmentById(id);
      console.log(response, "profile responseeeeeeeeeee in usercase");
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
export default userUsecases;
