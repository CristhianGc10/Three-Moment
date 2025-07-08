// src/components/ui/Select.tsx

import { AlertCircle, ChevronDown } from 'lucide-react';
import React, { forwardRef, useState } from 'react';

import { clsx } from 'clsx';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'outlined' | 'filled';
    leftIcon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helperText,
            options,
            placeholder,
            fullWidth = true,
            size = 'md',
            variant = 'outlined',
            leftIcon,
            className,
            id,
            value,
            required = false,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
        const hasError = Boolean(error);
        const hasValue = Boolean(value);
        const showFloatingLabel = isFocused || hasValue;

        const sizeStyles = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-base',
            lg: 'px-5 py-4 text-lg',
        };

        const selectStyles = clsx(
            'w-full text-gray-900 bg-transparent border-2 rounded-xl',
            'appearance-none cursor-pointer transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-0',
            
            // Size styles
            sizeStyles[size],
            
            // Variant styles
            variant === 'outlined' && [
                'border-gray-300 hover:border-gray-400',
                isFocused && 'border-blue-500 shadow-lg shadow-blue-500/20',
                hasError && 'border-red-500 hover:border-red-500'
            ],
            
            variant === 'filled' && [
                'bg-gray-50 border-gray-200',
                isFocused && 'bg-white border-blue-500 shadow-lg shadow-blue-500/20',
                hasError && 'border-red-500 bg-red-50'
            ],

            // Icon padding
            leftIcon && 'pl-12',
            'pr-12', // Always leave space for chevron

            // Error state
            hasError && 'shake',

            // Disabled styles
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200'
        );

        const labelStyles = clsx(
            'absolute left-4 transition-all duration-200 ease-in-out pointer-events-none',
            'text-gray-500 select-none z-20',
            
            // Floating label position
            showFloatingLabel ? [
                '-top-2.5 left-3 text-xs font-medium bg-white px-1 z-10',
                isFocused && 'text-blue-600',
                hasError && 'text-red-600'
            ] : [
                'top-3.5 text-base',
                hasError && 'text-red-500'
            ]
        );

        return (
            <div className={clsx('relative', fullWidth && 'w-full')}>
                {/* Select Container */}
                <div className="relative">
                    {/* Left Icon */}
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                            {leftIcon}
                        </div>
                    )}

                    {/* Select Field */}
                    <select
                        ref={ref}
                        id={selectId}
                        value={value}
                        className={clsx(selectStyles, className)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        aria-invalid={hasError}
                        aria-required={required}
                        {...props}
                    >
                        {/* Placeholder option */}
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}

                        {/* Options */}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Floating Label */}
                    {label && (
                        <label htmlFor={selectId} className={labelStyles}>
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}

                    {/* Chevron Icon */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown 
                            className={clsx(
                                'w-5 h-5 transition-all duration-200',
                                isFocused ? 'text-blue-500 rotate-180' : 'text-gray-400',
                                hasError && 'text-red-500'
                            )}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 animate-fade-in">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Helper Text */}
                {helperText && !error && (
                    <p className="mt-2 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';