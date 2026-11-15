// INDUSTRIES — six deep-linkable sector sections (/industries#id).
export type Industry = { id: string; name: string; image: string; imageAlt: string; concern: string; paragraphs: string[]; ask: string; links: { slug: string; label: string }[]; expanded?: { heading: string; items: { title: string; text: string }[] } };
export const industries: Industry[] = [
  {
    id: 'healthcare-pharma', name: 'Healthcare & Pharma', image: 'ind-pharma',
    imageAlt: 'Two pairs of gloved hands pass an insulated cold-chain box with a temperature logger across a steel table',
    concern: 'For temperature-sensitive cargo, a handover matters as much as the journey.',
    paragraphs: [
      'Medicines, vaccines, diagnostics and devices lose value the moment nobody can say where they were, or at what temperature. We plan these consignments around the points where they change hands.',
      'Tell us the product’s handling range and the lane. We will confirm what can be arranged for that specific movement before you book.',
    ],
    expanded: {
      heading: 'How a documented handover works',
      items: [
        { title: 'Identification at pickup', text: 'The person collecting is identified to your dispatch team, and each piece is matched to the docket before it leaves.' },
        { title: 'Agreed handling conditions', text: 'The temperature range, packaging and maximum transit time are agreed in writing before the booking is accepted.' },
        { title: 'Recorded custody', text: 'Every transfer, from van to hub, hub to airline or truck, and vehicle to consignee, is scanned with time and place.' },
        { title: 'Proof of delivery (POD)', text: 'The consignee’s receipt is recorded and made available to your authorised users.' },
      ],
    },
    ask: 'Ask for the product’s handling range and lane to be reviewed.',
    links: [{ slug: 'air-logistics', label: 'Air logistics' }, { slug: 'warehousing', label: 'Warehousing' }, { slug: 'packaging', label: 'Packaging' }],
  },
  {
    id: 'it-electronics', name: 'IT & Electronics', image: 'ind-electronics',
    imageAlt: 'Gloved hands lower a foam lid over a rack server packed in anti-static foam inside a carton',
    concern: 'Shock-sensitive, high-value equipment needs protective packing and traceable transfers.',
    paragraphs: [
      'Servers, network hardware, displays and components are packed for shock and static, then moved with a scan at every transfer so there is always a named custodian.',
      'Returns are part of the plan: faulty units and end-of-lease equipment come back along the same lanes. Tell us what equipment is moving and where it needs to arrive.',
    ],
    ask: 'Tell us what equipment is moving and where it needs to arrive.',
    links: [{ slug: 'packaging', label: 'Packaging' }, { slug: 'road-logistics', label: 'Road logistics' }],
  },
  {
    id: 'fmcg-retail', name: 'FMCG & Retail', image: 'ind-fmcg',
    imageAlt: 'Mixed pallets of cartons staged in marked floor lanes at a distribution centre while a worker scans a pallet',
    concern: 'Shelves, dealers and online orders all need replenishing from the same stock.',
    paragraphs: [
      'We support replenishment across distribution, retail and e-commerce channels: stock is rotated first in, first out (FIFO), orders are consolidated into fewer dispatches, and returns are brought back and sorted.',
      'Share your dispatch points, delivery locations and typical order sizes, and we will suggest how storage and transport can work together.',
    ],
    ask: 'Share your dispatch points and typical order profile.',
    links: [{ slug: 'warehousing', label: 'Warehousing' }, { slug: 'road-logistics', label: 'Road logistics' }],
  },
  {
    id: 'chemicals', name: 'Chemicals', image: 'ind-chemicals',
    imageAlt: 'A supervisor in safety gear checks documents against strapped drums and intermediate bulk containers',
    concern: 'Every chemical movement starts with a review, not a booking.',
    paragraphs: [
      'Before accepting a movement, our team reviews the commodity, its handling restrictions, the documentation and the packaging. Some goods can move on some modes and not others; we will tell you which.',
      'Send the cargo type with its safety data sheet, and the origin and destination. A specialist will respond with what is possible.',
    ],
    ask: 'Send the cargo type with origin and destination for a specialist review.',
    links: [{ slug: 'packaging', label: 'Packaging' }, { slug: 'road-logistics', label: 'Road logistics' }],
  },
  {
    id: 'automation-energy', name: 'Automation & Energy', image: 'ind-energy',
    imageAlt: 'A crated transformer on a low trailer inches through a narrow factory gate as a supervisor guides the driver',
    concern: 'The hardest part of the journey is often the last twenty metres through the site gate.',
    paragraphs: [
      'Control panels, transformers, turbines and production-line equipment have to arrive at the right position inside a working site. We take the dimensions, survey the access and supervise the delivery.',
      'Give us the dimensions, the gross weight and what the entrance looks like. A photograph of the gate helps.',
    ],
    ask: 'Share dimensions, weight and site access.',
    links: [{ slug: 'project-cargo', label: 'Project cargo' }],
  },
  {
    id: 'regulatory-documented-cargo', name: 'Regulatory & documented cargo', image: 'ind-documents',
    imageAlt: 'A hand signs a consignment note on a dispatch desk beside an invoice, a stamp and a barcode scanner',
    concern: 'A need that cuts across every sector: the paperwork has to travel with the goods.',
    paragraphs: [
      'For any consignment we need the shipper and consignee details, the piece count, a cargo description, the weight, and the invoice or declaration where applicable. An e-way bill accompanies goods where the law requires one.',
      'At delivery, the proof of handover closes the record. Requirements differ by commodity and change over time, so ask our team for what currently applies to your goods.',
    ],
    ask: 'Ask the team for current commodity-specific requirements.',
    links: [{ slug: 'road-logistics', label: 'Road logistics' }, { slug: 'air-logistics', label: 'Air logistics' }],
  },
];
