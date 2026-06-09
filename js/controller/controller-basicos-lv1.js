import { MAP_CONFIG } from '../config/config-basicos-lv1.js';

export class MapController {
    constructor(model, view, searchItems) {
        this.model = model;
        this.view = view;
        this.searchItems = searchItems;
        this.currentMode = 'view';
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
    }

    init() {
        this.registerEvents();
        this.view.centerMap();
        this.view.render(this.model);
    }

    registerEvents() {
        this.registerModeButtons();
        this.registerControlButtons();
        this.registerZoomEvents();
        this.registerDragEvents();
        this.registerCanvasClick();
        this.registerSearchEvents();
        this.registerResizeEvent();
    }

    registerModeButtons() {
        const btnView = document.getElementById('btn-view');
        const btnOrigin = document.getElementById('btn-origin');
        const btnDest = document.getElementById('btn-dest');

        if (btnView) btnView.addEventListener('click', () => this.setMode('view'));
        if (btnOrigin) btnOrigin.addEventListener('click', () => this.setMode('origin'));
        if (btnDest) btnDest.addEventListener('click', () => this.setMode('dest'));
    }

    registerControlButtons() {
        const clearBtn = document.getElementById('clear-btn');
        const calcBtn = document.getElementById('calc-route-btn');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.model.clearRoute();
                this.updateUI();
                this.view.render(this.model);
            });
        }

        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                const route = this.model.findRoute();
                const infoEl = document.getElementById('route-info');
                if (infoEl) {
                    if (route) {
                        const distancia = this.model.getRouteDistance();
                        infoEl.textContent = `Distancia: ${distancia.toFixed(1)} metros (${route.length - 1} celdas)`;
                    } else {
                        infoEl.textContent = 'No se encontró una ruta viable.';
                    }
                }
                this.view.render(this.model);
            });
        }
    }

    registerZoomEvents() {
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');

        if (zoomIn) zoomIn.addEventListener('click', () => this.zoomAtCenter(MAP_CONFIG.ZOOM.FACTOR_IN));
        if (zoomOut) zoomOut.addEventListener('click', () => this.zoomAtCenter(MAP_CONFIG.ZOOM.FACTOR_OUT));

        this.view.mapWrap.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.view.mapWrap.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const oldScale = this.view.scale;
            const factor = e.deltaY < 0 ? MAP_CONFIG.ZOOM.FACTOR_IN : MAP_CONFIG.ZOOM.FACTOR_OUT;
            const newScale = Math.min(MAP_CONFIG.ZOOM.MAX, Math.max(MAP_CONFIG.ZOOM.MIN, oldScale * factor));

            this.view.tx = mx - (mx - this.view.tx) * (newScale / oldScale);
            this.view.ty = my - (my - this.view.ty) * (newScale / oldScale);
            this.view.scale = newScale;
            this.view.applyTransform();
        }, { passive: false });
    }

    registerDragEvents() {
        const wrap = this.view.mapWrap;

        wrap.addEventListener('mousedown', (e) => {
            if (e.target.closest('.zoom-btn')) return;
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
    }

    registerCanvasClick() {
        this.view.canvas.addEventListener('click', (e) => {
            const rect = this.view.canvas.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / this.view.scale;
            const clickY = (e.clientY - rect.top) / this.view.scale;
            const c = Math.floor(clickX / MAP_CONFIG.CELL_SIZE);
            const r = Math.floor(clickY / MAP_CONFIG.CELL_SIZE);

            if (r >= 0 && r < MAP_CONFIG.ROWS && c >= 0 && c < MAP_CONFIG.COLS) {
                this.handleGridClick(r, c);
            }
        });
    }

    registerSearchEvents() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-peticion');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.executeSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.executeSearch();
            });
        }
    }

    registerResizeEvent() {
        window.addEventListener('resize', () => {
            this.view.centerMap();
            this.view.render(this.model);
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        
        const activeBtn = document.getElementById(`btn-${mode}`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    handleGridClick(r, c) {
        const typeName = this.model.getCellName(r, c);
        this.updateSelectionDisplay(r, c, typeName);

        if (this.currentMode === 'origin') {
            this.model.setOrigin(r, c);
            this.updateUI();
            this.setMode('view');
        } else if (this.currentMode === 'dest') {
            this.model.setDestination(r, c);
            this.updateUI();
            this.setMode('view');
        }
        
        this.view.render(this.model);
    }

    updateSelectionDisplay(r, c, typeName) {
        const cxEl = document.getElementById('cx');
        const cyEl = document.getElementById('cy');
        const czoneEl = document.getElementById('czone');
        const sbSel = document.getElementById('sb-sel');

        if (cxEl) cxEl.textContent = c;
        if (cyEl) cyEl.textContent = r;
        if (czoneEl) czoneEl.textContent = typeName;
        if (sbSel) sbSel.innerHTML = `SELECCIÓN: <span>Fila ${r}, Col ${c} (${typeName})</span>`;
    }

    updateUI() {
        const originEl = document.getElementById('origin-name');
        const destEl = document.getElementById('dest-name');
        const calcBtn = document.getElementById('calc-route-btn');
        const routeInfo = document.getElementById('route-info');

        this.view.updateSidebarUI(this.model, originEl, destEl, calcBtn, routeInfo);
    }

    executeSearch() {
        const query = document.getElementById('search-peticion')?.value.trim().toLowerCase();
        if (!query) return;

        const match = this.searchItems.find(item => item.name.toLowerCase().includes(query));
        if (match) {
            this.focusOnCell(match.r, match.c);
            this.handleGridClick(Math.floor(match.r), Math.floor(match.c));
        } else {
            alert('No se encontró ningún elemento coincidente.');
        }
    }

    focusOnCell(r, c) {
        const mw = this.view.mapWrap.clientWidth;
        const mh = this.view.mapWrap.clientHeight;
        this.view.scale = 1.8;
        this.view.tx = mw / 2 - (c * MAP_CONFIG.CELL_SIZE) * this.view.scale;
        this.view.ty = mh / 2 - (r * MAP_CONFIG.CELL_SIZE) * this.view.scale;
        this.view.applyTransform();
    }

    zoomAtCenter(factor) {
        const oldScale = this.view.scale;
        const newScale = Math.min(MAP_CONFIG.ZOOM.MAX, Math.max(MAP_CONFIG.ZOOM.MIN, oldScale * factor));
        const cx = this.view.mapWrap.clientWidth / 2;
        const cy = this.view.mapWrap.clientHeight / 2;

        this.view.tx = cx - (cx - this.view.tx) * (newScale / oldScale);
        this.view.ty = cy - (cy - this.view.ty) * (newScale / oldScale);
        this.view.scale = newScale;
        this.view.applyTransform();
    }
}