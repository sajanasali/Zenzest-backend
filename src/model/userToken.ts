import mongoose from "mongoose";
import { Usertoken } from "../interfaces/token";

const UsertokenSchema=new mongoose.Schema<Usertoken>({
      userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        require:true
      },
      token:{
        type:String,
        require:true
      }
     

})
const usertoken=mongoose.model('usertoekn',UsertokenSchema);
export default usertoken;