// src/components/layout/Header.tsx

export function Header() {
    return (
        <div className="card gradient-primary text-white mb-6 animate-slide-up">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2 text-shadow-lg">
                    🏗️ Calculadora de Alfas
                </h1>
                <p className="text-xl opacity-90 text-shadow">
                    Teorema de Clapeyron - Método de los Tres Momentos
                </p>
                <div className="mt-4 text-sm opacity-75">
                    Análisis estructural para vigas continuas
                </div>
            </div>
        </div>
    );
}
