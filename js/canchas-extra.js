const CELL = 24;
const COLS = 34;
const ROWS = 46;
const W = COLS * CELL;
const H = ROWS * CELL;

const T = {
    C20: 0, C21: 1, C22: 2,
    C23: 10, C24: 11, C25: 12,
    C26: 20, C27: 21, C28: 22,
    C29: 23, BATH: 30, PASILLO: 40,
    ENTRADA:41
}

const COLORS = {
    [T.C20]:   '#f0ede6',
    [T.C21]:   '#ebebeb',
    [T.C22]:   '#d0c8b8',
    [T.C23]:  '#c8dce8',
    [T.C24]:  '#c8dce8',
    [T.C25]:  '#c8dce8',
    [T.C26]:    '#d8d0e8',
    [T.C27]:    '#d8d0e8',
    [T.C28]:  '#c8dce8',
    [T.C29]:  '#c8dce8',
    [T.BATH]:   '#f0dcc8',
    [T.PASILLO]: '#e8e8c8',
    [T.ENTRADA]: '#e8d8c8',
}

const STROKE = {
    [T.C20]: '#a88060', [T.C21]: '#d0cfc8', [T.C22]: '#b8b0a0',
    [T.C23]:'#7a9cb8',[T.C24]:'#7a9cb8',[T.C25]:'#7a9cb8',
    [T.C26]:'#8a80a8',[T.C27]:'#8a80a8',[T.C28]:'#7a9cb8',[T.C29]:'#7a9cb8',
    [T.BATH]:'#b89060', [T.PASILLO]: '#909040', [T.ENTRADA]: '#c0926c',
}

const grid = Array.from({length:ROWS}, () => new Array(COLS).fill(0));

function fill(r1, c1, r2, c2, type){
    for (let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) grid[r][c]=type;
}

fill(0,0, ROWS -1, COLS -1, T.ENTRADA);

fill(10, 0, 11, COLS -1, T.PASILLO);
fill(32, 0, 33, COLS -1, T.PASILLO);
fill(0, 10, ROWS -1, 11, T.PASILLO);
fill(0, 40, ROWS -1, 41, T.PASILLO);
fill(22, 0, 23, COLS -1, T.PASILLO);
fill(0, 26, ROWS -1, 27, T.PASILLO);


fill(2,24,5,29,T.C20);

fill(6,22,9,29,T.C21);

fill(6,30,9,38,T.C22);

fill(13,13,21,25,T.C23);

fill(13,28,21,38,T.C24);

fill(24,13,31,25,T.C25);

fill(24,28,31,38,T.C26);

fill(2,13,5,22,T.C27);

fill(24,2,31,8,T.C28);
fill(13,43,18,55,T.C29);
fill(19,43,24,55,T.BATH);

const labels = [];
function lbl(r,c,text,size,bold){
    labels.push({r,c,text,size:size||10,bold:bold||false});
}

lbl(3.5,26,'ENTRADA',9,true);
lbl(3.5,26.5,'BAÑOS',8);
lbl(7.5,25,'C20',10,true);
lbl(7.5,34,'C21',10,true);
lbl(17,19,'C22',11,true);
lbl(17,33,'C23',11,true);
lbl(27.5,19,'C24',11,true);
lbl(27.5,33,'C25',10,true);
lbl(28.5,33,'C26',10);
lbl(3.5,17,'C27',9,true);
lbl(7.5,49,'C28',10,true);
lbl(15.5,49,'C29',10,true);


lbl(10.5,30,'PASILLO',9);
lbl(32.5,30,'PASILLO SECUNDARIO',9);
lbl(5,20,'CALLE NORTE',8);
lbl(5,13,'C. OESTE',8);

const searchItems = [
    {name:'C20',r:42,c:26},
    {name:'C21',r:34,c:26},
    {name:'C22',r:34,c:6},
    {name:'C23',r:26,c:26},
    {name:'C24',r:26,c:6},
    {name:'C25',r:18,c:27},
    {name:'C26',r:12,c:6},
    {name:'C27',r:12,c:26},
    {name:'C28',r:4,c:6},
    {name:'C29',r:4,c:26},
    {name:'Baño',r:18,c:4},
    {name:'Gradas',r:42,c:8}
];

// Config terminado -----------


class MapModel {
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
        //this.fill(16,0,21,20,T.ENTRADA);

        // Pasillo principal
        this.fill(0,15,36,18,T.PASILLO);

        // Pasillo horizontal
        this.fill(0,0,ROWS-1,COLS-1,T.PASILLO);

        // Salones superiores
        this.fill(0,0,7,11,T.C28);
        this.fill(0,19,7,33,T.C29);

        this.fill(8,0,15,11,T.C26);
        this.fill(8,19,15,33,T.C27);

        // Zona media
        this.fill(16,22,21,33,T.C25);
        this.fill(16,0,21,6,T.BATH);

        // Salones inferiores
        this.fill(22,0,29,11,T.C24);
        this.fill(22,19,29,33,T.C23);

        this.fill(30,0,37,11,T.C22);
        this.fill(30,19,37,33,T.C21);

        // Parte inferior
        this.fill(38,3,43,8,T.ENTRADA);
        this.fill(39,19,45,30,T.C20);
    }

    initLabels() {
        this.lbl(4,6,'C28',18,true);
        this.lbl(4,26,'C29',18,true);

        this.lbl(12,6,'C26',18,true);
        this.lbl(12,26,'C27',18,true);

        this.lbl(18,4,'Baño',18,true);
        this.lbl(18,27,'C25',18,true);

        this.lbl(26,6,'C24',18,true);
        this.lbl(26,26,'C23',18,true);

        this.lbl(34,6,'C22',18,true);
        this.lbl(34,26,'C21',18,true);

        this.lbl(18,17,'Pasillo',18,true);

        this.lbl(42,8,'Gradas',12,true);

        this.lbl(42,26,'C20',18,true);
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
}


// Model IMPLEMENTADO....


class MapView {
    constructor() {
        this.canvas = document.getElementById('map');
        this.ctx = this.canvas.getContext('2d');
        this.wrap = document.getElementById('map-canvas-wrap');
        this.mapWrap = document.getElementById('map-wrap');
        this.entryPanel = document.getElementById('entry-panel');

        this.canvas.width = W;
        this.canvas.height = H;

        this.scale = 1.2;
        this.tx = 0;
        this.ty = 0;
    }

    applyTransform() {
        this.wrap.style.transform = `translate(${this.tx}px,${this.ty}px) scale(${this.scale})`;
        document.getElementById('sb-zoom').textContent = Math.round(this.scale * 100) + '%';
        this.updateScaleBar();
    }
    
    updateScaleBar() {
        const pxFor50m = (50 / 5) * CELL * this.scale;
        document.getElementById('scale-line').style.width = Math.min(120, Math.max(40, pxFor50m)) + 'px';
    }
    
    centerMap() {
        this.tx = (this.mapWrap.clientWidth - W * this.scale) / 2;
        this.ty = (this.mapWrap.clientHeight - H * this.scale) / 2;
        this.applyTransform();
    }

    render(model) {
        this.ctx.clearRect(0, 0, W, H);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, W, H);
    
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = model.grid[r][c];
                if (t === 0) continue; 
                this.ctx.fillStyle = COLORS[t] || '#f0ede6';
                this.ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
            }
        }
    
        // Bordes Estructurales
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = model.grid[r][c];
                if (t === 0) continue;
                const s = STROKE[t];
                if (!s) continue;
                this.ctx.strokeStyle = s;
                this.ctx.lineWidth = 1;
    
                if (c === 0 || model.grid[r][c - 1] !== t) {
                    this.ctx.beginPath(); this.ctx.moveTo(c * CELL, r * CELL); this.ctx.lineTo(c * CELL, (r + 1) * CELL); this.ctx.stroke();
                }
                if (c === COLS - 1 || model.grid[r][c + 1] !== t) {
                    this.ctx.beginPath(); this.ctx.moveTo((c + 1) * CELL, r * CELL); this.ctx.lineTo((c + 1) * CELL, (r + 1) * CELL); this.ctx.stroke();
                }
                if (r === 0 || model.grid[r - 1][c] !== t) {
                    this.ctx.beginPath(); this.ctx.moveTo(c * CELL, r * CELL); this.ctx.lineTo((c + 1) * CELL, r * CELL); this.ctx.stroke();
                }
                if (r === ROWS - 1 || model.grid[r + 1][c] !== t) {
                    this.ctx.beginPath(); this.ctx.moveTo(c * CELL, (r + 1) * CELL); this.ctx.lineTo((c + 1) * CELL, (r + 1) * CELL); this.ctx.stroke();
                }
            }
        }
    
        if (model.calculatedRoute && model.calculatedRoute.length > 1) {
            this.ctx.strokeStyle = '#c0392b';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            model.calculatedRoute.forEach((node, i) => {
                const x = node.c * CELL + CELL / 2;
                const y = node.r * CELL + CELL / 2;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            });
            this.ctx.stroke();
        }
    
        if (model.originNode) this.drawPin(model.originNode.c * CELL + CELL / 2, model.originNode.r * CELL + CELL / 2, '#27ae60');
        if (model.destNode) this.drawPin(model.destNode.c * CELL + CELL / 2, model.destNode.r * CELL + CELL / 2, '#c0392b');
    
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        model.labels.forEach(l => {
            this.ctx.font = `${l.bold ? '600' : '400'} ${l.size}px 'IBM Plex Mono', monospace`;
            this.ctx.fillStyle = '#1a1612';
            this.ctx.fillText(l.text, l.c * CELL, l.r * CELL);
        });
    }

    drawPin(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath(); this.ctx.arc(x, y, 6, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
    }

    toggleEntryPanel() {
        this.entryPanel.classList.toggle('visible');
    }

    closeEntryPanel() {
        this.entryPanel.classList.remove('visible');
    }

    updateSidebarUI(model) {
        const origEl = document.getElementById('origin-name');
        const destEl = document.getElementById('dest-name');
        const btnCalc = document.getElementById('calc-route-btn');

        if (model.originNode) {
            origEl.textContent = `Fila ${model.originNode.r}, Col ${model.originNode.c}`;
            origEl.classList.add('set');
        } else {
            origEl.textContent = 'Sin seleccionar';
            origEl.classList.remove('set');
        }

        if (model.destNode) {
            destEl.textContent = `Fila ${model.destNode.r}, Col ${model.destNode.c}`;
            destEl.classList.add('set');
        } else {
            destEl.textContent = 'Sin seleccionar';
            destEl.classList.remove('set');
        }
        btnCalc.disabled = !(model.originNode && model.destNode);
    }
}

// View implementado....


class MapController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentMode = 'view'; 
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.searchItems = searchItems;
    }

    init() {
        this.registerEvents();
        this.view.centerMap();
        this.view.render(this.model);
    }

    registerEvents() {
        document.getElementById('btn-view').addEventListener('click', () => this.setMode('view'));
        document.getElementById('btn-origin').addEventListener('click', () => this.setMode('origin'));
        document.getElementById('btn-dest').addEventListener('click', () => this.setMode('dest'));
    
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.model.clearRoute();
            this.view.updateSidebarUI(this.model);
            document.getElementById('route-info').textContent = '';
            this.view.render(this.model);
        });
    
        document.getElementById('calc-route-btn').addEventListener('click', () => {
            const route = this.model.findRoute();
            const infoEl = document.getElementById('route-info');
            if (route) {
                infoEl.textContent = `Distancia: ~${route.length * 5} metros (${route.length} celdas)`;
            } else {
            infoEl.textContent = 'No se encontró una ruta viable.';
            }
            this.view.render(this.model);
        });
        

        this.view.mapWrap.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = this.view.mapWrap.getBoundingClientRect();

            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const oldScale = this.view.scale;
            const factor = e.deltaY < 0 ? 1.12 : 0.89;
            const newScale = Math.min(4,Math.max(0.3, oldScale * factor));

            this.view.tx =
                mx - (mx - this.view.tx) * (newScale / oldScale);

            this.view.ty =
                my - (my - this.view.ty) * (newScale / oldScale);

            this.view.scale = newScale;

            this.view.applyTransform();

        }, { passive:false });


        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomAtCenter(1.2);
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomAtCenter(0.8);
        });

        document.getElementById('ver-entrada-btn').addEventListener('click', () => this.view.toggleEntryPanel());
        document.getElementById('entry-close').addEventListener('click', () => this.view.closeEntryPanel());
    
        document.getElementById('entry-go-btn').addEventListener('click', () => {
            this.model.originNode = { r: 3, c: 26 }; // Coordenadas fijas de la entrada principal
            this.view.updateSidebarUI(this.model);
            this.view.closeEntryPanel();
            this.view.render(this.model);
        });
    
        // Eventos de Arrastre (Pan)
        const wrap = this.view.mapWrap;
        wrap.addEventListener('mousedown', (e) => {
            if (e.target.closest('.zoom-btn') || e.target.closest('#ver-entrada-btn') || e.target.closest('#entry-panel')) return;
            this.isDragging = true;
            wrap.classList.add('grabbing');
            this.startX = e.clientX - this.view.tx;
            this.startY = e.clientY - this.view.ty;
        });
    
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.view.tx = e.clientX - this.startX;
            this.view.ty = e.clientY - this.startY;
            this.view.applyTransform();
        });
    
        window.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            wrap.classList.remove('grabbing');
        });
    
        // Click sobre celdas del Canvas
        this.view.canvas.addEventListener('click', (e) => {
            const rect = this.view.canvas.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / this.view.scale;
            const clickY = (e.clientY - rect.top) / this.view.scale;
            const c = Math.floor(clickX / CELL);
            const r = Math.floor(clickY / CELL);
    
            if (r >= 0 && r < this.model.grid.length && c >= 0 && c < this.model.grid[0].length) {
                this.handleGridClick(r, c);
            }
        });
    
        // Buscador
        document.getElementById('search-btn').addEventListener('click', () => this.executeSearch());
        document.getElementById('search-peticion').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.executeSearch(); });
    }

    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        if (mode === 'view') document.getElementById('btn-view').classList.add('active');
        if (mode === 'origin') document.getElementById('btn-origin').classList.add('active');
        if (mode === 'dest') document.getElementById('btn-dest').classList.add('active');
    }

    handleGridClick(r, c) {
        const typeName = this.model.getCellName(r, c);
        document.getElementById('cx').textContent = c;
        document.getElementById('cy').textContent = r;
        document.getElementById('czone').textContent = typeName;
        document.getElementById('sb-sel').innerHTML = `SELECCIÓN: <span>Fila ${r}, Col ${c} (${typeName})</span>`;

        if (this.currentMode === 'origin') {
            this.model.originNode = { r, c };
            this.view.updateSidebarUI(this.model);
            this.setMode('view');
        } else if (this.currentMode === 'dest') {
            this.model.destNode = { r, c };
            this.view.updateSidebarUI(this.model);
            this.setMode('view');
        }
        this.view.render(this.model);
    }

    executeSearch() {
        const query = document.getElementById('search-peticion').value.trim().toLowerCase();
        if (!query) return;

        const match = this.searchItems.find(item => item.name.toLowerCase().includes(query));
        if (match) {
            this.focusOnCell(match.r, match.c);
            this.handleGridClick(Math.floor(match.r), Math.floor(match.c));
        } else {
            alert('No se encontró ningún elemento coincidente en el campus.');
        }
    }

    focusOnCell(r, c) {
        const mw = this.view.mapWrap.clientWidth;
        const mh = this.view.mapWrap.clientHeight;
        this.view.scale = 1.5; 
        this.view.tx = mw / 2 - (c * CELL) * this.view.scale;
        this.view.ty = mh / 2 - (r * CELL) * this.view.scale;
        this.view.applyTransform();
    }

    zoomAtCenter(factor) {
        const oldScale = this.view.scale;

        const newScale = Math.min(
            4,
            Math.max(0.3, oldScale * factor)
        );

        const cx = this.view.mapWrap.clientWidth / 2;
        const cy = this.view.mapWrap.clientHeight / 2;

        this.view.tx = cx - (cx - this.view.tx) * (newScale / oldScale);
        this.view.ty = cy - (cy - this.view.ty) * (newScale / oldScale);

        this.view.scale = newScale;

        this.view.applyTransform();
    }
}

// Controller implementado....