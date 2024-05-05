interface Iappointment {
  userId: User;
  doctorId: Doctor;
  slotBooked: string;
  status: "Scheduled" | "Cancelled" | "Completed" | "Confirmed";
  paymentMode: string[];
  amountPaid: number;
  adminAmount: number;
  paymentStatus: string;
  diagnosis: string;
  prescription: MedicineDosage[];
  advice: string;
  timestamps: boolean;
}
interface MedicineDosage {
  medicine: string;
  dosage: string;
}
interface User {
  _id: mongoose.Types.ObjectId;
  // Add other properties from your 'User' schema here
}
interface Doctor {
  _id: mongoose.Types.ObjectId;
}
export default Iappointment;
