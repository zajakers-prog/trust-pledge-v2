import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    size?: 'normal' | 'large' | 'sm';
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
    const variantClass = variant === 'success' ? 'btn-success'
        : variant === 'ghost' ? 'btn-secondary'
        : `btn-${variant}`;

    const sizeClass = size === 'large' ? 'btn-large' : size === 'sm' ? 'btn-sm' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
