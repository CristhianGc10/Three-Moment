// src/components/ui/Card.tsx

import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'filled' | 'outlined';
    elevation?: 1 | 2 | 3 | 4 | 5;
    interactive?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

const cardVariants = {
    elevated: 'bg-white border-0',
    filled: 'bg-gray-50 border-0',
    outlined: 'bg-white border border-gray-200',
};

const cardElevations = {
    1: 'shadow-sm',
    2: 'shadow-md shadow-gray-200/50',
    3: 'shadow-lg shadow-gray-200/60',
    4: 'shadow-xl shadow-gray-200/70',
    5: 'shadow-2xl shadow-gray-200/80',
};

export function Card({
    variant = 'elevated',
    elevation = 2,
    interactive = false,
    header,
    footer,
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={clsx(
                // Base styles
                'rounded-2xl transition-all duration-300 ease-out',
                'overflow-hidden relative',

                // Variant styles
                cardVariants[variant],

                // Elevation styles
                cardElevations[elevation],

                // Interactive effects
                interactive && [
                    'cursor-pointer transform',
                    'hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-200/80',
                    'active:scale-[0.98]',
                    'hover:-translate-y-1',
                ],

                className
            )}
            {...props}
        >
            {/* Surface tint overlay for Material Design 3 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

            {/* Header */}
            {header && (
                <div className="relative p-6 pb-4 border-b border-gray-100/80">
                    {header}
                </div>
            )}

            {/* Content */}
            <div
                className={clsx(
                    'relative',
                    header || footer ? 'p-6' : 'p-6',
                    header && !footer && 'pt-4',
                    !header && footer && 'pb-4'
                )}
            >
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className="relative p-6 pt-4 border-t border-gray-100/80 bg-gray-50/30">
                    {footer}
                </div>
            )}
        </div>
    );
}

// Specialized Card components with Material Design 3
export function CardHeader({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('space-y-2', className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={clsx(
                'text-xl font-semibold text-gray-900',
                'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={clsx('text-sm text-gray-600 leading-relaxed', className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('space-y-6', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx(
                'flex items-center justify-between gap-3',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
