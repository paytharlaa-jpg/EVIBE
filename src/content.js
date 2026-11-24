// ─────────────────────────────────────────────────────────────
// EVIBE website copy. Every word on the site lives in this file,
// so text can be changed without touching the design.
//
// DRAFT NOTICE: testimonials and the numbers marked "VERIFY" were
// written as drafts. Replace them with real ones before launch.
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
};

export const waLink = (text = 'Hi EVIBE, I would like to know more about EV charging.') =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;

// Pages: path, menu label, browser title and search description.
export const pages = [
  { path: '/', label: 'Home', title: 'EVIBE Mobility Solutions | EV Charging Stations, Installation & Maintenance', desc: 'EVIBE designs, installs and maintains EV charging points for homes, businesses, fleets and public hubs. Free site survey. Call or WhatsApp +91 99850 98373.' },
  { path: '/about', label: 'About', title: 'About EVIBE | EV Charging Company', desc: 'EVIBE Mobility Solutions takes a site from an empty bay to a working, monitored EV charging point, and stays on to keep it running.' },
  { path: '/services', label: 'Services', title: 'EV Charging Services | Home, Commercial, DC Fast, Fleet & AMC | EVIBE', desc: 'Home chargers, workplace and commercial charging, DC fast-charging hubs, fleet depots and annual maintenance from EVIBE.' },
  { path: '/gallery', label: 'Gallery', title: 'Gallery | EVIBE EV Charging', desc: 'Charging points, hubs and installations by EVIBE Mobility Solutions.' },
  { path: '/testimonials', label: 'Testimonials', title: 'Testimonials | EVIBE EV Charging', desc: 'What homeowners, societies, fleets and businesses say about charging with EVIBE.' },
  { path: '/faq', label: 'FAQ', title: 'EV Charging FAQ | EVIBE', desc: 'Answers on EV charger installation time, choosing a charger, electricity load, apartments, fast-charging hubs and maintenance.' },
  { path: '/contact', label: 'Contact', title: 'Contact EVIBE | Book a Free EV Charging Site Survey', desc: 'WhatsApp, call or email EVIBE Mobility Solutions for EV charging installation. +91 99850 98373 · info@evibemobility.com' },
];
export const nav = pages;

export const hero = {
  eyebrow: 'EV charging infrastructure',
  lines: ['Charge', 'the way', 'forward.'],
  sub: 'EVIBE plans, installs and looks after EV charging points for homes, workplaces, fleets and public hubs, from a single wall box to a full fast-charging site.',
  primary: 'Book a free site survey',
  secondary: 'Explore services',
};

export const marquee = [
  'AC home chargers',
  'DC fast charging',
  'Site survey',
  'Electrical design',
  'DISCOM approvals',
  'Installation',
  'Fleet depots',
  'Annual maintenance',
  'Remote monitoring',
];

export const manifesto =
  'Every electric journey begins at a plug. We build the places where it happens: charging points that are engineered to the last cable, installed without fuss and kept running long after the van leaves.';

export const about = {
  kicker: 'About EVIBE',
  title: ['Built for', 'the electric', 'decade.'],
  body: [
    'EVIBE Mobility Solutions is an EV charging company. We take a site from an empty wall or parking bay to a working, metered, monitored charging point, and we stay on as the people you call when something needs attention.',
    'One team handles the whole job: load assessment, charger selection, civil and electrical work, approvals, commissioning, user onboarding and maintenance. You deal with one company, one point of contact and one warranty.',
  ],
  pillars: [
    { k: '01', t: 'Engineered first', d: 'Every install starts with a load study and a written plan. No guesswork on cable sizing, earthing or protection.' },
    { k: '02', t: 'Charger-agnostic', d: 'We recommend the right hardware for your vehicles and budget, from compact AC wall boxes to high-power DC units.' },
    { k: '03', t: 'Here after install', d: 'Preventive maintenance, remote monitoring and quick-response service keep your chargers available.' },
  ],
};

export const services = [
  {
    id: 'home',
    no: '01',
    title: 'Home charging',
    lead: 'Wake up to a full battery.',
    body: 'Smart AC wall boxes for independent houses, villas and apartment parking. Neat cable runs, dedicated protection and app control.',
    tags: ['3.3 – 22 kW AC', 'Apartment approvals', 'Smart scheduling'],
    img: 'charge-05',
  },
  {
    id: 'business',
    no: '02',
    title: 'Workplace & commercial',
    lead: 'Turn parking into a perk.',
    body: 'Charging for offices, hotels, malls, hospitals and restaurants. Multi-point layouts, user billing and branded charger fascias.',
    tags: ['Multi-charger sites', 'RFID & app access', 'Revenue sharing models'],
    img: 'charge-03',
  },
  {
    id: 'fast',
    no: '03',
    title: 'DC fast-charging hubs',
    lead: 'Twenty minutes, not two hours.',
    body: 'High-power DC charging for highways, fuel stations and city hubs, including transformer planning, civil works and canopy design.',
    tags: ['30 – 240 kW DC', 'CCS2 & Type 2', 'Transformer & HT works'],
    img: 'charge-02',
  },
  {
    id: 'fleet',
    no: '04',
    title: 'Fleet & depot charging',
    lead: 'Every vehicle ready for the next shift.',
    body: 'Depot charging for e-buses, delivery fleets, cabs and two- and three-wheelers, with load management so you do not over-pay for capacity.',
    tags: ['Load balancing', 'Fleet dashboards', '2W / 3W / 4W / bus'],
    img: 'charge-09',
  },
  {
    id: 'care',
    no: '05',
    title: 'Maintenance & AMC',
    lead: 'Chargers that stay switched on.',
    body: 'Annual maintenance contracts, remote monitoring, firmware updates and on-site repair, for chargers we install and ones we did not.',
    tags: ['Preventive visits', 'Remote diagnostics', 'Spare parts'],
    img: 'charge-01',
  },
];

export const process = [
  { no: '01', title: 'Site survey', body: 'We visit, check your supply, load and parking layout, and listen to how you will use the chargers.' },
  { no: '02', title: 'Design & approvals', body: 'A written proposal with charger choice, single-line diagram and cost. We handle society and DISCOM paperwork.' },
  { no: '03', title: 'Install & commission', body: 'Certified electricians install, test and commission every point, then show your team how to use it.' },
  { no: '04', title: 'Monitor & maintain', body: 'Remote monitoring and scheduled maintenance keep uptime high. One call reaches a real engineer.' },
];

// VERIFY: these describe the offer. Change them to match what EVIBE actually provides.
export const impact = {
  kicker: 'What you get',
  title: 'Numbers that matter when you plug in.',
  stats: [
    { value: 48, suffix: 'h', label: 'From enquiry to site survey' },
    { value: 240, suffix: ' kW', label: 'Highest DC charger power we deploy' },
    { value: 24, suffix: '/7', label: 'Remote monitoring on every AMC site' },
    { value: 1, suffix: '', label: 'Team from survey to service' },
  ],
};

export const galleryTags = ['All', 'Public & fast', 'Commercial', 'Home', 'Fleet'];
export const gallery = [
  { img: 'charge-07', alt: 'Electric car beside a public charging station on a city street', span: 'tall', tag: 'Public & fast' },
  { img: 'charge-06', alt: 'Electric car with headlights on at dusk', span: 'wide', tag: 'Home' },
  { img: 'charge-04', alt: 'Row of fast-charging pillars with electric cars plugged in', span: 'sq', tag: 'Public & fast' },
  { img: 'charge-08', alt: 'Car connected to a charging kiosk showing a battery icon', span: 'sq', tag: 'Commercial' },
  { img: 'charge-03', alt: 'Wall-mounted chargers in a covered car park', span: 'wide', tag: 'Commercial' },
  { img: 'charge-09', alt: 'Top view of six electric cars charging side by side', span: 'tall', tag: 'Fleet' },
  { img: 'charge-02', alt: 'Electric cars charging at a row of pillars beside a lawn', span: 'sq', tag: 'Public & fast' },
  { img: 'charge-05', alt: 'Close-up of an open charging port on a white car', span: 'sq', tag: 'Home' },
  { img: 'charge-01', alt: 'White electric car plugged into a charging station', span: 'wide', tag: 'Public & fast' },
];

// DRAFT: sample testimonials. Replace with real customer quotes before launch.
export const testimonials = [
  {
    quote: 'They surveyed our society parking, sorted the approvals and had twelve chargers running in under a month. Residents stopped asking me when.',
    name: 'Secretary, residential society',
    place: 'Apartment complex · 12 AC points',
  },
  {
    quote: 'Our delivery fleet used to queue for one charger. EVIBE re-planned the depot with load balancing and now every vehicle leaves full.',
    name: 'Operations head, logistics company',
    place: 'Fleet depot · 3W & 4W',
  },
  {
    quote: 'The install was clean, the cable runs are invisible and the app just works. It feels like part of the house.',
    name: 'Homeowner',
    place: 'Independent villa · 7.4 kW wall box',
  },
  {
    quote: 'Guests now pick us partly because they can charge overnight. The branded fascia looks like it was designed with the building.',
    name: 'General manager, boutique hotel',
    place: 'Hospitality · 4 AC + 1 DC',
  },
];

export const faqs = [
  {
    q: 'How long does a home charger installation take?',
    a: 'Most home installations are finished in a single day once the survey is done and the charger is on site. Apartments can take a little longer if society approval is needed, and we help you with that paperwork.',
  },
  {
    q: 'Which charger is right for my car?',
    a: 'It depends on your car’s on-board charger, how far you drive and your electricity supply. For most homes a 7.4 kW AC wall box is ideal. During the free survey we check all three and recommend the right unit, not the most expensive one.',
  },
  {
    q: 'Do I need a new electricity connection or a load increase?',
    a: 'Sometimes. Our load study tells you exactly whether your existing sanctioned load is enough. If an enhancement or a separate EV connection is needed, we prepare and file the application with your DISCOM.',
  },
  {
    q: 'Can you install chargers in an apartment or office parking?',
    a: 'Yes. We plan shared and individual chargers for residential societies and commercial buildings, including metering so each user pays only for what they use.',
  },
  {
    q: 'Do you set up public or commercial fast-charging stations?',
    a: 'Yes. We handle site evaluation, transformer and HT works, DC charger supply, civil works, canopy, commissioning and ongoing operations support for public charging hubs.',
  },
  {
    q: 'What does the annual maintenance contract cover?',
    a: 'Scheduled preventive visits, remote monitoring, firmware updates, priority breakdown response and discounted spare parts. We also take on AMC for chargers installed by others.',
  },
  {
    q: 'How do I get a quote?',
    a: 'Message us on WhatsApp, call, or send the form on this page. We usually reply the same working day and book a free site survey at a time that suits you.',
  },
];

export const contact = {
  kicker: 'Start charging',
  title: ['Let’s plug', 'you in.'],
  body: 'Tell us where you want to charge. We will reply the same working day with next steps and a time for a free site survey.',
  types: ['Home', 'Apartment / society', 'Workplace / commercial', 'Fast-charging hub', 'Fleet / depot', 'Maintenance / AMC'],
};

// About page
export const aboutPage = {
  hero: { kicker: 'About EVIBE', title: ['We build the places', 'electric journeys', 'refuel.'], sub: 'EVIBE Mobility Solutions is an EV charging company. We plan, install and look after charging points, from a single wall box to a highway hub.' },
  story: [
    { title: 'Why we exist', body: 'Electric vehicles are arriving faster than the places to charge them. Drivers worry about range, societies worry about load, businesses worry about getting it wrong. We started EVIBE to take that worry away with one team that knows the whole job.' },
    { title: 'How we work', body: 'Every project starts with a site visit and a load study, never a catalogue. We choose the hardware that suits your vehicles, budget and electricity supply, do the civil and electrical work properly, handle the approvals, and then stay on as the people you call.' },
  ],
  values: [
    { k: '01', t: 'Safety first', d: 'Correct cable sizing, earthing and protection on every job. No shortcuts behind the wall.' },
    { k: '02', t: 'Honest advice', d: 'We recommend the charger you need, not the most expensive one.' },
    { k: '03', t: 'Clean work', d: 'Tidy cable runs and finishes that look like they belong to the building.' },
    { k: '04', t: 'Always reachable', d: 'One number, a real engineer, and maintenance plans that keep chargers available.' },
  ],
};
