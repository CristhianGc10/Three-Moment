// src/components/visualization/StructuralVisualization.tsx

import { useMemo } from 'react';

import type { Load } from '../../types';
import { clsx } from 'clsx';

interface StructuralVisualizationProps {
    loads: Load[];
    spanLength: number;
    className?: string;
}

export function StructuralVisualization({
    loads,
    spanLength,
    className,
}: StructuralVisualizationProps) {
    // Dimensiones del SVG responsivas optimizadas para aprovechar más espacio lateral
    const viewBoxWidth = 1200; // Reducido para mejor adaptación a pantallas pequeñas
    const viewBoxHeight = 500; // Aumentado para mejor aprovechamiento vertical
    const beamY = viewBoxHeight * 0.5; // Centrado verticalmente
    const margin = 40; // Margen reducido para aprovechar más espacio lateral
    const beamStartX = margin;
    const beamEndX = viewBoxWidth - margin;
    const beamLength = beamEndX - beamStartX;

    // Función para convertir posición real a coordenada SVG
    const positionToX = (position: number) => {
        return beamStartX + (position / spanLength) * beamLength;
    };

    // Generar elementos SVG usando useMemo para optimización
    const svgElements = useMemo(() => {
        const elements = [];

        // Grid de fondo
        const gridLines = [];
        const divisions = Math.min(spanLength, 20);
        const step = beamLength / divisions;
        
        for (let i = 0; i <= divisions; i++) {
            const x = beamStartX + i * step;
            gridLines.push(
                <line
                    key={`grid-${i}`}
                    x1={x}
                    y1={beamY - 60}
                    x2={x}
                    y2={beamY + 60}
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth="1"
                />
            );
        }
        elements.push(...gridLines);

        // Viga principal con gradiente
        elements.push(
            <defs key="defs">
                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4a5568" />
                    <stop offset="50%" stopColor="#2d3748" />
                    <stop offset="100%" stopColor="#1a202c" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                </filter>
            </defs>
        );



        // Viga principal
        elements.push(
            <rect
                key="beam"
                x={beamStartX}
                y={beamY - 5}
                width={beamLength}
                height={10}
                fill="url(#beamGradient)"
            />
        );

        // Apoyos
        elements.push(
            // Apoyo izquierdo
            <g key="support-left">
                <polygon
                    points={`${beamStartX},${beamY + 5} ${beamStartX - 15},${beamY + 28} ${beamStartX + 15},${beamY + 28}`}
                    fill="#2d3748"
                    stroke="#1a202c"
                    strokeWidth="2"
                />
                <rect
                    x={beamStartX - 20}
                    y={beamY + 28}
                    width={40}
                    height={8}
                    fill="#1a202c"
                />
            </g>,
            // Apoyo derecho
            <g key="support-right">
                <polygon
                    points={`${beamEndX},${beamY + 5} ${beamEndX - 15},${beamY + 28} ${beamEndX + 15},${beamY + 28}`}
                    fill="#2d3748"
                    stroke="#1a202c"
                    strokeWidth="2"
                />
                <rect
                    x={beamEndX - 20}
                    y={beamY + 28}
                    width={40}
                    height={8}
                    fill="#1a202c"
                />
            </g>
        );

        // Constantes para estandarizar flechas - optimizadas para responsividad
        const ARROW_WIDTH = 10; // Aumentado para mejor visibilidad
        const ARROW_HEIGHT = 15; // Aumentado para mejor visibilidad
        const MIN_LOAD_HEIGHT = 60; // Aumentado para aprovechar altura
        const MAX_LOAD_HEIGHT = 140; // Aumentado para aprovechar altura

        // Función para detectar y resolver superposiciones de etiquetas de cargas
        const resolveLoadLabelOverlaps = () => {
            const labelPositions: { x: number; y: number; width: number; height: number; loadIndex: number; type: string }[] = [];
            const minHorizontalSpacing = 45; // Espaciado mínimo horizontal (reducido para móviles)
            const minVerticalSpacing = 15; // Espaciado mínimo vertical (reducido para móviles)
            const offsetStep = 20; // Paso de desplazamiento (reducido para móviles)

            // Recopilar todas las posiciones de etiquetas iniciales
            loads.forEach((load, index) => {
                if (load.type === 'point') {
                    const pointX = positionToX(load.position);
                    const loadHeight = Math.max(MIN_LOAD_HEIGHT, Math.min(Math.abs(load.magnitude) * 3, MAX_LOAD_HEIGHT));
                    const isNegative = load.magnitude < 0;
                    const initialY = isNegative ? beamY + loadHeight + 25 : beamY - loadHeight - 10;
                    
                    labelPositions.push({
                        x: pointX,
                        y: initialY,
                        width: 50, // Ancho estimado del texto
                        height: 16, // Altura estimada del texto
                        loadIndex: index,
                        type: 'point'
                    });
                } else if (load.type === 'distributed') {
                    const startX = positionToX(load.start);
                    const endX = positionToX(load.end);
                    const w1 = load.w1 || 0;
                    const w2 = load.w2 || 0;
                    const maxW = Math.max(Math.abs(w1), Math.abs(w2));
                    const maxDistHeight = Math.max(MIN_LOAD_HEIGHT, Math.min(maxW * 3, MAX_LOAD_HEIGHT));
                    const h1 = maxW > 0 ? (Math.abs(w1) / maxW) * maxDistHeight : 0;
                    const h2 = maxW > 0 ? (Math.abs(w2) / maxW) * maxDistHeight : 0;
                    
                    // Etiquetas para inicio y fin de carga distribuida
                    const y1Initial = w1 >= 0 ? beamY - h1 - 10 : beamY + h1 + 20;
                    const y2Initial = w2 >= 0 ? beamY - h2 - 10 : beamY + h2 + 20;
                    
                    labelPositions.push({
                        x: startX,
                        y: y1Initial,
                        width: 55, // Ancho estimado del texto
                        height: 16, // Altura estimada del texto
                        loadIndex: index,
                        type: 'distributed-start'
                    });
                    
                    labelPositions.push({
                        x: endX,
                        y: y2Initial,
                        width: 55, // Ancho estimado del texto
                        height: 16, // Altura estimada del texto
                        loadIndex: index,
                        type: 'distributed-end'
                    });
                } else if (load.type === 'moment') {
                    const momentX = positionToX(load.position);
                    const momentRadius = 25;
                    const initialY = beamY - momentRadius - 15;
                    
                    labelPositions.push({
                        x: momentX,
                        y: initialY,
                        width: 60, // Ancho estimado del texto
                        height: 16, // Altura estimada del texto
                        loadIndex: index,
                        type: 'moment'
                    });
                }
            });

            // Resolver superposiciones
            for (let i = 0; i < labelPositions.length; i++) {
                const currentLabel = labelPositions[i];
                let hasOverlap = true;
                let attempts = 0;
                const maxAttempts = 5;

                while (hasOverlap && attempts < maxAttempts) {
                    hasOverlap = false;
                    
                    for (let j = 0; j < labelPositions.length; j++) {
                        if (i === j) continue;
                        
                        const otherLabel = labelPositions[j];
                        const horizontalDistance = Math.abs(currentLabel.x - otherLabel.x);
                        const verticalDistance = Math.abs(currentLabel.y - otherLabel.y);
                        
                        // Verificar superposición
                        if (horizontalDistance < minHorizontalSpacing && verticalDistance < minVerticalSpacing) {
                            hasOverlap = true;
                            
                            // Ajustar posición: mover hacia arriba o abajo según el tipo
                            if (currentLabel.type === 'point') {
                                const load = loads[currentLabel.loadIndex];
                                if (load.type === 'point') {
                                    const isNegative = load.magnitude < 0;
                                    currentLabel.y += isNegative ? offsetStep : -offsetStep;
                                }
                            } else if (currentLabel.type === 'distributed-start' || currentLabel.type === 'distributed-end') {
                                const load = loads[currentLabel.loadIndex];
                                if (load.type === 'distributed') {
                                    const w = currentLabel.type === 'distributed-start' ? (load.w1 || 0) : (load.w2 || 0);
                                    const isNegative = w < 0;
                                    currentLabel.y += isNegative ? offsetStep : -offsetStep;
                                }
                            } else if (currentLabel.type === 'moment') {
                                currentLabel.y -= offsetStep;
                            }
                            break;
                        }
                    }
                    attempts++;
                }
            }

            return labelPositions;
        };

        const adjustedLabelPositions = resolveLoadLabelOverlaps();

        // Cargas
        loads.forEach((load, index) => {
            switch (load.type) {
                case 'point':
                    const pointX = positionToX(load.position);
                    const loadHeight = Math.max(MIN_LOAD_HEIGHT, Math.min(Math.abs(load.magnitude) * 3, MAX_LOAD_HEIGHT)); // Factor aumentado de 2 a 3
                    const isNegative = load.magnitude < 0;
                    
                    elements.push(
                        <g key={`point-load-${index}`}>
                            {/* Línea de carga puntual */}
                            <line
                                x1={pointX}
                                y1={isNegative ? beamY + loadHeight : beamY - loadHeight}
                                x2={pointX}
                                y2={isNegative ? beamY + ARROW_HEIGHT : beamY - ARROW_HEIGHT}
                                stroke="#3b82f6"
                                strokeWidth="3"
                            />
                            {/* Punta de flecha estandarizada */}
                            <polygon
                                points={isNegative ? 
                                    `${pointX},${beamY} ${pointX - ARROW_WIDTH},${beamY + ARROW_HEIGHT} ${pointX + ARROW_WIDTH},${beamY + ARROW_HEIGHT}` :
                                    `${pointX},${beamY} ${pointX - ARROW_WIDTH},${beamY - ARROW_HEIGHT} ${pointX + ARROW_WIDTH},${beamY - ARROW_HEIGHT}`
                                }
                                fill="#3b82f6"
                            />
                            {/* Etiqueta con posición ajustada */}
                            {(() => {
                                const adjustedLabel = adjustedLabelPositions.find(label => 
                                    label.loadIndex === index && label.type === 'point'
                                );
                                const labelY = adjustedLabel ? adjustedLabel.y : (isNegative ? beamY + loadHeight + 25 : beamY - loadHeight - 10);
                                
                                return (
                                    <>
                                        <text
                                             x={pointX}
                                             y={labelY}
                                             textAnchor="middle"
                                             fontSize="14"
                                             fontWeight="bold"
                                             fill="#3b82f6"
                                         >{load.magnitude} kN
                                         </text>
                                        {/* Línea conectora si la etiqueta está muy desplazada */}
                                        {adjustedLabel && Math.abs(labelY - (isNegative ? beamY + loadHeight + 25 : beamY - loadHeight - 10)) > 30 && (
                                            <line
                                                x1={pointX}
                                                y1={isNegative ? beamY + loadHeight + 25 : beamY - loadHeight - 10}
                                                x2={pointX}
                                                y2={labelY + (labelY > beamY ? -8 : 8)}
                                                stroke="#3b82f6"
                                                strokeWidth="1"
                                                strokeDasharray="2,2"
                                                opacity="0.6"
                                            />
                                        )}
                                    </>
                                );
                            })()}
                        </g>
                    );
                    break;

                case 'distributed':
                    const startX = positionToX(load.start);
                    const endX = positionToX(load.end);
                    const w1 = load.w1 || 0;
                    const w2 = load.w2 || 0;
                    const maxW = Math.max(Math.abs(w1), Math.abs(w2));
                    const maxDistHeight = Math.max(MIN_LOAD_HEIGHT, Math.min(maxW * 3, MAX_LOAD_HEIGHT)); // Factor aumentado de 2 a 3
                    const h1 = maxW > 0 ? (Math.abs(w1) / maxW) * maxDistHeight : 0;
                    const h2 = maxW > 0 ? (Math.abs(w2) / maxW) * maxDistHeight : 0;
                    
                    // El eje horizontal debe estar en el eje 0 (beamY) como las cargas puntuales
                    const baseY = beamY;
                    const y1Start = baseY;
                    const y1End = w1 >= 0 ? baseY - h1 : baseY + h1;
                    const y2Start = baseY;
                    const y2End = w2 >= 0 ? baseY - h2 : baseY + h2;
                    
                    elements.push(
                        <g key={`distributed-load-${index}`}>
                            {/* Definir clipPath para recortar las flechas */}
                            <defs>
                                <clipPath id={`clip-${index}`}>
                                    <polygon
                                        points={`${startX},${y1Start} ${startX},${y1End} ${endX},${y2End} ${endX},${y2Start}`}
                                    />
                                </clipPath>
                            </defs>

                            {/* Contorno de carga distribuida como path continuo */}
                            <path
                                d={`M ${startX} ${y1Start} L ${startX} ${y1End} L ${endX} ${y2End} L ${endX} ${y2Start}`}
                                fill="none"
                                stroke="#9333ea"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {/* Flechas de carga distribuida con recorte */}
                            <g clipPath={`url(#clip-${index})`}>
                                {(() => {
                                    const arrows = [];
                                    const spacing = 25; // Espaciado reducido para más flechas
                                    const length = endX - startX;
                                    const numArrows = Math.max(3, Math.floor(length / spacing) + 1);
                                    
                                    // Siempre incluir flechas al inicio, medio y final
                                    for (let i = 0; i < numArrows; i++) {
                                        const ratio = i / (numArrows - 1);
                                        const x = startX + ratio * (endX - startX);
                                        
                                        // Interpolar el valor de carga en esta posición
                                        const wAtX = w1 + ratio * (w2 - w1);
                                        const isNegativeAtX = wAtX < 0;
                                        
                                        // Solo dibujar flecha si hay carga significativa
                                        if (Math.abs(wAtX) < 0.01) continue;
                                        
                                        // Calcular la altura proporcional al valor absoluto de la carga
                                        const hAtX = maxW > 0 ? (Math.abs(wAtX) / maxW) * maxDistHeight : 0;
                                        
                                        // Calcular las posiciones Y correctas - las flechas apuntan al eje 0 (beamY)
                                        const arrowStartY = beamY;
                                        const arrowEndY = isNegativeAtX ? beamY + hAtX : beamY - hAtX;
                                        
                                        arrows.push(
                                            <g key={`arrow-${i}`}>
                                                <line
                                                    x1={x}
                                                    y1={arrowEndY}
                                                    x2={x}
                                                    y2={arrowStartY + (isNegativeAtX ? ARROW_HEIGHT : -ARROW_HEIGHT)}
                                                    stroke="#9333ea"
                                                    strokeWidth="2"
                                                />
                                                {/* Punta de flecha */}
                                                <polygon
                                                    points={isNegativeAtX ?
                                                        `${x},${beamY} ${x - ARROW_WIDTH},${beamY + ARROW_HEIGHT} ${x + ARROW_WIDTH},${beamY + ARROW_HEIGHT}` :
                                                        `${x},${beamY} ${x - ARROW_WIDTH},${beamY - ARROW_HEIGHT} ${x + ARROW_WIDTH},${beamY - ARROW_HEIGHT}`
                                                    }
                                                    fill="#9333ea"
                                                />
                                            </g>
                                        );
                                    }
                                    return arrows;
                                })()}
                            </g>
                            {/* Etiquetas de inicio y fin con posiciones ajustadas */}
                            {(() => {
                                const adjustedStartLabel = adjustedLabelPositions.find(label => 
                                    label.loadIndex === index && label.type === 'distributed-start'
                                );
                                const adjustedEndLabel = adjustedLabelPositions.find(label => 
                                    label.loadIndex === index && label.type === 'distributed-end'
                                );
                                
                                const startLabelY = adjustedStartLabel ? adjustedStartLabel.y : (w1 >= 0 ? y1End - 10 : y1End + 20);
                                const endLabelY = adjustedEndLabel ? adjustedEndLabel.y : (w2 >= 0 ? y2End - 10 : y2End + 20);
                                
                                return (
                                    <>
                                        {/* Etiqueta de valor inicial */}
                                        <text
                                            x={startX}
                                            y={startLabelY}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fontWeight="bold"
                                            fill="#9333ea"
                                        >
                                            {w1} kN/m
                                        </text>
                                        {/* Línea conectora para etiqueta inicial si está desplazada */}
                                        {adjustedStartLabel && Math.abs(startLabelY - (w1 >= 0 ? y1End - 10 : y1End + 20)) > 30 && (
                                            <line
                                                x1={startX}
                                                y1={w1 >= 0 ? y1End - 10 : y1End + 20}
                                                x2={startX}
                                                y2={startLabelY + (startLabelY > beamY ? -8 : 8)}
                                                stroke="#9333ea"
                                                strokeWidth="1"
                                                strokeDasharray="2,2"
                                                opacity="0.6"
                                            />
                                        )}
                                        
                                        {/* Etiqueta de valor final */}
                                        <text
                                            x={endX}
                                            y={endLabelY}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fontWeight="bold"
                                            fill="#9333ea"
                                        >
                                            {w2} kN/m
                                        </text>
                                        {/* Línea conectora para etiqueta final si está desplazada */}
                                        {adjustedEndLabel && Math.abs(endLabelY - (w2 >= 0 ? y2End - 10 : y2End + 20)) > 30 && (
                                            <line
                                                x1={endX}
                                                y1={w2 >= 0 ? y2End - 10 : y2End + 20}
                                                x2={endX}
                                                y2={endLabelY + (endLabelY > beamY ? -8 : 8)}
                                                stroke="#9333ea"
                                                strokeWidth="1"
                                                strokeDasharray="2,2"
                                                opacity="0.6"
                                            />
                                        )}
                                    </>
                                );
                            })()}
                        </g>
                    );
                    break;

                case 'moment':
                    const momentX = positionToX(load.position);
                    const momentRadius = 25;
                    const isClockwise = load.magnitude > 0;
                    
                    elements.push(
                        <g key={`moment-${index}`}>
                            {(() => {
                                // Configuración del momento
                                const arrowSize = 10;
                                const strokeWidth = 3;
                                
                                // Ángulos para el arco (270° total)
                                const startAngle = -Math.PI/4; // -45°
                                const endAngle = startAngle + (isClockwise ? -3*Math.PI/2 : 3*Math.PI/2); // 270° en la dirección correspondiente
                                
                                // Puntos del arco
                                const startX = momentX + momentRadius * Math.cos(startAngle);
                                const startY = beamY + momentRadius * Math.sin(startAngle);
                                const endX = momentX + momentRadius * Math.cos(endAngle);
                                const endY = beamY + momentRadius * Math.sin(endAngle);
                                
                                // Flecha en el extremo del arco
                                const arrowAngle = endAngle + (isClockwise ? -Math.PI/2 : Math.PI/2); // Tangente al arco
                                
                                // Puntos de la flecha triangular
                                const tipX = endX + arrowSize * Math.cos(arrowAngle);
                                const tipY = endY + arrowSize * Math.sin(arrowAngle);
                                
                                const baseAngle1 = arrowAngle + 2.5; // ~143°
                                const baseAngle2 = arrowAngle - 2.5; // ~143°
                                
                                const base1X = endX + (arrowSize * 0.6) * Math.cos(baseAngle1);
                                const base1Y = endY + (arrowSize * 0.6) * Math.sin(baseAngle1);
                                const base2X = endX + (arrowSize * 0.6) * Math.cos(baseAngle2);
                                const base2Y = endY + (arrowSize * 0.6) * Math.sin(baseAngle2);
                                
                                return (
                                    <>
                                        {/* Arco principal del momento */}
                                        <path
                                            d={`M ${startX} ${startY} A ${momentRadius} ${momentRadius} 0 1 ${isClockwise ? 0 : 1} ${endX} ${endY}`}
                                            fill="none"
                                            stroke="#f97316"
                                            strokeWidth={strokeWidth}
                                            strokeLinecap="round"
                                        />
                                        
                                        {/* Flecha triangular en el extremo */}
                                        <polygon
                                            points={`${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}`}
                                            fill="#f97316"
                                            stroke="#f97316"
                                            strokeWidth="1"
                                            strokeLinejoin="round"
                                        />
                                    </>
                                );
                            })()
                        }
                            {/* Etiqueta del momento con posición ajustada */}
                            {(() => {
                                const adjustedLabel = adjustedLabelPositions.find(label => 
                                    label.loadIndex === index && label.type === 'moment'
                                );
                                const labelY = adjustedLabel ? adjustedLabel.y : beamY - momentRadius - 15;
                                
                                return (
                                    <>
                                        <text
                                            x={momentX}
                                            y={labelY}
                                            textAnchor="middle"
                                            fontSize="14"
                                            fontWeight="bold"
                                            fill="#f97316"
                                        >
                                            {Math.abs(load.magnitude)} kN⋅m
                                        </text>
                                        {/* Línea conectora si la etiqueta está muy desplazada */}
                                        {adjustedLabel && Math.abs(labelY - (beamY - momentRadius - 15)) > 30 && (
                                            <line
                                                x1={momentX}
                                                y1={beamY - momentRadius - 15}
                                                x2={momentX}
                                                y2={labelY + 8}
                                                stroke="#f97316"
                                                strokeWidth="1"
                                                strokeDasharray="2,2"
                                                opacity="0.6"
                                            />
                                        )}
                                    </>
                                );
                            })()}
                        </g>
                    );
                    break;
            }
        });

        // Regla interactiva que muestra posiciones de cargas
        const ruleY = beamY + 80;
        
        // Recopilar todas las posiciones únicas de las cargas
        const loadPositions = new Set<number>();
        loads.forEach(load => {
            if (load.type === 'point' || load.type === 'moment') {
                loadPositions.add(load.position);
            } else if (load.type === 'distributed') {
                loadPositions.add(load.start);
                loadPositions.add(load.end);
            }
        });
        
        // Agregar siempre el inicio (0) y el final (spanLength)
        loadPositions.add(0);
        loadPositions.add(spanLength);
        
        // Convertir a array ordenado
        const sortedPositions = Array.from(loadPositions).sort((a, b) => a - b);
        
        // Función para formatear números con hasta 3 decimales
        const formatPosition = (pos: number): string => {
            // Redondear a 3 decimales para evitar problemas de precisión
            const rounded = Math.round(pos * 1000) / 1000;
            // Si es entero, mostrar sin decimales
            if (rounded % 1 === 0) {
                return `${rounded}`;
            }
            // Mostrar hasta 3 decimales, eliminando ceros finales
            return rounded.toFixed(3).replace(/\.?0+$/, '');
        };
        
        // Detectar superposiciones y ajustar posiciones de texto
        const textPositions: { x: number; y: number; text: string; originalIndex: number }[] = [];
        const minTextSpacing = 40; // Espaciado mínimo entre textos en píxeles
        
        sortedPositions.forEach((position, index) => {
            const x = positionToX(position);
            const text = `${formatPosition(position)} m`;
            let textY = ruleY + 30;
            
            // Verificar superposiciones con textos anteriores
            let hasOverlap = true;
            let attempts = 0;
            const maxAttempts = 3;
            
            while (hasOverlap && attempts < maxAttempts) {
                hasOverlap = false;
                for (const existingText of textPositions) {
                    const distance = Math.abs(x - existingText.x);
                    const verticalDistance = Math.abs(textY - existingText.y);
                    
                    // Si están muy cerca horizontalmente y en la misma línea vertical
                    if (distance < minTextSpacing && verticalDistance < 10) {
                        hasOverlap = true;
                        textY += 15; // Mover hacia abajo
                        break;
                    }
                }
                attempts++;
            }
            
            textPositions.push({ x, y: textY, text, originalIndex: index });
        });
        
        elements.push(
            <g key="rule">
                {/* Línea principal de la regla */}
                <line
                    x1={beamStartX}
                    y1={ruleY}
                    x2={beamEndX}
                    y2={ruleY}
                    stroke="#374151"
                    strokeWidth="2"
                />
                {/* Marcas interactivas basadas en posiciones de cargas */}
                {sortedPositions.map((position, index) => {
                    const x = positionToX(position);
                    const isStartOrEnd = position === 0 || position === spanLength;
                    const isLoadPosition = loads.some(load => {
                        if (load.type === 'point' || load.type === 'moment') {
                            return Math.abs(load.position - position) < 0.001;
                        } else if (load.type === 'distributed') {
                            return Math.abs(load.start - position) < 0.001 || Math.abs(load.end - position) < 0.001;
                        }
                        return false;
                    });
                    
                    // Determinar el color y estilo según el tipo de marca
                    let strokeColor = "#374151";
                    let strokeWidth = "2";
                    let textColor = "#374151";
                    let markHeight = 12;
                    
                    if (isStartOrEnd) {
                        strokeColor = "#dc2626";
                        strokeWidth = "3";
                        textColor = "#dc2626";
                        markHeight = 15;
                    } else if (isLoadPosition) {
                        strokeColor = "#059669";
                        strokeWidth = "2.5";
                        textColor = "#059669";
                        markHeight = 14;
                    }
                    
                    // Encontrar la posición de texto ajustada para evitar superposiciones
                    const textPos = textPositions.find(tp => tp.originalIndex === index);
                    
                    return (
                        <g key={`rule-mark-${index}`}>
                            <line
                                x1={x}
                                y1={ruleY - markHeight}
                                x2={x}
                                y2={ruleY + markHeight}
                                stroke={strokeColor}
                                strokeWidth={strokeWidth}
                            />
                            <text
                                x={x}
                                y={textPos?.y || ruleY + 30}
                                textAnchor="middle"
                                fontSize={isStartOrEnd ? "12" : "11"}
                                fontWeight="bold"
                                fill="#374151"
                            >
                                {textPos?.text || `${formatPosition(position)} m`}
                            </text>
                            {/* Línea conectora si el texto está desplazado */}
                            {textPos && textPos.y > ruleY + 35 && (
                                <line
                                    x1={x}
                                    y1={ruleY + markHeight}
                                    x2={x}
                                    y2={textPos.y - 8}
                                    stroke={strokeColor}
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                    opacity="0.6"
                                />
                            )}
                            {/* Indicador visual para posiciones de cargas */}
                            {isLoadPosition && !isStartOrEnd && (
                                <circle
                                    cx={x}
                                    cy={ruleY - markHeight - 5}
                                    r="3"
                                    fill={strokeColor}
                                    stroke="white"
                                    strokeWidth="1"
                                />
                            )}
                        </g>
                    );
                })}
            </g>
        );

        return elements;
    }, [loads, spanLength, beamY, beamStartX, beamEndX, beamLength, positionToX]);

    return (
        <div className={clsx('w-full', className)}>
            {/* Título responsivo */}
            <div className="mb-2 sm:mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="flex items-center gap-2">
                        📊 Visualización Estructural
                    </span>
                    <span className="text-xs sm:text-sm font-normal text-blue-100">
                        Tramo: {spanLength}m | Cargas: {loads.length}
                    </span>
                </h2>
            </div>
            
            {/* Canvas completamente responsivo */}
            <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl border border-gray-200 overflow-hidden">
                <svg
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    className="w-full h-auto bg-gradient-to-br from-slate-50 to-slate-100"
                    style={{
                        aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`,
                        minHeight: '300px', // Altura mínima aumentada
                        maxHeight: '650px', // Altura máxima aumentada para aprovechar espacio
                    }}
                >
                    {/* Definiciones para flechas */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill="#3b82f6"
                            />
                        </marker>
                        <marker
                            id="momentArrow"
                            markerWidth="8"
                            markerHeight="8"
                            refX="6"
                            refY="4"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 8 4, 0 8"
                                fill="#f97316"
                            />
                        </marker>
                    </defs>
                    
                    {svgElements}
                </svg>
            </div>
        </div>
    );
}
