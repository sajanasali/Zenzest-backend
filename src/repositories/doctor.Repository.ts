import Doctors from '../model/doctor.Model';

import DoctorBody from '../interfaces/DoctorBody';
class DoctorRepository{

async createUser(details:DoctorBody){
   try{
    console.log("user repository")
    const userDetails = await Doctors.create(details);
    // const userDetails = await Users.create(details).catch((error) => {
    //   console.error('Validation error:', error.errors);
    // });
    console.log("userdetails",userDetails)
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
          role:userDetails.role
          
        },
      };
        
   }catch(error){
    return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
   }
}


async authenticateDoctor(email: string) {
    try {
      console.log("inside the doctor repository")
      const userDetails = await Doctors.findOne({ email: email });
      console.log("userdetails",userDetails)
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

  async  findUserIdByEmail(email: string) {
    try {
      const user = await Doctors.findOne({ email });
        // Replace 'email' with the actual field name in your schema
      //return user ? user._id.toString() : null;
      return user ? user._id.toString() : '';
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
 }
 async  updatePasswordByEmail(email: string,newPassword:string) {
  try {
    // Assuming you have a password field in your Users model
     // Replace this with the new password
     console.log("email updation")
    const updatePassword = await Doctors.findOneAndUpdate(
      { email: email },
      { $set: { password: newPassword } },
      { new: true }
    );
  console.log("updated password",updatePassword)
    if (updatePassword) {
      return {
        success: true,
        message: 'User password updated',
        data: updatePassword,
      };
    } else {
      return {
        success: false,
        message: 'User not found with the provided email',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to update password: ${error}`,
    };
  }
}

}
export default DoctorRepository;