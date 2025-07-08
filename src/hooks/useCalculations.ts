// src/hooks/useCalculations.ts

import type { AlphaResults, Load, MomentCalculationPoint } from '../types';
import {
    calculateAlphas,
    validateAlphaResults,
} from '../utils/calculations/alphaCalculator';
import {
    findMaxMoment,
    generateMomentPoints,
} from '../utils/calculations/momentCalculator';
import { useCallback, useState } from 'react';

export function useCalculations(loads: Load[], spanLength: number) {
    const [alphaResults, setAlphaResults] = useState<AlphaResults | null>(null);
    const [momentPoints, setMomentPoints] = useState<MomentCalculationPoint[]>(
        []
    );
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationErrors, setCalculationErrors] = useState<string[]>([]);
    const [calculationWarnings, setCalculationWarnings] = useState<string[]>(
        []
    );

    // Función principal de cálculo usando los algoritmos implementados
    const calculate = useCallback(async () => {
        if (loads.length === 0) {
            setCalculationErrors(['No hay cargas aplicadas para calcular']);
            return;
        }

        setIsCalculating(true);
        setCalculationErrors([]);
        setCalculationWarnings([]);

        try {
            // Simular tiempo de cálculo para mostrar el loading
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Generar puntos de momento usando el algoritmo implementado
            const points = generateMomentPoints(loads, spanLength, 200);
            setMomentPoints(points);

            // Calcular alfas usando el algoritmo del teorema de Clapeyron
            const results = calculateAlphas(loads, spanLength, 1000);

            // Validar resultados
            const validation = validateAlphaResults(results);
            if (validation.warnings.length > 0) {
                setCalculationWarnings(validation.warnings);
            }

            setAlphaResults(results);
        } catch (error) {
            console.error('Error en cálculos:', error);
            setCalculationErrors([
                'Error durante el cálculo. Verifique los datos de entrada.',
                error instanceof Error ? error.message : 'Error desconocido',
            ]);
        } finally {
            setIsCalculating(false);
        }
    }, [loads, spanLength]);

    // Calcular solo el diagrama de momentos (sin alfas)
    const calculateMomentDiagram = useCallback(async () => {
        if (loads.length === 0) return;

        setIsCalculating(true);

        try {
            const points = generateMomentPoints(loads, spanLength, 200);
            setMomentPoints(points);

            // Si ya hay resultados de alfas, mantenerlos pero actualizar el momento máximo
            if (alphaResults) {
                const { maxMoment, maxMomentPosition } = findMaxMoment(points);
                setAlphaResults((prev) =>
                    prev
                        ? {
                              ...prev,
                              maxMoment,
                              maxMomentPosition,
                          }
                        : null
                );
            }
        } catch (error) {
            console.error('Error calculando diagrama de momentos:', error);
            setCalculationErrors(['Error al calcular el diagrama de momentos']);
        } finally {
            setIsCalculating(false);
        }
    }, [loads, spanLength, alphaResults]);

    // Limpiar resultados
    const clearResults = useCallback(() => {
        setAlphaResults(null);
        setMomentPoints([]);
        setCalculationErrors([]);
        setCalculationWarnings([]);
    }, []);

    // Obtener resumen de cálculos
    const getCalculationSummary = useCallback(() => {
        if (!alphaResults) return null;

        return {
            totalLoads: loads.length,
            spanLength,
            isSymmetric: alphaResults.isSymmetric,
            maxMoment: alphaResults.maxMoment,
            maxMomentPosition: alphaResults.maxMomentPosition,
            alpha1: alphaResults.alpha1,
            alpha2: alphaResults.alpha2,
            area: alphaResults.area,
            centroidLeft: alphaResults.centroidLeft,
            centroidRight: alphaResults.centroidRight,
        };
    }, [alphaResults, loads.length, spanLength]);

    // Verificar si los datos de entrada han cambiado y los resultados necesitan actualización
    const needsRecalculation = useCallback(() => {
        if (!alphaResults) return true;

        // Los resultados son válidos si no han cambiado las cargas ni la longitud del tramo
        // En una implementación más sofisticada, se podría hacer un hash de los datos
        return false; // Por simplicidad, asumir que no necesita recálculo automático
    }, [alphaResults]);

    // Exportar datos de cálculo
    const exportCalculationData = useCallback(() => {
        if (!alphaResults || momentPoints.length === 0) return null;

        return {
            metadata: {
                timestamp: new Date().toISOString(),
                spanLength,
                numberOfLoads: loads.length,
                calculationMethod:
                    'Teorema de Clapeyron - Método de los Tres Momentos',
            },
            loads: loads.map((load) => ({
                ...load, // Simplemente hacer spread del objeto load completo
            })),
            results: {
                alphas: {
                    alpha1: alphaResults.alpha1,
                    alpha2: alphaResults.alpha2,
                    isSymmetric: alphaResults.isSymmetric,
                },
                momentDiagram: {
                    area: alphaResults.area,
                    centroidLeft: alphaResults.centroidLeft,
                    centroidRight: alphaResults.centroidRight,
                    maxMoment: alphaResults.maxMoment,
                    maxMomentPosition: alphaResults.maxMomentPosition,
                },
                momentPoints: momentPoints,
            },
            validation: {
                errors: calculationErrors,
                warnings: calculationWarnings,
            },
        };
    }, [
        alphaResults,
        momentPoints,
        spanLength,
        loads,
        calculationErrors,
        calculationWarnings,
    ]);

    return {
        // Estados
        alphaResults,
        momentPoints,
        isCalculating,
        calculationErrors,
        calculationWarnings,
        hasResults: alphaResults !== null,
        hasErrors: calculationErrors.length > 0,
        hasWarnings: calculationWarnings.length > 0,

        // Funciones de cálculo
        calculate,
        calculateMomentDiagram,
        clearResults,

        // Funciones auxiliares
        getCalculationSummary,
        needsRecalculation,
        exportCalculationData,
    };
}
