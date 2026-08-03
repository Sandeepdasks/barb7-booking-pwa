import { SalonProfile, WorkingHours } from "../types/salon";

// Mirrors Firestore doc: workingHours/{salonId}
// Sunday IS a working day by default. Nothing here is hardcoded into components —
// owner edits will replace this object 1:1 once Firestore reads land.
export const mockWorkingHours: WorkingHours = {
  monday:    { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
  tuesday:   { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
  wednesday: { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
  thursday:  { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
  friday:    { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
  saturday:  { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
  sunday:    { openTime: "09:00", closeTime: "21:00", isClosed: false, slotDurationMinutes: 30 },
};

// Mirrors Firestore doc: salons/{salonId}
export const mockSalonProfile: SalonProfile = {
  salonId: "barb7-vayanasala",
  name: "BARB7 UNISEX SALON",
  tagline: "Premium Grooming Experience",
  rating: 4.9,
  address: "Vayanasala Rd, Kochi, Kerala",
  phone: "+91 81293 45995",
  logoUrl: "/src/assets/logo.png",
  coverImageUrl: "/src/assets/landing-cover.jpg",
  services: [
    { id: "hair-cut", name: "Hair Cut", icon: "Scissors", durationMinutes: 30 },
    { id: "beard-trim", name: "Beard Trim", icon: "Zap", durationMinutes: 30 },
    { id: "hair-spa", name: "Hair Spa", icon: "Droplet", durationMinutes: 60 },
    { id: "hair-colour", name: "Hair Colour", icon: "Palette", durationMinutes: 120 },
    { id: "facial", name: "Facial", icon: "Sparkles", durationMinutes: 90 },
  ],
};