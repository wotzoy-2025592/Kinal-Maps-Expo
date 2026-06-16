import { CELL, ROWS, COLS, W, H, COLORS, STROKE, UI_COLORS, ROUTE_CONFIG, PIN_CONFIG, ZOOM_CONFIG, METERS_PER_CELL } from '../config/config.js';

export class MapView {
  constructor() {
    this.canvas = document.getElementById('map');
    this.ctx = this.canvas.getContext('2d');
    this.wrap = document.getElementById('map-canvas-wrap');
    this.mapWrap = document.getElementById('map-wrap');
    this.entryPanel = document.getElementById('entry-panel');

    this.canvas.width = W;
    this.canvas.height = H;

    this.scale = ZOOM_CONFIG.DEFAULT;
    this.tx = 0;
    this.ty = 0;
  }

  applyTransform() {
    this.wrap.style.transform = `translate(${this.tx}px, ${this.ty}px) scale(${this.scale})`;
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
    const pxFor50m = (50 / METERS_PER_CELL) * CELL * this.scale;
    const scaleLine = document.getElementById('scale-line');
    if (scaleLine) {
      scaleLine.style.width = Math.min(120, Math.max(40, pxFor50m)) + 'px';
    }
  }

  centerMap() {
    this.tx = (this.mapWrap.clientWidth - W * this.scale) / 2;
    this.ty = (this.mapWrap.clientHeight - H * this.scale) / 2;
    this.applyTransform();
  }

  render(model) {
    this.ctx.clearRect(0, 0, W, H);
    this.ctx.fillStyle = UI_COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, W, H);

    this.drawGrid();
    this.drawCells(model);
    this.drawCellBorders(model);
    this.drawRoute(model);
    this.drawPins(model);
    this.drawLabels(model);
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(100,90,70,0.07)';
    this.ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * CELL);
      this.ctx.lineTo(W, r * CELL);
      this.ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * CELL, 0);
      this.ctx.lineTo(c * CELL, H);
      this.ctx.stroke();
    }
  }

  drawCells(model) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const type = model.grid[r][c];
        if (type === 0) continue;
        this.ctx.fillStyle = COLORS[type] || UI_COLORS.BACKGROUND;
        this.ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }
  }

  drawCellBorders(model) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const type = model.grid[r][c];
        if (type === 0) continue;
        const strokeColor = STROKE[type];
        if (!strokeColor) continue;

        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 1;

        if (c === 0 || model.grid[r][c - 1] !== type) {
          this.ctx.beginPath();
          this.ctx.moveTo(c * CELL, r * CELL);
          this.ctx.lineTo(c * CELL, (r + 1) * CELL);
          this.ctx.stroke();
        }
        if (c === COLS - 1 || model.grid[r][c + 1] !== type) {
          this.ctx.beginPath();
          this.ctx.moveTo((c + 1) * CELL, r * CELL);
          this.ctx.lineTo((c + 1) * CELL, (r + 1) * CELL);
          this.ctx.stroke();
        }
        if (r === 0 || model.grid[r - 1][c] !== type) {
          this.ctx.beginPath();
          this.ctx.moveTo(c * CELL, r * CELL);
          this.ctx.lineTo((c + 1) * CELL, r * CELL);
          this.ctx.stroke();
        }
        if (r === ROWS - 1 || model.grid[r + 1][c] !== type) {
          this.ctx.beginPath();
          this.ctx.moveTo(c * CELL, (r + 1) * CELL);
          this.ctx.lineTo((c + 1) * CELL, (r + 1) * CELL);
          this.ctx.stroke();
        }
      }
    }
  }

  drawRoute(model) {
    if (model.calculatedRoute && model.calculatedRoute.length > 1) {
      this.ctx.strokeStyle = ROUTE_CONFIG.LINE_COLOR;
      this.ctx.lineWidth = ROUTE_CONFIG.LINE_WIDTH;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();

      model.calculatedRoute.forEach((node, i) => {
        const x = node.c * CELL + CELL / 2;
        const y = node.r * CELL + CELL / 2;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    }
  }

  drawPins(model) {
    if (model.originNode) {
      this.drawPin(
        model.originNode.c * CELL + CELL / 2,
        model.originNode.r * CELL + CELL / 2,
        UI_COLORS.ORIGIN_PIN
      );
    }
    if (model.destNode) {
      this.drawPin(
        model.destNode.c * CELL + CELL / 2,
        model.destNode.r * CELL + CELL / 2,
        UI_COLORS.DEST_PIN
      );
    }
  }

  drawPin(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, PIN_CONFIG.RADIUS, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = PIN_CONFIG.STROKE_COLOR;
    this.ctx.lineWidth = PIN_CONFIG.STROKE_WIDTH;
    this.ctx.stroke();
  }

  drawLabels(model) {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = UI_COLORS.LABEL;

    model.labels.forEach(label => {
      this.ctx.font = `${label.bold ? '600' : '400'} ${label.size}px 'IBM Plex Mono', monospace`;
      this.ctx.fillText(label.text, label.c * CELL, label.r * CELL);
    });
  }

  toggleEntryPanel() {
    this.entryPanel.classList.toggle('visible');
  }

  closeEntryPanel() {
    this.entryPanel.classList.remove('visible');
  }

  updateSidebarUI(model, originElement, destElement, calcButton, routeInfoElement) {
    if (originElement) {
      if (model.originNode) {
        originElement.textContent = `Fila ${model.originNode.r}, Col ${model.originNode.c}`;
        originElement.classList.add('set');
      } else {
        originElement.textContent = 'Sin seleccionar';
        originElement.classList.remove('set');
      }
    }

    if (destElement) {
      if (model.destNode) {
        destElement.textContent = `Fila ${model.destNode.r}, Col ${model.destNode.c}`;
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