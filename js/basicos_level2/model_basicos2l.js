/**
 * model_basicos2l.js  —  Kinal Maps A* Model
 * Responsabilidad: datos del mapa, grilla de navegación, algoritmo A*
 *
 * Mapa real: 1292 × 914 px (imagen mapa.jpg)
 * Celda: 14 px  →  grilla 92 × 65
 *
 * Leyenda de celdas:
 *   0 = restringida / exterior (gris)
 *   1 = corredor / pasillo (amarillo) — transitable
 *   2 = salón / oficina / sala (marrón) — seleccionable, NO atravesable
 *   3 = gradas (azul) — transitable como corredor
 */

export const CELL = 14;           // px por celda
export const COLS = 92;
export const ROWS = 65;

/* ── Tipos de celda ── */
export const T_BLOCKED   = 0;
export const T_CORRIDOR  = 1;
export const T_ROOM      = 2;
export const T_STAIRS    = 3;

/* ─────────────────────────────────────────────────────────────
   GRILLA  (ROWS × COLS)
   Se construye manualmente a partir del análisis visual del mapa.
   Coordenadas en celdas (col, row) donde col=0 es izquierda, row=0 es arriba.
   ───────────────────────────────────────────────────────────── */

function makeGrid() {
  // Inicializar todo como bloqueado
  const g = Array.from({ length: ROWS }, () => new Uint8Array(COLS).fill(T_BLOCKED));

  function fill(c0, r0, c1, r1, type) {
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++)
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
          g[r][c] = type;
  }

  /* ══════════════════════════════════════════════════════════
     BLOQUE IZQUIERDO  — edificio H (Clase h24, h23, h22)
     ══════════════════════════════════════════════════════════ */
  // Clase h24 (arriba-izq)
  fill(2, 4, 12, 17, T_ROOM);
  // Clase h23 (medio-izq)
  fill(2, 20, 12, 33, T_ROOM);
  // Clase h22 (abajo-izq)
  fill(2, 36, 12, 50, T_ROOM);
  // Corredor vertical izquierdo (amarillo, col 13–20, row 3–54)
  fill(13, 3, 20, 54, T_CORRIDOR);
  // Gradas (azul arriba-izq, col 14–17, row 3–9)
  fill(14, 3, 17, 9, T_STAIRS);
  // Baño Mujeres (col 14–17, row 10–14)
  fill(14, 10, 17, 14, T_ROOM);
  // Baño Hombres (col 14–17, row 16–20)
  fill(14, 16, 17, 20, T_ROOM);

  /* ══════════════════════════════════════════════════════════
     CORREDOR HORIZONTAL CENTRAL — conecta bloque izq con centro
     col 17–42, row 29–35
     ══════════════════════════════════════════════════════════ */
  fill(17, 29, 48, 35, T_CORRIDOR);

  /* ══════════════════════════════════════════════════════════
     BLOQUE CENTRAL — edificio G
     ══════════════════════════════════════════════════════════ */
  // Coordinación (arriba)
  fill(30, 2, 42, 10, T_ROOM);
  // Clase G25
  fill(30, 12, 42, 20, T_ROOM);
  // Clase G24
  fill(30, 22, 42, 30, T_ROOM);
  // Corredor vertical central (col 43–50, row 2–62)
  fill(43, 2, 50, 62, T_CORRIDOR);
  // Gradas centro (azul, col 51–57, row 12–20)
  fill(51, 12, 57, 20, T_STAIRS);
  // SS (pequeño, col 30–36, row 32–36)
  fill(30, 32, 36, 36, T_ROOM);
  // Clase G21
  fill(30, 38, 42, 48, T_ROOM);

  /* ══════════════════════════════════════════════════════════
     CORREDOR CURVO CENTRAL-SUR
     ══════════════════════════════════════════════════════════ */
  // Corredor vertical central-sur (col 43–50, row 36–62)
  fill(43, 36, 50, 62, T_CORRIDOR);
  // Gradas sur-centro (azul, col 51–57, row 37–44)
  fill(51, 37, 57, 44, T_STAIRS);
  // Corredor curvo horizontal (col 43–75, row 36–44)
  fill(43, 36, 75, 44, T_CORRIDOR);

  /* ══════════════════════════════════════════════════════════
     BLOQUE DERECHO — Sala de reuniones, Clase h24 der.
     ══════════════════════════════════════════════════════════ */
  // Sala de reuniones (grande, col 68–84, row 22–36)
  fill(68, 22, 84, 36, T_ROOM);
  // Corredor derecho horizontal (col 68–90, row 36–46) — CONECTADO
  fill(68, 36, 90, 46, T_CORRIDOR);
  // Gradas derecha (azul, col 80–84, row 36–44)
  fill(80, 36, 84, 44, T_STAIRS);
  // Clase h24 derecha arriba (col 85–91, row 36–44)
  fill(85, 36, 91, 44, T_ROOM);
  // Clase h24 derecha abajo (col 85–91, row 46–54)
  fill(85, 46, 91, 54, T_ROOM);

  /* ══════════════════════════════════════════════════════════
     BLOQUE SUR — Oficinas y TICS
     ══════════════════════════════════════════════════════════ */
  // Corredor vertical sur — EXPANDIDO (col 43–60, row 43–63)
  fill(43, 43, 60, 63, T_CORRIDOR);
  // Oficina 1
  fill(38, 44, 42, 51, T_ROOM);
  // Oficina 2
  fill(38, 52, 42, 58, T_ROOM);
  // TICS (grande, col 38–70, row 55–63)
  fill(38, 55, 70, 63, T_ROOM);

  /* ══════════════════════════════════════════════════════════
     CONEXIONES DE PUENTES/PASILLOS
     ══════════════════════════════════════════════════════════ */
  // Puente desde corredor izq al corredor central (row 20–29)
  fill(13, 20, 48, 29, T_CORRIDOR);
  // Puente desde corredor central a corredor derecho (row 35–43)
  fill(43, 35, 68, 44, T_CORRIDOR);

  return g;
}

export const GRID = makeGrid();

/* ─────────────────────────────────────────────────────────────
   ZONAS (salones, oficinas, gradas) con nombre y centro
   ───────────────────────────────────────────────────────────── */
export const ZONES = [
  { id: 'h24-izq',   name: 'Clase H24',           col: 7,  row: 10, type: T_ROOM    },
  { id: 'h23',       name: 'Clase H23',           col: 7,  row: 26, type: T_ROOM    },
  { id: 'h22',       name: 'Clase H22',           col: 7,  row: 43, type: T_ROOM    },
  { id: 'gradas-izq',name: 'Gradas (Bloque H)',   col: 15, row: 6,  type: T_STAIRS  },
  { id: 'bano-m',    name: 'Baño Mujeres',        col: 15, row: 12, type: T_ROOM    },
  { id: 'bano-h',    name: 'Baño Hombres',        col: 15, row: 18, type: T_ROOM    },
  { id: 'coord',     name: 'Coordinación',        col: 36, row: 6,  type: T_ROOM    },
  { id: 'g25',       name: 'Clase G25',           col: 36, row: 16, type: T_ROOM    },
  { id: 'g24',       name: 'Clase G24',           col: 36, row: 26, type: T_ROOM    },
  { id: 'gradas-cen',name: 'Gradas (Bloque G)',   col: 52, row: 16, type: T_STAIRS  },
  { id: 'ss',        name: 'SS',                  col: 33, row: 34, type: T_ROOM    },
  { id: 'g21',       name: 'Clase G21',           col: 36, row: 43, type: T_ROOM    },
  { id: 'gradas-sur',name: 'Gradas (Sur)',        col: 55, row: 40, type: T_STAIRS  },
  { id: 'sala-reun', name: 'Sala de Reuniones',   col: 76, row: 29, type: T_ROOM    },
  { id: 'gradas-der',name: 'Gradas (Der)',        col: 82, row: 40, type: T_STAIRS  },
  { id: 'h24-der-a', name: 'Clase H24 (Der-A)',   col: 88, row: 40, type: T_ROOM    },
  { id: 'h24-der-b', name: 'Clase H24 (Der-B)',   col: 88, row: 50, type: T_ROOM    },
  { id: 'oficina1',  name: 'Oficina 1',           col: 42, row: 47, type: T_ROOM    },
  { id: 'oficina2',  name: 'Oficina 2',           col: 42, row: 55, type: T_ROOM    },
  { id: 'tics',      name: 'TICS',                col: 48, row: 59, type: T_ROOM    },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */
export function cellType(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return T_BLOCKED;
  return GRID[row][col];
}

export function isWalkable(col, row) {
  const t = cellType(col, row);
  return t === T_CORRIDOR || t === T_STAIRS;
}

export function isRestricted(col, row) {
  return cellType(col, row) === T_BLOCKED;
}

export function isRoom(col, row) {
  return cellType(col, row) === T_ROOM;
}

/** Encuentra la celda de corredor más cercana a (col,row) */
export function nearestCorridor(col, row) {
  if (isWalkable(col, row)) return { col, row };
  let best = null, bestD = Infinity;
  for (let dr = -6; dr <= 6; dr++) {
    for (let dc = -6; dc <= 6; dc++) {
      const nc = col + dc, nr = row + dr;
      if (isWalkable(nc, nr)) {
        const d = Math.abs(dc) + Math.abs(dr);
        if (d < bestD) { bestD = d; best = { col: nc, row: nr }; }
      }
    }
  }
  return best;
}

/** px → celda */
export function pxToCell(px, py) {
  return { col: Math.floor(px / CELL), row: Math.floor(py / CELL) };
}

/** celda → centro en px */
export function cellToPx(col, row) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

/* ─────────────────────────────────────────────────────────────
   ALGORITMO  A*
   ───────────────────────────────────────────────────────────── */
function heuristic(ac, ar, bc, br) {
  return Math.abs(ac - bc) + Math.abs(ar - br); // Manhattan
}

/**
 * astar(start, end)
 *   start / end: { col, row }  — deben ser celdas WALKABLE
 *   Devuelve array de { col, row } o null si no hay ruta.
 */
export function astar(start, end) {
  const key = (c, r) => `${c},${r}`;

  const openSet  = new Map();  // key → node
  const closedSet = new Set();

  const startNode = {
    col: start.col, row: start.row,
    g: 0,
    h: heuristic(start.col, start.row, end.col, end.row),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.set(key(start.col, start.row), startNode);

  // Máximo de iteraciones para evitar bucle infinito
  const MAX_ITER = COLS * ROWS * 4;
  let iter = 0;

  while (openSet.size > 0 && iter++ < MAX_ITER) {
    // Nodo con menor F
    let current = null;
    for (const node of openSet.values()) {
      if (!current || node.f < current.f) current = node;
    }

    if (current.col === end.col && current.row === end.row) {
      // Reconstruir camino
      const path = [];
      let n = current;
      while (n) { path.unshift({ col: n.col, row: n.row }); n = n.parent; }
      return path;
    }

    openSet.delete(key(current.col, current.row));
    closedSet.add(key(current.col, current.row));

    // Vecinos (4 direcciones)
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dc, dr] of dirs) {
      const nc = current.col + dc, nr = current.row + dr;
      const nk = key(nc, nr);
      if (closedSet.has(nk)) continue;
      if (!isWalkable(nc, nr)) continue;

      const g = current.g + 1;
      const existing = openSet.get(nk);
      if (!existing || g < existing.g) {
        const h = heuristic(nc, nr, end.col, end.row);
        openSet.set(nk, { col: nc, row: nr, g, h, f: g + h, parent: current });
      }
    }
  }
  return null; // Sin ruta
}

/* ─────────────────────────────────────────────────────────────
   ESTADO DE NAVEGACIÓN
   ───────────────────────────────────────────────────────────── */
export const NavState = {
  origin: null,        // { col, row, label }
  destination: null,   // { col, row, label }
  path: null,          // [{ col, row }, ...]
  visitedNodes: [],    // nodos explorados (opcional, para visualización)

  setOrigin(col, row, label) {
    this.origin = { col, row, label };
    this.path = null;
  },
  setDestination(col, row, label) {
    this.destination = { col, row, label };
    this.path = null;
  },
  clear() {
    this.origin = null;
    this.destination = null;
    this.path = null;
    this.visitedNodes = [];
  },

  /**
   * Calcula la ruta.
   * Para salones: busca corredor de entrada/salida antes de correr A*.
   * Devuelve { ok, message }
   */
  computeRoute() {
    if (!this.origin || !this.destination) return { ok: false, message: 'Faltan puntos.' };

    // Resolver puntos de entrada al corredor
    let startCell = isWalkable(this.origin.col, this.origin.row)
      ? { col: this.origin.col, row: this.origin.row }
      : nearestCorridor(this.origin.col, this.origin.row);

    let endCell = isWalkable(this.destination.col, this.destination.row)
      ? { col: this.destination.col, row: this.destination.row }
      : nearestCorridor(this.destination.col, this.destination.row);

    if (!startCell) return { ok: false, message: 'No hay corredor cerca del origen.' };
    if (!endCell)   return { ok: false, message: 'No hay corredor cerca del destino.' };

    // Construir ruta completa: origen-room → corredor-entrada → A* → corredor-salida → destino-room
    const corePath = astar(startCell, endCell);
    if (!corePath) return { ok: false, message: 'No existe una ruta disponible.' };

    // Prefijo y sufijo con la celda del salón si aplica
    const fullPath = [];
    if (isRoom(this.origin.col, this.origin.row))
      fullPath.push({ col: this.origin.col, row: this.origin.row });
    fullPath.push(...corePath);
    if (isRoom(this.destination.col, this.destination.row))
      fullPath.push({ col: this.destination.col, row: this.destination.row });

    this.path = fullPath;
    return { ok: true, message: `Ruta encontrada: ${fullPath.length} pasos.` };
  },
};