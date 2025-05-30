import React from 'react';
import { Crown, Shield, DollarSign, Building2 } from 'lucide-react';

const PositionBadge = ({ position, office, party }) => {
    const getBadgeInfo = () => {
        // Party Leadership Badges - but not for Independent since it's not a real party
        if (position === 'chair' && party !== 'Independent') {
            return {
                icon: Crown,
                label: `${party} Chair`,
                bgColor: 'bg-purple-600',
                textColor: 'text-white',
                borderColor: 'border-purple-400'
            };
        }
        
        if (position === 'vice_chair' && party !== 'Independent') {
            return {
                icon: Crown,
                label: `${party} Vice Chair`,
                bgColor: 'bg-purple-500',
                textColor: 'text-white',
                borderColor: 'border-purple-300'
            };
        }
        
        if (position === 'treasurer' && party !== 'Independent') {
            return {
                icon: DollarSign,
                label: `${party} Treasurer`,
                bgColor: 'bg-green-600',
                textColor: 'text-white',
                borderColor: 'border-green-400'
            };
        }
        
        // Elected Office Badges
        if (office && office !== 'Citizen') {
            if (office === 'Governor') {
                return {
                    icon: Building2,
                    label: office,
                    bgColor: 'bg-blue-600',
                    textColor: 'text-white',
                    borderColor: 'border-blue-400'
                };
            }
            
            if (office.includes('Senator')) {
                return {
                    icon: Shield,
                    label: office,
                    bgColor: 'bg-red-600',
                    textColor: 'text-white',
                    borderColor: 'border-red-400'
                };
            }
            
            if (office === 'House Representative') {
                return {
                    icon: Building2,
                    label: 'US Representative',
                    bgColor: 'bg-orange-600',
                    textColor: 'text-white',
                    borderColor: 'border-orange-400'
                };
            }
            
            // Fallback for other offices
            return {
                icon: Shield,
                label: office,
                bgColor: 'bg-gray-600',
                textColor: 'text-white',
                borderColor: 'border-gray-400'
            };
        }
        
        return null;
    };

    const badgeInfo = getBadgeInfo();
    
    if (!badgeInfo) return null;
    
    const { icon: Icon, label, bgColor, textColor, borderColor } = badgeInfo;

    return (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${bgColor} ${textColor} ${borderColor} shadow-sm`}>
            <Icon size={12} className="mr-1" />
            {label}
        </div>
    );
};

export default PositionBadge; 