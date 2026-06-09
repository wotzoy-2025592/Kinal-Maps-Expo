import { CELL, ROWS, COLS, W, H, COLORS, STROKE } from './config.js';

export class MapView {
  constructor() {
    this.canvas = document.getElementById('map');
    this.ctx = this.canvas.getContext('2d');
    this.wrap = document.getElementById('map-canvas-wrap');
    this.mapWrap = document.getElementById('map-wrap');
    this.entryPanel = document.getElementById('entry-panel');
    
    this.canvas.width = W;
    this.canvas.height = H;

    this.scale = 1.2;
    this.tx = 0;
    this.ty = 0;
  }

  applyTransform() {
    this.wrap.style.transform = `translate(${this.tx}px,${this.ty}px) scale(${this.scale})`;
    document.getElementById('sb-zoom').textContent = Math.round(this.scale * 100) + '%';
    this.updateScaleBar();
  }

  updateScaleBar() {
    const pxFor50m = (50 / 5) * CELL * this.scale;
    document.getElementById('scale-line').style.width = Math.min(120, Math.max(40, pxFor50m)) + 'px';
  }

  centerMap() {
    this.tx = (this.mapWrap.clientWidth - W * this.scale) / 2;
    this.ty = (this.mapWrap.clientHeight - H * this.scale) / 2;
    this.applyTransform();
  }

  render(model) {
    this.ctx.clearRect(0, 0, W, H);
    this.ctx.fillStyle = '#f0ede6';
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.strokeStyle = 'rgba(100,90,70,0.07)';
    this.ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      this.ctx.beginPath(); this.ctx.moveTo(0, r * CELL); this.ctx.lineTo(W, r * CELL); this.ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      this.ctx.beginPath(); this.ctx.moveTo(c * CELL, 0); this.ctx.lineTo(c * CELL, H); this.ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = model.grid[r][c];
        if (t === 0) continue; 
        this.ctx.fillStyle = COLORS[t] || '#f0ede6';
        this.ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }

    // Bordes Estructurales
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = model.grid[r][c];
        if (t === 0) continue;
        const s = STROKE[t];
        if (!s) continue;
        this.ctx.strokeStyle = s;
        this.ctx.lineWidth = 1;

        if (c === 0 || model.grid[r][c - 1] !== t) {
          this.ctx.beginPath(); this.ctx.moveTo(c * CELL, r * CELL); this.ctx.lineTo(c * CELL, (r + 1) * CELL); this.ctx.stroke();
        }
        if (c === COLS - 1 || model.grid[r][c + 1] !== t) {
          this.ctx.beginPath(); this.ctx.moveTo((c + 1) * CELL, r * CELL); this.ctx.lineTo((c + 1) * CELL, (r + 1) * CELL); this.ctx.stroke();
        }
        if (r === 0 || model.grid[r - 1][c] !== t) {
          this.ctx.beginPath(); this.ctx.moveTo(c * CELL, r * CELL); this.ctx.lineTo((c + 1) * CELL, r * CELL); this.ctx.stroke();
        }
        if (r === ROWS - 1 || model.grid[r + 1][c] !== t) {
          this.ctx.beginPath(); this.ctx.moveTo(c * CELL, (r + 1) * CELL); this.ctx.lineTo((c + 1) * CELL, (r + 1) * CELL); this.ctx.stroke();
        }
      }
    }

    if (model.calculatedRoute && model.calculatedRoute.length > 1) {
      this.ctx.strokeStyle = '#c0392b';
      this.ctx.lineWidth = 4;
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

    if (model.originNode) this.drawPin(model.originNode.c * CELL + CELL / 2, model.originNode.r * CELL + CELL / 2, '#27ae60');
    if (model.destNode) this.drawPin(model.destNode.c * CELL + CELL / 2, model.destNode.r * CELL + CELL / 2, '#c0392b');

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    model.labels.forEach(l => {
      this.ctx.font = `${l.bold ? '600' : '400'} ${l.size}px 'IBM Plex Mono', monospace`;
      this.ctx.fillStyle = '#1a1612';
      this.ctx.fillText(l.text, l.c * CELL, l.r * CELL);
    });
  }

  drawPin(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath(); this.ctx.arc(x, y, 6, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }

  toggleEntryPanel() {
    this.entryPanel.classList.toggle('visible');
  }

  closeEntryPanel() {
    this.entryPanel.classList.remove('visible');
  }

  updateSidebarUI(model) {
    const origEl = document.getElementById('origin-name');
    const destEl = document.getElementById('dest-name');
    const btnCalc = document.getElementById('calc-route-btn');

    if (model.originNode) {
      origEl.textContent = `Fila ${model.originNode.r}, Col ${model.originNode.c}`;
      origEl.classList.add('set');
    } else {
      origEl.textContent = 'Sin seleccionar';
      origEl.classList.remove('set');
    }

    if (model.destNode) {
      destEl.textContent = `Fila ${model.destNode.r}, Col ${model.destNode.c}`;
      destEl.classList.add('set');
    } else {
      destEl.textContent = 'Sin seleccionar';
      destEl.classList.remove('set');
    }
    btnCalc.disabled = !(model.originNode && model.destNode);
  }
}