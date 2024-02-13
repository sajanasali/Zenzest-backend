import mongoose from "mongoose";



interface User {
    _id: mongoose.Types.ObjectId;
    // Add other properties from your 'User' schema here
  }
export interface Usertoken{
    userId:User|any,
    token:string
}