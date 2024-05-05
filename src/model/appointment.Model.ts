import mongoose from "mongoose";
import Iappointment from '../interfaces/appointment' ;

const appointmentSchema = new mongoose.Schema<Iappointment>({
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:true
    },
    doctorId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Doctor',
        required:true
    },
    slotBooked:{
        type:String
    },
    status: {
        type: String,
        enum:['Scheduled','Cancelled','Completed','Confirmed'],
        default: "Scheduled",
      },
      
      paymentMode:{
        type:[String],
      },
      amountPaid:{
        type:Number,
      },
      adminAmount:{
        type:Number,
      },
      paymentStatus:{
        type:String
      },
      diagnosis:{
        type:String
      },
      prescription:[
        {
          medicine:{type:String},
          dosage:{type:String},
        }
      ],
      advice:{type:String}

  }, {
    timestamps: true,

});


const AppointmentModel = mongoose.model('Appointment', appointmentSchema)
export default AppointmentModel;
