// src/components/ui/NumberInputWithUnits.tsx

import React, { useEffect, useRef, useState } from 'react';

interface UnitOption {
    value: string;
    label: string;
}

interface NumberInputWithUnitsProps {
    value: number;
    unit: string;
    onChange: (value: number) => void;
    onUnitChange: (unit: string) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    units: UnitOption[];
    label?: string;
    error?: string;
}

const NumberInputWithUnits: React.FC<NumberInputWithUnitsProps> = ({
    value,
    unit,
    onChange,
    onUnitChange,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    placeholder = '0',
    disabled = false,
    className = '',
    units,
    label,
    error,
}) => {
    const [inputValue, setInputValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Determinar el tamaño del dropdown de unidades
    const getUnitsWidth = () => {
        const maxLength = Math.max(...units.map((u) => u.label.length));
        if (maxLength <= 3) return 'sm';
        if (maxLength <= 6) return 'md';
        return 'lg';
    };

    const unitsWidth = getUnitsWidth();

    // Sincronizar el valor interno con el valor externo
    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    // Validar y actualizar el valor
    const validateAndUpdate = (newValue: number) => {
        const clampedValue = Math.min(Math.max(newValue, min), max);
        onChange(clampedValue);
        setInputValue(clampedValue.toString());
    };

    // Manejar cambios en el input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Solo actualizar si es un número válido
        const numericValue = parseFloat(newValue);
        if (!isNaN(numericValue)) {
            validateAndUpdate(numericValue);
        } else if (newValue === '') {
            onChange(0);
        }
    };

    // Manejar blur del input
    const handleBlur = () => {
        setIsFocused(false);
        const numericValue = parseFloat(inputValue);
        if (isNaN(numericValue)) {
            setInputValue(value.toString());
        } else {
            validateAndUpdate(numericValue);
        }
    };

    // Incrementar valor
    const increment = () => {
        if (disabled) return;
        const currentValue = parseFloat(inputValue) || 0;
        validateAndUpdate(currentValue + step);
        inputRef.current?.focus();
    };

    // Decrementar valor
    const decrement = () => {
        if (disabled) return;
        const currentValue = parseFloat(inputValue) || 0;
        validateAndUpdate(currentValue - step);
        inputRef.current?.focus();
    };

    // Manejar teclas
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            increment();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            decrement();
        }
    };

    const containerClasses = `
    custom-number-input 
    ${unitsWidth === 'sm' ? 'size-sm' : ''}
    ${unitsWidth === 'md' ? 'size-md' : ''}
    ${unitsWidth === 'lg' ? 'size-lg' : ''}
    ${error ? 'has-error' : ''}
    ${className}
  `.trim();

    const inputClasses = `
    w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
    ${
        error
            ? 'border-red-300 bg-red-50 focus:border-red-500'
            : 'border-gray-200 bg-white focus:border-blue-500'
    }
    ${
        disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'focus:outline-none focus:ring-2 focus:ring-blue-200'
    }
  `.trim();

    // Estilos para el selector de unidades
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
            {label && (
                <label
                    className={`block text-sm font-medium ${
                        error ? 'text-red-700' : 'text-gray-700'
                    }`}
                >
                    {label}
                </label>
            )}

            <div className={containerClasses}>
                <input
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    min={min}
                    max={max}
                    step={step}
                    className={inputClasses}
                    style={{
                        paddingRight:
                            unitsWidth === 'sm'
                                ? '6rem'
                                : unitsWidth === 'md'
                                ? '7rem'
                                : '8rem',
                    }}
                />

                {/* Spin Buttons */}
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

                {/* Selector de unidades */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <select
                        value={unit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        disabled={disabled}
                        className={`
              ${getSelectWidth()} px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium 
              border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300
              units-dropdown-centered
              ${disabled ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-200'}
            `}
                    >
                        {units.map((unitOption) => (
                            <option
                                key={unitOption.value}
                                value={unitOption.value}
                                className="units-option-centered"
                            >
                                {unitOption.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-600 mt-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default NumberInputWithUnits;
