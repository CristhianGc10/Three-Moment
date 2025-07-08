// src/components/forms/LoadsList.tsx

import {
    BarChart3,
    Calculator,
    Package,
    RotateCcw,
    Target,
    Trash2,
    X,
} from 'lucide-react';

import { Button } from '../ui/Button';
import type { Load } from '../../types';
import React from 'react';
import { clsx } from 'clsx';

interface LoadsListProps {
    loads: Load[];
    onRemoveLoad: (id: string) => void;
    onClearLoads: () => void;
    onCalculate: () => void;
    isCalculating: boolean;
}

export function LoadsList({
    loads,
    onRemoveLoad,
    onClearLoads,
    onCalculate,
    isCalculating,
}: LoadsListProps) {
    const getLoadIcon = (type: string) => {
        switch (type) {
            case 'point':
                return <Target className="w-3 h-3 text-slate-600" />;
            case 'distributed':
                return <BarChart3 className="w-3 h-3 text-slate-600" />;
            case 'moment':
                return <RotateCcw className="w-3 h-3 text-slate-600" />;
            default:
                return <Package className="w-3 h-3 text-slate-600" />;
        }
    };

    const getLoadDescription = (
        load: Load
    ): { title: string; details: string; color: string } => {
        switch (load.type) {
            case 'point':
                return {
                    title: `Carga Puntual`,
                    details: `${load.magnitude} kN en x = ${load.position} m`,
                    color: 'blue',
                };
            case 'distributed':
                if (load.w1 === load.w2) {
                    return {
                        title: `Carga Uniforme`,
                        details: `${load.w1} kN/m desde ${load.start}m hasta ${load.end}m`,
                        color: 'purple',
                    };
                } else {
                    return {
                        title: `Carga Distribuida`,
                        details: `${load.w1}-${load.w2} kN/m desde ${load.start}m hasta ${load.end}m`,
                        color: 'purple',
                    };
                }
            case 'moment':
                return {
                    title: `Momento Aplicado`,
                    details: `${load.magnitude} kN⋅m en x = ${load.position} m`,
                    color: 'orange',
                };
            default:
                return {
                    title: 'Carga Desconocida',
                    details: 'Tipo no reconocido',
                    color: 'gray',
                };
        }
    };

    const getLoadStats = () => {
        const stats = {
            point: loads.filter((l) => l.type === 'point').length,
            distributed: loads.filter((l) => l.type === 'distributed').length,
            moment: loads.filter((l) => l.type === 'moment').length,
        };
        return stats;
    };

    const stats = getLoadStats();

    return (
        <div className="space-y-3 h-full flex flex-col">
            {/* Contador de cargas */}
            {loads.length > 0 && (
                <div className="bg-slate-50 rounded p-2 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-xs font-medium">Total de cargas:</span>
                        <span className="text-slate-900 font-semibold text-sm">{loads.length}</span>
                    </div>
                </div>
            )}
            
            <div className="space-y-2 flex-1 flex flex-col">
                {/* Estadísticas compactas */}
                {loads.length > 0 && (
                    <div className="grid grid-cols-3 gap-1">
                        <div className="bg-slate-50 rounded p-2 border border-slate-200 text-center">
                            <Target className="w-3 h-3 mx-auto mb-1 text-slate-600" />
                            <div className="text-sm font-bold text-slate-900">
                                {stats.point}
                            </div>
                            <div className="text-xs text-slate-500">
                                Puntual
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded p-2 border border-slate-200 text-center">
                            <BarChart3 className="w-3 h-3 mx-auto mb-1 text-slate-600" />
                            <div className="text-sm font-bold text-slate-900">
                                {stats.distributed}
                            </div>
                            <div className="text-xs text-slate-500">
                                Distribuida
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded p-2 border border-slate-200 text-center">
                            <RotateCcw className="w-3 h-3 mx-auto mb-1 text-slate-600" />
                            <div className="text-sm font-bold text-slate-900">
                                {stats.moment}
                            </div>
                            <div className="text-xs text-slate-500">
                                Momento
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de cargas */}
                {loads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center mb-3 border border-slate-200">
                            <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 text-center">
                            No hay cargas agregadas
                        </p>
                        <p className="text-xs text-slate-500 text-center mt-1">
                            Agrega cargas para comenzar el análisis
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto overflow-x-hidden flex-1">
                        {loads.map((load, index) => {
                            const loadInfo = getLoadDescription(load);
                            return (
                                <div
                                    key={load.id}
                                    className="group relative p-2 rounded border transition-all duration-200 bg-slate-50 hover:bg-slate-100 min-h-[40px] flex flex-col w-full border-slate-200 hover:border-slate-300"
                                >
                                    {/* Header compacto */}
                                    <div className="flex items-center justify-between mb-1 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                            <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-200">
                                                {getLoadIcon(load.type)}
                                            </div>
                                            <span className="text-xs font-medium text-slate-600">
                                                #{index + 1}
                                            </span>
                                        </div>

                                        {/* Botón eliminar */}
                                        <button
                                            onClick={() => onRemoveLoad(load.id)}
                                            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 flex items-center justify-center transition-all duration-200"
                                            title="Eliminar carga"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Contenido principal */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium text-slate-900 mb-0.5">
                                            {loadInfo.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-tight break-words">
                                            {loadInfo.details}
                                        </p>
                                    </div>

                                    {/* Borde izquierdo */}
                                    <div
                                        className={clsx(
                                            'absolute left-0 top-2 bottom-2 w-0.5 rounded-r',
                                            loadInfo.color === 'blue' && 'bg-blue-500',
                                            loadInfo.color === 'purple' && 'bg-purple-500',
                                            loadInfo.color === 'orange' && 'bg-orange-500',
                                            loadInfo.color === 'gray' && 'bg-gray-500'
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Botones de acción */}
                {loads.length > 0 && (
                    <div className="pt-2 mt-auto">
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={onCalculate}
                                icon={<Calculator className="w-3 h-3" />}
                                size="sm"
                                disabled={loads.length === 0}
                                isLoading={isCalculating}
                                variant="primary"
                                className="w-full h-8 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white border-0"
                            >
                                {isCalculating ? 'Calculando...' : 'Calcular Momentos'}
                            </Button>
                            
                            <Button
                                variant="outline"
                                onClick={onClearLoads}
                                icon={<Trash2 className="w-3 h-3" />}
                                size="sm"
                                disabled={loads.length === 0}
                                className="w-full h-8 text-xs font-medium bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                                Limpiar Todo
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
