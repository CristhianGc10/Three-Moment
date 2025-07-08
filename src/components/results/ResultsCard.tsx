// src/components/results/ResultsCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

import { clsx } from 'clsx';

interface ResultsCardProps {
    title: string;
    value: number | string;
    unit?: string;
    description?: string;
    variant?:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const variantStyles = {
    default: 'bg-gray-100 text-gray-900',
    primary: 'bg-blue-100 text-blue-900',
    secondary: 'bg-purple-100 text-purple-900',
    success: 'bg-green-100 text-green-900',
    warning: 'bg-yellow-100 text-yellow-900',
    danger: 'bg-red-100 text-red-900',
};

const sizeStyles = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
};

export function ResultsCard({
    title,
    value,
    unit,
    description,
    variant = 'default',
    size = 'md',
    className,
}: ResultsCardProps) {
    return (
        <Card
            className={clsx('text-center', variantStyles[variant], className)}
        >
            <CardHeader>
                <CardTitle className="text-sm font-medium opacity-80">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={clsx('font-bold', sizeStyles[size])}>
                    {typeof value === 'number' ? value.toFixed(6) : value}
                    {unit && (
                        <span className="text-sm ml-1 opacity-70">{unit}</span>
                    )}
                </div>
                {description && (
                    <p className="text-xs mt-2 opacity-70">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
