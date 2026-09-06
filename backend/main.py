from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import math
import random
import time
from pathlib import Path

import geopandas as gpd
import requests
from shapely.geometry import Point


# ============================================================
# SAHAYA-LAND
# ============================================================

app = FastAPI(
    title="SAHAYA-LAND API",
    description="AI-Based Landslide Risk Monitoring System",
    version="5.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sahaya-land.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CONFIGURATION
# ============================================================

NER_BOUNDS = {
    "min_lat": 22.0,
    "max_lat": 29.8,
    "min_lon": 88.0,
    "max_lon": 97.5,
}

# Smaller prototype grid
GRID_STEP = 1.0

WEATHER_BATCH_SIZE = 50
WEATHER_CACHE_SECONDS = 900
WEATHER_TIMEOUT = 8

BOUNDARY_FILE = (
    Path(__file__).resolve().parent
    / "data"
    / "states.geojson"
)

NER_STATES = [
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura",
]


# ============================================================
# WEATHER CACHE
# ============================================================

weather_cache = {
    "timestamp": 0,
    "data": {},
}


# ============================================================
# NER PLACE NAMES
# ============================================================

STATE_PLACES = {
    "Arunachal Pradesh": [
        "Itanagar",
        "Tawang",
        "Bomdila",
        "Pasighat",
        "Ziro",
    ],
    "Assam": [
        "Guwahati",
        "Dibrugarh",
        "Silchar",
        "Tezpur",
        "Haflong",
    ],
    "Manipur": [
        "Imphal",
        "Ukhrul",
        "Churachandpur",
        "Senapati",
        "Tamenglong",
    ],
    "Meghalaya": [
        "Shillong",
        "Cherrapunji",
        "Tura",
        "Jowai",
        "Nongpoh",
    ],
    "Mizoram": [
        "Aizawl",
        "Lunglei",
        "Champhai",
        "Kolasib",
        "Serchhip",
    ],
    "Nagaland": [
        "Kohima",
        "Dimapur",
        "Mokokchung",
        "Wokha",
        "Mon",
    ],
    "Sikkim": [
        "Gangtok",
        "Namchi",
        "Mangan",
        "Gyalshing",
        "Pelling",
    ],
    "Tripura": [
        "Agartala",
        "Dharmanagar",
        "Udaipur",
        "Kailashahar",
        "Ambassa",
    ],
}


# ============================================================
# RISK ENGINE
# ============================================================

def calculate_risk(
    rainfall,
    soil_moisture,
    slope,
    ground_movement=0,
):
    """
    Prototype weighted risk model.

    This is not a scientifically validated
    landslide probability model.
    """

    rainfall_score = rainfall * 0.35
    soil_score = soil_moisture * 0.25
    slope_score = slope * 0.25
    movement_score = ground_movement * 0.15

    risk_score = round(
        rainfall_score
        + soil_score
        + slope_score
        + movement_score
    )

    risk_score = max(0, min(100, risk_score))

    if risk_score >= 80:
        level = "Critical"
    elif risk_score >= 60:
        level = "High"
    elif risk_score >= 40:
        level = "Moderate"
    else:
        level = "Low"

    return risk_score, level


# ============================================================
# RISK EXPLANATION
# ============================================================

def generate_reason(
    rainfall,
    soil_moisture,
    slope,
    ground_movement=0,
):
    reasons = []

    if rainfall >= 80:
        reasons.append("heavy rainfall")
    elif rainfall >= 50:
        reasons.append("moderate rainfall")

    if soil_moisture >= 80:
        reasons.append("very high soil moisture")
    elif soil_moisture >= 60:
        reasons.append("high soil moisture")
    elif soil_moisture >= 40:
        reasons.append("elevated soil moisture")

    if slope >= 80:
        reasons.append("very steep slope")
    elif slope >= 60:
        reasons.append("steep slope")
    elif slope >= 40:
        reasons.append("moderate slope")

    if ground_movement >= 70:
        reasons.append("significant ground movement")
    elif ground_movement >= 45:
        reasons.append("ground movement detected")

    if not reasons:
        return "environmental conditions currently stable"

    return " + ".join(reasons)


# ============================================================
# RAINFALL NORMALIZATION
# ============================================================

def rainfall_to_score(rainfall_mm):
    """
    Converts rainfall in millimetres
    into a 0-100 rainfall risk score.
    """

    if rainfall_mm <= 0:
        return 0
    elif rainfall_mm < 2:
        return 10
    elif rainfall_mm < 5:
        return 25
    elif rainfall_mm < 10:
        return 40
    elif rainfall_mm < 20:
        return 60
    elif rainfall_mm < 30:
        return 75
    elif rainfall_mm < 50:
        return 90
    else:
        return 100


# ============================================================
# PROTOTYPE SOIL MOISTURE
# ============================================================

def estimate_soil_moisture(latitude, longitude):
    """
    Temporary prototype value.

    Replace later with real satellite or
    sensor-based soil-moisture data.
    """

    value = (
        50
        + 25 * math.sin(math.radians(latitude * 4))
        + 15 * math.cos(math.radians(longitude * 3))
    )

    return round(max(10, min(95, value)))


# ============================================================
# PROTOTYPE SLOPE
# ============================================================

def estimate_slope(latitude, longitude):
    """
    Temporary prototype value.

    Replace later with real DEM-derived slope.
    """

    value = (
        45
        + 35 * math.sin(math.radians(latitude * 6))
        + 20 * math.cos(math.radians(longitude * 4))
    )

    return round(max(5, min(95, value)))


# ============================================================
# PROTOTYPE GROUND MOVEMENT
# ============================================================

def estimate_ground_movement(latitude, longitude):
    """
    Temporary prototype ground-movement indicator.

    Replace later with IoT sensor or satellite
    displacement data.
    """

    value = (
        35
        + 30 * math.sin(math.radians(latitude * 5))
        + 25 * math.cos(math.radians(longitude * 4))
    )

    return round(max(0, min(100, value)))


# ============================================================
# DATA QUALITY
# ============================================================

def generate_data_quality(live_weather_available):
    """
    Shows which data sources are currently available.

    Weather is live when Open-Meteo responds.
    Other sources are prototype placeholders.
    """

    return {
        "rainfall": live_weather_available,
        "temperature": live_weather_available,
        "humidity": live_weather_available,
        "soil_moisture": True,
        "slope": True,
        "ground_movement": False,
        "satellite": False,
        "historical_data": True,
    }


def calculate_confidence(data_quality):
    available_sources = sum(
        1
        for value in data_quality.values()
        if value is True
    )

    if available_sources >= 6:
        return "High"

    if available_sources >= 4:
        return "Medium"

    return "Low"


# ============================================================
# RISK TREND
# ============================================================

def calculate_risk_change(
    rainfall,
    soil_moisture,
    ground_movement,
):
    """
    Prototype trend calculation.

    Positive values mean increasing risk.
    Negative values mean decreasing risk.
    """

    risk_change = (
        rainfall * 0.20
        + soil_moisture * 0.10
        + ground_movement * 0.15
        - 25
    )

    return round(
        max(-30, min(30, risk_change)),
        2,
    )


def get_risk_trend(risk_change):
    if risk_change >= 8:
        return "Increasing"

    if risk_change <= -8:
        return "Decreasing"

    return "Stable"


# ============================================================
# EMERGENCY PRIORITY
# ============================================================

def calculate_emergency_priority(
    risk,
    rainfall,
    ground_movement,
):
    """
    Priority score helps emergency teams
    decide which zones need attention first.
    """

    priority = (
        risk * 0.65
        + rainfall * 0.15
        + ground_movement * 0.20
    )

    return round(
        max(0, min(100, priority)),
        2,
    )


# ============================================================
# PROTOTYPE NEARBY ASSETS
# ============================================================

def generate_nearby_assets(
    latitude,
    longitude,
    state_name,
):
    """
    Temporary nearby infrastructure estimates.

    Replace later with real GIS datasets.
    """

    seed_value = (
        int(abs(latitude) * 1000)
        + int(abs(longitude) * 1000)
        + len(state_name)
    )

    random.seed(seed_value)

    return {
        "nearby_villages": random.randint(0, 8),
        "nearby_schools": random.randint(0, 4),
        "nearby_hospitals": random.randint(0, 3),
        "nearby_roads": random.randint(1, 6),
    }


# ============================================================
# LOAD NER BOUNDARY
# ============================================================

def load_ner_boundary():
    gdf = gpd.read_file(BOUNDARY_FILE)

    required_columns = {"admin", "name", "geometry"}

    missing_columns = required_columns - set(gdf.columns)

    if missing_columns:
        raise ValueError(
            f"Missing columns in states.geojson: {missing_columns}"
        )

    india = gdf[
        gdf["admin"].eq("India")
    ].copy()

    ner = india[
        india["name"].isin(NER_STATES)
    ].copy()

    if ner.empty:
        raise ValueError(
            "No NER states found in boundary file"
        )

    if ner.crs is not None and ner.crs.to_epsg() != 4326:
        ner = ner.to_crs(epsg=4326)

    try:
        boundary = ner.geometry.union_all()
    except AttributeError:
        boundary = ner.geometry.unary_union

    return ner, boundary


# ============================================================
# GENERATE MONITORING GRID INSIDE NER
# ============================================================

def generate_monitoring_grid():
    try:
        ner, ner_boundary = load_ner_boundary()

        cells = []
        cell_number = 1

        latitude = NER_BOUNDS["min_lat"]

        while latitude <= NER_BOUNDS["max_lat"]:
            longitude = NER_BOUNDS["min_lon"]

            while longitude <= NER_BOUNDS["max_lon"]:
                point = Point(
                    longitude,
                    latitude,
                )

                if ner_boundary.contains(point):
                    matching_states = ner[
                        ner.geometry.contains(point)
                    ]

                    if not matching_states.empty:
                        state_name = str(
                            matching_states.iloc[0]["name"]
                        )
                    else:
                        state_name = "North Eastern Region"

                    cells.append(
                        {
                            "id": f"Cell-{cell_number:04d}",
                            "latitude": round(latitude, 4),
                            "longitude": round(longitude, 4),
                            "state": state_name,
                        }
                    )

                    cell_number += 1

                longitude += GRID_STEP

            latitude += GRID_STEP

        print("NER boundary loaded successfully")
        print(f"NER states selected: {len(ner)}")
        print(f"Monitoring cells inside NER: {len(cells)}")

        return cells

    except Exception as error:
        print("NER boundary error:", error)
        return []


# ============================================================
# FETCH BATCH WEATHER
# ============================================================

def fetch_weather_batch(batch):
    if not batch:
        return {}

    latitudes = ",".join(
        str(cell["latitude"])
        for cell in batch
    )

    longitudes = ",".join(
        str(cell["longitude"])
        for cell in batch
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

        if isinstance(data, dict):
            weather_results = [data]
        else:
            weather_results = data

        results = {}

        for index, cell in enumerate(batch):
            if index >= len(weather_results):
                continue

            weather = weather_results[index]
            current = weather.get("current", {})

            rain = float(
                current.get("rain", 0) or 0
            )

            precipitation = float(
                current.get("precipitation", 0) or 0
            )

            if rain <= 0 and precipitation > 0:
                rain = precipitation

            results[cell["id"]] = {
                "rainfall_mm": rain,
                "temperature": current.get("temperature_2m"),
                "humidity": current.get("relative_humidity_2m"),
                "time": current.get("time"),
                "source": "Open-Meteo",
            }

        return results

    except requests.exceptions.Timeout:
        print("Open-Meteo request timed out.")
        return {}

    except requests.exceptions.RequestException as error:
        print("Open-Meteo request error:", error)
        return {}

    except Exception as error:
        print("Weather processing error:", error)
        return {}


# ============================================================
# GET WEATHER FOR ENTIRE GRID
# ============================================================

def get_weather_for_grid(cells):
    current_time = time.time()

    if (
        weather_cache["data"]
        and current_time - weather_cache["timestamp"]
        < WEATHER_CACHE_SECONDS
    ):
        print("Using cached weather data.")
        return weather_cache["data"]

    print(
        f"Fetching weather for {len(cells)} monitoring cells..."
    )

    weather_data = {}

    for start in range(
        0,
        len(cells),
        WEATHER_BATCH_SIZE,
    ):
        batch = cells[
            start:start + WEATHER_BATCH_SIZE
        ]

        print(
            f"Weather batch {start + 1}-"
            f"{start + len(batch)}"
        )

        batch_data = fetch_weather_batch(batch)
        weather_data.update(batch_data)

    if weather_data:
        weather_cache["timestamp"] = current_time
        weather_cache["data"] = weather_data

    return weather_data


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "system": "SAHAYA-LAND",
        "status": "online",
        "version": "5.0",
        "message": "Landslide Intelligence API is running",
    }


# ============================================================
# STATUS
# ============================================================

@app.get("/api/status")
def status():
    return {
        "system": "SAHAYA-LAND",
        "status": "online",
        "version": "5.0",
        "region": "North Eastern Region",
        "ner_states": NER_STATES,
        "weather_source": "Open-Meteo",
        "weather_mode": "Batched",
        "weather_cache": "15 minutes",
        "grid_step": f"{GRID_STEP} degree",
        "soil_moisture": "Prototype",
        "slope": "Prototype",
        "ground_movement": "Prototype",
        "risk_model": "Weighted prototype model",
    }


# ============================================================
# GRID INFO
# ============================================================

@app.get("/api/grid-info")
def grid_info():
    cells = generate_monitoring_grid()

    return {
        "success": True,
        "region": "North Eastern Region",
        "states": NER_STATES,
        "monitoring_cells": len(cells),
        "grid_spacing": f"{GRID_STEP} degree",
        "weather": "Live",
        "weather_request_mode": "Batched",
        "soil_moisture": "Prototype",
        "slope": "Prototype",
        "ground_movement": "Prototype",
    }


# ============================================================
# RISK ZONES
# ============================================================

@app.get("/api/risk-zones")
def get_risk_zones():
    grid = generate_monitoring_grid()
    weather_data = get_weather_for_grid(grid)

    results = []

    live_weather_count = 0
    failed_weather_count = 0

    for cell in grid:
        cell_id = cell["id"]
        latitude = cell["latitude"]
        longitude = cell["longitude"]

        state_name = cell.get(
            "state",
            "North Eastern Region",
        )

        weather = weather_data.get(cell_id)

        if weather:
            live_weather_count += 1

            rainfall_mm = weather["rainfall_mm"]
            rainfall = rainfall_to_score(rainfall_mm)

            temperature = weather["temperature"]
            humidity = weather["humidity"]

            weather_time = weather["time"]
            weather_source = weather["source"]

        else:
            failed_weather_count += 1

            rainfall_mm = 0
            rainfall = 0
            temperature = None
            humidity = None
            weather_time = None
            weather_source = "Unavailable"

        soil_moisture = estimate_soil_moisture(
            latitude,
            longitude,
        )

        slope = estimate_slope(
            latitude,
            longitude,
        )

        ground_movement = estimate_ground_movement(
            latitude,
            longitude,
        )

        risk, level = calculate_risk(
            rainfall=rainfall,
            soil_moisture=soil_moisture,
            slope=slope,
            ground_movement=ground_movement,
        )

        reason = generate_reason(
            rainfall=rainfall,
            soil_moisture=soil_moisture,
            slope=slope,
            ground_movement=ground_movement,
        )

        risk_change = calculate_risk_change(
            rainfall=rainfall,
            soil_moisture=soil_moisture,
            ground_movement=ground_movement,
        )

        trend = get_risk_trend(risk_change)

        emergency_priority = calculate_emergency_priority(
            risk=risk,
            rainfall=rainfall,
            ground_movement=ground_movement,
        )

        data_quality = generate_data_quality(
            live_weather_available=bool(weather)
        )

        confidence = calculate_confidence(data_quality)

        nearby_assets = generate_nearby_assets(
            latitude=latitude,
            longitude=longitude,
            state_name=state_name,
        )

        places = STATE_PLACES.get(
            state_name,
            [state_name],
        )

        place_index = (
            abs(
                int(latitude * 100)
                + int(longitude * 100)
            )
            % len(places)
        )

        place_name = places[place_index]

        results.append(
            {
                "id": cell_id,
                "latitude": latitude,
                "longitude": longitude,
                "state": state_name,
                "place": place_name,
                "risk": risk,
                "level": level,
                "reason": reason,
                "rainfall": rainfall,
                "rainfall_mm": rainfall_mm,
                "soil_moisture": soil_moisture,
                "slope": slope,
                "ground_movement": ground_movement,
                "temperature": temperature,
                "humidity": humidity,
                "weather_time": weather_time,
                "weather_source": weather_source,
                "confidence": confidence,
                "trend": trend,
                "risk_change": risk_change,
                "emergency_priority": emergency_priority,
                "nearby_villages": nearby_assets["nearby_villages"],
                "nearby_schools": nearby_assets["nearby_schools"],
                "nearby_hospitals": nearby_assets["nearby_hospitals"],
                "nearby_roads": nearby_assets["nearby_roads"],
                "data_quality": data_quality,
                "last_updated": weather_time,
            }
        )

    critical = 0
    high = 0
    moderate = 0
    low = 0

    for zone in results:
        if zone["level"] == "Critical":
            critical += 1
        elif zone["level"] == "High":
            high += 1
        elif zone["level"] == "Moderate":
            moderate += 1
        else:
            low += 1

    return {
        "success": True,
        "region": "North Eastern Region",
        "states": NER_STATES,
        "count": len(results),
        "total_cells": len(results),
        "live_weather": live_weather_count > 0,
        "live_weather_cells": live_weather_count,
        "failed_weather_cells": failed_weather_count,
        "weather_cache": "15 minutes",
        "risk_summary": {
            "critical": critical,
            "high": high,
            "moderate": moderate,
            "low": low,
        },
        "zones": results,
    }


# ============================================================
# SINGLE ZONE
# ============================================================

@app.get("/api/risk-zones/{zone_id}")
def get_single_risk_zone(zone_id: str):
    response = get_risk_zones()

    for zone in response["zones"]:
        if zone["id"] == zone_id:
            return {
                "success": True,
                "zone": zone,
            }

    return {
        "success": False,
        "message": "Risk zone not found",
        "zone_id": zone_id,
    }


# ============================================================
# STATE SUMMARY
# ============================================================

@app.get("/api/state-summary")
def get_state_summary():
    response = get_risk_zones()

    zones = response["zones"]
    summaries = []

    for state_name in NER_STATES:
        state_zones = [
            zone
            for zone in zones
            if zone["state"] == state_name
        ]

        if not state_zones:
            continue

        average_risk = round(
            sum(zone["risk"] for zone in state_zones)
            / len(state_zones)
        )

        critical_count = sum(
            1
            for zone in state_zones
            if zone["level"] == "Critical"
        )

        high_count = sum(
            1
            for zone in state_zones
            if zone["level"] == "High"
        )

        summaries.append(
            {
                "state": state_name,
                "total_zones": len(state_zones),
                "average_risk": average_risk,
                "critical_zones": critical_count,
                "high_zones": high_count,
            }
        )

    return {
        "success": True,
        "states": summaries,
    }


# ============================================================
# ALERTS
# ============================================================

@app.get("/api/alerts")
def get_alerts():
    response = get_risk_zones()
    zones = response["zones"]

    alerts = []

    for zone in zones:
        if zone["level"] in ["Critical", "High"]:
            alerts.append(
                {
                    "id": zone["id"],
                    "state": zone["state"],
                    "place": zone["place"],
                    "level": zone["level"],
                    "risk": zone["risk"],
                    "reason": zone["reason"],
                    "priority": zone["emergency_priority"],
                    "trend": zone["trend"],
                }
            )

    alerts.sort(
        key=lambda alert: alert["priority"],
        reverse=True,
    )

    return {
        "success": True,
        "count": len(alerts),
        "alerts": alerts,
    }


# ============================================================
# RISK SIMULATOR
# ============================================================

@app.get("/api/simulator/{zone_id}")
def simulate_zone(zone_id: str):
    response = get_risk_zones()
    zones = response["zones"]

    for zone in zones:
        if zone["id"] != zone_id:
            continue

        simulated_rainfall = min(
            100,
            zone["rainfall"] + 15,
        )

        simulated_soil_moisture = min(
            100,
            zone["soil_moisture"] + 12,
        )

        simulated_ground_movement = min(
            100,
            zone["ground_movement"] + 10,
        )

        simulated_risk, simulated_level = calculate_risk(
            rainfall=simulated_rainfall,
            soil_moisture=simulated_soil_moisture,
            slope=zone["slope"],
            ground_movement=simulated_ground_movement,
        )

        return {
            "success": True,
            "zone_id": zone["id"],
            "state": zone["state"],
            "place": zone["place"],
            "current_risk": zone["risk"],
            "simulated_risk": simulated_risk,
            "risk_increase": round(
                simulated_risk - zone["risk"],
                2,
            ),
            "current_level": zone["level"],
            "simulated_level": simulated_level,
            "current_rainfall": zone["rainfall"],
            "simulated_rainfall": simulated_rainfall,
            "current_soil_moisture": zone["soil_moisture"],
            "simulated_soil_moisture": simulated_soil_moisture,
            "current_ground_movement": zone["ground_movement"],
            "simulated_ground_movement": simulated_ground_movement,
        }

    return {
        "success": False,
        "message": "Risk zone not found",
        "zone_id": zone_id,
    }