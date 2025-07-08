// src/utils/calculations/symmetryChecker.ts

import type {
    DistributedLoad,
    Load,
    MomentLoad,
    PointLoad,
    SymmetryAnalysis,
} from '../../types';

/**
 * Verifica si las cargas aplicadas son simétricas respecto al centro del tramo
 */
export function checkLoadSymmetry(
    loads: Load[],
    spanLength: number,
    tolerance: number = 0.001
): boolean {
    if (loads.length === 0) return true;

    const analysis = analyzeLoadSymmetry(loads, spanLength, tolerance);
    return analysis.isSymmetric;
}

/**
 * Análisis detallado de la simetría de cargas
 */
export function analyzeLoadSymmetry(
    loads: Load[],
    spanLength: number,
    tolerance: number = 0.001
): SymmetryAnalysis {
    const center = spanLength / 2;
    const details: string[] = [];

    if (loads.length === 0) {
        return {
            isSymmetric: true,
            symmetryType: 'perfect',
            confidence: 1.0,
            details: ['No hay cargas aplicadas'],
        };
    }

    // Verificar cada carga individualmente
    const symmetryResults = loads.map((load) =>
        checkSingleLoadSymmetry(load, loads, center, spanLength, tolerance)
    );

    const allSymmetric = symmetryResults.every((result) => result.isSymmetric);
    const confidenceSum = symmetryResults.reduce(
        (sum, result) => sum + result.confidence,
        0
    );
    const averageConfidence = confidenceSum / symmetryResults.length;

    // Recopilar detalles
    symmetryResults.forEach((result, index) => {
        details.push(`Carga ${index + 1}: ${result.description}`);
    });

    let symmetryType: 'perfect' | 'approximate' | 'none';
    if (allSymmetric && averageConfidence > 0.95) {
        symmetryType = 'perfect';
    } else if (allSymmetric && averageConfidence > 0.8) {
        symmetryType = 'approximate';
    } else {
        symmetryType = 'none';
    }

    return {
        isSymmetric: allSymmetric,
        symmetryType,
        confidence: averageConfidence,
        details,
    };
}

/**
 * Verifica la simetría de una carga individual
 */
function checkSingleLoadSymmetry(
    load: Load,
    allLoads: Load[],
    center: number,
    spanLength: number,
    tolerance: number
): { isSymmetric: boolean; confidence: number; description: string } {
    switch (load.type) {
        case 'point':
            return checkPointLoadSymmetry(
                load as PointLoad,
                allLoads,
                center,
                tolerance
            );

        case 'distributed':
            return checkDistributedLoadSymmetry(
                load as DistributedLoad,
                allLoads,
                center,
                spanLength,
                tolerance
            );

        case 'moment':
            return checkMomentLoadSymmetry(
                load as MomentLoad,
                allLoads,
                center,
                tolerance
            );

        default:
            return {
                isSymmetric: false,
                confidence: 0,
                description: 'Tipo de carga desconocido',
            };
    }
}

/**
 * Verifica simetría de carga puntual
 */
function checkPointLoadSymmetry(
    load: PointLoad,
    allLoads: Load[],
    center: number,
    tolerance: number
): { isSymmetric: boolean; confidence: number; description: string } {
    const distanceFromCenter = Math.abs(load.position - center);

    // Si está en el centro, es simétrica por sí misma
    if (distanceFromCenter < tolerance) {
        return {
            isSymmetric: true,
            confidence: 1.0,
            description: `Carga puntual en el centro (${load.magnitude} kN)`,
        };
    }

    // Buscar carga simétrica correspondiente
    const mirrorPosition = 2 * center - load.position;
    const mirrorLoad = allLoads.find(
        (otherLoad) =>
            otherLoad.type === 'point' &&
            Math.abs((otherLoad as PointLoad).position - mirrorPosition) <
                tolerance &&
            Math.abs((otherLoad as PointLoad).magnitude - load.magnitude) <
                tolerance
    ) as PointLoad | undefined;

    if (mirrorLoad) {
        const positionError = Math.abs(mirrorLoad.position - mirrorPosition);
        const magnitudeError = Math.abs(mirrorLoad.magnitude - load.magnitude);
        const confidence = Math.max(
            0,
            1 - (positionError + magnitudeError) / tolerance
        );

        return {
            isSymmetric: true,
            confidence,
            description: `Carga puntual simétrica encontrada (${load.magnitude} kN)`,
        };
    }

    return {
        isSymmetric: false,
        confidence: 0,
        description: `Carga puntual sin pareja simétrica (${load.magnitude} kN en ${load.position} m)`,
    };
}

/**
 * Verifica simetría de carga distribuida
 */
function checkDistributedLoadSymmetry(
    load: DistributedLoad,
    allLoads: Load[],
    center: number,
    spanLength: number,
    tolerance: number
): { isSymmetric: boolean; confidence: number; description: string } {
    const loadCenter = (load.start + load.end) / 2;
    const loadLength = load.end - load.start;

    // Verificar si es simétrica respecto al centro del tramo
    const distanceFromCenter = Math.abs(loadCenter - center);

    // Si la carga está centrada y es uniforme, es simétrica
    if (
        distanceFromCenter < tolerance &&
        Math.abs(load.w1 - load.w2) < tolerance
    ) {
        return {
            isSymmetric: true,
            confidence: 1.0,
            description: `Carga distribuida uniforme centrada (${load.w1} kN/m)`,
        };
    }

    // Buscar carga distribuida simétrica
    const mirrorStart = spanLength - load.end;
    const mirrorEnd = spanLength - load.start;

    const mirrorLoad = allLoads.find(
        (otherLoad) =>
            otherLoad.type === 'distributed' &&
            Math.abs((otherLoad as DistributedLoad).start - mirrorStart) <
                tolerance &&
            Math.abs((otherLoad as DistributedLoad).end - mirrorEnd) <
                tolerance &&
            Math.abs((otherLoad as DistributedLoad).w1 - load.w2) < tolerance && // Intercambiados
            Math.abs((otherLoad as DistributedLoad).w2 - load.w1) < tolerance
    ) as DistributedLoad | undefined;

    if (mirrorLoad) {
        return {
            isSymmetric: true,
            confidence: 0.9,
            description: `Carga distribuida con pareja simétrica`,
        };
    }

    return {
        isSymmetric: false,
        confidence: 0,
        description: `Carga distribuida sin simetría`,
    };
}

/**
 * Verifica simetría de momento aplicado
 */
function checkMomentLoadSymmetry(
    load: MomentLoad,
    allLoads: Load[],
    center: number,
    tolerance: number
): { isSymmetric: boolean; confidence: number; description: string } {
    const distanceFromCenter = Math.abs(load.position - center);

    // Si está en el centro, depende de si el momento es equilibrado por otro
    if (distanceFromCenter < tolerance) {
        // Un momento en el centro es simétrico solo si hay otro momento opuesto
        const oppositeLoad = allLoads.find(
            (otherLoad) =>
                otherLoad.type === 'moment' &&
                Math.abs((otherLoad as MomentLoad).position - center) <
                    tolerance &&
                Math.abs((otherLoad as MomentLoad).magnitude + load.magnitude) <
                    tolerance // Momento opuesto
        ) as MomentLoad | undefined;

        if (oppositeLoad || Math.abs(load.magnitude) < tolerance) {
            return {
                isSymmetric: true,
                confidence: 0.8,
                description: `Momento en el centro equilibrado`,
            };
        }
    }

    // Buscar momento simétrico con signo opuesto
    const mirrorPosition = 2 * center - load.position;
    const mirrorLoad = allLoads.find(
        (otherLoad) =>
            otherLoad.type === 'moment' &&
            Math.abs((otherLoad as MomentLoad).position - mirrorPosition) <
                tolerance &&
            Math.abs((otherLoad as MomentLoad).magnitude + load.magnitude) <
                tolerance // Signo opuesto
    ) as MomentLoad | undefined;

    if (mirrorLoad) {
        return {
            isSymmetric: true,
            confidence: 0.9,
            description: `Momento con pareja simétrica opuesta`,
        };
    }

    return {
        isSymmetric: false,
        confidence: 0,
        description: `Momento sin simetría (${load.magnitude} kN⋅m en ${load.position} m)`,
    };
}

/**
 * Sugiere modificaciones para hacer las cargas más simétricas
 */
export function suggestSymmetryImprovements(
    loads: Load[],
    spanLength: number
): string[] {
    const suggestions: string[] = [];
    const center = spanLength / 2;

    loads.forEach((load, index) => {
        switch (load.type) {
            case 'point':
                const pointLoad = load as PointLoad;
                const distanceFromCenter = Math.abs(
                    pointLoad.position - center
                );
                if (distanceFromCenter > 0.1) {
                    const mirrorPosition = 2 * center - pointLoad.position;
                    suggestions.push(
                        `Carga ${index + 1}: Agregar carga puntual de ${
                            pointLoad.magnitude
                        } kN en posición ${mirrorPosition.toFixed(2)} m`
                    );
                }
                break;

            case 'distributed':
                const distLoad = load as DistributedLoad;
                const loadCenter = (distLoad.start + distLoad.end) / 2;
                if (Math.abs(loadCenter - center) > 0.1) {
                    suggestions.push(
                        `Carga ${
                            index + 1
                        }: Considerar centrar la carga distribuida respecto al tramo`
                    );
                }
                break;

            case 'moment':
                const momentLoad = load as MomentLoad;
                if (Math.abs(momentLoad.position - center) > 0.1) {
                    const mirrorPosition = 2 * center - momentLoad.position;
                    suggestions.push(
                        `Carga ${
                            index + 1
                        }: Agregar momento de ${-momentLoad.magnitude} kN⋅m en posición ${mirrorPosition.toFixed(
                            2
                        )} m`
                    );
                }
                break;
        }
    });

    return suggestions;
}

/**
 * Calcula un factor de simetría global (0 = completamente asimétrico, 1 = perfectamente simétrico)
 */
export function calculateSymmetryFactor(
    loads: Load[],
    spanLength: number
): number {
    if (loads.length === 0) return 1.0;

    const analysis = analyzeLoadSymmetry(loads, spanLength);
    return analysis.confidence;
}
