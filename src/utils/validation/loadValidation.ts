// src/utils/validation/loadValidation.ts

import type { Load, LoadInputData, LoadValidationResult } from '../../types';

import { VALIDATION_LIMITS } from '../constants';

/**
 * Valida una carga individual de manera exhaustiva
 */
export function validateLoad(
    loadData: LoadInputData,
    spanLength: number,
    existingLoads: Load[] = []
): LoadValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validación básica del tipo
    if (!loadData.type) {
        errors.push('El tipo de carga es requerido');
        return { isValid: false, errors, warnings };
    }

    // Validaciones específicas por tipo
    switch (loadData.type) {
        case 'point':
            validatePointLoad(loadData, spanLength, errors, warnings);
            break;
        case 'distributed':
            validateDistributedLoad(loadData, spanLength, errors, warnings);
            break;
        case 'moment':
            validateMomentLoad(loadData, spanLength, errors, warnings);
            break;
        default:
            errors.push('Tipo de carga no válido');
    }

    // Validaciones de compatibilidad con cargas existentes
    validateLoadCompatibility(
        loadData,
        existingLoads,
        spanLength,
        errors,
        warnings
    );

    // Validaciones de límites de ingeniería
    validateEngineeringLimits(loadData, spanLength, errors, warnings);

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Valida una carga puntual
 */
function validatePointLoad(
    loadData: LoadInputData,
    spanLength: number,
    errors: string[],
    warnings: string[]
): void {
    // Validar posición
    if (loadData.position === undefined || loadData.position === null) {
        errors.push('La posición es requerida para cargas puntuales');
    } else {
        if (loadData.position < 0) {
            errors.push('La posición no puede ser negativa');
        } else if (loadData.position > spanLength) {
            errors.push(
                `La posición no puede exceder la longitud del tramo (${spanLength} m)`
            );
        } else if (
            loadData.position === 0 ||
            loadData.position === spanLength
        ) {
            warnings.push(
                'Carga aplicada en el apoyo: puede generar reacciones concentradas'
            );
        }
    }

    // Validar magnitud
    if (loadData.magnitude === undefined || loadData.magnitude === null) {
        errors.push('La magnitud es requerida para cargas puntuales');
    } else {
        if (Math.abs(loadData.magnitude) < 0.001) {
            warnings.push('La magnitud de la carga es muy pequeña');
        } else if (
            Math.abs(loadData.magnitude) > VALIDATION_LIMITS.load.maxMagnitude
        ) {
            warnings.push(
                `Magnitud muy alta (>${VALIDATION_LIMITS.load.maxMagnitude} kN): verifique los valores`
            );
        } else if (Math.abs(loadData.magnitude) < 0.1) {
            warnings.push(
                'Magnitud muy pequeña: puede tener poco impacto en el análisis'
            );
        }
    }
}

/**
 * Valida una carga distribuida
 */
function validateDistributedLoad(
    loadData: LoadInputData,
    spanLength: number,
    errors: string[],
    warnings: string[]
): void {
    // Validar posiciones
    if (loadData.start === undefined || loadData.start === null) {
        errors.push(
            'La posición inicial es requerida para cargas distribuidas'
        );
    }
    if (loadData.end === undefined || loadData.end === null) {
        errors.push('La posición final es requerida para cargas distribuidas');
    }

    if (loadData.start !== undefined && loadData.end !== undefined) {
        if (loadData.start < 0) {
            errors.push('La posición inicial no puede ser negativa');
        }
        if (loadData.end > spanLength) {
            errors.push(
                `La posición final no puede exceder la longitud del tramo (${spanLength} m)`
            );
        }
        if (loadData.start >= loadData.end) {
            errors.push('La posición final debe ser mayor que la inicial');
        }

        const length = loadData.end - loadData.start;
        if (length < 0.1) {
            warnings.push('La longitud de la carga distribuida es muy pequeña');
        } else if (length > spanLength * 0.9) {
            warnings.push('La carga distribuida cubre casi todo el tramo');
        }
    }

    // Validar intensidades
    if (loadData.w1 === undefined || loadData.w1 === null) {
        errors.push('La intensidad inicial (w1) es requerida');
    }
    if (loadData.w2 === undefined || loadData.w2 === null) {
        errors.push('La intensidad final (w2) es requerida');
    }

    if (loadData.w1 !== undefined && loadData.w2 !== undefined) {
        if (Math.abs(loadData.w1) < 0.001 && Math.abs(loadData.w2) < 0.001) {
            warnings.push('Ambas intensidades son muy pequeñas');
        }

        const maxIntensity = Math.max(
            Math.abs(loadData.w1),
            Math.abs(loadData.w2)
        );
        if (maxIntensity > 100) {
            warnings.push(
                'Intensidad de carga muy alta: verifique las unidades'
            );
        }

        // Verificar cambio brusco de intensidad
        if (
            Math.abs(loadData.w1 - loadData.w2) >
            Math.max(Math.abs(loadData.w1), Math.abs(loadData.w2)) * 5
        ) {
            warnings.push(
                'Cambio muy brusco entre w1 y w2: considere subdividir la carga'
            );
        }
    }
}

/**
 * Valida un momento aplicado
 */
function validateMomentLoad(
    loadData: LoadInputData,
    spanLength: number,
    errors: string[],
    warnings: string[]
): void {
    // Validar posición
    if (
        loadData.momentPosition === undefined ||
        loadData.momentPosition === null
    ) {
        errors.push('La posición es requerida para momentos aplicados');
    } else {
        if (loadData.momentPosition < 0) {
            errors.push('La posición no puede ser negativa');
        } else if (loadData.momentPosition > spanLength) {
            errors.push(
                `La posición no puede exceder la longitud del tramo (${spanLength} m)`
            );
        } else if (
            loadData.momentPosition === 0 ||
            loadData.momentPosition === spanLength
        ) {
            warnings.push(
                'Momento aplicado en el apoyo: puede requerir consideraciones especiales'
            );
        }
    }

    // Validar magnitud
    if (
        loadData.momentMagnitude === undefined ||
        loadData.momentMagnitude === null
    ) {
        errors.push('La magnitud es requerida para momentos aplicados');
    } else {
        if (Math.abs(loadData.momentMagnitude) < 0.001) {
            warnings.push('La magnitud del momento es muy pequeña');
        } else if (Math.abs(loadData.momentMagnitude) > 1000) {
            warnings.push(
                'Magnitud de momento muy alta: verifique los valores'
            );
        }
    }
}

/**
 * Valida compatibilidad con cargas existentes
 */
function validateLoadCompatibility(
    loadData: LoadInputData,
    existingLoads: Load[],
    spanLength: number,
    errors: string[],
    warnings: string[]
): void {
    // Verificar superposición de cargas distribuidas
    if (
        loadData.type === 'distributed' &&
        loadData.start !== undefined &&
        loadData.end !== undefined
    ) {
        const overlappingLoads = existingLoads.filter((load) => {
            if (load.type !== 'distributed') return false;

            // Verificar superposición
            return !(
                loadData.end! <= load.start || loadData.start! >= load.end
            );
        });

        if (overlappingLoads.length > 0) {
            warnings.push(
                'La carga distribuida se superpone con cargas existentes'
            );
        }
    }

    // Verificar cargas puntuales muy cercanas
    if (loadData.type === 'point' && loadData.position !== undefined) {
        const nearbyLoads = existingLoads.filter((load) => {
            if (load.type !== 'point') return false;
            return (
                Math.abs(load.position - loadData.position!) < spanLength * 0.05
            ); // 5% del tramo
        });

        if (nearbyLoads.length > 0) {
            warnings.push(
                'Hay cargas puntuales muy cercanas: considere combinarlas'
            );
        }
    }

    // Verificar exceso de cargas
    if (existingLoads.length > 10) {
        warnings.push(
            'Muchas cargas aplicadas: considere simplificar el modelo'
        );
    }
}

/**
 * Valida límites de ingeniería estructural
 */
function validateEngineeringLimits(
    loadData: LoadInputData,
    spanLength: number,
    errors: string[],
    warnings: string[]
): void {
    // Relaciones span/carga típicas
    if (loadData.type === 'point' && loadData.magnitude !== undefined) {
        const loadPerMeter = Math.abs(loadData.magnitude) / spanLength;
        if (loadPerMeter > 50) {
            warnings.push(
                'Relación carga/longitud muy alta para aplicaciones típicas'
            );
        }
    }

    // Verificar órdenes de magnitud razonables
    if (loadData.type === 'distributed') {
        if (loadData.w1 !== undefined && loadData.w2 !== undefined) {
            const avgIntensity =
                (Math.abs(loadData.w1) + Math.abs(loadData.w2)) / 2;
            if (avgIntensity * spanLength > 1000) {
                warnings.push(
                    'Carga total muy alta: verifique si las unidades son correctas'
                );
            }
        }
    }

    // Precisión de decimales
    const checkPrecision = (value: number, name: string) => {
        if (value !== undefined) {
            const decimalPlaces = (value.toString().split('.')[1] || '').length;
            if (decimalPlaces > VALIDATION_LIMITS.position.precision) {
                warnings.push(
                    `${name} tiene demasiados decimales: considere redondear`
                );
            }
        }
    };

    if (loadData.position !== undefined)
        checkPrecision(loadData.position, 'Posición');
    if (loadData.start !== undefined)
        checkPrecision(loadData.start, 'Posición inicial');
    if (loadData.end !== undefined)
        checkPrecision(loadData.end, 'Posición final');
}

/**
 * Valida múltiples cargas como conjunto
 */
export function validateLoadSet(
    loads: Load[],
    spanLength: number
): LoadValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (loads.length === 0) {
        warnings.push('No hay cargas aplicadas');
        return { isValid: true, errors, warnings };
    }

    // Calcular carga total aproximada
    let totalLoad = 0;
    loads.forEach((load) => {
        switch (load.type) {
            case 'point':
                totalLoad += Math.abs(load.magnitude);
                break;
            case 'distributed':
                const avgIntensity =
                    (Math.abs(load.w1) + Math.abs(load.w2)) / 2;
                const length = load.end - load.start;
                totalLoad += avgIntensity * length;
                break;
            // Los momentos no contribuyen a la carga vertical total
        }
    });

    // Verificaciones del conjunto
    if (totalLoad === 0) {
        warnings.push('La carga total es cero: verifique las magnitudes');
    } else if (totalLoad > 1000) {
        warnings.push(
            'Carga total muy alta: verifique las unidades y magnitudes'
        );
    }

    // Verificar equilibrio aproximado (para sistemas simétricos)
    const center = spanLength / 2;
    let momentAboutCenter = 0;

    loads.forEach((load) => {
        switch (load.type) {
            case 'point':
                momentAboutCenter += load.magnitude * (load.position - center);
                break;
            case 'distributed':
                const avgIntensity = (load.w1 + load.w2) / 2;
                const length = load.end - load.start;
                const loadCenter = (load.start + load.end) / 2;
                momentAboutCenter +=
                    avgIntensity * length * (loadCenter - center);
                break;
        }
    });

    if (Math.abs(momentAboutCenter) < totalLoad * spanLength * 0.1) {
        warnings.push('Las cargas parecen aproximadamente simétricas');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Valida la configuración del tramo
 */
export function validateSpan(spanLength: number): LoadValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (spanLength <= 0) {
        errors.push('La longitud del tramo debe ser positiva');
    } else if (spanLength < VALIDATION_LIMITS.span.min) {
        errors.push(
            `La longitud mínima del tramo es ${VALIDATION_LIMITS.span.min} m`
        );
    } else if (spanLength > VALIDATION_LIMITS.span.max) {
        errors.push(
            `La longitud máxima del tramo es ${VALIDATION_LIMITS.span.max} m`
        );
    }

    // Advertencias para casos extremos
    if (spanLength < 1) {
        warnings.push(
            'Tramo muy corto: los resultados pueden no ser representativos'
        );
    } else if (spanLength > 100) {
        warnings.push('Tramo muy largo: considere subdividir en varios tramos');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Sugiere correcciones para cargas inválidas
 */
export function suggestLoadCorrections(
    loadData: LoadInputData,
    spanLength: number
): string[] {
    const suggestions: string[] = [];

    switch (loadData.type) {
        case 'point':
            if (loadData.position !== undefined) {
                if (loadData.position < 0) {
                    suggestions.push(
                        'Cambiar la posición a un valor entre 0 y ' + spanLength
                    );
                } else if (loadData.position > spanLength) {
                    suggestions.push(
                        `Reducir la posición a máximo ${spanLength} m`
                    );
                }
            }
            break;

        case 'distributed':
            if (loadData.start !== undefined && loadData.end !== undefined) {
                if (loadData.start >= loadData.end) {
                    suggestions.push(
                        'Asegurar que la posición final sea mayor que la inicial'
                    );
                }
                if (loadData.end > spanLength) {
                    suggestions.push(
                        `Ajustar la posición final a máximo ${spanLength} m`
                    );
                }
            }
            break;

        case 'moment':
            if (loadData.momentPosition !== undefined) {
                if (
                    loadData.momentPosition < 0 ||
                    loadData.momentPosition > spanLength
                ) {
                    suggestions.push(
                        `Ajustar la posición entre 0 y ${spanLength} m`
                    );
                }
            }
            break;
    }

    return suggestions;
}
