import mongoose from "mongoose";
import {IOTP} from '../interfaces/otp';

const OtpSchema=new mongoose.Schema<IOTP>({
      email:{
        type:String,
        require:true
      },
      otp:{
        type:String,
        require:true
      }
     

})
const OTP=mongoose.model('otp',OtpSchema);
export default OTP;