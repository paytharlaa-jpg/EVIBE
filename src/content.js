// ─────────────────────────────────────────────────────────────
// EVIBE website copy. Every word on the site lives in this file,
// so text can be changed without touching the design.
// Source: content/EVIBE_Website_content.html (approved client copy).
// ─────────────────────────────────────────────────────────────

export const company = {
  name: 'EVIBE',
  legal: 'EVIBE Mobility Solutions Private Limited',
  tagline: 'Elevating the Electric Experience.',
  phone: '+91 99850 98373',
  phoneHref: 'tel:+919985098373',
  whatsapp: '919985098373',
  email: 'info@evibemobility.com',
  domain: 'evibemobility.com',
  blurb: 'Integrated EV charging solutions, digital management, deployment coordination and support.',
};

export const waLink = (text = 'Hi EVIBE, I would like to know more about your EV charging ecosystem.') =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;

// Pages: path, menu label, browser title and search description.
export const pages = [
  { path: '/', label: 'Home', title: 'EVIBE | Elevating the Electric Experience · EV Charging Ecosystem', desc: 'Not just chargers. An entire EV charging ecosystem: EVIBE charging solutions, digital charging management, deployment coordination and ongoing support under one brand.' },
  { path: '/about', label: 'About', title: 'About EVIBE | Building a Connected Electric Mobility Experience', desc: 'EVIBE is an electric mobility solutions company building an integrated ecosystem for EV charging and customer experiences.' },
  { path: '/services', label: 'Solutions', title: 'EV Charging Solutions | Communities, Hotels, Commercial, Highway, Fleet | EVIBE', desc: 'Charging solutions designed around your location: gated communities, hotels, commercial premises, highway hubs, fleet & logistics and EVIBE experience destinations.' },
  { path: '/franchise', label: 'Franchise', title: 'EVIBE Franchise Opportunities | Starter, Signature, Flagship', desc: 'Choose your EVIBE. Three franchise formats configured around investment capacity, land availability and local market requirements.' },
  { path: '/partner', label: 'Partner With Us', title: 'Partner With EVIBE | Landowners & Business Partnerships', desc: 'Have a location with potential? Partner with EVIBE to explore EV charging solutions and EVIBE experience destinations on your property.' },
  { path: '/gallery', label: 'Gallery', title: 'Gallery | EVIBE EV Charging', desc: 'Charging solutions, hubs and electric experiences by EVIBE.' },
  { path: '/faq', label: 'FAQ', title: 'FAQ | EVIBE EV Charging Ecosystem', desc: 'Answers about EVIBE charging solutions, deployment, technology, franchise formats and landowner partnerships.' },
  { path: '/contact', label: 'Contact', title: 'Enquire | Connect with EVIBE', desc: 'For charging solutions, franchise opportunities, landowner partnerships or business collaborations, share a few details and our team will take the discussion forward.' },
];
export const nav = pages;

// ── Home ──────────────────────────────────────────────────────
export const intro = {
  kicker: 'The electric experience destination',
  title: ['Not Just Chargers.', 'An Entire EV Charging Ecosystem.'],
  body: 'EVIBE brings together EV charging solutions, digital charging management, infrastructure deployment coordination and ongoing operational support, under one integrated brand.',
  tagline: 'Charge. Dine. Discover. Experience.',
};

// The circular ecosystem (rotating rings on Home / About)
export const ecosystem = {
  kicker: 'One connected lifecycle',
  title: 'One Ecosystem. Every Step of the EV Journey.',
  body: 'From discovering the right location to charging, customer engagement and ongoing support, each stage connects to the next.',
  centre: { title: ['EV Charging', 'Ecosystem'], body: 'A complete, end-to-end ecosystem from location to charging and ongoing support.' },
  steps: [
    { no: '01', icon: 'pin', title: 'Discover', brand: 'EVIBE IQ', body: 'Property & location identification' },
    { no: '02', icon: 'plan', title: 'Plan', brand: 'EVIBE DEPLOY', body: 'Site planning & design' },
    { no: '03', icon: 'helmet', title: 'Implement', brand: 'EVIBE DEPLOY', body: 'Infrastructure deployment coordination' },
    { no: '04', icon: 'charger', title: 'Charge', brand: 'EVIBE CHARGE', body: 'DC charging solutions' },
    { no: '05', icon: 'chart', title: 'Manage', brand: 'EVIBE DIGITAL', body: 'CSMS & charger monitoring' },
    { no: '06', icon: 'gift', title: 'Engage', brand: 'EVIBE MILES', body: 'Payments, membership & rewards' },
    { no: '07', icon: 'headset', title: 'Support', brand: 'EVIBE CARE', body: 'Operations & customer support' },
  ],
};

// Four pillars of the ecosystem
export const pillars = [
  { no: '01', tag: 'Hardware', name: 'EVIBE CHARGE', body: 'EVIBE-branded DC fast-charging solutions sourced and configured with selected manufacturing partners.' },
  { no: '02', tag: 'Software', name: 'EVIBE DIGITAL', body: 'EVIBE-powered charging management, charger monitoring and customer-facing digital experiences, subject to verified platform capabilities.' },
  { no: '03', tag: 'Deployment', name: 'EVIBE DEPLOY', body: 'Site assessment, feasibility, planning, vendor coordination, deployment oversight and commissioning support.' },
  { no: '04', tag: 'Operations', name: 'EVIBE CARE', body: 'Remote monitoring, technical assistance, maintenance coordination, troubleshooting and customer support.' },
];

// Values strip (replaces the old numbers block)
export const values = {
  kicker: 'Why EVIBE',
  title: 'Integrated EV Charging Ecosystem.',
  items: [
    { k: 'Technology-flexible', v: 'Selected charging partners' },
    { k: 'Integrated approach', v: 'Hardware to operations' },
    { k: 'Customer-focused', v: 'Solutions by site and use case' },
    { k: 'Scalable vision', v: 'Multiple business segments' },
  ],
};

// ── About ─────────────────────────────────────────────────────
export const aboutPage = {
  hero: {
    kicker: 'About EVIBE',
    title: ['Building a connected', 'electric mobility', 'experience.'],
    sub: 'EVIBE is an electric mobility solutions company building an integrated ecosystem for EV charging and customer experiences.',
  },
  story: [
    {
      title: 'Who we are',
      body: 'Through EVIBE-branded charging solutions, digital charging management, infrastructure deployment coordination and ongoing operational support, we bring the key elements of an EV charging project together under one brand.',
    },
    {
      title: 'One integrated approach',
      body: 'EVIBE coordinates the project journey and works with specialist partners for the relevant equipment, infrastructure and execution packages. Multiple technology partners, one point of coordination.',
    },
  ],
  checks: ['Selected manufacturing and technology partners', 'Solutions matched to project requirements', 'Coordinated deployment approach', 'Ongoing operational support model'],
};

// Technology & digital experience
export const technology = {
  kicker: 'Technology & digital experience',
  title: 'Smarter charging. Seamless experiences.',
  body: 'Digital capabilities that support charger operations and customer journeys. Availability depends on platform configuration and rollout.',
  items: [
    { name: 'EVIBE CSMS', body: 'Charging Station Management System for charger operations, sessions, status, monitoring and reporting.', status: 'Platform configuration dependent' },
    { name: 'QR / WhatsApp-enabled charging', body: 'A proposed customer journey to scan a charger QR code, access a supported digital experience, make payment and authorise a charging session.', status: 'Subject to validation' },
    { name: 'EVIBE IQ', body: 'Intelligent property and location insights to help identify and evaluate promising locations for EV charging infrastructure.', status: 'Admin-managed capability' },
    { name: 'EVIBE Miles', body: 'Planned membership and loyalty ecosystem for charging rewards, customer engagement and benefits across EVIBE destinations.', status: 'Planned' },
  ],
};

export const evibeIQ = {
  kicker: 'EVIBE IQ · Location intelligence',
  sub: 'Discover · Evaluate · Expand',
  title: 'Find the right location for the right opportunity.',
  body: 'EVIBE IQ supports property and location discovery, location suitability insights, charging ecosystem assessment, infrastructure readiness considerations and preliminary commercial feasibility discussions.',
  points: [
    'Property discovery across selected locations and corridors',
    'Location assessment covering access, connectivity and surrounding activity',
    'Infrastructure considerations including space and power requirements',
    'Expansion planning for charging hubs and destination formats',
  ],
  note: 'Detailed property records, data sources, evaluation methodology, scoring, financial models and operational tools are managed internally by authorised EVIBE administrators.',
};

// ── Solutions (services) ──────────────────────────────────────
export const solutionsIntro = {
  kicker: 'Solutions for every setting',
  title: 'Charging solutions designed around your location.',
  body: 'Different locations have different charging needs. EVIBE works with selected technology and execution partners to coordinate solutions around each site’s requirements.',
};

export const services = [
  {
    id: 'communities',
    no: '01',
    title: 'Gated Communities & Apartments',
    lead: 'Charging residents can count on.',
    body: 'Charging infrastructure planned around resident demand, parking layouts, available electrical capacity and future growth.',
    tags: ['Resident demand', 'Parking layouts', 'Capacity & growth'],
    cta: 'Request a Site Assessment',
    img: 'charge-03',
  },
  {
    id: 'hotels',
    no: '02',
    title: 'Hotels & Hospitality',
    lead: 'A reason for guests to stay.',
    body: 'EV charging as a guest amenity for hotels, resorts, business hotels and serviced apartments.',
    tags: ['Hotels & resorts', 'Business hotels', 'Serviced apartments'],
    cta: 'Partner With EVIBE',
    img: 'charge-06',
  },
  {
    id: 'commercial',
    no: '03',
    title: 'Commercial & Corporate',
    lead: 'Turn parking into a perk.',
    body: 'Charging for offices, IT parks, malls, retail destinations and commercial premises.',
    tags: ['Offices & IT parks', 'Malls & retail', 'Commercial premises'],
    cta: 'Discuss Your Project',
    img: 'charge-08',
  },
  {
    id: 'highway',
    no: '04',
    title: 'Highway Charging',
    lead: 'Fast charging where the road goes.',
    body: 'DC fast-charging hubs for highways, travel corridors and roadside destinations.',
    tags: ['DC fast-charging hubs', 'Travel corridors', 'Roadside destinations'],
    cta: 'Explore Hub Development',
    img: 'charge-04',
  },
  {
    id: 'fleet',
    no: '05',
    title: 'Fleet & Logistics',
    lead: 'Ready for the next run.',
    body: 'Charging infrastructure planning for fleet operators and logistics businesses.',
    tags: ['Fleet operators', 'Logistics businesses'],
    cta: 'Enquire for Fleet Charging',
    img: 'charge-09',
  },
  {
    id: 'destinations',
    no: '06',
    title: 'EVIBE Experience Destinations',
    lead: 'Charge. Dine. Discover. Experience.',
    body: 'Integrated charging, café, food outlets, seating and customer amenities, bringing more to every charging stop.',
    tags: ['Charging + café', 'Food outlets & seating', 'Customer amenities'],
    cta: 'Explore Destinations',
    img: 'charge-07',
  },
];

// Infrastructure & project coordination
export const process = [
  { no: '01', tag: 'Understand', title: 'Requirement assessment', body: 'Understand location, usage, budget and expected charging demand.' },
  { no: '02', tag: 'Assess', title: 'Site feasibility', body: 'Review site layout, parking, electrical capacity and deployment conditions.' },
  { no: '03', tag: 'Select', title: 'Technology selection', body: 'Evaluate suitable DC charging equipment from multiple technology partners.' },
  { no: '04', tag: 'Plan', title: 'Infrastructure planning', body: 'Coordinate civil, electrical and charging infrastructure requirements with specialist partners.' },
  { no: '05', tag: 'Coordinate', title: 'Project execution', body: 'Coordinate procurement, installation and associated EPC activities with the appointed vendors.' },
  { no: '06', tag: 'Hand over', title: 'Commissioning & handover', body: 'Coordinate testing, commissioning and operational handover.' },
];
export const processIntro = {
  kicker: 'Infrastructure & project coordination',
  title: 'One integrated approach. Multiple technology partners.',
  body: 'EVIBE coordinates the project journey and works with specialist partners for the relevant equipment, infrastructure and execution packages.',
  note: 'Project scope is defined individually. Charger supply and installation, electrical infrastructure, transformer and HT/LT works, civil works and other specialist activities may be delivered by appointed partners. EVIBE’s role and each partner’s responsibility will be made clear in the project scope.',
};

// ── Franchise ─────────────────────────────────────────────────
export const franchise = {
  kicker: 'Franchise opportunities',
  title: ['Choose Your EVIBE.', 'Build the Future of', 'Electric Experiences.'],
  body: 'Three franchise formats configured around investment capacity, land availability and local market requirements. Final scope and commercial terms are discussed after understanding the proposed site.',
  tiers: [
    {
      id: 'starter',
      format: 'Entry format',
      name: 'EVIBE STARTER',
      tagline: 'Start Electric. Start Smart.',
      features: ['Compact EV charging destination', 'Essential DC charging setup', 'Compact café / refreshment outlet', 'Customer waiting space', 'Expandable site planning'],
      type: 'EVIBE Starter Franchise',
    },
    {
      id: 'signature',
      format: 'Premium format',
      name: 'EVIBE SIGNATURE',
      tagline: 'More Than a Stop. An Experience.',
      features: ['Multiple DC charging points', 'Café and F&B options', 'Indoor customer seating', 'Premium branded canopy', 'Customer amenities and office'],
      type: 'EVIBE Signature Franchise',
    },
    {
      id: 'flagship',
      format: 'Flagship format',
      name: 'EVIBE FLAGSHIP',
      tagline: 'The Ultimate Electric Experience.',
      features: ['High-capacity DC charging', 'Multiple café and F&B outlets', 'Premium indoor / outdoor seating', 'Customer lounge and amenities', 'Technology and membership ecosystem'],
      type: 'EVIBE Flagship Franchise',
    },
  ],
  note: 'Investment amounts, land sizes, charger counts, returns and payback periods are not published here; these depend on site-specific specifications and approved commercial assumptions.',
};

// ── Partner with us ──────────────────────────────────────────
export const partner = {
  hero: {
    kicker: 'Partner With EVIBE',
    title: ['Let’s build the', 'electric experience', 'together.'],
    sub: 'Landowners, property owners, hospitality and commercial sites, and technology or business partners: tell us what you are exploring and the EVIBE team will discuss the next steps.',
  },
  types: [
    { id: 'land', title: 'Landowners', body: 'Have a location with potential? Explore whether your property may be suitable for an EV charging solution or an EVIBE experience destination.', type: 'Landowner Partnership', cta: 'Submit Property Details' },
    { id: 'host', title: 'Site hosts', body: 'Gated communities, hotels, offices, malls and roadside destinations: offer EV charging to residents, guests, staff and customers.', type: 'EV Charging Solution', cta: 'Request a Site Assessment' },
    { id: 'biz', title: 'Technology & business partners', body: 'EVIBE works with selected manufacturing, technology and execution partners across hardware, infrastructure and operations.', type: 'Technology / Business Partnership', cta: 'Start a Conversation' },
  ],
  landowner: {
    kicker: 'Landowner partnerships',
    title: 'Have a location with potential?',
    body: 'Partner with EVIBE to explore whether your property may be suitable for an EV charging solution or an EVIBE experience destination.',
    assessTitle: 'What helps us assess a property?',
    assess: ['Location and road connectivity', 'Land area and frontage', 'Access and vehicle movement', 'Power availability or feasibility information', 'Ownership / lease status and expected terms'],
  },
};

// ── Enquiry form ─────────────────────────────────────────────
export const enquiry = {
  kicker: 'Connect with EVIBE',
  title: ['Let’s explore the', 'right opportunity.'],
  body: 'For charging solutions, franchise opportunities, landowner partnerships or business collaborations, share a few details and our team can take the discussion forward.',
  types: [
    'EV Charging Solution',
    'Gated Communities & Apartments',
    'Hotels & Hospitality',
    'Commercial & Corporate',
    'Highway Charging',
    'Fleet & Logistics',
    'EVIBE Experience Destinations',
    'EVIBE Starter Franchise',
    'EVIBE Signature Franchise',
    'EVIBE Flagship Franchise',
    'Landowner Partnership',
    'Technology / Business Partnership',
  ],
  land: ['Owned property', 'Leased property', 'Looking for a property', 'Not applicable'],
};
// Back-compat for older components
export const contact = { ...enquiry, types: enquiry.types };

// ── Gallery ──────────────────────────────────────────────────
export const galleryTags = ['All', 'Highway & public', 'Commercial', 'Communities', 'Fleet'];
export const gallery = [
  { img: 'charge-07', alt: 'Electric car beside a public charging station on a city street', span: 'tall', tag: 'Highway & public' },
  { img: 'charge-06', alt: 'Electric car with headlights on at dusk', span: 'wide', tag: 'Highway & public' },
  { img: 'charge-04', alt: 'Row of fast-charging pillars with electric cars plugged in', span: 'sq', tag: 'Highway & public' },
  { img: 'charge-08', alt: 'Car connected to a charging kiosk showing a battery icon', span: 'sq', tag: 'Commercial' },
  { img: 'charge-03', alt: 'Wall-mounted chargers in a covered car park', span: 'wide', tag: 'Communities' },
  { img: 'charge-09', alt: 'Top view of six electric cars charging side by side', span: 'tall', tag: 'Fleet' },
  { img: 'charge-02', alt: 'Electric cars charging at a row of pillars beside a lawn', span: 'sq', tag: 'Commercial' },
  { img: 'charge-05', alt: 'Close-up of an open charging port on a white car', span: 'sq', tag: 'Communities' },
  { img: 'charge-01', alt: 'White electric car plugged into a charging station', span: 'wide', tag: 'Highway & public' },
];

// ── FAQ ──────────────────────────────────────────────────────
export const faqs = [
  { q: 'What does EVIBE do?', a: 'EVIBE is an electric mobility solutions company building an integrated EV charging ecosystem: EVIBE-branded charging solutions, digital charging management, infrastructure deployment coordination and ongoing operational support, under one brand.' },
  { q: 'Which locations do you work with?', a: 'Gated communities and apartments, hotels and hospitality, commercial and corporate premises, highway charging hubs, fleet and logistics businesses, and EVIBE experience destinations.' },
  { q: 'What charging technology does EVIBE use?', a: 'EVIBE CHARGE covers DC fast-charging solutions sourced and configured with selected manufacturing partners. We are technology-flexible and evaluate suitable equipment for each project.' },
  { q: 'Who carries out the installation and infrastructure works?', a: 'EVIBE coordinates the project journey. Charger supply and installation, electrical infrastructure, transformer and HT/LT works, civil works and other specialist activities may be delivered by appointed partners. Each party’s responsibility is made clear in the project scope.' },
  { q: 'How do the franchise formats work?', a: 'There are three formats: EVIBE Starter, EVIBE Signature and EVIBE Flagship, configured around investment capacity, land availability and local market requirements. Final scope and commercial terms are discussed after understanding the proposed site.' },
  { q: 'I own land. Can it become an EVIBE location?', a: 'Possibly. Share your property details: location and road connectivity, land area and frontage, access, power availability and ownership or lease status. The EVIBE team will assess its suitability.' },
  { q: 'Is QR / WhatsApp charging available?', a: 'QR / WhatsApp-enabled charging is a proposed customer journey and is subject to validation. EVIBE CSMS capabilities depend on platform configuration and rollout.' },
  { q: 'How do I start?', a: 'Use the enquiry form or message us on WhatsApp. Tell us what you are exploring and our team will take the discussion forward.' },
];

// Legacy exports still referenced by some sections
export const marquee = [];
export const testimonials = [];
export const hero = { primary: 'Explore Solutions', secondary: 'Partner With Us' };
export const about = { pillars: [] };
export const impact = values;
export const manifesto = intro.body;
