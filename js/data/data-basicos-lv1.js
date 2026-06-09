import { ZoneType } from '../config/config-basicos-lv1.js';

// Función para llenar áreas rectangulares
export function fillArea(grid, r1, c1, r2, c2, type) {
    for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
            if (grid[r] && grid[r][c] !== undefined) {
                grid[r][c] = type;
            }
        }
    }
}

// Construir el grid del mapa
export function buildGrid(rows, cols) {
    // Inicializar grid vacío
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(ZoneType.VACIO));

    // === PASILLOS PRINCIPALES ===
    fillArea(grid, 18, 0, 21, cols - 1, ZoneType.PASILLO);
    fillArea(grid, 3, 0, 5, cols - 1, ZoneType.PASILLO);
    fillArea(grid, 34, 0, 36, cols - 1, ZoneType.PASILLO);
    fillArea(grid, 0, 8, rows - 1, 11, ZoneType.PASILLO);
    fillArea(grid, 0, 38, rows - 1, 41, ZoneType.PASILLO);
    fillArea(grid, 0, 23, rows - 1, 26, ZoneType.PASILLO);

    // === ESCALERAS ===
    fillArea(grid, 6, 12, 11, 16, ZoneType.ESCALERA);
    fillArea(grid, 6, 30, 11, 34, ZoneType.ESCALERA);
    fillArea(grid, 23, 12, 28, 16, ZoneType.ESCALERA);
    fillArea(grid, 23, 30, 28, 34, ZoneType.ESCALERA);
    fillArea(grid, 37, 12, 39, 16, ZoneType.ESCALERA);
    fillArea(grid, 37, 30, 39, 34, ZoneType.ESCALERA);

    // === AULAS ===
    fillArea(grid, 6, 0, 17, 7, ZoneType.AULA);
    fillArea(grid, 6, 17, 17, 22, ZoneType.AULA);
    fillArea(grid, 6, 27, 17, 37, ZoneType.AULA);
    fillArea(grid, 6, 42, 17, 49, ZoneType.AULA);
    fillArea(grid, 22, 0, 33, 7, ZoneType.AULA);
    fillArea(grid, 22, 17, 33, 22, ZoneType.AULA);
    fillArea(grid, 22, 27, 33, 37, ZoneType.AULA);
    fillArea(grid, 22, 42, 33, 49, ZoneType.AULA);
    fillArea(grid, 37, 0, 39, 7, ZoneType.AULA);
    fillArea(grid, 37, 17, 39, 22, ZoneType.AULA);
    fillArea(grid, 37, 27, 39, 37, ZoneType.AULA);
    fillArea(grid, 37, 42, 39, 49, ZoneType.AULA);

    // === BAÑOS ===
    fillArea(grid, 2, 42, 4, 48, ZoneType.BANIO);
    fillArea(grid, 14, 42, 16, 48, ZoneType.BANIO);
    fillArea(grid, 31, 42, 33, 48, ZoneType.BANIO);
    fillArea(grid, 31, 2, 33, 6, ZoneType.BANIO);

    // === ADMINISTRACIÓN ===
    fillArea(grid, 0, 43, 2, 49, ZoneType.ADMIN);
    fillArea(grid, 0, 0, 2, 7, ZoneType.ADMIN);

    return grid;
}

// Construir etiquetas
export function buildLabels() {
    const labels = [];

    const addLabel = (r, c, text, size = 9, bold = false) => {
        labels.push({ r, c, text, size, bold });
    };

    // Escaleras
    addLabel(8.5, 14, "ESCALERA 1", 8, true);
    addLabel(8.5, 32, "ESCALERA 2", 8, true);
    addLabel(25.5, 14, "ESCALERA 3", 8, true);
    addLabel(25.5, 32, "ESCALERA 4", 8, true);
    addLabel(38, 14, "ESCALERA 5", 8, true);
    addLabel(38, 32, "ESCALERA 6", 8, true);

    // Aulas
    addLabel(11.5, 3.5, "AULA 101", 8);
    addLabel(11.5, 19.5, "AULA 102", 8);
    addLabel(11.5, 32, "AULA 103", 8);
    addLabel(11.5, 45.5, "AULA 104", 8);
    addLabel(27.5, 3.5, "AULA 201", 8);
    addLabel(27.5, 19.5, "AULA 202", 8);
    addLabel(27.5, 32, "AULA 203", 8);
    addLabel(27.5, 45.5, "AULA 204", 8);
    addLabel(38, 3.5, "AULA 301", 8);
    addLabel(38, 19.5, "AULA 302", 8);
    addLabel(38, 32, "AULA 303", 8);
    addLabel(38, 45.5, "AULA 304", 8);

    // Pasillos
    addLabel(19.5, 24.5, "PASILLO CENTRAL", 8, true);
    addLabel(3.5, 9.5, "PASILLO OESTE", 7);
    addLabel(3.5, 39.5, "PASILLO ESTE", 7);

    // Baños y administración
    addLabel(3, 45, "BAÑOS", 7);
    addLabel(15, 45, "BAÑOS", 7);
    addLabel(32, 45, "BAÑOS", 7);
    addLabel(32, 4, "BAÑOS", 7);
    addLabel(1, 46, "ADMIN", 7, true);
    addLabel(1, 3.5, "RECEPCIÓN", 7, true);

    return labels;
}

// Elementos para búsqueda
export function buildSearchItems() {
    return [
        { name: 'ESCALERA 1', r: 8, c: 14 },
        { name: 'ESCALERA 2', r: 8, c: 32 },
        { name: 'ESCALERA 3', r: 25, c: 14 },
        { name: 'ESCALERA 4', r: 25, c: 32 },
        { name: 'ESCALERA 5', r: 38, c: 14 },
        { name: 'ESCALERA 6', r: 38, c: 32 },
        { name: 'AULA 101', r: 11, c: 3 },
        { name: 'AULA 102', r: 11, c: 19 },
        { name: 'AULA 103', r: 11, c: 32 },
        { name: 'AULA 104', r: 11, c: 45 },
        { name: 'AULA 201', r: 27, c: 3 },
        { name: 'AULA 202', r: 27, c: 19 },
        { name: 'AULA 203', r: 27, c: 32 },
        { name: 'AULA 204', r: 27, c: 45 },
        { name: 'AULA 301', r: 38, c: 3 },
        { name: 'AULA 302', r: 38, c: 19 },
        { name: 'AULA 303', r: 38, c: 32 },
        { name: 'AULA 304', r: 38, c: 45 },
        { name: 'BAÑOS', r: 3, c: 45 },
        { name: 'ADMIN', r: 1, c: 46 },
        { name: 'RECEPCIÓN', r: 1, c: 3 },
        { name: 'PASILLO', r: 19, c: 24 }
    ];
}