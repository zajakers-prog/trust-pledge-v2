import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
}

export default function Input({ label, hint, className = '', ...props }: InputProps) {
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <input className={className} {...props} />
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    );
}
