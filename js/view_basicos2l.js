/**
 * view_basicos2l.js  —  Kinal Maps View
 * Responsabilidad: renderizado del canvas, imagen del mapa,
 *   visualización de la ruta A*, puntos origen/destino,
 *   zoom/pan, tooltip, coordenadas.
 */

import { CELL, COLS, ROWS, GRID, T_CORRIDOR, T_ROOM, T_STAIRS, T_BLOCKED, cellToPx } from './model_basicos2l.js';

const MAP_W = COLS * CELL;  // 1288 px
const MAP_H = ROWS * CELL;  // 910 px

/* ─────────────────────────────────────────────────────────────
   Estado interno de la vista
   ───────────────────────────────────────────────────────────── */
const ViewState = {
  canvas:  null,
  ctx:     null,
  mapImg:  null,
  imgLoaded: false,

  // Transformación (zoom / pan)
  scale:   1.0,
  offsetX: 0,
  offsetY: 0,

  // Debug overlay (mostrar grilla)
  showGrid:   false,
  showOverlay: false,

  // Datos a dibujar
  originPx:  null,    // { x, y }
  destPx:    null,    // { x, y }
  pathPx:    null,    // [{ x, y }, ...]
};

/* ─────────────────────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────────────────────── */
export function initView(canvasId, imgSrc) {
  ViewState.canvas = document.getElementById(canvasId);
  ViewState.ctx    = ViewState.canvas.getContext('2d');

  // Ajustar tamaño interno del canvas al mapa real
  ViewState.canvas.width  = MAP_W;
  ViewState.canvas.height = MAP_H;

  // Cargar imagen del mapa
  const img = new Image();
  img.onload = () => {
    ViewState.mapImg   = img;
    ViewState.imgLoaded = true;
    renderAll();
  };
  img.onerror = () => console.warn('[View] No se pudo cargar la imagen del mapa.');
  img.src = imgSrc;

  return ViewState;
}

/* ─────────────────────────────────────────────────────────────
   RENDER PRINCIPAL
   ───────────────────────────────────────────────────────────── */
export function renderAll() {
  const { ctx, canvas, mapImg, imgLoaded } = ViewState;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Imagen del mapa
  if (imgLoaded && mapImg) {
    ctx.drawImage(mapImg, 0, 0, MAP_W, MAP_H);
  } else {
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(0, 0, MAP_W, MAP_H);
  }

  // 2. Overlay de grilla (debug opcional)
  if (ViewState.showOverlay) drawOverlay(ctx);
  if (ViewState.showGrid)    drawGridLines(ctx);

  // 3. Ruta calculada (línea azul)
  if (ViewState.pathPx && ViewState.pathPx.length > 1) drawPath(ctx);

  // 4. Puntos origen y destino
  if (ViewState.originPx) drawMarker(ctx, ViewState.originPx.x, ViewState.originPx.y, '#27ae60', 'A');
  if (ViewState.destPx)   drawMarker(ctx, ViewState.destPx.x,   ViewState.destPx.y,   '#c0392b', 'B');
}

/* ─────────────────────────────────────────────────────────────
   OVERLAY DEBUG (colorea celdas por tipo)
   ───────────────────────────────────────────────────────────── */
function drawOverlay(ctx) {
  const colors = {
    [T_BLOCKED]:  null,
    [T_CORRIDOR]: 'rgba(245,197,24,0.35)',
    [T_ROOM]:     'rgba(180,140,90,0.25)',
    [T_STAIRS]:   'rgba(52,152,219,0.40)',
  };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = GRID[r][c];
      const col = colors[t];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }
  }
}

function drawGridLines(ctx) {
  ctx.strokeStyle = 'rgba(100,100,100,0.18)';
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, MAP_H); ctx.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(MAP_W, r * CELL); ctx.stroke();
  }
}

/* ─────────────────────────────────────────────────────────────
   RUTA
   ───────────────────────────────────────────────────────────── */
function drawPath(ctx) {
  const pts = ViewState.pathPx;

  // Sombra
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur  = 6;

  // Línea principal azul
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = '#2980b9';
  ctx.lineWidth   = 4;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.setLineDash([]);
  ctx.stroke();

  // Línea interior clara
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = 'rgba(93,188,255,0.7)';
  ctx.lineWidth   = 2;
  ctx.stroke();

  ctx.restore();

  // Flechas indicadoras cada N pasos
  const step = Math.max(1, Math.floor(pts.length / 8));
  for (let i = step; i < pts.length - 1; i += step) {
    drawArrow(ctx, pts[i - 1], pts[i]);
  }
}

function drawArrow(ctx, from, to) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const size  = 7;
  ctx.save();
  ctx.translate(to.x, to.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2);
  ctx.lineTo(-size,  size / 2);
  ctx.closePath();
  ctx.fillStyle = '#2980b9';
  ctx.fill();
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   MARCADORES  A / B
   ───────────────────────────────────────────────────────────── */
function drawMarker(ctx, x, y, color, label) {
  const R = 10;
  ctx.save();

  // Sombra
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur  = 8;

  // Círculo exterior
  ctx.beginPath();
  ctx.arc(x, y, R + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fill();

  // Círculo de color
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Letra
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = '#fff';
  ctx.font        = `bold ${R + 2}px IBM Plex Mono, monospace`;
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   API PÚBLICA — actualizar datos desde el controlador
   ───────────────────────────────────────────────────────────── */

/** Establece marcador origen en píxeles del canvas */
export function setOriginMarker(col, row) {
  const { x, y } = cellToPx(col, row);
  ViewState.originPx = { x, y };
}

/** Establece marcador destino en píxeles del canvas */
export function setDestMarker(col, row) {
  const { x, y } = cellToPx(col, row);
  ViewState.destPx = { x, y };
}

/** Establece la ruta como array de celdas { col, row } */
export function setPath(cells) {
  ViewState.pathPx = cells ? cells.map(c => cellToPx(c.col, c.row)) : null;
}

/** Limpia marcadores y ruta */
export function clearMarkers() {
  ViewState.originPx = null;
  ViewState.destPx   = null;
  ViewState.pathPx   = null;
}

/** Activa/desactiva overlay de debug */
export function toggleOverlay(val) {
  ViewState.showOverlay = val !== undefined ? val : !ViewState.showOverlay;
  renderAll();
}

export function toggleGrid(val) {
  ViewState.showGrid = val !== undefined ? val : !ViewState.showGrid;
  renderAll();
}

/* ─────────────────────────────────────────────────────────────
   ZOOM / PAN  (se aplica via CSS transform al wrapper)
   ───────────────────────────────────────────────────────────── */
export function getViewState() { return ViewState; }

/* ─────────────────────────────────────────────────────────────
   COORDENADAS de un evento del mouse (relativo al canvas interno)
   ───────────────────────────────────────────────────────────── */
export function eventToCanvas(e, wrapEl) {
  const rect  = wrapEl.getBoundingClientRect();
  const scaleX = MAP_W / rect.width;
  const scaleY = MAP_H / rect.height;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: (clientX - rect.left)  * scaleX,
    y: (clientY - rect.top)   * scaleY,
  };
}

/* ─────────────────────────────────────────────────────────────
   TOAST / TOOLTIP en pantalla
   ───────────────────────────────────────────────────────────── */
let toastTimer = null;
export function showToast(msg, duration = 2800) {
  const el = document.getElementById('tooltip');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.top  = '80px';
  el.style.position = 'fixed';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.display = 'none'; }, duration);
}

/* Actualizar barra de coordenadas */
export function updateCoords(col, row, zoneName) {
  const cx = document.getElementById('cx');
  const cy = document.getElementById('cy');
  const cz = document.getElementById('czone');
  if (cx) cx.textContent = col;
  if (cy) cy.textContent = row;
  if (cz) cz.textContent = zoneName || '-';
}

/* Actualizar info de ruta en sidebar */
export function updateRouteInfo(html) {
  const el = document.getElementById('route-info');
  if (el) el.innerHTML = html;
}

/* Status bar zoom */
export function updateZoomStatus(pct) {
  const el = document.getElementById('sb-zoom');
  if (el) el.textContent = pct + '%';
}

/* Status bar selección */
export function updateSelStatus(text) {
  const el = document.getElementById('sb-sel');
  if (el) el.querySelector('span').textContent = text;
}