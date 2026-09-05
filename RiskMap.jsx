import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const NER_CENTER = [25.5, 93.5];

const NER_STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
];

function getRiskColor(risk = 0) {
  if (risk >= 75) return "#dc2626";
  if (risk >= 50) return "#f59e0b";
  if (risk >= 25) return "#eab308";
  return "#16a34a";
}

function getRiskLabel(risk = 0) {
  if (risk >= 75) return "High";
  if (risk >= 50) return "Moderate";
  if (risk >= 25) return "Low";
  return "Safe";
}

function formatNumber(value, decimals = 1) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return number.toFixed(decimals);
}

function FitZones({ zones }) {
  const map = useMap();

  useEffect(() => {
    if (!zones || zones.length === 0) {
      map.setView(NER_CENTER, 6);
      return;
    }

    const validZones = zones.filter(
      (zone) =>
        Number.isFinite(Number(zone.latitude ?? zone.lat)) &&
        Number.isFinite(Number(zone.longitude ?? zone.lon))
    );

    if (validZones.length === 0) {
      map.setView(NER_CENTER, 6);
      return;
    }

    const bounds = validZones.map((zone) => [
      Number(zone.latitude ?? zone.lat),
      Number(zone.longitude ?? zone.lon),
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 8,
    });
  }, [zones, map]);

  return null;
}

function RiskLegend() {
  return (
    <div className="absolute bottom-5 left-5 z-[1000] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
      <p className="mb-3 text-sm font-bold text-slate-800">Risk level</p>

      <div className="space-y-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-600" />
          <span>High risk</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span>Moderate risk</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span>Low risk</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-600" />
          <span>Safe</span>
        </div>
      </div>
    </div>
  );
}

function ZonePopup({ zone }) {
  const risk = Number(zone.risk ?? 0);
  const riskColor = getRiskColor(risk);
  const riskLabel = zone.level || getRiskLabel(risk);

  return (
    <div className="min-w-[250px] text-slate-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">
            {zone.place || zone.state || "Risk zone"}
          </h3>

          <p className="text-xs text-slate-500">
            {zone.state || "North Eastern Region"}
          </p>
        </div>

        <span
          className="rounded-full px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: riskColor }}
        >
          {riskLabel}
        </span>
      </div>

      <div className="mb-3 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Risk score</span>
          <strong style={{ color: riskColor }}>
            {formatNumber(risk, 0)}%
          </strong>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(Math.max(risk, 0), 100)}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-blue-50 p-2">
          <p className="text-blue-600">Rainfall</p>
          <p className="font-bold text-blue-900">
            {formatNumber(zone.rainfall_mm ?? zone.rainfall, 1)} mm
          </p>
        </div>

        <div className="rounded-lg bg-cyan-50 p-2">
          <p className="text-cyan-600">Soil moisture</p>
          <p className="font-bold text-cyan-900">
            {formatNumber(zone.soil_moisture, 1)}%
          </p>
        </div>

        <div className="rounded-lg bg-orange-50 p-2">
          <p className="text-orange-600">Slope</p>
          <p className="font-bold text-orange-900">
            {formatNumber(zone.slope, 1)}°
          </p>
        </div>

        <div className="rounded-lg bg-purple-50 p-2">
          <p className="text-purple-600">Ground movement</p>
          <p className="font-bold text-purple-900">
            {formatNumber(zone.ground_movement, 1)} mm
          </p>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-200 pt-3 text-xs">
        <p className="mb-1">
          <strong>Trend:</strong> {zone.trend || "Stable"}
        </p>

        <p className="mb-1">
          <strong>Priority:</strong>{" "}
          {zone.emergency_priority || "Routine monitoring"}
        </p>

        <p>
          <strong>Reason:</strong>{" "}
          {zone.reason || "Environmental conditions are being monitored."}
        </p>
      </div>
    </div>
  );
}

export default function RiskMap({
  zones = [],
  selectedZone,
  onZoneSelect,
  onStateChange,
}) {
  const [selectedState, setSelectedState] = useState("All States");

  const filteredZones = useMemo(() => {
    if (selectedState === "All States") {
      return zones;
    }

    return zones.filter((zone) => zone.state === selectedState);
  }, [zones, selectedState]);

  function handleStateChange(event) {
    const nextState = event.target.value;

    setSelectedState(nextState);

    if (onStateChange) {
      onStateChange(nextState === "All States" ? null : nextState);
    }
  }

  function handleShowAll() {
    setSelectedState("All States");

    if (onStateChange) {
      onStateChange(null);
    }
  }

  function getZonePosition(zone) {
    return [
      Number(zone.latitude ?? zone.lat),
      Number(zone.longitude ?? zone.lon),
    ];
  }

  function isValidZone(zone) {
    const [latitude, longitude] = getZonePosition(zone);

    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  const validZones = filteredZones.filter(isValidZone);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute left-4 right-4 top-4 z-[1000] flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm font-bold text-slate-900">
            Live landslide risk map
          </p>

          <p className="text-xs text-slate-500">
            {validZones.length} monitoring zones displayed
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          <label
            htmlFor="risk-map-state"
            className="hidden text-xs font-semibold text-slate-600 sm:block"
          >
            State
          </label>

          <select
            id="risk-map-state"
            value={selectedState}
            onChange={handleStateChange}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="All States">All States</option>

            {NER_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {selectedState !== "All States" && (
            <button
              type="button"
              onClick={handleShowAll}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      <MapContainer
        center={NER_CENTER}
        zoom={6}
        scrollWheelZoom={true}
        className="h-[520px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitZones zones={validZones} />

        {validZones.map((zone) => {
          const [latitude, longitude] = getZonePosition(zone);
          const risk = Number(zone.risk ?? 0);
          const isSelected = selectedZone?.id === zone.id;
          const color = getRiskColor(risk);

          return (
            <CircleMarker
              key={zone.id ?? `${latitude}-${longitude}`}
              center={[latitude, longitude]}
              radius={isSelected ? 14 : 9}
              pathOptions={{
                color: isSelected ? "#111827" : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.95 : 0.75,
                weight: isSelected ? 4 : 2,
              }}
              eventHandlers={{
                click: () => {
                  if (onZoneSelect) {
                    onZoneSelect(zone);
                  }
                },
              }}
            >
              <Popup>
                <ZonePopup zone={zone} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <RiskLegend />

      {validZones.length === 0 && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-white/70">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-lg">
            <p className="font-semibold text-slate-800">
              No monitoring zones found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try selecting another state.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}