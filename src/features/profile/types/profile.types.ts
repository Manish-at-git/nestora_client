export interface UserDetails {
  id?: string | number;
  user_id?: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
  alt_contact_number?: string;
  address?: string;
  unit_id?: string | number;
  unit_name?: string;
  profile_pic_url?: string | null;
  association_name?: string;
  association_id?: string | number;
  [key: string]: any;
}

export interface FamilyMember {
  id: string | number;
  user_id?: string | number;
  name: string;
  relation?: string;
  email?: string;
  contact_number?: string;
  alt_contact_number?: string;
  age?: number;
  created_at?: string;
  address?: string;
}

export interface UnitHomeowner {
  user_id: string | number;
  name?: string;
  email?: string;
  contact_number?: string;
  alt_contact_number?: string;
  [key: string]: any;
  address?: string;
}

export interface Vehicle {
  id: string | number;
  user_id?: string | number;
  type: "Car" | "Bike" | string;
  registration_number: string;
  insurance_url?: string | null;
  puc_url?: string | null;
  created_at?: string;
}

export interface VehicleFormData {
  id?: string | number;
  type: "Car" | "Bike" | string;
  registration_number: string;
  insurance_url?: string | null;
  puc_url?: string | null;
}

export interface Pet {
  id: string | number;
  user_id?: string | number;
  type: "Dog" | "Cat" | string;
  name: string;
  breed?: string;
  vaccinated?: boolean;
  vaccination_date?: string | null;
  next_vaccination_reminder?: boolean;
  reminder_date?: string | null;
  vaccination_certificate_url?: string | null;
  created_at?: string;
}

export interface PetFormData {
  id?: string | number;
  type: "Dog" | "Cat" | string;
  name: string;
  breed?: string;
  vaccinated?: boolean;
  vaccination_date?: string | null;
  next_vaccination_reminder?: boolean;
  reminder_date?: string | null;
  vaccination_certificate_url?: string | null;
}

export interface Education {
  id: string | number;
  employee_id?: string | number;
  education_level: string;
  degree: string;
  field_of_study?: string;
  institution: string;
  board_university?: string;
  start_date?: string;
  end_date?: string;
  currently_studying?: boolean;
  grade?: string;
  location?: string;
  description?: string;
  certificate_url?: string | null;
  created_at?: string;
}

export interface EducationFormData {
  id?: string | number;
  education_level: string;
  degree: string;
  field_of_study?: string;
  institution: string;
  board_university?: string;
  start_date?: string;
  end_date?: string;
  currently_studying?: boolean;
  grade?: string;
  location?: string;
  description?: string;
  certificate_url?: string | null;
}

export interface Experience {
  id: string | number;
  employee_id?: string | number;
  job_title: string;
  employment_type: string;
  company: string;
  industry?: string;
  location?: string;
  work_mode?: string;
  start_date: string;
  end_date?: string;
  currently_working?: boolean;
  description?: string;
  skills?: string;
  website_url?: string;
  certificate_url?: string | null;
  created_at?: string;
}

export interface ExperienceFormData {
  id?: string | number;
  job_title: string;
  employment_type: string;
  company: string;
  industry?: string;
  location?: string;
  work_mode?: string;
  start_date: string;
  end_date?: string;
  currently_working?: boolean;
  description?: string;
  skills?: string;
  website_url?: string;
  certificate_url?: string | null;
}

export interface ProfileData {
  ok?: boolean;
  user_details: UserDetails;
  family_members: FamilyMember[];
  unit_homeowners: UnitHomeowner[];
  vehicles: Vehicle[];
  pets: Pet[];
  education: Education[];
  experience: Experience[];
  association_name?: string;
  association_id?: string | number;
}
