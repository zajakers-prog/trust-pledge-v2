import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    size?: 'normal' | 'large';
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'normal',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = variant === 'success' ? 'btn-success' : `btn-${variant}`;
    // Note: danger is not in original css but mapped to secondary or custom if needed. 
    // Let's stick to simple mapping.

    const sizeClass = size === 'large' ? 'btn-large' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
