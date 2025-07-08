// src/types/index.ts

// Exportar todos los tipos de loads
export type {
    BaseLoad,
    LoadType,
    PointLoad,
    DistributedLoad,
    MomentLoad,
    Load,
    LoadInputData,
    LoadValidationResult,
    SpanConfiguration,
} from './loads';

// Exportar todos los tipos de calculations
export type {
    MomentCalculationPoint,
    AlphaResults,
    CalculationConfig,
    IntegrationResult,
    ReactionForces,
    SymmetryAnalysis,
    CalculationValidation,
} from './calculations';

// Exportar todos los tipos de canvas
export type {
    CanvasConfig,
    DrawingScale,
    DrawingOffsets,
    BeamDrawingConfig,
    LoadDrawingConfig,
    SupportDrawingConfig,
    GridConfig,
    DiagramConfig,
    CanvasPoint,
    CanvasRect,
    AnimationConfig,
    DrawingState,
    CanvasMouseEvent,
    CanvasHoverInfo,
} from './canvas';
