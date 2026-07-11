/**
 * Internationalization (i18n) module for multilingual support
 * @module i18n
 */

import { loadFromStorage, saveToStorage } from './helpers.js';

const STORAGE_KEY = 'monsoonguard_language';

/**
 * Translation strings for all supported languages.
 */
const translations = {
  en: {
    appTitle: 'MonsoonGuard',
    dashboard: 'Dashboard',
    checklist: 'Checklist',
    budget: 'Budget',
    advisor: 'AI Advisor',
    settings: 'Settings',
    currentWeather: 'Current Weather',
    forecast: '7-Day Forecast',
    floodRisk: 'Flood Risk',
    monsoonRisk: 'Monsoon Risk Score',
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    precipitation: 'Precipitation',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
    unknown: 'Unknown',
    preparednessProgress: 'Preparedness Progress',
    totalBudget: 'Total Budget',
    spent: 'Spent',
    remaining: 'Remaining',
    addExpense: 'Add Expense',
    remove: 'Remove',
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Reset',
    askAdvisor: 'Ask the AI Advisor...',
    send: 'Send',
    loading: 'Loading...',
    noData: 'No data available',
    locationRequired: 'Please set your location in Settings',
    apiKeyHint: 'Add your Gemini API key in Settings for AI features',
    emergencyNumbers: 'Emergency Numbers',
    ndrf: 'NDRF Helpline',
    nationalEmergency: 'National Emergency',
    weatherAlerts: 'Weather Alerts',
    safetyTips: 'Safety Tips',
    travelAdvisory: 'Travel Advisory',
    familySize: 'Family Size',
    location: 'Location',
    selectLanguage: 'Select Language',
    waterFood: 'Water & Food Supplies',
    documents: 'Important Documents',
    firstAid: 'First Aid & Medical',
    shelter: 'Shelter & Safety',
    communication: 'Communication & Power',
    transport: 'Transportation & Evacuation',
    overallProgress: 'Overall Progress',
    itemsCompleted: 'items completed',
    budgetOverview: 'Budget Overview',
    suggestedItems: 'Suggested Items',
    expenseName: 'Expense Name',
    expenseCost: 'Cost (₹)',
    expenseCategory: 'Category',
    noExpenses: 'No expenses added yet',
    quickAdd: 'Quick Add',
    chatPlaceholder: 'Ask about monsoon preparedness, flood safety, travel advisories...',
    welcomeMessage: 'Welcome to MonsoonGuard! How can I help you prepare for monsoon season?',
    typingIndicator: 'AI is thinking...',
    offlineMode: 'Offline Mode',
    lastUpdated: 'Last Updated',
    refreshData: 'Refresh Data',
    enterCity: 'Enter city name',
    useGPS: 'Use GPS',
    saveSettings: 'Save Settings',
    geminiApiKey: 'Gemini API Key',
    vulnerabilities: 'Household Vulnerabilities',
    elderly: 'Elderly members (60+)',
    children: 'Young children (0-5)',
    disabled: 'Persons with disabilities',
    pets: 'Pets / Livestock',
    medical: 'Members with medical conditions',
  },
  hi: {
    appTitle: 'मॉनसूनगार्ड',
    dashboard: 'डैशबोर्ड',
    checklist: 'चेकलिस्ट',
    budget: 'बजट',
    advisor: 'AI सलाहकार',
    settings: 'सेटिंग्स',
    currentWeather: 'वर्तमान मौसम',
    forecast: '7-दिन का पूर्वानुमान',
    floodRisk: 'बाढ़ का जोखिम',
    monsoonRisk: 'मॉनसून जोखिम स्कोर',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    windSpeed: 'हवा की गति',
    precipitation: 'वर्षा',
    low: 'कम',
    moderate: 'मध्यम',
    high: 'उच्च',
    critical: 'गंभीर',
    unknown: 'अज्ञात',
    preparednessProgress: 'तैयारी की प्रगति',
    totalBudget: 'कुल बजट',
    spent: 'खर्च',
    remaining: 'शेष',
    addExpense: 'खर्च जोड़ें',
    remove: 'हटाएं',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    reset: 'रीसेट',
    askAdvisor: 'AI सलाहकार से पूछें...',
    send: 'भेजें',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा उपलब्ध नहीं',
    locationRequired: 'कृपया सेटिंग्स में अपना स्थान सेट करें',
    apiKeyHint: 'AI सुविधाओं के लिए सेटिंग्स में Gemini API कुंजी जोड़ें',
    emergencyNumbers: 'आपातकालीन नंबर',
    ndrf: 'NDRF हेल्पलाइन',
    nationalEmergency: 'राष्ट्रीय आपातकालीन',
    weatherAlerts: 'मौसम अलर्ट',
    safetyTips: 'सुरक्षा सुझाव',
    travelAdvisory: 'यात्रा सलाह',
    familySize: 'परिवार का आकार',
    location: 'स्थान',
    selectLanguage: 'भाषा चुनें',
    waterFood: 'पानी और खाद्य आपूर्ति',
    documents: 'महत्वपूर्ण दस्तावेज',
    firstAid: 'प्राथमिक चिकित्सा',
    shelter: 'आश्रय और सुरक्षा',
    communication: 'संचार और बिजली',
    transport: 'परिवहन और निकासी',
    overallProgress: 'कुल प्रगति',
    itemsCompleted: 'आइटम पूर्ण',
    budgetOverview: 'बजट अवलोकन',
    suggestedItems: 'सुझावित आइटम',
    expenseName: 'खर्च का नाम',
    expenseCost: 'लागत (₹)',
    expenseCategory: 'श्रेणी',
    noExpenses: 'अभी तक कोई खर्च नहीं जोड़ा',
    quickAdd: 'जल्दी जोड़ें',
    chatPlaceholder: 'मॉनसून की तैयारी, बाढ़ सुरक्षा, यात्रा सलाह के बारे में पूछें...',
    welcomeMessage: 'मॉनसूनगार्ड में आपका स्वागत है! मॉनसून की तैयारी में कैसे मदद कर सकता हूं?',
    typingIndicator: 'AI सोच रहा है...',
    offlineMode: 'ऑफलाइन मोड',
    lastUpdated: 'अंतिम अपडेट',
    refreshData: 'डेटा रिफ्रेश करें',
    enterCity: 'शहर का नाम दर्ज करें',
    useGPS: 'GPS उपयोग करें',
    saveSettings: 'सेटिंग्स सहेजें',
    geminiApiKey: 'Gemini API कुंजी',
    vulnerabilities: 'घरेलू कमजोरियां',
    elderly: 'बुजुर्ग सदस्य (60+)',
    children: 'छोटे बच्चे (0-5)',
    disabled: 'विकलांग व्यक्ति',
    pets: 'पालतू जानवर',
    medical: 'चिकित्सा स्थिति वाले सदस्य',
  },
  bn: {
    appTitle: 'মনসুনগার্ড',
    dashboard: 'ড্যাশবোর্ড',
    checklist: 'চেকলিস্ট',
    budget: 'বাজেট',
    advisor: 'AI উপদেষ্টা',
    settings: 'সেটিংস',
    currentWeather: 'বর্তমান আবহাওয়া',
    forecast: '৭-দিনের পূর্বাভাস',
    floodRisk: 'বন্যার ঝুঁকি',
    monsoonRisk: 'মনসুন ঝুঁকি স্কোর',
    low: 'কম',
    moderate: 'মাঝারি',
    high: 'উচ্চ',
    critical: 'সংকটজনক',
    unknown: 'অজানা',
  },
  ta: {
    appTitle: 'மான்சூன்கார்ட்',
    dashboard: 'டாஷ்போர்டு',
    checklist: 'சரிபார்ப்புப் பட்டியல்',
    budget: 'பட்ஜெட்',
    advisor: 'AI ஆலோசகர்',
    currentWeather: 'தற்போதைய வானிலை',
    low: 'குறைவு',
    moderate: 'மிதமான',
    high: 'அதிக',
    critical: 'ஆபத்தான',
  },
  te: {
    appTitle: 'మాన్సూన్‌గార్డ్',
    dashboard: 'డాష్‌బోర్డ్',
    checklist: 'చెక్‌లిస్ట్',
    budget: 'బడ్జెట్',
    advisor: 'AI సలహాదారు',
    currentWeather: 'ప్రస్తుత వాతావరణం',
    low: 'తక్కువ',
    moderate: 'మధ్యస్థం',
    high: 'ఎక్కువ',
    critical: 'తీవ్రమైన',
  },
  mr: {
    appTitle: 'मॉन्सूनगार्ड',
    dashboard: 'डॅशबोर्ड',
    checklist: 'चेकलिस्ट',
    budget: 'बजेट',
    advisor: 'AI सल्लागार',
    currentWeather: 'सध्याचे हवामान',
    low: 'कमी',
    moderate: 'मध्यम',
    high: 'उच्च',
    critical: 'गंभीर',
  },
};

/**
 * Get current language code.
 * @returns {string}
 */
export function getCurrentLanguage() {
  return loadFromStorage(STORAGE_KEY, 'en');
}

/**
 * Set the current language.
 * @param {string} langCode
 */
export function setLanguage(langCode) {
  saveToStorage(STORAGE_KEY, langCode);
}

/**
 * Get a translated string by key.
 * Falls back to English if translation not found.
 * @param {string} key
 * @param {string} [lang]
 * @returns {string}
 */
export function t(key, lang) {
  const currentLang = lang || getCurrentLanguage();
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

/**
 * Get all supported languages.
 * @returns {Array<{code: string, name: string}>}
 */
export function getSupportedLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
  ];
}
