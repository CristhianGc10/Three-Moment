// src/components/forms/SpanConfiguration.tsx

import { Ruler } from 'lucide-react';
import { Input, commonUnits } from '../ui/Input';
import React, { useState } from 'react';

import type { SpanConfiguration as SpanConfig } from '../../types';

interface SpanConfigurationProps {
    config: SpanConfig;
    onChange: (length: number) => void;
}

export function SpanConfiguration({
    config,
    onChange,
}: SpanConfigurationProps) {
    const [lengthUnit, setLengthUnit] = useState('m');
    const [tempValue, setTempValue] = useState('');
    const [error, setError] = useState('');

    const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTempValue(value);

        if (value === '') {
            setError('');
            return;
        }

        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            setError('Debe ser un número válido');
            return;
        }

        if (config.minLength && numValue < config.minLength) {
            setError(`La longitud mínima es ${config.minLength}m`);
            return;
        }

        if (config.maxLength && numValue > config.maxLength) {
            setError(`La longitud máxima es ${config.maxLength}m`);
            return;
        }

        if (numValue <= 0) {
            setError('La longitud debe ser mayor a cero');
            return;
        }

        setError('');
        onChange(numValue);
    };

    const handleUnitChange = (unit: string) => {
        setLengthUnit(unit);
        // Aquí podrías agregar conversión de unidades si es necesario
    };



    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                    <div className="flex items-center gap-2">
                        <Ruler className="w-3 h-3 text-slate-600" />
                        Longitud del Tramo
                    </div>
                </label>
                <div className="flex gap-1">
                    <input
                        type="number"
                        value={tempValue}
                        onChange={handleLengthChange}
                        className="flex-1 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                        placeholder="Ej: 10"
                        step="0.1"
                        min={config.minLength}
                        max={config.maxLength}
                    />
                    <select
                        value={lengthUnit}
                        onChange={(e) => handleUnitChange(e.target.value)}
                        className="w-12 px-1 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                    >
                        <option value="m">m</option>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                    </select>
                </div>
                {error && (
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                    Rango: {config.minLength} - {config.maxLength}m
                </p>
            </div>
        </div>
    );
}
