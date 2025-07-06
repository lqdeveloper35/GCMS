import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, id, children, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
                <select
                    id={id}
                    ref={ref}
                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...props}
                >
                    {children}
                </select>
            </div>
        );
    }
);

Select.displayName = 'Select';