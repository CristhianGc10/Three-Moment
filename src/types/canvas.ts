// src/types/canvas.ts

export interface CanvasConfig {
    width: number;
    height: number;
    margin: number;
    scale: number;
    backgroundColor?: string;
}

export interface DrawingScale {
    x: number; // Escala horizontal (píxeles por metro)
    y: number; // Escala vertical para fuerzas
    momentScale: number; // Escala para momentos
}

export interface DrawingOffsets {
    x: number; // Offset horizontal
    y: number; // Offset vertical (línea base de la viga)
}

export interface BeamDrawingConfig {
    height: number; // Altura de la viga en píxeles
    color: string;
    shadowColor: string;
    shadowOffset: number;
}

export interface LoadDrawingConfig {
    arrowColor: string;
    arrowWidth: number;
    maxArrowLength: number;
    labelFont: string;
    labelColor: string;
    labelBackgroundColor: string;
}

export interface SupportDrawingConfig {
    width: number;
    height: number;
    color: string;
    baseColor: string;
}

export interface GridConfig {
    show: boolean;
    color: string;
    lineWidth: number;
    majorInterval: number;
    minorInterval: number;
}

export interface DiagramConfig {
    lineColor: string;
    lineWidth: number;
    fillColor: string;
    fillOpacity: number;
    pointColor: string;
    pointRadius: number;
}

export interface CanvasPoint {
    x: number;
    y: number;
}

export interface CanvasRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Tipos para animaciones (para futuras mejoras)
export interface AnimationConfig {
    duration: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    delay?: number;
}

export interface DrawingState {
    isDrawing: boolean;
    isDirty: boolean; // Si necesita redibujarse
    lastUpdate: number;
}

// Tipos para eventos del canvas
export interface CanvasMouseEvent {
    x: number;
    y: number;
    button: number;
    ctrlKey: boolean;
    shiftKey: boolean;
}

export interface CanvasHoverInfo {
    position: number; // Posición en metros
    moment?: number; // Momento en esa posición
    loads: string[]; // Cargas cercanas
}
