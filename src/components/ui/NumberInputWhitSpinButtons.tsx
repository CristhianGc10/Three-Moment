// src/components/ui/NumberInputWithSpinButtons.tsx

import React, { useEffect, useRef, useState } from 'react';

interface NumberInputWithSpinButtonsProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    units?: string;
    unitsWidth?: 'sm' | 'md' | 'lg';
    label?: string;
    error?: string;
}

const NumberInputWithSpinButtons: React.FC<NumberInputWithSpinButtonsProps> = ({
    value,
    onChange,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    placeholder = '0',
    disabled = false,
    className = '',
    units,
    unitsWidth = 'md',
    label,
    error,
}) => {
    const [inputValue, setInputValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
    w-full px-4 py-3 pr-24 rounded-lg border-2 transition-all duration-200
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
                {units && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium border-l border-gray-200">
                            {units}
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 mt-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default NumberInputWithSpinButtons;
