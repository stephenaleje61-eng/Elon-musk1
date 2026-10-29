import { TeslaVehicle } from '../types';

export const TESLA_FLEET: TeslaVehicle[] = [
  {
    id: 'model-s-plaid',
    name: 'Model S Plaid',
    tagline: 'Beyond Ludicrous — Tri-Motor All-Wheel Drive',
    priceUSD: 89990,
    rangeMiles: 359,
    acceleration0to60: 1.99,
    topSpeedMph: 200,
    peakPowerHp: 1020,
    seating: 5,
    driveTrain: 'Tri-Motor All-Wheel Drive with Torque Vectoring',
    superchargingSpeed: 'Up to 200 miles in 15 minutes (250 kW Max)',
    image: '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
    gallery: [
      '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
      '/src/assets/images/space_hero_launch_1793254068348.jpg'
    ],
    category: 'Sedan',
    officialTeslaUrl: 'https://www.tesla.com/models',
    specs: {
      weightLbs: 4766,
      cargoCuFt: 28,
      powertrain: 'Tri-Motor AWD with carbon-sleeved rotors',
      dragCoefficient: '0.208 Cd'
    }
  },
  {
    id: 'model-3-performance',
    name: 'Model 3 Performance',
    tagline: 'Precision Aerodynamics & Adaptive Track Damping',
    priceUSD: 54990,
    rangeMiles: 303,
    acceleration0to60: 2.9,
    topSpeedMph: 163,
    peakPowerHp: 510,
    seating: 5,
    driveTrain: 'Dual Motor All-Wheel Drive',
    superchargingSpeed: 'Up to 175 miles in 15 minutes (250 kW Max)',
    image: '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
    gallery: [
      '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg'
    ],
    category: 'Sedan',
    officialTeslaUrl: 'https://www.tesla.com/model3',
    specs: {
      weightLbs: 4054,
      cargoCuFt: 24,
      powertrain: 'High-Output Performance Dual Motor',
      dragCoefficient: '0.219 Cd'
    }
  },
  {
    id: 'cybertruck-cyberbeast',
    name: 'Cybertruck Cyberbeast',
    tagline: 'Shatter-Resistant Armor Glass & Stainless-Steel Exoskeleton',
    priceUSD: 99990,
    rangeMiles: 320,
    acceleration0to60: 2.6,
    topSpeedMph: 130,
    peakPowerHp: 845,
    seating: 5,
    driveTrain: 'Cyberbeast Tri-Motor AWD with Steer-by-Wire',
    superchargingSpeed: 'Up to 136 miles in 15 minutes (350 kW Native 800V)',
    image: '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
    gallery: [
      '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg'
    ],
    category: 'Truck',
    officialTeslaUrl: 'https://www.tesla.com/cybertruck',
    specs: {
      weightLbs: 6843,
      cargoCuFt: 121,
      powertrain: 'Tri-Motor 800V Architecture',
      dragCoefficient: '0.34 Cd'
    }
  },
  {
    id: 'model-x-plaid',
    name: 'Model X Plaid',
    tagline: 'Falcon Wing Doors & Panoramic Windshield',
    priceUSD: 94990,
    rangeMiles: 326,
    acceleration0to60: 2.5,
    topSpeedMph: 163,
    peakPowerHp: 1020,
    seating: 6,
    driveTrain: 'Tri-Motor All-Wheel Drive',
    superchargingSpeed: 'Up to 175 miles in 15 minutes (250 kW Max)',
    image: '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
    gallery: [
      '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg'
    ],
    category: 'SUV',
    officialTeslaUrl: 'https://www.tesla.com/modelx',
    specs: {
      weightLbs: 5390,
      cargoCuFt: 88,
      powertrain: 'Tri-Motor High Performance Platform',
      dragCoefficient: '0.24 Cd'
    }
  },
  {
    id: 'model-y-long-range',
    name: 'Model Y Long Range AWD',
    tagline: 'Maximum Utility & Dual Motor Stability',
    priceUSD: 47990,
    rangeMiles: 310,
    acceleration0to60: 4.8,
    topSpeedMph: 135,
    peakPowerHp: 384,
    seating: 7,
    driveTrain: 'Dual Motor All-Wheel Drive',
    superchargingSpeed: 'Up to 162 miles in 15 minutes (250 kW Max)',
    image: '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
    gallery: [
      '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg'
    ],
    category: 'SUV',
    officialTeslaUrl: 'https://www.tesla.com/modely',
    specs: {
      weightLbs: 4363,
      cargoCuFt: 76,
      powertrain: 'Induction Front + Permanent Magnet Rear',
      dragCoefficient: '0.23 Cd'
    }
  },
  {
    id: 'roadster-next-gen',
    name: 'Tesla Roadster',
    tagline: 'The Quickest Car in the World — Aero & SpaceX Thruster Package',
    priceUSD: 200000,
    rangeMiles: 620,
    acceleration0to60: 1.1,
    topSpeedMph: 250,
    peakPowerHp: 1500,
    seating: 4,
    driveTrain: 'All-Wheel Drive with SpaceX Cold Gas Thrusters',
    superchargingSpeed: '200 kWh Battery Pack with Ultra-Fast DC Chg',
    image: '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg',
    gallery: [
      '/src/assets/images/tesla_showroom_fleet_1793254069056.jpg'
    ],
    category: 'Supercar',
    officialTeslaUrl: 'https://www.tesla.com/roadster',
    specs: {
      weightLbs: 4100,
      cargoCuFt: 18,
      powertrain: 'High-Density 200 kWh Energy Pack + Thrusters',
      dragCoefficient: '0.19 Cd'
    }
  }
];

export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  CAD: { symbol: 'CA$', rate: 1.36, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  CHF: { symbol: 'CHF ', rate: 0.90, name: 'Swiss Franc' },
  JPY: { symbol: '¥', rate: 154.5, name: 'Japanese Yen' },
};
