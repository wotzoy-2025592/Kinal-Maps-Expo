import { T, ROWS, COLS, METERS_PER_CELL } from '../config/config.js';
import { buildGrid, buildLabels } from '../data/data.js';

export class MapModel {
  constructor() {
    this.grid = buildGrid();
    this.labels = buildLabels();
    this.originNode = null;
    this.destNode = null;
    this.calculatedRoute = null;
  }

  getCellName(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 'Fuera de límites';
    const type = this.grid[r][c];
    for (let key in T) {
      if (T[key] === type) return key;
    }
    return 'Desconocido';
  }

  clearRoute() {
    this.originNode = null;
    this.destNode = null;
    this.calculatedRoute = null;
  }

  setOrigin(r, c) {
    this.originNode = { r, c };
    this.calculatedRoute = null;
  }

  setDestination(r, c) {
    this.destNode = { r, c };
    this.calculatedRoute = null;
  }

  // Algoritmo A* con costos dinámicos
  findRoute() {
    if (!this.originNode || !this.destNode) return null;

    const start = { ...this.originNode, g: 0, h: 0, f: 0, parent: null };
    const end = { ...this.destNode };
    const openSet = [start];
    const closedSet = new Set();

    const heuristic = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();

      if (current.r === end.r && current.c === end.c) {
        const path = [];
        let curr = current;
        while (curr) {
          path.push({ r: curr.r, c: curr.c });
          curr = curr.parent;
        }
        this.calculatedRoute = path.reverse();
        return this.calculatedRoute;
      }

      closedSet.add(`${current.r},${current.c}`);

      const neighbors = [
        { r: current.r - 1, c: current.c },
        { r: current.r + 1, c: current.c },
        { r: current.r, c: current.c - 1 },
        { r: current.r, c: current.c + 1 }
      ];

      for (let neighbor of neighbors) {
        if (neighbor.r < 0 || neighbor.r >= ROWS || neighbor.c < 0 || neighbor.c >= COLS) continue;
        if (closedSet.has(`${neighbor.r},${neighbor.c}`)) continue;

        const type = this.grid[neighbor.r][neighbor.c];
        let costMultiplier = 1.0;
        if (type === T.ROAD) costMultiplier = 0.8;
        else if (type === T.PATH) costMultiplier = 0.9;
        else if (type === T.OPEN) costMultiplier = 1.5;
        else costMultiplier = 6.0;

        const tentativeG = current.g + 1 * costMultiplier;
        let existing = openSet.find(o => o.r === neighbor.r && o.c === neighbor.c);

        if (!existing) {
          neighbor.g = tentativeG;
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openSet.push(neighbor);
        } else if (tentativeG < existing.g) {
          existing.g = tentativeG;
          existing.f = existing.g + existing.h;
          existing.parent = current;
        }
      }
    }

    this.calculatedRoute = null;
    return null;
  }

  getRouteDistance() {
    if (!this.calculatedRoute) return null;
    return (this.calculatedRoute.length - 1) * METERS_PER_CELL;
  }
}