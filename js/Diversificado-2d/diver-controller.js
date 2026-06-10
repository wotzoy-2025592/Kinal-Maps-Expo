// ============================================================
//  CONTROLLER.JS  —  Interacción del usuario
// ============================================================

import { pxToCell, aStar, CELL, COLS, ROWS, CELL_SIZE } from './diver-model.js';

export class MapController {
  constructor(view, grid) {
    this.view  = view;
    this.grid  = grid;
    this.mode  = 'view';    // 'view' | 'origin' | 'dest'

    this._dragging = false;
    this._lastX    = 0;
    this._lastY    = 0;

    this._bindUI();
    this._bindCanvas();
    this._updateStatusBar();
  }

  // ── Vincular botones del header ──────────────────────────
  _bindUI() {
    const $ = id => document.getElementById(id);

    // Modos
    $('btn-view')?.addEventListener('click',   () => this._setMode('view'));
    $('btn-origin')?.addEventListener('click', () => this._setMode('origin'));
    $('btn-dest')?.addEventListener('click',   () => this._setMode('dest'));

    // Calcular ruta
    $('calc-route-btn')?.addEventListener('click', () => this._calcRoute());

    // Limpiar
    $('clear-btn')?.addEventListener('click', () => this._clearAll());

    // Zoom botones
    $('zoom-in')?.addEventListener('click',  () => {
      const c = this.view.canvas;
      this.view.zoom(1.3, c.width / 2, c.height / 2);
      this._updateStatusBar();
    });
    $('zoom-out')?.addEventListener('click', () => {
      const c = this.view.canvas;
      this.view.zoom(1 / 1.3, c.width / 2, c.height / 2);
      this._updateStatusBar();
    });

    // Buscador
    $('search-btn')?.addEventListener('click', () => this._search());
    $('search-peticion')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._search();
    });

    // Ver entrada
    $('ver-entrada-btn')?.addEventListener('click', () => {
      $('entry-panel')?.classList.add('visible');
    });
    $('entry-close')?.addEventListener('click', () => {
      $('entry-panel')?.classList.remove('visible');
    });
    $('entry-go-btn')?.addEventListener('click', () => {
      $('entry-panel')?.classList.remove('visible');
    });

    // Toggle grilla debug (doble clic en status bar)
    document.getElementById('sb-sel')?.addEventListener('dblclick', () => {
      this.view.toggleGrid();
      this.view.render();
    });
  }

  // ── Vincular eventos del canvas ──────────────────────────
  _bindCanvas() {
    const canvas = this.view.canvas;

    // Rueda → zoom
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect  = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top)  * scaleY;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      this.view.zoom(factor, cx, cy);
      this._updateStatusBar();
    }, { passive: false });

    // Mouse drag (pan)
    canvas.addEventListener('mousedown', e => {
      this._dragging = true;
      this._lastX    = e.clientX;
      this._lastY    = e.clientY;
    });
    window.addEventListener('mousemove', e => {
      if (!this._dragging) return;
      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const dx = (e.clientX - this._lastX) * scaleX;
      const dy = (e.clientY - this._lastY) * scaleY;
      this.view.pan(dx, dy);
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });
    window.addEventListener('mouseup', e => {
      this._dragging = false;
    });

    // Clic → seleccionar punto o ver coords
    canvas.addEventListener('click', e => {
      if (this._didDrag) { this._didDrag = false; return; }
      const { x, y } = this.view.canvasToPx(e.clientX, e.clientY);
      const cell     = pxToCell(x, y);

      // Mostrar coordenadas siempre
      const cx    = document.getElementById('cx');
      const cy    = document.getElementById('cy');
      const czone = document.getElementById('czone');
      if (cx) cx.textContent    = cell.col;
      if (cy) cy.textContent    = cell.row;
      if (czone) czone.textContent = this._getZoneName(cell.col, cell.row);

      // Log de depuración: mostrar color muestreado y estado de la grilla
      try {
        const sample = (this.view && typeof this.view.getImagePixel === 'function')
          ? this.view.getImagePixel(cell.col * CELL_SIZE + CELL_SIZE / 2, cell.row * CELL_SIZE + CELL_SIZE / 2)
          : null;
        console.debug('click -> cell', cell, 'sample', sample, 'gridVal', (this.grid && this.grid[cell.row]) ? this.grid[cell.row][cell.col] : null, 'isValid', this._isCellValid(cell));
      } catch (e) {
        console.warn('Debug sample failed', e);
      }

      // Según modo
      if (this.mode === 'origin') {
        if (!this._isCellValid(cell)) {
          this._toast('Seleccionado dentro de un salón: el punto se ajustará al corredor al calcular la ruta.');
        }
        this.view.setStart(cell);
        const originEl = document.getElementById('origin-name');
        if (originEl) originEl.textContent = `Col ${cell.col}, Fila ${cell.row}`;
        this._setMode('view');
        this._checkEnableCalc();
        this.view.render();
      } else if (this.mode === 'dest') {
        if (!this._isCellValid(cell)) {
          this._toast('Seleccionado dentro de un salón: el punto se ajustará al corredor al calcular la ruta.');
        }
        this.view.setEnd(cell);
        const destEl = document.getElementById('dest-name');
        if (destEl) destEl.textContent = `Col ${cell.col}, Fila ${cell.row}`;
        this._setMode('view');
        this._checkEnableCalc();
        this.view.render();
      }

      // Tooltip
      // this._showTooltip(e.clientX, e.clientY, `(${cell.col}, ${cell.row})`);
    });

    // Touch: un dedo pan, dos dedos zoom
    let lastTouchDist = null;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this._lastX = e.touches[0].clientX;
        this._lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        lastTouchDist = this._touchDist(e.touches);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const dx = (e.touches[0].clientX - this._lastX) * scaleX;
        const dy = (e.touches[0].clientY - this._lastY) * scaleY;
        this.view.pan(dx, dy);
        this._lastX = e.touches[0].clientX;
        this._lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dist   = this._touchDist(e.touches);
        const factor = dist / lastTouchDist;
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        this.view.zoom(factor, (mx - rect.left) * scaleX, (my - rect.top) * scaleY);
        lastTouchDist = dist;
        this._updateStatusBar();
      }
    }, { passive: false });
  }

  _touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Cambiar modo ─────────────────────────────────────────
  _setMode(mode) {
    this.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    const ids = { view: 'btn-view', origin: 'btn-origin', dest: 'btn-dest' };
    document.getElementById(ids[mode])?.classList.add('active');

    const cursor = mode === 'view' ? 'grab' : 'crosshair';
    this.view.canvas.style.cursor = cursor;

    // Indicador visual
    const info = mode === 'origin' ? '📍 Haz clic en el mapa para seleccionar ORIGEN'
               : mode === 'dest'   ? '🏁 Haz clic en el mapa para seleccionar DESTINO'
               : '';
    this._updateSBSel(info || '—');
  }

  // ── Calcular ruta A* ─────────────────────────────────────
  _calcRoute() {
    const s = this.view.start;
    const e = this.view.end;
    if (!s || !e) return;

    // Construir una copia de la grilla que sólo permita celdas de corredor
    const allowedGrid = this.grid.map((row, r) => {
      return row.map((cell, c) => {
        // si la grilla original ya está bloqueada, mantener bloqueada
        if (cell === CELL.BLOCKED) return CELL.BLOCKED;
        // muestrear color en el centro de la celda
        if (this.view && typeof this.view.getImagePixel === 'function') {
          const centerX = c * CELL_SIZE + CELL_SIZE / 2;
          const centerY = r * CELL_SIZE + CELL_SIZE / 2;
          const p = this.view.getImagePixel(centerX, centerY);
          if (p) {
            const [rr, gg, bb] = p;
            const isYellow = (rr > 170 && gg > 140 && bb < 120);
            const isBrown  = (rr > 110 && gg > 70 && bb < 80 && rr > gg);
            const isBlue   = (bb > 140 && gg > 100 && rr < 140);
            const isCorridorColor = isYellow || isBrown || isBlue;
            return isCorridorColor ? CELL.FREE : CELL.BLOCKED;
          }
        }
        // Si no hay muestra, mantener libre
        return CELL.FREE;
      });
    });

    // Si inicio/fin están en celdas no permitidas, buscar la celda de corredor más cercana
    const sAllowed = allowedGrid[s.row][s.col] === CELL.FREE;
    const eAllowed = allowedGrid[e.row][e.col] === CELL.FREE;
    let startCol = s.col, startRow = s.row;
    let endCol = e.col, endRow = e.row;
    if (!sAllowed) {
      const n = this._findNearestAllowed(s.col, s.row, allowedGrid);
      if (n) { startCol = n.col; startRow = n.row; }
    }
    if (!eAllowed) {
      const n = this._findNearestAllowed(e.col, e.row, allowedGrid);
      if (n) { endCol = n.col; endRow = n.row; }
    }

    console.debug('CalcRoute', { s, e, sAllowed, startCol, startRow, eAllowed, endCol, endRow });

    const t0 = performance.now();
    const { path, visited } = aStar(allowedGrid, startCol, startRow, endCol, endRow);
    const ms = (performance.now() - t0).toFixed(1);

    // Preparar y mostrar conectores desde selección real hasta la celda de corredor ajustada
    const connectors = [];
    if (!sAllowed && (startCol !== s.col || startRow !== s.row)) {
      connectors.push({ from: { col: s.col, row: s.row }, to: { col: startCol, row: startRow } });
    }
    if (!eAllowed && (endCol !== e.col || endRow !== e.row)) {
      connectors.push({ from: { col: e.col, row: e.row }, to: { col: endCol, row: endRow } });
    }
    this.view.setConnectors(connectors);

    this.view.setPath(path, visited);
    this.view.showVisited = true;
    this.view.render();

    const info = document.getElementById('route-info');
    if (!path || path.length === 0) {
      if (info) info.innerHTML = '<span style="color:#c0392b">⚠ Sin ruta disponible</span>';
    } else {
      const steps = path.length;
      if (info) info.innerHTML =
        `Ruta encontrada<br>Celdas: <b>${steps}</b><br>` +
        `Dist. aprox.: <b>${Math.round(steps * 0.5)} m</b><br>` +
        `<small>A* — ${ms} ms · ${visited.length} nodos</small>`;
    }
  }

  // Buscar la celda de corredor más cercana (BFS)
  _findNearestAllowed(startCol, startRow, allowedGrid) {
    const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const q = [];
    q.push({ col: startCol, row: startRow });
    seen[startRow][startCol] = true;
    const dirs = [ [1,0],[-1,0],[0,1],[0,-1] ];
    while (q.length) {
      const cur = q.shift();
      const { col, row } = cur;
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        if (allowedGrid[row][col] === CELL.FREE) {
          console.debug('Found nearest allowed at', { col, row });
          return { col, row };
        }
        for (const d of dirs) {
          const nc = col + d[0];
          const nr = row + d[1];
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (seen[nr][nc]) continue;
          seen[nr][nc] = true;
          q.push({ col: nc, row: nr });
        }
      }
    }
    return null;
  }

  // ── Limpiar todo ─────────────────────────────────────────
  _clearAll() {
    this.view.clearAll();
    this.view.showVisited = false;
    this.view.render();
    const originEl = document.getElementById('origin-name');
    if (originEl) originEl.textContent = 'Sin seleccionar';
    const destEl = document.getElementById('dest-name');
    if (destEl) destEl.textContent = 'Sin seleccionar';
    const infoEl = document.getElementById('route-info');
    if (infoEl) infoEl.innerHTML = '';
    const btn = document.getElementById('calc-route-btn');
    if (btn) btn.disabled = true;
    this._setMode('view');
  }

  // ── Habilitar botón calcular ──────────────────────────────
  _checkEnableCalc() {
    const btn = document.getElementById('calc-route-btn');
    if (!btn) return;
    btn.disabled = !(this.view.start && this.view.end);
  }

  // ── Buscador (simple: centrar viewport) ──────────────────
  search() {
    const q = (document.getElementById('search-peticion')?.value || '').toLowerCase().trim();
    if (!q) return;

    // Mapa de zonas conocidas → celda central aproximada
    const zones = {
      'c20': { col: 55, row: 52 },
      'c21': { col: 56, row: 42 },
      'c22': { col: 34, row: 42 },
      'c23': { col: 56, row: 33 },
      'c24': { col: 34, row: 33 },
      'c25': { col: 58, row: 24 },
      'c26': { col: 34, row: 16 },
      'c27': { col: 56, row: 16 },
      'c28': { col: 34, row: 7 },
      'c29': { col: 56, row: 7 },
      'i21': { col: 89, row: 37 },
      'i22': { col: 89, row: 28 },
      'i23': { col: 89, row: 19 },
      'i27': { col: 89, row: 7 },
      'baño': { col: 25, row: 24 },
      'gradas': { col: 36, row: 55 }
    };

    const match = Object.keys(zones).find(k => q.includes(k));
    if (match) {
      const { col, row } = zones[match];
      this._centerOnCell(col, row);
      this._toast(`Centrando en "${match}"`);
    } else {
      this._toast('Zona no encontrada. Prueba: Coordinación, G25, TICS…');
    }
  }

  _centerOnCell(col, row) {
    const canvas = this.view.canvas;
    const { CELL_SIZE } = { CELL_SIZE: 14 };
    const px = col * CELL_SIZE + CELL_SIZE / 2;
    const py = row * CELL_SIZE + CELL_SIZE / 2;
    this.view.offsetX = canvas.width  / 2 - px * this.view.scale;
    this.view.offsetY = canvas.height / 2 - py * this.view.scale;
    this.view.render();
  }

  // ── Helpers ───────────────────────────────────────────────
  _isCellValid(cell) {
    const { col, row } = cell;
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
    // Si la grilla aún no está inicializada, permitir selección (evita errores)
    if (!this.grid) return true;
    // Primero descartar según la grilla
    if (this.grid[row][col] === CELL.BLOCKED) return false;

    // Si la vista tiene la imagen, samplear el color en el centro de la celda
    if (this.view && typeof this.view.getImagePixel === 'function') {
      const centerX = col * CELL_SIZE + CELL_SIZE / 2;
      const centerY = row * CELL_SIZE + CELL_SIZE / 2;
      const p = this.view.getImagePixel(centerX, centerY);
      if (p) {
        const [r, g, b] = p;
        // Permitir colores tipo: amarillo (pasillos), café/marrón, azul claro (zonas), bloquear grises/colores de salones
        const isYellow = (r > 170 && g > 140 && b < 120);
        const isBrown  = (r > 110 && g > 70 && b < 80 && r > g);
        const isBlue   = (b > 140 && g > 100 && r < 140);
        const isCorridorColor = isYellow || isBrown || isBlue;
        if (!isCorridorColor) return false;
      }
    }

    return true;
  }

  _getZoneName(col, row) {

    if (col >= 24 && col <= 44 && row >= 2 && row <= 10)
      return 'C28';
    if (col >= 48 && col <= 67 && row >= 2 && row <= 10)
      return 'C29';
    if (col >= 24 && col <= 44 && row >= 12 && row <= 20) 
      return 'C26';
    if (col >= 48 && col <= 67 && row >= 12 && row <= 20)
      return 'C27';
    if (col >= 56 && col <= 67 && row >= 22 && row <= 29)
      return 'C25';
    if (col >= 24 && col <= 44 && row >= 30 && row <= 39)
      return 'C24';
    if (col >= 48 && col <= 67 && row >= 30 && row <= 39)
      return 'C23';
    if (col >= 24 && col <= 44 && row >= 40 && row <= 49)
      return 'C22';
    if (col >= 48 && col <= 67 && row >= 40 && row <= 49)
      return 'C21';
    if (col >= 49 && col <= 63 && row >= 50 && row <= 61)
      return 'C20';
    if (col >= 79 && col <= 99 && row >= 2 && row <= 10)
      return 'I27';
    if (col >= 84 && col <= 99 && row >= 15 && row <= 23)
      return 'I23';
    if (col >= 84 && col <= 99 && row >= 24 && row <= 32)
      return 'I22';
    if (col >= 84 && col <= 99 && row >= 33 && row <= 41)
      return 'I21';
    if (col >= 22 && col <= 30 && row >= 22 && row <= 29)
      return 'Baño';
    
    return 'Pasillo';
  }

  _showTooltip(clientX, clientY, text) {
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    tip.textContent = text;
    tip.style.display = 'block';
    tip.style.left = (clientX + 12) + 'px';
    tip.style.top  = (clientY - 24) + 'px';
    clearTimeout(this._tipTimer);
    this._tipTimer = setTimeout(() => { tip.style.display = 'none'; }, 1800);
  }

  _toast(msg) {
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    tip.textContent = msg;
    tip.style.display = 'block';
    tip.style.left = '50%';
    tip.style.top  = '70px';
    tip.style.transform = 'translateX(-50%)';
    clearTimeout(this._tipTimer);
    this._tipTimer = setTimeout(() => {
      tip.style.display = 'none';
      tip.style.transform = '';
    }, 2500);
  }

  _updateStatusBar() {
    const el = document.getElementById('sb-zoom');
    if (el) el.textContent = Math.round(this.view.getScale() * 100) + '%';
  }

  _updateSBSel(text) {
    const el = document.getElementById('sb-sel');
    if (el) el.innerHTML = 'SELECCIÓN: <span>' + text + '</span>';
  }
}