import React from 'react';
import { Building2, Shield, Users } from 'lucide-react';

const ElectoralHistory = ({ electoralHistory, gubernatorialHistory }) => {
    // Function to get icon for office type
    const getOfficeIcon = (office) => {
        if (office === 'Governor') return Building2;
        if (office.includes('Senator')) return Shield;
        if (office === 'House Representative') return Users;
        return Building2; // default
    };

    // Function to format office display name
    const formatOfficeName = (office) => {
        if (office === 'House Representative') return 'US Representative';
        return office;
    };

    // Function to render terms for a specific office and state
    const renderTerms = (office, state, stateData) => {
        const terms = [];
        
        // Add current term if exists
        if (stateData.current_term) {
            const term = stateData.current_term;
            const endDisplay = term.status === 'current' ? 'Present' : term.end_year;
            terms.push(
                <div key="current" className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                    <div className="text-sm font-medium text-blue-800">
                        {term.start_year} - {endDisplay}
                        {term.seat_class && ` (Class ${term.seat_class})`}
                        {term.seats > 1 && ` (${term.seats} seats)`}
                    </div>
                    <div className="text-xs text-blue-600 capitalize">{term.status}</div>
                </div>
            );
        }
        
        // Add previous terms
        if (stateData.previous_terms && stateData.previous_terms.length > 0) {
            stateData.previous_terms
                .sort((a, b) => b.start_year - a.start_year) // Most recent first
                .forEach((term, index) => {
                    terms.push(
                        <div key={`prev-${index}`} className="bg-gray-50 border border-gray-200 rounded p-2 mb-2">
                            <div className="text-sm text-gray-700">
                                {term.start_year} - {term.end_year}
                                {term.seat_class && ` (Class ${term.seat_class})`}
                                {term.seats > 1 && ` (${term.seats} seats)`}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">{term.status || 'completed'}</div>
                        </div>
                    );
                });
        }
        
        return terms;
    };

    // Combine electoral history with legacy gubernatorial history
    const combinedHistory = { ...electoralHistory };
    
    // If we have gubernatorial history but no electoral history for Governor, use the old format
    if (gubernatorialHistory && Object.keys(gubernatorialHistory).length > 0 && 
        (!combinedHistory.Governor || Object.keys(combinedHistory.Governor).length === 0)) {
        combinedHistory.Governor = {};
        
        Object.entries(gubernatorialHistory).forEach(([state, data]) => {
            if (data.terms_served > 0) {
                combinedHistory.Governor[state] = {
                    total_terms: data.terms_served,
                    current_term: null,
                    previous_terms: data.previous_terms || []
                };
            }
        });
    }

    const hasAnyHistory = Object.keys(combinedHistory).some(office => 
        Object.keys(combinedHistory[office] || {}).length > 0
    );

    if (!hasAnyHistory) {
        return (
            <div className="text-sm text-gray-500 italic">
                No electoral history to display.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Object.entries(combinedHistory).map(([office, statesData]) => {
                if (!statesData || Object.keys(statesData).length === 0) return null;
                
                const Icon = getOfficeIcon(office);
                
                return (
                    <div key={office} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center mb-2">
                            <Icon size={16} className="mr-2 text-blue-600" />
                            <h5 className="font-semibold text-gray-800">{formatOfficeName(office)}</h5>
                        </div>
                        
                        {Object.entries(statesData).map(([state, stateData]) => {
                            if (!stateData || (!stateData.current_term && (!stateData.previous_terms || stateData.previous_terms.length === 0))) {
                                return null;
                            }
                            
                            return (
                                <div key={`${office}-${state}`} className="mb-3 ml-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h6 className="font-medium text-gray-700">{state}</h6>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {stateData.total_terms || stateData.terms_served || 0} term{(stateData.total_terms || stateData.terms_served || 0) !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {renderTerms(office, state, stateData)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default ElectoralHistory; 