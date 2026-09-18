from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import math
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional

import requests


# ============================================================
# SAHAYA-LAND
# AI-Based Landslide Risk Monitoring System
#
# Coverage:
#   All 28 States + 8 Union Territories = 36
#
# Monitoring model:
#   Representative State / UT points
#
# Weather:
#   Open-Meteo live weather API
#
# NOTE:
#   Soil moisture, slope and ground movement are prototype
#   estimation models for hackathon demonstration.
# ============================================================


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="SAHAYA-LAND API",
    description="AI-Based Landslide Risk Monitoring System - All India",
    version="6.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INDIA CONFIGURATION
# ============================================================

INDIA_CENTER = [22.5, 79.0]

WEATHER_BATCH_SIZE = 50
WEATHER_CACHE_SECONDS = 900  # 15 minutes
WEATHER_TIMEOUT = 10


# ============================================================
# ALL 36 STATES + UNION TERRITORIES
#
# Each location is a representative monitoring point.
# These are used for prototype/demo risk monitoring.
# ============================================================

STATE_LOCATIONS = [
    {
        "state": "Andhra Pradesh",
        "place": "Tirupati",
        "latitude": 13.6288,
        "longitude": 79.4192,
    },
    {
        "state": "Arunachal Pradesh",
        "place": "Pasighat",
        "latitude": 27.0844,
        "longitude": 93.6053,
    },
    {
        "state": "Assam",
        "place": "Silchar",
        "latitude": 24.8333,
        "longitude": 92.7789,
    },
    {
        "state": "Bihar",
        "place": "Muzaffarpur",
        "latitude": 26.1209,
        "longitude": 85.3647,
    },
    {
        "state": "Chhattisgarh",
        "place": "Jagdalpur",
        "latitude": 19.0748,
        "longitude": 82.0080,
    },
    {
        "state": "Goa",
        "place": "Margao",
        "latitude": 15.2832,
        "longitude": 73.9862,
    },
    {
        "state": "Gujarat",
        "place": "Rajkot",
        "latitude": 22.3039,
        "longitude": 70.8022,
    },
    {
        "state": "Haryana",
        "place": "Hisar",
        "latitude": 29.1492,
        "longitude": 75.7217,
    },
    {
        "state": "Himachal Pradesh",
        "place": "Dharamshala",
        "latitude": 32.2190,
        "longitude": 76.3234,
    },
    {
        "state": "Jharkhand",
        "place": "Hazaribagh",
        "latitude": 23.9929,
        "longitude": 85.3637,
    },
    {
        "state": "Karnataka",
        "place": "Mysuru",
        "latitude": 12.2958,
        "longitude": 76.6394,
    },
    {
        "state": "Kerala",
        "place": "Thiruvananthapuram",
        "latitude": 8.5241,
        "longitude": 76.9366,
    },
    {
        "state": "Madhya Pradesh",
        "place": "Indore",
        "latitude": 22.7196,
        "longitude": 75.8577,
    },
    {
        "state": "Maharashtra",
        "place": "Nashik",
        "latitude": 19.9975,
        "longitude": 73.7898,
    },
    {
        "state": "Manipur",
        "place": "Tamenglong",
        "latitude": 24.9850,
        "longitude": 93.6500,
    },
    {
        "state": "Meghalaya",
        "place": "Cherrapunji",
        "latitude": 25.2702,
        "longitude": 91.7323,
    },
    {
        "state": "Mizoram",
        "place": "Kolasib",
        "latitude": 24.2230,
        "longitude": 92.6760,
    },
    {
        "state": "Nagaland",
        "place": "Mokokchung",
        "latitude": 26.3220,
        "longitude": 94.5180,
    },
    {
        "state": "Odisha",
        "place": "Cuttack",
        "latitude": 20.4625,
        "longitude": 85.8828,
    },
    {
        "state": "Punjab",
        "place": "Ludhiana",
        "latitude": 30.9010,
        "longitude": 75.8573,
    },
    {
        "state": "Rajasthan",
        "place": "Ajmer",
        "latitude": 26.4499,
        "longitude": 74.6399,
    },
    {
        "state": "Sikkim",
        "place": "Gyalshing",
        "latitude": 27.2890,
        "longitude": 88.2630,
    },
    {
        "state": "Tamil Nadu",
        "place": "Chennai",
        "latitude": 13.0827,
        "longitude": 80.2707,
    },
    {
        "state": "Telangana",
        "place": "Warangal",
        "latitude": 17.9784,
        "longitude": 79.5941,
    },
    {
        "state": "Tripura",
        "place": "Dharmanagar",
        "latitude": 24.3667,
        "longitude": 92.1667,
    },
    {
        "state": "Uttar Pradesh",
        "place": "Agra",
        "latitude": 27.1767,
        "longitude": 78.0081,
    },
    {
        "state": "Uttarakhand",
        "place": "Rishikesh",
        "latitude": 30.0869,
        "longitude": 78.2676,
    },
    {
        "state": "West Bengal",
        "place": "Durgapur",
        "latitude": 23.5204,
        "longitude": 87.3119,
    },
    {
        "state": "Andaman and Nicobar Islands",
        "place": "Mayabunder",
        "latitude": 12.9137,
        "longitude": 92.8973,
    },
    {
        "state": "Chandigarh",
        "place": "Chandigarh",
        "latitude": 30.7333,
        "longitude": 76.7794,
    },
    {
        "state": "Dadra and Nagar Haveli and Daman and Diu",
        "place": "Silvassa",
        "latitude": 20.2737,
        "longitude": 72.9981,
    },
    {
        "state": "Delhi",
        "place": "Dwarka",
        "latitude": 28.5921,
        "longitude": 77.0460,
    },
    {
        "state": "Jammu and Kashmir",
        "place": "Gulmarg",
        "latitude": 34.0484,
        "longitude": 74.3805,
    },
    {
        "state": "Ladakh",
        "place": "Nubra",
        "latitude": 34.6806,
        "longitude": 77.5666,
    },
    {
        "state": "Lakshadweep",
        "place": "Kavaratti",
        "latitude": 10.5667,
        "longitude": 72.6420,
    },
    {
        "state": "Puducherry",
        "place": "Mahe",
        "latitude": 11.7000,
        "longitude": 75.5333,
    },
]


# ============================================================
# STATE LIST
# ============================================================

ALL_STATES = [item["state"] for item in STATE_LOCATIONS]


# ============================================================
# WEATHER CACHE
# ============================================================

weather_cache: Dict[str, Dict] = {}


# ============================================================
# STATE PLACES
# ============================================================

STATE_PLACES = {
    "Andhra Pradesh": [
        "Tirupati",
        "Visakhapatnam",
        "Vijayawada",
        "Araku Valley",
        "Srisailam",
    ],
    "Arunachal Pradesh": [
        "Pasighat",
        "Itanagar",
        "Tawang",
        "Ziro",
        "Bomdila",
    ],
    "Assam": [
        "Silchar",
        "Guwahati",
        "Dibrugarh",
        "Jorhat",
        "Tezpur",
    ],
    "Bihar": [
        "Muzaffarpur",
        "Patna",
        "Gaya",
        "Bhagalpur",
        "Darbhanga",
    ],
    "Chhattisgarh": [
        "Jagdalpur",
        "Raipur",
        "Ambikapur",
        "Bilaspur",
        "Korba",
    ],
    "Goa": [
        "Margao",
        "Panaji",
        "Mapusa",
        "Vasco da Gama",
        "Ponda",
    ],
    "Gujarat": [
        "Rajkot",
        "Ahmedabad",
        "Surat",
        "Vadodara",
        "Junagadh",
    ],
    "Haryana": [
        "Hisar",
        "Gurugram",
        "Faridabad",
        "Panipat",
        "Ambala",
    ],
    "Himachal Pradesh": [
        "Dharamshala",
        "Shimla",
        "Manali",
        "Kullu",
        "Solan",
    ],
    "Jharkhand": [
        "Hazaribagh",
        "Ranchi",
        "Jamshedpur",
        "Dhanbad",
        "Bokaro",
    ],
    "Karnataka": [
        "Mysuru",
        "Bengaluru",
        "Coorg",
        "Chikkamagaluru",
        "Mangaluru",
    ],
    "Kerala": [
        "Thiruvananthapuram",
        "Kochi",
        "Wayanad",
        "Idukki",
        "Munnar",
    ],
    "Madhya Pradesh": [
        "Indore",
        "Bhopal",
        "Jabalpur",
        "Ujjain",
        "Rewa",
    ],
    "Maharashtra": [
        "Nashik",
        "Pune",
        "Mumbai",
        "Mahabaleshwar",
        "Kolhapur",
    ],
    "Manipur": [
        "Tamenglong",
        "Imphal",
        "Churachandpur",
        "Ukhrul",
        "Senapati",
    ],
    "Meghalaya": [
        "Cherrapunji",
        "Shillong",
        "Tura",
        "Jowai",
        "Nongpoh",
    ],
    "Mizoram": [
        "Kolasib",
        "Aizawl",
        "Lunglei",
        "Champhai",
        "Serchhip",
    ],
    "Nagaland": [
        "Mokokchung",
        "Kohima",
        "Dimapur",
        "Mon",
        "Tuensang",
    ],
    "Odisha": [
        "Cuttack",
        "Bhubaneswar",
        "Koraput",
        "Rayagada",
        "Berhampur",
    ],
    "Punjab": [
        "Ludhiana",
        "Amritsar",
        "Patiala",
        "Jalandhar",
        "Pathankot",
    ],
    "Rajasthan": [
        "Ajmer",
        "Jaipur",
        "Udaipur",
        "Jodhpur",
        "Kota",
    ],
    "Sikkim": [
        "Gyalshing",
        "Gangtok",
        "Namchi",
        "Mangan",
        "Pelling",
    ],
    "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Ooty",
        "Kodaikanal",
        "Salem",
    ],
    "Telangana": [
        "Warangal",
        "Hyderabad",
        "Karimnagar",
        "Nizamabad",
        "Khammam",
    ],
    "Tripura": [
        "Dharmanagar",
        "Agartala",
        "Udaipur",
        "Kailashahar",
        "Ambassa",
    ],
    "Uttar Pradesh": [
        "Agra",
        "Lucknow",
        "Varanasi",
        "Prayagraj",
        "Meerut",
    ],
    "Uttarakhand": [
        "Rishikesh",
        "Dehradun",
        "Nainital",
        "Mussoorie",
        "Joshimath",
    ],
    "West Bengal": [
        "Durgapur",
        "Kolkata",
        "Darjeeling",
        "Siliguri",
        "Kalimpong",
    ],
    "Andaman and Nicobar Islands": [
        "Mayabunder",
        "Port Blair",
        "Havelock Island",
        "Diglipur",
        "Car Nicobar",
    ],
    "Chandigarh": [
        "Chandigarh",
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
        "Silvassa",
        "Daman",
        "Diu",
    ],
    "Delhi": [
        "Dwarka",
        "New Delhi",
        "Rohini",
        "Saket",
        "Shahdara",
    ],
    "Jammu and Kashmir": [
        "Gulmarg",
        "Srinagar",
        "Pahalgam",
        "Jammu",
        "Anantnag",
    ],
    "Ladakh": [
        "Nubra",
        "Leh",
        "Kargil",
        "Pangong",
        "Diskit",
    ],
    "Lakshadweep": [
        "Kavaratti",
        "Agatti",
        "Amini",
        "Andrott",
        "Kalpeni",
    ],
    "Puducherry": [
        "Mahe",
        "Puducherry",
        "Karaikal",
        "Yanam",
    ],
}


# ============================================================
# RISK ENGINE
# ============================================================

def clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return max(minimum, min(maximum, value))


def calculate_risk(
    rainfall: float,
    soil_moisture: float,
    slope: float,
    ground_movement: float = 0,
) -> int:

    rainfall = clamp(rainfall)
    soil_moisture = clamp(soil_moisture)
    slope = clamp(slope)
    ground_movement = clamp(ground_movement)

    risk = (
        rainfall * 0.35
        + soil_moisture * 0.25
        + slope * 0.25
        + ground_movement * 0.15
    )

    return int(round(clamp(risk)))


def get_risk_level(risk: int) -> str:

    if risk >= 80:
        return "Critical"

    if risk >= 60:
        return "High"

    if risk >= 40:
        return "Moderate"

    return "Low"


# ============================================================
# RAINFALL CONVERSION
# ============================================================

def rainfall_to_score(rainfall_mm: float) -> float:

    rainfall_mm = max(0, float(rainfall_mm))

    if rainfall_mm <= 0:
        return 0

    if rainfall_mm <= 2:
        return 10

    if rainfall_mm <= 5:
        return 20

    if rainfall_mm <= 10:
        return 35

    if rainfall_mm <= 20:
        return 50

    if rainfall_mm <= 40:
        return 65

    if rainfall_mm <= 60:
        return 80

    if rainfall_mm <= 100:
        return 90

    return 100


# ============================================================
# PROTOTYPE ENVIRONMENT MODELS
# ============================================================

def estimate_soil_moisture(
    latitude: float,
    longitude: float,
    humidity: float,
) -> int:

    base = (
        35
        + humidity * 0.35
        + abs(math.sin(latitude * 0.45)) * 15
        + abs(math.cos(longitude * 0.22)) * 10
    )

    return int(round(clamp(base, 25, 95)))


def estimate_slope(
    latitude: float,
    longitude: float,
) -> int:

    value = (
        50
        + abs(math.sin(latitude * 0.31)) * 30
        + abs(math.cos(longitude * 0.17)) * 25
    )

    return int(round(clamp(value, 25, 95)))


def estimate_ground_movement(
    latitude: float,
    longitude: float,
) -> int:

    value = (
        40
        + abs(math.sin(latitude * 0.23)) * 25
        + abs(math.cos(longitude * 0.29)) * 25
    )

    return int(round(clamp(value, 20, 90)))


# ============================================================
# REASON GENERATOR
# ============================================================

def generate_reason(
    rainfall_score: float,
    soil_moisture: int,
    slope: int,
    ground_movement: int,
) -> str:

    reasons = []

    if rainfall_score >= 80:
        reasons.append("very heavy rainfall")
    elif rainfall_score >= 50:
        reasons.append("heavy rainfall")
    elif rainfall_score >= 25:
        reasons.append("moderate rainfall")

    if soil_moisture >= 70:
        reasons.append("high soil moisture")
    elif soil_moisture >= 50:
        reasons.append("elevated soil moisture")

    if slope >= 80:
        reasons.append("very steep slope")
    elif slope >= 60:
        reasons.append("steep slope")
    else:
        reasons.append("moderate slope")

    if ground_movement >= 75:
        reasons.append("significant ground movement")
    elif ground_movement >= 55:
        reasons.append("ground movement detected")

    if not reasons:
        return "low environmental risk indicators"

    return " + ".join(reasons)


# ============================================================
# DATA QUALITY
# ============================================================

def generate_data_quality(weather_available: bool) -> Dict:

    return {
        "rainfall": weather_available,
        "temperature": weather_available,
        "humidity": weather_available,
        "soil_moisture": True,
        "slope": True,
        "ground_movement": False,
        "satellite": False,
        "historical_data": True,
    }


def calculate_confidence(weather_available: bool) -> str:

    if weather_available:
        return "High"

    return "Moderate"


# ============================================================
# RISK CHANGE
# ============================================================

def calculate_risk_change(
    risk: int,
    rainfall_score: float,
    soil_moisture: int,
    slope: int,
) -> float:

    base_change = (
        rainfall_score * 0.08
        + soil_moisture * 0.015
        + slope * 0.01
        - 8
    )

    # Keep prototype variation controlled.
    return round(clamp(base_change, -12, 12), 2)


# ============================================================
# TREND
# ============================================================

def get_risk_trend(risk_change: float) -> str:

    if risk_change >= 4:
        return "Increasing"

    if risk_change <= -4:
        return "Decreasing"

    return "Stable"


# ============================================================
# EMERGENCY PRIORITY
# ============================================================

def calculate_emergency_priority(
    risk: int,
    nearby_villages: int,
    nearby_schools: int,
    nearby_hospitals: int,
    nearby_roads: int,
) -> float:

    population_factor = nearby_villages * 1.5
    school_factor = nearby_schools * 1.0
    hospital_factor = nearby_hospitals * 1.5
    road_factor = nearby_roads * 0.75

    asset_score = (
        population_factor
        + school_factor
        + hospital_factor
        + road_factor
    )

    priority = risk + asset_score

    return round(clamp(priority), 2)


# ============================================================
# NEARBY ASSET GENERATOR
# ============================================================

def generate_nearby_assets(
    latitude: float,
    longitude: float,
    state: str,
) -> Dict:

    seed_value = (
        int(abs(latitude) * 10000)
        + int(abs(longitude) * 10000)
        + len(state) * 100
    )

    random.seed(seed_value)

    return {
        "nearby_villages": random.randint(0, 8),
        "nearby_schools": random.randint(0, 4),
        "nearby_hospitals": random.randint(0, 3),
        "nearby_roads": random.randint(1, 6),
    }


# ============================================================
# MONITORING GRID
# ============================================================

def generate_monitoring_grid() -> List[Dict]:

    cells = []

    for index, location in enumerate(STATE_LOCATIONS, start=1):

        cells.append(
            {
                "id": f"Cell-{index:04d}",
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "state": location["state"],
                "place": location["place"],
            }
        )

    return cells


# ============================================================
# WEATHER API
# ============================================================

def fetch_weather_batch(
    locations: List[Dict],
) -> Dict[str, Dict]:

    if not locations:
        return {}

    latitudes = ",".join(
        str(location["latitude"])
        for location in locations
    )

    longitudes = ",".join(
        str(location["longitude"])
        for location in locations
    )

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitudes,
        "longitude": longitudes,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain"
        ),
        "timezone": "auto",
    }

    try:

        response = requests.get(
            url,
            params=params,
            timeout=WEATHER_TIMEOUT,
        )

        response.raise_for_status()

        data = response.json()

        # Open-Meteo returns:
        #   list for multiple locations
        #   dictionary for one location
        if isinstance(data, list):
            results = data
        else:
            results = [data]

        weather_data = {}

        for location, weather in zip(locations, results):

            current = weather.get("current", {})

            precipitation = current.get(
                "precipitation",
                0,
            )

            rain = current.get(
                "rain",
                0,
            )

            weather_data[location["state"]] = {
                "temperature": current.get(
                    "temperature_2m",
                    0,
                ),
                "humidity": current.get(
                    "relative_humidity_2m",
                    0,
                ),
                "precipitation": precipitation,
                "rain": rain,
                "weather_time": current.get(
                    "time"
                ),
                "weather_source": "Open-Meteo",
                "available": True,
            }

        return weather_data

    except Exception as error:

        print(
            f"[Weather] API error: {error}"
        )

        return {}


# ============================================================
# WEATHER CACHE
# ============================================================

def get_weather_for_grid(
    cells: List[Dict],
) -> Dict[str, Dict]:

    current_time = time.time()

    result = {}

    locations_to_fetch = []

    for cell in cells:

        state = cell["state"]

        cached = weather_cache.get(state)

        if cached:

            age = current_time - cached["timestamp"]

            if age < WEATHER_CACHE_SECONDS:

                result[state] = cached["data"]

                continue

        locations_to_fetch.append(cell)

    # Fetch in batches
    for start in range(
        0,
        len(locations_to_fetch),
        WEATHER_BATCH_SIZE,
    ):

        batch = locations_to_fetch[
            start:start + WEATHER_BATCH_SIZE
        ]

        fetched = fetch_weather_batch(batch)

        for state, data in fetched.items():

            weather_cache[state] = {
                "timestamp": current_time,
                "data": data,
            }

            result[state] = data

    return result


# ============================================================
# FALLBACK WEATHER
# ============================================================

def fallback_weather() -> Dict:

    return {
        "temperature": 0,
        "humidity": 0,
        "precipitation": 0,
        "rain": 0,
        "weather_time": None,
        "weather_source": "Unavailable",
        "available": False,
    }


# ============================================================
# CREATE RISK ZONE
# ============================================================

def build_risk_zone(
    cell: Dict,
    weather: Dict,
) -> Dict:

    latitude = cell["latitude"]
    longitude = cell["longitude"]
    state = cell["state"]

    weather_available = weather.get(
        "available",
        False,
    )

    temperature = float(
        weather.get(
            "temperature",
            0,
        )
        or 0
    )

    humidity = float(
        weather.get(
            "humidity",
            0,
        )
        or 0
    )

    precipitation = float(
        weather.get(
            "precipitation",
            0,
        )
        or 0
    )

    rain = float(
        weather.get(
            "rain",
            0,
        )
        or 0
    )

    # Open-Meteo precipitation/rain can occasionally
    # contain the current hourly value.
    rainfall_mm = max(
        precipitation,
        rain,
    )

    rainfall_score = rainfall_to_score(
        rainfall_mm
    )

    soil_moisture = estimate_soil_moisture(
        latitude,
        longitude,
        humidity if weather_available else 70,
    )

    slope = estimate_slope(
        latitude,
        longitude,
    )

    ground_movement = estimate_ground_movement(
        latitude,
        longitude,
    )

    risk = calculate_risk(
        rainfall_score,
        soil_moisture,
        slope,
        ground_movement,
    )

    level = get_risk_level(risk)

    reason = generate_reason(
        rainfall_score,
        soil_moisture,
        slope,
        ground_movement,
    )

    risk_change = calculate_risk_change(
        risk,
        rainfall_score,
        soil_moisture,
        slope,
    )

    trend = get_risk_trend(
        risk_change
    )

    assets = generate_nearby_assets(
        latitude,
        longitude,
        state,
    )

    emergency_priority = calculate_emergency_priority(
        risk,
        assets["nearby_villages"],
        assets["nearby_schools"],
        assets["nearby_hospitals"],
        assets["nearby_roads"],
    )

    data_quality = generate_data_quality(
        weather_available
    )

    confidence = calculate_confidence(
        weather_available
    )

    weather_time = weather.get(
        "weather_time"
    )

    if weather_time is None:

        weather_time = datetime.now(
            timezone.utc
        ).strftime(
            "%Y-%m-%dT%H:%M"
        )

    return {
        "id": cell["id"],
        "latitude": latitude,
        "longitude": longitude,

        "state": state,
        "place": cell["place"],

        "risk": risk,
        "level": level,
        "reason": reason,

        "rainfall": int(
            round(rainfall_score)
        ),
        "rainfall_mm": round(
            rainfall_mm,
            2,
        ),

        "soil_moisture": soil_moisture,
        "slope": slope,
        "ground_movement": ground_movement,

        "temperature": round(
            temperature,
            1,
        ),

        "humidity": int(
            round(humidity)
        ),

        "weather_time": weather_time,

        "weather_source": weather.get(
            "weather_source",
            "Unavailable",
        ),

        "confidence": confidence,

        "trend": trend,
        "risk_change": risk_change,

        "emergency_priority": emergency_priority,

        **assets,

        "data_quality": data_quality,

        "last_updated": weather_time,
    }


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():

    return {
        "success": True,
        "message": "SAHAYA-LAND API is running",
        "region": "All India",
        "state_count": len(ALL_STATES),
        "version": "6.0.0",
        "monitoring_mode": (
            "Representative State / UT points"
        ),
        "docs": "/docs",
    }


# ============================================================
# STATUS
# ============================================================

@app.get("/api/status")
def api_status():

    return {
        "success": True,

        "status": "online",

        "project": "SAHAYA-LAND",

        "region": "All India",

        "state_count": len(ALL_STATES),

        "states": ALL_STATES,

        "live_weather": True,

        "weather_provider": "Open-Meteo",

        "weather_cache": "15 minutes",

        "monitoring_mode": (
            "Representative State / UT points"
        ),

        "prototype_sources": {
            "weather": "Open-Meteo",
            "soil_moisture": (
                "Prototype estimation model"
            ),
            "slope": (
                "Prototype estimation model"
            ),
            "ground_movement": (
                "Prototype estimation model"
            ),
            "satellite": "Not connected",
            "historical_data": (
                "Prototype historical indicator"
            ),
        },
    }


# ============================================================
# GRID INFO
# ============================================================

@app.get("/api/grid-info")
def grid_info():

    cells = generate_monitoring_grid()

    return {
        "success": True,
        "region": "All India",

        "state_count": len(ALL_STATES),

        "states": ALL_STATES,

        "total_cells": len(cells),

        "monitoring_mode": (
            "Representative State / UT points"
        ),

        "center": {
            "latitude": INDIA_CENTER[0],
            "longitude": INDIA_CENTER[1],
        },

        "cells": cells,
    }


# ============================================================
# RISK ZONES
# ============================================================

@app.get("/api/risk-zones")
def get_risk_zones():

    cells = generate_monitoring_grid()

    weather_data = get_weather_for_grid(
        cells
    )

    zones = []

    for cell in cells:

        weather = weather_data.get(
            cell["state"],
            fallback_weather(),
        )

        zone = build_risk_zone(
            cell,
            weather,
        )

        zones.append(zone)

    # ========================================================
    # SUMMARY
    # ========================================================

    critical = sum(
        1
        for zone in zones
        if zone["level"] == "Critical"
    )

    high = sum(
        1
        for zone in zones
        if zone["level"] == "High"
    )

    moderate = sum(
        1
        for zone in zones
        if zone["level"] == "Moderate"
    )

    low = sum(
        1
        for zone in zones
        if zone["level"] == "Low"
    )

    live_weather_cells = sum(
        1
        for zone in zones
        if zone["weather_source"]
        == "Open-Meteo"
    )

    failed_weather_cells = (
        len(zones)
        - live_weather_cells
    )

    return {
        "success": True,

        "region": "All India",

        "states": ALL_STATES,

        "state_count": len(ALL_STATES),

        "count": len(zones),

        "total_cells": len(zones),

        "live_weather": (
            live_weather_cells > 0
        ),

        "live_weather_cells": live_weather_cells,

        "failed_weather_cells": (
            failed_weather_cells
        ),

        "weather_cache": "15 minutes",

        "monitoring_mode": (
            "Representative State / UT points"
        ),

        "risk_summary": {
            "critical": critical,
            "high": high,
            "moderate": moderate,
            "low": low,
        },

        "zones": zones,
    }


# ============================================================
# SINGLE RISK ZONE
# ============================================================

@app.get("/api/risk-zones/{zone_id}")
def get_risk_zone(
    zone_id: str,
):

    cells = generate_monitoring_grid()

    target = None

    for cell in cells:

        if cell["id"].lower() == zone_id.lower():

            target = cell

            break

    if target is None:

        raise HTTPException(
            status_code=404,
            detail="Risk zone not found",
        )

    weather_data = get_weather_for_grid(
        [target]
    )

    weather = weather_data.get(
        target["state"],
        fallback_weather(),
    )

    zone = build_risk_zone(
        target,
        weather,
    )

    return {
        "success": True,
        "zone": zone,
    }


# ============================================================
# STATE SUMMARY
# ============================================================

@app.get("/api/state-summary")
def state_summary():

    cells = generate_monitoring_grid()

    weather_data = get_weather_for_grid(
        cells
    )

    summaries = []

    for cell in cells:

        weather = weather_data.get(
            cell["state"],
            fallback_weather(),
        )

        zone = build_risk_zone(
            cell,
            weather,
        )

        summaries.append(
            {
                "state": zone["state"],
                "place": zone["place"],
                "risk": zone["risk"],
                "level": zone["level"],
                "trend": zone["trend"],
                "risk_change": zone[
                    "risk_change"
                ],
                "confidence": zone[
                    "confidence"
                ],
                "temperature": zone[
                    "temperature"
                ],
                "humidity": zone[
                    "humidity"
                ],
                "rainfall_mm": zone[
                    "rainfall_mm"
                ],
                "soil_moisture": zone[
                    "soil_moisture"
                ],
                "slope": zone[
                    "slope"
                ],
                "ground_movement": zone[
                    "ground_movement"
                ],
                "emergency_priority": zone[
                    "emergency_priority"
                ],
                "weather_source": zone[
                    "weather_source"
                ],
                "last_updated": zone[
                    "last_updated"
                ],
            }
        )

    # Highest risk first
    summaries.sort(
        key=lambda item: item["risk"],
        reverse=True,
    )

    return {
        "success": True,

        "region": "All India",

        "state_count": len(ALL_STATES),

        "states": summaries,
    }


# ============================================================
# ALERTS
# ============================================================

@app.get("/api/alerts")
def get_alerts():

    cells = generate_monitoring_grid()

    weather_data = get_weather_for_grid(
        cells
    )

    alerts = []

    for cell in cells:

        weather = weather_data.get(
            cell["state"],
            fallback_weather(),
        )

        zone = build_risk_zone(
            cell,
            weather,
        )

        if zone["risk"] >= 60:

            alerts.append(
                {
                    "id": zone["id"],
                    "state": zone["state"],
                    "place": zone["place"],
                    "risk": zone["risk"],
                    "level": zone["level"],
                    "reason": zone["reason"],
                    "priority": zone[
                        "emergency_priority"
                    ],
                    "trend": zone["trend"],
                    "last_updated": zone[
                        "last_updated"
                    ],
                }
            )

    alerts.sort(
        key=lambda alert: (
            alert["risk"],
            alert["priority"],
        ),
        reverse=True,
    )

    return {
        "success": True,

        "region": "All India",

        "count": len(alerts),

        "alerts": alerts,
    }


# ============================================================
# RISK SIMULATOR
# ============================================================

@app.get("/api/simulator/{zone_id}")
def risk_simulator(
    zone_id: str,
):

    cells = generate_monitoring_grid()

    target = None

    for cell in cells:

        if cell["id"].lower() == zone_id.lower():

            target = cell

            break

    if target is None:

        raise HTTPException(
            status_code=404,
            detail="Risk zone not found",
        )

    weather_data = get_weather_for_grid(
        [target]
    )

    weather = weather_data.get(
        target["state"],
        fallback_weather(),
    )

    base_zone = build_risk_zone(
        target,
        weather,
    )

    scenarios = []

    rainfall_scenarios = [
        0,
        10,
        25,
        50,
        75,
        100,
    ]

    for rainfall_mm in rainfall_scenarios:

        rainfall_score = rainfall_to_score(
            rainfall_mm
        )

        simulated_risk = calculate_risk(
            rainfall_score,
            base_zone["soil_moisture"],
            base_zone["slope"],
            base_zone["ground_movement"],
        )

        scenarios.append(
            {
                "rainfall_mm": rainfall_mm,
                "rainfall_score": int(
                    round(rainfall_score)
                ),
                "risk": simulated_risk,
                "level": get_risk_level(
                    simulated_risk
                ),
            }
        )

    return {
        "success": True,

        "zone": {
            "id": base_zone["id"],
            "state": base_zone["state"],
            "place": base_zone["place"],
        },

        "current": {
            "risk": base_zone["risk"],
            "level": base_zone["level"],
            "rainfall_mm": base_zone[
                "rainfall_mm"
            ],
            "soil_moisture": base_zone[
                "soil_moisture"
            ],
            "slope": base_zone["slope"],
            "ground_movement": base_zone[
                "ground_movement"
            ],
        },

        "scenarios": scenarios,
    }


# ============================================================
# STARTUP MESSAGE
# ============================================================

@app.on_event("startup")
def startup_event():

    print()
    print("=" * 65)
    print("SAHAYA-LAND API")
    print("AI-Based Landslide Risk Monitoring System")
    print("=" * 65)
    print(
        f"Region          : All India"
    )
    print(
        f"States / UTs    : {len(ALL_STATES)}"
    )
    print(
        f"Monitoring Cells: {len(STATE_LOCATIONS)}"
    )
    print(
        "Weather         : Open-Meteo"
    )
    print(
        "Cache           : 15 minutes"
    )
    print(
        "Monitoring Mode : Representative State / UT points"
    )
    print("=" * 65)
    print()


# ============================================================
# RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )