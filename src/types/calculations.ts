// src/types/calculations.ts

export interface MomentCalculationPoint {
    x: number; // Posición en metros
    moment: number; // Momento en kN⋅m
}

export interface AlphaResults {
    alpha1: number; // Alfa para extremo izquierdo
    alpha2: number; // Alfa para extremo derecho
    area: number; // Área del diagrama de momentos
    centroidLeft: number; // Centroide desde apoyo izquierdo
    centroidRight: number; // Centroide desde apoyo derecho
    isSymmetric: boolean; // Si las cargas son simétricas
    maxMoment: number; // Momento máximo
    maxMomentPosition: number; // Posición del momento máximo
}

export interface CalculationConfig {
    spanLength: number;
    numPoints: number; // Número de puntos para integración numérica
    tolerance: number; // Tolerancia para verificar simetría
}

export interface IntegrationResult {
    area: number;
    firstMoment: number;
    firstMomentRight: number;
}

export interface ReactionForces {
    R1: number; // Reacción en apoyo izquierdo
    R2: number; // Reacción en apoyo derecho
    M1?: number; // Momento de reacción en apoyo izquierdo (si existe)
    M2?: number; // Momento de reacción en apoyo derecho (si existe)
}

// Tipos para el análisis de simetría
export interface SymmetryAnalysis {
    isSymmetric: boolean;
    symmetryType: 'perfect' | 'approximate' | 'none';
    confidence: number; // 0-1, qué tan simétrica es
    details: string[];
}

// Tipos para validación de cálculos
export interface CalculationValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
}
