import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
const connectDB = async () => {
 
    //const connection = await mongoose.connect('mongodb://127.0.0.1:27017/zenzestMed');
    const mongodbUrl: string = process.env.MONGODB_URL as string;
    const connection = await mongoose.connect(mongodbUrl);
   
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } 

export default connectDB;
