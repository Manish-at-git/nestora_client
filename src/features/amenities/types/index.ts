export interface Amenity {
  id: string | number;
  association_id?: string | number;
  association_name?: string;
  name: string;
  charges: number | string;
  status: boolean | number;
  created_at?: string;
}

export interface AmenityBooking {
  id: string | number;
  amenity_id: string | number;
  amenity_name?: string;
  association_id?: string | number;
  association_name?: string;
  user_id?: string | number;
  homeowner_name?: string;
  unit_number?: string;
  contact_no?: string;
  amount: number | string;
  booking_date: string;
  payment_status: "Confirmed" | "Pending" | "Failed" | string;
  start_time: string | number;
  end_time: string | number;
  duration_hours?: number;
  created_at?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  duration: number;
}

export interface AmenityCreateInput {
  name: string;
  charges: number;
  status?: boolean;
}

export interface AmenityBookingInput {
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  payment_method: "wallet" | "upi";
  pin?: string;
}

export interface MonthBookingSlot {
  booking_date: string;
  start_time: string | number;
  end_time: string | number;
  duration_hours?: number;
  homeowner_name?: string;
  unit_number?: string;
}
