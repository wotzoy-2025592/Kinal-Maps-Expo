import { CELL, getSearchItems } from './config.js';

export class MapController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.currentMode = 'view'; 
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.searchItems = getSearchItems();
  }

  init() {
    this.view.centerMap();
    this.view.render(this.model);
    this.registerEvents();
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

    document.getElementById('zoom-in').addEventListener('click', () => { this.view.scale += 0.1; this.view.applyTransform(); });
    document.getElementById('zoom-out').addEventListener('click', () => { if(this.view.scale > 0.5) { this.view.scale -= 0.1; this.view.applyTransform(); } });

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
    document.getElementById('search-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.executeSearch(); });
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
    const query = document.getElementById('search-input').value.trim().toLowerCase();
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
}