// src/components/visualization/MomentDiagram.tsx

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import type { MomentCalculationPoint } from '../../types';

interface MomentDiagramProps {
    momentPoints: MomentCalculationPoint[];
    spanLength: number;
    maxMoment: number;
    className?: string;
}

export function MomentDiagram({
    momentPoints,
    spanLength,
    maxMoment,
    className,
}: MomentDiagramProps) {
    if (!momentPoints.length) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                    No hay datos para mostrar el diagrama
                </p>
            </div>
        );
    }

    // Dimensiones del SVG responsivas optimizadas para aprovechar más espacio lateral
    const viewBoxWidth = 1200;
    const viewBoxHeight = 500; // Igualado con StructuralVisualization
    const margin = { top: 40, right: 40, bottom: 60, left: 40 }; // Márgenes uniformes como StructuralVisualization
    const chartWidth = viewBoxWidth - margin.left - margin.right;
    const chartHeight = viewBoxHeight - margin.top - margin.bottom;

    // Encontrar valores extremos
    const maxAbsMoment = Math.max(
        Math.abs(maxMoment),
        Math.max(...momentPoints.map((p) => Math.abs(p.moment)))
    );

    // Escalas
    const xScale = (x: number) => margin.left + (x / spanLength) * chartWidth;
    const yScale = (moment: number) =>
        margin.top + chartHeight / 2 - (moment / maxAbsMoment) * (chartHeight / 2 - 20);

    // Generar puntos para la curva
    const pathData = momentPoints
        .map((point, index) => {
            const x = xScale(point.x);
            const y = yScale(point.moment);
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        })
        .join(' ');

    // Generar área bajo la curva
    const areaData = momentPoints
        .map((point, index) => {
            const x = xScale(point.x);
            const y = yScale(point.moment);
            if (index === 0) {
                return `M ${x} ${yScale(0)} L ${x} ${y}`;
            }
            return `L ${x} ${y}`;
        })
        .join(' ') + ` L ${xScale(momentPoints[momentPoints.length - 1].x)} ${yScale(0)} Z`;

    // Encontrar punto de momento máximo (absoluto)
    const maxAbsPoint = momentPoints.reduce((max, current) => 
        Math.abs(current.moment) > Math.abs(max.moment) ? current : max
    );
    
    // Usar el punto con mayor valor absoluto como punto máximo
    const maxPoint = maxAbsPoint;

    return (
        <div className={clsx('w-full', className)}>
            {/* Título responsivo */}
            <div className="mb-2 sm:mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="flex items-center gap-2">
                        📈 Diagrama de Momentos
                    </span>
                    <span className="text-xs sm:text-sm font-normal text-blue-100">
                        Tramo: {spanLength}m | Puntos: {momentPoints.length} | Máx: {maxMoment.toFixed(2)} kN⋅m
                    </span>
                </h2>
            </div>
            
            {/* Canvas completamente responsivo */}
            <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl border border-gray-200 overflow-hidden">
                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className="w-full h-auto bg-gradient-to-br from-slate-50 to-slate-100"
                    style={{
                        aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`,
                        minHeight: '300px',
                        maxHeight: '650px',
                    }}
                >
                        {/* Definiciones de gradientes y efectos */}
                        <defs>
                            {/* Gradientes para la curva de momento */}
                            <linearGradient id="momentCurveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#1d4ed8" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                            
                            {/* Gradiente para el área bajo la curva */}
                            <linearGradient id="momentAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
                            </linearGradient>
                            
                            {/* Gradiente para la viga */}
                            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#6b7280" />
                                <stop offset="50%" stopColor="#4b5563" />
                                <stop offset="100%" stopColor="#374151" />
                            </linearGradient>
                            
                            {/* Gradiente para los ejes */}
                            <linearGradient id="axisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#374151" />
                                <stop offset="100%" stopColor="#6b7280" />
                            </linearGradient>
                            
                            {/* Filtro de sombra suave */}
                            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2"/>
                            </filter>
                            
                            {/* Gradiente para la viga principal */}
                            <linearGradient id="beamMainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#9ca3af" />
                                <stop offset="30%" stopColor="#6b7280" />
                                <stop offset="70%" stopColor="#4b5563" />
                                <stop offset="100%" stopColor="#374151" />
                            </linearGradient>
                            
                            {/* Filtro de sombra para la viga */}
                            <filter id="beamShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.15"/>
                            </filter>
                        </defs>

                        {/* Ejes de coordenadas */}
                        <g>
                            {/* Eje horizontal (X) */}
                            <line
                                x1={margin.left - 20}
                                y1={yScale(0)}
                                x2={margin.left + chartWidth + 20}
                                y2={yScale(0)}
                                stroke="url(#axisGradient)"
                                strokeWidth="2"
                            />
                            
                            {/* Eje vertical (Y) */}
                            <line
                                x1={margin.left}
                                y1={margin.top - 20}
                                x2={margin.left}
                                y2={margin.top + chartHeight + 20}
                                stroke="url(#axisGradient)"
                                strokeWidth="2"
                            />
                            
                            {/* Leyenda de ejes */}
                            <g className="legend">
                                <rect
                                    x={margin.left + chartWidth - 180}
                                    y={margin.top + 10}
                                    width={170}
                                    height={50}
                                    fill="white"
                                    stroke="#d1d5db"
                                    strokeWidth="1"
                                    rx="4"
                                    opacity="0.95"
                                />
                                <text
                                    x={margin.left + chartWidth - 175}
                                    y={margin.top + 28}
                                    className="text-xs fill-gray-700 font-medium"
                                >
                                    Eje X: Distancia (m)
                                </text>
                                <text
                                    x={margin.left + chartWidth - 175}
                                    y={margin.top + 45}
                                    className="text-xs fill-gray-700 font-medium"
                                >
                                    Eje Y: Momento (kN⋅m)
                                </text>
                            </g>
                        </g>

                        {/* Representación de la viga */}
                        <g>
                            {/* Viga principal */}
                            <rect
                                x={margin.left}
                                y={yScale(0) - 5}
                                width={chartWidth}
                                height="10"
                                fill="url(#beamMainGradient)"
                                stroke="#374151"
                                strokeWidth="2"
                                rx="3"
                                filter="url(#beamShadow)"
                            />
                            
                            {/* Apoyos */}
                            {/* Apoyo izquierdo */}
                            <g>
                                <polygon
                                    points={`${margin.left},${yScale(0) + 5} ${margin.left - 15},${yScale(0) + 28} ${margin.left + 15},${yScale(0) + 28}`}
                                    fill="#2d3748"
                                    stroke="#1a202c"
                                    strokeWidth="2"
                                />
                                <rect
                                    x={margin.left - 20}
                                    y={yScale(0) + 28}
                                    width={40}
                                    height={8}
                                    fill="#1a202c"
                                />
                            </g>
                            {/* Apoyo derecho */}
                            <g>
                                <polygon
                                    points={`${margin.left + chartWidth},${yScale(0) + 5} ${margin.left + chartWidth - 15},${yScale(0) + 28} ${margin.left + chartWidth + 15},${yScale(0) + 28}`}
                                    fill="#2d3748"
                                    stroke="#1a202c"
                                    strokeWidth="2"
                                />
                                <rect
                                    x={margin.left + chartWidth - 20}
                                    y={yScale(0) + 28}
                                    width={40}
                                    height={8}
                                    fill="#1a202c"
                                />
                            </g>
                        </g>



                        {/* Grilla de fondo sutil */}
                        <g stroke="#f1f5f9" strokeWidth="1" opacity="0.8">
                            {/* Líneas verticales */}
                            {Array.from({ length: 11 }, (_, i) => {
                                const x = margin.left + (i * chartWidth) / 10;
                                return (
                                    <line
                                        key={`v-grid-${i}`}
                                        x1={x}
                                        y1={margin.top}
                                        x2={x}
                                        y2={viewBoxHeight - margin.bottom}
                                    />
                                );
                            })}
                            {/* Líneas horizontales */}
                            {Array.from({ length: 6 }, (_, i) => {
                                const y = margin.top + (i * (viewBoxHeight - margin.top - margin.bottom)) / 5;
                                return (
                                    <line
                                        key={`h-grid-${i}`}
                                        x1={margin.left}
                                        y1={y}
                                        x2={margin.left + chartWidth}
                                        y2={y}
                                    />
                                );
                            })}
                        </g>

                        {/* Área bajo la curva */}
                        <path
                            d={areaData}
                            fill="url(#momentAreaGradient)"
                            stroke="none"
                        />

                        {/* Curva de momentos principal */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke="url(#momentCurveGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#softShadow)"
                        />

                        {/* Puntos de datos */}
                        {momentPoints.map((point, index) => {
                            if (index % Math.ceil(momentPoints.length / 20) === 0) {
                                return (
                                    <circle
                                        key={`point-${index}`}
                                        cx={xScale(point.x)}
                                        cy={yScale(point.moment)}
                                        r="2"
                                        fill="#6366f1"
                                        stroke="white"
                                        strokeWidth="1"
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Punto de momento máximo */}
                        {maxPoint && (
                            <g>
                                {/* Línea vertical de referencia */}
                                <line
                                    x1={xScale(maxPoint.x)}
                                    y1={yScale(maxPoint.moment)}
                                    x2={xScale(maxPoint.x)}
                                    y2={yScale(0)}
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray="8,4"
                                    opacity="0.7"
                                />
                                
                                {/* Punto máximo */}
                                <circle
                                    cx={xScale(maxPoint.x)}
                                    cy={yScale(maxPoint.moment)}
                                    r="6"
                                    fill="#ef4444"
                                    stroke="white"
                                    strokeWidth="2"
                                    filter="url(#softShadow)"
                                />
                                
                                {/* Etiqueta del punto máximo */}
                                <g>
                                    {(() => {
                                         const isNegative = maxPoint.moment < 0;
                                         const textY = isNegative ? yScale(maxPoint.moment) + 20 : yScale(maxPoint.moment) - 15;
                                         
                                         return (
                                             <text
                                                 x={xScale(maxPoint.x)}
                                                 y={textY}
                                                 textAnchor="middle"
                                                 className="text-sm fill-red-600 font-bold"
                                                 filter="url(#softShadow)"
                                             >
                                                 {maxPoint.moment.toFixed(2)} kN⋅m
                                             </text>
                                         );
                                     })()
                                    }
                                </g>
                            </g>
                        )}


                </svg>
            </div>
        </div>
    );
}
