// src/utils/drawing/diagramDrawer.ts

import type { DiagramConfig, MomentCalculationPoint } from '../../types';

const DEFAULT_CONFIG: DiagramConfig = {
    lineColor: '#e74c3c',
    lineWidth: 4,
    fillColor: 'rgba(231, 76, 60, 0.4)',
    fillOpacity: 0.3,
    pointColor: '#c0392b',
    pointRadius: 4,
};

/**
 * Dibuja un diagrama de momentos completo
 */
export function drawMomentDiagram(
    ctx: CanvasRenderingContext2D,
    momentPoints: MomentCalculationPoint[],
    offsetX: number,
    offsetY: number,
    beamLength: number,
    spanLength: number,
    maxMoment: number,
    config: DiagramConfig = DEFAULT_CONFIG
): void {
    if (momentPoints.length < 2) return;

    const scale = beamLength / spanLength;
    const momentScale = maxMoment > 0 ? 80 / maxMoment : 1;

    // Dibujar línea base elegante
    drawBaseLine(ctx, offsetX, offsetY, beamLength);

    // Llenar el área bajo la curva con gradiente
    drawDiagramArea(
        ctx,
        momentPoints,
        offsetX,
        offsetY,
        scale,
        momentScale,
        config
    );

    // Dibujar la curva del diagrama con estilo
    drawDiagramCurve(
        ctx,
        momentPoints,
        offsetX,
        offsetY,
        scale,
        momentScale,
        config
    );

    // Añadir puntos de datos importantes
    drawDataPoints(
        ctx,
        momentPoints,
        offsetX,
        offsetY,
        scale,
        momentScale,
        config
    );

    // Dibujar cuadrícula sutil
    drawGrid(ctx, offsetX, offsetY, beamLength, 80);

    // Etiquetas y anotaciones
    drawDiagramLabels(ctx, offsetX, offsetY, maxMoment, spanLength);
}

/**
 * Dibuja la línea base del diagrama
 */
function drawBaseLine(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    beamLength: number
): void {
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX + beamLength, offsetY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
}

/**
 * Dibuja el área bajo la curva del diagrama
 */
function drawDiagramArea(
    ctx: CanvasRenderingContext2D,
    momentPoints: MomentCalculationPoint[],
    offsetX: number,
    offsetY: number,
    scale: number,
    momentScale: number,
    config: DiagramConfig
): void {
    // Crear gradiente para el área
    const minY = Math.min(
        ...momentPoints.map((p) => offsetY - p.moment * momentScale)
    );
    const areaGradient = ctx.createLinearGradient(
        offsetX,
        minY,
        offsetX,
        offsetY
    );
    areaGradient.addColorStop(0, config.fillColor);
    areaGradient.addColorStop(1, 'rgba(231, 76, 60, 0.1)');

    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);

    momentPoints.forEach((point) => {
        const x =
            offsetX +
            ((point.x / momentPoints[momentPoints.length - 1].x) *
                (momentPoints.length - 1) *
                scale) /
                momentPoints.length;
        const y = offsetY - point.moment * momentScale;
        ctx.lineTo(x, y);
    });

    ctx.lineTo(
        offsetX + ((momentPoints.length - 1) * scale) / momentPoints.length,
        offsetY
    );
    ctx.closePath();
    ctx.fill();
}

/**
 * Dibuja la curva del diagrama
 */
function drawDiagramCurve(
    ctx: CanvasRenderingContext2D,
    momentPoints: MomentCalculationPoint[],
    offsetX: number,
    offsetY: number,
    scale: number,
    momentScale: number,
    config: DiagramConfig
): void {
    // Sombra de la curva
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = config.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    momentPoints.forEach((point, index) => {
        const x =
            offsetX +
            ((point.x / momentPoints[momentPoints.length - 1].x) *
                (momentPoints.length - 1) *
                scale) /
                momentPoints.length;
        const y = offsetY - point.moment * momentScale;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            // Usar curvas suaves para una apariencia más profesional
            const prevPoint = momentPoints[index - 1];
            const prevX =
                offsetX +
                ((prevPoint.x / momentPoints[momentPoints.length - 1].x) *
                    (momentPoints.length - 1) *
                    scale) /
                    momentPoints.length;
            const prevY = offsetY - prevPoint.moment * momentScale;

            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
    });

    ctx.stroke();
    ctx.restore();
}

/**
 * Dibuja puntos de datos importantes
 */
function drawDataPoints(
    ctx: CanvasRenderingContext2D,
    momentPoints: MomentCalculationPoint[],
    offsetX: number,
    offsetY: number,
    scale: number,
    momentScale: number,
    config: DiagramConfig
): void {
    ctx.fillStyle = config.pointColor;

    // Dibujar puntos cada cierto intervalo
    const interval = Math.max(1, Math.floor(momentPoints.length / 20));

    momentPoints.forEach((point, index) => {
        if (index % interval === 0 || index === momentPoints.length - 1) {
            const x =
                offsetX +
                ((point.x / momentPoints[momentPoints.length - 1].x) *
                    (momentPoints.length - 1) *
                    scale) /
                    momentPoints.length;
            const y = offsetY - point.moment * momentScale;

            // Punto con brillo
            ctx.beginPath();
            ctx.arc(x, y, config.pointRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Brillo interior
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, config.pointRadius / 2, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = config.pointColor; // Reset color
        }
    });
}

/**
 * Dibuja una cuadrícula sutil de fondo
 */
function drawGrid(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    beamLength: number,
    height: number
): void {
    ctx.strokeStyle = 'rgba(149, 165, 166, 0.2)';
    ctx.lineWidth = 1;

    // Líneas horizontales
    for (let i = 1; i <= 4; i++) {
        const y = offsetY - i * (height / 4);
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + beamLength, y);
        ctx.stroke();

        // Línea inferior también
        const yBottom = offsetY + i * (height / 8);
        ctx.beginPath();
        ctx.moveTo(offsetX, yBottom);
        ctx.lineTo(offsetX + beamLength, yBottom);
        ctx.stroke();
    }

    // Líneas verticales
    for (let i = 1; i <= 8; i++) {
        const x = offsetX + i * (beamLength / 8);
        ctx.beginPath();
        ctx.moveTo(x, offsetY - height);
        ctx.lineTo(x, offsetY + height / 2);
        ctx.stroke();
    }
}

/**
 * Dibuja etiquetas y anotaciones del diagrama
 */
function drawDiagramLabels(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    maxMoment: number,
    spanLength: number
): void {
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px "Segoe UI", Arial';

    // Título del diagrama
    const title = '📉 Diagrama de Momentos M(x)';
    ctx.fillText(title, offsetX, offsetY - 120);

    // Información del momento máximo
    if (maxMoment > 0) {
        ctx.font = '14px "Segoe UI", Arial';
        ctx.fillText(
            `Momento máximo: ${maxMoment.toFixed(3)} kN⋅m`,
            offsetX,
            offsetY - 100
        );
    }

    // Etiquetas de los ejes
    ctx.font = '12px "Segoe UI", Arial';
    ctx.fillStyle = '#7f8c8d';

    // Eje X
    ctx.fillText('0', offsetX - 5, offsetY + 15);
    ctx.fillText(
        `${spanLength}m`,
        offsetX + spanLength * 10 - 15,
        offsetY + 15
    );

    // Eje Y
    ctx.save();
    ctx.translate(offsetX - 30, offsetY - 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Momento (kN⋅m)', 0, 0);
    ctx.restore();
}

/**
 * Dibuja un diagrama de cortante (para uso futuro)
 */
export function drawShearDiagram(
    ctx: CanvasRenderingContext2D,
    shearPoints: { x: number; shear: number }[],
    offsetX: number,
    offsetY: number,
    beamLength: number,
    spanLength: number,
    maxShear: number
): void {
    if (shearPoints.length < 2) return;

    const scale = beamLength / spanLength;
    const shearScale = maxShear > 0 ? 60 / maxShear : 1;

    // Configuración para diagrama de cortante
    const config = {
        lineColor: '#3498db',
        lineWidth: 3,
        fillColor: 'rgba(52, 152, 219, 0.3)',
        fillOpacity: 0.3,
        pointColor: '#2980b9',
        pointRadius: 3,
    };

    // Dibujar línea base
    drawBaseLine(ctx, offsetX, offsetY, beamLength);

    // Área del diagrama
    ctx.fillStyle = config.fillColor;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);

    shearPoints.forEach((point) => {
        const x = offsetX + (point.x / spanLength) * beamLength;
        const y = offsetY - point.shear * shearScale;
        ctx.lineTo(x, y);
    });

    ctx.lineTo(offsetX + beamLength, offsetY);
    ctx.closePath();
    ctx.fill();

    // Curva del diagrama
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = config.lineWidth;
    ctx.beginPath();

    shearPoints.forEach((point, index) => {
        const x = offsetX + (point.x / spanLength) * beamLength;
        const y = offsetY - point.shear * shearScale;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Título
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px "Segoe UI", Arial';
    ctx.fillText('📊 Diagrama de Cortante V(x)', offsetX, offsetY - 80);
}

/**
 * Dibuja anotaciones en puntos específicos del diagrama
 */
export function drawDiagramAnnotations(
    ctx: CanvasRenderingContext2D,
    annotations: Array<{ x: number; y: number; text: string; color?: string }>,
    offsetX: number,
    offsetY: number
): void {
    annotations.forEach((annotation) => {
        const x = offsetX + annotation.x;
        const y = offsetY + annotation.y;
        const color = annotation.color || '#e74c3c';

        // Círculo de anotación
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Texto de anotación
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px "Segoe UI", Arial';
        ctx.fillText(annotation.text, x + 12, y + 4);

        // Línea conectora
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + 12, y);
        ctx.stroke();
    });
}
