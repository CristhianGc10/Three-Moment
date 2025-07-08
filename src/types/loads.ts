// src/types/loads.ts

export interface BaseLoad {
    id: string;
    type: LoadType;
}

export type LoadType = 'point' | 'distributed' | 'moment';

export interface PointLoad extends BaseLoad {
    type: 'point';
    position: number; // Posición en metros
    magnitude: number; // Magnitud en kN
}

export interface DistributedLoad extends BaseLoad {
    type: 'distributed';
    start: number; // Posición inicial en metros
    end: number; // Posición final en metros
    w1: number; // Carga inicial en kN/m
    w2: number; // Carga final en kN/m
}

export interface MomentLoad extends BaseLoad {
    type: 'moment';
    position: number; // Posición en metros
    magnitude: number; // Magnitud en kN⋅m
}

export type Load = PointLoad | DistributedLoad | MomentLoad;

export interface LoadInputData {
    type: LoadType;
    position?: number;
    magnitude?: number;
    start?: number;
    end?: number;
    w1?: number;
    w2?: number;
    momentPosition?: number;
    momentMagnitude?: number;
}

// Tipos para validación de cargas
export interface LoadValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Tipos para la configuración del tramo
export interface SpanConfiguration {
    length: number; // Longitud en metros
    maxLength?: number;
    minLength?: number;
}
