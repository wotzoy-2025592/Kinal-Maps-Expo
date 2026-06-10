// ============================================================
//  VIEW.JS  —  Todo lo visual: canvas, mapa, ruta, puntos
// ============================================================

import { CELL_SIZE, COLS, ROWS, CELL, cellCenter } from './diver-model.js';

const IMG_W = 1492;
const IMG_H = 1054;

export class MapView {
  constructor(canvasId, imageSrc) {
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');

    // El canvas interno siempre es el tamaño real de la imagen
    this.canvas.width  = IMG_W;
    this.canvas.height = IMG_H;

    // Transformación (pan + zoom)
    this.scale  = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Estado
    this.grid    = null;
    this.path    = [];
    this.visited = [];
    this.start   = null;   // { col, row }
    this.end     = null;
    this.connectors = []; // [{ from: {col,row}, to: {col,row} }, ...]
    this.showGrid   = false;
    this.showVisited = false;

    this.mapImage = new Image();
    this.mapImage.src = imageSrc;
    this.ready = false;

    // Offscreen buffer to sample pixels from the original image
    this._imgCanvas = document.createElement('canvas');
    this._imgCanvas.width = IMG_W;
    this._imgCanvas.height = IMG_H;
    // Use willReadFrequently for faster repeated getImageData reads
    this._imgCtx = this._imgCanvas.getContext('2d', { willReadFrequently: true });

    this.mapImage.onload  = () => {
      // Draw into offscreen buffer for fast pixel sampling
      try {
        this._imgCtx.clearRect(0, 0, IMG_W, IMG_H);
        this._imgCtx.drawImage(this.mapImage, 0, 0, IMG_W, IMG_H);
      } catch (e) {
        console.warn('No se pudo dibujar imagen en buffer:', e);
      }
      this.ready = true;
      this.render();
    };
    this.mapImage.onerror = () => { console.error('No se pudo cargar', imageSrc); };
  }

  // Devuelve [r,g,b,a] en coordenadas de imagen (px,px)
  getImagePixel(x, y) {
    if (!this._imgCtx) return null;
    const ix = Math.floor(x), iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= IMG_W || iy >= IMG_H) return null;
    try {
      const d = this._imgCtx.getImageData(ix, iy, 1, 1).data;
      return [d[0], d[1], d[2], d[3]];
    } catch (e) {
      return null;
    }
  }

  // ── Render principal ─────────────────────────────────────
  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // 1. Imagen del mapa
    if (this.ready) {
      ctx.drawImage(this.mapImage, 0, 0, IMG_W, IMG_H);
    }

    // 2. Grilla de debug (opcional)
    if (this.showGrid && this.grid) this._drawGrid();

    // 3. Celdas visitadas por A* (animación)
    if (this.showVisited) this._drawVisited();

    // 4. Ruta A*
    if (this.path.length > 0) this._drawPath();

    // 4.5 Conectores desde selección real hasta corredor ajustado
    if (this.connectors && this.connectors.length > 0) this._drawConnectors();

    // 5. Puntos inicio / fin
    if (this.start) this._drawMarker(this.start.col, this.start.row, '#27ae60', 'A');
    if (this.end)   this._drawMarker(this.end.col,   this.end.row,   '#c0392b', 'B');

    ctx.restore();
  }

  // ── Grilla de debug ──────────────────────────────────────
  _drawGrid() {
    const { ctx } = this;
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] === CELL.BLOCKED) {
          ctx.fillStyle = 'rgba(200,50,50,0.25)';
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // ── Celdas visitadas ─────────────────────────────────────
  _drawVisited() {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(52,152,219,0.18)';
    for (const n of this.visited) {
      ctx.fillRect(n.col * CELL_SIZE, n.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  // ── Ruta como línea suave ────────────────────────────────
  _drawPath() {
    if (this.path.length < 2) return;
    const { ctx } = this;

    ctx.beginPath();
    const first = cellCenter(this.path[0].col, this.path[0].row);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < this.path.length; i++) {
      const p = cellCenter(this.path[i].col, this.path[i].row);
      ctx.lineTo(p.x, p.y);
    }

    // Sombra para visibilidad
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur  = 6;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth   = CELL_SIZE * 0.55;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Borde blanco interior
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth   = CELL_SIZE * 0.18;
    ctx.stroke();
  }

  // ── Marcador circular (inicio / fin) ────────────────────
  _drawMarker(col, row, color, label) {
    const { ctx } = this;
    const { x, y } = cellCenter(col, row);
    const r = CELL_SIZE * 1.1;

    // Círculo exterior blanco
    ctx.beginPath();
    ctx.arc(x, y, r + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Círculo coloreado
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Letra
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(r * 1.1)}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }

  // ── Actualizar datos desde el controller ────────────────
  setGrid(grid)    { this.grid    = grid;    }
  setPath(path, visited) { this.path = path; this.visited = visited; }
  setStart(cell)   { this.start   = cell;   }
  setEnd(cell)     { this.end     = cell;   }
  clearRoute()     { this.path = []; this.visited = []; }
  clearAll()       { this.path = []; this.visited = []; this.start = null; this.end = null; this.connectors = []; }
  toggleGrid()     { this.showGrid = !this.showGrid; }
  toggleVisited()  { this.showVisited = !this.showVisited; }

  // Establecer conectores (segmentos desde selección real → celda de corredor)
  setConnectors(segments) {
    this.connectors = Array.isArray(segments) ? segments : [];
  }

  _drawConnectors() {
    const { ctx } = this;
    ctx.save();
    ctx.lineWidth = Math.max(2, CELL_SIZE * 0.22);
    ctx.strokeStyle = 'rgba(52,73,94,0.95)';
    ctx.setLineDash([6,4]);
    for (const seg of this.connectors) {
      const a = cellCenter(seg.from.col, seg.from.row);
      const b = cellCenter(seg.to.col, seg.to.row);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── Pan & Zoom ────────────────────────────────────────────
  zoom(factor, cx, cy) {
    const newScale = Math.min(4, Math.max(0.25, this.scale * factor));
    const ratio    = newScale / this.scale;
    this.offsetX   = cx - ratio * (cx - this.offsetX);
    this.offsetY   = cy - ratio * (cy - this.offsetY);
    this.scale     = newScale;
    this.render();
  }

  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
    this.render();
  }

  resetView() {
    this.scale   = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.render();
  }

  // ── Convierte coordenadas del canvas HTML → px del mapa ──
  canvasToPx(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    // El canvas HTML puede estar escalado por CSS
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const cx = (clientX - rect.left)  * scaleX;
    const cy = (clientY - rect.top)   * scaleY;
    // Deshacer transformación interna
    const mx = (cx - this.offsetX) / this.scale;
    const my = (cy - this.offsetY) / this.scale;
    return { x: mx, y: my };
  }

  getScale()   { return this.scale; }
  getOffset()  { return { x: this.offsetX, y: this.offsetY }; }
}