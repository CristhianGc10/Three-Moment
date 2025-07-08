// src/components/ui/Button.tsx

import { Loader2 } from 'lucide-react';
import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

const buttonVariants = {
    primary:
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary:
        'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl',
    outline:
        'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500 bg-white',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
};

const buttonSizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <button
            className={clsx(
                // Base styles
                'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
                'transition-all duration-200 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'transform hover:-translate-y-0.5 active:translate-y-0',

                // Variant styles
                buttonVariants[variant],

                // Size styles
                buttonSizes[size],

                // Width
                fullWidth && 'w-full',

                // Disabled styles
                isDisabled &&
                    'opacity-50 cursor-not-allowed transform-none hover:transform-none',

                className
            )}
            disabled={isDisabled}
            {...props}
        >
            {/* Loading spinner or left icon */}
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                icon &&
                iconPosition === 'left' && (
                    <span className="inline-flex">{icon}</span>
                )
            )}

            {/* Button text */}
            {children && <span>{children}</span>}

            {/* Right icon */}
            {!isLoading && icon && iconPosition === 'right' && (
                <span className="inline-flex">{icon}</span>
            )}
        </button>
    );
}
