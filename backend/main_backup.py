from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import requests
import math
import time


# ============================================================
# SAHAYA-LAND
# ============================================================

app = FastAPI(
    title="SAHAYA-LAND API",
    description="AI-Based Landslide Risk Monitoring System",
    version="3.1"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
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
    "max_lon": 97.5
}


# Keep this at 1.0 for now.
GRID_STEP = 1.0


# Open-Meteo batch size.
WEATHER_BATCH_SIZE = 50


# Weather cache = 15 minutes.
WEATHER_CACHE_SECONDS = 900


# API timeout.
WEATHER_TIMEOUT = 8


# ============================================================
# WEATHER CACHE
# ============================================================

weather_cache = {
    "timestamp": 0,
    "data": {}
}


# ============================================================
# RISK ENGINE
# ============================================================

def calculate_risk(
    rainfall,
    soil_moisture,
    slope
):

    rainfall_score = rainfall * 0.40

    soil_score = soil_moisture * 0.35

    slope_score = slope * 0.25

    risk_score = (
        rainfall_score
        + soil_score
        + slope_score
    )

    risk_score = round(risk_score)

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
    slope
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


    if not reasons:

        return (
            "environmental conditions "
            "currently stable"
        )


    return " + ".join(reasons)


# ============================================================
# RAINFALL NORMALIZATION
# ============================================================

def rainfall_to_score(
    rainfall_mm
):

    """
    Prototype normalization.

    NOT a scientifically validated
    landslide probability model.
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

def estimate_soil_moisture(
    latitude,
    longitude
):

    """
    TEMPORARY PROTOTYPE VALUE.

    Replace later with real soil-moisture data.
    """

    value = (

        50

        + 25 * math.sin(
            math.radians(
                latitude * 4
            )
        )

        + 15 * math.cos(
            math.radians(
                longitude * 3
            )
        )

    )

    return round(
        max(
            10,
            min(
                95,
                value
            )
        )
    )


# ============================================================
# PROTOTYPE SLOPE
# ============================================================

def estimate_slope(
    latitude,
    longitude
):

    """
    TEMPORARY PROTOTYPE VALUE.

    Replace later with real DEM-derived slope.
    """

    value = (

        45

        + 35 * math.sin(
            math.radians(
                latitude * 6
            )
        )

        + 20 * math.cos(
            math.radians(
                longitude * 4
            )
        )

    )

    return round(
        max(
            5,
            min(
                95,
                value
            )
        )
    )


# ============================================================
# GENERATE MONITORING GRID
# ============================================================

def generate_monitoring_grid():

    cells = []

    cell_number = 1

    latitude = NER_BOUNDS["min_lat"]


    while latitude <= NER_BOUNDS["max_lat"]:

        longitude = NER_BOUNDS["min_lon"]


        while longitude <= NER_BOUNDS["max_lon"]:

            cells.append({

                "id":
                    f"Cell-{cell_number:04d}",

                "latitude":
                    round(
                        latitude,
                        4
                    ),

                "longitude":
                    round(
                        longitude,
                        4
                    )

            })


            cell_number += 1

            longitude += GRID_STEP


        latitude += GRID_STEP


    return cells


# ============================================================
# FETCH BATCH WEATHER
# ============================================================

def fetch_weather_batch(
    batch
):

    if not batch:
        return {}


    latitudes = ",".join(
        str(
            cell["latitude"]
        )
        for cell in batch
    )


    longitudes = ",".join(
        str(
            cell["longitude"]
        )
        for cell in batch
    )


    url = (
        "https://api.open-meteo.com/"
        "v1/forecast"
    )


    params = {

        "latitude":
            latitudes,

        "longitude":
            longitudes,

        "current":
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain",

        "timezone":
            "auto"

    }


    try:

        response = requests.get(
            url,
            params=params,
            timeout=WEATHER_TIMEOUT
        )


        response.raise_for_status()


        data = response.json()


        # Open-Meteo returns a list when
        # multiple coordinates are requested.

        if isinstance(
            data,
            dict
        ):

            weather_results = [
                data
            ]

        else:

            weather_results = data


        results = {}


        for index, cell in enumerate(
            batch
        ):

            if index >= len(
                weather_results
            ):
                continue


            weather = weather_results[
                index
            ]


            current = weather.get(
                "current",
                {}
            )


            rain = float(
                current.get(
                    "rain",
                    0
                ) or 0
            )


            precipitation = float(
                current.get(
                    "precipitation",
                    0
                ) or 0
            )


            if (
                rain <= 0
                and precipitation > 0
            ):

                rain = precipitation


            results[
                cell["id"]
            ] = {

                "rainfall_mm":
                    rain,

                "temperature":
                    current.get(
                        "temperature_2m"
                    ),

                "humidity":
                    current.get(
                        "relative_humidity_2m"
                    ),

                "time":
                    current.get(
                        "time"
                    ),

                "source":
                    "Open-Meteo"

            }


        return results


    except requests.exceptions.Timeout:

        print(
            "Open-Meteo request timed out."
        )

        return {}


    except requests.exceptions.RequestException as error:

        print(
            "Open-Meteo request error:",
            error
        )

        return {}


    except Exception as error:

        print(
            "Weather processing error:",
            error
        )

        return {}


# ============================================================
# GET WEATHER FOR ENTIRE GRID
# ============================================================

def get_weather_for_grid(
    cells
):

    current_time = time.time()


    # --------------------------------------------------------
    # Cache
    # --------------------------------------------------------

    if (
        weather_cache["data"]
        and
        (
            current_time
            -
            weather_cache["timestamp"]
        )
        <
        WEATHER_CACHE_SECONDS
    ):

        print(
            "Using cached weather data."
        )

        return weather_cache["data"]


    print(
        f"Fetching weather for "
        f"{len(cells)} monitoring cells..."
    )


    weather_data = {}


    # --------------------------------------------------------
    # Batch requests
    # --------------------------------------------------------

    for start in range(
        0,
        len(cells),
        WEATHER_BATCH_SIZE
    ):

        batch = cells[
            start:
            start + WEATHER_BATCH_SIZE
        ]


        print(
            f"Weather batch "
            f"{start + 1}-"
            f"{start + len(batch)}"
        )


        batch_data = fetch_weather_batch(
            batch
        )


        weather_data.update(
            batch_data
        )


    # --------------------------------------------------------
    # Update cache only if we received data
    # --------------------------------------------------------

    if weather_data:

        weather_cache[
            "timestamp"
        ] = current_time


        weather_cache[
            "data"
        ] = weather_data


    return weather_data


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {

        "system":
            "SAHAYA-LAND",

        "status":
            "online",

        "version":
            "3.1",

        "message":
            "Landslide Intelligence API is running"

    }


# ============================================================
# STATUS
# ============================================================

@app.get("/api/status")
def status():

    return {

        "system":
            "SAHAYA-LAND",

        "status":
            "online",

        "version":
            "3.1",

        "weather_source":
            "Open-Meteo",

        "weather_mode":
            "Batched",

        "weather_cache":
            "15 minutes",

        "grid_step":
            f"{GRID_STEP} degree",

        "soil_moisture":
            "Prototype",

        "slope":
            "Prototype",

        "risk_model":
            "Weighted prototype model"

    }


# ============================================================
# GRID INFO
# ============================================================

@app.get("/api/grid-info")
def grid_info():

    cells = generate_monitoring_grid()


    return {

        "success":
            True,

        "region":
            "North Eastern Region",

        "monitoring_cells":
            len(cells),

        "grid_spacing":
            f"{GRID_STEP} degree",

        "weather":
            "Live",

        "weather_request_mode":
            "Batched",

        "soil_moisture":
            "Prototype",

        "slope":
            "Prototype"

    }


# ============================================================
# RISK ZONES
# ============================================================

@app.get("/api/risk-zones")
def get_risk_zones():

    # --------------------------------------------------------
    # Generate monitoring cells
    # --------------------------------------------------------

    grid = generate_monitoring_grid()


    # --------------------------------------------------------
    # Get weather
    # --------------------------------------------------------

    weather_data = get_weather_for_grid(
        grid
    )


    results = []


    live_weather_count = 0

    failed_weather_count = 0


    # --------------------------------------------------------
    # Process every cell
    # --------------------------------------------------------

    for cell in grid:

        cell_id = cell[
            "id"
        ]

        latitude = cell[
            "latitude"
        ]

        longitude = cell[
            "longitude"
        ]


        # ----------------------------------------------------
        # Weather
        # ----------------------------------------------------

        weather = weather_data.get(
            cell_id
        )


        if weather:

            live_weather_count += 1


            rainfall_mm = (
                weather[
                    "rainfall_mm"
                ]
            )


            rainfall = rainfall_to_score(
                rainfall_mm
            )


            temperature = (
                weather[
                    "temperature"
                ]
            )


            humidity = (
                weather[
                    "humidity"
                ]
            )


            weather_time = (
                weather[
                    "time"
                ]
            )


            weather_source = (
                weather[
                    "source"
                ]
            )


        else:

            failed_weather_count += 1


            rainfall_mm = 0

            rainfall = 0

            temperature = None

            humidity = None

            weather_time = None

            weather_source = (
                "Unavailable"
            )


        # ----------------------------------------------------
        # Terrain
        # ----------------------------------------------------

        soil_moisture = (
            estimate_soil_moisture(
                latitude,
                longitude
            )
        )


        slope = (
            estimate_slope(
                latitude,
                longitude
            )
        )


        # ----------------------------------------------------
        # Risk
        # ----------------------------------------------------

        risk, level = calculate_risk(

            rainfall,

            soil_moisture,

            slope

        )


        # ----------------------------------------------------
        # Explanation
        # ----------------------------------------------------

        reason = generate_reason(

            rainfall,

            soil_moisture,

            slope

        )


        # ----------------------------------------------------
        # Output
        # ----------------------------------------------------

        results.append({

            "id":
                cell_id,

            "latitude":
                latitude,

            "longitude":
                longitude,

            "place":
                "North Eastern Region",

            "risk":
                risk,

            "level":
                level,

            "reason":
                reason,

            "rainfall":
                rainfall,

            "rainfall_mm":
                rainfall_mm,

            "soil_moisture":
                soil_moisture,

            "slope":
                slope,

            "temperature":
                temperature,

            "humidity":
                humidity,

            "weather_time":
                weather_time,

            "weather_source":
                weather_source

        })


    # ========================================================
    # SUMMARY
    # ========================================================

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


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "success":
            True,

        "region":
            "North Eastern Region",

        "count":
            len(results),

        "total_cells":
            len(results),

        "live_weather":
            live_weather_count > 0,

        "live_weather_cells":
            live_weather_count,

        "failed_weather_cells":
            failed_weather_count,

        "weather_cache":
            "15 minutes",

        "risk_summary": {

            "critical":
                critical,

            "high":
                high,

            "moderate":
                moderate,

            "low":
                low

        },

        "zones":
            results

    }