import { Schema } from "mongoose"
import IDoctor from "../interfaces/doctors";
import mongoose from "mongoose"
 

const userSchema=new mongoose.Schema<IDoctor>({

       name:{
             type:String
             

       } ,
        
       email:{
        type:String
        
       } ,
       sex:{
        type:String
       
       } ,
       
       mobile:{
        type:Number
        
       } ,
       
       password:{
        type:String
       
       },
       role:{
            type:String,
            
       },
       qualification:{
          type:String
       },
       experience:{
          type:String
       },
       education:{
          type:String
       },
       certification:{
          type:String
       },
       image:{
          type:String
       },
       fees:{
           type:Number,
           default:500
       },
       slots:[
         {
           date:{
             type:String
           },
           timeslots:{
             type:Array
           }
         }
       ],
       bookedSlots:[
         {
           date:{
             type:String
           },
           timeslots:{
             type:Array
           }
         }
       ],
       status:{
         type:String,
         enum:['Pending','Approved','Rejected'],
         default:'Pending'
       },
       isBlocked:{
        type:Boolean,
        default:false
       } ,
       isVerified:{
            type:Boolean,
            default:false
       } ,
       compensation:{
        type:Number,
        default:0,
       }
      



})
const DoctorModel = mongoose.model("Doctor", userSchema)
export default DoctorModel;