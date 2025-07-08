// src/hooks/useLoads.ts

import type { Load, LoadInputData, LoadValidationResult } from '../types';
import { useCallback, useState } from 'react';

export function useLoads(spanLength: number) {
  const [loads, setLoads] = useState<Load[]>([]);

  // Generar ID único para nueva carga
  const generateId = () => `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Validar datos de carga
  const validateLoad = useCallback((loadData: LoadInputData): LoadValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (loadData.type) {
      case 'point':
        if (!loadData.position && loadData.position !== 0) {
          errors.push('La posición es requerida para cargas puntuales');
        } else if (loadData.position < 0 || loadData.position > spanLength) {
          errors.push(`La posición debe estar entre 0 y ${spanLength} metros`);
        }
        
        if (!loadData.magnitude && loadData.magnitude !== 0) {
          errors.push('La magnitud es requerida para cargas puntuales');
        } else if (Math.abs(loadData.magnitude) > 1000) {
          warnings.push('Magnitud muy alta, verifique los valores');
        }
        break;

      case 'distributed':
        if (!loadData.start && loadData.start !== 0) {
          errors.push('La posición inicial es requerida');
        } else if (loadData.start < 0 || loadData.start > spanLength) {
          errors.push(`La posición inicial debe estar entre 0 y ${spanLength} metros`);
        }

        if (!loadData.end && loadData.end !== 0) {
          errors.push('La posición final es requerida');
        } else if (loadData.end < 0 || loadData.end > spanLength) {
          errors.push(`La posición final debe estar entre 0 y ${spanLength} metros`);
        }

        if (loadData.start && loadData.end && loadData.start >= loadData.end) {
          errors.push('La posición final debe ser mayor que la inicial');
        }

        if ((!loadData.w1 && loadData.w1 !== 0) || (!loadData.w2 && loadData.w2 !== 0)) {
          errors.push('Las intensidades w1 y w2 son requeridas');
        }
        break;

      case 'moment':
        if (!loadData.momentPosition && loadData.momentPosition !== 0) {
          errors.push('La posición es requerida para momentos');
        } else if (loadData.momentPosition < 0 || loadData.momentPosition > spanLength) {
          errors.push(`La posición debe estar entre 0 y ${spanLength} metros`);
        }

        if (!loadData.momentMagnitude && loadData.momentMagnitude !== 0) {
          errors.push('La magnitud es requerida para momentos');
        }
        break;

      default:
        errors.push('Tipo de carga no válido');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [spanLength]);

  // Agregar nueva carga
  const addLoad = useCallback((loadData: LoadInputData) => {
    const validation = validateLoad(loadData);
    if (!validation.isValid) {
      throw new Error(`Carga inválida: ${validation.errors.join(', ')}`);
    }

    let newLoad: Load;
    const id = generateId();

    switch (loadData.type) {
      case 'point':
        newLoad = {
          id,
          type: 'point',
          position: loadData.position!,
          magnitude: loadData.magnitude!,
        };
        break;
      case 'distributed':
        newLoad = {
          id,
          type: 'distributed',
          start: loadData.start!,
          end: loadData.end!,
          w1: loadData.w1!,
          w2: loadData.w2!,
        };
        break;
      case 'moment':
        newLoad = {
          id,
          type: 'moment',
          position: loadData.momentPosition!,
          magnitude: loadData.momentMagnitude!,
        };
        break;
      default:
        throw new Error('Tipo de carga no soportado');
    }

    setLoads(prev => [...prev, newLoad]);
  }, [validateLoad]);

  // Remover carga por ID
  const removeLoad = useCallback((id: string) => {
    setLoads(prev => prev.filter(load => load.id !== id));
  }, []);

  // Limpiar todas las cargas
  const clearLoads = useCallback(() => {
    setLoads([]);
  }, []);

  // Actualizar carga existente - versión simplificada y segura
  const updateLoad = useCallback((id: string, newLoadData: LoadInputData) => {
    const validation = validateLoad(newLoadData);
    if (!validation.isValid) {
      throw new Error(`Carga inválida: ${validation.errors.join(', ')}`);
    }

    setLoads(prev => prev.map(load => {
      if (load.id !== id) return load;

      // Crear una nueva carga completa en lugar de hacer spread
      switch (newLoadData.type) {
        case 'point':
          return {
            id,
            type: 'point',
            position: newLoadData.position!,
            magnitude: newLoadData.magnitude!,
          };
        case 'distributed':
          return {
            id,
            type: 'distributed',
            start: newLoadData.start!,
            end: newLoadData.end!,
            w1: newLoadData.w1!,
            w2: newLoadData.w2!,
          };
        case 'moment':
          return {
            id,
            type: 'moment',
            position: newLoadData.momentPosition!,
            magnitude: newLoadData.momentMagnitude!,
          };
        default:
          return load; // Si el tipo no es válido, devolver la carga original
      }
    }));
  }, [validateLoad]);

  return {
    loads,
    addLoad,
    removeLoad,
    clearLoads,
    updateLoad,
    validateLoad,
  };
}