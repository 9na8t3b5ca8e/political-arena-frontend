// frontend/src/pages/MapPage.js
import React, { useState } from 'react'; // Removed useEffect and apiCall, as details are on StatePage
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom'; // IMPORT THIS

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function MapPage() {
  const [tooltipContent, setTooltipContent] = useState('');
  const navigate = useNavigate(); // INITIALIZE THIS

  const handleStateClick = (geo) => {
    const stateName = geo.properties.name;
    navigate(`/state/${encodeURIComponent(stateName)}`); // NAVIGATE HERE
  };

  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-blue-400 mb-4 px-2">USA Political Map</h2>
       {tooltipContent && <div className="absolute bg-black text-white p-2 rounded text-xs" style={{pointerEvents: 'none'}}>{tooltipContent}</div>}
      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleStateClick(geo)}
                onMouseEnter={() => setTooltipContent(geo.properties.name)}
                onMouseLeave={() => setTooltipContent('')}
                style={{
                  default: { fill: "#4b5563", outline: "none" }, // gray-600
                  hover: { fill: "#60a5fa", outline: "none", cursor: "pointer" }, // blue-400
                  pressed: { fill: "#2563eb", outline: "none" }, // blue-600
                }}
                className="stroke-gray-900 stroke-1 transition-colors duration-150"
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      <p className="text-center text-sm text-gray-400 mt-2">Click on a state to view its details and active elections.</p>
    </div>
  );
}