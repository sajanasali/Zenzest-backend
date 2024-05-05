interface IDoctor {
  name: string;
  qualification: string;
  sex: string;
  password: string;
  education: string;
  mobile: number;
  experience: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
  role: string;
  certification: string;
  image: string;
  fees: number;
  slots: Slot[];
  bookedSlots: BookedSlot[];
  status: "Pending" | "Approved" | "Rejected";
  compensation:number;
}
export interface Slot {
  date: string;
  timeslots: TimeSlot[];
}
// type Slot={
//     date: string;
//     timeslots: TimeSlot[];
// }

interface BookedSlot {
  date: string;
  timeslots: string[];
}
export default IDoctor;
