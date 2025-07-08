// src/utils/calculations/momentCalculator.ts

import type { Load, MomentCalculationPoint } from '../../types';

/**
 * Calcula el momento en una posición específica para una viga simplemente apoyada
 * usando el Teorema de Clapeyron
 */
export function calculateMomentAtPosition(
    loads: Load[],
    x: number,
    spanLength: number
): number {
    let moment = 0;

    loads.forEach((load) => {
        moment += calculateMomentFromSingleLoad(load, x, spanLength);
    });

    return moment;
}

/**
 * Calcula el momento producido por una sola carga en una posición x
 */
function calculateMomentFromSingleLoad(
    load: Load,
    x: number,
    spanLength: number
): number {
    switch (load.type) {
        case 'point':
            return calculateMomentFromPointLoad(
                load.magnitude,
                load.position,
                x,
                spanLength
            );

        case 'distributed':
            return calculateMomentFromDistributedLoad(
                load.w1,
                load.w2,
                load.start,
                load.end,
                x,
                spanLength
            );

        case 'moment':
            return calculateMomentFromAppliedMoment(
                load.magnitude,
                load.position,
                x,
                spanLength
            );

        default:
            return 0;
    }
}

/**
 * Momento debido a carga puntual P en posición a
 */
function calculateMomentFromPointLoad(
    P: number,
    a: number,
    x: number,
    L: number
): number {
    // Reacciones: R1 = P*(L-a)/L, R2 = P*a/L
    const R1 = (P * (L - a)) / L;

    if (x <= a) {
        return R1 * x;
    } else {
        return R1 * x - P * (x - a);
    }
}

/**
 * Momento debido a carga distribuida (uniforme o trapezoidal)
 */
function calculateMomentFromDistributedLoad(
    w1: number,
    w2: number,
    start: number,
    end: number,
    x: number,
    L: number
): number {
    const length = end - start;

    if (length <= 0) return 0;

    if (Math.abs(w1 - w2) < 1e-6) {
        // Carga uniforme
        return calculateUniformLoadMoment(w1, start, end, x, L);
    } else {
        // Carga trapezoidal/triangular
        return calculateTrapezoidalLoadMoment(w1, w2, start, end, x, L);
    }
}

/**
 * Momento debido a carga uniforme
 */
function calculateUniformLoadMoment(
    w: number,
    start: number,
    end: number,
    x: number,
    L: number
): number {
    const length = end - start;
    const W = w * length; // Carga total
    const center = (start + end) / 2; // Centro de aplicación

    // Reacción en apoyo izquierdo
    const R1 = (W * (L - center)) / L;

    if (x <= start) {
        return R1 * x;
    } else if (x <= end) {
        // Momento debido a R1 menos momento debido a la carga distribuida aplicada hasta x
        const distributedLength = x - start;
        const distributedMoment =
            (w * distributedLength * distributedLength) / 2;
        return R1 * x - distributedMoment;
    } else {
        // Momento debido a R1 menos momento total de la carga distribuida
        const totalDistributedMoment = W * (x - center);
        return R1 * x - totalDistributedMoment;
    }
}

/**
 * Momento debido a carga trapezoidal
 */
function calculateTrapezoidalLoadMoment(
    w1: number,
    w2: number,
    start: number,
    end: number,
    x: number,
    L: number
): number {
    const length = end - start;

    // Carga total equivalente
    const W = ((w1 + w2) * length) / 2;

    // Centroide de la carga trapezoidal
    let centroidOffset;
    if (Math.abs(w1 + w2) < 1e-10) {
        // Si w1 + w2 ≈ 0, usar el centro geométrico
        centroidOffset = length / 2;
    } else {
        centroidOffset = (length * (w1 + 2 * w2)) / (3 * (w1 + w2));
    }
    const centroid = start + centroidOffset;

    // Reacción en apoyo izquierdo
    const R1 = (W * (L - centroid)) / L;

    if (x <= start) {
        return R1 * x;
    } else if (x <= end) {
        // Calcular integral de la carga trapezoidal hasta posición x
        const xi = x - start;
        const integral =
            (w1 * xi * xi) / 2 + ((w2 - w1) * xi * xi * xi) / (6 * length);
        return R1 * x - integral;
    } else {
        // Momento total de la carga trapezoidal
        return R1 * x - W * (x - centroid);
    }
}

/**
 * Momento debido a momento aplicado M0 en posición a
 */
function calculateMomentFromAppliedMoment(
    M0: number,
    a: number,
    x: number,
    L: number
): number {
    if (x <= a) {
        return (-M0 * x) / L;
    } else {
        return (M0 * (L - x)) / L;
    }
}

/**
 * Genera puntos de momento para todo el tramo
 */
export function generateMomentPoints(
    loads: Load[],
    spanLength: number,
    numPoints: number = 200
): MomentCalculationPoint[] {
    const points: MomentCalculationPoint[] = [];
    const dx = spanLength / numPoints;

    for (let i = 0; i <= numPoints; i++) {
        const x = i * dx;
        const moment = calculateMomentAtPosition(loads, x, spanLength);
        points.push({ x, moment });
    }

    return points;
}

/**
 * Encuentra el momento máximo y su posición
 */
export function findMaxMoment(momentPoints: MomentCalculationPoint[]): {
    maxMoment: number;
    maxMomentPosition: number;
} {
    let maxMoment = 0;
    let maxMomentPosition = 0;

    momentPoints.forEach((point) => {
        if (Math.abs(point.moment) > Math.abs(maxMoment)) {
            maxMoment = point.moment;
            maxMomentPosition = point.x;
        }
    });

    return { maxMoment: Math.abs(maxMoment), maxMomentPosition };
}
