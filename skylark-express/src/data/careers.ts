// VACANCIES — dated records. Edit `status` to 'closed' to retire a role; set `confirmedForLaunch`
// to true once HR has confirmed the list. With no open roles the page shows the careers address.
export const rolesListDate = '2026-11-15';
export const rolesConfirmedForLaunch = false; // HANDOFF: confirm active vacancies before launch
export type Role = { slug: string; title: string; city: string; arrangement: string; team: string; posted: string; status: 'open' | 'closed'; summary: string; duties: string[]; lookingFor: string[] };
export const roles: Role[] = [
  { slug: 'branch-operations-manager-gurugram', title: 'Branch Operations Manager', city: 'Gurugram', arrangement: 'Full-time', team: 'Operations', posted: '2026-11-15', status: 'open',
    summary: 'Run the daily pickup, hub and delivery operation of a branch and the team behind it.',
    duties: ['Plan and supervise daily pickups, hub handovers and deliveries', 'Own scan compliance and proof-of-delivery closure for the branch', 'Resolve delivery exceptions with customers and the central team', 'Coach supervisors and dock staff on safe handling'],
    lookingFor: ['Experience running surface or express logistics operations', 'Comfort with scan-based tracking and daily reporting', 'Clear communication with customers and drivers'] },
  { slug: 'key-account-manager-healthcare-bengaluru', title: 'Key Account Manager – Healthcare', city: 'Bengaluru', arrangement: 'Full-time', team: 'Sales', posted: '2026-11-15', status: 'open',
    summary: 'Look after healthcare and pharma customers whose consignments depend on documented handovers.',
    duties: ['Manage relationships with healthcare and pharma shippers', 'Translate handling ranges and lanes into workable movement plans with operations', 'Review service performance with customers', 'Coordinate air, warehousing and packaging teams on new requirements'],
    lookingFor: ['Account management experience in logistics or healthcare supply chains', 'Understanding of temperature-sensitive handling', 'Willingness to be on the dock when a consignment needs it'] },
  { slug: 'fleet-ftl-coordinator-mumbai', title: 'Fleet & FTL Coordinator', city: 'Mumbai', arrangement: 'Full-time', team: 'Road', posted: '2026-11-15', status: 'open',
    summary: 'Match Full Truck Load bookings to vehicles and keep them moving on time.',
    duties: ['Allocate vehicles to FTL bookings and confirm placement times', 'Track vehicles in transit and update customers at milestones', 'Check vehicle documents and health checks before dispatch', 'Coordinate return loads to reduce empty running'],
    lookingFor: ['Experience in fleet or transport coordination', 'Knowledge of western India lanes', 'Calm under pressure when a vehicle is delayed'] },
  { slug: 'warehouse-supervisor-new-delhi', title: 'Warehouse Supervisor', city: 'New Delhi', arrangement: 'Full-time', team: 'Warehousing', posted: '2026-11-15', status: 'open',
    summary: 'Supervise inbound checks, storage and dispatch in a working warehouse.',
    duties: ['Supervise inbound checks, put-away, picking and dispatch', 'Maintain SKU-level accuracy and FIFO rotation', 'Run shift briefings and safe-handling checks', 'Prepare daily stock and dispatch reports'],
    lookingFor: ['Warehouse supervision experience', 'Working knowledge of a warehouse management system', 'Attention to count accuracy'] },
  { slug: 'logistics-data-analyst-gurugram', title: 'Logistics Data Analyst', city: 'Gurugram', arrangement: 'Hybrid', team: 'Technology', posted: '2026-11-15', status: 'open',
    summary: 'Turn scan, route and delivery data into reports the operations team can act on.',
    duties: ['Build and maintain operations reports from scan and delivery data', 'Investigate delays and exceptions by lane and hub', 'Support customer integrations with clean data definitions', 'Work with branch managers on practical improvements'],
    lookingFor: ['Strong SQL and spreadsheet skills', 'Experience with operational or supply-chain data', 'Ability to explain findings plainly'] },
  { slug: 'air-cargo-operations-executive-delhi-ncr', title: 'Air Cargo Operations Executive', city: 'Delhi NCR', arrangement: 'Full-time', team: 'Air', posted: '2026-11-15', status: 'open',
    summary: 'Coordinate air consignments from booking to uplift and delivery.',
    duties: ['Book space with carriers and prepare air waybills', 'Meet airport cut-offs for acceptance', 'Update customers at each milestone', 'Coordinate delivery from destination airports'],
    lookingFor: ['Experience in domestic air cargo operations', 'Familiarity with airline booking and acceptance procedures', 'Readiness for early and late shifts'] },
];
