// src/utils/drawing/beamDrawer.ts

import type {
    BeamDrawingConfig,
    DrawingOffsets,
    SupportDrawingConfig,
} from '../../types';

/**
 * Dibuja una viga con estilo profesional
 */
export function drawProfessionalBeam(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    length: number,
    config: BeamDrawingConfig = {
        height: 16,
        color: '#2c3e50',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: 3,
    }
): void {
    // Sombra de la viga
    ctx.fillStyle = config.shadowColor;
    ctx.fillRect(
        x + config.shadowOffset,
        y + config.shadowOffset,
        length,
        config.height
    );

    // Viga principal con gradiente
    const gradient = ctx.createLinearGradient(
        x,
        y - config.height / 2,
        x,
        y + config.height / 2
    );
    gradient.addColorStop(0, lightenColor(config.color, 0.2));
    gradient.addColorStop(0.5, config.color);
    gradient.addColorStop(1, darkenColor(config.color, 0.3));

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y - config.height / 2, length, config.height);

    // Bordes con brillo
    ctx.strokeStyle = lightenColor(config.color, 0.1);
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - config.height / 2, length, config.height);

    // Línea de brillo superior
    ctx.strokeStyle = lightenColor(config.color, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y - config.height / 2 + 2);
    ctx.lineTo(x + length - 2, y - config.height / 2 + 2);
    ctx.stroke();
}

/**
 * Dibuja apoyos elegantes
 */
export function drawElegantSupport(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    config: SupportDrawingConfig = {
        width: 40,
        height: 30,
        color: '#34495e',
        baseColor: '#2c3e50',
    }
): void {
    const halfWidth = config.width / 2;

    // Sombra del apoyo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x - halfWidth + 2, y + config.height + 2);
    ctx.lineTo(x + halfWidth + 2, y + config.height + 2);
    ctx.closePath();
    ctx.fill();

    // Apoyo principal con gradiente
    const gradient = ctx.createLinearGradient(x, y, x, y + config.height);
    gradient.addColorStop(0, lightenColor(config.color, 0.2));
    gradient.addColorStop(1, config.color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - halfWidth, y + config.height);
    ctx.lineTo(x + halfWidth, y + config.height);
    ctx.closePath();
    ctx.fill();

    // Borde del apoyo
    ctx.strokeStyle = darkenColor(config.color, 0.2);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - halfWidth, y + config.height);
    ctx.lineTo(x + halfWidth, y + config.height);
    ctx.closePath();
    ctx.stroke();

    // Base del apoyo con textura
    const baseWidth = config.width * 1.2;
    const baseHeight = 8;

    ctx.fillStyle = config.baseColor;
    ctx.fillRect(x - baseWidth / 2, y + config.height, baseWidth, baseHeight);

    // Rayado de la base (indicando conexión fija)
    ctx.strokeStyle = darkenColor(config.baseColor, 0.3);
    ctx.lineWidth = 2;
    for (let i = -baseWidth / 2; i <= baseWidth / 2; i += 5) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + config.height);
        ctx.lineTo(x + i - 3, y + config.height + baseHeight);
        ctx.stroke();
    }

    // Brillo en el apoyo
    ctx.strokeStyle = lightenColor(config.color, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 5);
    ctx.lineTo(x - halfWidth / 2, y + config.height / 2);
    ctx.stroke();
}

/**
 * Dibuja una regla inteligente y sofisticada
 */
export function drawIntelligentRule(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    ruleY: number,
    beamLength: number,
    spanLength: number
): void {
    // Determinar intervalo inteligente
    let interval: number;
    if (spanLength <= 10) interval = 1;
    else if (spanLength <= 30) interval = 5;
    else if (spanLength <= 100) interval = 10;
    else if (spanLength <= 200) interval = 25;
    else if (spanLength <= 500) interval = 50;
    else interval = 100;

    const scale = beamLength / spanLength;

    // Línea base de la regla con estilo
    const ruleGradient = ctx.createLinearGradient(
        offsetX,
        ruleY,
        offsetX + beamLength,
        ruleY
    );
    ruleGradient.addColorStop(0, '#34495e');
    ruleGradient.addColorStop(0.5, '#2c3e50');
    ruleGradient.addColorStop(1, '#34495e');

    ctx.strokeStyle = ruleGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(offsetX, ruleY);
    ctx.lineTo(offsetX + beamLength, ruleY);
    ctx.stroke();

    // Marcas y etiquetas
    ctx.font = 'bold 12px "Segoe UI", Arial';
    ctx.fillStyle = '#2c3e50';

    for (let i = 0; i <= spanLength; i += interval) {
        const x = offsetX + i * scale;

        // Marca mayor o menor
        const isMainMark = i % (interval * 2) === 0 || i === spanLength;
        const markHeight = isMainMark ? 15 : 8;
        const markWidth = isMainMark ? 3 : 2;

        ctx.strokeStyle = isMainMark ? '#2c3e50' : '#7f8c8d';
        ctx.lineWidth = markWidth;
        ctx.beginPath();
        ctx.moveTo(x, ruleY - markHeight / 2);
        ctx.lineTo(x, ruleY + markHeight / 2);
        ctx.stroke();

        // Etiqueta solo para marcas principales
        if (isMainMark) {
            const label = `${i}m`;
            const textWidth = ctx.measureText(label).width;

            // Fondo de la etiqueta
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(x - textWidth / 2 - 3, ruleY + 20, textWidth + 6, 16);

            // Borde de la etiqueta
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                x - textWidth / 2 - 3,
                ruleY + 20,
                textWidth + 6,
                16
            );

            // Texto
            ctx.fillStyle = '#2c3e50';
            ctx.fillText(label, x - textWidth / 2, ruleY + 30);
        }
    }
}

/**
 * Dibuja una cuadrícula de fondo opcional
 */
export function drawGrid(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    gridSize: number = 20,
    color: string = 'rgba(0, 0, 0, 0.05)'
): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Líneas verticales
    for (let x = offsetX; x <= offsetX + width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, offsetY - height / 2);
        ctx.lineTo(x, offsetY + height / 2);
        ctx.stroke();
    }

    // Líneas horizontales
    for (
        let y = offsetY - height / 2;
        y <= offsetY + height / 2;
        y += gridSize
    ) {
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + width, y);
        ctx.stroke();
    }
}

/**
 * Dibuja información adicional sobre la viga
 */
export function drawBeamInfo(
    ctx: CanvasRenderingContext2D,
    spanLength: number,
    x: number,
    y: number
): void {
    const info = [
        `Longitud del tramo: ${spanLength} m`,
        `Tipo: Viga simplemente apoyada`,
        `Análisis: Teorema de Clapeyron`,
    ];

    ctx.font = '12px "Segoe UI", Arial';
    ctx.fillStyle = '#7f8c8d';

    info.forEach((line, index) => {
        ctx.fillText(line, x, y + index * 16);
    });
}

// Funciones auxiliares para manipulación de colores
function lightenColor(color: string, factor: number): string {
    // Convertir hex a RGB y aclarar
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `rgb(${newR}, ${newG}, ${newB})`;
}

function darkenColor(color: string, factor: number): string {
    // Convertir hex a RGB y oscurecer
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - factor)));
    const newG = Math.max(0, Math.floor(g * (1 - factor)));
    const newB = Math.max(0, Math.floor(b * (1 - factor)));

    return `rgb(${newR}, ${newG}, ${newB})`;
}
