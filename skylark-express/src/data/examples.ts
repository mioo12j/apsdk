// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE DATA ONLY — fictitious identifiers, no personal data. Used for the
// labelled examples on /track and /serviceability and by the preview test API.
// Real shipment history is displayed only when the production service returns it.
// ─────────────────────────────────────────────────────────────────────────────
export type TrackEvent = { time: string; city: string; mode: 'Road' | 'Rail' | 'Air' | 'Hub' | 'Local'; text: string };
export type TrackResult = {
  number: string; state: 'collection-pending' | 'in-transit' | 'exception' | 'delivered';
  statusLabel: string; origin: string; destination: string; service: string; pieces: number;
  eta?: string; podAvailable?: boolean; exceptionNote?: string; events: TrackEvent[];
};
export const exampleShipments: TrackResult[] = [
  { number: 'EXAMPLE-1001', state: 'collection-pending', statusLabel: 'Collection pending', origin: 'Noida', destination: 'Bhiwandi', service: 'Road · PTL', pieces: 4,
    events: [{ time: '2026-11-14T16:20:00+05:30', city: 'Noida', mode: 'Local', text: 'Booking received. Pickup scheduled.' }] },
  { number: 'EXAMPLE-1002', state: 'in-transit', statusLabel: 'In transit', origin: 'Gurugram', destination: 'Bengaluru', service: 'Road · FTL', pieces: 18, eta: '2026-11-17',
    events: [
      { time: '2026-11-15T05:42:00+05:30', city: 'Nagpur', mode: 'Road', text: 'In transit. Passed Nagpur hub.' },
      { time: '2026-11-14T06:15:00+05:30', city: 'Gurugram', mode: 'Road', text: 'Departed Gurugram hub on linehaul vehicle.' },
      { time: '2026-11-13T19:30:00+05:30', city: 'Gurugram', mode: 'Hub', text: 'Received at hub. 18 of 18 pieces scanned.' },
      { time: '2026-11-13T15:05:00+05:30', city: 'Gurugram', mode: 'Local', text: 'Picked up from shipper.' },
    ] },
  { number: 'EXAMPLE-1003', state: 'exception', statusLabel: 'Delivery exception', origin: 'New Delhi', destination: 'Kolkata', service: 'Rail', pieces: 6,
    exceptionNote: 'Delivery attempted. Consignee premises closed. Our team will attempt delivery again on the next working day.',
    events: [
      { time: '2026-11-14T11:10:00+05:30', city: 'Kolkata', mode: 'Local', text: 'Delivery attempted. Premises closed.' },
      { time: '2026-11-14T07:30:00+05:30', city: 'Kolkata', mode: 'Local', text: 'Out for delivery.' },
      { time: '2026-11-13T21:45:00+05:30', city: 'Kolkata', mode: 'Rail', text: 'Arrived at destination terminal. 6 of 6 pieces counted.' },
      { time: '2026-11-11T18:00:00+05:30', city: 'New Delhi', mode: 'Rail', text: 'Loaded at origin terminal.' },
      { time: '2026-11-11T12:20:00+05:30', city: 'New Delhi', mode: 'Local', text: 'Picked up from shipper.' },
    ] },
  { number: 'EXAMPLE-1004', state: 'delivered', statusLabel: 'Delivered', origin: 'Gurugram', destination: 'Bengaluru', service: 'Air', pieces: 1, podAvailable: true,
    events: [
      { time: '2026-11-13T12:48:00+05:30', city: 'Bengaluru', mode: 'Local', text: 'Delivered. Received at factory receiving bay.' },
      { time: '2026-11-13T09:05:00+05:30', city: 'Bengaluru', mode: 'Local', text: 'Out for delivery.' },
      { time: '2026-11-13T07:20:00+05:30', city: 'Bengaluru', mode: 'Air', text: 'Arrived at destination airport.' },
      { time: '2026-11-13T04:35:00+05:30', city: 'Delhi', mode: 'Air', text: 'Departed on flight.' },
      { time: '2026-11-12T21:10:00+05:30', city: 'Gurugram', mode: 'Hub', text: 'Received at hub and staged for air linehaul.' },
      { time: '2026-11-12T17:42:00+05:30', city: 'Gurugram', mode: 'Local', text: 'Picked up. Label scanned at dispatch counter.' },
    ] },
  { number: 'EXAMPLE-1005', state: 'delivered', statusLabel: 'Delivered', origin: 'Ludhiana', destination: 'Jaipur', service: 'Road · PTL', pieces: 3, podAvailable: false,
    events: [
      { time: '2026-11-12T14:15:00+05:30', city: 'Jaipur', mode: 'Local', text: 'Delivered.' },
      { time: '2026-11-10T10:00:00+05:30', city: 'Ludhiana', mode: 'Local', text: 'Picked up from shipper.' },
    ] },
];
/** Controlled PIN test data for the labelled example and the preview API. */
export const examplePins: Record<string, { status: 'serviceable' | 'unsupported'; area: string; note: string }> = {
  '110015': { status: 'serviceable', area: 'New Moti Nagar, New Delhi', note: 'Pickup and delivery available for standard cartonised cargo.' },
  '560027': { status: 'serviceable', area: 'Lalbagh Road, Bengaluru', note: 'Pickup and delivery available for standard cartonised cargo.' },
  '421302': { status: 'serviceable', area: 'Bhiwandi, Maharashtra', note: 'Pickup and delivery available for standard cartonised cargo.' },
  '744101': { status: 'unsupported', area: 'Port Blair, Andaman and Nicobar Islands', note: 'Not currently served by scheduled surface or air services.' },
};
