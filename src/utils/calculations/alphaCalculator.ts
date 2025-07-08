// src/utils/calculations/alphaCalculator.ts

import type {
    AlphaResults,
    IntegrationResult,
    Load,
    MomentCalculationPoint,
} from '../../types';
import { findMaxMoment, generateMomentPoints } from './momentCalculator';

import { checkLoadSymmetry } from './symmetryChecker';

/**
 * Calcula los coeficientes alfa según el Teorema de Clapeyron
 * Método de los Tres Momentos
 */
export function calculateAlphas(
    loads: Load[],
    spanLength: number,
    numPoints: number = 1000
): AlphaResults {
    // Generar puntos de momento
    const momentPoints = generateMomentPoints(loads, spanLength, numPoints);

    // Calcular integrales numéricas
    const integrationResults = calculateIntegrals(momentPoints, spanLength);

    // Calcular centroides
    const centroidLeft =
        Math.abs(integrationResults.area) > 1e-10
            ? integrationResults.firstMoment / integrationResults.area
            : 0;

    const centroidRight =
        Math.abs(integrationResults.area) > 1e-10
            ? integrationResults.firstMomentRight / integrationResults.area
            : 0;

    // Calcular alfas - CORREGIDO: intercambiar centroides según el Teorema de Clapeyron
    // α₁ (extremo izquierdo) usa centroide desde apoyo derecho
    // α₂ (extremo derecho) usa centroide desde apoyo izquierdo
    const alpha1 =
        Math.abs(spanLength) > 1e-10
            ? (integrationResults.area * centroidRight) / spanLength
            : 0;

    const alpha2 =
        Math.abs(spanLength) > 1e-10
            ? (integrationResults.area * centroidLeft) / spanLength
            : 0;

    // Verificar simetría
    const isSymmetric = checkLoadSymmetry(loads, spanLength);

    // Encontrar momento máximo
    const { maxMoment, maxMomentPosition } = findMaxMoment(momentPoints);

    return {
        alpha1,
        alpha2,
        area: integrationResults.area,
        centroidLeft,
        centroidRight,
        isSymmetric,
        maxMoment,
        maxMomentPosition,
    };
}

/**
 * Calcula las integrales necesarias usando la regla del trapecio
 * A = ∫M(x)dx
 * ∫x⋅M(x)dx para centroide desde apoyo izquierdo
 * ∫(L-x)⋅M(x)dx para centroide desde apoyo derecho
 */
function calculateIntegrals(
    momentPoints: MomentCalculationPoint[],
    spanLength: number
): IntegrationResult {
    if (momentPoints.length < 2) {
        return { area: 0, firstMoment: 0, firstMomentRight: 0 };
    }

    let area = 0;
    let firstMoment = 0;
    let firstMomentRight = 0;

    // Regla del trapecio para integración numérica
    for (let i = 0; i < momentPoints.length - 1; i++) {
        const currentPoint = momentPoints[i];
        const nextPoint = momentPoints[i + 1];

        const dx = nextPoint.x - currentPoint.x;
        const avgMoment = (currentPoint.moment + nextPoint.moment) / 2;
        const avgX = (currentPoint.x + nextPoint.x) / 2;
        const avgXRight = spanLength - avgX;

        // Integrales
        area += avgMoment * dx;
        firstMoment += avgX * avgMoment * dx;
        firstMomentRight += avgXRight * avgMoment * dx;
    }

    return { area, firstMoment, firstMomentRight };
}

/**
 * Calcula alfa usando una aproximación analítica para cargas simples
 * (más rápido pero menos preciso que la integración numérica)
 */
export function calculateAlphaAnalytical(
    loads: Load[],
    spanLength: number
): AlphaResults {
    let area = 0;
    let firstMoment = 0;
    let firstMomentRight = 0;

    loads.forEach((load) => {
        const loadContribution = calculateLoadContribution(load, spanLength);
        area += loadContribution.area;
        firstMoment += loadContribution.firstMoment;
        firstMomentRight += loadContribution.firstMomentRight;
    });

    const centroidLeft = Math.abs(area) > 1e-10 ? firstMoment / area : 0;
    const centroidRight = Math.abs(area) > 1e-10 ? firstMomentRight / area : 0;

    // CORREGIDO: intercambiar centroides según el Teorema de Clapeyron
    const alpha1 =
        Math.abs(spanLength) > 1e-10 ? (area * centroidRight) / spanLength : 0;
    const alpha2 =
        Math.abs(spanLength) > 1e-10 ? (area * centroidLeft) / spanLength : 0;

    const isSymmetric = checkLoadSymmetry(loads, spanLength);

    return {
        alpha1,
        alpha2,
        area,
        centroidLeft,
        centroidRight,
        isSymmetric,
        maxMoment: 0, // Requiere cálculo numérico
        maxMomentPosition: 0,
    };
}

/**
 * Calcula la contribución de una carga individual al área y momentos
 */
function calculateLoadContribution(
    load: Load,
    spanLength: number
): IntegrationResult {
    switch (load.type) {
        case 'point':
            return calculatePointLoadContribution(
                load.magnitude,
                load.position,
                spanLength
            );

        case 'distributed':
            if (Math.abs(load.w1 - load.w2) < 1e-6) {
                return calculateUniformLoadContribution(
                    load.w1,
                    load.start,
                    load.end,
                    spanLength
                );
            } else {
                return calculateTrapezoidalLoadContribution(
                    load.w1,
                    load.w2,
                    load.start,
                    load.end,
                    spanLength
                );
            }

        case 'moment':
            return calculateMomentLoadContribution(
                load.magnitude,
                load.position,
                spanLength
            );

        default:
            return { area: 0, firstMoment: 0, firstMomentRight: 0 };
    }
}

/**
 * Contribución de carga puntual (fórmulas analíticas)
 */
function calculatePointLoadContribution(
    P: number,
    a: number,
    L: number
): IntegrationResult {
    const b = L - a;

    // Área bajo el diagrama de momentos
    const area = (P * a * b) / (2 * L);

    // Primer momento respecto al apoyo izquierdo
    const firstMoment = (P * a * b * (L + a)) / (6 * L);

    // Primer momento respecto al apoyo derecho
    const firstMomentRight = (P * a * b * (L + b)) / (6 * L);

    return { area, firstMoment, firstMomentRight };
}

/**
 * Contribución de carga uniforme (fórmulas analíticas)
 */
function calculateUniformLoadContribution(
    w: number,
    start: number,
    end: number,
    L: number
): IntegrationResult {
    const length = end - start;
    const W = w * length;
    const center = (start + end) / 2;

    // Aproximación usando carga puntual equivalente en el centro
    return calculatePointLoadContribution(W, center, L);
}

/**
 * Contribución de carga trapezoidal (aproximación)
 */
function calculateTrapezoidalLoadContribution(
    w1: number,
    w2: number,
    start: number,
    end: number,
    L: number
): IntegrationResult {
    const length = end - start;
    const W = ((w1 + w2) * length) / 2;
    
    // Verificar si la suma de cargas es cero para evitar división por cero
    let centroidOffset;
    if (Math.abs(w1 + w2) < 1e-10) {
        // Si w1 + w2 ≈ 0, usar el centro geométrico
        centroidOffset = length / 2;
    } else {
        centroidOffset = (length * (w1 + 2 * w2)) / (3 * (w1 + w2));
    }
    
    const center = start + centroidOffset;

    // Aproximación usando carga puntual equivalente en el centroide
    return calculatePointLoadContribution(W, center, L);
}

/**
 * Contribución de momento aplicado
 */
function calculateMomentLoadContribution(
    M0: number,
    a: number,
    L: number
): IntegrationResult {
    // Para momentos aplicados, el área es constante a lo largo del tramo
    const area = -M0; // Área negativa para momentos

    // Centroides (distribución lineal del momento)
    const firstMoment = (-M0 * L) / 2;
    const firstMomentRight = (-M0 * L) / 2;

    return { area, firstMoment, firstMomentRight };
}

/**
 * Valida los resultados de alfa y proporciona warnings si es necesario
 */
export function validateAlphaResults(results: AlphaResults): {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
} {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Verificar magnitudes razonables
    if (Math.abs(results.alpha1) > 1000 || Math.abs(results.alpha2) > 1000) {
        warnings.push(
            'Los valores de alfa son muy grandes, verifique las cargas aplicadas'
        );
    }

    if (Math.abs(results.alpha1) < 1e-10 && Math.abs(results.alpha2) < 1e-10) {
        warnings.push(
            'Los valores de alfa son muy pequeños, puede que no haya cargas significativas'
        );
    }

    // Verificar consistencia para cargas simétricas
    if (
        results.isSymmetric &&
        Math.abs(results.alpha1 - results.alpha2) > 1e-3
    ) {
        warnings.push(
            'Las cargas parecen simétricas pero los alfas son diferentes'
        );
        recommendations.push(
            'Verifique la simetría de las cargas o use un solo valor alfa'
        );
    }

    // Verificar centroides
    if (results.centroidLeft < 0 || results.centroidLeft > 1000) {
        warnings.push('El centroide izquierdo está fuera del rango esperado');
    }

    if (results.centroidRight < 0 || results.centroidRight > 1000) {
        warnings.push('El centroide derecho está fuera del rango esperado');
    }

    return {
        isValid: warnings.length === 0,
        warnings,
        recommendations,
    };
}
