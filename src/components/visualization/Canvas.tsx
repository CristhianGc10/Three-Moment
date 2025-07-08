// src/components/visualization/Canvas.tsx

import type { Load, MomentCalculationPoint } from '../../types';
import { drawAllLoads, highlightLoad } from '../../utils/drawing/loadDrawer';
import {
    drawElegantSupport,
    drawIntelligentRule,
    drawProfessionalBeam,
} from '../../utils/drawing/beamDrawer';
import { forwardRef, useEffect } from 'react';

import { clsx } from 'clsx';
import { drawMomentDiagram } from '../../utils/drawing/diagramDrawer';
import { useCanvas } from '../../hooks/useCanvas';

interface CanvasProps {
    loads: Load[];
    spanLength: number;
    momentPoints?: MomentCalculationPoint[];
    maxMoment?: number;
    width?: number;
    height?: number;
    showMomentDiagram?: boolean;
    enableInteraction?: boolean;
    className?: string;
    onLoadHover?: (load: Load | null) => void;
    onLoadClick?: (load: Load) => void;
    onExport?: () => void;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
    (
        {
            loads,
            spanLength,
            momentPoints = [],
            maxMoment = 0,
            width = 1200,
            height = 400,
            showMomentDiagram = false,
            enableInteraction = false,
            className,
            onLoadHover,
            onLoadClick,
            onExport,
        },
        ref
    ) => {
        const {
            canvasRef,
            context,
            config,
            clearCanvas,
            setupEventListeners,
            selectedLoad,
            hoverInfo,
            exportAsImage,
            downloadAsImage,
        } = useCanvas({
            width,
            height,
            enableInteraction,
            onLoadHover,
            onLoadClick,
        });

        // Función principal de dibujo
        const draw = () => {
            const ctx = context;
            if (!ctx) return;

            // Limpiar canvas
            clearCanvas();

            // Configuración de dibujo
            const margin = config.margin;
            const maxBeamLength = width - 2 * margin;
            const scale = maxBeamLength / spanLength;
            const offsetX = margin;
            const offsetY = showMomentDiagram ? height * 0.3 : height / 2;
            const beamLength = spanLength * scale;

            // Dibujar viga principal
            drawProfessionalBeam(ctx, offsetX, offsetY, beamLength);

            // Dibujar apoyos
            drawElegantSupport(ctx, offsetX, offsetY);
            drawElegantSupport(ctx, offsetX + beamLength, offsetY);

            // Dibujar todas las cargas
            drawAllLoads(ctx, loads, offsetX, offsetY, scale);

            // Resaltar carga seleccionada o en hover
            if (selectedLoad) {
                highlightLoad(ctx, selectedLoad, offsetX, offsetY, scale);
            }

            // Dibujar regla inteligente
            drawIntelligentRule(
                ctx,
                offsetX,
                offsetY + 60,
                beamLength,
                spanLength
            );

            // Dibujar diagrama de momentos si está habilitado
            if (showMomentDiagram && momentPoints.length > 0) {
                const diagramY = height * 0.75;
                drawMomentDiagram(
                    ctx,
                    momentPoints,
                    offsetX,
                    diagramY,
                    beamLength,
                    spanLength,
                    maxMoment
                );
            }

            // Dibujar información de hover
            if (enableInteraction && hoverInfo) {
                drawHoverInfo(ctx, hoverInfo, offsetX, offsetY, scale);
            }

            // Dibujar información del proyecto
            drawProjectInfo(ctx, loads.length, spanLength);
        };

        // Dibujar información de hover
        const drawHoverInfo = (
            ctx: CanvasRenderingContext2D,
            info: any,
            offsetX: number,
            offsetY: number,
            scale: number
        ) => {
            const x = offsetX + info.position * scale;
            const y = offsetY - 100;

            // Línea vertical indicadora
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, offsetY - 50);
            ctx.lineTo(x, offsetY + 50);
            ctx.stroke();
            ctx.setLineDash([]);

            // Cuadro de información
            const text = `x = ${info.position.toFixed(2)} m`;
            ctx.font = '12px "Segoe UI", Arial';
            const textWidth = ctx.measureText(text).width;

            // Fondo del cuadro
            ctx.fillStyle = 'rgba(52, 152, 219, 0.9)';
            ctx.fillRect(x - textWidth / 2 - 8, y - 15, textWidth + 16, 20);

            // Texto
            ctx.fillStyle = 'white';
            ctx.fillText(text, x - textWidth / 2, y - 2);
        };

        // Dibujar información del proyecto
        const drawProjectInfo = (
            ctx: CanvasRenderingContext2D,
            numLoads: number,
            spanLength: number
        ) => {
            const info = [
                `Tramo: ${spanLength} m`,
                `Cargas: ${numLoads}`,
                `Análisis: Clapeyron`,
            ];

            ctx.font = '11px "Segoe UI", Arial';
            ctx.fillStyle = 'rgba(127, 140, 141, 0.8)';

            info.forEach((line, index) => {
                ctx.fillText(line, 10, height - 40 + index * 14);
            });
        };

        // Efecto para redibujar cuando cambien las dependencias
        useEffect(() => {
            draw();
        }, [
            loads,
            spanLength,
            momentPoints,
            maxMoment,
            showMomentDiagram,
            selectedLoad,
            hoverInfo,
        ]);

        // Configurar event listeners
        useEffect(() => {
            if (enableInteraction) {
                const cleanup = setupEventListeners(loads, spanLength);
                return cleanup;
            }
        }, [enableInteraction, loads, spanLength, setupEventListeners]);

        // Exponer funciones de exportación
        useEffect(() => {
            if (ref && typeof ref === 'object') {
                ref.current = canvasRef.current;
            }
        }, [ref, canvasRef]);

        // Funciones de exportación disponibles a través de props
        const handleExport = () => {
            if (onExport) {
                onExport();
            } else {
                downloadAsImage(`diagrama-${Date.now()}.png`);
            }
        };

        return (
            <div className={clsx('relative', className)}>
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className={clsx(
                        'border border-gray-200 rounded-lg bg-gray-50 shadow-sm',
                        'hover:shadow-md transition-shadow duration-200',
                        enableInteraction && 'cursor-crosshair'
                    )}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />

                {/* Controles de canvas */}
                {enableInteraction && (
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            onClick={handleExport}
                            className="px-3 py-1 bg-white bg-opacity-90 border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
                            title="Exportar como imagen"
                        >
                            💾 Exportar
                        </button>
                    </div>
                )}

                {/* Información de estado */}
                {enableInteraction && hoverInfo && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                        Posición: {hoverInfo.position.toFixed(2)} m
                        {hoverInfo.loads.length > 0 && (
                            <span className="ml-2">📍 Carga detectada</span>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Canvas.displayName = 'Canvas';
