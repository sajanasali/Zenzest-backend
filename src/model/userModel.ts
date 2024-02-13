import { Schema } from "mongoose"
import IUser from "../interfaces/userInterface"
import mongoose from "mongoose"
 

const userSchema=new mongoose.Schema<IUser>({

       name:{
             type:String
             

       } ,
        
       email:{
        type:String
        
       } ,
       sex:{
        type:String
       
       } ,
       age:{
        type:Number
        
       } ,
       mobile:{
        type:Number
        
       } ,
       address:{
        type:String
        
       },
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
const userModel = mongoose.model("User", userSchema)
export default userModel