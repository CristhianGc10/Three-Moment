// src/hooks/useCanvas.ts

import type {
    CanvasConfig,
    CanvasHoverInfo,
    CanvasMouseEvent,
    DrawingState,
    Load,
} from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCanvasOptions {
    width?: number;
    height?: number;
    autoRedraw?: boolean;
    enableInteraction?: boolean;
    onLoadHover?: (load: Load | null) => void;
    onLoadClick?: (load: Load) => void;
}

export function useCanvas(options: UseCanvasOptions = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawingState, setDrawingState] = useState<DrawingState>({
        isDrawing: false,
        isDirty: true,
        lastUpdate: Date.now(),
    });
    const [hoverInfo, setHoverInfo] = useState<CanvasHoverInfo | null>(null);
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

    // Configuración del canvas
    const config: CanvasConfig = {
        width: options.width || 1200,
        height: options.height || 400,
        margin: 80,
        scale: 1,
        backgroundColor: '#fafafa',
    };

    /**
     * Obtiene el contexto del canvas
     */
    const getContext = useCallback((): CanvasRenderingContext2D | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.getContext('2d');
    }, []);

    /**
     * Limpia el canvas completamente
     */
    const clearCanvas = useCallback(() => {
        const ctx = getContext();
        if (!ctx) return;

        ctx.clearRect(0, 0, config.width, config.height);

        // Aplicar color de fondo si está especificado
        if (config.backgroundColor) {
            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(0, 0, config.width, config.height);
        }
    }, [config, getContext]);

    /**
     * Marca el canvas como necesitando redibujado
     */
    const invalidate = useCallback(() => {
        setDrawingState((prev) => ({
            ...prev,
            isDirty: true,
            lastUpdate: Date.now(),
        }));
    }, []);

    /**
     * Convierte coordenadas de pantalla a coordenadas del canvas
     */
    const screenToCanvas = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, []);

    /**
     * Convierte coordenadas del canvas a coordenadas de la viga
     */
    const canvasToBeam = useCallback(
        (x: number, spanLength: number, offsetX: number = config.margin) => {
            const beamLength = config.width - 2 * config.margin;
            const scale = beamLength / spanLength;
            return (x - offsetX) / scale;
        },
        [config]
    );

    /**
     * Detecta qué carga está bajo el cursor
     */
    const detectLoadAtPosition = useCallback(
        (
            loads: Load[],
            x: number,
            y: number,
            spanLength: number,
            beamY: number = config.height / 2
        ): Load | null => {
            const offsetX = config.margin;
            const scale = (config.width - 2 * config.margin) / spanLength;
            const tolerance = 20; // Píxeles de tolerancia

            for (const load of loads) {
                switch (load.type) {
                    case 'point':
                        const pointX = offsetX + load.position * scale;
                        if (
                            Math.abs(x - pointX) < tolerance &&
                            Math.abs(y - beamY) < 60
                        ) {
                            return load;
                        }
                        break;

                    case 'distributed':
                        const startX = offsetX + load.start * scale;
                        const endX = offsetX + load.end * scale;
                        if (
                            x >= startX - tolerance &&
                            x <= endX + tolerance &&
                            y < beamY &&
                            y > beamY - 80
                        ) {
                            return load;
                        }
                        break;

                    case 'moment':
                        const momentX = offsetX + load.position * scale;
                        const distance = Math.sqrt(
                            Math.pow(x - momentX, 2) + Math.pow(y - beamY, 2)
                        );
                        if (distance < 35) {
                            return load;
                        }
                        break;
                }
            }

            return null;
        },
        [config]
    );

    /**
     * Maneja eventos de mouse
     */
    const handleMouseMove = useCallback(
        (event: MouseEvent, loads: Load[], spanLength: number) => {
            if (!options.enableInteraction) return;

            const canvasPos = screenToCanvas(event.clientX, event.clientY);
            const beamPosition = canvasToBeam(canvasPos.x, spanLength);
            const hoveredLoad = detectLoadAtPosition(
                loads,
                canvasPos.x,
                canvasPos.y,
                spanLength
            );

            // Actualizar información de hover
            setHoverInfo({
                position: Math.max(0, Math.min(spanLength, beamPosition)),
                loads: hoveredLoad ? [hoveredLoad.id] : [],
            });

            // Callback de hover
            if (options.onLoadHover) {
                options.onLoadHover(hoveredLoad);
            }

            // Cambiar cursor
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.style.cursor = hoveredLoad ? 'pointer' : 'default';
            }
        },
        [
            options.enableInteraction,
            options.onLoadHover,
            screenToCanvas,
            canvasToBeam,
            detectLoadAtPosition,
        ]
    );

    const handleMouseClick = useCallback(
        (event: MouseEvent, loads: Load[], spanLength: number) => {
            if (!options.enableInteraction) return;

            const canvasPos = screenToCanvas(event.clientX, event.clientY);
            const clickedLoad = detectLoadAtPosition(
                loads,
                canvasPos.x,
                canvasPos.y,
                spanLength
            );

            if (clickedLoad) {
                setSelectedLoad(clickedLoad);
                if (options.onLoadClick) {
                    options.onLoadClick(clickedLoad);
                }
            } else {
                setSelectedLoad(null);
            }
        },
        [
            options.enableInteraction,
            options.onLoadClick,
            screenToCanvas,
            detectLoadAtPosition,
        ]
    );

    /**
     * Configura listeners de eventos
     */
    const setupEventListeners = useCallback(
        (loads: Load[], spanLength: number) => {
            const canvas = canvasRef.current;
            if (!canvas || !options.enableInteraction) return;

            const mouseMoveHandler = (e: MouseEvent) =>
                handleMouseMove(e, loads, spanLength);
            const mouseClickHandler = (e: MouseEvent) =>
                handleMouseClick(e, loads, spanLength);

            canvas.addEventListener('mousemove', mouseMoveHandler);
            canvas.addEventListener('click', mouseClickHandler);

            return () => {
                canvas.removeEventListener('mousemove', mouseMoveHandler);
                canvas.removeEventListener('click', mouseClickHandler);
            };
        },
        [options.enableInteraction, handleMouseMove, handleMouseClick]
    );

    /**
     * Redimensiona el canvas para pantallas de alta densidad
     */
    const setupHighDPI = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Configurar el tamaño del canvas en píxeles del dispositivo
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;

        // Escalar el contexto para compensar la densidad de píxeles
        ctx.scale(devicePixelRatio, devicePixelRatio);

        // Mantener el tamaño CSS original
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }, []);

    /**
     * Exporta el canvas como imagen
     */
    const exportAsImage = useCallback(
        (
            format: 'png' | 'jpeg' = 'png',
            quality: number = 1.0
        ): string | null => {
            const canvas = canvasRef.current;
            if (!canvas) return null;

            return canvas.toDataURL(`image/${format}`, quality);
        },
        []
    );

    /**
     * Descarga el canvas como archivo de imagen
     */
    const downloadAsImage = useCallback(
        (filename: string = 'diagram.png', format: 'png' | 'jpeg' = 'png') => {
            const dataUrl = exportAsImage(format);
            if (!dataUrl) return;

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        [exportAsImage]
    );

    /**
     * Anima una transición suave
     */
    const animateTransition = useCallback(
        (duration: number = 300, easing: (t: number) => number = (t) => t) => {
            setDrawingState((prev) => ({ ...prev, isDrawing: true }));

            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing(progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setDrawingState((prev) => ({ ...prev, isDrawing: false }));
                }
            };

            requestAnimationFrame(animate);
        },
        []
    );

    // Configurar el canvas cuando se monta el componente
    useEffect(() => {
        setupHighDPI();
    }, [setupHighDPI]);

    return {
        canvasRef,
        context: getContext(),
        config,
        drawingState,
        hoverInfo,
        selectedLoad,

        // Funciones de control
        clearCanvas,
        invalidate,

        // Funciones de conversión de coordenadas
        screenToCanvas,
        canvasToBeam,

        // Funciones de interacción
        detectLoadAtPosition,
        setupEventListeners,

        // Funciones de exportación
        exportAsImage,
        downloadAsImage,

        // Funciones de animación
        animateTransition,

        // Estados
        setSelectedLoad,
        setHoverInfo,
    };
}
