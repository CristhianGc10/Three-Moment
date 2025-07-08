// src/App.tsx

import { Package, Plus, Settings } from 'lucide-react';

import { AlphaResults } from './components/results/AlphaResults';
import { Container } from './components/layout/Container';
import { DEFAULT_SPAN_CONFIG } from './utils/constants';
import { Header } from './components/layout/Header';
import { LoadInputForm } from './components/forms/LoadInputForm';
import { LoadsList } from './components/forms/LoadsList';
import { MomentDiagram } from './components/visualization/MomentDiagram';
import type { SpanConfiguration as SpanConfig } from './types';
import { SpanConfiguration } from './components/forms/SpanConfiguration';
import { StructuralVisualization } from './components/visualization/StructuralVisualization';
import { useCalculations } from './hooks/useCalculations';
import { useLoads } from './hooks/useLoads';
import { useState } from 'react';

function App() {
    // Estado del tramo
    const [spanConfig, setSpanConfig] = useState<SpanConfig>({
        length: DEFAULT_SPAN_CONFIG.length,
        minLength: DEFAULT_SPAN_CONFIG.minLength,
        maxLength: DEFAULT_SPAN_CONFIG.maxLength,
    });

    // Hook personalizado para manejar cargas
    const { loads, addLoad, removeLoad, clearLoads, validateLoad } = useLoads(
        spanConfig.length
    );

    // Hook personalizado para cálculos
    const { alphaResults, momentPoints, isCalculating, calculate, hasResults } =
        useCalculations(loads, spanConfig.length);

    // Manejar cambio de longitud del tramo
    const handleSpanLengthChange = (length: number) => {
        setSpanConfig((prev: SpanConfig) => ({ ...prev, length }));
    };

    // Manejar cálculo de alfas
    const handleCalculate = async () => {
        if (loads.length === 0) {
            alert('Por favor, agrega al menos una carga para calcular.');
            return;
        }

        await calculate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
            <Container>
                <Header />

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Panel principal simplificado */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Configuración */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                        <Settings className="w-4 h-4 text-slate-600" />
                                        <h3 className="text-sm font-medium text-slate-900">Configuración</h3>
                                    </div>
                                    <SpanConfiguration
                                        config={spanConfig}
                                        onChange={handleSpanLengthChange}
                                    />
                                </div>

                                {/* Nueva Carga */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                        <Plus className="w-4 h-4 text-slate-600" />
                                        <h3 className="text-sm font-medium text-slate-900">Nueva Carga</h3>
                                    </div>
                                    <LoadInputForm
                                        spanLength={spanConfig.length}
                                        onAddLoad={addLoad}
                                        validateLoad={validateLoad}
                                    />
                                </div>

                                {/* Cargas Aplicadas */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                        <Package className="w-4 h-4 text-slate-600" />
                                        <h3 className="text-sm font-medium text-slate-900">Cargas Aplicadas</h3>
                                    </div>
                                    <LoadsList
                                        loads={loads}
                                        onRemoveLoad={removeLoad}
                                        onClearLoads={clearLoads}
                                        onCalculate={handleCalculate}
                                        isCalculating={isCalculating}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualización estructural */}
                    <StructuralVisualization
                        loads={loads}
                        spanLength={spanConfig.length}
                        className="w-full"
                    />

                    {/* Resultados de alfas */}
                    {hasResults && alphaResults && (
                        <AlphaResults result={alphaResults} />
                    )}

                    {/* Diagrama de momentos */}
                    {hasResults && momentPoints.length > 0 && (
                        <MomentDiagram
                            momentPoints={momentPoints}
                            spanLength={spanConfig.length}
                            maxMoment={alphaResults?.maxMoment || 0}
                            className="w-full"
                        />
                    )}
                </div>
            </Container>
        </div>
    );
}

export default App;
