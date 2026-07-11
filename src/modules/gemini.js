/**
 * Gemini AI integration module for monsoon advisory
 * @module gemini
 */

import { loadFromStorage, sanitizeInput } from './helpers.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get the stored API key.
 * @returns {string|null}
 */
export function getApiKey() {
  return loadFromStorage('monsoonguard_api_key', null);
}

/**
 * Check if the Gemini API is configured.
 * @returns {boolean}
 */
export function isApiConfigured() {
  const key = getApiKey();
  return key !== null && key.length > 0;
}

/**
 * Build the system prompt for monsoon advisory.
 * @param {Object} context - User context (location, family, weather, etc.)
 * @returns {string}
 */
export function buildSystemPrompt(context) {
  return `You are MonsoonGuard AI, an expert monsoon preparedness advisor for India and South Asia. You provide personalized, actionable safety guidance.

User Context:
- Location: ${context.location || 'Not specified'}
- Family Size: ${context.familySize || 'Not specified'}
- Vulnerabilities: ${context.vulnerabilities?.join(', ') || 'None specified'}
- Current Weather: ${context.weather || 'Not available'}
- Flood Risk Level: ${context.floodRisk || 'Unknown'}
- Language Preference: ${context.language || 'English'}

Guidelines:
- Provide specific, actionable advice based on the user's context
- Prioritize life safety above all
- Include local emergency numbers when relevant (NDRF: 011-24363260, National Emergency: 112)
- Be culturally sensitive and use local examples
- If the user asks in Hindi or another Indian language, respond in that language
- Keep responses concise but thorough
- Include practical tips specific to monsoon preparedness
- Mention government resources and schemes when relevant`;
}

/**
 * Send a message to Gemini AI.
 * @param {string} userMessage - The user's question
 * @param {Object} context - User context
 * @param {Array} history - Chat history
 * @returns {Promise<string>} AI response text
 */
export async function sendMessage(userMessage, context = {}, history = []) {
  const sanitizedMessage = sanitizeInput(userMessage);
  if (!sanitizedMessage) throw new Error('Message cannot be empty');

  const apiKey = getApiKey();
  if (!apiKey) {
    return getMockResponse(sanitizedMessage);
  }

  try {
    const systemPrompt = buildSystemPrompt(context);
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I am MonsoonGuard AI, ready to help with monsoon preparedness. How can I assist you?' }] },
    ];

    // Add conversation history
    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    // Add current message
    contents.push({ role: 'user', parts: [{ text: sanitizedMessage }] });

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from AI');
    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }
    // Fallback to mock response
    return getMockResponse(sanitizedMessage);
  }
}

/**
 * Get a context-aware mock response when API is unavailable.
 * @param {string} message
 * @returns {string}
 */
export function getMockResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('flood') || lower.includes('water level') || lower.includes('बाढ़')) {
    return `🌊 **Flood Safety Advisory**

Here are critical flood preparedness steps:

1. **Before a Flood:**
   - Move to higher ground if you live in a flood-prone area
   - Keep important documents in waterproof bags
   - Stock 7 days of drinking water and food
   - Know your evacuation route

2. **During a Flood:**
   - Never walk or drive through flood waters
   - Move to the highest floor of your building
   - Call NDRF helpline: 011-24363260
   - National Emergency: 112

3. **After a Flood:**
   - Boil or purify all drinking water
   - Watch for waterborne diseases
   - Document damage for insurance claims
   - Avoid damaged structures

💡 *Configure your Gemini API key in Settings for personalized AI-powered advice.*`;
  }

  if (lower.includes('checklist') || lower.includes('prepare') || lower.includes('तैयारी')) {
    return `✅ **Monsoon Preparedness Checklist**

Here's your priority preparation list:

**🔴 Critical (Do Today):**
- Store drinking water (4L/person/day for 7 days)
- Stock prescription medicines (30-day supply)
- Charge power banks and flashlights
- Save emergency contacts (NDRF: 011-24363260)

**🟡 Important (This Week):**
- Clear drains and gutters around home
- Waterproof your important documents
- Prepare an emergency go-bag
- Identify nearest flood shelter

**🟢 Recommended:**
- Install weather alert apps
- Brief family on evacuation plan
- Check insurance coverage
- Stock mosquito repellent

📋 *Use the Checklist tab to track your progress!*

💡 *Configure your Gemini API key in Settings for personalized AI-powered advice.*`;
  }

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('money') || lower.includes('खर्च')) {
    return `💰 **Monsoon Preparedness Budget Guide**

Estimated costs for a family of 4:

| Item | Estimated Cost (₹) |
|------|-------------------|
| Water supply (7 days) | ₹500 |
| Non-perishable food | ₹2,000 |
| First aid kit | ₹800 |
| Medicines | ₹1,500 |
| Flashlight + batteries | ₹350 |
| Power bank | ₹1,200 |
| Rain gear | ₹800 |
| Emergency go-bag | ₹1,500 |
| **Total Minimum** | **₹8,650** |

📊 *Use the Budget Planner tab to track your spending!*

💡 *Configure your Gemini API key in Settings for personalized AI-powered advice.*`;
  }

  if (lower.includes('travel') || lower.includes('route') || lower.includes('यात्रा')) {
    return `🚗 **Monsoon Travel Advisory**

**Before Traveling:**
- Check weather forecast for your route
- Inform family of your travel plans
- Keep vehicle fuel tank full
- Carry emergency supplies in vehicle

**During Travel:**
- Avoid waterlogged roads — even 6 inches of water can knock you down
- Don't cross flooded bridges
- Keep headlights on during heavy rain
- If stranded, stay in your vehicle on high ground

**Road Safety:**
- Maintain 3x normal following distance
- Reduce speed in rain by at least 30%
- Watch for debris and potholes
- Avoid driving at night during heavy rain

**Emergency Numbers:**
- National Emergency: 112
- Highway Helpline: 1033
- NDRF: 011-24363260

💡 *Configure your Gemini API key in Settings for personalized AI-powered advice.*`;
  }

  // Default response
  return `🌧️ **MonsoonGuard AI Assistant**

I'm here to help you prepare for monsoon season! Here's what I can help with:

1. **🌊 Flood Safety** — Ask about flood preparedness, evacuation plans, or water safety
2. **✅ Checklists** — Get customized preparation checklists for your family
3. **💰 Budget Planning** — Estimate costs for monsoon supplies
4. **🚗 Travel Advisory** — Safe travel tips during monsoon
5. **🏥 Health & Safety** — Monsoon health risks and prevention
6. **📱 Emergency Contacts** — Local emergency numbers and resources

Try asking:
- "How should I prepare my home for flooding?"
- "What medicines should I stock for monsoon?"
- "Is it safe to travel during heavy rain?"
- "Create a preparation plan for my family of 5"

💡 *For personalized AI-powered responses, add your free Gemini API key in Settings. Get one at [Google AI Studio](https://aistudio.google.com/apikey).*`;
}
