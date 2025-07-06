import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
                <input
                    id={id}
                    ref={ref}
                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';