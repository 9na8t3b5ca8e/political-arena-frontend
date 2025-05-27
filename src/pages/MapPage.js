// frontend/src/pages/MapPage.js
import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Annotation } from 'react-simple-maps';
import { apiCall } from '../api';

// URL to the TopoJSON file for US states
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function MapPage() {
  const [selectedState, setSelectedState] = useState(null);
  const [stateDetails, setStateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');

  const handleStateClick = async (geo) => {
    const stateName = geo.properties.name;
    setSelectedState(stateName);
    setLoadingDetails(true);
    setError('');
    setStateDetails(null); // Clear previous details

    try {
      // Use encodeURIComponent to handle state names with spaces, e.g., "New York"
      const data = await apiCall(`/states/${encodeURIComponent(stateName)}`);
      setStateDetails(data);
    } catch (err) {
      setError(`Failed to load data for ${stateName}: ${err.message}`);
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatTime = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return "Closed";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-gray-800 p-2 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-blue-400 mb-4 px-2">USA Political Map</h2>
        <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleStateClick(geo)}
                  style={{
                    default: { fill: selectedState === geo.properties.name ? "#3b82f6" : "#4b5563", outline: "none" }, // blue-500 or gray-600
                    hover: { fill: "#60a5fa", outline: "none", cursor: "pointer" }, // blue-400
                    pressed: { fill: "#2563eb", outline: "none" }, // blue-600
                  }}
                  className="stroke-gray-900 stroke-1 transition-colors duration-150"
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg shadow-xl">
        {selectedState ? (
          <>
            <h3 className="text-lg font-bold text-blue-300 mb-3">{selectedState}</h3>
            {loadingDetails && <p className="text-gray-400">Loading details...</p>}
            {error && <p className="text-red-400 bg-red-500/10 p-2 rounded">{error}</p>}
            {stateDetails && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">Party Strength (PSO):</h4>
                  <p className="text-gray-400">Democrat: {stateDetails.pso?.democrat || 'N/A'}</p>
                  <p className="text-gray-400">Republican: {stateDetails.pso?.republican || 'N/A'}</p>
                </div>

                {stateDetails.ideology && (
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-1">State Ideology:</h4>
                        <p className="text-gray-400">Economic: {stateDetails.ideology.economic} (1=Far Left, 7=Far Right)</p>
                        <p className="text-gray-400">Social: {stateDetails.ideology.social} (1=Far Left, 7=Far Right)</p>
                    </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">Active Elections ({stateDetails.active_elections?.length || 0}):</h4>
                  {stateDetails.active_elections?.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-400 space-y-1 max-h-48 overflow-y-auto">
                      {stateDetails.active_elections.map(election => (
                        <li key={election.id}>
                          {election.office} ({election.type}) - {election.status} ({formatTime(election.filing_deadline)})
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-gray-500">No active elections.</p>}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">Registered Politicians ({stateDetails.registered_politicians?.length || 0}):</h4>
                  {stateDetails.registered_politicians?.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-400 space-y-1 max-h-48 overflow-y-auto">
                      {stateDetails.registered_politicians.map(player => (
                        <li key={player.username}>{player.username} ({player.party}) - {player.current_office}</li>
                      ))}
                    </ul>
                  ) : <p className="text-gray-500">No registered politicians from this state.</p>}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-center py-10">Click on a state to view its political details.</p>
        )}
      </div>
    </div>
  );
}