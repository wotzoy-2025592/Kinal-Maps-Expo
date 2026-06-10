import { T, ROWS, COLS, classA, classB, classC } from '../config/config.js';

// Función para llenar áreas rectangulares
export function fillArea(grid, r1, c1, r2, c2, type) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        grid[r][c] = type;
      }
    }
  }
}

// Construir el grid del mapa
export function buildGrid() {
  const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(T.OPEN));

  // Vías principales
  fillArea(grid, 10, 0, 11, COLS - 1, T.ROAD);
  fillArea(grid, 32, 0, 33, COLS - 1, T.ROAD);
  fillArea(grid, 0, 10, ROWS - 1, 11, T.ROAD);
  fillArea(grid, 0, 40, ROWS - 1, 41, T.ROAD);
  fillArea(grid, 22, 0, 23, COLS - 1, T.ROAD);
  fillArea(grid, 0, 26, ROWS - 1, 27, T.ROAD);

  // Caminos peatonales
  fillArea(grid, 5, 12, 5, 39, T.PATH);
  fillArea(grid, 5, 12, 9, 12, T.PATH);
  fillArea(grid, 5, 39, 9, 39, T.PATH);
  fillArea(grid, 14, 12, 14, 25, T.PATH);
  fillArea(grid, 14, 28, 14, 39, T.PATH);
  fillArea(grid, 12, 15, 21, 15, T.PATH);
  fillArea(grid, 12, 35, 21, 35, T.PATH);
  fillArea(grid, 14, 15, 14, 35, T.PATH);
  fillArea(grid, 24, 12, 31, 12, T.PATH);
  fillArea(grid, 24, 39, 31, 39, T.PATH);
  fillArea(grid, 24, 15, 24, 25, T.PATH);
  fillArea(grid, 24, 28, 24, 39, T.PATH);
  fillArea(grid, 34, 12, 50, 12, T.PATH);
  fillArea(grid, 34, 39, 50, 39, T.PATH);
  fillArea(grid, 34, 15, 34, 39, T.PATH);
  fillArea(grid, 45, 15, 45, 39, T.PATH);
  fillArea(grid, 50, 15, 50, 39, T.PATH);

  // Edificios principales
  fillArea(grid, 2, 24, 5, 29, T.ENTRY);
  fillArea(grid, 6, 22, 9, 29, T.RECEP);
  fillArea(grid, 6, 30, 9, 38, T.ADMIN);
  fillArea(grid, 13, 13, 21, 25, T.LIB);
  fillArea(grid, 13, 28, 21, 38, T.CAFE);
  fillArea(grid, 24, 13, 31, 25, T.AUD);
  fillArea(grid, 24, 28, 31, 38, T.TEACH);
  fillArea(grid, 2, 13, 5, 22, T.NURSE);

  // Laboratorios y talleres
  fillArea(grid, 6, 43, 9, 55, T.LAB_CO);
  fillArea(grid, 13, 43, 18, 55, T.LAB_EL);
  fillArea(grid, 19, 43, 24, 55, T.LAB_ME);
  fillArea(grid, 25, 43, 31, 55, T.WORK);

  // Aulas
  classA.forEach(([r1, c1, r2, c2]) => fillArea(grid, r1, c1, r2, c2, T.A));
  classB.forEach(([r1, c1, r2, c2]) => fillArea(grid, r1, c1, r2, c2, T.B));
  classC.forEach(([r1, c1, r2, c2]) => fillArea(grid, r1, c1, r2, c2, T.C));

  // Áreas deportivas y verdes
  fillArea(grid, 2, 43, 9, 55, T.SPORT);
  fillArea(grid, 35, 2, 57, 8, T.SPORT);
  fillArea(grid, 2, 2, 8, 8, T.GREEN);
  fillArea(grid, 34, 2, 36, 8, T.GREEN);
  fillArea(grid, 13, 2, 21, 8, T.GREEN);
  fillArea(grid, 24, 2, 30, 8, T.GREEN);
  fillArea(grid, 55, 13, 57, 55, T.GREEN);

  // Parqueos
  fillArea(grid, 24, 2, 31, 8, T.PARK_S);
  fillArea(grid, 35, 57, 57, 58, T.PARK_P);

  // Salidas de emergencia
  fillArea(grid, 0, 26, 0, 27, T.EMERG);
  fillArea(grid, 0, 14, 0, 15, T.EMERG);
  fillArea(grid, ROWS - 1, 26, ROWS - 1, 27, T.EMERG);
  fillArea(grid, ROWS - 1, 14, ROWS - 1, 15, T.EMERG);
  fillArea(grid, 14, 0, 15, 0, T.EMERG);
  fillArea(grid, 35, 0, 36, 0, T.EMERG);

  // Puntos de reunión
  fillArea(grid, 7, 2, 8, 4, T.MEET);
  fillArea(grid, 7, 7, 8, 8, T.MEET);
  fillArea(grid, 56, 2, 57, 4, T.MEET);
  fillArea(grid, 56, 14, 57, 16, T.MEET);

  return grid;
}

// Construir etiquetas
export function buildLabels() {
  const labels = [];

  const addLabel = (r, c, text, size = 10, bold = false) => {
    labels.push({ r, c, text, size, bold });
  };

  addLabel(3.5, 26, 'ENTRADA', 9, true);
  addLabel(3.5, 26.5, 'PRINCIPAL', 8);
  addLabel(7.5, 25, 'RECEPCIÓN', 10, true);
  addLabel(7.5, 34, 'ADMINISTRACIÓN', 10, true);
  addLabel(17, 19, 'BIBLIOTECA', 11, true);
  addLabel(17, 33, 'CAFETERÍA', 11, true);
  addLabel(27.5, 19, 'AUDITORIO', 11, true);
  addLabel(27.5, 33, 'ÁREA DE', 10, true);
  addLabel(28.5, 33, 'PROFESORES', 10);
  addLabel(3.5, 17, 'ENFERMERÍA', 9, true);
  addLabel(7.5, 49, 'LAB. COMPUTACIÓN', 10, true);
  addLabel(15.5, 49, 'LAB. ELECTRÓNICA', 10, true);
  addLabel(21.5, 49, 'LAB. MECÁNICA', 10, true);
  addLabel(28, 49, 'TALLERES', 10, true);
  addLabel(28.5, 49, 'TÉCNICOS', 10);
  addLabel(5.5, 49, 'CANCHAS', 10, true);
  addLabel(6, 49, 'DEPORTIVAS', 10);
  addLabel(46, 5, 'CANCHAS', 9, true);
  addLabel(27.5, 5, 'PARQUEO', 9, true);
  addLabel(28, 5, 'ESTUDIANTES', 9);
  addLabel(43, 57.5, 'PARQUEO', 8, true);
  addLabel(44, 57.5, 'PERSONAL', 8);
  addLabel(5, 5, 'ÁREA', 8, true);
  addLabel(5.5, 5, 'VERDE', 8);

  classA.forEach(([r1, c1, r2, c2], i) => addLabel((r1 + r2) / 2, (c1 + c2) / 2, `A${i + 1}`, 9, true));
  classB.forEach(([r1, c1, r2, c2], i) => addLabel((r1 + r2) / 2, (c1 + c2) / 2, `B${i + 1}`, 9, true));
  classC.forEach(([r1, c1, r2, c2], i) => addLabel((r1 + r2) / 2, (c1 + c2) / 2, `C${i + 1}`, 9, true));

  addLabel(10.5, 30, 'AVENIDA PRINCIPAL', 9);
  addLabel(32.5, 30, 'AV. SECUNDARIA', 9);
  addLabel(5, 20, 'CALLE NORTE', 8);
  addLabel(5, 13, 'C. OESTE', 8);

  return labels;
}

// Elementos para búsqueda
export function buildSearchItems() {
  return [
    { name: 'Entrada Principal', r: 3, c: 26 },
    { name: 'Recepción', r: 7, c: 25 },
    { name: 'Administración', r: 7, c: 34 },
    { name: 'Biblioteca', r: 17, c: 19 },
    { name: 'Cafetería', r: 17, c: 33 },
    { name: 'Auditorio', r: 27, c: 19 },
    { name: 'Área de Profesores', r: 27, c: 33 },
    { name: 'Enfermería', r: 3, c: 17 },
    { name: 'Lab. Computación', r: 7, c: 49 },
    { name: 'Lab. Electrónica', r: 15, c: 49 },
    { name: 'Lab. Mecánica', r: 21, c: 49 },
    { name: 'Talleres Técnicos', r: 28, c: 49 },
    { name: 'Parqueo Estudiantes', r: 27, c: 5 },
    { name: 'Parqueo Personal', r: 43, c: 57 },
    { name: 'Canchas Deportivas', r: 5, c: 49 },
    { name: 'Área Verde', r: 5, c: 5 },
    ...classA.map(([r1, , r2, c2], i) => ({ name: `Salón A${i + 1}`, r: (r1 + r2) / 2, c: c2 })),
    ...classB.map(([r1, , r2, c2], i) => ({ name: `Salón B${i + 1}`, r: (r1 + r2) / 2, c: c2 })),
    ...classC.map(([r1, , r2, c2], i) => ({ name: `Salón C${i + 1}`, r: (r1 + r2) / 2, c: c2 }))
  ];
}