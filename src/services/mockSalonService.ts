import { SalonInfo, ServiceItem } from '../types/salon';

const MOCK_SALON: SalonInfo = {
  salonId: 'barb7',
  name: 'BARB7 UNISEX SALON',
  tagline: 'Premium Grooming Experience',
  rating: 4.9,
  address: 'Vayanasala Junction, Kochi, Kerala',
  phone: '+91 81293 45995',
  about:
    'BARB7 blends classic barbering with modern styling — hair, skin, and makeup services delivered by a team that treats every chair like the only chair.',
};

const MOCK_SERVICES: ServiceItem[] = [
  { id: 'svc-haircut', name: 'Hair Cut', durationMinutes: 30, icon: '✂️' },
  { id: 'svc-beard', name: 'Beard Trim', durationMinutes: 20, icon: '🪒' },
  { id: 'svc-spa', name: 'Hair Spa', durationMinutes: 45, icon: '💆' },
  { id: 'svc-colour', name: 'Hair Colour', durationMinutes: 60, icon: '🎨' },
  { id: 'svc-facial', name: 'Facial', durationMinutes: 40, icon: '✨' },
];

export async function fetchSalonInfo(): Promise<SalonInfo> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_SALON;
}

export async function fetchServices(): Promise<ServiceItem[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_SERVICES;
}