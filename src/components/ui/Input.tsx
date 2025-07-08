// src/components/ui/Input.tsx - Actualizada con Centrado Absoluto Perfecto

import React, { useEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

export interface UnitOption {
    value: string;
    label: string;
}

export interface InputProps {
    type?: 'text' | 'number' | 'email' | 'password' | 'tel';
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    error?: string;
    helperText?: string;
    min?: number;
    max?: number;
    step?: number;
    units?: UnitOption[];
    selectedUnit?: string;
    onUnitChange?: (unit: string) => void;
    variant?: 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    // Props para spin buttons
    enableSpinButtons?: boolean;
    spinButtonStep?: number;
}

// Unidades comunes predefinidas
export const commonUnits = {
    length: [
        { value: 'm', label: 'm' },
        { value: 'cm', label: 'cm' },
        { value: 'mm', label: 'mm' },
        { value: 'ft', label: 'ft' },
        { value: 'in', label: 'in' },
    ],
    force: [
        { value: 'kN', label: 'kN' },
        { value: 'N', label: 'N' },
        { value: 'kgf', label: 'kgf' },
        { value: 'lbf', label: 'lbf' },
    ],
    moment: [
        { value: 'kN⋅m', label: 'kN⋅m' },
        { value: 'N⋅m', label: 'N⋅m' },
        { value: 'kgf⋅m', label: 'kgf⋅m' },
        { value: 'lbf⋅ft', label: 'lbf⋅ft' },
    ],
    distributed: [
        { value: 'kN/m', label: 'kN/m' },
        { value: 'N/m', label: 'N/m' },
        { value: 'kgf/m', label: 'kgf⋅m' },
        { value: 'lbf/ft', label: 'lbf/ft' },
    ],
};

export const Input: React.FC<InputProps> = ({
    type = 'text',
    label,
    value = '',
    onChange,
    onBlur,
    onFocus,
    placeholder,
    disabled = false,
    required = false,
    className = '',
    error,
    helperText,
    min,
    max,
    step = 0.1,
    units,
    selectedUnit,
    onUnitChange,
    variant = 'outlined',
    size = 'md',
    icon,
    enableSpinButtons = true,
    spinButtonStep,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    // Determinar si mostrar spin buttons
    const shouldShowSpinButtons =
        type === 'number' && enableSpinButtons && !disabled;

    // Determinar el step para los spin buttons - por defecto 0.1
    const actualStep = spinButtonStep || step || 0.1;

    // Sincronizar valor interno con prop externa
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    // Efecto para prevenir scroll del mouse en inputs numéricos
    useEffect(() => {
        const input = inputRef.current;
        if (!input || type !== 'number') return;

        const preventScroll = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        input.addEventListener('wheel', preventScroll, { passive: false });
        
        return () => {
            input.removeEventListener('wheel', preventScroll);
        };
    }, [type]);

    // Determinar el ancho del selector de unidades para posicionar spin buttons
    const getUnitsWidth = (): 'sm' | 'md' | 'lg' => {
        if (!units || units.length === 0) return 'sm';
        const maxLength = Math.max(...units.map((u) => u.label.length));
        if (maxLength <= 3) return 'sm';
        if (maxLength <= 6) return 'md';
        return 'lg';
    };

    const unitsWidth = getUnitsWidth();

    // Manejar cambios en el input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        onChange?.(e);
    };

    // Manejar focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    // Manejar blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    // Función para manejar precisión decimal trabajando con enteros
    const handlePreciseIncrement = (currentValue: number, step: number): number => {
        // Convertir a enteros para evitar problemas de precisión flotante
        const factor = 10; // Para trabajar con 1 decimal
        const intCurrent = Math.round(currentValue * factor);
        const intStep = Math.round(step * factor);
        const intResult = intCurrent + intStep;
        
        return intResult / factor;
    };

    const handlePreciseDecrement = (currentValue: number, step: number): number => {
        // Convertir a enteros para evitar problemas de precisión flotante
        const factor = 10; // Para trabajar con 1 decimal
        const intCurrent = Math.round(currentValue * factor);
        const intStep = Math.round(step * factor);
        const intResult = intCurrent - intStep;
        
        return intResult / factor;
    };

    // Incrementar valor (para spin buttons) - solución robusta
    const increment = () => {
        if (disabled || !onChange) return;

        const currentValue = parseFloat(internalValue) || 0;
        const newValue = handlePreciseIncrement(currentValue, actualStep);
        const clampedValue = max !== undefined ? Math.min(newValue, max) : newValue;

        const syntheticEvent = {
            target: { value: clampedValue.toString() },
            currentTarget: { value: clampedValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;

        setInternalValue(clampedValue.toString());
        onChange(syntheticEvent);
        inputRef.current?.focus();
    };

    // Decrementar valor (para spin buttons) - solución robusta
    const decrement = () => {
        if (disabled || !onChange) return;

        const currentValue = parseFloat(internalValue) || 0;
        const newValue = handlePreciseDecrement(currentValue, actualStep);
        const clampedValue = min !== undefined ? Math.max(newValue, min) : newValue;

        const syntheticEvent = {
            target: { value: clampedValue.toString() },
            currentTarget: { value: clampedValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;

        setInternalValue(clampedValue.toString());
        onChange(syntheticEvent);
        inputRef.current?.focus();
    };

    // Manejar teclas de flecha
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (shouldShowSpinButtons) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                increment();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                decrement();
            }
        }
    };

    // Clases del contenedor
    const containerClasses = clsx(
        'relative',
        {
            // Clases para spin buttons
            'custom-number-input': shouldShowSpinButtons,
            'size-sm': shouldShowSpinButtons && unitsWidth === 'sm',
            'size-md': shouldShowSpinButtons && unitsWidth === 'md',
            'size-lg': shouldShowSpinButtons && unitsWidth === 'lg',
            'has-error': error,
        },
        className
    );

    // Clases del input
    const inputClasses = clsx(
        'w-full transition-all duration-200 focus:outline-none',
        {
            // Variantes
            'bg-white border-2 rounded-lg': variant === 'outlined',
            'bg-gray-50 border-0 border-b-2 rounded-t-lg': variant === 'filled',

            // Tamaños
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-3 text-base': size === 'md',
            'px-5 py-4 text-lg': size === 'lg',

            // Estados de color
            'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200':
                !error && !disabled,
            'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200':
                error && !disabled,
            'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed':
                disabled,

            // Padding ajustado para unidades y/o spin buttons
            'pr-24': units && !shouldShowSpinButtons,
            'pr-32': units && shouldShowSpinButtons && unitsWidth === 'sm',
            'pr-36': units && shouldShowSpinButtons && unitsWidth === 'md',
            'pr-40': units && shouldShowSpinButtons && unitsWidth === 'lg',
            'pl-12': icon,
        }
    );

    // Determinar ancho del selector de unidades
    const getSelectWidth = () => {
        switch (unitsWidth) {
            case 'sm':
                return 'w-16';
            case 'md':
                return 'w-20';
            case 'lg':
                return 'w-24';
            default:
                return 'w-20';
        }
    };

    return (
        <div className="space-y-1">
            {/* Label */}
            {label && (
                <label
                    className={clsx(
                        'block text-sm font-medium transition-colors',
                        {
                            'text-gray-700': !error && !isFocused,
                            'text-blue-600': !error && isFocused,
                            'text-red-700': error,
                        }
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className={containerClasses}>
                {/* Icon */}
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}

                {/* Input */}
                <input
                    ref={inputRef}
                    type={type}
                    value={internalValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    min={min}
                    max={max}
                    step={step}
                    className={inputClasses}
                />

                {/* Spin Buttons */}
                {shouldShowSpinButtons && (
                    <div className="custom-spin-buttons">
                        <button
                            type="button"
                            className="custom-spin-button increment"
                            onClick={increment}
                            disabled={disabled}
                            tabIndex={-1}
                            aria-label="Incrementar valor"
                        />
                        <button
                            type="button"
                            className="custom-spin-button decrement"
                            onClick={decrement}
                            disabled={disabled}
                            tabIndex={-1}
                            aria-label="Decrementar valor"
                        />
                    </div>
                )}

                {/* Units Selector - Nativo compatible con Edge */}
                {units && units.length > 0 && (
                    <select
                        value={selectedUnit || units[0]?.value}
                        onChange={(e) => onUnitChange?.(e.target.value)}
                        disabled={disabled}
                        className={clsx(
                            "absolute right-0 top-0 h-full text-sm font-medium",
                            "bg-gray-50 border-l border-gray-200 rounded-r-md",
                            "cursor-pointer hover:bg-gray-100 transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            "min-w-[80px] w-20",
                            "units-dropdown-simple",
                            {
                                "bg-gray-100 text-gray-400 cursor-not-allowed": disabled,
                            }
                        )}
                    >
                        {units.map((unit) => (
                            <option
                                key={unit.value}
                                value={unit.value}
                                className="text-center"
                            >
                                {unit.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Helper Text / Error */}
            {(helperText || error) && (
                <p
                    className={clsx('text-sm transition-colors', {
                        'text-gray-500': helperText && !error,
                        'text-red-600': error,
                    })}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};