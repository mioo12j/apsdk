import { services } from './services';
export const ORIGIN = 'https://www.skylarkexpressdelhi.com';
export const mainNav = [
  { href: '/services', label: 'Services' },
  { href: '/industries', label: 'Industries' },
  { href: '/network', label: 'Network' },
];
export const companyNav = [
  { href: '/about', label: 'About' },
  { href: '/technology', label: 'Technology' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];
export const footerNav = {
  'Shipping tools': [
    { href: '/track', label: 'Track a shipment' }, { href: '/quote', label: 'Get a freight quote' },
    { href: '/serviceability', label: 'Check a PIN code' }, { href: '/network', label: 'Find a branch' }, { href: '/help', label: 'Help and FAQs' },
  ],
  Services: services.map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
  Company: [
    { href: '/about', label: 'About' }, { href: '/industries', label: 'Industries' }, { href: '/technology', label: 'Technology' },
    { href: '/careers', label: 'Careers' }, { href: '/contact', label: 'Contact' },
  ],
};
/** Pages included in the sitemap and site search (private tracking results are never indexed). */
export const pages = [
  { href: '/', title: 'Home', desc: 'Road, rail and air freight with warehousing, packaging and project cargo across India.' },
  { href: '/about', title: 'About Skylark Express', desc: 'Founder-led since 1993: history, leadership, mission and values.' },
  { href: '/services', title: 'Services', desc: 'Six service lines and a selector to find the right one.' },
  ...services.map((s) => ({ href: `/services/${s.slug}`, title: s.name, desc: s.summary })),
  { href: '/industries', title: 'Industries', desc: 'Healthcare, electronics, FMCG, chemicals, automation and documented cargo.' },
  { href: '/network', title: 'Network and branches', desc: 'Branch directory and India map.' },
  { href: '/serviceability', title: 'Check a PIN code', desc: 'Six-digit PIN-code serviceability enquiry.' },
  { href: '/track', title: 'Track a shipment', desc: 'Docket or AWB tracking.' },
  { href: '/quote', title: 'Get a freight quote', desc: 'Service-aware freight enquiry.' },
  { href: '/technology', title: 'Technology', desc: 'Scan-based tracking, digital dockets, POD and integrations.' },
  { href: '/careers', title: 'Careers', desc: 'Open roles and how to apply.' },
  { href: '/contact', title: 'Contact', desc: 'Sales, shipment support, careers and office visits.' },
  { href: '/help', title: 'Help and FAQs', desc: 'Tracking, FTL versus PTL, cold chain, project cargo, coverage and API questions.' },
  { href: '/privacy', title: 'Privacy', desc: 'How this website handles your information.' },
  { href: '/terms', title: 'Terms', desc: 'Website terms and conditions of carriage summary.' },
];
