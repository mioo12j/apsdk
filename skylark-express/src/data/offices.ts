// ─────────────────────────────────────────────────────────────────────────────
// OFFICE DIRECTORY — one record per listed location. Edit here; the map, the
// directory, search and structured data all read from this file.
//   kind: 'hq' | 'registered' | 'branch'  → published address and phone
//   kind: 'city'                          → city-level listing, details via the central team
// Coordinates: `precise: false` means the marker is centred on the locality/city
// (labelled "City location" on the map), not on a surveyed office position.
// ─────────────────────────────────────────────────────────────────────────────
export type Office = {
  id: string; city: string; label: string; kind: 'hq' | 'registered' | 'branch' | 'city';
  typeLabel: string; region: string; state: string; address?: string; pin?: string;
  phone?: string; aliases: string[]; lat: number; lon: number; precise: boolean;
};
const CENTRAL = '+91 11 4166 6666';
export const offices: Office[] = [
  { id: 'gurugram-hq', city: 'Gurugram', label: 'Gurugram headquarters', kind: 'hq', typeLabel: 'Corporate headquarters', region: 'Delhi NCR', state: 'Haryana', address: 'Sector 17–18 Divider Road, Sector 18, Gurugram, Haryana 122022', pin: '122022', phone: CENTRAL, aliases: ['gurgaon', 'gurugram', 'ncr', 'delhi ncr', 'haryana', 'head office', 'headquarters', 'hq', 'corporate office'], lat: 28.4925, lon: 77.0700, precise: false },
  { id: 'new-delhi-registered', city: 'New Delhi', label: 'New Delhi registered office', kind: 'registered', typeLabel: 'Registered office', region: 'Delhi NCR', state: 'Delhi', address: '101-C, Ground Floor, Hari Nagar, Ashram, New Delhi 110014', pin: '110014', phone: CENTRAL, aliases: ['delhi', 'new delhi', 'ashram', 'hari nagar', 'registered office', 'ncr', 'delhi ncr'], lat: 28.5722, lon: 77.2590, precise: false },
  { id: 'new-delhi-moti-nagar', city: 'New Delhi', label: 'New Moti Nagar branch', kind: 'branch', typeLabel: 'Branch', region: 'Delhi NCR', state: 'Delhi', address: 'SH 4/53, New Moti Nagar, New Delhi 110015', pin: '110015', phone: '+91 92666 66360', aliases: ['delhi', 'new delhi', 'moti nagar', 'new moti nagar', 'ncr', 'delhi ncr', 'west delhi'], lat: 28.6606, lon: 77.1425, precise: false },
  { id: 'noida', city: 'Noida', label: 'Noida branch', kind: 'branch', typeLabel: 'Branch', region: 'Delhi NCR', state: 'Uttar Pradesh', address: 'B-074, Sector 69, Noida 201301', pin: '201301', phone: '+91 84488 99677', aliases: ['noida', 'ncr', 'delhi ncr', 'uttar pradesh', 'up', 'gautam buddha nagar'], lat: 28.6090, lon: 77.3870, precise: false },
  { id: 'bhiwandi', city: 'Bhiwandi', label: 'Mumbai region · Bhiwandi branch', kind: 'branch', typeLabel: 'Branch', region: 'West', state: 'Maharashtra', address: 'Bhoir Compound, Pimplas Building 1, near Jai Jalaram Compound, Pimplas Village, Bhiwandi 421302', pin: '421302', phone: '+91 73039 00473', aliases: ['mumbai', 'bombay', 'bhiwandi', 'thane', 'maharashtra', 'mumbai region', 'pimplas'], lat: 19.2813, lon: 73.0483, precise: false },
  { id: 'kolkata', city: 'Kolkata', label: 'Kolkata branch', kind: 'branch', typeLabel: 'Branch', region: 'East', state: 'West Bengal', address: 'Sukur Ali More, Durganagar Road No. 2, Airport, Kolkata 700079', pin: '700079', phone: '+91 73835 56621', aliases: ['kolkata', 'calcutta', 'west bengal', 'durganagar', 'dum dum'], lat: 22.6480, lon: 88.4170, precise: false },
  { id: 'bengaluru', city: 'Bengaluru', label: 'Bengaluru branch', kind: 'branch', typeLabel: 'Branch', region: 'South', state: 'Karnataka', address: '90/1, 4th Cross, K S Garden, Lalbagh Road, Bengaluru 560027', pin: '560027', phone: '+91 95356 32716', aliases: ['bengaluru', 'bangalore', 'bengalooru', 'karnataka', 'lalbagh'], lat: 12.9580, lon: 77.5870, precise: false },
  { id: 'chandigarh', city: 'Chandigarh', label: 'Chandigarh branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Chandigarh', address: 'Opposite Verka Booth, Village Buterla, Sector 41, Chandigarh 160036', pin: '160036', phone: '+91 84488 99699', aliases: ['chandigarh', 'tricity', 'mohali', 'panchkula', 'buterla'], lat: 30.7090, lon: 76.7420, precise: false },
  { id: 'ambala', city: 'Ambala Cantt', label: 'Ambala Cantt branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Haryana', address: 'Shop 14A, Lal Kurti Bazar, near Bus Stand, Ambala Cantt 133001', pin: '133001', phone: '+91 84488 99701', aliases: ['ambala', 'ambala cantt', 'ambala cantonment', 'haryana'], lat: 30.3440, lon: 76.8380, precise: false },
  { id: 'ludhiana', city: 'Ludhiana', label: 'Ludhiana branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Punjab', address: 'Dana Mandi, Gill Road, Ludhiana 141003', pin: '141003', phone: '+91 98721 61973', aliases: ['ludhiana', 'punjab', 'gill road'], lat: 30.8800, lon: 75.8540, precise: false },
  { id: 'jalandhar', city: 'Jalandhar', label: 'Jalandhar branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Punjab', address: 'SCO 1, Hotel Diamond, Nehru Garden Road, Jalandhar 144001', pin: '144001', phone: '+91 84271 45144', aliases: ['jalandhar', 'jullundur', 'punjab'], lat: 31.3260, lon: 75.5760, precise: false },
  { id: 'amritsar', city: 'Amritsar', label: 'Amritsar branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Punjab', address: 'Shop 206, Laxmi Market, Kucha Kalyan Das, Amritsar 143001', pin: '143001', phone: '+91 98885 06096', aliases: ['amritsar', 'punjab'], lat: 31.6340, lon: 74.8723, precise: false },
  { id: 'bathinda', city: 'Bathinda', label: 'Bathinda branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Punjab', address: 'Bibi Wala Chowk, near Vyom Telicom, Bathinda 151001', pin: '151001', phone: '+91 93572 10004', aliases: ['bathinda', 'bhatinda', 'punjab'], lat: 30.2110, lon: 74.9455, precise: false },
  { id: 'srinagar', city: 'Srinagar', label: 'Srinagar branch', kind: 'branch', typeLabel: 'Branch', region: 'North', state: 'Jammu and Kashmir', address: 'Ground Floor, Rehmat Building, Government Medical College Road, Karan Nagar, Srinagar 190010', pin: '190010', phone: '+91 94190 62455', aliases: ['srinagar', 'kashmir', 'jammu and kashmir', 'j&k', 'karan nagar'], lat: 34.0837, lon: 74.7973, precise: false },
  ...([
    ['bhopal', 'Bhopal', 'Central', 'Madhya Pradesh', ['bhopal', 'madhya pradesh', 'mp'], 23.2599, 77.4126],
    ['kochi', 'Kochi', 'South', 'Kerala', ['kochi', 'cochin', 'ernakulam', 'kerala'], 9.9312, 76.2673],
    ['chennai', 'Chennai', 'South', 'Tamil Nadu', ['chennai', 'madras', 'tamil nadu'], 13.0827, 80.2707],
    ['hyderabad', 'Hyderabad', 'South', 'Telangana', ['hyderabad', 'secunderabad', 'telangana'], 17.3850, 78.4867],
    ['bhubaneswar', 'Bhubaneswar', 'East', 'Odisha', ['bhubaneswar', 'bhubaneshwar', 'odisha', 'orissa'], 20.2961, 85.8245],
    ['patna', 'Patna', 'East', 'Bihar', ['patna', 'bihar'], 25.5941, 85.1376],
    ['lucknow', 'Lucknow', 'North', 'Uttar Pradesh', ['lucknow', 'uttar pradesh', 'up'], 26.8467, 80.9462],
    ['dehradun', 'Dehradun', 'North', 'Uttarakhand', ['dehradun', 'dehra dun', 'uttarakhand'], 30.3165, 78.0322],
    ['jaipur', 'Jaipur', 'North', 'Rajasthan', ['jaipur', 'rajasthan'], 26.9124, 75.7873],
    ['jammu', 'Jammu', 'North', 'Jammu and Kashmir', ['jammu', 'jammu and kashmir', 'j&k'], 32.7266, 74.8570],
    ['pune', 'Pune', 'West', 'Maharashtra', ['pune', 'poona', 'maharashtra'], 18.5204, 73.8567],
    ['nagpur', 'Nagpur', 'Central', 'Maharashtra', ['nagpur', 'maharashtra', 'vidarbha'], 21.1458, 79.0882],
    ['ranchi', 'Ranchi', 'East', 'Jharkhand', ['ranchi', 'jharkhand'], 23.3441, 85.3096],
  ] as const).map(([id, city, region, state, aliases, lat, lon]): Office => ({
    id, city, label: `${city}${id === 'kochi' ? ' (Cochin)' : ''}`, kind: 'city', typeLabel: 'Listed city', region, state,
    aliases: [...aliases], lat, lon, precise: false,
  })),
];
export const regionOrder = ['Delhi NCR', 'North', 'West', 'Central', 'East', 'South'];
export const telHref = (display: string) => 'tel:' + display.replace(/[^\d+]/g, '');
export const mapsHref = (address: string) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Skylark Express, ' + address);
