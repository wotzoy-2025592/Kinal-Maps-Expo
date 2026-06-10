/**
 * controller_basicos2l.js  —  Kinal Maps Controller
 * Responsabilidad: manejo de eventos UI, modos de interacción,
 *   zoom/pan, búsqueda, clic en mapa, disparo de cálculo A*.
 */

import {
  CELL, COLS, ROWS,
  cellType, isRestricted, isRoom, isWalkable,
  pxToCell, cellToPx,
  ZONES, NavState,
  T_BLOCKED,
} from './model_basicos2l.js';

import {
  renderAll, setOriginMarker, setDestMarker, setPath,
  clearMarkers, showToast, updateCoords, updateRouteInfo,
  updateZoomStatus, updateSelStatus, eventToCanvas, toggleOverlay,
} from './view_basicos2l.js';

/* ─────────────────────────────────────────────────────────────
   MODOS
   ───────────────────────────────────────────────────────────── */
const MODE_VIEW   = 'view';
const MODE_ORIGIN = 'origin';
const MODE_DEST   = 'dest';

let currentMode = MODE_VIEW;

function setMode(mode) {
  currentMode = mode;
  ['btn-view', 'btn-origin', 'btn-dest'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
  const map = { [MODE_VIEW]: 'btn-view', [MODE_ORIGIN]: 'btn-origin', [MODE_DEST]: 'btn-dest' };
  document.getElementById(map[mode])?.classList.add('active');

  const cursor = mode === MODE_VIEW ? 'grab' : 'crosshair';
  document.getElementById('mapCanvas').style.cursor = cursor;

  const hints = {
    [MODE_VIEW]:   'Haz clic en el mapa para ver coordenadas.',
    [MODE_ORIGIN]: 'Haz clic en un salón o corredor para establecer el ORIGEN.',
    [MODE_DEST]:   'Haz clic en un salón o corredor para establecer el DESTINO.',
  };
  showToast(hints[mode], 2000);
}

/* ─────────────────────────────────────────────────────────────
   ZOOM / PAN
   ───────────────────────────────────────────────────────────── */
const PAN = { active: false, startX: 0, startY: 0, ox: 0, oy: 0 };
let   zoomLevel = 1.0;
const ZOOM_MIN  = 0.4;
const ZOOM_MAX  = 4.0;
const ZOOM_STEP = 0.15;

function applyTransform() {
  const wrap = document.getElementById('map-canvas-wrap');
  const canvas = document.getElementById('mapCanvas');
  if (!wrap || !canvas) return;

  canvas.style.transformOrigin = '0 0';
  canvas.style.transform = `scale(${zoomLevel}) translate(${PAN.ox}px, ${PAN.oy}px)`;
  updateZoomStatus(Math.round(zoomLevel * 100));
}

function zoom(delta, cx, cy) {
  const prev = zoomLevel;
  zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomLevel + delta));
  // Ajustar pan para mantener punto focal
  if (cx !== undefined) {
    PAN.ox -= cx * (1 / prev - 1 / zoomLevel);
    PAN.oy -= cy * (1 / prev - 1 / zoomLevel);
  }
  applyTransform();
}

/* ─────────────────────────────────────────────────────────────
   RESOLUCIÓN DE ZONA en un clic
   ───────────────────────────────────────────────────────────── */
function resolveZoneName(col, row) {
  for (const z of ZONES) {
    const dc = Math.abs(z.col - col), dr = Math.abs(z.row - row);
    if (dc <= 5 && dr <= 5) return z.name;
  }
  const t = cellType(col, row);
  if (t === 1) return 'Corredor';
  if (t === 3) return 'Gradas';
  return 'Área';
}

/* ─────────────────────────────────────────────────────────────
   CLIC EN EL CANVAS
   ───────────────────────────────────────────────────────────── */
function handleCanvasClick(e) {
  if (currentMode === MODE_VIEW) return;

  const canvas = document.getElementById('mapCanvas');
  const rect = canvas.getBoundingClientRect();
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // Posición relativa al canvas visual (ya incluye las transformaciones CSS)
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;

  // Mapear a coordenadas internas del canvas (1288×910 píxeles)
  // rect.width/height ya incluye el zoom CSS
  const canvasX = screenX * ((COLS * CELL) / rect.width);
  const canvasY = screenY * ((ROWS * CELL) / rect.height);

  // Convertir píxeles a coordenadas de celda
  const { col, row } = pxToCell(canvasX, canvasY);

  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
    showToast('⚠ Fuera de los límites del mapa.');
    return;
  }

  if (isRestricted(col, row)) {
    showToast('🚫 Área restringida — no se puede colocar punto aquí.');
    return;
  }

  const zoneName = resolveZoneName(col, row);

  if (currentMode === MODE_ORIGIN) {
    NavState.setOrigin(col, row, zoneName);
    setOriginMarker(col, row);
    updateSelStatus(`Origen: ${zoneName} (${col},${row})`);
    showToast(`✅ Origen establecido: ${zoneName}`);
    updateRoutePanel();
    setMode(MODE_VIEW);
  } else if (currentMode === MODE_DEST) {
    NavState.setDestination(col, row, zoneName);
    setDestMarker(col, row);
    updateSelStatus(`Destino: ${zoneName} (${col},${row})`);
    showToast(`✅ Destino establecido: ${zoneName}`);
    updateRoutePanel();
    setMode(MODE_VIEW);
  }

  renderAll();
  checkCalcButton();
}

/* ─────────────────────────────────────────────────────────────
   PANEL DE RUTA (sidebar)
   ───────────────────────────────────────────────────────────── */
function updateRoutePanel() {
  const o = NavState.origin;
  const d = NavState.destination;

  // Actualizar dots en el sidebar si existen
  const oName = document.querySelector('.route-dot.origin + .route-name');
  const dName = document.querySelector('.route-dot.dest  + .route-name');
  if (oName) oName.textContent = o ? o.label : '—';
  if (dName) dName.textContent = d ? d.label : '—';
}

function checkCalcButton() {
  const btn = document.getElementById('calc-route-btn');
  if (btn) btn.disabled = !(NavState.origin && NavState.destination);
}

/* ─────────────────────────────────────────────────────────────
   CALCULAR RUTA
   ───────────────────────────────────────────────────────────── */
function handleCalcRoute() {
  const result = NavState.computeRoute();
  if (result.ok) {
    setPath(NavState.path);
    const steps = NavState.path.length;
    const dist  = (steps * CELL * 0.05).toFixed(1); // aprox metros
    updateRouteInfo(
      `<b>Origen:</b> ${NavState.origin.label}<br>` +
      `<b>Destino:</b> ${NavState.destination.label}<br>` +
      `<b>Pasos:</b> ${steps}<br>` +
      `<b>Distancia:</b> ~${dist} m`
    );
    showToast(`🗺 Ruta calculada — ${steps} pasos`, 3000);
  } else {
    setPath(null);
    updateRouteInfo(`<span style="color:#e74c3c">${result.message}</span>`);
    showToast(`❌ ${result.message}`, 3500);
  }
  renderAll();
}

/* ─────────────────────────────────────────────────────────────
   BÚSQUEDA POR NOMBRE
   ───────────────────────────────────────────────────────────── */
function handleSearch() {
  const input = document.getElementById('search-peticion');
  if (!input) return;
  const query = input.value.trim().toLowerCase();
  if (!query) return;

  const zone = ZONES.find(z =>
    z.name.toLowerCase().includes(query) || z.id.toLowerCase().includes(query)
  );

  if (!zone) {
    showToast(`🔍 No se encontró: "${input.value}"`);
    return;
  }

  // Navegar (zoom) a la zona
  const { x, y } = cellToPx(zone.col, zone.row);
  // Centrar pan
  const canvasEl = document.getElementById('mapCanvas');
  const wrap     = document.getElementById('map-canvas-wrap');
  if (!wrap || !canvasEl) return;

  const wrapW = wrap.clientWidth;
  const wrapH = wrap.clientHeight;
  const mapW  = COLS * CELL;
  const mapH  = ROWS * CELL;

  // Escala para centrar visualmente
  const targetZoom = 1.8;
  zoomLevel = targetZoom;
  PAN.ox = -(x / mapW * wrapW - wrapW / 2) / targetZoom;
  PAN.oy = -(y / mapH * wrapH - wrapH / 2) / targetZoom;

  applyTransform();
  showToast(`📍 Zona: ${zone.name}`, 2500);
}

/* ─────────────────────────────────────────────────────────────
   VER ENTRADA PRINCIPAL
   ───────────────────────────────────────────────────────────── */
function handleVerEntrada() {
  const panel = document.getElementById('entry-panel');
  if (panel) panel.classList.add('visible');
}

/* ─────────────────────────────────────────────────────────────
   HOVER — coordenadas
   ───────────────────────────────────────────────────────────── */
function handleMouseMove(e) {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  
  // Posición relativa al canvas visual
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  // Mapear a coordenadas internas del canvas
  const canvasX = screenX * ((COLS * CELL) / rect.width);
  const canvasY = screenY * ((ROWS * CELL) / rect.height);

  // Convertir a coordenadas de celda
  const col = Math.floor(canvasX / CELL);
  const row = Math.floor(canvasY / CELL);

  if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
    updateCoords(col, row, resolveZoneName(col, row));
  }
}

/* ─────────────────────────────────────────────────────────────
   PAN con arrastre
   ───────────────────────────────────────────────────────────── */
function startPan(e) {
  if (currentMode !== MODE_VIEW) return;
  PAN.active = true;
  PAN.startX = e.clientX;
  PAN.startY = e.clientY;
  document.getElementById('mapCanvas').style.cursor = 'grabbing';
}
function doPan(e) {
  if (!PAN.active) return;
  const dx = (e.clientX - PAN.startX) / zoomLevel;
  const dy = (e.clientY - PAN.startY) / zoomLevel;
  PAN.startX = e.clientX;
  PAN.startY = e.clientY;
  PAN.ox += dx;
  PAN.oy += dy;
  applyTransform();
}
function endPan() {
  PAN.active = false;
  document.getElementById('mapCanvas').style.cursor =
    currentMode === MODE_VIEW ? 'grab' : 'crosshair';
}

/* ─────────────────────────────────────────────────────────────
   PINCH ZOOM (touch)
   ───────────────────────────────────────────────────────────── */
let lastPinchDist = null;
function pinchStart(e) {
  if (e.touches.length === 2) lastPinchDist = Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );
}
function pinchMove(e) {
  if (e.touches.length !== 2 || !lastPinchDist) return;
  const d = Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );
  const delta = (d - lastPinchDist) * 0.005;
  zoom(delta);
  lastPinchDist = d;
}

/* ─────────────────────────────────────────────────────────────
   INICIALIZACIÓN
   ───────────────────────────────────────────────────────────── */
export function initController() {
  const canvas   = document.getElementById('mapCanvas');
  const wrap     = document.getElementById('map-canvas-wrap');
  const btnView  = document.getElementById('btn-view');
  const btnOrig  = document.getElementById('btn-origin');
  const btnDest  = document.getElementById('btn-dest');
  const btnClear = document.getElementById('clear-btn');
  const btnCalc  = document.getElementById('calc-route-btn');
  const btnSearch= document.getElementById('search-btn');
  const btnEntry = document.getElementById('ver-entrada-btn');
  const btnEntryClose = document.getElementById('entry-close');
  const btnEntryGo    = document.getElementById('entry-go-btn');
  const searchIn = document.getElementById('search-peticion');
  const zoomIn   = document.getElementById('zoom-in');
  const zoomOut  = document.getElementById('zoom-out');

  /* Modos */
  btnView?.addEventListener('click', () => setMode(MODE_VIEW));
  btnOrig?.addEventListener('click', () => setMode(MODE_ORIGIN));
  btnDest?.addEventListener('click', () => setMode(MODE_DEST));

  /* Canvas — clic para colocar puntos */
  canvas?.addEventListener('click', handleCanvasClick);
  canvas?.addEventListener('touchend', e => {
    if (e.touches.length === 0) handleCanvasClick(e.changedTouches[0]);
  });

  /* Canvas — hover coords */
  canvas?.addEventListener('mousemove', handleMouseMove);

  /* Canvas — pan */
  canvas?.addEventListener('mousedown', startPan);
  window.addEventListener('mousemove', e => { doPan(e); });
  window.addEventListener('mouseup',   endPan);

  /* Touch pan */
  canvas?.addEventListener('touchstart',  e => { if (e.touches.length===1) startPan(e.touches[0]); pinchStart(e); }, { passive: true });
  canvas?.addEventListener('touchmove',   e => { if (e.touches.length===1) doPan(e.touches[0]); pinchMove(e); }, { passive: true });
  canvas?.addEventListener('touchend',    endPan);

  /* Rueda del mouse — zoom */
  wrap?.addEventListener('wheel', e => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP, e.clientX, e.clientY);
  }, { passive: false });

  /* Botones zoom */
  zoomIn?.addEventListener('click',  () => zoom( ZOOM_STEP));
  zoomOut?.addEventListener('click', () => zoom(-ZOOM_STEP));

  /* Limpiar */
  btnClear?.addEventListener('click', () => {
    NavState.clear();
    clearMarkers();
    renderAll();
    updateRouteInfo('');
    updateSelStatus('—');
    checkCalcButton();
    showToast('🗑 Ruta limpiada.');
  });

  /* Calcular ruta */
  btnCalc?.addEventListener('click', handleCalcRoute);

  /* Búsqueda */
  btnSearch?.addEventListener('click', handleSearch);
  searchIn?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

  /* Panel entrada */
  btnEntry?.addEventListener('click', handleVerEntrada);
  btnEntryClose?.addEventListener('click', () => {
    document.getElementById('entry-panel')?.classList.remove('visible');
  });
  btnEntryGo?.addEventListener('click', () => {
    document.getElementById('entry-panel')?.classList.remove('visible');
    // Establecer entrada principal como destino (celda aprox)
    NavState.setDestination(13, 30, 'Entrada Principal');
    setDestMarker(13, 30);
    updateSelStatus('Destino: Entrada Principal');
    checkCalcButton();
    renderAll();
    showToast('📍 Entrada Principal establecida como destino.');
  });

  /* Tecla ESC — cancelar modo */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMode(MODE_VIEW);
  });

  /* Inicializar transform */
  applyTransform();
  checkCalcButton();
}