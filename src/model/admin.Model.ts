import { IAdmin } from "../interfaces/admin";
import mongoose from "mongoose"

const adminSchema=new mongoose.Schema<IAdmin>({

    name:{
          type:String
          

    },
   password:{
        type:String
        

  },
  email:{
    type:String
    

},
role:{
    type:String
    

},
commission:{
    type:Number,
    default:0
  },
  compensation:{
    type:Number,
    default:0
  }
})

const AdminModel = mongoose.model("Admindata", adminSchema)
export default AdminModel;