export const CELL = 14;
export const COLS = 92;
export const ROWS = 65;

export const T_BLOCKED   = 0;
export const T_CORRIDOR  = 1;
export const T_ROOM      = 2;
export const T_STAIRS    = 3;

function makeGrid() {
  const g = Array.from({ length: ROWS }, () => new Uint8Array(COLS).fill(T_BLOCKED));

  function fill(c0, r0, c1, r1, type) {
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++)
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
          g[r][c] = type;
  }

  // Clase h24 
  fill(2, 4, 12, 17, T_ROOM);
  // Clase h23 
  fill(2, 20, 12, 33, T_ROOM);
  // Clase h22
  fill(2, 36, 12, 50, T_ROOM);
  // Corredor
  fill(13, 3, 20, 54, T_CORRIDOR);
  // Gradas
  fill(14, 3, 17, 9, T_STAIRS);
  // Baño Mujeres
  fill(14, 10, 17, 14, T_ROOM);
  // Baño Hombres
  fill(14, 16, 17, 20, T_ROOM);

  fill(17, 29, 48, 35, T_CORRIDOR);

  // Coordinación
  fill(30, 2, 42, 10, T_ROOM);
  // Clase G25
  fill(30, 12, 42, 20, T_ROOM);
  // Clase G24
  fill(30, 22, 42, 30, T_ROOM);
  // Corredor 
  fill(43, 2, 50, 62, T_CORRIDOR);
  // Gradas
  fill(51, 12, 57, 20, T_STAIRS);
  // Servicio de baño
  fill(30, 32, 36, 36, T_ROOM);
  // Clase G21
  fill(30, 38, 42, 48, T_ROOM);

  // Corredor
  fill(43, 36, 50, 62, T_CORRIDOR);
  // Gradas
  fill(51, 37, 57, 44, T_STAIRS);
  // Corredor
  fill(43, 36, 75, 44, T_CORRIDOR);

  // Sala de reuniones
  fill(68, 22, 84, 36, T_ROOM);
  // Corredor
  fill(68, 36, 90, 46, T_CORRIDOR);
  // Gradas
  fill(80, 36, 84, 44, T_STAIRS);
  // Clase h24
  fill(85, 36, 91, 44, T_ROOM);
  // Clase h24
  fill(85, 46, 91, 54, T_ROOM);

  // Corredor
  fill(43, 43, 60, 63, T_CORRIDOR);
  // Oficina 1
  fill(38, 44, 42, 51, T_ROOM);
  // Oficina 2
  fill(38, 52, 42, 58, T_ROOM);
  // TICS
  fill(38, 55, 70, 63, T_ROOM);

  // Puente desde corredor izq al corredor central
  fill(13, 20, 48, 29, T_CORRIDOR);
  // Puente desde corredor central a corredor derecho
  fill(43, 35, 68, 44, T_CORRIDOR);

  return g;
}

export const GRID = makeGrid();

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

export function pxToCell(px, py) {
  return { col: Math.floor(px / CELL), row: Math.floor(py / CELL) };
}

export function cellToPx(col, row) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

function heuristic(ac, ar, bc, br) {
  return Math.abs(ac - bc) + Math.abs(ar - br);
}

export function astar(start, end) {
  const key = (c, r) => `${c},${r}`;

  const openSet  = new Map(); 
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

  const MAX_ITER = COLS * ROWS * 4;
  let iter = 0;

  while (openSet.size > 0 && iter++ < MAX_ITER) {
    let current = null;
    for (const node of openSet.values()) {
      if (!current || node.f < current.f) current = node;
    }

    if (current.col === end.col && current.row === end.row) {
      const path = [];
      let n = current;
      while (n) { path.unshift({ col: n.col, row: n.row }); n = n.parent; }
      return path;
    }

    openSet.delete(key(current.col, current.row));
    closedSet.add(key(current.col, current.row));

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

export const NavState = {
  origin: null,        // { col, row, label }
  destination: null,   // { col, row, label }
  path: null,          // [{ col, row }, ...]
  visitedNodes: [],    // nodos explorados 

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

  computeRoute() {
    if (!this.origin || !this.destination) return { ok: false, message: 'Faltan puntos.' };

    let startCell = isWalkable(this.origin.col, this.origin.row)
      ? { col: this.origin.col, row: this.origin.row }
      : nearestCorridor(this.origin.col, this.origin.row);

    let endCell = isWalkable(this.destination.col, this.destination.row)
      ? { col: this.destination.col, row: this.destination.row }
      : nearestCorridor(this.destination.col, this.destination.row);

    if (!startCell) return { ok: false, message: 'No hay corredor cerca del origen.' };
    if (!endCell)   return { ok: false, message: 'No hay corredor cerca del destino.' };

    const corePath = astar(startCell, endCell);
    if (!corePath) return { ok: false, message: 'No existe una ruta disponible.' };

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