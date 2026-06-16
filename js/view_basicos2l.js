import { CELL, COLS, ROWS, GRID, T_CORRIDOR, T_ROOM, T_STAIRS, T_BLOCKED, cellToPx } from './model_basicos2l.js';

const MAP_W = COLS * CELL;
const MAP_H = ROWS * CELL;


const ViewState = {
  canvas:  null,
  ctx:     null,
  mapImg:  null,
  imgLoaded: false,

  scale:   1.0,
  offsetX: 0,
  offsetY: 0,

  showGrid:   false,
  showOverlay: false,

  originPx:  null,
  destPx:    null,
  pathPx:    null,
};

export function initView(canvasId, imgSrc) {
  ViewState.canvas = document.getElementById(canvasId);
  ViewState.ctx    = ViewState.canvas.getContext('2d');

  ViewState.canvas.width  = MAP_W;
  ViewState.canvas.height = MAP_H;

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

export function renderAll() {
  const { ctx, canvas, mapImg, imgLoaded } = ViewState;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (imgLoaded && mapImg) {
    ctx.drawImage(mapImg, 0, 0, MAP_W, MAP_H);
  } else {
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(0, 0, MAP_W, MAP_H);
  }

  if (ViewState.showOverlay) drawOverlay(ctx);
  if (ViewState.showGrid)    drawGridLines(ctx);

  if (ViewState.pathPx && ViewState.pathPx.length > 1) drawPath(ctx);

  if (ViewState.originPx) drawMarker(ctx, ViewState.originPx.x, ViewState.originPx.y, '#27ae60', 'A');
  if (ViewState.destPx)   drawMarker(ctx, ViewState.destPx.x,   ViewState.destPx.y,   '#c0392b', 'B');
}

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

function drawPath(ctx) {
  const pts = ViewState.pathPx;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur  = 6;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = '#2980b9';
  ctx.lineWidth   = 4;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = 'rgba(93,188,255,0.7)';
  ctx.lineWidth   = 2;
  ctx.stroke();

  ctx.restore();

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

function drawMarker(ctx, x, y, color, label) {
  const R = 10;
  ctx.save();

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur  = 8;

  ctx.beginPath();
  ctx.arc(x, y, R + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.shadowBlur  = 0;
  ctx.fillStyle   = '#fff';
  ctx.font        = `bold ${R + 2}px IBM Plex Mono, monospace`;
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

export function setOriginMarker(col, row) {
  const { x, y } = cellToPx(col, row);
  ViewState.originPx = { x, y };
}

export function setDestMarker(col, row) {
  const { x, y } = cellToPx(col, row);
  ViewState.destPx = { x, y };
}

export function setPath(cells) {
  ViewState.pathPx = cells ? cells.map(c => cellToPx(c.col, c.row)) : null;
}

export function clearMarkers() {
  ViewState.originPx = null;
  ViewState.destPx   = null;
  ViewState.pathPx   = null;
}

export function toggleOverlay(val) {
  ViewState.showOverlay = val !== undefined ? val : !ViewState.showOverlay;
  renderAll();
}

export function toggleGrid(val) {
  ViewState.showGrid = val !== undefined ? val : !ViewState.showGrid;
  renderAll();
}

export function getViewState() { return ViewState; }

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

export function updateCoords(col, row, zoneName) {
  const cx = document.getElementById('cx');
  const cy = document.getElementById('cy');
  const cz = document.getElementById('czone');
  if (cx) cx.textContent = col;
  if (cy) cy.textContent = row;
  if (cz) cz.textContent = zoneName || '-';
}

export function updateRouteInfo(html) {
  const el = document.getElementById('route-info');
  if (el) el.innerHTML = html;
}

export function updateZoomStatus(pct) {
  const el = document.getElementById('sb-zoom');
  if (el) el.textContent = pct + '%';
}

export function updateSelStatus(text) {
  const el = document.getElementById('sb-sel');
  if (el) el.querySelector('span').textContent = text;
}