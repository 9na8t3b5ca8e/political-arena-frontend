// state-data.js
const stateData = {
    'Alabama': { economic: 6, social: 6, region: 'South' }, 'Alaska': { economic: 5, social: 5, region: 'West' },
    'Arizona': { economic: 5, social: 4, region: 'Southwest' }, 'Arkansas': { economic: 6, social: 6, region: 'South' },
    'California': { economic: 2, social: 2, region: 'West' }, 'Colorado': { economic: 3, social: 3, region: 'West' },
    'Connecticut': { economic: 3, social: 2, region: 'Northeast' }, 'Delaware': { economic: 3, social: 3, region: 'Northeast' },
    'Florida': { economic: 5, social: 5, region: 'South' }, 'Georgia': { economic: 4, social: 5, region: 'South' },
    'Hawaii': { economic: 2, social: 2, region: 'West' }, 'Idaho': { economic: 6, social: 6, region: 'West' },
    'Illinois': { economic: 3, social: 3, region: 'Midwest' }, 'Indiana': { economic: 5, social: 5, region: 'Midwest' },
    'Iowa': { economic: 4, social: 4, region: 'Midwest' }, 'Kansas': { economic: 5, social: 5, region: 'Midwest' },
    'Kentucky': { economic: 5, social: 6, region: 'South' }, 'Louisiana': { economic: 5, social: 6, region: 'South' },
    'Maine': { economic: 3, social: 3, region: 'Northeast' }, 'Maryland': { economic: 3, social: 2, region: 'Northeast' },
    'Massachusetts': { economic: 2, social: 2, region: 'Northeast' }, 'Michigan': { economic: 4, social: 4, region: 'Midwest' },
    'Minnesota': { economic: 3, social: 3, region: 'Midwest' }, 'Mississippi': { economic: 6, social: 6, region: 'South' },
    'Missouri': { economic: 5, social: 5, region: 'Midwest' }, 'Montana': { economic: 5, social: 5, region: 'West' },
    'Nebraska': { economic: 5, social: 5, region: 'Midwest' }, 'Nevada': { economic: 4, social: 3, region: 'West' },
    'New Hampshire': { economic: 4, social: 3, region: 'Northeast' }, 'New Jersey': { economic: 3, social: 3, region: 'Northeast' },
    'New Mexico': { economic: 3, social: 3, region: 'Southwest' }, 'New York': { economic: 2, social: 2, region: 'Northeast' },
    'North Carolina': { economic: 4, social: 5, region: 'South' }, 'North Dakota': { economic: 5, social: 5, region: 'Midwest' },
    'Ohio': { economic: 4, social: 4, region: 'Midwest' }, 'Oklahoma': { economic: 6, social: 6, region: 'South' },
    'Oregon': { economic: 2, social: 2, region: 'West' }, 'Pennsylvania': { economic: 4, social: 4, region: 'Northeast' },
    'Rhode Island': { economic: 3, social: 2, region: 'Northeast' }, 'South Carolina': { economic: 5, social: 6, region: 'South' },
    'South Dakota': { economic: 5, social: 5, region: 'Midwest' }, 'Tennessee': { economic: 5, social: 6, region: 'South' },
    'Texas': { economic: 5, social: 5, region: 'South' }, 'Utah': { economic: 5, social: 5, region: 'West' },
    'Vermont': { economic: 2, social: 2, region: 'Northeast' }, 'Virginia': { economic: 4, social: 4, region: 'South' },
    'Washington': { economic: 2, social: 2, region: 'West' }, 'West Virginia': { economic: 5, social: 6, region: 'South' },
    'Wisconsin': { economic: 4, social: 4, region: 'Midwest' }, 'Wyoming': { economic: 6, social: 6, region: 'West' }
};
const allStates = Object.keys(stateData);

export const stanceScale = [ // Ensure this is exported
    { value: 1, label: 'Far Left' }, { value: 2, label: 'Left' },
    { value: 3, label: 'Center-Left' }, { value: 4, label: 'Moderate' },
    { value: 5, label: 'Center-Right' }, { value: 6, label: 'Right' },
    { value: 7, label: 'Far Right' }
];

// UPDATED LINE: Use export instead of module.exports
export { stateData, allStates };
