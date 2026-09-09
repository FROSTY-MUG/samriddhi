export const INDIA_LOCATIONS: Record<string, string[]> = {
  Delhi: ['Central Delhi', 'New Delhi', 'South Delhi'],
  Maharashtra: ['Mumbai City', 'Pune', 'Aurangabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
  Karnataka: ['Bengaluru Urban', 'Bengaluru Rural'],
  'Uttar Pradesh': ['Lucknow', 'Moradabad'],
  'West Bengal': ['Kolkata'],
  Telangana: ['Hyderabad'],
  Rajasthan: ['Jaipur'],
  Bihar: ['Patna']
};

export const STATES = Object.keys(INDIA_LOCATIONS);

export function districtsForState(state: string): string[] {
  return INDIA_LOCATIONS[state] || [];
}

export function detectLocationFromCoordinates(latitude: number, longitude: number): { state: string; district: string } | null {
  const points = [
    { state: 'Delhi', district: 'Central Delhi', lat: 28.63, lng: 77.21 },
    { state: 'Maharashtra', district: 'Mumbai City', lat: 19.07, lng: 72.87 },
    { state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.97, lng: 77.59 },
    { state: 'Tamil Nadu', district: 'Chennai', lat: 13.08, lng: 80.27 },
    { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.85, lng: 80.95 },
    { state: 'Telangana', district: 'Hyderabad', lat: 17.39, lng: 78.49 },
    { state: 'West Bengal', district: 'Kolkata', lat: 22.57, lng: 88.36 },
    { state: 'Rajasthan', district: 'Jaipur', lat: 26.91, lng: 75.79 },
    { state: 'Bihar', district: 'Patna', lat: 25.61, lng: 85.13 }
  ];
  const nearest = points.sort((a, b) => ((a.lat - latitude) ** 2 + (a.lng - longitude) ** 2) - ((b.lat - latitude) ** 2 + (b.lng - longitude) ** 2))[0];
  return nearest && Math.hypot(nearest.lat - latitude, nearest.lng - longitude) < 1.2 ? nearest : null;
}
