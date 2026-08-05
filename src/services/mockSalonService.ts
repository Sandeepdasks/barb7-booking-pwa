import type { SalonProfile, WorkingHours } from "../types/salon";
import landingCover from "../assets/landing-cover.jpg";

// Mirrors Firestore doc: workingHours/{salonId}
// Owner-approved BARB7 schedule
export const mockWorkingHours: WorkingHours = {
  monday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: true,
    slotDurationMinutes: 15,
  },
  tuesday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: false,
    slotDurationMinutes: 15,
  },
  wednesday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: false,
    slotDurationMinutes: 15,
  },
  thursday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: false,
    slotDurationMinutes: 15,
  },
  friday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: false,
    slotDurationMinutes: 15,
  },
  saturday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: false,
    slotDurationMinutes: 15,
  },
  sunday: {
    openTime: "09:30",
    closeTime: "20:00",
    isClosed: false,
    slotDurationMinutes: 15,
  },
};

// Mirrors Firestore doc: salons/{salonId}
export const mockSalonProfile: SalonProfile = {
  salonId: "barb7-vayanasala",
  name: "BARB7 UNISEX SALON",
  tagline: "Premium Grooming",
  rating: 4.9,
  address: "Vayanasala, Kakkanad, Kochi",
  phone: "+91 88987 98987",

  // Use the imported local asset so Vite bundles it correctly
  logoUrl: "/logo.png", // replace with an imported logo later if you add one
  coverImageUrl: landingCover,

  services: [
    {
      id: "hair-cut",
      name: "Hair Cut",
      icon: "Scissors",
      durationMinutes: 30,
    },
    {
      id: "hair-cut-beard",
      name: "Hair Cut + Beard",
      icon: "Crown",
      durationMinutes: 45,
    },
    {
      id: "beard-dressing",
      name: "Beard Dressing",
      icon: "Sparkles",
      durationMinutes: 15,
    },
    {
      id: "facial",
      name: "Facial",
      icon: "Palette",
      durationMinutes: 90,
    },
    {
      id: "face-clean-up",
      name: "Face Clean Up",
      icon: "Droplet",
      durationMinutes: 30,
    },
    {
      id: "d-tan",
      name: "D-Tan",
      icon: "Sun",
      durationMinutes: 30,
    },
  ],
};