// src/utils/constants.ts

import type {
    BeamDrawingConfig,
    CalculationConfig,
    CanvasConfig,
    DiagramConfig,
    LoadDrawingConfig,
    SupportDrawingConfig,
} from '../types';

// Configuración por defecto del tramo
export const DEFAULT_SPAN_CONFIG = {
    length: 6,
    minLength: 1,
    maxLength: 500,
    step: 0.1,
} as const;

// Configuración por defecto de cálculos
export const DEFAULT_CALCULATION_CONFIG: CalculationConfig = {
    spanLength: 6,
    numPoints: 1000,
    tolerance: 0.001,
};

// Configuración del canvas principal
export const MAIN_CANVAS_CONFIG: CanvasConfig = {
    width: 1200,
    height: 400,
    margin: 100,
    scale: 1,
    backgroundColor: '#fafafa',
};

// Configuración del canvas de diagrama de momentos
export const MOMENT_CANVAS_CONFIG: CanvasConfig = {
    width: 1200,
    height: 300,
    margin: 100,
    scale: 1,
    backgroundColor: '#fafafa',
};

// Configuración de dibujo de la viga
export const BEAM_DRAWING_CONFIG: BeamDrawingConfig = {
    height: 16,
    color: '#2c3e50',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: 3,
};

// Configuración de dibujo de cargas
export const LOAD_DRAWING_CONFIG: LoadDrawingConfig = {
    arrowColor: '#e74c3c',
    arrowWidth: 8,
    maxArrowLength: 120,
    labelFont: 'bold 13px "Segoe UI", Arial',
    labelColor: '#2c3e50',
    labelBackgroundColor: 'rgba(255, 255, 255, 0.95)',
};

// Configuración de dibujo de apoyos
export const SUPPORT_DRAWING_CONFIG: SupportDrawingConfig = {
    width: 40,
    height: 30,
    color: '#34495e',
    baseColor: '#2c3e50',
};

// Configuración del diagrama de momentos
export const MOMENT_DIAGRAM_CONFIG: DiagramConfig = {
    lineColor: '#e74c3c',
    lineWidth: 4,
    fillColor: 'rgba(231, 76, 60, 0.4)',
    fillOpacity: 0.3,
    pointColor: '#c0392b',
    pointRadius: 4,
};

// Colores del tema
export const THEME_COLORS = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        900: '#1e3a8a',
    },
    secondary: {
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
    },
    success: {
        500: '#10b981',
        600: '#059669',
    },
    warning: {
        500: '#f59e0b',
        600: '#d97706',
    },
    danger: {
        500: '#ef4444',
        600: '#dc2626',
    },
    gray: {
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        500: '#6b7280',
        700: '#374151',
        900: '#111827',
    },
} as const;

// Configuración de colores para tipos de carga
export const LOAD_COLORS = {
    point: {
        primary: '#e74c3c',
        secondary: '#c0392b',
        gradient: ['#e74c3c', '#c0392b'],
    },
    distributed: {
        primary: '#9b59b6',
        secondary: '#8e44ad',
        gradient: ['#9b59b6', '#8e44ad'],
        fill: 'rgba(155, 89, 182, 0.3)',
    },
    moment: {
        primary: '#f39c12',
        secondary: '#e67e22',
        gradient: ['#f39c12', '#e67e22'],
    },
} as const;

// Validaciones
export const VALIDATION_LIMITS = {
    span: {
        min: 0.1,
        max: 500,
    },
    load: {
        minMagnitude: -1000,
        maxMagnitude: 1000,
    },
    position: {
        min: 0,
        precision: 3, // Decimales máximos
    },
} as const;

// Configuración de animaciones
export const ANIMATION_CONFIG = {
    duration: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
} as const;

// Texto y mensajes
export const MESSAGES = {
    noLoads: 'Por favor, agrega al menos una carga para calcular.',
    symmetricLoads:
        'Cargas simétricas: Un solo valor α aplicable a ambos extremos',
    asymmetricLoads:
        'Cargas asimétricas: Dos valores α diferentes para cada extremo del tramo',
    invalidSpan: 'La longitud del tramo debe estar entre {min} y {max} metros',
    loadOutOfBounds: 'La carga está fuera de los límites del tramo',
    invalidLoadData: 'Los datos de la carga no son válidos',
} as const;

// Configuración de formato numérico
export const NUMBER_FORMAT = {
    decimals: {
        position: 3,
        magnitude: 3,
        alpha: 6,
        moment: 4,
    },
    units: {
        length: 'm',
        force: 'kN',
        moment: 'kN⋅m',
        distributedLoad: 'kN/m',
    },
} as const;
