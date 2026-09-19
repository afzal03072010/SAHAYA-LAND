import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
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
   INDIA - 36 STATES + UNION TERRITORIES
========================================================= */

const states = [
  [
    "andhra-pradesh",
    "Andhra Pradesh",
    "Amaravati",
    "South",
    15.9129,
    79.7400,
    "162,968 km²",
    "53.9 million",
  ],

  [
    "arunachal-pradesh",
    "Arunachal Pradesh",
    "Itanagar",
    "North-East",
    27.0844,
    93.6053,
    "83,743 km²",
    "1.4 million",
  ],

  [
    "assam",
    "Assam",
    "Dispur",
    "North-East",
    26.2006,
    92.9376,
    "78,438 km²",
    "31.2 million",
  ],

  [
    "bihar",
    "Bihar",
    "Patna",
    "East",
    25.0961,
    85.3131,
    "94,163 km²",
    "104 million",
  ],

  [
    "chhattisgarh",
    "Chhattisgarh",
    "Raipur",
    "Central",
    21.2787,
    81.8661,
    "135,192 km²",
    "25.5 million",
  ],

  [
    "goa",
    "Goa",
    "Panaji",
    "West",
    15.2993,
    74.1240,
    "3,702 km²",
    "1.5 million",
  ],

  [
    "gujarat",
    "Gujarat",
    "Gandhinagar",
    "West",
    22.2587,
    71.1924,
    "196,024 km²",
    "60.4 million",
  ],

  [
    "haryana",
    "Haryana",
    "Chandigarh",
    "North",
    29.0588,
    76.0856,
    "44,212 km²",
    "25.4 million",
  ],

  [
    "himachal-pradesh",
    "Himachal Pradesh",
    "Shimla",
    "North",
    31.1048,
    77.1734,
    "55,673 km²",
    "6.9 million",
  ],

  [
    "jharkhand",
    "Jharkhand",
    "Ranchi",
    "East",
    23.6102,
    85.2799,
    "79,716 km²",
    "33 million",
  ],

  [
    "karnataka",
    "Karnataka",
    "Bengaluru",
    "South",
    15.3173,
    75.7139,
    "191,791 km²",
    "61.1 million",
  ],

  [
    "kerala",
    "Kerala",
    "Thiruvananthapuram",
    "South",
    10.8505,
    76.2711,
    "38,863 km²",
    "33.4 million",
  ],

  [
    "madhya-pradesh",
    "Madhya Pradesh",
    "Bhopal",
    "Central",
    22.9734,
    78.6569,
    "308,252 km²",
    "72.6 million",
  ],

  [
    "maharashtra",
    "Maharashtra",
    "Mumbai",
    "West",
    19.7515,
    75.7139,
    "307,713 km²",
    "112.4 million",
  ],

  [
    "manipur",
    "Manipur",
    "Imphal",
    "North-East",
    24.6637,
    93.9063,
    "22,327 km²",
    "2.9 million",
  ],

  [
    "meghalaya",
    "Meghalaya",
    "Shillong",
    "North-East",
    25.4670,
    91.3662,
    "22,429 km²",
    "3 million",
  ],

  [
    "mizoram",
    "Mizoram",
    "Aizawl",
    "North-East",
    23.1645,
    92.9376,
    "21,081 km²",
    "1.1 million",
  ],

  [
    "nagaland",
    "Nagaland",
    "Kohima",
    "North-East",
    26.1584,
    94.5624,
    "16,579 km²",
    "1.9 million",
  ],

  [
    "odisha",
    "Odisha",
    "Bhubaneswar",
    "East",
    20.9517,
    85.0985,
    "155,707 km²",
    "41.9 million",
  ],

  [
    "punjab",
    "Punjab",
    "Chandigarh",
    "North",
    31.1471,
    75.3412,
    "50,362 km²",
    "27.7 million",
  ],

  [
    "rajasthan",
    "Rajasthan",
    "Jaipur",
    "North",
    27.0238,
    74.2179,
    "342,239 km²",
    "68.6 million",
  ],

  [
    "sikkim",
    "Sikkim",
    "Gangtok",
    "North-East",
    27.5330,
    88.5122,
    "7,096 km²",
    "610,000",
  ],

  [
    "tamil-nadu",
    "Tamil Nadu",
    "Chennai",
    "South",
    11.1271,
    78.6569,
    "130,058 km²",
    "72.1 million",
  ],

  [
    "telangana",
    "Telangana",
    "Hyderabad",
    "South",
    18.1124,
    79.0193,
    "114,840 km²",
    "35.2 million",
  ],

  [
    "tripura",
    "Tripura",
    "Agartala",
    "North-East",
    23.9408,
    91.9882,
    "10,486 km²",
    "3.7 million",
  ],

  [
    "uttar-pradesh",
    "Uttar Pradesh",
    "Lucknow",
    "North",
    26.8467,
    80.9462,
    "243,286 km²",
    "199.8 million",
  ],

  [
    "uttarakhand",
    "Uttarakhand",
    "Dehradun",
    "North",
    30.0668,
    79.0193,
    "53,483 km²",
    "10.1 million",
  ],

  [
    "west-bengal",
    "West Bengal",
    "Kolkata",
    "East",
    22.9868,
    87.8550,
    "88,752 km²",
    "91.3 million",
  ],

  [
    "andaman-nicobar",
    "Andaman and Nicobar Islands",
    "Port Blair",
    "Union Territory",
    11.7401,
    92.6586,
    "8,249 km²",
    "380,000",
  ],

  [
    "chandigarh",
    "Chandigarh",
    "Chandigarh",
    "Union Territory",
    30.7333,
    76.7794,
    "114 km²",
    "1.1 million",
  ],

  [
    "dadra-nagar-haveli-daman-diu",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Daman",
    "Union Territory",
    20.3974,
    72.8328,
    "602 km²",
    "590,000",
  ],

  [
    "delhi",
    "Delhi",
    "New Delhi",
    "Union Territory",
    28.6139,
    77.2090,
    "1,483 km²",
    "16.8 million",
  ],

  [
    "jammu-kashmir",
    "Jammu and Kashmir",
    "Srinagar",
    "Union Territory",
    34.0837,
    74.7973,
    "42,241 km²",
    "12.3 million",
  ],

  [
    "ladakh",
    "Ladakh",
    "Leh",
    "Union Territory",
    34.1526,
    77.5771,
    "59,146 km²",
    "274,000",
  ],

  [
    "lakshadweep",
    "Lakshadweep",
    "Kavaratti",
    "Union Territory",
    10.5667,
    72.6417,
    "32 km²",
    "64,000",
  ],

  [
    "puducherry",
    "Puducherry",
    "Puducherry",
    "Union Territory",
    11.9416,
    79.8083,
    "490 km²",
    "1.2 million",
  ],
].map(
  ([
    id,
    name,
    capital,
    region,
    latitude,
    longitude,
    area,
    population,
  ]) => ({
    id,
    name,
    capital,
    region,
    coordinates: [latitude, longitude],
    latitude,
    longitude,
    area,
    population,

    description:
      `${name} is included in the nationwide environmental monitoring network of Sahaya Land.`,

    highlights: [
      "Environmental monitoring",
      "Risk assessment",
      "Incident reporting",
    ],
  })
);

/* =========================================================
   INDIA → REGION DIRECTORY
========================================================= */

const regionGroups = {
  /* IMPORTANT:
     This always contains ALL 36 states/UTs.
     Therefore the default directory shows all India.
  */

  "All India": states.map((state) => state.id),

  North: [
    "punjab",
    "haryana",
    "himachal-pradesh",
    "uttarakhand",
    "uttar-pradesh",
    "rajasthan",
    "jammu-kashmir",
    "ladakh",
    "chandigarh",
    "delhi",
  ],

  South: [
    "andhra-pradesh",
    "karnataka",
    "kerala",
    "tamil-nadu",
    "telangana",
    "puducherry",
  ],

  East: [
    "bihar",
    "jharkhand",
    "odisha",
    "west-bengal",
  ],

  West: [
    "goa",
    "gujarat",
    "maharashtra",
    "dadra-nagar-haveli-daman-diu",
  ],

  Central: [
    "chhattisgarh",
    "madhya-pradesh",
  ],

  "North-Eastern Region": [
    "arunachal-pradesh",
    "assam",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "sikkim",
    "tripura",
  ],

  "Island Territories": [
    "andaman-nicobar",
    "lakshadweep",
  ],
};

const regionOptions = Object.keys(regionGroups);

const getRegionForState = (stateId) => {
  return (
    regionOptions.find((region) =>
      regionGroups[region].includes(stateId)
    ) || "All India"
  );
};

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

    chooseStateBegin:
      "Choose a state to begin",

    selectStateDescription:
      "Select a state from the region directory to view its live environmental conditions, weather forecast, risk level, and monitoring recommendations.",

    selectAnyState:
      "Select any state from the list",

    liveNotice: "Live data notice",

    liveNoticeText:
      "Weather and soil-moisture values are fetched from a live weather-data service. Overall risk is an estimated indicator, not an official disaster warning.",

    communitySafety:
      "COMMUNITY SAFETY",

    seeUnusual:
      "See something unusual?",

    reportDescription:
      "Report road damage, rockfall, soil movement, or other environmental incidents.",

    reportIncident:
      "Report an incident",

    fieldOfficerDashboard:
      "Field officer dashboard",

    hideOfficerDashboard:
      "Hide officer dashboard",

    communityReports:
      "COMMUNITY REPORTS",

    recentReports:
      "Recent incident reports",

    selectedRegion:
      "SELECTED REGION",

    estimatedRisk:
      "Estimated risk",

    currentConditions:
      "Current environmental conditions",

    temperature:
      "Temperature",

    rainfall:
      "Rainfall",

    humidity:
      "Humidity",

    soilMoisture:
      "Soil moisture",

    riskScore:
      "Risk score",

    overallRisk:
      "Overall risk",

    currentTemperature:
      "Current air temperature",

    soilEstimate:
      "Live surface soil-moisture estimate",

    currentRainfall:
      "Current precipitation level",

    estimatedIndicators:
      "Estimated from live environmental indicators",

    notOfficial:
      "Not an official disaster warning",

    currentWeather:
      "CURRENT WEATHER",

    rainProbability:
      "Rain probability",

    weatherOutlook:
      "WEATHER OUTLOOK",

    sevenDayForecast:
      "7-day forecast",

    today:
      "Today",

    rain:
      "Rain",

    forecastLoading:
      "Loading forecast...",

    forecastUnavailable:
      "Forecast data is unavailable.",

    visualInsights:
      "VISUAL INSIGHTS",

    weatherTrends:
      "Weather trends",

    temperatureTrend:
      "Temperature trend",

    temperatureDescription:
      "Maximum and minimum temperature over the next 7 days",

    rainfallForecast:
      "Rainfall forecast",

    rainfallDescription:
      "Expected rainfall for the next 7 days",

    advisories:
      "ENVIRONMENTAL ADVISORIES",

    emergencyAlerts:
      "Emergency alerts",

    hideAlerts:
      "Hide alerts",

    showAlerts:
      "Show alerts",

    advisoryNotice:
      "These are automatically generated environmental advisories based on available weather indicators. They are not official government warnings.",

    alertsUnavailable:
      "Alerts will appear when live data becomes available.",

    suggestedAction:
      "Suggested action",

    interactiveMap:
      "INTERACTIVE MAP",

    northEasternRegion:
      "India environmental monitoring map",

    low: "Low",

    moderate: "Moderate",

    high: "High",

    safe: "Safe",

    regionalAnalysis:
      "REGIONAL ANALYSIS",

    insights:
      "insights",

    liveOverview:
      "Live environmental overview",

    monitoringPriorities:
      "Monitoring priorities",

    windSpeed:
      "Wind speed",

    citizenReporting:
      "CITIZEN REPORTING",

    incidentModalDescription:
      "Help the monitoring team understand what is happening on the ground.",

    incidentType:
      "Incident type",

    photograph:
      "Photograph",

    photographHelp:
      "Optional. Upload a photograph of the reported condition.",

    cancel: "Cancel",

    submitReport:
      "Submit report",

    incidentSubmitted:
      "Incident report submitted successfully.",

    enterDescription:
      "Please enter an incident description.",

    enterLocation:
      "Please enter the incident location.",

    severity:
      "Severity",

    location:
      "Location",

    description:
      "Description",

    state:
      "State",

    status:
      "Status",

    actionTaken:
      "Action taken",

    update:
      "Update",

    noReports:
      "No incident reports submitted yet.",

    refreshData:
      "Refresh data",

    liveMonitoring:
      "Live monitoring mode",

    liveEnvironmentalData:
      "Live environmental data",

    lastUpdated:
      "Last updated",

    waiting:
      "Waiting",

    riskZone:
      "RISK ZONE",

    riskZoneTitle:
      "India risk-zone overview",

    riskZoneDescription:
      "Compare estimated environmental risk across all Indian states and Union Territories using live weather indicators.",

    selectRiskState:
      "Select a risk zone",

    liveRisk:
      "Live estimated risk",

    riskNotOfficial:
      "Prototype indicator only — not an official disaster warning.",

    mapRisk:
      "Risk level",
  },

  Hindi: {
    language: "भाषा चुनें",
    chooseState: "राज्य चुनें",
    searchStates: "राज्य खोजें...",
    noStates: "कोई राज्य नहीं मिला।",
    chooseStateBegin: "शुरू करने के लिए राज्य चुनें",
    selectAnyState: "सूची से कोई राज्य चुनें",
    liveNotice: "लाइव डेटा सूचना",
    liveNoticeText:
      "मौसम और मिट्टी की नमी का डेटा लाइव मौसम सेवा से लिया जाता है। कुल जोखिम एक अनुमानित संकेतक है।",
    communitySafety: "सामुदायिक सुरक्षा",
    seeUnusual: "कुछ असामान्य दिखाई दिया?",
    reportIncident: "घटना की रिपोर्ट करें",
    fieldOfficerDashboard: "अधिकारी डैशबोर्ड",
    hideOfficerDashboard:
      "अधिकारी डैशबोर्ड छिपाएँ",
    temperature: "तापमान",
    rainfall: "वर्षा",
    humidity: "आर्द्रता",
    soilMoisture: "मिट्टी की नमी",
    riskScore: "जोखिम स्कोर",
    overallRisk: "कुल जोखिम",
    low: "कम",
    moderate: "मध्यम",
    high: "उच्च",
    safe: "सुरक्षित",
    refreshData: "डेटा रीफ्रेश करें",
  },

  Tamil: {
    language: "மொழியைத் தேர்ந்தெடுக்கவும்",
    chooseState: "மாநிலத்தைத் தேர்ந்தெடுக்கவும்",
    searchStates: "மாநிலங்களைத் தேடுங்கள்...",
    noStates: "மாநிலங்கள் எதுவும் இல்லை.",
    chooseStateBegin:
      "தொடங்க ஒரு மாநிலத்தைத் தேர்ந்தெடுக்கவும்",
    selectAnyState:
      "பட்டியலில் இருந்து எந்த மாநிலத்தையும் தேர்ந்தெடுக்கவும்",
    liveNotice: "நேரடி தரவு தகவல்",
    liveNoticeText:
      "வானிலை மற்றும் மண் ஈரப்பதத் தரவுகள் நேரடி வானிலை சேவையிலிருந்து பெறப்படுகின்றன.",
    communitySafety: "சமூக பாதுகாப்பு",
    seeUnusual:
      "ஏதேனும் அசாதாரணமானதைப் பார்த்தீர்களா?",
    reportIncident:
      "சம்பவத்தைப் புகாரளிக்கவும்",
    fieldOfficerDashboard:
      "கள அலுவலர் டாஷ்போர்டு",
    hideOfficerDashboard:
      "அலுவலர் டாஷ்போர்டை மறைக்கவும்",
    temperature: "வெப்பநிலை",
    rainfall: "மழைப்பொழிவு",
    humidity: "ஈரப்பதம்",
    soilMoisture: "மண் ஈரப்பதம்",
    riskScore: "ஆபத்து மதிப்பெண்",
    overallRisk: "மொத்த ஆபத்து",
    low: "குறைவு",
    moderate: "மிதமான",
    high: "அதிகம்",
    safe: "பாதுகாப்பானது",
    refreshData:
      "தரவைப் புதுப்பிக்கவும்",
  },
};

/* =========================================================
   RISK CALCULATION
========================================================= */

function calculateRisk(
  rainfall,
  soilMoisture
) {
  const rain =
    Number(rainfall) || 0;

  const moisture =
    Number(soilMoisture) || 0;

  const rainScore = Math.min(
    (rain / 30) * 60,
    60
  );

  const moistureScore = Math.min(
    moisture * 40,
    40
  );

  const score = Math.round(
    Math.min(
      rainScore + moistureScore,
      100
    )
  );

  if (
    score >= 65 ||
    rain >= 25 ||
    moisture >= 0.9
  ) {
    return {
      label: "High",
      level: "high",
      score,
    };
  }

  if (
    score >= 35 ||
    rain >= 10 ||
    moisture >= 0.75
  ) {
    return {
      label: "Moderate",
      level: "moderate",
      score,
    };
  }

  return {
    label: "Low",
    level: "low",
    score,
  };
}

/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function getWeatherDescription(
  weatherCode
) {
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

function getWeatherIcon(
  weatherCode
) {
  if (
    [95, 96, 99].includes(
      weatherCode
    )
  ) {
    return "⛈️";
  }

  if (
    [80, 81, 82].includes(
      weatherCode
    )
  ) {
    return "🌧️";
  }

  if (
    [61, 63, 65].includes(
      weatherCode
    )
  ) {
    return "🌦️";
  }

  if (
    [51, 53, 55].includes(
      weatherCode
    )
  ) {
    return "🌦️";
  }

  if (
    [45, 48].includes(
      weatherCode
    )
  ) {
    return "🌫️";
  }

  if (
    [1, 2].includes(
      weatherCode
    )
  ) {
    return "⛅";
  }

  return "☀️";
}

/* =========================================================
   ADVISORIES
========================================================= */

function generateAdvisories(
  state
) {
  if (
    !state ||
    state.overallRisk ===
      "Loading" ||
    state.overallRisk ===
      "Waiting"
  ) {
    return [];
  }

  const rainfall =
    Number(state.rainfall) || 0;

  const soilMoisture =
    Number(
      state.soilMoisture
    ) || 0;

  const rainProbability =
    Number(
      state.rainProbability
    ) || 0;

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

  if (
    rainProbability >= 70
  ) {
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

  if (
    windSpeed >= 35
  ) {
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
   MAP CONTROLLER
========================================================= */

function MapController({
  selectedState,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !selectedState
    ) {
      return;
    }

    map.flyTo(
      selectedState.coordinates,
      6,
      {
        duration: 1.2,
      }
    );
  }, [
    map,
    selectedState,
  ]);

  return null;
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  /* =======================================================
     IMPORTANT FIX
     
     We intentionally DO NOT restore selectedRegion from
     localStorage.

     Older versions could save:
       "North-Eastern Region"

     and then every refresh would show only 8 states.

     The directory now always starts with ALL INDIA.
  ======================================================= */

  const [selectedStateId, setSelectedStateId] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "sahaya-selected-state"
        );

      return (
        states.some(
          (state) =>
            state.id === saved
        )
          ? saved
          : "andhra-pradesh"
      );
    });

  const [selectedRegion, setSelectedRegion] =
    useState("All India");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedRiskStateId, setSelectedRiskStateId] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "sahaya-selected-risk-state"
        );

      return states.some(
        (state) =>
          state.id === saved
      )
        ? saved
        : "andhra-pradesh";
    });

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

  const themeOptions = [
    { id: "midnight", icon: "🌙", label: "Midnight" },
    { id: "forest", icon: "🌿", label: "Forest" },
    { id: "sunset", icon: "🌅", label: "Sunset" },
    { id: "contrast", icon: "◐", label: "Contrast" },
  ];

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("sahaya-theme");
    return themeOptions.some((option) => option.id === saved)
      ? saved
      : "midnight";
  });

  const text =
    translations[language] ||
    translations.English;

  /* =======================================================
     CITIZEN REPORTING
  ======================================================= */

  const [
    showIncidentForm,
    setShowIncidentForm,
  ] = useState(false);

  const [
    incidentReports,
    setIncidentReports,
  ] = useState([]);

  const [
    showOfficerDashboard,
    setShowOfficerDashboard,
  ] = useState(false);

  const [
    incidentForm,
    setIncidentForm,
  ] = useState({
    type: "Road crack",
    description: "",
    location: "",
    severity: "Moderate",
    photograph: null,
  });

  /* =======================================================
     SAVE SELECTED STATE
  ======================================================= */

  useEffect(() => {
    if (selectedStateId) {
      localStorage.setItem(
        "sahaya-selected-state",
        selectedStateId
      );
    }
  }, [selectedStateId]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sahaya-theme", theme);
  }, [theme]);

  /* =======================================================
     SAVE RISK STATE
  ======================================================= */

  useEffect(() => {
    if (
      selectedRiskStateId
    ) {
      localStorage.setItem(
        "sahaya-selected-risk-state",
        selectedRiskStateId
      );
    }
  }, [
    selectedRiskStateId,
  ]);

  /* =======================================================
     SELECTED STATE
  ======================================================= */

  const selectedState =
    states.find(
      (state) =>
        state.id ===
        selectedStateId
    ) || states[0];

  /* =======================================================
     REGION DIRECTORY
     
     THIS IS THE IMPORTANT PART.
     
     "All India" = all 36 states/UTs.
  ======================================================= */

  const regionStateIds =
    regionGroups[
      selectedRegion
    ] ||
    regionGroups[
      "All India"
    ];

  const regionStates =
    states.filter(
      (state) =>
        regionStateIds.includes(
          state.id
        )
    );

  const filteredStates =
    regionStates.filter(
      (state) =>
        state.name
          .toLowerCase()
          .includes(
            searchTerm
              .toLowerCase()
              .trim()
          )
    );

  /* =======================================================
     RISK ZONE
     
     ALWAYS ALL 36.
     
     It is intentionally independent from the left-side
     region directory.
  ======================================================= */

  const riskZoneStates =
    states;

  const selectedRiskState =
    states.find(
      (state) =>
        state.id ===
        selectedRiskStateId
    ) ||
    selectedState ||
    riskZoneStates[0];

  const selectedRiskLiveData =
    selectedRiskState
      ? liveData[
          selectedRiskState.id
        ]
      : null;

  const selectedRiskScore =
    selectedRiskLiveData
      ?.riskScore ??
    (selectedRiskLiveData
      ? calculateRisk(
          selectedRiskLiveData.rainfall,
          selectedRiskLiveData.soilMoisture
        ).score
      : 0);

  /* =======================================================
     RISK TRANSLATION
  ======================================================= */

  const translateRisk =
    (risk) => {
      if (
        risk === "High"
      ) {
        return text.high;
      }

      if (
        risk === "Moderate"
      ) {
        return text.moderate;
      }

      if (
        risk === "Low"
      ) {
        return text.low;
      }

      if (
        risk === "Safe"
      ) {
        return text.safe;
      }

      return risk || "--";
    };

  /* =======================================================
     RISK CSS CLASS
  ======================================================= */

  const getRiskClass =
    (riskLevel) => {
      if (
        riskLevel === "high"
      ) {
        return "risk-high";
      }

      if (
        riskLevel ===
        "moderate"
      ) {
        return "risk-moderate";
      }

      if (
        riskLevel === "low"
      ) {
        return "risk-low";
      }

      return "risk-moderate";
    };

  /* =======================================================
     LIVE WEATHER DATA
     
     IMPORTANT:
     Promise.allSettled is used so one failed state
     does not prevent the other 35 from loading.
  ======================================================= */

  const fetchLiveData =
    async () => {
      try {
        setIsRefreshing(
          true
        );

        setError("");

        const results =
          await Promise.allSettled(
            states.map(
              async (state) => {
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
                  await fetch(
                    url
                  );

                if (
                  !response.ok
                ) {
                  throw new Error(
                    `Failed to fetch ${state.name}`
                  );
                }

                const data =
                  await response.json();

                const currentRainfall =
                  data.current
                    ?.precipitation ??
                  0;

                const currentTemperature =
                  data.current
                    ?.temperature_2m ??
                  0;

                const currentHumidity =
                  data.current
                    ?.relative_humidity_2m ??
                  0;

                const currentWindSpeed =
                  data.current
                    ?.wind_speed_10m ??
                  0;

                const currentWeatherCode =
                  data.current
                    ?.weather_code ??
                  0;

                const soilMoisture =
                  data.hourly
                    ?.soil_moisture_0_to_1cm?.[0] ??
                  0;

                const rainProbability =
                  data.hourly
                    ?.precipitation_probability?.[0] ??
                  0;

                const risk =
                  calculateRisk(
                    currentRainfall,
                    soilMoisture
                  );

                const forecast =
                  data.daily?.time?.map(
                    (
                      date,
                      index
                    ) => ({
                      date,

                      maxTemperature:
                        data.daily
                          ?.temperature_2m_max?.[
                          index
                        ] ??
                        0,

                      minTemperature:
                        data.daily
                          ?.temperature_2m_min?.[
                          index
                        ] ??
                        0,

                      rainfall:
                        data.daily
                          ?.precipitation_sum?.[
                          index
                        ] ??
                        0,

                      weatherCode:
                        data.daily
                          ?.weather_code?.[
                          index
                        ] ??
                        0,
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

                  riskScore:
                    risk.score,

                  forecast,
                };
              }
            )
          );

        const formattedData =
          {};

        results.forEach(
          (result) => {
            if (
              result.status ===
              "fulfilled"
            ) {
              formattedData[
                result.value.id
              ] =
                result.value;
            } else {
              console.warn(
                "Weather request failed:",
                result.reason
              );
            }
          }
        );

        setLiveData(
          formattedData
        );

        setLastUpdated(
          new Date()
        );

        if (
          Object.keys(
            formattedData
          ).length === 0
        ) {
          setError(
            "Live data could not be loaded. Please check your internet connection."
          );
        }
      } catch (
        fetchError
      ) {
        console.error(
          fetchError
        );

        setError(
          "Live data could not be loaded. Please check your internet connection and try again."
        );
      } finally {
        setIsLoading(
          false
        );

        setIsRefreshing(
          false
        );
      }
    };

  /* =======================================================
     FETCH DATA ON LOAD + EVERY 15 MINUTES
  ======================================================= */

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

  /* =======================================================
     SELECTED LIVE DATA
  ======================================================= */

  const selectedLiveData =
    selectedState
      ? liveData[
          selectedState.id
        ]
      : null;

  const forecast =
    selectedLiveData
      ?.forecast ?? [];

  /* =======================================================
     CURRENT STATE
  ======================================================= */

  const currentState =
    useMemo(() => {
      if (
        !selectedState
      ) {
        return null;
      }

      if (
        !selectedLiveData
      ) {
        return {
          ...selectedState,

          temperature: "--",

          rainfall: "--",

          humidity: "--",

          windSpeed: "--",

          weatherCode: 0,

          soilMoisture: "--",

          rainProbability: "--",

          overallRisk:
            "Waiting",

          riskLevel:
            "moderate",

          riskScore: 0,

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

  /* =======================================================
     ADVISORIES
  ======================================================= */

  const advisories =
    useMemo(
      () =>
        generateAdvisories(
          currentState
        ),
      [currentState]
    );

  /* =======================================================
     STATE SELECT
     
     NOTICE:
     We DO NOT call setSelectedRegion here.
     
     This prevents selecting Nagaland, Assam, etc. from
     unexpectedly switching the whole directory to the
     North-Eastern Region.
  ======================================================= */

  const handleStateSelect =
    (state) => {
      setSelectedStateId(
        state.id
      );

      setSelectedRiskStateId(
        state.id
      );

      setShowFullAnalysis(
        false
      );
    };

  /* =======================================================
     REGION CHANGE
  ======================================================= */

  const handleRegionChange =
    (event) => {
      const nextRegion =
        event.target.value;

      setSelectedRegion(
        nextRegion
      );

      setSearchTerm("");

      const availableStateIds =
        regionGroups[
          nextRegion
        ] ||
        regionGroups[
          "All India"
        ];

      /*
       If the currently selected state isn't in the
       newly selected region, select the first state
       of that region.

       This is only done when the USER changes the region.
      */

      if (
        !availableStateIds.includes(
          selectedStateId
        )
      ) {
        const nextState =
          states.find(
            (state) =>
              availableStateIds.includes(
                state.id
              )
          );

        if (
          nextState
        ) {
          setSelectedStateId(
            nextState.id
          );
        }

        setShowFullAnalysis(
          false
        );
      }
    };

  /* =======================================================
     SHOW ALL STATES
  ======================================================= */

  const handleShowAllStates =
    () => {
      setSelectedRegion(
        "All India"
      );

      setSearchTerm("");
    };

  /* =======================================================
     FULL ANALYSIS
  ======================================================= */

  const handleFullAnalysis =
    (state) => {
      setSelectedStateId(
        state.id
      );

      setSelectedRiskStateId(
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

  /* =======================================================
     LAST UPDATED
  ======================================================= */

  const formatLastUpdated =
    () => {
      if (
        !lastUpdated
      ) {
        return "Not updated yet";
      }

      return lastUpdated.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  /* =======================================================
     INCIDENT FORM CHANGE
  ======================================================= */

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

  /* =======================================================
     INCIDENT SUBMIT
  ======================================================= */

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
        severity: "Moderate",
        photograph: null,
      });

      setShowIncidentForm(
        false
      );

      alert(
        text.incidentSubmitted
      );
    };

  /* =======================================================
     OFFICER STATUS UPDATE
  ======================================================= */

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

  /* =======================================================
     OFFICER NOTE
  ======================================================= */

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

  /* =======================================================
     FORECAST CHART DATA
  ======================================================= */

  const forecastChartData =
    forecast.map(
      (day, index) => ({
        ...day,

        label:
          index === 0
            ? text.today
            : new Date(
                day.date
              ).toLocaleDateString(
                "en-IN",
                {
                  weekday:
                    "short",
                }
              ),
      })
    );

  /* =======================================================
     RENDER
  ======================================================= */

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

            <option value="Telugu">
              తెలుగు
            </option>

            <option value="Bengali">
              বাংলা
            </option>

            <option value="Marathi">
              मराठी
            </option>

            <option value="Kannada">
              ಕನ್ನಡ
            </option>

            <option value="Malayalam">
              മലയാളം
            </option>

            <option value="Gujarati">
              ગુજરાતી
            </option>

            <option value="Punjabi">
              ਪੰਜਾਬੀ
            </option>

            <option value="Odia">
              ଓଡ଼ିଆ
            </option>

            <option value="Assamese">
              অসমীয়া
            </option>

            <option value="Urdu">
              اردو
            </option>

          </select>

        </div>

        <div className="theme-selector" aria-label="Theme selector">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`theme-option ${theme === option.id ? "active" : ""}`}
              onClick={() => setTheme(option.id)}
              title={option.label}
              aria-pressed={theme === option.id}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="topbar-status">

          <span className="status-dot"></span>

          <span>
            {text.liveMonitoring}
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
              Sahaya Land provides a live
              environmental overview of
              conditions and potential risks
              across India, with detailed
              monitoring for every state and
              Union Territory.
            </p>

          </div>

          <div className="hero-visual">

            <div className="visual-grid"></div>

            <div className="visual-orbit orbit-one"></div>

            <div className="visual-orbit orbit-two"></div>

            <div className="visual-center">

              <span className="visual-center-label">
                INDIA
              </span>

              <strong>
                {states.length}
              </strong>

              <small>
                States &amp; UTs
              </small>

            </div>

          </div>

        </section>

        {/* =================================================
            LIVE NOTICE
        ================================================= */}

        <section className="live-notice">

          <div className="live-notice-icon">
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
            MAIN DASHBOARD GRID
        ================================================= */}

        <div className="dashboard-layout">

          {/* =================================================
              LEFT - REGION DIRECTORY
          ================================================= */}

          <aside className="region-directory">

            <div className="directory-header">

              <div>

                <span className="eyebrow">
                  REGION DIRECTORY
                </span>

                <h2>
                  {text.chooseState}
                </h2>

              </div>

              <span className="directory-count">
                {filteredStates.length}
              </span>

            </div>

            {/* REGION SELECTOR */}

            <div className="directory-region-selector">

              <label htmlFor="region-select">
                Region
              </label>

              <select
                id="region-select"
                value={selectedRegion}
                onChange={
                  handleRegionChange
                }
              >

                {regionOptions.map(
                  (region) => (
                    <option
                      key={region}
                      value={region}
                    >
                      {region}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* SEARCH */}

            <div className="state-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder={
                  text.searchStates
                }
              />

            </div>

            {/* SHOW ALL BUTTON */}

            {selectedRegion !==
              "All India" && (
              <button
                type="button"
                className="show-all-states-button"
                onClick={
                  handleShowAllStates
                }
              >
                Show all 36 States &amp; UTs
              </button>
            )}

            {/* STATE LIST */}

            <div className="state-list">

              {filteredStates.length ===
              0 ? (
                <div className="no-states">
                  {text.noStates}
                </div>
              ) : (
                filteredStates.map(
                  (state) => {

                    const stateData =
                      liveData[
                        state.id
                      ];

                    const isSelected =
                      selectedState?.id ===
                      state.id;

                    return (
                      <button
                        key={state.id}
                        type="button"
                        className={`state-list-item ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleStateSelect(
                            state
                          )
                        }
                      >

                        <span className="state-initial">
                          {state.name.charAt(
                            0
                          )}
                        </span>

                        <span className="state-info">

                          <strong>
                            {state.name}
                          </strong>

                          <small>
                            {stateData
                              ? `${Number(
                                  stateData.temperature
                                ).toFixed(
                                  1
                                )}°C`
                              : "--"}
                          </small>

                        </span>

                        <span
                          className={`state-status-dot ${
                            stateData
                              ? getRiskClass(
                                  stateData.riskLevel
                                )
                              : ""
                          }`}
                        ></span>

                      </button>
                    );
                  }
                )
              )}

            </div>

          </aside>

          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <div className="dashboard-content">

            {/* =================================================
                SELECTED REGION
            ================================================= */}

            {currentState ? (
              <section className="selected-region-card">

                <div className="selected-region-main">

                  <span className="eyebrow">
                    {text.selectedRegion}
                  </span>

                  <h1>
                    {currentState.name}
                  </h1>

                  <p className="selected-location">
                    {currentState.capital}
                    {" • "}
                    {currentState.region}
                  </p>

                  <p className="selected-description">
                    {currentState.description}
                  </p>

                  <button
                    className="primary-button"
                    onClick={() =>
                      handleFullAnalysis(
                        currentState
                      )
                    }
                  >
                    View full analysis
                    <span>
                      →
                    </span>
                  </button>

                </div>

                <div className="selected-risk-summary">

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
                      ? text.waiting
                      : translateRisk(
                          currentState.overallRisk
                        )}
                  </strong>

                  {selectedLiveData && (
                    <small>
                      {selectedLiveData.riskScore}
                      /100
                    </small>
                  )}

                </div>

              </section>
            ) : (
              <section className="empty-state">
                <h2>
                  {text.chooseStateBegin}
                </h2>

                <p>
                  {text.selectStateDescription}
                </p>
              </section>
            )}

            {/* =================================================
                COMMUNITY SAFETY
            ================================================= */}

            <section className="community-safety">

              <div>

                <span className="eyebrow">
                  {text.communitySafety}
                </span>

                <h2>
                  {text.seeUnusual}
                </h2>

                <p>
                  {text.reportDescription}
                </p>

              </div>

              <div className="community-actions">

                <button
                  className="primary-button"
                  onClick={() =>
                    setShowIncidentForm(
                      true
                    )
                  }
                >
                  +{" "}
                  {text.reportIncident}
                </button>

                <button
                  className="secondary-button"
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

            </section>

            {/* =================================================
                LIVE STATUS BAR
            ================================================= */}

            <div className="live-data-bar">

              <div className="live-data-status">

                <span className="status-dot"></span>

                <strong>
                  {text.liveEnvironmentalData}
                </strong>

              </div>

              <span>
                {text.lastUpdated}:{" "}
                {formatLastUpdated()}
              </span>

              <button
                type="button"
                onClick={
                  fetchLiveData
                }
                disabled={
                  isRefreshing
                }
              >
                {isRefreshing
                  ? "Refreshing..."
                  : text.refreshData}
              </button>

            </div>

            {/* ERROR */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* =================================================
                METRIC CARDS
            ================================================= */}

            {currentState && (
              <section className="metric-grid">

                <div className="metric-card">

                  <div className="metric-card-header">
                    <span>
                      TEMPERATURE
                    </span>

                    <span>
                      °
                    </span>
                  </div>

                  <strong>
                    {currentState.temperature}
                    <small>
                      °C
                    </small>
                  </strong>

                  <p>
                    {text.currentTemperature}
                  </p>

                </div>

                <div className="metric-card">

                  <div className="metric-card-header">
                    <span>
                      SOIL MOISTURE
                    </span>

                    <span>
                      ◌
                    </span>
                  </div>

                  <strong>
                    {selectedLiveData
                      ? (
                          Number(
                            currentState.soilMoisture
                          ) * 100
                        ).toFixed(
                          0
                        )
                      : "--"}
                    <small>
                      %
                    </small>
                  </strong>

                  <div className="metric-progress">

                    <span
                      style={{
                        width: `${
                          selectedLiveData
                            ? Math.min(
                                Math.max(
                                  Number(
                                    currentState.soilMoisture
                                  ) *
                                    100,
                                  0
                                ),
                                100
                              )
                            : 0
                        }%`,
                      }}
                    ></span>

                  </div>

                  <p>
                    {text.soilEstimate}
                  </p>

                </div>

                <div className="metric-card">

                  <div className="metric-card-header">
                    <span>
                      RAINFALL
                    </span>

                    <span>
                      ≋
                    </span>
                  </div>

                  <strong>
                    {currentState.rainfall}
                    <small>
                      mm
                    </small>
                  </strong>

                  <p>
                    {text.currentRainfall}
                  </p>

                </div>

                <div className="metric-card">

                  <div className="metric-card-header">
                    <span>
                      OVERALL RISK
                    </span>

                    <span>
                      ◈
                    </span>
                  </div>

                  <strong
                    className={getRiskClass(
                      currentState.riskLevel
                    )}
                  >
                    {currentState.overallRisk ===
                    "Waiting"
                      ? text.waiting
                      : translateRisk(
                          currentState.overallRisk
                        )}
                  </strong>

                  <p>
                    {selectedLiveData
                      ? `${text.riskScore}: ${selectedLiveData.riskScore}/100`
                      : text.estimatedIndicators}
                  </p>

                </div>

              </section>
            )}

            {/* =================================================
                CURRENT WEATHER
            ================================================= */}

            {currentState &&
              selectedLiveData && (
                <section className="weather-current-card">

                  <div className="weather-current-main">

                    <span className="eyebrow">
                      {text.currentWeather}
                    </span>

                    <div className="weather-current-value">

                      <span className="weather-icon">
                        {getWeatherIcon(
                          currentState.weatherCode
                        )}
                      </span>

                      <div>

                        <strong>
                          {currentState.temperature}
                          °C
                        </strong>

                        <p>
                          {getWeatherDescription(
                            currentState.weatherCode
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="weather-current-details">

                    <div>
                      <span>
                        {text.rainProbability}
                      </span>

                      <strong>
                        {currentState.rainProbability}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>
                        {text.humidity}
                      </span>

                      <strong>
                        {currentState.humidity}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>
                        {text.windSpeed}
                      </span>

                      <strong>
                        {currentState.windSpeed}
                        {" "}
                        km/h
                      </strong>
                    </div>

                  </div>

                </section>
              )}

            {/* =================================================
                WEATHER OUTLOOK
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

              </div>

              {isLoading ? (
                <div className="loading-card">
                  {text.forecastLoading}
                </div>
              ) : forecast.length ===
                0 ? (
                <div className="loading-card">
                  {text.forecastUnavailable}
                </div>
              ) : (
                <div className="forecast-grid">

                  {forecast.map(
                    (
                      day,
                      index
                    ) => (
                      <div
                        className={`forecast-card ${
                          index === 0
                            ? "forecast-card-today"
                            : ""
                        }`}
                        key={`${day.date}-${index}`}
                      >
                        <div className="forecast-day-row">
                          <span className="forecast-day">
                            {index ===
                            0
                              ? text.today
                              : new Date(
                                  day.date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    weekday:
                                      "short",
                                  }
                                )}
                          </span>

                          <span className="forecast-icon">
                            {getWeatherIcon(
                              day.weatherCode
                            )}
                          </span>
                        </div>

                        <div className="forecast-temp-row">
                          <strong className="forecast-temperature">
                            {Math.round(
                              day.maxTemperature
                            )}
                            °
                          </strong>

                          <small className="forecast-min-temperature">
                            {Math.round(
                              day.minTemperature
                            )}
                            °
                          </small>
                        </div>

                        <div className="forecast-rainfall">
                          <span className="forecast-rainfall-label">
                            Rain
                          </span>
                          <strong>
                            {day.rainfall.toFixed(
                              1
                            )} mm
                          </strong>
                        </div>
                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            {/* =================================================
                VISUAL INSIGHTS
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

                  <div className="chart-header">

                    <div>

                      <h3>
                        {text.temperatureTrend}
                      </h3>

                      <p>
                        {text.temperatureDescription}
                      </p>

                    </div>

                  </div>

                  <div className="chart-container">

                    <ResponsiveContainer
                      width="100%"
                      height={280}
                    >

                      <LineChart
                        data={
                          forecastChartData
                        }
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="label"
                        />

                        <YAxis />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="maxTemperature"
                          name="Maximum"
                          stroke="#1d4ed8"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="minTemperature"
                          name="Minimum"
                          stroke="#60a5fa"
                          strokeWidth={2}
                          dot={{
                            r: 3,
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                </div>

                <div className="chart-card">

                  <div className="chart-header">

                    <div>

                      <h3>
                        {text.rainfallForecast}
                      </h3>

                      <p>
                        {text.rainfallDescription}
                      </p>

                    </div>

                  </div>

                  <div className="chart-container">

                    <ResponsiveContainer
                      width="100%"
                      height={280}
                    >

                      <BarChart
                        data={
                          forecastChartData
                        }
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="label"
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
                          name={text.rain}
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
                                {
                                  advisory.title
                                }
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
                                }
                                :
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
                INTERACTIVE MAP
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
                    {text.northEasternRegion}
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
                  zoom={5}
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

                  {/* ALL 36 STATES + UTs ON MAP */}

                  {states.map(
                    (state) => {

                      const stateLiveData =
                        liveData[
                          state.id
                        ];

                      const riskLevel = String(
                        stateLiveData?.riskLevel || ""
                      ).toLowerCase();

                      const color =
                        riskLevel === "high"
                          ? "#ef4444"
                          : riskLevel === "moderate"
                          ? "#f59e0b"
                          : riskLevel === "low"
                          ? "#16a34a"
                          : "#94a3b8";

                      const isSelected =
                        selectedState?.id ===
                        state.id;

                      return (
                        <CircleMarker
                          key={
                            state.id
                          }
                          center={
                            state.coordinates
                          }
                          radius={
                            isSelected
                              ? 12
                              : 8
                          }
                          pathOptions={{
                            color:
                              isSelected
                                ? "#111827"
                                : color,

                            fillColor:
                              color,

                            fillOpacity:
                              0.8,

                            weight:
                              isSelected
                                ? 4
                                : 2,
                          }}
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
                                  stateLiveData
                                    ?.temperature ??
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
                                  stateLiveData
                                    ?.rainfall ??
                                  "--"
                                }{" "}
                                mm
                              </small>

                              <small>
                                Rain probability:{" "}
                                {
                                  stateLiveData
                                    ?.rainProbability ??
                                  "--"
                                }
                                %
                              </small>

                              <small>
                                Estimated risk:{" "}
                                {stateLiveData
                                  ? translateRisk(
                                      stateLiveData.overallRisk
                                    )
                                  : "--"}
                              </small>

                            </div>

                          </Popup>

                        </CircleMarker>
                      );
                    }
                  )}

                </MapContainer>

              </div>

            </section>

            {/* =================================================
                FULL ANALYSIS
            ================================================= */}

            {showFullAnalysis &&
              currentState && (

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
                        ? text.waiting
                        : translateRisk(
                            currentState.overallRisk
                          )}

                      {" "}
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
                            {text.temperature}
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
                            {text.rainfall}
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
                            {text.humidity}
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
                            {text.windSpeed}
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

                              <strong>
                                {
                                  highlight
                                }
                              </strong>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                </section>
              )}

            {/* =================================================
                INCIDENT REPORTS
            ================================================= */}

            {incidentReports.length >
              0 && (

              <section className="reports-section">

                <div className="section-heading">

                  <div>

                    <span className="eyebrow">
                      {text.communityReports}
                    </span>

                    <h2>
                      {text.recentReports}
                    </h2>

                  </div>

                </div>

                <div className="reports-list">

                  {incidentReports.map(
                    (
                      report
                    ) => (

                      <div
                        className="report-card"
                        key={
                          report.id
                        }
                      >

                        <div className="report-card-header">

                          <strong>
                            {
                              report.type
                            }
                          </strong>

                          <span>
                            {
                              report.status
                            }
                          </span>

                        </div>

                        <p>
                          {
                            report.description
                          }
                        </p>

                        <small>
                          <strong>
                            {
                              text.location
                            }:
                          </strong>{" "}
                          {
                            report.location
                          }
                        </small>

                        <small>
                          <strong>
                            {
                              text.state
                            }:
                          </strong>{" "}
                          {
                            report.state
                          }
                        </small>

                        <small>
                          <strong>
                            {
                              text.severity
                            }:
                          </strong>{" "}
                          {
                            report.severity
                          }
                        </small>

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

              <section className="officer-dashboard">

                <div className="section-heading">

                  <div>

                    <span className="eyebrow">
                      FIELD OPERATIONS
                    </span>

                    <h2>
                      {
                        text.fieldOfficerDashboard
                      }
                    </h2>

                  </div>

                </div>

                {incidentReports.length ===
                0 ? (

                  <div className="alert-empty">
                    {text.noReports}
                  </div>

                ) : (

                  <div className="officer-report-list">

                    {incidentReports.map(
                      (
                        report
                      ) => (

                        <div
                          className="officer-report-card"
                          key={
                            report.id
                          }
                        >

                          <div className="officer-report-header">

                            <div>

                              <strong>
                                {
                                  report.type
                                }
                              </strong>

                              <span>
                                {
                                  report.state
                                }
                              </span>

                            </div>

                            <select
                              value={
                                report.status
                              }
                              onChange={(
                                event
                              ) =>
                                updateIncidentStatus(
                                  report.id,
                                  event.target
                                    .value
                                )
                              }
                            >

                              {incidentStatuses.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {
                                      status
                                    }
                                  </option>
                                )
                              )}

                            </select>

                          </div>

                          <p>
                            {
                              report.description
                            }
                          </p>

                          <small>
                            {
                              report.location
                            }
                          </small>

                          <textarea
                            placeholder={
                              text.actionTaken
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
                                event.target
                                  .value
                              )
                            }
                          />

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>
            )}

          </div>

        </div>

      </main>

      {/* =================================================
          INCIDENT MODAL
      ================================================= */}

      {showIncidentForm && (

        <div
          className="modal-overlay"
          onClick={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setShowIncidentForm(
                false
              );
            }

          }}
        >

          <div className="incident-modal">

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  {text.citizenReporting}
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

                  {text.incidentType}

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
                      (
                        type
                      ) => (
                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
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
          Sahaya Land © 2026. Live weather
          prototype for environmental
          awareness and monitoring.
        </p>

        <span>
          Built for a better tomorrow.
        </span>

      </footer>

    </div>
  );
}

export default App;