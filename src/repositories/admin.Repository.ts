import DoctorBody from "../interfaces/DoctorBody";
import Admin from "../model/admin.Model";
import Appointment from "../model/appointment.Model";
import Doctor from "../model/doctor.Model";
import User from "../model/userModel";

class adminRepository {
  async authenticateAdmin(email: string) {
    try {
      console.log("inside the doctor repository");
      console.log("email", email);
      const userDetails = await Admin.findOne({});
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
  async authenticateDoctor(email: string) {
    try {
      console.log("inside the doctor repository");
      console.log("email", email);
      const userDetails = await Doctor.findOne({});
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
  async findallAppointments() {
    try {
      console.log("inside the appoikjhsdkfjkjjjjjjjjjn");
      const appointments = await Appointment.find({})
        .populate("userId")
        .populate("doctorId");
      console.log(appointments);
      console.log(
        appointments,
        "userrrrrrrrrrrrrrrrrrrrrrrrrrrrr appointmentssssssssssssss"
      );
      if (!appointments) {
        return {
          success: true,
          message: "No data found",
        };
      }
      return {
        success: true,
        message: " data accesses successfully",
        data: appointments,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findbyIdAndUpdate(id: string) {
    try {
      const doctor = await Doctor.findById(id);

      if (!doctor) {
        return {
          success: true,
          message: "No user found",
        };
      }
      doctor.isBlocked = !doctor.isBlocked;
      await doctor.save();
      return {
        success: true,
        message: " Doctor block status updated successfully",
        data: doctor,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async findByIdAndBlock(id: string) {
    try {
      const user = await User.findById(id);

      if (!user) {
        return {
          success: true,
          message: "No user found",
        };
      }
      user.isBlocked = !user.isBlocked;
      await user.save();
      return {
        success: true,
        message: " Doctor block status updated successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async createDoctor(details: DoctorBody) {
    try {
      console.log("user repository");
      const userDetails = await Doctor.create(details);
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
}
export default adminRepository;
