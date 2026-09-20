const SUPER_ADMIN = "super_admin"
const ADMIN = "admin"
const COMMITTEE_MEMBER = "committee_member"
const BOARD_MEMBER = "board_member"
const HOMEOWNER = "homeowner"
const SECURITY = "security"
const TENANT = "tenant"
const ACCOUNTANT = "accountant"
const CSR = "csr"

export const ROLES_STRING = {
    SUPER_ADMIN,
    ADMIN,
    COMMITTEE_MEMBER,
    BOARD_MEMBER,
    HOMEOWNER,
    SECURITY,
    TENANT,
    ACCOUNTANT,
    CSR
}

export const ROLES = [
    { label: SUPER_ADMIN, value: 1 },
    { label: ADMIN, value: 2 },
    { label: COMMITTEE_MEMBER, value: 3 },
    { label: BOARD_MEMBER, value: 4 },
    { label: HOMEOWNER, value: 5 },
    { label: SECURITY, value: 6 },
    { label: TENANT, value: 7 },
    { label: ACCOUNTANT, value: 8 },
    { label: CSR, value: 9 },
];

export const VEHICLE_TYPES = [
    { value: "car", label: "Car / Four-Wheeler" },
    { value: "bike", label: "Motorcycle / Two-Wheeler" },
    { value: "bicycle", label: "Bicycle / Cycle" },
    { value: "other", label: "Other Vehicle" },
];

export const PET_TYPES = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "fish", label: "Fish" },
    { value: "other", label: "Other" },
];

export const DOG_BREEDS = [
    { value: "golden_retriever", label: "Golden Retriever" },
    { value: "labrador", label: "Labrador" },
    { value: "german_shepherd", label: "German Shepherd" },
    { value: "bulldog", label: "Bulldog" },
    { value: "beagle", label: "Beagle" },
    { value: "poodle", label: "Poodle" },
    { value: "rottweiler", label: "Rottweiler" },
    { value: "indie_mixed", label: "Indie / Mixed" },
    { value: "other", label: "Other" },
];

export const CAT_BREEDS = [
    { value: "persian", label: "Persian" },
    { value: "siamese", label: "Siamese" },
    { value: "maine_coon", label: "Maine Coon" },
    { value: "bengal", label: "Bengal" },
    { value: "british_shorthair", label: "British Shorthair" },
    { value: "indie_domestic_shorthair", label: "Indie / Domestic Shorthair" },
    { value: "other", label: "Other" },
];

export const EDUCATION_LEVELS = [
    { value: "school", label: "High School / Secondary School" },
    { value: "diploma", label: "Diploma / Polytechnic" },
    { value: "bachelor", label: "Bachelor's Degree (Undergraduate)" },
    { value: "master", label: "Master's Degree (Postgraduate)" },
    { value: "phd", label: "Doctorate / PhD" },
    { value: "other", label: "Other / Certification" },
];

export const EMPLOYMENT_TYPES = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
];

export const WORK_MODES = [
    { value: "on_site", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
];