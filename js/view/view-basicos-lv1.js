import { MAP_CONFIG, COLORS, STROKE_COLORS, UI_COLORS, getCanvasDimensions } from '../config/config-basicos-lv1.js';

export class MapView {
    constructor(canvasElement, mapWrapElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.mapWrap = mapWrapElement;
        this.wrap = document.getElementById('map-canvas-wrap');

        const dimensions = getCanvasDimensions();
        this.canvas.width = dimensions.width;
        this.canvas.height = dimensions.height;

        this.scale = MAP_CONFIG.ZOOM.DEFAULT;
        this.tx = 0;
        this.ty = 0;
    }

    applyTransform() {
        if (this.wrap) {
            this.wrap.style.transform = `translate(${this.tx}px, ${this.ty}px) scale(${this.scale})`;
        }
        this.updateZoomDisplay();
        this.updateScaleBar();
    }

    updateZoomDisplay() {
        const zoomDisplay = document.getElementById('sb-zoom');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(this.scale * 100) + '%';
        }
    }

    updateScaleBar() {
        const pxFor10m = (10 / MAP_CONFIG.METERS_PER_CELL) * MAP_CONFIG.CELL_SIZE * this.scale;
        const width = Math.min(140, Math.max(50, pxFor10m));
        const scaleLine = document.getElementById('scale-line');
        const scaleLabel = document.getElementById('scale-label');

        if (scaleLine) scaleLine.style.width = width + 'px';
        if (scaleLabel) {
            const meters = Math.round(width / this.scale / MAP_CONFIG.CELL_SIZE * MAP_CONFIG.METERS_PER_CELL);
            scaleLabel.textContent = meters + ' m';
        }
    }

    centerMap() {
        const containerWidth = this.mapWrap.clientWidth;
        const containerHeight = this.mapWrap.clientHeight;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        this.tx = (containerWidth - canvasWidth * this.scale) / 2;
        this.ty = (containerHeight - canvasHeight * this.scale) / 2;
        this.applyTransform();
    }

    render(model) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = UI_COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCells(model);
        this.drawCellBorders(model);
        this.drawRoute(model);
        this.drawPins(model);
        this.drawLabels(model);
    }

    drawCells(model) {
        for (let r = 0; r < MAP_CONFIG.ROWS; r++) {
            for (let c = 0; c < MAP_CONFIG.COLS; c++) {
                const type = model.grid[r]?.[c];
                if (type === 0) continue;
                this.ctx.fillStyle = COLORS[type] || UI_COLORS.BACKGROUND;
                this.ctx.fillRect(c * MAP_CONFIG.CELL_SIZE, r * MAP_CONFIG.CELL_SIZE, MAP_CONFIG.CELL_SIZE, MAP_CONFIG.CELL_SIZE);
            }
        }
    }

    drawCellBorders(model) {
        for (let r = 0; r < MAP_CONFIG.ROWS; r++) {
            for (let c = 0; c < MAP_CONFIG.COLS; c++) {
                const type = model.grid[r]?.[c];
                if (type === 0) continue;
                const strokeColor = STROKE_COLORS[type];
                if (!strokeColor) continue;

                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = 0.8;

                // Borde izquierdo
                if (c === 0 || model.grid[r]?.[c - 1] !== type) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(c * MAP_CONFIG.CELL_SIZE, r * MAP_CONFIG.CELL_SIZE);
                    this.ctx.lineTo(c * MAP_CONFIG.CELL_SIZE, (r + 1) * MAP_CONFIG.CELL_SIZE);
                    this.ctx.stroke();
                }

                // Borde derecho
                if (c === MAP_CONFIG.COLS - 1 || model.grid[r]?.[c + 1] !== type) {
                    this.ctx.beginPath();
                    this.ctx.moveTo((c + 1) * MAP_CONFIG.CELL_SIZE, r * MAP_CONFIG.CELL_SIZE);
                    this.ctx.lineTo((c + 1) * MAP_CONFIG.CELL_SIZE, (r + 1) * MAP_CONFIG.CELL_SIZE);
                    this.ctx.stroke();
                }

                // Borde superior
                if (r === 0 || model.grid[r - 1]?.[c] !== type) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(c * MAP_CONFIG.CELL_SIZE, r * MAP_CONFIG.CELL_SIZE);
                    this.ctx.lineTo((c + 1) * MAP_CONFIG.CELL_SIZE, r * MAP_CONFIG.CELL_SIZE);
                    this.ctx.stroke();
                }

                // Borde inferior
                if (r === MAP_CONFIG.ROWS - 1 || model.grid[r + 1]?.[c] !== type) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(c * MAP_CONFIG.CELL_SIZE, (r + 1) * MAP_CONFIG.CELL_SIZE);
                    this.ctx.lineTo((c + 1) * MAP_CONFIG.CELL_SIZE, (r + 1) * MAP_CONFIG.CELL_SIZE);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawRoute(model) {
        if (model.calculatedRoute && model.calculatedRoute.length > 1) {
            this.ctx.strokeStyle = MAP_CONFIG.ROUTE.LINE_COLOR;
            this.ctx.lineWidth = MAP_CONFIG.ROUTE.LINE_WIDTH;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();

            model.calculatedRoute.forEach((node, i) => {
                const x = node.c * MAP_CONFIG.CELL_SIZE + MAP_CONFIG.CELL_SIZE / 2;
                const y = node.r * MAP_CONFIG.CELL_SIZE + MAP_CONFIG.CELL_SIZE / 2;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            });
            this.ctx.stroke();
        }
    }

    drawPins(model) {
        if (model.originNode) {
            this.drawPin(
                model.originNode.c * MAP_CONFIG.CELL_SIZE + MAP_CONFIG.CELL_SIZE / 2,
                model.originNode.r * MAP_CONFIG.CELL_SIZE + MAP_CONFIG.CELL_SIZE / 2,
                UI_COLORS.ORIGIN_PIN
            );
        }
        if (model.destNode) {
            this.drawPin(
                model.destNode.c * MAP_CONFIG.CELL_SIZE + MAP_CONFIG.CELL_SIZE / 2,
                model.destNode.r * MAP_CONFIG.CELL_SIZE + MAP_CONFIG.CELL_SIZE / 2,
                UI_COLORS.DEST_PIN
            );
        }
    }

    drawPin(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, MAP_CONFIG.PIN.RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = MAP_CONFIG.PIN.STROKE_COLOR;
        this.ctx.lineWidth = MAP_CONFIG.PIN.STROKE_WIDTH;
        this.ctx.stroke();
    }

    drawLabels(model) {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = UI_COLORS.LABEL;

        model.labels.forEach(label => {
            this.ctx.font = `${label.bold ? 'bold ' : ''}${label.size}px 'Courier New', monospace`;
            this.ctx.fillText(label.text, label.c * MAP_CONFIG.CELL_SIZE, label.r * MAP_CONFIG.CELL_SIZE);
        });
    }

    updateSidebarUI(model, originElement, destElement, calcButton, routeInfoElement) {
        if (originElement) {
            if (model.originNode) {
                originElement.textContent = `Fila ${model.originNode.r}, Col ${model.originNode.c} (${model.getCellName(model.originNode.r, model.originNode.c)})`;
                originElement.classList.add('set');
            } else {
                originElement.textContent = 'Sin seleccionar';
                originElement.classList.remove('set');
            }
        }

        if (destElement) {
            if (model.destNode) {
                destElement.textContent = `Fila ${model.destNode.r}, Col ${model.destNode.c} (${model.getCellName(model.destNode.r, model.destNode.c)})`;
                destElement.classList.add('set');
            } else {
                destElement.textContent = 'Sin seleccionar';
                destElement.classList.remove('set');
            }
        }

        if (calcButton) {
            calcButton.disabled = !(model.originNode && model.destNode);
        }
    }
}