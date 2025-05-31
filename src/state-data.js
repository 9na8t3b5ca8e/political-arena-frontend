// state-data.js
const stateData = {
    'Alabama': { economic: 6, social: 6, region: 'South', houseSeats: 7, electoralVotes: 9 },
    'Alaska': { economic: 5, social: 5, region: 'West', houseSeats: 1, electoralVotes: 3 },
    'Arizona': { economic: 5, social: 4, region: 'Southwest', houseSeats: 9, electoralVotes: 11 },
    'Arkansas': { economic: 6, social: 6, region: 'South', houseSeats: 4, electoralVotes: 6 },
    'California': { economic: 2, social: 2, region: 'West', houseSeats: 52, electoralVotes: 54 },
    'Colorado': { economic: 3, social: 3, region: 'West', houseSeats: 8, electoralVotes: 10 },
    'Connecticut': { economic: 3, social: 2, region: 'Northeast', houseSeats: 5, electoralVotes: 7 },
    'Delaware': { economic: 3, social: 3, region: 'Northeast', houseSeats: 1, electoralVotes: 3 },
    'District of Columbia': { economic: 2, social: 2, region: 'Northeast', houseSeats: 0, electoralVotes: 3, isDistrict: true },
    'Florida': { economic: 5, social: 5, region: 'South', houseSeats: 28, electoralVotes: 30 },
    'Georgia': { economic: 4, social: 5, region: 'South', houseSeats: 14, electoralVotes: 16 },
    'Hawaii': { economic: 2, social: 2, region: 'West', houseSeats: 2, electoralVotes: 4 },
    'Idaho': { economic: 6, social: 6, region: 'West', houseSeats: 2, electoralVotes: 4 },
    'Illinois': { economic: 3, social: 3, region: 'Midwest', houseSeats: 17, electoralVotes: 19 },
    'Indiana': { economic: 5, social: 5, region: 'Midwest', houseSeats: 9, electoralVotes: 11 },
    'Iowa': { economic: 4, social: 4, region: 'Midwest', houseSeats: 4, electoralVotes: 6 },
    'Kansas': { economic: 5, social: 5, region: 'Midwest', houseSeats: 4, electoralVotes: 6 },
    'Kentucky': { economic: 5, social: 6, region: 'South', houseSeats: 6, electoralVotes: 8 },
    'Louisiana': { economic: 5, social: 6, region: 'South', houseSeats: 6, electoralVotes: 8 },
    'Maine': { economic: 3, social: 3, region: 'Northeast', houseSeats: 2, electoralVotes: 4 },
    'Maryland': { economic: 3, social: 2, region: 'Northeast', houseSeats: 8, electoralVotes: 10 },
    'Massachusetts': { economic: 2, social: 2, region: 'Northeast', houseSeats: 9, electoralVotes: 11 },
    'Michigan': { economic: 4, social: 4, region: 'Midwest', houseSeats: 13, electoralVotes: 15 },
    'Minnesota': { economic: 3, social: 3, region: 'Midwest', houseSeats: 8, electoralVotes: 10 },
    'Mississippi': { economic: 6, social: 6, region: 'South', houseSeats: 4, electoralVotes: 6 },
    'Missouri': { economic: 5, social: 5, region: 'Midwest', houseSeats: 8, electoralVotes: 10 },
    'Montana': { economic: 5, social: 5, region: 'West', houseSeats: 2, electoralVotes: 4 },
    'Nebraska': { economic: 5, social: 5, region: 'Midwest', houseSeats: 3, electoralVotes: 5 },
    'Nevada': { economic: 4, social: 3, region: 'West', houseSeats: 4, electoralVotes: 6 },
    'New Hampshire': { economic: 4, social: 3, region: 'Northeast', houseSeats: 2, electoralVotes: 4 },
    'New Jersey': { economic: 3, social: 3, region: 'Northeast', houseSeats: 12, electoralVotes: 14 },
    'New Mexico': { economic: 3, social: 3, region: 'Southwest', houseSeats: 3, electoralVotes: 5 },
    'New York': { economic: 2, social: 2, region: 'Northeast', houseSeats: 26, electoralVotes: 28 },
    'North Carolina': { economic: 4, social: 5, region: 'South', houseSeats: 14, electoralVotes: 16 },
    'North Dakota': { economic: 5, social: 5, region: 'Midwest', houseSeats: 1, electoralVotes: 3 },
    'Ohio': { economic: 4, social: 4, region: 'Midwest', houseSeats: 15, electoralVotes: 17 },
    'Oklahoma': { economic: 6, social: 6, region: 'South', houseSeats: 5, electoralVotes: 7 },
    'Oregon': { economic: 2, social: 2, region: 'West', houseSeats: 6, electoralVotes: 8 },
    'Pennsylvania': { economic: 4, social: 4, region: 'Northeast', houseSeats: 17, electoralVotes: 19 },
    'Rhode Island': { economic: 3, social: 2, region: 'Northeast', houseSeats: 2, electoralVotes: 4 },
    'South Carolina': { economic: 5, social: 6, region: 'South', houseSeats: 7, electoralVotes: 9 },
    'South Dakota': { economic: 5, social: 5, region: 'Midwest', houseSeats: 1, electoralVotes: 3 },
    'Tennessee': { economic: 5, social: 6, region: 'South', houseSeats: 9, electoralVotes: 11 },
    'Texas': { economic: 5, social: 5, region: 'South', houseSeats: 38, electoralVotes: 40 },
    'Utah': { economic: 5, social: 5, region: 'West', houseSeats: 4, electoralVotes: 6 },
    'Vermont': { economic: 2, social: 2, region: 'Northeast', houseSeats: 1, electoralVotes: 3 },
    'Virginia': { economic: 4, social: 4, region: 'South', houseSeats: 11, electoralVotes: 13 },
    'Washington': { economic: 2, social: 2, region: 'West', houseSeats: 10, electoralVotes: 12 },
    'West Virginia': { economic: 5, social: 6, region: 'South', houseSeats: 2, electoralVotes: 4 },
    'Wisconsin': { economic: 4, social: 4, region: 'Midwest', houseSeats: 8, electoralVotes: 10 },
    'Wyoming': { economic: 6, social: 6, region: 'West', houseSeats: 1, electoralVotes: 3 }
};

const allStates = Object.keys(stateData);

// States only (excluding DC for certain operations like Governor/Senate elections)
const statesOnly = allStates.filter(state => !stateData[state].isDistrict);

export const stanceScale = [ // Ensure this is exported
    { value: 1, label: 'Far Left' }, { value: 2, label: 'Left' },
    { value: 3, label: 'Center-Left' }, { value: 4, label: 'Moderate' },
    { value: 5, label: 'Center-Right' }, { value: 6, label: 'Right' },
    { value: 7, label: 'Far Right' }
];

// UPDATED LINE: Use export instead of module.exports
export { stateData, allStates, statesOnly };
