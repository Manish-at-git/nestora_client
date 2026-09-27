export const NEARBY_CATEGORIES = [
  { value: "all", label: "All Places" },
  { value: "event", label: "Nearby Events" },
  { value: "gym", label: "Gym & Fitness" },
  { value: "salon", label: "Salon & Spa" },
  { value: "emergency", label: "Emergency" },
  { value: "health", label: "Health & Care" },
  { value: "groceries", label: "Groceries" },
  { value: "dining", label: "Food & Dining" },
  { value: "education", label: "Schools" },
  { value: "fuel", label: "Fuel & EV" },
  { value: "banks", label: "Banks & ATM" },
  { value: "services", label: "Home Services" },
  { value: "other", label: "Other" },
] as const;

export const NEARBY_EMERGENCY_CONTACTS = [
  { name: "Police Helpline", number: "100", subtitle: "Local Control Room" },
  {
    name: "Medical Emergency",
    number: "102 / 108",
    subtitle: "Ambulance Response",
  },
  { name: "Fire Station", number: "101", subtitle: "Emergency Dispatch" },
  {
    name: "Society Main Gate",
    number: "--",
    // number: "+91 98765 43210",
    subtitle: "Security Desk (24/7)",
  },
  {
    name: "Estate Manager",
    number: "--",
    // number: "+91 98765 11223",
    subtitle: "Facility Management",
  },
] as const;

/** Empty initial values ensure every new catalogue entry is entered manually. */
export const EMPTY_NEARBY_PLACE_VALUES = {
  name: "",
  category: "",
  distance: "",
  rating: undefined,
  reviews: undefined,
  status: "",
  address: "",
  phone: "",
  image: "",
  tags: "",
  website: "",
  is_active: false,
};
