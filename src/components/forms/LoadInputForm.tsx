// src/components/forms/LoadInputForm.tsx

import { AlertTriangle, BarChart3, Plus, RotateCcw, Target } from 'lucide-react';
import { Input, commonUnits } from '../ui/Input';
import type {
    LoadInputData,
    LoadType,
    LoadValidationResult,
} from '../../types';
import React, { useState } from 'react';

import { clsx } from 'clsx';

interface LoadInputFormProps {
    spanLength: number;
    onAddLoad: (loadData: LoadInputData) => void;
    validateLoad: (loadData: LoadInputData) => LoadValidationResult;
}

const loadTypeOptions = [
    { value: 'point', label: 'Carga Puntual' },
    { value: 'distributed', label: 'Carga Distribuida' },
    { value: 'moment', label: 'Momento Aplicado' },
];

// Unidades por tipo de campo
const getUnitsForField = (field: string) => {
    switch (field) {
        case 'position':
        case 'start':
        case 'end':
        case 'momentPosition':
            return commonUnits.length;
        case 'magnitude':
            return commonUnits.force;
        case 'w1':
        case 'w2':
            return commonUnits.distributed;
        case 'momentMagnitude':
            return commonUnits.moment;
        default:
            return [];
    }
};

export function LoadInputForm({
    spanLength,
    onAddLoad,
    validateLoad,
}: LoadInputFormProps) {
    const [loadType, setLoadType] = useState<LoadType>('point');
    const [formData, setFormData] = useState<LoadInputData>({ type: 'point' });
    const [units, setUnits] = useState({
        position: 'm',
        magnitude: 'kN',
        start: 'm',
        end: 'm',
        w1: 'kN/m',
        w2: 'kN/m',
        momentPosition: 'm',
        momentMagnitude: 'kN·m',
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleTypeChange = (type: LoadType) => {
        setLoadType(type);
        setFormData({ type });
        setErrors([]);
        setFieldErrors({});
    };

    const handleInputChange = (field: string, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        setFormData((prev) => ({
            ...prev,
            [field]: numValue,
        }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: '' }));
        }
        setErrors([]);
    };

    const handleUnitChange = (field: string, unit: string) => {
        setUnits((prev) => ({ ...prev, [field]: unit }));
    };

    const validateField = (
        field: string,
        value: number | undefined
    ): string => {
        if (value === undefined || value === null || isNaN(value)) {
            return 'Este campo es requerido';
        }
        if (
            field === 'position' ||
            field === 'start' ||
            field === 'end' ||
            field === 'momentPosition'
        ) {
            if (value < 0) return 'La posición no puede ser negativa';
            if (value > spanLength)
                return `La posición no puede exceder ${spanLength}m`;
        }
        if (field === 'w1' || field === 'w2') {
            if (Math.abs(value) > 1000) {
                return 'El valor es demasiado grande';
            }
        }
        if (
            field === 'start' &&
            formData.end !== undefined &&
            value >= formData.end
        ) {
            return 'El inicio debe ser menor que el final';
        }
        if (
            field === 'end' &&
            formData.start !== undefined &&
            value <= formData.start
        ) {
            return 'El final debe ser mayor que el inicio';
        }
        return '';
    };

    const handleAddLoad = () => {
        const validation = validateLoad(formData);
        setFieldErrors({});
        setErrors([]);
        const newFieldErrors: Record<string, string> = {};

        if (loadType === 'point') {
            const positionError = validateField('position', formData.position);
            const magnitudeError = validateField('magnitude', formData.magnitude);
            if (positionError) newFieldErrors.position = positionError;
            if (magnitudeError) newFieldErrors.magnitude = magnitudeError;
        } else if (loadType === 'distributed') {
            const startError = validateField('start', formData.start);
            const endError = validateField('end', formData.end);
            const w1Error = validateField('w1', formData.w1);
            const w2Error = validateField('w2', formData.w2);
            if (startError) newFieldErrors.start = startError;
            if (endError) newFieldErrors.end = endError;
            if (w1Error) newFieldErrors.w1 = w1Error;
            if (w2Error) newFieldErrors.w2 = w2Error;
        } else if (loadType === 'moment') {
            const positionError = validateField('momentPosition', formData.momentPosition);
            const magnitudeError = validateField('momentMagnitude', formData.momentMagnitude);
            if (positionError) newFieldErrors.momentPosition = positionError;
            if (magnitudeError) newFieldErrors.momentMagnitude = magnitudeError;
        }

        if (Object.keys(newFieldErrors).length > 0 || !validation.isValid) {
            setFieldErrors(newFieldErrors);
            setErrors(validation.errors);
            return;
        }

        onAddLoad(formData);
        setFormData({ type: loadType });
        setErrors([]);
        setFieldErrors({});
    };

    // Componente para campo de entrada unificado
    const InputField = ({ 
        label, 
        field, 
        value, 
        unit, 
        unitOptions, 
        placeholder = "0",
        min,
        max 
    }: {
        label: string;
        field: string;
        value: number | undefined;
        unit: string;
        unitOptions: { value: string; label: string }[];
        placeholder?: string;
        min?: number;
        max?: number;
    }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="number"
                    value={value !== undefined ? value : ''}
                    onChange={e => handleInputChange(field, e.target.value)}
                    className={clsx(
                        "flex-1 h-11 px-3 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
                        fieldErrors[field] && "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500"
                    )}
                    placeholder={placeholder}
                    step="0.1"
                    min={min}
                    max={max}
                />
                <select
                    value={unit}
                    onChange={e => handleUnitChange(field, e.target.value)}
                    className="w-20 h-11 px-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                    {unitOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label || option.value}
                        </option>
                    ))}
                </select>
            </div>
            {fieldErrors[field] && (
                <span className="text-sm text-red-600 font-medium">
                    {fieldErrors[field]}
                </span>
            )}
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Selector de tipo de carga */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                    Tipo de Carga
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                    {loadTypeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleTypeChange(option.value as LoadType)}
                            className={clsx(
                                'py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200',
                                loadType === option.value
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                            )}
                        >
                            {option.label.split(' ')[1] || option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campos dinámicos */}
            <div className="space-y-5">
                {/* Campos para carga puntual */}
                {loadType === 'point' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                            label="Posición"
                            field="position"
                            value={formData.position}
                            unit={units.position}
                            unitOptions={[
                                { value: 'm', label: 'm' },
                                { value: 'cm', label: 'cm' },
                                { value: 'mm', label: 'mm' }
                            ]}
                            min={0}
                            max={spanLength}
                        />
                        <InputField
                            label="Magnitud"
                            field="magnitude"
                            value={formData.magnitude}
                            unit={units.magnitude}
                            unitOptions={[
                                { value: 'kN', label: 'kN' },
                                { value: 'N', label: 'N' },
                                { value: 'kg', label: 'kg' },
                                { value: 't', label: 't' }
                            ]}
                        />
                    </div>
                )}

                {/* Campos para carga distribuida */}
                {loadType === 'distributed' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField
                                label="Posición Inicial"
                                field="start"
                                value={formData.start}
                                unit={units.start}
                                unitOptions={[
                                    { value: 'm', label: 'm' },
                                    { value: 'cm', label: 'cm' },
                                    { value: 'mm', label: 'mm' }
                                ]}
                                min={0}
                                max={spanLength}
                            />
                            <InputField
                                label="Posición Final"
                                field="end"
                                value={formData.end}
                                unit={units.end}
                                unitOptions={[
                                    { value: 'm', label: 'm' },
                                    { value: 'cm', label: 'cm' },
                                    { value: 'mm', label: 'mm' }
                                ]}
                                min={0}
                                max={spanLength}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField
                                label="Carga Inicial (w1)"
                                field="w1"
                                value={formData.w1}
                                unit={units.w1}
                                unitOptions={[
                                    { value: 'kN/m', label: 'kN/m' },
                                    { value: 'N/m', label: 'N/m' },
                                    { value: 'kg/m', label: 'kg/m' }
                                ]}
                            />
                            <InputField
                                label="Carga Final (w2)"
                                field="w2"
                                value={formData.w2}
                                unit={units.w2}
                                unitOptions={[
                                    { value: 'kN/m', label: 'kN/m' },
                                    { value: 'N/m', label: 'N/m' },
                                    { value: 'kg/m', label: 'kg/m' }
                                ]}
                            />
                        </div>
                    </div>
                )}

                {/* Campos para momento */}
                {loadType === 'moment' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                            label="Posición"
                            field="momentPosition"
                            value={formData.momentPosition}
                            unit={units.momentPosition}
                            unitOptions={[
                                { value: 'm', label: 'm' },
                                { value: 'cm', label: 'cm' },
                                { value: 'mm', label: 'mm' }
                            ]}
                            min={0}
                            max={spanLength}
                        />
                        <InputField
                            label="Magnitud del Momento"
                            field="momentMagnitude"
                            value={formData.momentMagnitude}
                            unit={units.momentMagnitude}
                            unitOptions={[
                                { value: 'kN·m', label: 'kN·m' },
                                { value: 'N·m', label: 'N·m' },
                                { value: 'kg·m', label: 'kg·m' }
                            ]}
                        />
                    </div>
                )}
            </div>

            {/* Errores generales */}
            {errors.length > 0 && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            {errors.map((err, i) => (
                                <div key={i} className="text-sm text-red-700 font-medium">
                                    {err}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Botón de agregar */}
            <button
                type="button"
                onClick={handleAddLoad}
                className="w-full mt-6 h-12 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <div className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Carga
                </div>
            </button>
        </div>
    );
}