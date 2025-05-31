// frontend/src/pages/MapPage.js
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom';
import { stateData, allStates } from '../state-data';

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Small states that are hard to click on mobile
const SMALL_STATES = ['Connecticut', 'Delaware', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont', 'District of Columbia'];

export default function MapPage() {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showStateList, setShowStateList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleStateClick = (stateName) => {
    navigate(`/state/${encodeURIComponent(stateName)}`);
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX + 15, y: event.clientY + 10 });
  };

  const filteredStates = allStates.filter(state => 
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group states by region for better organization
  const statesByRegion = filteredStates.reduce((acc, state) => {
    const region = stateData[state].region;
    if (!acc[region]) acc[region] = [];
    acc[region].push(state);
    return acc;
  }, {});

  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-xl" onMouseMove={handleMouseMove}>
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-bold text-blue-400">USA Political Map</h2>
        <button 
          onClick={() => setShowStateList(!showStateList)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-150"
        >
          {showStateList ? 'Hide List' : 'Show List'}
        </button>
      </div>
      
      <div className="flex gap-4">
        {/* Map Section */}
        <div className={`transition-all duration-300 ${showStateList ? 'w-2/3' : 'w-full'}`}>
          {tooltipContent && (
            <div 
                className="fixed bg-black text-white p-2 rounded text-xs shadow-lg"
                style={{ 
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                    pointerEvents: 'none',
                    zIndex: 1000
                }}
            >
                {tooltipContent}
            </div>
          )}
          
          <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const stateName = geo.properties.name;
                  const isSmallState = SMALL_STATES.includes(stateName);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(stateName)}
                      onMouseEnter={() => setTooltipContent(stateName)}
                      onMouseLeave={() => setTooltipContent('')}
                      style={{
                        default: { 
                          fill: isSmallState ? "#6366f1" : "#4b5563", // Highlight small states in purple
                          outline: "none" 
                        },
                        hover: { 
                          fill: "#60a5fa", 
                          outline: "none", 
                          cursor: "pointer",
                          stroke: "#ffffff",
                          strokeWidth: isSmallState ? 2 : 1
                        },
                        pressed: { fill: "#2563eb", outline: "none" },
                      }}
                      className="stroke-gray-900 stroke-1 transition-colors duration-150"
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          
          <div className="mt-2">
            <p className="text-center text-sm text-gray-400">Click on a state to view its details and active elections.</p>
            <p className="text-center text-xs text-purple-400 mt-1">
              <span className="inline-block w-3 h-3 bg-indigo-500 rounded mr-1"></span>
              Purple states are highlighted for easier mobile access
            </p>
          </div>
        </div>

        {/* State List Sidebar */}
        {showStateList && (
          <div className="w-1/3 bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            
            {Object.keys(statesByRegion).sort().map(region => (
              <div key={region} className="mb-4">
                <h3 className="text-blue-400 font-semibold text-sm mb-2">{region}</h3>
                <div className="space-y-1">
                  {statesByRegion[region].sort().map(state => {
                    const stateInfo = stateData[state];
                    const isSmallState = SMALL_STATES.includes(state);
                    
                    return (
                      <button
                        key={state}
                        onClick={() => handleStateClick(state)}
                        className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-150 ${
                          isSmallState ? 'bg-indigo-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{state}</span>
                          <div className="text-xs text-gray-400">
                            {stateInfo.electoralVotes} EV
                            {stateInfo.houseSeats > 0 && (
                              <span className="ml-1">• {stateInfo.houseSeats} House</span>
                            )}
                            {stateInfo.isDistrict && (
                              <span className="ml-1 text-purple-400">• DC</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}