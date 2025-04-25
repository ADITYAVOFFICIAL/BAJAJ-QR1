import React from 'react';

interface PlaceholderIconProps {
    initials?: string;
    className?: string; // Allow custom styling
}

/**
 * Simple placeholder icon component displaying initials or a question mark.
 * @param props - Component props.
 * @param props.initials - Optional initials to display.
 * @param props.className - Optional additional CSS classes for sizing/styling.
 */
export const PlaceholderIcon: React.FC<PlaceholderIconProps> = ({
    initials,
    className = "w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0" // Default styling
}) => (
    <div className={className}>
        {initials || '?'}
    </div>
);
