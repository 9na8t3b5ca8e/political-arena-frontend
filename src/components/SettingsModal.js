import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { AlertTriangle, Mail, Clock, Check } from 'lucide-react';

const TIMEZONE_OPTIONS = [
    'Auto-detect',
    // === AFRICA ===
    'Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmara',
    'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre',
    'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta',
    'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala',
    'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg',
    'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa',
    'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi',
    'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane',
    'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey',
    'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli',
    'Africa/Tunis', 'Africa/Windhoek',

    // === AMERICA (North & South) ===
    'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina',
    'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca', 'America/Argentina/Cordoba',
    'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza',
    'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan',
    'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia',
    'America/Aruba', 'America/Asuncion', 'America/Atikokan', 'America/Bahia', 'America/Bahia_Banderas',
    'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista',
    'America/Bogota', 'America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun',
    'America/Caracas', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua',
    'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn',
    'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica',
    'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza',
    'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada',
    'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax',
    'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox',
    'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay',
    'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit',
    'America/Jamaica', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello',
    'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Lower_Princes',
    'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique',
    'America/Matamoros', 'America/Mazatlan', 'America/Menominee', 'America/Merida', 'America/Metlakatla',
    'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo',
    'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome',
    'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem',
    'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix',
    'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico',
    'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina',
    'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo',
    'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns',
    'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current',
    'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay', 'America/Tijuana', 'America/Toronto',
    'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat',
    'America/Yellowknife',

    // === ANTARCTICA ===
    'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie',
    'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera',
    'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok',

    // === ARCTIC ===
    'Arctic/Longyearbyen',

    // === ASIA ===
    'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe',
    'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok',
    'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Chita', 'Asia/Choibalsan',
    'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe',
    'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd',
    'Asia/Irkutsk', 'Asia/Istanbul', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul',
    'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk',
    'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar',
    'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk',
    'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qyzylorda',
    'Asia/Riyadh', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore',
    'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu',
    'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane',
    'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon', 'Asia/Yekaterinburg', 'Asia/Yerevan',

    // === ATLANTIC ===
    'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faroe',
    'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley',

    // === AUSTRALIA ===
    'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Currie',
    'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe',
    'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney',

    // === EUROPE ===
    'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade',
    'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest',
    'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar',
    'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey',
    'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana',
    'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn',
    'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica',
    'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo',
    'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm',
    'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vaduz',
    'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw',
    'Europe/Zagreb', 'Europe/Zaporozhye', 'Europe/Zurich',

    // === INDIAN ===
    'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro',
    'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte',
    'Indian/Reunion',

    // === PACIFIC ===
    'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Chuuk',
    'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji',
    'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam',
    'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro',
    'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk',
    'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Pohnpei',
    'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa',
    'Pacific/Tongatapu', 'Pacific/Wake', 'Pacific/Wallis'
];

export default function SettingsModal({ isOpen, onClose, onSuccess, onError, userEmail, currentUser, setCurrentUser }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [timezone, setTimezone] = useState('Auto-detect');
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('account');

    useEffect(() => {
        if (isOpen) {
            // Load timezone: prioritize from user object, then localStorage, then default
            const userTimezone = currentUser?.preferences?.timezone;
            const savedTimezone = localStorage.getItem('userTimezone');
            setTimezone(userTimezone || savedTimezone || 'Auto-detect');
            
            // Reset states
            setModalError('');
            setModalSuccess('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            if (activeTab !== 'account') setActiveTab('account'); // Default to account tab
        }
    }, [isOpen, currentUser]); // Add currentUser dependency

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');
        
        if (newPassword !== confirmNewPassword) {
            const errMsg = "New passwords do not match.";
            setModalError(errMsg);
            if (onError) onError(errMsg);
            return;
        }
        if (newPassword.length < 6) {
            const errMsg = "New password must be at least 6 characters long.";
            setModalError(errMsg);
            if (onError) onError(errMsg);
            return;
        }

        setLoading(true);
        try {
            const response = await apiCall('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const successMsg = response.message || "Password changed successfully!";
            setModalSuccess(successMsg);
            if (onSuccess) onSuccess(successMsg);
            setCurrentPassword(''); 
            setNewPassword(''); 
            setConfirmNewPassword('');
        } catch (err) {
            const errorMessage = err.message || "Failed to change password.";
            setModalError(errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleTimezoneSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');
        setLoading(true);

        try {
            // Save timezone preference to backend
            await apiCall('/user/preferences/timezone', { // Assuming endpoint like this
                method: 'PUT', // Or POST, depending on backend API design
                body: JSON.stringify({ timezone }),
            });
            
            // Update localStorage as a fallback or for immediate local reflection
            localStorage.setItem('userTimezone', timezone);
            
            // Update AuthContext/currentUser state
            if (currentUser && setCurrentUser) {
                setCurrentUser({
                    ...currentUser,
                    preferences: {
                        ...currentUser.preferences,
                        timezone: timezone,
                    },
                });
            }
            const successMsg = "Timezone preference saved successfully!";
            setModalSuccess(successMsg);
            if (onSuccess) onSuccess(successMsg);

        } catch (err) {
            const errorMessage = err.message || "Failed to save timezone preference.";
            setModalError(errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getTimezoneLabel = (tz) => {
        if (tz === 'Auto-detect') return 'Auto-detect (Browser)';
        
        const labelMap = {
            'America/New_York': 'Eastern Time (New York)',
            'America/Chicago': 'Central Time (Chicago)',
            'America/Denver': 'Mountain Time (Denver)',
            'America/Los_Angeles': 'Pacific Time (Los Angeles)',
            'America/Anchorage': 'Alaska Time (Anchorage)',
            'Pacific/Honolulu': 'Hawaii Time (Honolulu)',
            'America/Phoenix': 'Arizona Time (Phoenix)',
            'Europe/London': 'GMT (London)',
            'Europe/Berlin': 'CET (Berlin)',
            'Asia/Tokyo': 'JST (Tokyo)',
            'Asia/Shanghai': 'CST (Shanghai)',
            'Australia/Sydney': 'AEDT (Sydney)',
        };
        
        return labelMap[tz] || tz.replace(/_/g, ' ').replace('/', ' / ');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-blue-300 mb-4">Account Settings</h2>
                
                {modalError && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm mb-4 flex items-center"><AlertTriangle size={16} className="mr-2"/>{modalError}</p>}
                {modalSuccess && <p className="bg-green-500/20 text-green-300 p-3 rounded text-sm mb-4 flex items-center"><Check size={16} className="mr-2"/>{modalSuccess}</p>}

                {/* Tab Navigation */}
                <div className="flex mb-6 border-b border-gray-700">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'account' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'preferences' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        Preferences
                    </button>
                </div>

                {activeTab === 'account' && (
                    <>
                        {/* Display User Email */}
                        {userEmail && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Your Email</label>
                                <div className="flex items-center p-2 bg-gray-700/50 rounded border border-gray-600">
                                    <Mail size={16} className="mr-2 text-gray-400" />
                                    <span className="text-sm text-gray-200">{userEmail}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This email is not shown on your public profile.</p>
                            </div>
                        )}

                        {/* Separator */}
                        {userEmail && <hr className="border-gray-700 my-4" />}

                        <h3 className="text-lg font-semibold text-blue-300 mb-3">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded">
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {activeTab === 'preferences' && (
                    <>
                        <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                            <Clock size={18} className="mr-2" />
                            Timezone Settings
                        </h3>
                        <form onSubmit={handleTimezoneSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {TIMEZONE_OPTIONS.map(tz => (
                                        <option key={tz} value={tz}>
                                            {getTimezoneLabel(tz)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    All times throughout the site will be displayed in your selected timezone.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded">
                                    {loading && activeTab === 'preferences' ? 'Saving...' : 'Save Timezone'}
                                </button>
                            </div>
                        </form>

                        {/* Current time preview */}
                        <div className="mt-6 p-3 bg-gray-700/50 rounded border border-gray-600">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
                            <p className="text-sm text-gray-200">
                                Current time: {new Date().toLocaleString(undefined, {
                                    timeZone: timezone === 'Auto-detect' ? undefined : timezone,
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    timeZoneName: 'short'
                                })}
                            </p>
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={loading} 
                        className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
} 