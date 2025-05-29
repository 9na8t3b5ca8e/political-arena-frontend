import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle2 } from 'lucide-react'; // Default icon

const PlayerDisplayName = ({ userId, firstName, lastName, profilePictureUrl, includePic = false, picSize = 'h-6 w-6', textClass = 'text-sm' }) => {
    if (!userId || !firstName || !lastName) {
        return <span className={textClass}>Vacant</span>; // Or some other placeholder
    }

    const displayName = `${firstName} ${lastName}`;

    return (
        <Link to={`/profile/${userId}`} className={`inline-flex items-center gap-2 hover:underline ${textClass}`}>
            {includePic && (
                profilePictureUrl ? (
                    <img src={profilePictureUrl} alt={displayName} className={`${picSize} rounded-full object-cover`} />
                ) : (
                    <UserCircle2 className={`${picSize} text-gray-400`} />
                )
            )}
            <span>{displayName}</span>
        </Link>
    );
};

export default PlayerDisplayName; 