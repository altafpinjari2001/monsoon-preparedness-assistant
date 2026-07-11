/**
 * MonsoonMitra RAG Knowledge Base & Local Vector/Keyword Retriever
 * Contains authoritative IMD, MSEDCL, and PMC monsoon safety guidelines.
 * @module modules/knowledge-base
 */

export const KNOWLEDGE_DOCS = [
  {
    id: 'imd-color-codes',
    title: 'IMD Rainfall Severity Classification & Color Alerts',
    source: 'India Meteorological Department (IMD)',
    category: 'Weather Guidance',
    content: `IMD issues four color-coded weather warnings:
1. Green (No Warning): Normal rainfall (< 15.5 mm/day). Keep routine schedules.
2. Yellow (Watch): Heavy rainfall expected (64.5 - 115.5 mm/day). Stay updated and check drains.
3. Orange (Alert): Very heavy rainfall (115.6 - 204.4 mm/day). Avoid non-essential travel, prepare emergency kit, check power backups.
4. Red (Warning): Extremely heavy rainfall (> 204.5 mm/day). High risk of flash floods and river overflow. Evacuate low-lying areas immediately, move to upper floors, do not cross flooded roads.`,
  },
  {
    id: 'pune-river-discharge',
    title: 'Pune Mutha & Mula River Flood & Dam Discharge Guidelines',
    source: 'Pune Municipal Corporation (PMC) & Irrigation Department',
    category: 'Flood Safety',
    content: `When water discharge from Khadakwasla Dam into the Mutha River exceeds 15,000 cusecs, low-lying riverside areas in Pune (Bhide Bridge, Deccan Gymkhana, Sinhagad Road, Patil Estate slum, Yerwada riverside) experience inundation.
Safety Protocol:
- If discharge exceeds 25,000 cusecs, riverside road bridges (Bhide Bridge) are closed.
- Move vehicles parked near river embankments to higher ground immediately.
- Ground floor residents within 100 meters of the riverbank should elevate electronics and keep emergency evacuation bags ready.`,
  },
  {
    id: 'electrical-safety-msedcl',
    title: 'Monsoon Electrical Safety & Submerged Equipment Guidelines',
    source: 'MSEDCL (Maharashtra State Electricity Distribution Co. Ltd.)',
    category: 'Electrical Safety',
    content: `Water and electricity are a deadly combination during monsoon waterlogging:
- Turn off the main electrical switch (MCB/ELCB) immediately if water enters the ground floor or reaches electrical sockets.
- Never touch wet electrical switches, metal poles, street lamp posts, or transformer fences on waterlogged streets.
- If a power line falls on your vehicle while inside, stay inside and call emergency services (1912 / 112). Do not step out into floodwater.`,
  },
  {
    id: 'waterborne-disease-prevention',
    title: 'Waterborne & Vector-Borne Monsoon Disease Prevention Protocol',
    source: 'National Center for Disease Control (NCDC) & PMC Health Dept',
    category: 'Health & Medical',
    content: `Monsoon floods increase risks of Leptospirosis, Dengue, Cholera, and Gastroenteritis:
- Boil drinking water for at least 10 minutes or use chlorine purification drops/tablets during flood conditions.
- Avoid wading through stagnant floodwater with open cuts; if exposed, consult a doctor for Leptospirosis prophylaxis (Doxycycline as prescribed).
- Prevent mosquito breeding by clearing stagnant water in flower pots, coolers, and terrace drains weekly.`,
  },
  {
    id: 'ground-floor-basement-safety',
    title: 'Ground Floor & Basement Flood Defense & Sandbagging Protocol',
    source: 'NDMA Urban Flooding Guidelines',
    category: 'Home Safety',
    content: `Independent houses and ground-floor apartments in low-lying areas must take structural precautions:
- Place sandbags or waterproof flood barriers across doorway entrances when waterlogging exceeds 6 inches outside.
- Fit non-return valves on sewage and bathroom drainage pipes to prevent backflow into the house.
- Keep important documents (Aadhaar, property papers, insurance) sealed in waterproof Ziploc bags on high shelves.`,
  },
  {
    id: 'vehicle-transit-safety',
    title: 'Urban Transit & Vehicle Safety During Severe Waterlogging',
    source: 'Pune Traffic Police & Disaster Management Cell',
    category: 'Travel Advisory',
    content: `Driving during urban waterlogging poses extreme risks of engine hydro-locking and electrocution:
- Never drive through water standing higher than the bottom of your vehicle doors or axle center.
- If stalled in rising water, abandon the vehicle immediately and move to higher ground.
- Keep a seatbelt cutter and window breaker glass hammer accessible inside the cabin.`,
  },
  {
    id: 'high-rise-balcony-safety',
    title: 'High-Rise Apartment & Balcony High-Wind Safety Protocol',
    source: 'National Building Code Disaster Safety',
    category: 'Home Safety',
    content: `Residents on upper floors of apartment complexes face gusty monsoon winds and heavy driving rain:
- Secure loose balcony items, hanging pots, and tin sheds that can become dangerous projectiles during squalls (> 50 km/h).
- Inspect window seals and clear balcony drainage outlets before heavy rain alerts to prevent indoor seepage.`,
  },
  {
    id: 'vulnerable-members-protocol',
    title: 'Emergency Protection Protocol for Vulnerable Household Members',
    source: 'NDMA Community Disaster Preparedness',
    category: 'Family Safety',
    content: `Households with elderly members, infants, differently-abled individuals, or pets require specific planning:
- Keep a 14-day supply of essential prescription medicines (insulin, heart/BP medication) in a waterproof container.
- Identify an accessible evacuation route and a designated neighbor or community volunteer well in advance.
- Keep pet carriers and pet food ready; never leave pets chained outdoors during flood alerts.`,
  },
  {
    id: 'pune-emergency-helplines',
    title: 'Pune Municipal Corporation & Maharashtra Emergency Contacts',
    source: 'PMC Disaster Management Cell',
    category: 'Emergency Resources',
    content: `Key emergency helpline numbers for Pune residents:
- National Emergency Helpline: 112
- PMC Disaster Management Control Room: 020-25501269 / 020-25506800
- Fire Brigade & Rescue: 101
- Ambulance / Medical Emergency: 108
- MSEDCL Electricity Helpline: 1912 / 1800-212-3435
- Police Control Room: 100`,
  },
  {
    id: 'scenario-action-plans',
    title: 'Scenario Action Plans: Basement Flood, Power Outage & Stranded Transit',
    source: 'MonsoonMitra Rapid Action Guidelines',
    category: 'Scenario Response',
    content: `Immediate Action Steps for Common Monsoon Emergencies:
- IF BASEMENT FLOODS: Do not enter the basement if water is touching electrical sockets or appliances. Shut off main supply from the exterior meter board first.
- IF POWER GOES OUT: Use rechargeable LED torches; avoid indoor open-flame candles near curtains. Unplug sensitive electronics to protect against surge when power returns.
- IF STRANDED WHILE TRAVELING: Move to the nearest solid elevated concrete structure (metro station, elevated mall platform). Avoid sheltering under old trees or billboards.`,
  },
];

/**
 * Perform local RAG retrieval over the knowledge base documents using TF-IDF / keyword scoring.
 * @param {string} query - User query string
 * @param {number} [limit=3] - Maximum number of relevant documents to return
 * @returns {Array<{doc: Object, score: number}>}
 */
export function retrieveRelevantDocs(query, limit = 3) {
  if (!query || typeof query !== 'string') return [];
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

  const scored = KNOWLEDGE_DOCS.map((doc) => {
    const fullText = `${doc.title} ${doc.category} ${doc.content}`.toLowerCase();
    let score = 0;

    // Direct phrase matching bonus
    if (fullText.includes(normalizedQuery)) {
      score += 15;
    }

    // Token frequency matching
    for (const token of queryTokens) {
      if (doc.title.toLowerCase().includes(token)) score += 5;
      if (doc.category.toLowerCase().includes(token)) score += 3;
      const regex = new RegExp(`\\b${token}\\b`, 'gi');
      const matches = doc.content.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    }

    return { doc, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Format retrieved documents as a grounded RAG context block for LLM prompts.
 * @param {Array<{doc: Object, score: number}>} retrieved
 * @returns {string}
 */
export function formatRagContext(retrieved) {
  if (!retrieved || retrieved.length === 0) return 'No specific knowledge base entry matched.';
  return retrieved
    .map(
      (item, index) =>
        `[Source ${index + 1}: ${item.doc.title} (${item.doc.source})]\n${item.doc.content}`
    )
    .join('\n\n');
}
