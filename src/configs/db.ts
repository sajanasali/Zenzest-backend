import mongoose from 'mongoose';

const connectDB = async () => {
 
    const connection = await mongoose.connect('mongodb://127.0.0.1:27017/zenzestMed');
   
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } 

export default connectDB;
