import Users from "../model/userModel";
import Doctor from "../model/doctor.Model";
import userBody from "../interfaces/userBody";
import Appointment from "../model/appointment.Model";
import Admin from "../model/admin.Model";
class DoctorRepository {
  async createUser(details: userBody) {
    try {
      console.log("user repository");
      const userDetails = await Users.create(details);
      // const userDetails = await Users.create(details).catch((error) => {
      //   console.error('Validation error:', error.errors);
      // });
      console.log("userdetails", userDetails);
      if (!userDetails) {
        return {
          success: false,
          message: "user details nopt stored",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: {
          id: userDetails._id,
          email: userDetails.email,
          role: userDetails.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async authenticateUser(email: string) {
    try {
      console.log("inside the user repository");
      const userDetails = await Users.findOne({ email: email });
      console.log("userdetails", userDetails);
      if (!userDetails) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: userDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async findUserIdByEmail(email: string) {
    try {
      const user = await Users.findOne({ email });
      // Replace 'email' with the actual field name in your schema
      //return user ? user._id.toString() : null;
      return user ? user._id.toString() : "";
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findUserByEmail(email: string) {
    try {
      const user = await Users.findOne({email});
      // Replace 'email' with the actual field name in your schema
      console.log(user, "userrrrrrrrrrrrrrrrrr");
      //return user ? user._id.toString() : null;
      if (!user) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async updatePasswordByEmail(email: string, newPassword: string) {
    try {
      // Assuming you have a password field in your Users model
      // Replace this with the new password
      console.log("email updation");
      const updatePassword = await Users.findOneAndUpdate(
        { email: email },
        { $set: { password: newPassword } },
        { new: true }
      );
      console.log("updated password", updatePassword);
      if (updatePassword) {
        return {
          success: true,
          message: "User password updated",
          data: updatePassword,
        };
      } else {
        return {
          success: false,
          message: "User not found with the provided email",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update password: ${error}`,
      };
    }
  }

  async findByIdAndUpdate(userId: string, updateFields: any) {
    try {
      const user = await Users.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
      );
      if (!user) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "image updated",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async findUserId(userId: string) {
    try {
      const user = await Users.findById(userId);
      // Replace 'email' with the actual field name in your schema
      console.log(user, "userrrrrrrrrrrrrrrrrr");
      //return user ? user._id.toString() : null;
      if (!user) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findUserById(userId: string) {
    try {
      const user = await Doctor.findById(userId);
      // Replace 'email' with the actual field name in your schema
      console.log(user, "userrrrrrrrrrrrrrrrrr");
      //return user ? user._id.toString() : null;
      if (!user) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findallusers() {
    try {
      const user = await Users.find(
        {},
        { _id: 1, name: 1, email: 1, address: 1, isBlocked: 1, reason: 1 }
      );
      console.log(user, "userrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      if (!user) {
        return {
          success: true,
          message: "No data found",
        };
      }
      return {
        success: true,
        message: " data accesses successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async findAppointmentById(userId: string) {
    try {
      const user = await Appointment.find({ userId }).populate("doctorId");
      // Replace 'email' with the actual field name in your schema
      console.log(user, "userrrrrrrrrrrrrrrrrr");
      //return user ? user._id.toString() : null;
      if (!user) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findAppointmentByIdChangeStatus(userId: string) {
    try {
      //const user = await Appointment.find({ userId })
      const appointment = await Appointment.findByIdAndUpdate(
        userId,
        { status: "Cancelled" },
        { new: true }
      );

      const userRefund =
        appointment?.amountPaid !== undefined
          ? 0.6 * appointment.amountPaid
          : 0;
      const doctorRefund =
        appointment?.amountPaid !== undefined
          ? 0.2 * appointment.amountPaid
          : 0;
      const adminRefund =
        appointment?.amountPaid !== undefined
          ? 0.2 * appointment.amountPaid
          : 0;
      const doctorId = appointment?.doctorId;
      const doctor = await Doctor.findById({ doctorId });
      if (doctor) {
        console.log("doctor refund amount is:", doctorRefund);
        if (doctorRefund) {
          doctor.compensation += doctorRefund;
        }
      }
      const admin = await Admin.find();
      if (admin) {
        console.log("doctor refund amount is:", adminRefund);
        if (adminRefund) {
          //admin.commission += adminRefund;
        }
      }
      // Replace 'email' with the actual field name in your schema
      console.log(appointment, "userrrrrrrrrrrrrrrrrr");
      //return user ? user._id.toString() : null;
      if (!appointment) {
        return {
          success: true,
          message: "No user found",
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: appointment,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
}

export default DoctorRepository;
