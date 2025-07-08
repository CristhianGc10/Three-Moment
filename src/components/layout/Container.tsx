// src/components/layout/Container.tsx

import React from 'react';
import { clsx } from 'clsx';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: boolean;
}

const containerSizes = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
};

export function Container({
    size = 'xl',
    padding = true,
    className,
    children,
    ...props
}: ContainerProps) {
    return (
        <div
            className={clsx(
                'mx-auto',
                containerSizes[size],
                padding && 'px-4 sm:px-6 lg:px-8 py-6',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
