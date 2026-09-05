import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "leaflet/dist/leaflet.css";
import "./App.css";

/* =========================================================
   STATES
========================================================= */

const states = [
  {
    id: "arunachal-pradesh",
    name: "Arunachal Pradesh",
    capital: "Itanagar",
    region: "Eastern Himalayas",
    coordinates: [27.0844, 93.6053],
    latitude: 27.0844,
    longitude: 93.6053,
    area: "83,743 km²",
    population: "1.4 million",
    description:
      "Arunachal Pradesh contains high-altitude terrain, dense forests, and river valleys that require continuous environmental monitoring.",
    highlights: [
      "Mountainous terrain",
      "High forest coverage",
      "River and landslide monitoring",
    ],
  },
  {
    id: "assam",
    name: "Assam",
    capital: "Dispur",
    region: "Brahmaputra Valley",
    coordinates: [26.2006, 92.9376],
    latitude: 26.2006,
    longitude: 92.9376,
    area: "78,438 km²",
    population: "31.2 million",
    description:
      "Assam is highly influenced by monsoon rainfall, river flooding, and changing soil moisture conditions across the Brahmaputra Valley.",
    highlights: [
      "Flood-prone river systems",
      "Heavy monsoon rainfall",
      "Agricultural land monitoring",
    ],
  },
  {
    id: "manipur",
    name: "Manipur",
    capital: "Imphal",
    region: "Eastern Hills",
    coordinates: [24.6637, 93.9063],
    latitude: 24.6637,
    longitude: 93.9063,
    area: "22,327 km²",
    population: "2.9 million",
    description:
      "Manipur includes valley and hill ecosystems where rainfall, soil moisture, and land-use changes affect environmental stability.",
    highlights: [
      "Valley and hill ecosystems",
      "Seasonal rainfall changes",
      "Land-use monitoring",
    ],
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    capital: "Shillong",
    region: "Shillong Plateau",
    coordinates: [25.467, 91.3662],
    latitude: 25.467,
    longitude: 91.3662,
    area: "22,429 km²",
    population: "3 million",
    description:
      "Meghalaya receives some of the highest rainfall levels in the region, making rainfall and soil saturation important monitoring factors.",
    highlights: [
      "Very high rainfall",
      "Plateau and hill terrain",
      "Soil saturation monitoring",
    ],
  },
  {
    id: "mizoram",
    name: "Mizoram",
    capital: "Aizawl",
    region: "Mizo Hills",
    coordinates: [23.1645, 92.9376],
    latitude: 23.1645,
    longitude: 92.9376,
    area: "21,081 km²",
    population: "1.1 million",
    description:
      "Mizoram’s steep hills and seasonal rainfall create a need for close observation of soil moisture and slope stability.",
    highlights: [
      "Steep hill slopes",
      "Rainfall-sensitive terrain",
      "Landslide risk observation",
    ],
  },
  {
    id: "nagaland",
    name: "Nagaland",
    capital: "Kohima",
    region: "Naga Hills",
    coordinates: [25.6751, 94.1086],
    latitude: 25.6751,
    longitude: 94.1086,
    area: "16,579 km²",
    population: "1.9 million",
    description:
      "Nagaland’s hilly landscape and forest ecosystems benefit from regular monitoring of rainfall, soil conditions, and land changes.",
    highlights: [
      "Hilly terrain",
      "Forest ecosystems",
      "Rainfall and soil tracking",
    ],
  },
  {
    id: "sikkim",
    name: "Sikkim",
    capital: "Gangtok",
    region: "Eastern Himalayas",
    coordinates: [27.533, 88.5122],
    latitude: 27.533,
    longitude: 88.5122,
    area: "7,096 km²",
    population: "610,000",
    description:
      "Sikkim’s Himalayan environment includes glaciers, mountain slopes, and river systems that require long-term observation.",
    highlights: [
      "Himalayan mountain systems",
      "Glacial and river monitoring",
      "Lower overall risk level",
    ],
  },
  {
    id: "tripura",
    name: "Tripura",
    capital: "Agartala",
    region: "Eastern Plains",
    coordinates: [23.9408, 91.9882],
    latitude: 23.9408,
    longitude: 91.9882,
    area: "10,486 km²",
    population: "3.7 million",
    description:
      "Tripura’s humid climate and dense vegetation make rainfall, soil moisture, and land-cover changes important indicators.",
    highlights: [
      "Humid climate",
      "Dense vegetation",
      "Rainfall-sensitive agricultural areas",
    ],
  },
];

/* =========================================================
   INCIDENT TYPES
========================================================= */

const incidentTypes = [
  "Road crack",
  "Rockfall",
  "Soil movement",
  "Water seepage",
  "Blocked road",
  "Retaining-wall damage",
  "Other",
];

const incidentStatuses = [
  "Submitted",
  "Under Review",
  "Verified",
  "False Alarm",
  "Resolved",
];

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  English: {
    language: "Select Language",
    chooseState: "Choose a state",
    searchStates: "Search states...",
    noStates: "No states found.",
    chooseStateBegin: "Choose a state to begin",
    selectStateDescription:
      "Select a state from the region directory to view its live environmental conditions, weather forecast, risk level, and monitoring recommendations.",
    selectAnyState: "Select any state from the list",

    liveNotice: "Live data notice",
    liveNoticeText:
      "Weather and soil-moisture values are fetched from a live weather-data service. Overall risk is an estimated indicator, not an official disaster warning.",

    communitySafety: "COMMUNITY SAFETY",
    seeUnusual: "See something unusual?",
    reportDescription:
      "Report road damage, rockfall, soil movement, or other environmental incidents.",
    reportIncident: "Report an incident",

    fieldOfficerDashboard: "Field officer dashboard",
    hideOfficerDashboard: "Hide officer dashboard",

    communityReports: "COMMUNITY REPORTS",
    recentReports: "Recent incident reports",

    fieldOperations: "FIELD OPERATIONS",
    officerDashboard: "Officer verification dashboard",
    officerDescription:
      "Review citizen reports and update their verification status and action taken.",
    noReports:
      "No incident reports are available for review yet.",

    location: "Location",
    state: "State",
    submitted: "Submitted",
    description: "Description",
    severity: "Severity",
    verificationStatus: "Verification status",
    actionTaken: "Action taken",

    siteInspection:
      "Example: Site inspection scheduled...",

    selectedRegion: "SELECTED REGION",
    estimatedRisk: "Estimated risk",
    viewFullAnalysis: "View full analysis",

    liveEnvironmentalData: "Live environmental data",
    lastUpdated: "Last updated",
    refreshData: "Refresh data",
    refreshing: "Refreshing...",

    temperature: "TEMPERATURE",
    soilMoisture: "SOIL MOISTURE",
    rainfall: "RAINFALL",
    overallRisk: "OVERALL RISK",

    currentTemperature: "Current air temperature",
    soilEstimate: "Live surface soil-moisture estimate",
    currentRainfall: "Current precipitation level",
    estimatedIndicators:
      "Estimated from live environmental indicators",
    notOfficial: "Not an official disaster warning",

    currentWeather: "CURRENT WEATHER",
    rainProbability: "Rain probability",
    humidity: "Humidity",

    weatherOutlook: "WEATHER OUTLOOK",
    sevenDayForecast: "7-day forecast",
    today: "Today",
    rain: "Rain",
    forecastLoading: "Loading forecast...",
    forecastUnavailable: "Forecast data is unavailable.",

    visualInsights: "VISUAL INSIGHTS",
    weatherTrends: "Weather trends",

    temperatureTrend: "Temperature trend",
    temperatureDescription:
      "Maximum and minimum temperature over the next 7 days",

    rainfallForecast: "Rainfall forecast",
    rainfallDescription:
      "Expected rainfall for the next 7 days",

    advisories: "ENVIRONMENTAL ADVISORIES",
    emergencyAlerts: "Emergency alerts",
    hideAlerts: "Hide alerts",
    showAlerts: "Show alerts",

    advisoryNotice:
      "These are automatically generated environmental advisories based on available weather indicators. They are not official government warnings.",

    alertsUnavailable:
      "Alerts will appear when live data becomes available.",

    suggestedAction: "Suggested action",

    interactiveMap: "INTERACTIVE MAP",
    northEasternRegion: "North Eastern Region",

    low: "Low",
    moderate: "Moderate",
    high: "High",

    regionalAnalysis: "REGIONAL ANALYSIS",
    insights: "insights",
    liveOverview: "Live environmental overview",
    monitoringPriorities: "Monitoring priorities",
    windSpeed: "Wind speed",

    citizenReporting: "CITIZEN REPORTING",
    incidentModalDescription:
      "Help the monitoring team understand what is happening on the ground.",

    incidentType: "Incident type",
    photograph: "Photograph",
    photographHelp:
      "Optional. Upload a photograph of the reported condition.",

    cancel: "Cancel",
    submitReport: "Submit report",

    incidentSubmitted:
      "Incident report submitted successfully.",

    enterDescription:
      "Please enter an incident description.",

    enterLocation:
      "Please enter the incident location.",
  },

  Hindi: {
    language: "भाषा चुनें",
    chooseState: "राज्य चुनें",
    searchStates: "राज्य खोजें...",
    noStates: "कोई राज्य नहीं मिला।",

    chooseStateBegin:
      "शुरू करने के लिए राज्य चुनें",

    selectStateDescription:
      "लाइव पर्यावरणीय स्थिति, मौसम पूर्वानुमान, जोखिम स्तर और निगरानी सुझाव देखने के लिए किसी राज्य का चयन करें।",

    selectAnyState:
      "सूची से कोई राज्य चुनें",

    liveNotice: "लाइव डेटा सूचना",

    liveNoticeText:
      "मौसम और मिट्टी की नमी का डेटा लाइव मौसम सेवा से लिया जाता है। कुल जोखिम एक अनुमानित संकेतक है, आधिकारिक आपदा चेतावनी नहीं।",

    communitySafety: "सामुदायिक सुरक्षा",
    seeUnusual: "कुछ असामान्य दिखाई दिया?",

    reportDescription:
      "सड़क क्षति, पत्थर गिरने, मिट्टी खिसकने या अन्य पर्यावरणीय घटनाओं की रिपोर्ट करें।",

    reportIncident: "घटना की रिपोर्ट करें",

    fieldOfficerDashboard:
      "अधिकारी डैशबोर्ड",

    hideOfficerDashboard:
      "अधिकारी डैशबोर्ड छिपाएँ",

    communityReports: "सामुदायिक रिपोर्ट",
    recentReports: "हाल की घटना रिपोर्ट",

    fieldOperations: "क्षेत्रीय कार्य",

    officerDashboard:
      "अधिकारी सत्यापन डैशबोर्ड",

    officerDescription:
      "नागरिक रिपोर्ट की समीक्षा करें और उनकी स्थिति तथा कार्रवाई अपडेट करें।",

    noReports:
      "समीक्षा के लिए अभी कोई घटना रिपोर्ट उपलब्ध नहीं है।",

    location: "स्थान",
    state: "राज्य",
    submitted: "जमा किया गया",
    description: "विवरण",
    severity: "गंभीरता",

    verificationStatus:
      "सत्यापन स्थिति",

    actionTaken: "की गई कार्रवाई",

    siteInspection:
      "उदाहरण: स्थल निरीक्षण निर्धारित किया गया...",

    selectedRegion: "चयनित क्षेत्र",
    estimatedRisk: "अनुमानित जोखिम",
    viewFullAnalysis: "पूरा विश्लेषण देखें",

    liveEnvironmentalData:
      "लाइव पर्यावरणीय डेटा",

    lastUpdated: "अंतिम अपडेट",
    refreshData: "डेटा रिफ्रेश करें",
    refreshing: "रिफ्रेश हो रहा है...",

    temperature: "तापमान",
    soilMoisture: "मिट्टी की नमी",
    rainfall: "वर्षा",
    overallRisk: "कुल जोखिम",

    currentTemperature:
      "वर्तमान वायु तापमान",

    soilEstimate:
      "लाइव सतही मिट्टी की नमी का अनुमान",

    currentRainfall:
      "वर्तमान वर्षा स्तर",

    estimatedIndicators:
      "लाइव पर्यावरणीय संकेतकों से अनुमानित",

    notOfficial:
      "आधिकारिक आपदा चेतावनी नहीं",

    currentWeather: "वर्तमान मौसम",
    rainProbability: "वर्षा की संभावना",
    humidity: "नमी",

    weatherOutlook: "मौसम पूर्वानुमान",
    sevenDayForecast: "7-दिन का पूर्वानुमान",

    today: "आज",
    rain: "वर्षा",

    forecastLoading:
      "पूर्वानुमान लोड हो रहा है...",

    forecastUnavailable:
      "पूर्वानुमान डेटा उपलब्ध नहीं है।",

    visualInsights: "दृश्य जानकारी",
    weatherTrends: "मौसम के रुझान",

    temperatureTrend:
      "तापमान का रुझान",

    temperatureDescription:
      "अगले 7 दिनों का अधिकतम और न्यूनतम तापमान",

    rainfallForecast:
      "वर्षा पूर्वानुमान",

    rainfallDescription:
      "अगले 7 दिनों की अपेक्षित वर्षा",

    advisories: "पर्यावरणीय सलाह",
    emergencyAlerts: "आपातकालीन अलर्ट",

    hideAlerts: "अलर्ट छिपाएँ",
    showAlerts: "अलर्ट दिखाएँ",

    advisoryNotice:
      "ये उपलब्ध मौसम संकेतकों के आधार पर स्वचालित रूप से बनाए गए पर्यावरणीय सुझाव हैं। ये आधिकारिक सरकारी चेतावनी नहीं हैं।",

    alertsUnavailable:
      "लाइव डेटा उपलब्ध होने पर अलर्ट दिखाई देंगे।",

    suggestedAction:
      "सुझाई गई कार्रवाई",

    interactiveMap: "इंटरैक्टिव मानचित्र",

    northEasternRegion:
      "उत्तर-पूर्वी क्षेत्र",

    low: "कम",
    moderate: "मध्यम",
    high: "उच्च",

    regionalAnalysis:
      "क्षेत्रीय विश्लेषण",

    insights: "जानकारी",

    liveOverview:
      "लाइव पर्यावरणीय अवलोकन",

    monitoringPriorities:
      "निगरानी प्राथमिकताएँ",

    windSpeed: "हवा की गति",

    citizenReporting:
      "नागरिक रिपोर्टिंग",

    incidentModalDescription:
      "निगरानी टीम को जमीन पर हो रही स्थिति समझने में सहायता करें।",

    incidentType: "घटना का प्रकार",

    photograph: "फोटो",

    photographHelp:
      "वैकल्पिक। रिपोर्ट की गई स्थिति का फोटो अपलोड करें।",

    cancel: "रद्द करें",

    submitReport:
      "रिपोर्ट जमा करें",

    incidentSubmitted:
      "घटना रिपोर्ट सफलतापूर्वक जमा की गई।",

    enterDescription:
      "कृपया घटना का विवरण दर्ज करें।",

    enterLocation:
      "कृपया घटना का स्थान दर्ज करें।",
  },

  Tamil: {
    language: "மொழியைத் தேர்ந்தெடுக்கவும்",

    chooseState:
      "ஒரு மாநிலத்தைத் தேர்ந்தெடுக்கவும்",

    searchStates:
      "மாநிலங்களைத் தேடுங்கள்...",

    noStates:
      "மாநிலங்கள் எதுவும் கிடைக்கவில்லை.",

    chooseStateBegin:
      "தொடங்க ஒரு மாநிலத்தைத் தேர்ந்தெடுக்கவும்",

    selectStateDescription:
      "நேரடி சுற்றுச்சூழல் நிலை, வானிலை முன்னறிவிப்பு, அபாய நிலை மற்றும் கண்காணிப்பு பரிந்துரைகளைப் பார்க்க ஒரு மாநிலத்தைத் தேர்ந்தெடுக்கவும்.",

    selectAnyState:
      "பட்டியலில் இருந்து ஏதேனும் ஒரு மாநிலத்தைத் தேர்ந்தெடுக்கவும்",

    liveNotice:
      "நேரடி தரவு அறிவிப்பு",

    liveNoticeText:
      "வானிலை மற்றும் மண் ஈரப்பதத் தரவுகள் நேரடி வானிலை சேவையிலிருந்து பெறப்படுகின்றன. மொத்த அபாய நிலை ஒரு மதிப்பீடு மட்டுமே; இது அதிகாரப்பூர்வ பேரிடர் எச்சரிக்கை அல்ல.",

    communitySafety:
      "சமூக பாதுகாப்பு",

    seeUnusual:
      "வழக்கத்திற்கு மாறான ஏதாவது காண்கிறீர்களா?",

    reportDescription:
      "சாலை சேதம், பாறை சரிவு, மண் நகர்வு அல்லது பிற சுற்றுச்சூழல் சம்பவங்களைப் புகாரளிக்கவும்.",

    reportIncident:
      "சம்பவத்தைப் புகாரளிக்கவும்",

    fieldOfficerDashboard:
      "கள அதிகாரி டாஷ்போர்டு",

    hideOfficerDashboard:
      "அதிகாரி டாஷ்போர்டை மறைக்கவும்",

    communityReports:
      "சமூகப் புகார்கள்",

    recentReports:
      "சமீபத்திய சம்பவப் புகார்கள்",

    fieldOperations:
      "கள செயல்பாடுகள்",

    officerDashboard:
      "அதிகாரி சரிபார்ப்பு டாஷ்போர்டு",

    officerDescription:
      "பொதுமக்களின் புகார்களை மதிப்பாய்வு செய்து அவற்றின் சரிபார்ப்பு நிலை மற்றும் எடுக்கப்பட்ட நடவடிக்கையைப் புதுப்பிக்கவும்.",

    noReports:
      "மதிப்பாய்வு செய்ய இதுவரை எந்த சம்பவப் புகார்களும் இல்லை.",

    location: "இடம்",
    state: "மாநிலம்",
    submitted: "சமர்ப்பிக்கப்பட்டது",
    description: "விளக்கம்",
    severity: "தீவிரம்",

    verificationStatus:
      "சரிபார்ப்பு நிலை",

    actionTaken:
      "எடுக்கப்பட்ட நடவடிக்கை",

    siteInspection:
      "உதாரணம்: இட ஆய்வு திட்டமிடப்பட்டுள்ளது...",

    selectedRegion:
      "தேர்ந்தெடுக்கப்பட்ட பகுதி",

    estimatedRisk:
      "மதிப்பிடப்பட்ட அபாயம்",

    viewFullAnalysis:
      "முழு பகுப்பாய்வைப் பார்க்கவும்",

    liveEnvironmentalData:
      "நேரடி சுற்றுச்சூழல் தரவு",

    lastUpdated:
      "கடைசியாக புதுப்பிக்கப்பட்டது",

    refreshData:
      "தரவைப் புதுப்பிக்கவும்",

    refreshing:
      "புதுப்பிக்கப்படுகிறது...",

    temperature:
      "வெப்பநிலை",

    soilMoisture:
      "மண் ஈரப்பதம்",

    rainfall:
      "மழைப்பொழிவு",

    overallRisk:
      "மொத்த அபாய நிலை",

    currentTemperature:
      "தற்போதைய காற்றின் வெப்பநிலை",

    soilEstimate:
      "நேரடி மேற்பரப்பு மண் ஈரப்பத மதிப்பீடு",

    currentRainfall:
      "தற்போதைய மழைப்பொழிவு அளவு",

    estimatedIndicators:
      "நேரடி சுற்றுச்சூழல் குறியீடுகளின் அடிப்படையில் மதிப்பிடப்பட்டது",

    notOfficial:
      "இது அதிகாரப்பூர்வ பேரிடர் எச்சரிக்கை அல்ல",

    currentWeather:
      "தற்போதைய வானிலை",

    rainProbability:
      "மழைக்கான வாய்ப்பு",

    humidity:
      "ஈரப்பதம்",

    weatherOutlook:
      "வானிலை முன்னறிவிப்பு",

    sevenDayForecast:
      "7 நாள் முன்னறிவிப்பு",

    today:
      "இன்று",

    rain:
      "மழை",

    forecastLoading:
      "முன்னறிவிப்பு ஏற்றப்படுகிறது...",

    forecastUnavailable:
      "முன்னறிவிப்பு தரவு கிடைக்கவில்லை.",

    visualInsights:
      "காட்சி தகவல்கள்",

    weatherTrends:
      "வானிலை மாற்றங்கள்",

    temperatureTrend:
      "வெப்பநிலை மாற்றம்",

    temperatureDescription:
      "அடுத்த 7 நாட்களின் அதிகபட்ச மற்றும் குறைந்தபட்ச வெப்பநிலை",

    rainfallForecast:
      "மழைப்பொழிவு முன்னறிவிப்பு",

    rainfallDescription:
      "அடுத்த 7 நாட்களில் எதிர்பார்க்கப்படும் மழைப்பொழிவு",

    advisories:
      "சுற்றுச்சூழல் ஆலோசனைகள்",

    emergencyAlerts:
      "அவசர எச்சரிக்கைகள்",

    hideAlerts:
      "எச்சரிக்கைகளை மறைக்கவும்",

    showAlerts:
      "எச்சரிக்கைகளைக் காட்டவும்",

    advisoryNotice:
      "கிடைக்கக்கூடிய வானிலை குறியீடுகளின் அடிப்படையில் இந்த சுற்றுச்சூழல் ஆலோசனைகள் தானாக உருவாக்கப்படுகின்றன. இவை அதிகாரப்பூர்வ அரசு எச்சரிக்கைகள் அல்ல.",

    alertsUnavailable:
      "நேரடி தரவு கிடைக்கும்போது எச்சரிக்கைகள் தோன்றும்.",

    suggestedAction:
      "பரிந்துரைக்கப்பட்ட நடவடிக்கை",

    interactiveMap:
      "ஊடாடும் வரைபடம்",

    northEasternRegion:
      "வடகிழக்கு பிராந்தியம்",

    low:
      "குறைவு",

    moderate:
      "மிதமான",

    high:
      "அதிகம்",

    regionalAnalysis:
      "பிராந்திய பகுப்பாய்வு",

    insights:
      "தகவல்கள்",

    liveOverview:
      "நேரடி சுற்றுச்சூழல் மேலோட்டம்",

    monitoringPriorities:
      "கண்காணிப்பு முன்னுரிமைகள்",

    windSpeed:
      "காற்றின் வேகம்",

    citizenReporting:
      "பொதுமக்கள் புகாரளிப்பு",

    incidentModalDescription:
      "தரையில் என்ன நடக்கிறது என்பதை கண்காணிப்பு குழு புரிந்துகொள்ள உதவுங்கள்.",

    incidentType:
      "சம்பவ வகை",

    photograph:
      "புகைப்படம்",

    photographHelp:
      "விருப்பத்தேர்வு. புகாரளிக்கப்பட்ட நிலையின் புகைப்படத்தைப் பதிவேற்றவும்.",

    cancel:
      "ரத்து செய்யவும்",

    submitReport:
      "புகாரைச் சமர்ப்பிக்கவும்",

    incidentSubmitted:
      "சம்பவப் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",

    enterDescription:
      "சம்பவத்தின் விளக்கத்தை உள்ளிடவும்.",

    enterLocation:
      "சம்பவம் நடந்த இடத்தை உள்ளிடவும்.",
  },
};

/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({ selectedState }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedState) return;

    map.flyTo(selectedState.coordinates, 7, {
      duration: 1.2,
    });
  }, [map, selectedState]);

  return null;
}

/* =========================================================
   RISK CALCULATION
========================================================= */

function calculateRisk(rainfall, soilMoisture) {
  const rain = Number(rainfall) || 0;
  const moisture = Number(soilMoisture) || 0;

  if (rain >= 20 || moisture >= 0.8) {
    return {
      label: "High",
      level: "high",
    };
  }

  if (rain >= 5 || moisture >= 0.6) {
    return {
      label: "Moderate",
      level: "moderate",
    };
  }

  return {
    label: "Low",
    level: "low",
  };
}

/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function getWeatherDescription(weatherCode) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm with hail",
  };

  return (
    descriptions[weatherCode] ||
    "Variable conditions"
  );
}

/* =========================================================
   WEATHER ICON
========================================================= */

function getWeatherIcon(weatherCode) {
  if ([95, 96, 99].includes(weatherCode)) {
    return "⛈️";
  }

  if ([80, 81, 82, 85, 86].includes(weatherCode)) {
    return "🌧️";
  }

  if ([61, 63, 65, 66, 67].includes(weatherCode)) {
    return "☔";
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "🌦️";
  }

  if ([45, 48].includes(weatherCode)) {
    return "🌫️";
  }

  if (weatherCode === 3) {
    return "☁️";
  }

  if ([1, 2].includes(weatherCode)) {
    return "⛅";
  }

  return "☀️";
}

/* =========================================================
   ADVISORIES
========================================================= */

function generateAdvisories(state) {
  if (!state || state.overallRisk === "Loading") {
    return [];
  }

  const rainfall = Number(state.rainfall) || 0;
  const soilMoisture =
    Number(state.soilMoisture) || 0;

  const rainProbability =
    Number(state.rainProbability) || 0;

  const windSpeed =
    Number(state.windSpeed) || 0;

  const advisories = [];

  if (
    rainfall >= 20 ||
    soilMoisture >= 0.8
  ) {
    advisories.push({
      level: "high",
      title:
        "High environmental stress detected",
      message:
        "Heavy rainfall or high soil moisture may increase the possibility of flooding, waterlogging, or slope instability.",
      action:
        "Monitor nearby rivers, drainage systems, and vulnerable slopes.",
    });
  } else if (
    rainfall >= 5 ||
    soilMoisture >= 0.6
  ) {
    advisories.push({
      level: "moderate",
      title:
        "Moderate environmental conditions",
      message:
        "Rainfall or soil moisture is above the normal monitoring threshold.",
      action:
        "Continue observation of local drainage, agricultural areas, and hill slopes.",
    });
  } else {
    advisories.push({
      level: "low",
      title:
        "No major environmental stress detected",
      message:
        "Current rainfall and soil-moisture indicators remain within the lower estimated-risk range.",
      action:
        "Continue regular environmental monitoring.",
    });
  }

  if (rainProbability >= 70) {
    advisories.push({
      level: "moderate",
      title:
        "Rainfall probability is elevated",
      message:
        "The forecast indicates a higher chance of precipitation during the monitoring period.",
      action:
        "Keep checking local weather updates and avoid relying only on this prototype.",
    });
  }

  if (windSpeed >= 35) {
    advisories.push({
      level: "moderate",
      title:
        "Strong wind conditions",
      message:
        "Current wind speed is relatively high and may affect exposed areas or temporary structures.",
      action:
        "Exercise caution around trees, loose objects, and exposed locations.",
    });
  }

  return advisories;
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [selectedStateId, setSelectedStateId] =
    useState(() => {
      return (
        localStorage.getItem(
          "sahaya-selected-state"
        ) || null
      );
    });

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showFullAnalysis, setShowFullAnalysis] =
    useState(false);

  const [showAlerts, setShowAlerts] =
    useState(true);

  const [liveData, setLiveData] =
    useState({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [language, setLanguage] =
    useState("English");

  const text = translations[language];

  /* =====================================================
     SAVE SELECTED STATE
  ===================================================== */

  useEffect(() => {
    if (selectedStateId) {
      localStorage.setItem(
        "sahaya-selected-state",
        selectedStateId
      );
    } else {
      localStorage.removeItem(
        "sahaya-selected-state"
      );
    }
  }, [selectedStateId]);

  /* =====================================================
     CITIZEN REPORTING
  ===================================================== */

  const [showIncidentForm, setShowIncidentForm] =
    useState(false);

  const [incidentReports, setIncidentReports] =
    useState([]);

  /* =====================================================
     FIELD OFFICER DASHBOARD
  ===================================================== */

  const [
    showOfficerDashboard,
    setShowOfficerDashboard,
  ] = useState(false);

  const [incidentForm, setIncidentForm] =
    useState({
      type: "Road crack",
      description: "",
      location: "",
      severity: "Moderate",
      photograph: null,
    });

  const selectedState = states.find(
    (state) =>
      state.id === selectedStateId
  );

  const filteredStates = states.filter(
    (state) =>
      state.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
  );

  /* =====================================================
     TRANSLATE RISK
  ===================================================== */

  const translateRisk = (risk) => {
    if (risk === "High") return text.high;

    if (risk === "Moderate") {
      return text.moderate;
    }

    return text.low;
  };

  /* =====================================================
     LIVE WEATHER DATA
  ===================================================== */

  const fetchLiveData = async () => {
    try {
      setIsRefreshing(true);
      setError("");

      const results = await Promise.all(
        states.map(async (state) => {
          const url =
            "https://api.open-meteo.com/v1/forecast?" +
            `latitude=${state.latitude}` +
            `&longitude=${state.longitude}` +
            "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code" +
            "&hourly=soil_moisture_0_to_1cm,precipitation_probability" +
            "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code" +
            "&forecast_days=7" +
            "&timezone=auto";

          const response =
            await fetch(url);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for ${state.name}`
            );
          }

          const data =
            await response.json();

          const currentRainfall =
            data.current?.precipitation ?? 0;

          const currentTemperature =
            data.current?.temperature_2m ?? 0;

          const currentHumidity =
            data.current
              ?.relative_humidity_2m ?? 0;

          const currentWindSpeed =
            data.current
              ?.wind_speed_10m ?? 0;

          const currentWeatherCode =
            data.current?.weather_code ?? 0;

          const soilMoisture =
            data.hourly
              ?.soil_moisture_0_to_1cm?.[0] ??
            0;

          const rainProbability =
            data.hourly
              ?.precipitation_probability?.[0] ??
            0;

          const risk = calculateRisk(
            currentRainfall,
            soilMoisture
          );

          const forecast =
            data.daily?.time?.map(
              (date, index) => ({
                date,

                maxTemperature:
                  data.daily
                    ?.temperature_2m_max?.[
                    index
                  ] ?? 0,

                minTemperature:
                  data.daily
                    ?.temperature_2m_min?.[
                    index
                  ] ?? 0,

                rainfall:
                  data.daily
                    ?.precipitation_sum?.[
                    index
                  ] ?? 0,

                weatherCode:
                  data.daily
                    ?.weather_code?.[
                    index
                  ] ?? 0,
              })
            ) ?? [];

          return {
            id: state.id,

            temperature:
              currentTemperature,

            rainfall:
              currentRainfall,

            humidity:
              currentHumidity,

            windSpeed:
              currentWindSpeed,

            weatherCode:
              currentWeatherCode,

            soilMoisture,

            rainProbability,

            overallRisk:
              risk.label,

            riskLevel:
              risk.level,

            forecast,
          };
        })
      );

      const formattedData = {};

      results.forEach((result) => {
        formattedData[result.id] =
          result;
      });

      setLiveData(
        formattedData
      );

      setLastUpdated(
        new Date()
      );
    } catch (fetchError) {
      console.error(fetchError);

      setError(
        "Live data could not be loaded. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveData();

    const refreshTimer =
      setInterval(
        () => {
          fetchLiveData();
        },
        15 * 60 * 1000
      );

    return () =>
      clearInterval(
        refreshTimer
      );
  }, []);

  const selectedLiveData =
    selectedState
      ? liveData[selectedState.id]
      : null;

  const forecast =
    selectedLiveData?.forecast ?? [];

  /* =====================================================
     CURRENT STATE
  ===================================================== */

  const currentState =
    useMemo(() => {
      if (!selectedState) {
        return null;
      }

      if (!selectedLiveData) {
        return {
          ...selectedState,
          temperature: "--",
          rainfall: "--",
          humidity: "--",
          windSpeed: "--",
          weatherCode: 0,
          soilMoisture: "--",
          rainProbability: "--",
          overallRisk: "Waiting",
          riskLevel: "moderate",
          forecast: [],
        };
      }

      return {
        ...selectedState,
        ...selectedLiveData,
      };
    }, [
      selectedState,
      selectedLiveData,
    ]);

  const advisories =
    useMemo(
      () =>
        generateAdvisories(
          currentState
        ),
      [currentState]
    );

  /* =====================================================
     STATE FUNCTIONS
  ===================================================== */

  const handleStateSelect =
    (state) => {
      setSelectedStateId(
        state.id
      );

      setShowFullAnalysis(
        false
      );
    };

  const handleFullAnalysis =
    (state) => {
      setSelectedStateId(
        state.id
      );

      setShowFullAnalysis(
        true
      );

      setTimeout(() => {
        document
          .getElementById(
            "analysis-section"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
          });
      }, 100);
    };

  const getRiskClass =
    (riskLevel) => {
      if (
        riskLevel === "high"
      )
        return "risk-high";

      if (
        riskLevel ===
        "moderate"
      )
        return "risk-moderate";

      if (
        riskLevel === "low"
      )
        return "risk-low";

      return "risk-moderate";
    };

  const formatLastUpdated =
    () => {
      if (!lastUpdated)
        return "Not updated yet";

      return lastUpdated.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  /* =====================================================
     INCIDENT FORM
  ===================================================== */

  const handleIncidentFormChange =
    (event) => {
      const {
        name,
        value,
        files,
      } = event.target;

      setIncidentForm(
        (previous) => ({
          ...previous,
          [name]: files
            ? files[0]
            : value,
        })
      );
    };

  const handleIncidentSubmit =
    (event) => {
      event.preventDefault();

      if (
        !incidentForm.description.trim()
      ) {
        alert(
          text.enterDescription
        );
        return;
      }

      if (
        !incidentForm.location.trim()
      ) {
        alert(
          text.enterLocation
        );
        return;
      }

      const newReport = {
        id: `INC-${Date.now()}`,

        type:
          incidentForm.type,

        description:
          incidentForm.description,

        location:
          incidentForm.location,

        severity:
          incidentForm.severity,

        photograph:
          incidentForm.photograph
            ? URL.createObjectURL(
                incidentForm.photograph
              )
            : null,

        submittedAt:
          new Date().toLocaleString(),

        status:
          "Submitted",

        actionTaken:
          "",

        state:
          selectedState?.name ||
          "Region-wide",
      };

      setIncidentReports(
        (previous) => [
          newReport,
          ...previous,
        ]
      );

      setIncidentForm({
        type: "Road crack",
        description: "",
        location: "",
        severity:
          "Moderate",
        photograph: null,
      });

      setShowIncidentForm(
        false
      );

      alert(
        text.incidentSubmitted
      );
    };

  /* =====================================================
     FIELD OFFICER FUNCTIONS
  ===================================================== */

  const updateIncidentStatus =
    (
      reportId,
      newStatus
    ) => {
      setIncidentReports(
        (previous) =>
          previous.map(
            (report) =>
              report.id ===
              reportId
                ? {
                    ...report,
                    status:
                      newStatus,
                  }
                : report
          )
      );
    };

  const updateOfficerNote =
    (
      reportId,
      note
    ) => {
      setIncidentReports(
        (previous) =>
          previous.map(
            (report) =>
              report.id ===
              reportId
                ? {
                    ...report,
                    actionTaken:
                      note,
                  }
                : report
          )
      );
    };

  return (
    <div className="app-shell">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            S
          </div>

          <div>
            <h1>
              Sahaya Land
            </h1>

            <p>
              Environmental intelligence platform
            </p>
          </div>

        </div>

        <div className="language-selector">

          <label htmlFor="language-select">
            {text.language}
          </label>

          <select
            id="language-select"
            value={language}
            onChange={(event) =>
              setLanguage(
                event.target.value
              )
            }
          >

            <option value="English">
              English
            </option>

            <option value="Hindi">
              हिंदी
            </option>

            <option value="Tamil">
              தமிழ்
            </option>

          </select>

        </div>

        <div className="topbar-status">

          <span className="status-dot"></span>

          <span>
            Live monitoring mode
          </span>

        </div>

      </header>

      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero-section">

          <div className="hero-content">

            <span className="eyebrow">
              LAND &amp; ENVIRONMENT MONITORING
            </span>

            <h2>
              Understand the land.
              <br />
              <span>
                Protect the future.
              </span>
            </h2>

            <p>
              Sahaya Land provides a live environmental
              overview of conditions and potential risks
              across the eight states of India's North
              Eastern Region.
            </p>

          </div>

          <div className="hero-visual">

            <div className="visual-grid"></div>

            <div className="visual-orbit orbit-one"></div>

            <div className="visual-orbit orbit-two"></div>

            <div className="visual-center">

              <span className="visual-center-label">
                NER
              </span>

              <strong>
                08
              </strong>

              <small>
                States monitored
              </small>

            </div>

            <div className="floating-stat stat-one">

              <span>
                Live region view
              </span>

              <strong>
                North East India
              </strong>

            </div>

            <div className="floating-stat stat-two">

              <span>
                Refresh interval
              </span>

              <strong>
                15 minutes
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            NOTICE
        ================================================= */}

        <section className="notice-bar">

          <div className="notice-icon">
            i
          </div>

          <div>

            <strong>
              {text.liveNotice}
            </strong>

            <p>
              {text.liveNoticeText}
            </p>

          </div>

        </section>

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <section className="dashboard-layout">

          <aside className="state-sidebar">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  REGION DIRECTORY
                </span>

                <h2>
                  {text.chooseState}
                </h2>

              </div>

              <span className="state-count">
                {states.length}
              </span>

            </div>

            <div className="search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder={
                  text.searchStates
                }
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="state-list">

              {filteredStates.map(
                (state) => {

                  const stateLiveData =
                    liveData[
                      state.id
                    ];

                  return (
                    <button
                      key={state.id}
                      className={`state-list-item ${
                        selectedState?.id ===
                        state.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleStateSelect(
                          state
                        )
                      }
                    >

                      <div className="state-list-main">

                        <span className="state-initial">
                          {state.name.charAt(
                            0
                          )}
                        </span>

                        <div>

                          <strong>
                            {state.name}
                          </strong>

                          <small>
                            {stateLiveData?.temperature ??
                              "--"}
                            °C
                          </small>

                        </div>

                      </div>

                      <span
                        className={`mini-risk-dot ${getRiskClass(
                          stateLiveData?.riskLevel
                        )}`}
                      ></span>

                    </button>
                  );
                }
              )}

              {filteredStates.length ===
                0 && (
                <div className="empty-state">
                  {text.noStates}
                </div>
              )}

            </div>

          </aside>

          <section className="main-dashboard">

            {!selectedState ? (

              <div className="welcome-card">

                <div className="welcome-icon">
                  🌏
                </div>

                <span className="eyebrow">
                  SAHAYA LAND
                </span>

                <h2>
                  {text.chooseStateBegin}
                </h2>

                <p>
                  {text.selectStateDescription}
                </p>

                <div className="welcome-hint">

                  <span>
                    ←
                  </span>

                  <span>
                    {text.selectAnyState}
                  </span>

                </div>

              </div>

            ) : (

              <>

                {/* =================================================
                    CITIZEN INCIDENT REPORTING
                ================================================= */}

                <div className="incident-action-bar">

                  <div>

                    <span className="eyebrow">
                      {text.communitySafety}
                    </span>

                    <h3>
                      {text.seeUnusual}
                    </h3>

                    <p>
                      {text.reportDescription}
                    </p>

                  </div>

                  <button
                    className="report-incident-button"
                    onClick={() =>
                      setShowIncidentForm(
                        true
                      )
                    }
                  >
                    + {text.reportIncident}
                  </button>

                  <button
                    className="officer-dashboard-button"
                    onClick={() =>
                      setShowOfficerDashboard(
                        (previous) =>
                          !previous
                      )
                    }
                  >
                    {showOfficerDashboard
                      ? text.hideOfficerDashboard
                      : text.fieldOfficerDashboard}
                  </button>

                </div>

                {/* =================================================
                    CITIZEN REPORT LIST
                ================================================= */}

                {incidentReports.length >
                  0 && (

                  <section className="incident-reports-section">

                    <div className="section-heading">

                      <div>

                        <span className="eyebrow">
                          {text.communityReports}
                        </span>

                        <h2>
                          {text.recentReports}
                        </h2>

                      </div>

                      <span className="state-count">
                        {
                          incidentReports.length
                        }
                      </span>

                    </div>

                    <div className="incident-reports-list">

                      {incidentReports.map(
                        (report) => (

                          <div
                            className="incident-report-card"
                            key={report.id}
                          >

                            <div className="incident-report-main">

                              <div className="incident-report-icon">
                                !
                              </div>

                              <div>

                                <div className="incident-report-title">

                                  <strong>
                                    {report.type}
                                  </strong>

                                  <span className="incident-status">
                                    {report.status}
                                  </span>

                                </div>

                                <p>
                                  {
                                    report.description
                                  }
                                </p>

                                <div className="incident-report-meta">

                                  <span>
                                    📍{" "}
                                    {
                                      report.location
                                    }
                                  </span>

                                  <span>
                                    •
                                  </span>

                                  <span>
                                    {
                                      report.severity
                                    }{" "}
                                    severity
                                  </span>

                                  <span>
                                    •
                                  </span>

                                  <span>
                                    {
                                      report.submittedAt
                                    }
                                  </span>

                                </div>

                                {report.actionTaken && (

                                  <div className="incident-action-taken">

                                    <strong>
                                      {text.actionTaken}:
                                    </strong>{" "}

                                    {
                                      report.actionTaken
                                    }

                                  </div>

                                )}

                              </div>

                            </div>

                            {report.photograph && (

                              <img
                                className="incident-report-image"
                                src={
                                  report.photograph
                                }
                                alt="Uploaded incident"
                              />

                            )}

                          </div>

                        )
                      )}

                    </div>

                  </section>

                )}

                {/* =================================================
                    FIELD OFFICER DASHBOARD
                ================================================= */}

                {showOfficerDashboard && (

                  <section className="officer-dashboard-section">

                    <div className="section-heading">

                      <div>

                        <span className="eyebrow">
                          {text.fieldOperations}
                        </span>

                        <h2>
                          {text.officerDashboard}
                        </h2>

                        <p>
                          {text.officerDescription}
                        </p>

                      </div>

                      <span className="state-count">
                        {
                          incidentReports.length
                        }
                      </span>

                    </div>

                    {incidentReports.length ===
                    0 ? (

                      <div className="officer-empty-state">
                        {text.noReports}
                      </div>

                    ) : (

                      <div className="officer-report-list">

                        {incidentReports.map(
                          (report) => (

                            <div
                              className="officer-report-card"
                              key={report.id}
                            >

                              <div className="officer-report-header">

                                <div>

                                  <span className="eyebrow">
                                    {report.id}
                                  </span>

                                  <h3>
                                    {report.type}
                                  </h3>

                                  <p>
                                    <strong>
                                      {text.location}:
                                    </strong>{" "}
                                    {
                                      report.location
                                    }
                                  </p>

                                  <p>
                                    <strong>
                                      {text.state}:
                                    </strong>{" "}
                                    {
                                      report.state
                                    }
                                  </p>

                                  <p>
                                    <strong>
                                      {text.submitted}:
                                    </strong>{" "}
                                    {
                                      report.submittedAt
                                    }
                                  </p>

                                </div>

                                <span className="incident-status">
                                  {report.status}
                                </span>

                              </div>

                              <div className="officer-report-details">

                                <p>
                                  <strong>
                                    {text.description}:
                                  </strong>{" "}
                                  {
                                    report.description
                                  }
                                </p>

                                <p>
                                  <strong>
                                    {text.severity}:
                                  </strong>{" "}
                                  {
                                    report.severity
                                  }
                                </p>

                                {report.photograph && (

                                  <img
                                    className="officer-report-image"
                                    src={
                                      report.photograph
                                    }
                                    alt="Incident submitted by citizen"
                                  />

                                )}

                              </div>

                              <div className="officer-report-actions">

                                <label>

                                  {text.verificationStatus}

                                  <select
                                    value={
                                      report.status
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateIncidentStatus(
                                        report.id,
                                        event.target.value
                                      )
                                    }
                                  >

                                    {incidentStatuses.map(
                                      (status) => (

                                        <option
                                          key={
                                            status
                                          }
                                          value={
                                            status
                                          }
                                        >
                                          {status}
                                        </option>

                                      )
                                    )}

                                  </select>

                                </label>

                                <label>

                                  {text.actionTaken}

                                  <textarea
                                    rows="3"
                                    placeholder={
                                      text.siteInspection
                                    }
                                    value={
                                      report.actionTaken ||
                                      ""
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateOfficerNote(
                                        report.id,
                                        event.target.value
                                      )
                                    }
                                  />

                                </label>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </section>

                )}

                {/* =================================================
                    SELECTED STATE
                ================================================= */}

                <div className="selected-state-card">

                  <div className="selected-state-content">

                    <span className="eyebrow">
                      {text.selectedRegion}
                    </span>

                    <h2>
                      {currentState.name}
                    </h2>

                    <div className="state-meta">

                      <span>
                        {currentState.capital}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {currentState.region}
                      </span>

                    </div>

                    <p>
                      {
                        currentState.description
                      }
                    </p>

                    <button
                      className="full-analysis-button"
                      onClick={() =>
                        handleFullAnalysis(
                          currentState
                        )
                      }
                    >
                      {text.viewFullAnalysis}

                      <span>
                        →
                      </span>

                    </button>

                  </div>

                  <div className="selected-state-badge">

                    <span>
                      {text.estimatedRisk}
                    </span>

                    <strong
                      className={getRiskClass(
                        currentState.riskLevel
                      )}
                    >
                      {currentState.overallRisk ===
                      "Waiting"
                        ? currentState.overallRisk
                        : translateRisk(
                            currentState.overallRisk
                          )}
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    LIVE TOOLBAR
                ================================================= */}

                <div className="live-toolbar">

                  <div>

                    <span className="live-indicator"></span>

                    <strong>
                      {text.liveEnvironmentalData}
                    </strong>

                  </div>

                  <span>
                    {text.lastUpdated}:{" "}
                    {formatLastUpdated()}
                  </span>

                  <button
                    className="refresh-button"
                    onClick={
                      fetchLiveData
                    }
                    disabled={
                      isRefreshing
                    }
                  >
                    {isRefreshing
                      ? text.refreshing
                      : text.refreshData}
                  </button>

                </div>

                {error && (

                  <div className="error-message">
                    {error}
                  </div>

                )}

                {/* =================================================
                    METRICS
                ================================================= */}

                <div className="metric-grid">

                  <div className="metric-card">

                    <div className="metric-card-top">

                      <span className="metric-label">
                        {text.temperature}
                      </span>

                      <span className="metric-icon">
                        °
                      </span>

                    </div>

                    <div className="metric-value-row">

                      <strong>
                        {isLoading
                          ? "--"
                          : currentState.temperature}
                      </strong>

                      <span>
                        °C
                      </span>

                    </div>

                    <p>
                      {text.currentTemperature}
                    </p>

                  </div>

                  <div className="metric-card">

                    <div className="metric-card-top">

                      <span className="metric-label">
                        {text.soilMoisture}
                      </span>

                      <span className="metric-icon">
                        ◌
                      </span>

                    </div>

                    <div className="metric-value-row">

                      <strong>
                        {isLoading
                          ? "--"
                          : Math.round(
                              Number(
                                currentState.soilMoisture
                              ) *
                                100
                            )}
                      </strong>

                      <span>
                        %
                      </span>

                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill moisture-fill"
                        style={{
                          width:
                            isLoading
                              ? "0%"
                              : `${Math.min(
                                  Number(
                                    currentState.soilMoisture
                                  ) *
                                    100,
                                  100
                                )}%`,
                        }}
                      ></div>

                    </div>

                    <p>
                      {text.soilEstimate}
                    </p>

                  </div>

                  <div className="metric-card">

                    <div className="metric-card-top">

                      <span className="metric-label">
                        {text.rainfall}
                      </span>

                      <span className="metric-icon">
                        ⌁
                      </span>

                    </div>

                    <div className="metric-value-row">

                      <strong>
                        {isLoading
                          ? "--"
                          : currentState.rainfall}
                      </strong>

                      <span>
                        mm
                      </span>

                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill rain-fill"
                        style={{
                          width:
                            isLoading
                              ? "0%"
                              : `${Math.min(
                                  Number(
                                    currentState.rainfall
                                  ) *
                                    4,
                                  100
                                )}%`,
                        }}
                      ></div>

                    </div>

                    <div className="rain-probability">

                      <span>
                        {text.rainProbability}
                      </span>

                      <strong>
                        {isLoading
                          ? "--"
                          : `${currentState.rainProbability}%`}
                      </strong>

                    </div>

                    <p>
                      {text.currentRainfall}
                    </p>

                  </div>

                  <div className="metric-card">

                    <div className="metric-card-top">

                      <span className="metric-label">
                        {text.overallRisk}
                      </span>

                      <span className="metric-icon">
                        ◈
                      </span>

                    </div>

                    <div className="metric-value-row risk-value-row">

                      <strong
                        className={getRiskClass(
                          currentState.riskLevel
                        )}
                      >
                        {currentState.overallRisk ===
                        "Waiting"
                          ? currentState.overallRisk
                          : translateRisk(
                              currentState.overallRisk
                            )}
                      </strong>

                    </div>

                    <div className="risk-status-line">

                      <span
                        className={`risk-indicator ${getRiskClass(
                          currentState.riskLevel
                        )}`}
                      ></span>

                      <span>
                        {text.estimatedIndicators}
                      </span>

                    </div>

                    <p>
                      {text.notOfficial}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    CURRENT WEATHER
                ================================================= */}

                <div className="current-weather-card">

                  <div className="current-weather-icon">

                    {getWeatherIcon(
                      currentState.weatherCode
                    )}

                  </div>

                  <div>

                    <span className="eyebrow">
                      {text.currentWeather}
                    </span>

                    <h3>
                      {isLoading
                        ? "Loading..."
                        : getWeatherDescription(
                            currentState.weatherCode
                          )}
                    </h3>

                    <p>
                      {isLoading
                        ? "--"
                        : `${currentState.temperature}°C in ${currentState.name}`}
                    </p>

                    <div className="current-weather-details">

                      <span>
                        {text.humidity}:{" "}
                        <strong>
                          {isLoading
                            ? "--"
                            : `${currentState.humidity}%`}
                        </strong>
                      </span>

                      <span>
                        {text.rainProbability}:{" "}
                        <strong>
                          {isLoading
                            ? "--"
                            : `${currentState.rainProbability}%`}
                        </strong>
                      </span>

                      <span>
                        {text.windSpeed}:{" "}
                        <strong>
                          {isLoading
                            ? "--"
                            : `${currentState.windSpeed} km/h`}
                        </strong>
                      </span>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    7-DAY FORECAST
                ================================================= */}

                <section className="forecast-section">

                  <div className="section-heading">

                    <div>

                      <span className="eyebrow">
                        {text.weatherOutlook}
                      </span>

                      <h2>
                        {text.sevenDayForecast}
                      </h2>

                    </div>

                    <span className="forecast-location">
                      {currentState.name}
                    </span>

                  </div>

                  <div className="forecast-grid">

                    {isLoading ? (

                      <div className="forecast-loading">
                        {text.forecastLoading}
                      </div>

                    ) : currentState.forecast
                        ?.length === 0 ? (

                      <div className="forecast-loading">
                        {text.forecastUnavailable}
                      </div>

                    ) : (

                      currentState.forecast.map(
                        (day, index) => {

                          const forecastDate =
                            new Date(
                              `${day.date}T00:00:00`
                            );

                          const formattedDate =
                            index === 0
                              ? text.today
                              : forecastDate.toLocaleDateString(
                                  language ===
                                    "Tamil"
                                    ? "ta-IN"
                                    : language ===
                                      "Hindi"
                                    ? "hi-IN"
                                    : "en-IN",
                                  {
                                    weekday:
                                      "short",
                                  }
                                );

                          return (
                            <div
                              className="forecast-card"
                              key={
                                day.date
                              }
                            >

                              <span className="forecast-day">
                                {
                                  formattedDate
                                }
                              </span>

                              <div className="forecast-icon">
                                {getWeatherIcon(
                                  day.weatherCode
                                )}
                              </div>

                              <strong className="forecast-temperature">
                                {Math.round(
                                  day.maxTemperature
                                )}
                                °
                              </strong>

                              <span className="forecast-min-temperature">
                                {Math.round(
                                  day.minTemperature
                                )}
                                °
                              </span>

                              <p className="forecast-description">
                                {getWeatherDescription(
                                  day.weatherCode
                                )}
                              </p>

                              <div className="forecast-rainfall">

                                <span>
                                  {text.rain}
                                </span>

                                <strong>
                                  {Number(
                                    day.rainfall
                                  ).toFixed(
                                    1
                                  )}{" "}
                                  mm
                                </strong>

                              </div>

                            </div>
                          );
                        }
                      )

                    )}

                  </div>

                </section>

                {/* =================================================
                    WEATHER CHARTS
                ================================================= */}

                <section className="charts-section">

                  <div className="section-heading">

                    <div>

                      <span className="eyebrow">
                        {text.visualInsights}
                      </span>

                      <h2>
                        {text.weatherTrends}
                      </h2>

                    </div>

                  </div>

                  <div className="charts-grid">

                    <div className="chart-card">

                      <div className="chart-card-header">

                        <div>

                          <h3>
                            {text.temperatureTrend}
                          </h3>

                          <p>
                            {text.temperatureDescription}
                          </p>

                        </div>

                        <span className="chart-unit">
                          °C
                        </span>

                      </div>

                      <div className="chart-wrapper">

                        <ResponsiveContainer
                          width="100%"
                          height={300}
                        >

                          <LineChart
                            data={
                              forecast
                            }
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                            />

                            <XAxis
                              dataKey="date"
                              tickFormatter={(
                                date
                              ) =>
                                new Date(
                                  date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    weekday:
                                      "short",
                                  }
                                )
                              }
                            />

                            <YAxis />

                            <Tooltip
                              formatter={(
                                value,
                                name
                              ) => [
                                `${value}°C`,
                                name,
                              ]}
                            />

                            <Line
                              type="monotone"
                              dataKey="maxTemperature"
                              name="Maximum"
                              stroke="#ef4444"
                              strokeWidth={3}
                              dot={{
                                r: 4,
                              }}
                            />

                            <Line
                              type="monotone"
                              dataKey="minTemperature"
                              name="Minimum"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              dot={{
                                r: 4,
                              }}
                            />

                          </LineChart>

                        </ResponsiveContainer>

                      </div>

                    </div>

                    <div className="chart-card">

                      <div className="chart-card-header">

                        <div>

                          <h3>
                            {text.rainfallForecast}
                          </h3>

                          <p>
                            {text.rainfallDescription}
                          </p>

                        </div>

                        <span className="chart-unit">
                          mm
                        </span>

                      </div>

                      <div className="chart-wrapper">

                        <ResponsiveContainer
                          width="100%"
                          height={300}
                        >

                          <BarChart
                            data={
                              forecast
                            }
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                            />

                            <XAxis
                              dataKey="date"
                              tickFormatter={(
                                date
                              ) =>
                                new Date(
                                  date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    weekday:
                                      "short",
                                  }
                                )
                              }
                            />

                            <YAxis />

                            <Tooltip
                              formatter={(
                                value
                              ) => [
                                `${value} mm`,
                                text.rain,
                              ]}
                            />

                            <Bar
                              dataKey="rainfall"
                              name={
                                text.rain
                              }
                              fill="#0ea5e9"
                              radius={[
                                8,
                                8,
                                0,
                                0,
                              ]}
                            />

                          </BarChart>

                        </ResponsiveContainer>

                      </div>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    ALERTS
                ================================================= */}

                <section className="alerts-section">

                  <div className="section-heading alerts-heading">

                    <div>

                      <span className="eyebrow">
                        {text.advisories}
                      </span>

                      <h2>
                        {text.emergencyAlerts}
                      </h2>

                    </div>

                    <button
                      className="alerts-toggle-button"
                      onClick={() =>
                        setShowAlerts(
                          (previous) =>
                            !previous
                        )
                      }
                    >
                      {showAlerts
                        ? text.hideAlerts
                        : text.showAlerts}
                    </button>

                  </div>

                  <div className="alerts-notice">

                    <span className="alerts-notice-icon">
                      i
                    </span>

                    <p>
                      {text.advisoryNotice}
                    </p>

                  </div>

                  {showAlerts && (

                    <div className="alerts-list">

                      {advisories.length ===
                      0 ? (

                        <div className="alert-empty">
                          {text.alertsUnavailable}
                        </div>

                      ) : (

                        advisories.map(
                          (
                            advisory,
                            index
                          ) => (

                            <div
                              className={`alert-card alert-${advisory.level}`}
                              key={`${advisory.title}-${index}`}
                            >

                              <div className="alert-card-icon">

                                {advisory.level ===
                                "low"
                                  ? "✓"
                                  : "!"}

                              </div>

                              <div className="alert-card-content">

                                <div className="alert-card-top">

                                  <strong>
                                    {advisory.title}
                                  </strong>

                                  <span className="alert-level">

                                    {advisory.level ===
                                    "high"
                                      ? text.high
                                      : advisory.level ===
                                        "moderate"
                                      ? text.moderate
                                      : text.low}

                                  </span>

                                </div>

                                <p>
                                  {
                                    advisory.message
                                  }
                                </p>

                                <small>

                                  <strong>
                                    {
                                      text.suggestedAction
                                    }:
                                  </strong>{" "}

                                  {
                                    advisory.action
                                  }

                                </small>

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                  )}

                </section>

                {/* =================================================
                    MAP
                ================================================= */}

                <section
                  className="map-section"
                  id="map-section"
                >

                  <div className="section-heading map-heading">

                    <div>

                      <span className="eyebrow">
                        {text.interactiveMap}
                      </span>

                      <h2>
                        {
                          text.northEasternRegion
                        }
                      </h2>

                    </div>

                    <div className="map-legend">

                      <span>
                        <i className="legend-dot low"></i>
                        {text.low}
                      </span>

                      <span>
                        <i className="legend-dot moderate"></i>
                        {text.moderate}
                      </span>

                      <span>
                        <i className="legend-dot high"></i>
                        {text.high}
                      </span>

                    </div>

                  </div>

                  <div className="map-wrapper">

                    <MapContainer
                      center={
                        selectedState.coordinates
                      }
                      zoom={6}
                      scrollWheelZoom={
                        true
                      }
                      className="leaflet-map"
                    >

                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <MapController
                        selectedState={
                          selectedState
                        }
                      />

                      {states.map(
                        (state) => {

                          const stateLiveData =
                            liveData[
                              state.id
                            ];

                          return (
                            <Marker
                              key={
                                state.id
                              }
                              position={
                                state.coordinates
                              }
                              eventHandlers={{
                                click: () =>
                                  handleStateSelect(
                                    state
                                  ),
                              }}
                            >

                              <Popup>

                                <div className="map-popup">

                                  <strong>
                                    {
                                      state.name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      state.capital
                                    }
                                  </span>

                                  <small>
                                    Temperature:{" "}
                                    {
                                      stateLiveData?.temperature ??
                                      "--"
                                    }
                                    °C
                                  </small>

                                  <small>
                                    Weather:{" "}
                                    {stateLiveData
                                      ? getWeatherDescription(
                                          stateLiveData.weatherCode
                                        )
                                      : "--"}
                                  </small>

                                  <small>
                                    Rainfall:{" "}
                                    {
                                      stateLiveData?.rainfall ??
                                      "--"
                                    }{" "}
                                    mm
                                  </small>

                                  <small>
                                    Rain probability:{" "}
                                    {stateLiveData?.rainProbability ??
                                      "--"}
                                    %
                                  </small>

                                  <small>
                                    Estimated risk:{" "}
                                    {translateRisk(
                                      stateLiveData?.overallRisk
                                    )}
                                  </small>

                                </div>

                              </Popup>

                            </Marker>
                          );
                        }
                      )}

                    </MapContainer>

                  </div>

                </section>

                {/* =================================================
                    FULL ANALYSIS
                ================================================= */}

                {showFullAnalysis && (

                  <section
                    className="analysis-section"
                    id="analysis-section"
                  >

                    <div className="section-heading">

                      <div>

                        <span className="eyebrow">
                          {text.regionalAnalysis}
                        </span>

                        <h2>
                          {
                            currentState.name
                          }{" "}
                          {text.insights}
                        </h2>

                      </div>

                      <span
                        className={`analysis-risk-badge ${getRiskClass(
                          currentState.riskLevel
                        )}`}
                      >
                        {currentState.overallRisk ===
                        "Waiting"
                          ? currentState.overallRisk
                          : translateRisk(
                              currentState.overallRisk
                            )}{" "}
                        {text.estimatedRisk.toLowerCase()}
                      </span>

                    </div>

                    <div className="analysis-grid">

                      <div className="analysis-summary">

                        <h3>
                          {text.liveOverview}
                        </h3>

                        <p>
                          {
                            currentState.description
                          }
                        </p>

                        <div className="analysis-details">

                          <div>

                            <span>
                              {
                                text.temperature
                              }
                            </span>

                            <strong>
                              {
                                currentState.temperature
                              }
                              °C
                            </strong>

                          </div>

                          <div>

                            <span>
                              {
                                text.rainfall
                              }
                            </span>

                            <strong>
                              {
                                currentState.rainfall
                              }{" "}
                              mm
                            </strong>

                          </div>

                          <div>

                            <span>
                              {
                                text.humidity
                              }
                            </span>

                            <strong>
                              {
                                currentState.humidity
                              }
                              %
                            </strong>

                          </div>

                          <div>

                            <span>
                              {
                                text.windSpeed
                              }
                            </span>

                            <strong>
                              {
                                currentState.windSpeed
                              }{" "}
                              km/h
                            </strong>

                          </div>

                        </div>

                      </div>

                      <div className="analysis-highlights">

                        <h3>
                          {
                            text.monitoringPriorities
                          }
                        </h3>

                        <div className="highlight-list">

                          {currentState.highlights.map(
                            (
                              highlight
                            ) => (

                              <div
                                className="highlight-item"
                                key={
                                  highlight
                                }
                              >

                                <span>
                                  ✓
                                </span>

                                <p>
                                  {
                                    highlight
                                  }
                                </p>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    </div>

                  </section>

                )}

              </>

            )}

          </section>

        </section>

      </main>

      {/* =================================================
          INCIDENT REPORT MODAL
      ================================================= */}

      {showIncidentForm && (

        <div className="incident-modal-overlay">

          <div className="incident-modal">

            <div className="incident-modal-header">

              <div>

                <span className="eyebrow">
                  {
                    text.citizenReporting
                  }
                </span>

                <h2>
                  {
                    text.reportIncident
                  }
                </h2>

                <p>
                  {
                    text.incidentModalDescription
                  }
                </p>

              </div>

              <button
                className="modal-close-button"
                onClick={() =>
                  setShowIncidentForm(
                    false
                  )
                }
                type="button"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleIncidentSubmit
              }
            >

              <div className="incident-form-grid">

                <label>

                  {
                    text.incidentType
                  }

                  <select
                    name="type"
                    value={
                      incidentForm.type
                    }
                    onChange={
                      handleIncidentFormChange
                    }
                  >

                    {incidentTypes.map(
                      (type) => (

                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>

                      )
                    )}

                  </select>

                </label>

                <label>

                  {text.severity}

                  <select
                    name="severity"
                    value={
                      incidentForm.severity
                    }
                    onChange={
                      handleIncidentFormChange
                    }
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Moderate">
                      Moderate
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </label>

                <label className="incident-full-width">

                  {text.location}

                  <input
                    type="text"
                    name="location"
                    placeholder="Example: NH-10 near Gangtok"
                    value={
                      incidentForm.location
                    }
                    onChange={
                      handleIncidentFormChange
                    }
                    required
                  />

                </label>

                <label className="incident-full-width">

                  {text.description}

                  <textarea
                    name="description"
                    placeholder="Describe what you observed..."
                    rows="5"
                    value={
                      incidentForm.description
                    }
                    onChange={
                      handleIncidentFormChange
                    }
                    required
                  />

                </label>

                <label className="incident-full-width">

                  {text.photograph}

                  <input
                    type="file"
                    name="photograph"
                    accept="image/*"
                    onChange={
                      handleIncidentFormChange
                    }
                  />

                  <small>
                    {
                      text.photographHelp
                    }
                  </small>

                </label>

              </div>

              <div className="incident-form-footer">

                <button
                  type="button"
                  className="cancel-incident-button"
                  onClick={() =>
                    setShowIncidentForm(
                      false
                    )
                  }
                >
                  {text.cancel}
                </button>

                <button
                  type="submit"
                  className="submit-incident-button"
                >
                  {
                    text.submitReport
                  }
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <p>
          Sahaya Land © 2026. Live weather prototype for
          environmental awareness and monitoring.
        </p>

        <span>
          Built for a better tomorrow.
        </span>

      </footer>

    </div>
  );
}

export default App;