import React from 'react';

type BadgeColor = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gold';

interface BadgeProps {
    label: string;
    color?: BadgeColor;
    className?: string;
}

export default function Badge({ label, color = 'blue', className = '' }: BadgeProps) {
    return (
        <span className={`badge badge-${color} ${className}`}>
            {label}
        </span>
    );
}
