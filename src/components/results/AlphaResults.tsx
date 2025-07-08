// src/components/results/AlphaResults.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { BarChart3, Target } from 'lucide-react';
import type { AlphaResults } from '../../types';

interface AlphaResultsProps {
    result: AlphaResults;
}

export function AlphaResults({ result }: AlphaResultsProps) {
    return (
        <Card variant="elevated" elevation={3} className="h-full">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">
                        Resultados del Análisis
                    </CardTitle>
                </div>
                <CardDescription>
                    Coeficientes de distribución de momentos
                </CardDescription>
            </CardHeader>
            
            <CardContent>
                {result.isSymmetric ? (
                    // Symmetric Load Case
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Carga Simétrica
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                            <div className="text-center">
                                <p className="text-lg text-gray-700 mb-3 font-medium">Coeficiente α</p>
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    {result.alpha1.toFixed(3)}
                                </div>
                                <p className="text-gray-600">Valor único para ambos extremos</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Asymmetric Load Case
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                            <Target className="w-4 h-4" />
                            Carga Asimétrica
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Alpha 1 */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                <div className="text-center">
                                    <p className="text-base text-gray-700 mb-2 font-medium">α₁</p>
                                    <div className="text-3xl font-bold text-blue-700 mb-1">
                                        {result.alpha1.toFixed(3)}
                                    </div>
                                    <p className="text-sm text-gray-600">Extremo Izquierdo</p>
                                </div>
                            </div>
                            
                            {/* Alpha 2 */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                                <div className="text-center">
                                    <p className="text-base text-gray-700 mb-2 font-medium">α₂</p>
                                    <div className="text-3xl font-bold text-purple-700 mb-1">
                                        {result.alpha2.toFixed(3)}
                                    </div>
                                    <p className="text-sm text-gray-600">Extremo Derecho</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
