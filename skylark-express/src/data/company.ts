// ─────────────────────────────────────────────────────────────────────────────
// COMPANY RECORD — edit figures, contacts and hours here. Every page reads from it.
// ─────────────────────────────────────────────────────────────────────────────
export const company = {
  name: 'Skylark Express',
  legalName: 'Skylark Express (Delhi) Pvt. Ltd.',
  brandLine: 'Speed. Safety. Savings.',
  founded: 1993,
  base: 'Gurugram',
  email: 'info@skylarkexpressdelhi.com',
  careersEmail: 'careers@skylarkexpressdelhi.com',
  phones: [
    { label: 'Call centre', display: '+91 11 4166 6666', tel: '+911141666666' },
    { label: 'Call centre (mobile)', display: '+91 84488 99679', tel: '+918448899679' },
  ],
  hours: { display: 'Monday–Saturday, 10:00 am–6:00 pm IST', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '18:00' },
  responseTarget: 'We aim to reply within one business day.',
} as const;

/** Company-reported scale. Shown as published figures; never more than three together on Home. */
export const figures = {
  since: { value: 'Since 1993', label: 'Founder-led from the first consignment' },
  warehouses: { value: '50+', unit: 'warehouses', label: 'Company-reported warehouse locations' },
  warehouseArea: { value: '6.5 million', unit: 'sq ft', label: 'Company-reported warehousing space' },
  pinCodes: { value: '19,000+', unit: 'PIN codes', label: 'Company-reported delivery reach' },
  states: { value: '28', unit: 'states', label: 'Company-reported reach' },
  serviceLines: { value: 'Six', unit: 'service lines', label: 'Road, rail, air, warehousing, project cargo and packaging' },
  /** Published on-time figure. Leave `enabled: false` until the company supplies the measurement period and basis. */
  onTime: { enabled: false, value: '99%', period: '', basis: '' },
  note: 'Figures are company-reported. Individual lanes and cargo types need serviceability confirmation.',
} as const;

export const founders = [
  {
    id: 'rakesh-yadav',
    name: 'Mr. Rakesh Yadav',
    shortName: 'Rakesh Yadav',
    title: 'Chief Managing Director',
    responsibility: 'Leads sales and business growth',
    // PORTRAIT PAIRING confirmed by the client: Mr. Rakesh Yadav is the city-background portrait.
    portrait: 'founder-b',
    alt: 'Portrait of Mr. Rakesh Yadav, Chief Managing Director of Skylark Express',
  },
  {
    id: 'naveen-yadav',
    name: 'Mr. Naveen Yadav',
    shortName: 'Naveen Yadav',
    title: 'Managing Director',
    responsibility: 'Leads finance and operations',
    // Mr. Naveen Yadav is the white-background portrait.
    portrait: 'founder-a',
    alt: 'Portrait of Mr. Naveen Yadav, Managing Director of Skylark Express',
  },
] as const;

export const timeline = [
  { era: '1993', title: 'Two brothers, no office, no fleet', body: 'Rakesh Yadav and Naveen Yadav start the business. They take the bookings and make the deliveries themselves.' },
  { era: '2000s', title: 'A registered office and an organised road network', body: 'The business establishes its registered office in New Delhi and organises regular road lanes between branches.' },
  { era: '2010s', title: 'Road, rail and air under one plan', body: 'Skylark brings the three transport modes together and expands its warehousing.' },
  { era: 'Today', title: 'Integrated, pan-India logistics from Gurugram', body: 'Six service lines run from the corporate headquarters in Gurugram, with both founders still leading the business.' },
] as const;

export const values = [
  { name: 'Cost-conscious planning', body: 'We choose the mode and the route for the load, and say so when a cheaper option will do the job.' },
  { name: 'Safe handling', body: 'Cargo is secured, staged and handed over by people who know what is inside the carton.' },
  { name: 'Transparent communication', body: 'You hear from us at each milestone, and first when something is running late.' },
  { name: 'Professionalism and integrity', body: 'Documents are complete, handovers are recorded, and commitments are the ones we can keep.' },
] as const;
