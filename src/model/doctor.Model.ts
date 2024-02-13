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
       isBlocked:{
        type:Boolean,
        default:false
       } ,
       isVerified:{
            type:Boolean,
            default:false
       } 
      



})
const DoctorModel = mongoose.model("Doctor", userSchema)
export default DoctorModel;