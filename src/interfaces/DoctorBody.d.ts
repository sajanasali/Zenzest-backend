interface IDoctorBody {
  name?: string;
  qualification?: string;
  sex?: string;
  password?: string;
  education?: string;
  mobile?: number;
  experience: string;
  email?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  role?: string;
  certification?: string;
  image?: string;
  slots?: Slot[];
  fees?: number;
  bookedSlots?: BookedSlot[];
  status?: "Pending" | "Approved" | "Rejected";
  compensation:number;
}

interface Slot {
  date: string;
  timeslots: TimeSlot[];
}

interface BookedSlot {
  date: string;
  timeslots: string[];
}
export default IDoctorBody;
