// SERVICES — six service lines. Each record drives /services, its detail page, the quote form and search.
export type Service = {
  seoTitle?: string;
  slug: string; name: string; short: string; index: string; image: string; imageAlt: string;
  lede: string; selector: string; summary: string;
  body: { heading: string; text: string }[];
  suits: string[]; sequence: { step: string; text: string }[];
  spec: [string, string][];
  enquiry: { id: string; label: string; hint?: string; type?: string }[];
  diagram: 'ftl-ptl' | 'rail' | 'air' | 'warehouse' | 'odc' | 'packaging';
  categories?: { name: string; text: string }[];
};
export const services: Service[] = [
  {
    slug: 'road-logistics', seoTitle: 'FTL & PTL Road Freight Transport in India', name: 'Road logistics', short: 'Road', index: '01', image: 'road', diagram: 'ftl-ptl',
    imageAlt: 'A Skylark Express truck with a white container body on an Indian national highway in early morning light',
    selector: 'I have a full or partial truck load',
    summary: 'Full Truck Load and Part Truck Load movement, with first- and last-mile collection.',
    lede: 'Full Truck Load (FTL) gives one shipper the whole vehicle. Part Truck Load (PTL) shares the vehicle’s capacity with other consignments going the same way. We plan both, and tell you which one the load needs.',
    body: [
      { heading: 'FTL or PTL', text: 'With Full Truck Load (FTL), the vehicle is yours from pickup to delivery: one loading, one route, one unloading. With Part Truck Load (PTL), your consignment travels with others through our hubs, so you pay for the space you use. Lane, load size and how often you ship decide which is the better fit.' },
      { heading: 'First mile to last mile', text: 'A local vehicle collects from your door, the load moves on a linehaul truck between hubs, and a local vehicle makes the final delivery. Each handover between those vehicles is scheduled and scanned.' },
      { heading: 'Securing the cargo', text: 'Loads are lashed, blocked or palletised according to what is inside. Tell us about fragile, stackable or top-load-only freight when you book, and it is loaded accordingly.' },
      { heading: 'Surface tracking and returns', text: 'Every docket is scanned at pickup, at each hub and at delivery, so you can follow it on the tracking page. Return movement and reverse logistics run back along the same lanes.' },
    ],
    suits: ['Palletised and cartonised goods', 'Recurring branch or dealer replenishment', 'Single consignments too large for a courier', 'Return and reverse-logistics loads'],
    sequence: [
      { step: 'Book', text: 'Share the lane, load size and pickup window.' },
      { step: 'Collect', text: 'A named vehicle arrives; pieces are counted and the docket is scanned.' },
      { step: 'Linehaul', text: 'The load moves hub to hub with a scan at each handover.' },
      { step: 'Deliver', text: 'The consignee signs, and the proof of delivery (POD) is recorded.' },
    ],
    spec: [['Modes', 'FTL · PTL'], ['Scope', 'First mile, linehaul, last mile'], ['Visibility', 'Scan at every handover'], ['Returns', 'Reverse logistics on request']],
    enquiry: [
      { id: 'lane', label: 'Lane', hint: 'For example, Gurugram to Bhiwandi' },
      { id: 'loadSize', label: 'Load size', hint: 'Weight, pallets or vehicle size' },
      { id: 'frequency', label: 'How often do you ship this?', hint: 'One-off, weekly, daily' },
    ],
  },
  {
    slug: 'railway-logistics', seoTitle: 'Rail Freight Logistics: Road–Rail–Road', name: 'Railway logistics', short: 'Rail', index: '02', image: 'rail', diagram: 'rail',
    imageAlt: 'A Skylark-labelled pallet waits on a goods platform as a freight train passes at an Indian railway siding',
    selector: 'I ship smaller consignments on a regular lane',
    summary: 'A rail leg between cities, with road pickup and final delivery at each end.',
    lede: 'We combine road pickup and final delivery with a rail leg in between. Shared train capacity can suit smaller consignments that move on the same lane again and again.',
    body: [
      { heading: 'Road at both ends, rail in the middle', text: 'A vehicle collects from your premises and takes the consignment to the rail terminal. At the destination terminal another vehicle completes the delivery. You deal with one team and one docket for the whole movement.' },
      { heading: 'The terminal handover', text: 'At the siding, pieces are counted against the dispatch paperwork before loading and again after unloading. The handover from road to rail, and from rail back to road, is recorded both times.' },
      { heading: 'Why consolidation helps', text: 'Consolidating freight from several shippers fills the booked train capacity. For recurring consignments with a little flexibility on timing, that can lower the cost per kilogram on long lanes.' },
    ],
    suits: ['Recurring consignments on long-distance lanes', 'Smaller loads that do not need a dedicated truck', 'Freight with planned, not urgent, delivery dates', 'Dense or heavy cartonised goods'],
    sequence: [
      { step: 'Road pickup', text: 'Collection from your premises to the origin terminal.' },
      { step: 'Terminal handover', text: 'Piece count and paperwork checked at the siding.' },
      { step: 'Rail leg', text: 'Consolidated movement on booked train capacity.' },
      { step: 'Road delivery', text: 'Counted off the train and delivered to the consignee.' },
    ],
    spec: [['Leg', 'Road · Rail · Road'], ['Capacity', 'Shared, consolidated'], ['Best for', 'Recurring lanes'], ['Handover', 'Counted at both terminals']],
    enquiry: [
      { id: 'origin', label: 'Origin city' }, { id: 'destination', label: 'Destination city' },
      { id: 'volume', label: 'Volume', hint: 'Weight or number of cartons per dispatch' },
      { id: 'timing', label: 'Timing', hint: 'Dispatch day and when it needs to arrive' },
    ],
  },
  {
    slug: 'air-logistics', seoTitle: 'Domestic Air Cargo Services in India', name: 'Air logistics', short: 'Air', index: '03', image: 'air', diagram: 'air',
    imageAlt: 'A pallet in Skylark wrap is raised on a high-loader to the open cargo door of a freighter aircraft before sunrise',
    selector: 'It has to arrive by a fixed time',
    summary: 'Domestic air cargo for urgent or scheduled consignments, with carrier coordination.',
    lede: 'Domestic air cargo for urgent or scheduled consignments. We coordinate with the carrier, book the space and keep you informed at each milestone until delivery.',
    body: [
      { heading: 'What we coordinate', text: 'We arrange collection, book space with the airline, complete the air waybill (AWB) and organise delivery from the destination airport. Skylark is the freight coordinator; the aircraft is operated by the carrier.' },
      { heading: 'Milestone visibility', text: 'You can follow the AWB number through pickup, acceptance at the airport, departure, arrival and delivery on the tracking page.' },
      { heading: 'What to tell us', text: 'Share the cut-off you are working to, the dimensions and weight of each piece, and any handling needs such as temperature range, fragility or batteries. These decide which flight the cargo can make.' },
    ],
    suits: ['Urgent spares and production-line parts', 'Temperature-sensitive healthcare consignments', 'High-value electronics', 'Scheduled daily or weekly dispatches'],
    sequence: [
      { step: 'Brief', text: 'Arrival window, dimensions and handling needs.' },
      { step: 'Book', text: 'Space confirmed with the carrier; AWB issued.' },
      { step: 'Uplift', text: 'Accepted at the airport before the flight cut-off.' },
      { step: 'Deliver', text: 'Collected at destination and delivered with POD.' },
    ],
    spec: [['Scope', 'Domestic air cargo'], ['Role', 'Carrier coordination'], ['Document', 'Air waybill (AWB)'], ['Visibility', 'Milestone updates']],
    enquiry: [
      { id: 'arrivalWindow', label: 'Required arrival window', hint: 'Date and time it must arrive by' },
      { id: 'dimensions', label: 'Cargo dimensions', hint: 'L × W × H and weight of each piece' },
    ],
  },
  {
    slug: 'warehousing', seoTitle: 'Warehousing & Distribution in India', name: 'Warehousing', short: 'Warehousing', index: '04', image: 'warehouse', diagram: 'warehouse',
    imageAlt: 'Looking straight down a racking aisle in a warehouse as a reach truck lifts a pallet',
    selector: 'I need storage or distribution',
    summary: 'Contract, shared and project warehousing with inventory reporting.',
    lede: 'Contract, shared and project warehousing: racked or ambient storage, open yards, and temperature-controlled arrangements where available.',
    body: [
      { heading: 'Three ways to take space', text: 'Contract warehousing dedicates space and people to your stock. Shared warehousing lets you pay for the positions you use. Project warehousing covers a fixed period, such as a plant build or a seasonal peak.' },
      { heading: 'Inbound checks and inventory', text: 'Goods are checked against the dispatch documents on arrival, then put away and recorded at stock-keeping unit (SKU) level. Stock is issued first in, first out (FIFO) unless you specify otherwise.' },
      { heading: 'Cross-docking and distribution', text: 'Freight that does not need storage is cross-docked: unloaded, sorted and reloaded for onward dispatch. Stored goods are picked and distributed to your branches, dealers or customers.' },
      { heading: 'Reporting', text: 'A warehouse management system (WMS) supports stock, inbound and dispatch reports. Tell us what you need to see and how often.' },
    ],
    suits: ['Regional distribution stock', 'Project and plant materials', 'Seasonal or overflow inventory', 'Goods needing racked, ambient or open-yard storage'],
    sequence: [
      { step: 'Intake', text: 'Inbound check against documents; SKU-level receipt.' },
      { step: 'Storage', text: 'Put-away to racked, ambient or yard positions; FIFO rotation.' },
      { step: 'Dispatch', text: 'Pick, pack and consolidated dispatch or cross-dock.' },
    ],
    spec: [['Models', 'Contract · Shared · Project'], ['Storage', 'Racked, ambient, open yard'], ['Inventory', 'SKU level, FIFO'], ['Reporting', 'WMS-supported']],
    enquiry: [
      { id: 'skuCount', label: 'Number of SKUs', hint: 'An estimate is fine' },
      { id: 'volume', label: 'Volume', hint: 'Pallet positions or square feet' },
      { id: 'location', label: 'Preferred location' },
      { id: 'conditions', label: 'Handling conditions', hint: 'Ambient, temperature range, hazardous, stackable' },
    ],
  },
  {
    slug: 'project-cargo', seoTitle: 'Project Cargo & ODC Transport in India', name: 'Project cargo', short: 'Project cargo', index: '05', image: 'project', diagram: 'odc',
    imageAlt: 'A low-loader trailer carries a secured steel pressure vessel while two supervisors stand beside the trailer wheels',
    selector: 'My equipment is oversized',
    summary: 'Over-dimensional cargo with route surveys, permits and supervised movement.',
    lede: 'Over-dimensional cargo (ODC) includes machinery, construction equipment and oversized crates that will not fit a standard vehicle. Each movement is planned on its own.',
    body: [
      { heading: 'Route survey first', text: 'Before a date is agreed, the route is surveyed for bridge heights, turning radii, road condition and the access at both sites. The survey decides the trailer and the timing.' },
      { heading: 'Permits and trailers', text: 'We arrange the transport permits the movement needs and select an appropriate trailer, such as a low-bed or multi-axle hydraulic unit, for the dimensions and gross weight.' },
      { heading: 'Supervised movement', text: 'A supervisor travels with the load. Lashing is checked at loading and during the journey, and the delivery into site is guided on foot.' },
      { heading: 'Multimodal projects', text: 'Where a project calls for it, a sea leg can be included in a project-specific multimodal plan alongside road and rail.' },
    ],
    suits: ['Industrial machinery and plant equipment', 'Construction equipment', 'Transformers, vessels and oversized crates', 'Multi-consignment plant relocations'],
    sequence: [
      { step: 'Measure', text: 'Dimensions, gross weight and lifting points confirmed.' },
      { step: 'Survey', text: 'Route and site access surveyed; plan and permits prepared.' },
      { step: 'Load', text: 'Secured on the right trailer under supervision.' },
      { step: 'Move', text: 'Escorted movement and guided delivery into site.' },
    ],
    spec: [['Cargo', 'Over-dimensional (ODC)'], ['Planning', 'Route and access survey'], ['Equipment', 'Low-bed, multi-axle trailers'], ['Movement', 'Supervised, permitted']],
    enquiry: [
      { id: 'dimensions', label: 'Dimensions', hint: 'L × W × H of the largest piece' },
      { id: 'grossWeight', label: 'Gross weight' },
      { id: 'access', label: 'Access constraints', hint: 'Gate width, turning space, overhead lines' },
      { id: 'targetDate', label: 'Target date', type: 'date' },
    ],
  },
  {
    slug: 'packaging', seoTitle: 'Industrial & Export Packaging Services', name: 'Packaging', short: 'Packaging', index: '06', image: 'packaging', diagram: 'packaging',
    imageAlt: 'Close view of a timber crate corner with a steel protector, corrugated board, protective film and a roll of Skylark packing tape',
    selector: 'My goods need protective or specialist packing',
    summary: 'Eight packaging categories, from temperature-controlled air packs to CKD crating.',
    lede: 'Specialist packaging in eight categories. Suitability and acceptance are confirmed for the specific shipment before packing begins.',
    body: [
      { heading: 'Packed for the journey it will make', text: 'A crate for a road journey across three states is built differently from a pack for an overnight flight. We ask about fragility, size, and storage or transit conditions, then recommend the material and method.' },
      { heading: 'Confirmed per shipment', text: 'Regulated and temperature-sensitive goods are reviewed individually. We confirm what we can pack and carry for your specific shipment before any work starts.' },
    ],
    categories: [
      { name: 'Temperature-controlled air packaging', text: 'Insulated shippers and coolants for consignments flying within an agreed temperature range.' },
      { name: 'Telecom logistics packaging', text: 'Protective packing for network equipment, antennas and site hardware.' },
      { name: 'E-commerce logistics packaging', text: 'Right-sized cartons and mailers for parcel networks and returns.' },
      { name: 'Dangerous-goods packaging', text: 'Packing for regulated goods, subject to commodity review and acceptance.' },
      { name: 'Completely knocked-down (CKD) packaging', text: 'Kitted, sequenced packing of unassembled parts for assembly at destination.' },
      { name: 'Corrosion protection', text: 'Vapour corrosion inhibitor (VCI) films and desiccants for metal parts in storage or transit.' },
      { name: 'Wood', text: 'Timber crates, cases, skids and pallets built to the load.' },
      { name: 'Paperboard and plastic', text: 'Corrugated cartons, honeycomb board, plastic crates and returnable packs.' },
    ],
    suits: ['Fragile or shock-sensitive equipment', 'Metal parts at risk of corrosion', 'Temperature-sensitive consignments', 'Unassembled kits and export-style crating'],
    sequence: [
      { step: 'Assess', text: 'Fragility, size, weight and the conditions in transit.' },
      { step: 'Specify', text: 'Material and method agreed; acceptance confirmed.' },
      { step: 'Pack', text: 'Packed, sealed and labelled for the mode of transport.' },
    ],
    spec: [['Categories', 'Eight categories'], ['Materials', 'Wood, paperboard, plastic, film'], ['Specialist', 'Temperature, DG, CKD, VCI'], ['Acceptance', 'Confirmed per shipment']],
    enquiry: [
      { id: 'fragility', label: 'How fragile is it?', hint: 'For example, glass panels, calibrated instruments' },
      { id: 'size', label: 'Size and weight' },
      { id: 'conditions', label: 'Storage or transit conditions', hint: 'Temperature, humidity, duration, mode' },
    ],
  },
];
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
