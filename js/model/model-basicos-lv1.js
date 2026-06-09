import { ZoneType, MAP_CONFIG } from '../config/config-basicos-lv1.js';

export class MapModel {
    constructor(gridData, labelsData, searchItemsData) {
        this.grid = gridData;
        this.labels = labelsData;
        this.searchItems = searchItemsData;
        this.originNode = null;
        this.destNode = null;
        this.calculatedRoute = null;
    }

    getCellName(r, c) {
        if (r < 0 || r >= MAP_CONFIG.ROWS || c < 0 || c >= MAP_CONFIG.COLS) {
            return 'Fuera de límites';
        }
        const type = this.grid[r]?.[c];
        switch (type) {
            case ZoneType.AULA: return 'Aula';
            case ZoneType.ESCALERA: return 'Escalera';
            case ZoneType.PASILLO: return 'Pasillo';
            case ZoneType.BANIO: return 'Baño';
            case ZoneType.ADMIN: return 'Administración';
            default: return 'Área común';
        }
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

    // Algoritmo A* para encontrar la ruta más corta
    findRoute() {
        if (!this.originNode || !this.destNode) return null;

        const start = { r: this.originNode.r, c: this.originNode.c };
        const goal = { r: this.destNode.r, c: this.destNode.c };

        const heuristic = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

        const isWalkable = (r, c) => {
            if (r < 0 || r >= MAP_CONFIG.ROWS || c < 0 || c >= MAP_CONFIG.COLS) return false;
            const type = this.grid[r]?.[c];
            return type !== ZoneType.VACIO;
        };

        const openSet = [start];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const getKey = (node) => `${node.r},${node.c}`;
        gScore.set(getKey(start), 0);
        fScore.set(getKey(start), heuristic(start, goal));

        while (openSet.length > 0) {
            let current = openSet.reduce((a, b) =>
                (fScore.get(getKey(a)) || Infinity) < (fScore.get(getKey(b)) || Infinity) ? a : b
            );

            if (current.r === goal.r && current.c === goal.c) {
                const path = [];
                let curr = current;
                while (curr) {
                    path.unshift(curr);
                    const key = getKey(curr);
                    const prev = cameFrom.get(key);
                    curr = prev;
                }
                this.calculatedRoute = path;
                return path;
            }

            const idx = openSet.findIndex(n => n.r === current.r && n.c === current.c);
            openSet.splice(idx, 1);

            const neighbors = [
                { r: current.r - 1, c: current.c },
                { r: current.r + 1, c: current.c },
                { r: current.r, c: current.c - 1 },
                { r: current.r, c: current.c + 1 }
            ];

            for (const neighbor of neighbors) {
                if (!isWalkable(neighbor.r, neighbor.c)) continue;

                const tentativeG = (gScore.get(getKey(current)) || Infinity) + 1;

                if (tentativeG < (gScore.get(getKey(neighbor)) || Infinity)) {
                    cameFrom.set(getKey(neighbor), current);
                    gScore.set(getKey(neighbor), tentativeG);
                    fScore.set(getKey(neighbor), tentativeG + heuristic(neighbor, goal));

                    if (!openSet.some(n => n.r === neighbor.r && n.c === neighbor.c)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        this.calculatedRoute = null;
        return null;
    }

    getRouteDistance() {
        if (!this.calculatedRoute) return null;
        return (this.calculatedRoute.length - 1) * MAP_CONFIG.METERS_PER_CELL;
    }
}