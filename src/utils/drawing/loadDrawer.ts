// src/utils/drawing/loadDrawer.ts

import type { Load, LoadDrawingConfig } from '../../types';

const DEFAULT_CONFIG: LoadDrawingConfig = {
    arrowColor: '#e74c3c',
    arrowWidth: 8,
    maxArrowLength: 120,
    labelFont: 'bold 13px "Segoe UI", Arial',
    labelColor: '#2c3e50',
    labelBackgroundColor: 'rgba(255, 255, 255, 0.95)',
};

/**
 * Dibuja una carga puntual elegante
 */
export function drawElegantPointLoad(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    magnitude: number,
    scale: number,
    config: LoadDrawingConfig = DEFAULT_CONFIG,
    adaptiveScale?: number
): void {
    if (Math.abs(magnitude) < 0.001) return;

    // Usar escala adaptativa si se proporciona, sino usar la escala fija original
    const loadScale = adaptiveScale || 0.08;
    const arrowLength = Math.min(
        Math.abs(magnitude) * loadScale,
        config.maxArrowLength
    );
    const direction = magnitude > 0 ? -1 : 1;
    const arrowWidth = config.arrowWidth;

    // Sombra de la flecha
    ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
    ctx.fillRect(
        x - arrowWidth / 2 + 2,
        y + direction * arrowLength + 2,
        arrowWidth,
        -direction * arrowLength
    );

    // Cuerpo de la flecha con gradiente
    const gradient = ctx.createLinearGradient(
        x - arrowWidth,
        y,
        x + arrowWidth,
        y
    );
    gradient.addColorStop(0, config.arrowColor);
    gradient.addColorStop(0.5, darkenColor(config.arrowColor, 0.2));
    gradient.addColorStop(1, config.arrowColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(x - arrowWidth / 2, y, arrowWidth, direction * arrowLength);

    // Punta de la flecha elegante
    const headGradient = ctx.createRadialGradient(
        x,
        y + direction * arrowLength,
        0,
        x,
        y + direction * arrowLength,
        15
    );
    headGradient.addColorStop(0, darkenColor(config.arrowColor, 0.2));
    headGradient.addColorStop(1, darkenColor(config.arrowColor, 0.4));

    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.moveTo(x, y + direction * arrowLength);
    ctx.lineTo(x - 15, y + direction * (arrowLength - 25));
    ctx.lineTo(x + 15, y + direction * (arrowLength - 25));
    ctx.closePath();
    ctx.fill();

    // Brillo en la punta
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x, y + direction * arrowLength);
    ctx.lineTo(x - 8, y + direction * (arrowLength - 15));
    ctx.lineTo(x + 8, y + direction * (arrowLength - 15));
    ctx.closePath();
    ctx.fill();

    // Etiqueta profesional
    drawProfessionalLabel(
        ctx,
        x,
        y + direction * arrowLength - direction * 40,
        `${Math.abs(magnitude).toFixed(1)} kN`,
        config.arrowColor,
        config
    );
}

/**
 * Dibuja una carga distribuida elegante
 */
export function drawElegantDistributedLoad(
    ctx: CanvasRenderingContext2D,
    x1: number,
    x2: number,
    y: number,
    w1: number,
    w2: number,
    scale: number,
    config: LoadDrawingConfig = DEFAULT_CONFIG,
    adaptiveScale?: number
): void {
    if (Math.abs(w1) < 0.001 && Math.abs(w2) < 0.001) return;

    // Usar escala adaptativa si se proporciona, sino usar la escala fija original
    const loadScale = adaptiveScale || 0.1;
    const h1 = Math.min(Math.abs(w1) * loadScale, 100);
    const h2 = Math.min(Math.abs(w2) * loadScale, 100);
    const color = '#9b59b6'; // Color púrpura para cargas distribuidas

    // Sombra del área
    ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x1 + 2, y + 2);
    ctx.lineTo(x1 + 2, y - h1 + 2);
    ctx.lineTo(x2 + 2, y - h2 + 2);
    ctx.lineTo(x2 + 2, y + 2);
    ctx.closePath();
    ctx.fill();

    // Área principal con gradiente
    const areaGradient = ctx.createLinearGradient(
        x1,
        y - Math.max(h1, h2),
        x1,
        y
    );
    areaGradient.addColorStop(0, 'rgba(155, 89, 182, 0.6)');
    areaGradient.addColorStop(1, 'rgba(155, 89, 182, 0.2)');

    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1, y - h1);
    ctx.lineTo(x2, y - h2);
    ctx.lineTo(x2, y);
    ctx.closePath();
    ctx.fill();

    // Línea superior elegante
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y - h1);
    ctx.lineTo(x2, y - h2);
    ctx.stroke();

    // Flechas profesionales
    const numArrows = Math.max(Math.floor((x2 - x1) / ((40 * scale) / 50)), 3);

    for (let i = 0; i <= numArrows; i++) {
        const x = x1 + ((x2 - x1) * i) / numArrows;
        const h = h1 + ((h2 - h1) * i) / numArrows;

        if (h > 8) {
            drawMiniArrow(ctx, x, y - h, y - 12, color);
        }
    }

    // Etiquetas elegantes
    if (Math.abs(w1) > 0.001) {
        drawProfessionalLabel(
            ctx,
            x1,
            y - h1 - 30,
            `${Math.abs(w1).toFixed(1)} kN/m`,
            color,
            config
        );
    }

    if (Math.abs(w2) > 0.001 && Math.abs(w1 - w2) > 0.001) {
        drawProfessionalLabel(
            ctx,
            x2,
            y - h2 - 30,
            `${Math.abs(w2).toFixed(1)} kN/m`,
            color,
            config
        );
    }
}

/**
 * Dibuja un momento aplicado elegante
 */
export function drawElegantMoment(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    magnitude: number,
    scale: number,
    config: LoadDrawingConfig = DEFAULT_CONFIG,
    adaptiveScale?: number
): void {
    if (Math.abs(magnitude) < 0.001) return;

    // Usar escala adaptativa si se proporciona, sino usar la escala fija original
    const loadScale = adaptiveScale || 0.06;
    const radius = Math.min(Math.abs(magnitude) * loadScale, 50);
    const direction = magnitude > 0 ? 1 : -1;
    const color = '#f39c12'; // Color naranja para momentos

    // Sombra del arco
    ctx.strokeStyle = 'rgba(243, 156, 18, 0.3)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, direction * 1.8 * Math.PI);
    ctx.stroke();

    // Arco principal con gradiente
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, direction * 1.8 * Math.PI);
    ctx.stroke();

    // Flecha en el extremo
    const arrowAngle = direction * 1.8 * Math.PI;
    const arrowX = x + radius * Math.cos(arrowAngle);
    const arrowY = y + radius * Math.sin(arrowAngle);

    const headGradient = ctx.createRadialGradient(
        arrowX,
        arrowY,
        0,
        arrowX,
        arrowY,
        12
    );
    headGradient.addColorStop(0, darkenColor(color, 0.1));
    headGradient.addColorStop(1, darkenColor(color, 0.3));

    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - direction * 12, arrowY - 8);
    ctx.lineTo(arrowX - direction * 12, arrowY + 8);
    ctx.closePath();
    ctx.fill();

    // Símbolo M en el centro
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText('M', x, y + 5);
    ctx.textAlign = 'start'; // Reset

    // Etiqueta profesional
    drawProfessionalLabel(
        ctx,
        x,
        y - radius - 40,
        `${Math.abs(magnitude).toFixed(1)} kN⋅m`,
        color,
        config
    );
}

/**
 * Calcula escalas adaptativas para las cargas basadas en el rango de magnitudes
 */
function calculateAdaptiveScales(loads: Load[]): {
    pointLoadScale: number;
    distributedLoadScale: number;
    momentScale: number;
} {
    if (loads.length === 0) {
        return {
            pointLoadScale: 0.08,
            distributedLoadScale: 0.1,
            momentScale: 0.06
        };
    }

    // Extraer todas las magnitudes por tipo
    const pointMagnitudes: number[] = [];
    const distributedMagnitudes: number[] = [];
    const momentMagnitudes: number[] = [];

    loads.forEach(load => {
        switch (load.type) {
            case 'point':
                pointMagnitudes.push(Math.abs(load.magnitude));
                break;
            case 'distributed':
                distributedMagnitudes.push(Math.abs(load.w1), Math.abs(load.w2));
                break;
            case 'moment':
                momentMagnitudes.push(Math.abs(load.magnitude));
                break;
        }
    });

    // Función para calcular escala adaptativa
    const calculateScale = (magnitudes: number[], baseScale: number, targetSize: number = 80): number => {
        if (magnitudes.length === 0) return baseScale;
        
        const maxMagnitude = Math.max(...magnitudes);
        const minMagnitude = Math.min(...magnitudes.filter(m => m > 0));
        
        // Si todas las cargas son similares (variación < 50%), usar escala uniforme
        const variation = maxMagnitude / (minMagnitude || 1);
        if (variation < 2) {
            // Escala uniforme para que la carga máxima tenga el tamaño objetivo
            return targetSize / maxMagnitude;
        }
        
        // Para rangos amplios, usar escala logarítmica suavizada
        const logMax = Math.log10(maxMagnitude);
        const logMin = Math.log10(minMagnitude || 0.1);
        const logRange = logMax - logMin;
        
        // Escala que hace que las cargas pequeñas sean visibles pero las grandes no dominen
        if (logRange > 1) {
            return targetSize / (maxMagnitude * 0.7); // Reducir el tamaño máximo para mejor balance
        }
        
        return targetSize / maxMagnitude;
    };

    return {
        pointLoadScale: calculateScale(pointMagnitudes, 0.08, 100),
        distributedLoadScale: calculateScale(distributedMagnitudes, 0.1, 80),
        momentScale: calculateScale(momentMagnitudes, 0.06, 60)
    };
}

/**
 * Dibuja todas las cargas en una lista con escalado adaptativo
 */
export function drawAllLoads(
    ctx: CanvasRenderingContext2D,
    loads: Load[],
    offsetX: number,
    beamY: number,
    scale: number,
    config: LoadDrawingConfig = DEFAULT_CONFIG
): void {
    // Calcular escalas adaptativas
    const adaptiveScales = calculateAdaptiveScales(loads);
    
    loads.forEach((load) => {
        switch (load.type) {
            case 'point':
                drawElegantPointLoad(
                    ctx,
                    offsetX + load.position * scale,
                    beamY,
                    load.magnitude,
                    scale,
                    config,
                    adaptiveScales.pointLoadScale
                );
                break;

            case 'distributed':
                drawElegantDistributedLoad(
                    ctx,
                    offsetX + load.start * scale,
                    offsetX + load.end * scale,
                    beamY,
                    load.w1,
                    load.w2,
                    scale,
                    config,
                    adaptiveScales.distributedLoadScale
                );
                break;

            case 'moment':
                drawElegantMoment(
                    ctx,
                    offsetX + load.position * scale,
                    beamY,
                    load.magnitude,
                    scale,
                    config,
                    adaptiveScales.momentScale
                );
                break;
        }
    });
}

/**
 * Dibuja una mini flecha para cargas distribuidas
 */
function drawMiniArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    startY: number,
    endY: number,
    color: string
): void {
    // Cuerpo de la mini flecha
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();

    // Punta
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, endY);
    ctx.lineTo(x - 6, endY - 10);
    ctx.lineTo(x + 6, endY - 10);
    ctx.closePath();
    ctx.fill();
}

/**
 * Dibuja una etiqueta profesional
 */
function drawProfessionalLabel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string,
    config: LoadDrawingConfig
): void {
    ctx.font = config.labelFont;
    const textWidth = ctx.measureText(text).width;

    // Sombra del fondo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x - textWidth / 2 - 8 + 2, y - 12 + 2, textWidth + 16, 20);

    // Fondo principal
    ctx.fillStyle = config.labelBackgroundColor;
    ctx.fillRect(x - textWidth / 2 - 8, y - 12, textWidth + 16, 20);

    // Borde elegante
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - textWidth / 2 - 8, y - 12, textWidth + 16, 20);

    // Pequeño triángulo indicador
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x - 5, y + 3);
    ctx.lineTo(x + 5, y + 3);
    ctx.closePath();
    ctx.fill();

    // Texto
    ctx.fillStyle = config.labelColor;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 2);
    ctx.textAlign = 'start'; // Reset
}

/**
 * Resalta una carga específica (para interactividad)
 */
export function highlightLoad(
    ctx: CanvasRenderingContext2D,
    load: Load,
    offsetX: number,
    beamY: number,
    scale: number
): void {
    ctx.save();

    // Efecto de brillo
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;

    switch (load.type) {
        case 'point':
            ctx.strokeStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(
                offsetX + load.position * scale,
                beamY - 30,
                20,
                0,
                2 * Math.PI
            );
            ctx.stroke();
            break;

        case 'distributed':
            ctx.strokeStyle = '#ffff00';
            ctx.strokeRect(
                offsetX + load.start * scale - 10,
                beamY - 80,
                (load.end - load.start) * scale + 20,
                60
            );
            break;

        case 'moment':
            ctx.strokeStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(offsetX + load.position * scale, beamY, 35, 0, 2 * Math.PI);
            ctx.stroke();
            break;
    }

    ctx.restore();
}

// Función auxiliar para oscurecer colores
function darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - factor)));
    const newG = Math.max(0, Math.floor(g * (1 - factor)));
    const newB = Math.max(0, Math.floor(b * (1 - factor)));

    return `rgb(${newR}, ${newG}, ${newB})`;
}
