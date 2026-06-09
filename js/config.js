export const CELL = 24;
export const COLS = 60;
export const ROWS = 60;
export const W = COLS * CELL;
export const H = ROWS * CELL;

export const T = {
  OPEN:0, PATH:1, ROAD:2,
  ADMIN:10, RECEP:11, ENTRY:12,
  LIB:20, AUD:21, NURSE:22, TEACH:23,
  CAFE:30,
  LAB_CO:40, LAB_EL:41, LAB_ME:42, WORK:43,
  A:50, B:60, C:70,
  SPORT:80, GREEN:81,
  PARK_S:90, PARK_P:91,
  EMERG:100, MEET:101,
  BORDER:200
};

export const COLORS = {
  [T.OPEN]:   '#f0ede6', [T.PATH]:   '#ebebeb', [T.ROAD]:   '#d0c8b8',
  [T.ADMIN]:  '#c8dce8', [T.RECEP]:  '#c8dce8', [T.ENTRY]:  '#c8dce8',
  [T.LIB]:    '#d8d0e8', [T.AUD]:    '#d8d0e8', [T.NURSE]:  '#c8dce8',
  [T.TEACH]:  '#c8dce8', [T.CAFE]:   '#f0dcc8', [T.LAB_CO]: '#e8d8c8',
  [T.LAB_EL]: '#e8d8c8', [T.LAB_ME]: '#e8d8c8', [T.WORK]:   '#e8d8c8',
  [T.A]:      '#d8e8c8', [T.B]:      '#d8e8c8', [T.C]:      '#d8e8c8',
  [T.SPORT]:  '#c8e8d8', [T.GREEN]:  '#c8e8d8', [T.PARK_S]: '#e8e8c8',
  [T.PARK_P]: '#e8e8c8', [T.EMERG]:  '#ffe0e0', [T.MEET]:   '#fff3d0',
  [T.BORDER]: '#d0c8b8',
};

export const STROKE = {
  [T.OPEN]: null, [T.PATH]: '#d0cfc8', [T.ROAD]: '#b8b0a0',
  [T.ADMIN]:'#7a9cb8',[T.RECEP]:'#7a9cb8',[T.ENTRY]:'#7a9cb8',
  [T.LIB]:'#8a80a8',[T.AUD]:'#8a80a8',[T.NURSE]:'#7a9cb8',[T.TEACH]:'#7a9cb8',
  [T.CAFE]:'#b89060',[T.LAB_CO]:'#a88060',[T.LAB_EL]:'#a88060',[T.LAB_ME]:'#a88060',[T.WORK]:'#a88060',
  [T.A]:'#6a9040',[T.B]:'#6a9040',[T.C]:'#6a9040',
  [T.SPORT]:'#40906a',[T.GREEN]:'#40906a',
  [T.PARK_S]:'#909040',[T.PARK_P]:'#909040',
  [T.EMERG]:'#e07060',[T.MEET]:'#e0a000',
  [T.BORDER]:'#a09888',
};

export const classA = [
  [34,13,36,18],[34,19,36,24],[37,13,39,18],[37,19,39,24],
  [40,13,42,18],[40,19,42,24],[43,13,45,18],[43,19,45,24],
  [46,13,48,18],[46,19,48,24],[49,13,51,18],[49,19,51,24],[52,13,54,18],[52,19,54,24]
];

export const classB = [
  [34,28,36,33],[34,34,36,39],[37,28,39,33],[37,34,39,39],
  [40,28,42,33],[40,34,42,39],[43,28,45,33],[43,34,45,39],
  [46,28,48,33],[46,34,48,39],[49,28,51,33],[49,34,51,39],[52,28,54,33],[52,34,54,39]
];

export const classC = [
  [34,43,36,48],[34,49,36,55],[37,43,39,48],[37,49,39,55],
  [40,43,42,48],[40,49,42,55],[43,43,45,48],[43,49,45,55],
  [46,43,48,48],[46,49,48,55],[49,43,51,48],[49,49,51,55],[52,43,54,48],[52,49,54,55]
];

export function getSearchItems() {
  return [
    {name:'Entrada Principal',r:3,c:26}, {name:'Recepción',r:7,c:25}, {name:'Administración',r:7,c:34},
    {name:'Biblioteca',r:17,c:19}, {name:'Cafetería',r:17,c:33}, {name:'Auditorio',r:27,c:19},
    {name:'Área de Profesores',r:27,c:33}, {name:'Enfermería',r:3,c:17}, {name:'Lab. Computación',r:7,c:49},
    {name:'Lab. Electrónica',r:15,c:49}, {name:'Lab. Mecánica',r:21,c:49}, {name:'Talleres Técnicos',r:28,c:49},
    {name:'Parqueo Estudiantes',r:27,c:5}, {name:'Parqueo Personal',r:43,c:57}, {name:'Canchas Deportivas',r:5,c:49},
    {name:'Área Verde',r:5,c:5},
    ...classA.map(([r1,,r2,c2],i)=>({name:`Salón A${i+1}`, r:(r1+r2)/2, c:c2})),
    ...classB.map(([r1,,r2,c2],i)=>({name:`Salón B${i+1}`, r:(r1+r2)/2, c:c2})),
    ...classC.map(([r1,,r2,c2],i)=>({name:`Salón C${i+1}`, r:(r1+r2)/2, c:c2}))
  ];
}