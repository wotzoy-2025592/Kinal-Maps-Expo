//  MODEL.JS  —  Grid, nodos y algoritmo A*
//  El mapa real es 1492×1054 px.
//  Usamos una grilla de celdas de CELL_SIZE px cada una.

export const CELL_SIZE = 14;          // px por celda
export const COLS      = Math.floor(1492 / CELL_SIZE);  // ≈106
export const ROWS      = Math.floor(1054 / CELL_SIZE);  // ≈75

// ── Tipos de celda ──────────────────────────────────────────
export const CELL = {
  FREE:    0,   // pasillo / zona caminable
  BLOCKED: 1,   // pared / salón / obstáculo
  START:   2,
  END:     3,
  PATH:    4,
  VISITED: 5,
};

// ── Definición manual de zonas bloqueadas ───────────────────
//  Cada entrada: { c1, r1, c2, r2 }  (col/fila inicio → fin, inclusive)
//  Coordenadas obtenidas visualmente sobre el mapa 1492×1054 / 14 px/celda
//
//  NOTA: estos rectángulos representan los edificios/muros visibles.
//  Ajusta los valores si necesitas mayor precisión sobre tu imagen.
const BLOCKED_ZONES = [

  // C28
  { c1:24, r1:2,  c2:44, r2:10 },

  // C29
  { c1:48, r1:2,  c2:67, r2:10 },

  // C26
  { c1:24, r1:12, c2:44, r2:20 },

  // C27
  { c1:48, r1:12, c2:67, r2:20 },

  // Baño
  { c1:22, r1:22, c2:29, r2:29 },

  // C25
  { c1:56, r1:22, c2:67, r2:29 },

  // C24
  { c1:24, r1:30, c2:44, r2:39 },

  // C23
  { c1:48, r1:30, c2:67, r2:39 },

  // C22
  { c1:24, r1:40, c2:44, r2:49 },

  // C21
  { c1:48, r1:40, c2:67, r2:49 },

  // C20
  { c1:49, r1:50, c2:63, r2:61 },

  // I27
  { c1:79, r1:2, c2:99, r2:10 },

  // I23
  { c1:84, r1:15, c2:99, r2:23 },

  // I22
  { c1:84, r1:24, c2:99, r2:32 },

  // I21
  { c1:84, r1:33, c2:99, r2:41 },

  // Gradas izquierda
  { c1:28, r1:51, c2:35, r2:60 },

  // Gradas derecha
  { c1:74, r1:48, c2:89, r2:61 }
];

// ── Construir la grilla ──────────────────────────────────────
export function buildGrid() {
  // Inicializar todo libre
  const grid = Array.from({ length: ROWS }, () =>
    new Uint8Array(COLS).fill(CELL.FREE)
  );

  // Marcar bloqueados
  for (const z of BLOCKED_ZONES) {
    for (let r = Math.max(0, z.r1); r <= Math.min(ROWS - 1, z.r2); r++) {
      for (let c = Math.max(0, z.c1); c <= Math.min(COLS - 1, z.c2); c++) {
        grid[r][c] = CELL.BLOCKED;
      }
    }
  }
  return grid;
}

// ── Nodo A* ──────────────────────────────────────────────────
class Node {
  constructor(col, row) {
    this.col = col; this.row = row;
    this.g = Infinity; this.h = 0; this.f = Infinity;
    this.parent = null; this.open = false; this.closed = false;
  }
}

// Heurística: distancia Manhattan
function heuristic(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

// Vecinos en 4 y 8 direcciones (8 para rutas más naturales)
const DIRS = [
  [-1, 0],[1, 0],[0,-1],[0, 1],
  [-1,-1],[1,-1],[-1,1],[1, 1],
];

// Buscar la celda libre más cercana (BFS) desde una celda posiblemente bloqueada
function findNearestFree(grid, startCol, startRow) {
  const seen = new Set();
  const q = [{ col: startCol, row: startRow }];
  seen.add(`${startCol},${startRow}`);

  while (q.length > 0) {
    const cur = q.shift();
    const c = cur.col, r = cur.row;
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      if (grid[r][c] !== CELL.BLOCKED) return { col: c, row: r };
      for (const [dc, dr] of DIRS) {
        const nc = c + dc, nr = r + dr;
        const key = `${nc},${nr}`;
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        q.push({ col: nc, row: nr });
      }
    }
  }
  return null;
}

// ── A* principal ─────────────────────────────────────────────
export function aStar(grid, startCol, startRow, endCol, endRow) {
  // Crear nodos
  const nodes = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => new Node(c, r))
  );

  // Ajustar inicio/fin si están dentro de celdas bloqueadas: buscar la celda libre más cercana
  let adjStart = { col: startCol, row: startRow };
  let adjEnd   = { col: endCol, row: endRow };
  if (grid[startRow] && grid[startRow][startCol] === CELL.BLOCKED) {
    const found = findNearestFree(grid, startCol, startRow);
    if (!found) return { path: [], visited: [] };
    adjStart = found;
  }
  if (grid[endRow] && grid[endRow][endCol] === CELL.BLOCKED) {
    const found = findNearestFree(grid, endCol, endRow);
    if (!found) return { path: [], visited: [] };
    adjEnd = found;
  }

  const start = nodes[adjStart.row][adjStart.col];
  const end   = nodes[adjEnd.row][adjEnd.col];

  if (grid[startRow][startCol] === CELL.BLOCKED ||
      grid[endRow][endCol]     === CELL.BLOCKED) {
    return { path: [], visited: [] };
  }

  start.g = 0;
  start.h = heuristic(start, end);
  start.f = start.h;
  start.open = true;

  const openSet  = [start];
  const visited  = [];

  while (openSet.length > 0) {
    // Nodo con menor f
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
    }
    const current = openSet[lowestIdx];

    if (current === end) {
      // Reconstruir ruta
      const path = [];
      let node = current;
      while (node) { path.unshift(node); node = node.parent; }
      return { path, visited };
    }

    openSet.splice(lowestIdx, 1);
    current.open   = false;
    current.closed = true;
    visited.push(current);

    for (const [dc, dr] of DIRS) {
      const nc = current.col + dc;
      const nr = current.row + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      if (grid[nr][nc] === CELL.BLOCKED) continue;

      const neighbor = nodes[nr][nc];
      if (neighbor.closed) continue;

      // Coste diagonal = √2 ≈ 1.414
      const moveCost = (dc !== 0 && dr !== 0) ? 1.414 : 1;
      const tentativeG = current.g + moveCost;

      if (tentativeG < neighbor.g) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;

        if (!neighbor.open) {
          neighbor.open = true;
          openSet.push(neighbor);
        }
      }
    }
  }

  return { path: [], visited }; // sin ruta
}

// ── Convertir px → celda y celda → px (centro) ───────────────
export function pxToCell(px, py) {
  return {
    col: Math.floor(px / CELL_SIZE),
    row: Math.floor(py / CELL_SIZE),
  };
}

export function cellCenter(col, row) {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}