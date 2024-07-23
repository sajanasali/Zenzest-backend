import Doctors from "../model/doctor.Model";
import Appointment from "../model/appointment.Model";
import DoctorBody from "../interfaces/DoctorBody";
import bodyParser from "body-parser";
import mongoose, { Types } from "mongoose";
import User from "../model/userModel";
import AppointmentModel from "../model/appointment.Model";
import { ObjectId } from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

class DoctorRepository {
  async createUser(details: DoctorBody) {
    try {
      console.log("user repository");
      const userDetails = await Doctors.create(details);
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

  async authenticateDoctor(email: string) {
    try {
      console.log("inside the doctor repository");
      const userDetails = await Doctors.findOne({ email: email });
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
      const user = await Doctors.findOne({ email });
      // Replace 'email' with the actual field name in your schema
      //return user ? user._id.toString() : null;
      return user ? user._id.toString() : "";
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
      const updatePassword = await Doctors.findOneAndUpdate(
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
  async findUserId(userId: string) {
    try {
      const user = await Doctors.findById(userId);
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
  async findByIdAndUpdate(userId: string, updateFields: any) {
    try {
      const user = await Doctors.findByIdAndUpdate(
        { _id: userId },
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
        message: " updated successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async findslot(doctor: any, date: any) {
    try {
      console.log("inside the repository");

      // const slotsav=await Doctors.find({slots:1},{_id:id})
      //  const slotsav = await Doctors.;
      //   console.log(slotsav)
      let response;
      for (const slot of doctor.slots) {
        if (slot.date === date) {
          response = slot;
          return {
            success: true,
            message: " slots found",
          }; // Exit the loop once a matching slot is found
        }
        return {
          success: true,
          message: "no slots found",
          data: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update password: ${error}`,
      };
    }
  }

  async findallDoctor() {
    try {
      const user = await Doctors.find(
        {},
        {
          _id: 1,
          name: 1,
          education: 1,
          qualification: 1,
          image: 1,
          experience: 1,
          certification: 1,
          slots: 1,
          fees: 1,
          isBlocked: 1,
          compensation: 1,
        }
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
  async findTimeSlotsByDate(doctorId: any, date: string) {
    console.log("inside the doctor repository");
    console.log(doctorId, "doctorIdddddd inside repository");
    const doctor = await Doctors.findById(doctorId);
    const email = doctor?.email;

    const pipeline = [
      {
        $match: {
          email: email, // Match doctor by ID
        },
      },
      {
        $unwind: "$slots", // Deconstruct slots array
      },
      {
        $match: {
          "slots.date": date, // Match slots by date
        },
      },
      {
        $project: {
          _id: 0,
          timeslots: "$slots.timeslots", // Project only the timeslots array
        },
      },
    ];

    const result = await Doctors.aggregate(pipeline).exec();
    console.log(result, "resulkthhhhhhhhhhh");

    return result.length > 0 ? result[0].timeslots : []; // Return the timeslots array if found, otherwise an empty array
  }

  async findSlotsByDate(doctorId: string, date: any, timeslots: any) {
    try {
      // Retrieve the doctor document based on the user's ID
      const doctor = await Doctors.findById({ _id: doctorId });

      if (!doctor) {
        throw new Error("Doctor not found");
      }

      // Check if an entry with the provided date already exists in the slots array
      const existingSlotIndex = doctor.slots.findIndex(
        (slot) => slot.date === date
      );

      if (existingSlotIndex !== -1) {
        // If an entry with the date exists, update its timeslots
        doctor.slots[existingSlotIndex].timeslots = timeslots;
      } else {
        // If no entry with the date exists, create a new entry
        doctor.slots.push({ date, timeslots });
      }

      // Save the updated doctor document
      await doctor.save();

      return {
        success: true,
        message: "Slots added successfully",
      };
    } catch (error) {
      console.error("Error adding slots to doctor:", error);
      return {
        success: false,
        message: "Failed to add slots to doctor",
      };
    }
  }

  async findBookedSlotsByDate(doctorId: string, date: any) {
    const doctor = await Doctors.findById(doctorId);
    const email = doctor?.email;
    const pipeline = [
      {
        $match: {
          email: email, // Match doctor by ID
        },
      },
      {
        $unwind: "$bookedSlots", // Deconstruct slots array
      },
      {
        $match: {
          "bookedSlots.date": date, // Match slots by date
        },
      },
      {
        $project: {
          _id: 0,
          timeslots: "$bookedSlots.timeslots", // Project only the timeslots array
        },
      },
    ];

    const result = await Doctors.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].timeslots : [];
  }

  async findallAppointments() {
    try {
      const appointments = await Appointment.find({})
        .populate("userId")
        .populate("doctorId")
        .sort({ slotBooked: -1 });
      console.log(appointments);
      console.log(appointments, "userrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
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

  async todayAppointments(id: string) {
    try {
      const doctor = await Doctors.findById(id);
      const email = doctor?.email;
      const date: Date = new Date();
      let formtDate = date.toLocaleDateString();

      console.log(date, "Today");
      console.log(formtDate, "Today");

      const pipeline = [
        {
          $match: {
            email: email,
          },
        },
        {
          $unwind: "$bookedSlots",
        },
        {
          $match: {
            "bookedSlots.date": formtDate,
          },
        },
        {
          $project: {
            "bookedSlots._id": 1,
          },
        },
      ];
      //
      const appointmentsId = await Doctors.aggregate(pipeline).exec();

      console.log(appointmentsId, "appointment for today");
      if (!appointmentsId) {
        return {
          success: true,
          message: "No data found",
        };
      }
      return {
        success: true,
        message: " data accesses successfully",
        data: appointmentsId,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async cancelAppointment(id: string) {
    try {
      const appointments = await Appointment.findById(id);
      console.log(appointments);

      if (!appointments) {
        return {
          success: true,
          message: "appointment not found",
        };
      }

      let userRefund = appointments.amountPaid;
      const user = await User.findById(appointments.userId);
      if (user) {
        let prev = user.wallet;
        console.log(prev);
        user.wallet += userRefund;
        console.log(460, user.wallet);
        await user.save();
      }
      const doctor = await Doctors.findById(appointments.doctorId);
      if (doctor) {
        const slot = appointments.slotBooked;
        let part = slot.split(" ");
        let datepart = part[0] + " " + part[1] + " " + part[2];
        let timepart = part[3];
        const slotIndex = doctor?.slots.findIndex(
          (item) => item.date === datepart
        );
        if (slotIndex !== -1) {
          doctor.slots[slotIndex].timeslots.push(timepart);
          await doctor.save();
        }
      }
      appointments.status = "Cancelled";
      await appointments.save();
      return {
        success: true,
        message: " data accesses successfully",
        data: appointments,
      };
    } catch (error) {
      console.error("appointment is not found:", error);
      return null;
    }
  }

  async confirmAppointment(id: string) {
    try {
      const appointments = await Appointment.findById(id);
      console.log(appointments, "confirmation");

      if (appointments) {
        console.log();
        appointments.status = "Confirmed";
        await appointments.save();
        return {
          success: true,
          message: " data accesses successfully",
          data: appointments,
        };
      }
      return {
        success: true,
        message: "No data found",
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async AppointmentById(id: string) {
    try {
      const appointments = await Appointment.findById(id);
      console.log(appointments, "confirmation");

      if (appointments) {
        console.log();
        const appStatus = appointments.status;
        await appointments.save();
        return {
          success: true,
          message: " data accesses successfully",
          data: appStatus,
        };
      }
      return {
        success: true,
        message: "No data found",
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async presUpdate(id: string, req: any) {
    try {
      const { diagnosis, medicines, advice } = req.body;
      const appointments = await Appointment.findById(id);
      if (appointments) {
        console.log();
        const response = await Appointment.findByIdAndUpdate(id, {
          diagnosis,
          prescription: medicines,
          advice,
        });
        return {
          success: true,
          message: " appointment data accesses successfully",
          data: response,
        };
      }
      return {
        success: true,
        message: "No data found",
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async completed(id: string) {
    try {
      const appointments = await Appointment.findById(id);
      console.log(appointments, "confirmation");

      if (appointments) {
        console.log();
        appointments.status = "Completed";
        await appointments.save();
        return {
          success: true,
          message: " data accesses successfully",
          data: appointments,
        };
      }
      return {
        success: true,
        message: "No data found",
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async prescriptioncompleted(id: string) {
    try {
      const appointments = await Appointment.findById(id);
      console.log(appointments, "confirmation");

      if (appointments) {
        console.log();
        appointments.status = "Prescribed";
        await appointments.save();
        return {
          success: true,
          message: " data accesses successfully",
          data: appointments,
        };
      }
      return {
        success: true,
        message: "No data found",
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async getDashdata(id: string) {
    try {
      console.log("inside dash repo1", id);

      const appointments = await Appointment.find({ doctorId: id });
      console.log("inside dash repo2");
      console.log(appointments, "appointments dash");
      const doctor = await Doctors.findById(id);
      console.log(doctor, "doctorrrrrr dash  3");
      // Annual details
      const annualAppointments = appointments?.filter((appointment) => {
        const appointmentYear = new Date(appointment?.slotBooked).getFullYear();
        console.log(appointmentYear, "appointment year");
        return appointmentYear === new Date().getFullYear();
      });

      let annualTotalAppointments = 0;
      annualAppointments.forEach((appointment) => {
        annualTotalAppointments++;
      });

      // Monthly details
      const currentMonth = new Date().getMonth();
      const monthlyAppointments = appointments.filter((appointment) => {
        return new Date(appointment.slotBooked).getMonth() === currentMonth;
      });
      console.log(419, monthlyAppointments);
      let monthlyRevenue = 0;
      let monthlyTotalAppointments = 0;
      monthlyAppointments.forEach((appointment) => {
        monthlyRevenue += appointment.amountPaid || 0;
        monthlyTotalAppointments++;
      });

      // Weekly details
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      const weeklyAppointments = appointments.filter(
        (appointment) => new Date(appointment.slotBooked) >= startOfWeek
      );
      let weeklyRevenue = 0;
      let weeklyTotalAppointments = 0;
      weeklyAppointments.forEach((appointment) => {
        weeklyRevenue += appointment.amountPaid || 0;
        weeklyTotalAppointments++;
      });

      // Additional logic for appointments by month
      interface AppointmentData {
        month: any;
        noOfAppointments: number;
        totalAmount: number;
      }

      type AppointmentsByMonth = {
        [key: string]: AppointmentData;
      };
      let appointmentsByMonth: AppointmentsByMonth = {};
      const currentYear = new Date().getFullYear();
      for (let month = 0; month < 12; month++) {
        appointmentsByMonth[`${currentYear}-${month + 1}`] = {
          month: `${currentYear}-${month + 1}`,
          noOfAppointments: 0,
          totalAmount: 0,
        };
      }
      console.log(447, appointmentsByMonth);
      appointments.forEach((appointment) => {
        if (appointment.doctorId.toString() === doctor?._id.toString()) {
          const appointmentYear = new Date(
            appointment.slotBooked
          ).getFullYear();
          if (currentYear === appointmentYear) {
            const month = new Date(appointment.slotBooked).getMonth() + 1;
            const key = `${currentYear}-${month}`;
            if (!appointmentsByMonth[key]) {
              appointmentsByMonth[key] = {
                month: key,
                noOfAppointments: 0,
                totalAmount: 0,
              };
            }
            appointmentsByMonth[key].noOfAppointments++;
            //appointmentsByMonth[key].totalAmount += appointment.amountPaid || 0;
          }
        }
      });
      console.log(463, appointmentsByMonth);
      const response = {
        monthlyAppointments: Object.values(appointmentsByMonth),
        weeklyAppointments,
        weeklyRevenue,
        weeklyTotalAppointments,
        monthlyRevenue,
        monthlyTotalAppointments,
        annualAppointments,

        annualTotalAppointments,
      };
      if (response) {
        return {
          success: true,
          message: " appointment data accesses successfully",
          data: response,
        };
      }
    } catch (error) {
      console.log("error in dashboard data", error);
      return null;
    }
  }
}
export default DoctorRepository;
