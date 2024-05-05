import { UserRole } from "../enums/UserroleEnum";
import { HttpStatus } from "../enums/httpStatus";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import adminRepository from "../repositories/admin.Repository";
import bcrypt from "bcrypt";
const secret = process.env.secretkey || "itssecret";
class AdminUsecase {
  private adminrepository: adminRepository;

  constructor(adminRepository: adminRepository) {
    this.adminrepository = adminRepository;
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
      const response = await this.adminrepository.authenticateAdmin(email);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }

      //   const comparedPassword = await compare(
      //     password,
      //     response.data.password
      //   );
      const comparedPassword = password === response.data.password;
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
      console.log(token, "token");
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

  async getAppointments(req: any) {
    try {
      const response = await this.adminrepository.findallAppointments();
      console.log(response, " responseeeeeeeeeee");
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
  async blockDoctor(id: string) {
    try {
      const response = await this.adminrepository.findbyIdAndUpdate(id);
      console.log(response, " responseeeeeeeeeee");
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
  async blockuser(id: string) {
    try {
      const response = await this.adminrepository.findByIdAndBlock(id);
      console.log(response, " responseeeeeeeeeee");
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

  async createDoctor(body: any) {
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

      const emailExist = await this.adminrepository.authenticateDoctor(email);
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
      const response = await this.adminrepository.createDoctor({
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
        compensation:0,
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
}
export default AdminUsecase;
