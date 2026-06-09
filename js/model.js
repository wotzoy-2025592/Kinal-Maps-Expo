import { ROWS, COLS, T, classA, classB, classC } from './config.js';

export class MapModel {
  constructor() {
    this.grid = Array.from({length:ROWS}, ()=>new Array(COLS).fill(0));
    this.labels = [];
    this.originNode = null; 
    this.destNode = null;   
    this.calculatedRoute = null; 
    
    this.initGrid();
    this.initLabels();
  }

  fill(r1,c1,r2,c2,type){
    for(let r=r1;r<=r2;r++) {
      for(let c=c1;c<=c2;c++) {
        if(r >= 0 && r < ROWS && c >= 0 && c < COLS) this.grid[r][c]=type;
      }
    }
  }

  lbl(r,c,text,size,bold){ 
    this.labels.push({r,c,text,size:size||10,bold:bold||false}); 
  }

  initGrid() {
    this.fill(0,0,ROWS-1,COLS-1,T.OPEN);
    this.fill(10,0,11,COLS-1,T.ROAD);
    this.fill(32,0,33,COLS-1,T.ROAD);
    this.fill(0,10,ROWS-1,11,T.ROAD);
    this.fill(0,40,ROWS-1,41,T.ROAD);
    this.fill(22,0,23,COLS-1,T.ROAD);
    this.fill(0,26,ROWS-1,27,T.ROAD);

    this.fill(5,12,5,39,T.PATH); this.fill(5,12,9,12,T.PATH); this.fill(5,39,9,39,T.PATH);
    this.fill(14,12,14,25,T.PATH); this.fill(14,28,14,39,T.PATH); this.fill(12,15,21,15,T.PATH);
    this.fill(12,35,21,35,T.PATH); this.fill(14,15,14,35,T.PATH); this.fill(24,12,31,12,T.PATH);
    this.fill(24,39,31,39,T.PATH); this.fill(24,15,24,25,T.PATH); this.fill(24,28,24,39,T.PATH);
    this.fill(34,12,50,12,T.PATH); this.fill(34,39,50,39,T.PATH); this.fill(34,15,34,39,T.PATH);
    this.fill(45,15,45,39,T.PATH); this.fill(50,15,50,39,T.PATH);

    this.fill(2,24,5,29,T.ENTRY); this.fill(6,22,9,29,T.RECEP); this.fill(6,30,9,38,T.ADMIN);
    this.fill(13,13,21,25,T.LIB); this.fill(13,28,21,38,T.CAFE); this.fill(24,13,31,25,T.AUD);
    this.fill(24,28,31,38,T.TEACH); this.fill(2,13,5,22,T.NURSE);

    this.fill(6,43,9,55,T.LAB_CO); this.fill(13,43,18,55,T.LAB_EL);
    this.fill(19,43,24,55,T.LAB_ME); this.fill(25,43,31,55,T.WORK);

    classA.forEach(([r1,c1,r2,c2])=>this.fill(r1,c1,r2,c2,T.A));
    classB.forEach(([r1,c1,r2,c2])=>this.fill(r1,c1,r2,c2,T.B));
    classC.forEach(([r1,c1,r2,c2])=>this.fill(r1,c1,r2,c2,T.C));

    this.fill(2,43,9,55,T.SPORT); this.fill(35,2,57,8,T.SPORT);
    this.fill(2,2,8,8,T.GREEN); this.fill(34,2,36,8,T.GREEN);
    this.fill(13,2,21,8,T.GREEN); this.fill(24,2,30,8,T.GREEN); this.fill(55,13,57,55,T.GREEN);
    this.fill(24,2,31,8,T.PARK_S); this.fill(35,57,57,58,T.PARK_P);

    this.fill(0,26,0,27,T.EMERG); this.fill(0,14,0,15,T.EMERG);
    this.fill(ROWS-1,26,ROWS-1,27,T.EMERG); this.fill(ROWS-1,14,ROWS-1,15,T.EMERG);
    this.fill(14,0,15,0,T.EMERG); this.fill(35,0,36,0,T.EMERG);

    this.fill(7,2,8,4,T.MEET); this.fill(7,7,8,8,T.MEET);
    this.fill(56,2,57,4,T.MEET); this.fill(56,14,57,16,T.MEET);
  }

  initLabels() {
    this.lbl(3.5,26,'ENTRADA',9,true); this.lbl(3.5,26.5,'PRINCIPAL',8);
    this.lbl(7.5,25,'RECEPCIÓN',10,true); this.lbl(7.5,34,'ADMINISTRACIÓN',10,true);
    this.lbl(17,19,'BIBLIOTECA',11,true); this.lbl(17,33,'CAFETERÍA',11,true);
    this.lbl(27.5,19,'AUDITORIO',11,true); this.lbl(27.5,33,'ÁREA DE',10,true); this.lbl(28.5,33,'PROFESORES',10);
    this.lbl(3.5,17,'ENFERMERÍA',9,true); this.lbl(7.5,49,'LAB. COMPUTACIÓN',10,true);
    this.lbl(15.5,49,'LAB. ELECTRÓNICA',10,true); this.lbl(21.5,49,'LAB. MECÁNICA',10,true);
    this.lbl(28,49,'TALLERES',10,true); this.lbl(28.5,49,'TÉCNICOS',10); this.lbl(5.5,49,'CANCHAS',10,true);
    this.lbl(6,49,'DEPORTIVAS',10); this.lbl(46,5,'CANCHAS',9,true); this.lbl(27.5,5,'PARQUEO',9,true);
    this.lbl(28,5,'ESTUDIANTES',9); this.lbl(43,57.5,'PARQUEO',8,true); this.lbl(44,57.5,'PERSONAL',8);
    this.lbl(5,5,'ÁREA',8,true); this.lbl(5.5,5,'VERDE',8);

    classA.forEach(([r1,c1,r2,c2],i)=>this.lbl((r1+r2)/2,(c1+c2)/2,'A'+(i+1),9,true));
    classB.forEach(([r1,c1,r2,c2],i)=>this.lbl((r1+r2)/2,(c1+c2)/2,'B'+(i+1),9,true));
    classC.forEach(([r1,c1,r2,c2],i)=>this.lbl((r1+r2)/2,(c1+c2)/2,'C'+(i+1),9,true));

    this.lbl(10.5,30,'AVENIDA PRINCIPAL',9); this.lbl(32.5,30,'AV. SECUNDARIA',9);
    this.lbl(5,20,'CALLE NORTE',8); this.lbl(5,13,'C. OESTE',8);
  }

  getCellName(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 'Fuera de límites';
    const type = this.grid[r][c];
    for (let key in T) {
      if (T[key] === type) return key;
    }
    return 'Desconocido';
  }

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

  clearRoute() {
    this.originNode = null;
    this.destNode = null;
    this.calculatedRoute = null;
  }
}