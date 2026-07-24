(() => {
    const STORAGE_KEY = 'cv-admin-preferred-theme';
    const PAGE_SIZE = 5;
    const listState = new WeakMap();
    const tableState = new WeakMap();
    let observerSuspend = false;

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        const icon = document.querySelector('#themeToggle .material-symbols-outlined');
        if (icon) icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    function initTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        const system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(saved || system);
        if (!document.getElementById('themeToggle')) {
            const btn = document.createElement('button');
            btn.className = 'theme-toggle';
            btn.id = 'themeToggle';
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Toggle dark mode');
            btn.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
            btn.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
            document.body.prepend(btn);
            setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
    }

    function injectSkeleton() {
        if (document.getElementById('globalLoadingMask')) return;
        const mask = document.createElement('div');
        mask.id = 'globalLoadingMask';
        mask.className = 'global-loading-mask';
        mask.setAttribute('aria-hidden', 'true');
        mask.innerHTML = `
            <div class="skeleton-board">
                <div class="skeleton-card">
                    <div class="skeleton skeleton-line skeleton-line-title"></div>
                    <div class="skeleton skeleton-line skeleton-line-text"></div>
                    <div class="skeleton skeleton-line skeleton-line-short"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-table">
                        <div class="skeleton-table-row skeleton-table-header">
                            <div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div>
                        </div>
                        <div class="skeleton-table-row">
                            <div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div>
                        </div>
                        <div class="skeleton-table-row">
                            <div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div><div class="skeleton skeleton-table-cell"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(mask);
        window.setTimeout(() => mask.classList.add('hidden'), 620);
        window.setTimeout(() => mask.remove(), 980);
    }

    function ensureAlertModal() {
        if (document.getElementById('appAlertModal')) return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'appAlertModal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-window-card" style="max-width: 520px;">
                <div class="modal-header">
                    <h2 id="appAlertTitle">System Notice</h2>
                    <button type="button" class="close-modal-x" aria-label="Close modal" data-app-alert-close>
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="app-alert-content">
                    <span class="material-symbols-outlined app-alert-icon" id="appAlertIcon">info</span>
                    <p class="app-alert-message" id="appAlertMessage"></p>
                </div>
                <div class="modal-actions">
                    <md-filled-button type="button" data-app-alert-close>Acknowledge</md-filled-button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelectorAll('[data-app-alert-close]').forEach(btn => btn.addEventListener('click', () => closeModal('appAlertModal')));
    }

    window.showAppModal = function(title, message, icon = 'info') {
        ensureAlertModal();
        document.getElementById('appAlertTitle').textContent = title || 'System Notice';
        document.getElementById('appAlertMessage').textContent = message == null ? '' : String(message);
        document.getElementById('appAlertIcon').textContent = icon || 'info';
        openModal('appAlertModal');
    };

    window.alert = function(message) {
        window.showAppModal('System Notice', message, 'info');
    };

    let lastFocusedElement = null;
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        window.setTimeout(() => {
            const focusTarget = modal.querySelector('button, md-filled-button, md-outlined-button, input, select, textarea, md-outlined-text-field, [tabindex]:not([tabindex="-1"])');
            if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
        }, 80);
    };

    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('active');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            window.setTimeout(() => lastFocusedElement.focus(), 60);
        }
    };

    function closestSection(node) {
        return node.closest('section, article, .modal-window-card, main, body');
    }

    function controlValue(control) {
        if (!control) return '';
        return String(control.value || control.getAttribute('value') || '').toLowerCase().trim();
    }

    function createPaginationShell(container, type) {
        let wrapper = container.nextElementSibling;
        if (wrapper && wrapper.classList && wrapper.classList.contains('basal-control-bar')) {
            wrapper = wrapper.querySelector('.pagination-wrapper') || wrapper;
        }
        if (!wrapper || !(wrapper.classList && (wrapper.classList.contains('pagination-wrapper') || wrapper.classList.contains('pagination-auto-wrapper') || wrapper.classList.contains('basal-control-bar')))) {
            wrapper = document.createElement('div');
            wrapper.className = 'pagination-auto-wrapper';
            container.insertAdjacentElement('afterend', wrapper);
        }
        wrapper.dataset.paginationFor = type;
        wrapper.innerHTML = '<div class="pagination-info"></div><div class="pagination-controls"></div>';
        return wrapper;
    }

    function visibleBySearch(row) {
        return row.dataset.searchHidden !== 'true' && row.dataset.filterHidden !== 'true';
    }

    function refreshTable(table, resetPage = false) {
        const tbody = table.tBodies[0];
        if (!tbody) return;
        let state = tableState.get(table);
        if (!state) {
            const wrapper = table.closest('.table-responsive') || table;
            state = { page: 1, pageSize: parseInt(table.dataset.pageSize || PAGE_SIZE, 10), wrapper: createPaginationShell(wrapper, 'table') };
            tableState.set(table, state);
        }
        if (resetPage) state.page = 1;
        const rows = Array.from(tbody.rows);
        const visibleRows = rows.filter(visibleBySearch);
        const totalPages = Math.max(1, Math.ceil(visibleRows.length / state.pageSize));
        if (state.page > totalPages) state.page = totalPages;
        if (state.page < 1) state.page = 1;
        const start = (state.page - 1) * state.pageSize;
        const end = start + state.pageSize;
        observerSuspend = true;
        rows.forEach(row => { row.style.display = 'none'; });
        visibleRows.slice(start, end).forEach(row => { row.style.display = ''; });
        renderPagination(state.wrapper, state.page, totalPages, visibleRows.length, start + 1, Math.min(end, visibleRows.length), page => { state.page = page; refreshTable(table); });
        observerSuspend = false;
    }

    function renderPagination(wrapper, current, totalPages, totalItems, from, to, onChange) {
        if (!wrapper) return;
        const info = wrapper.querySelector('.pagination-info');
        const controls = wrapper.querySelector('.pagination-controls') || wrapper.querySelector('.pagination-container');
        if (totalItems <= 0) {
            if (info) info.textContent = 'No records found';
            if (controls) controls.innerHTML = '';
            return;
        }
        if (info) info.textContent = `Showing ${from} to ${to} of ${totalItems} records`;
        if (!controls) return;
        controls.innerHTML = '';
        const prev = document.createElement('button');
        prev.type = 'button'; prev.className = 'pagination-btn'; prev.textContent = 'Previous'; prev.disabled = current === 1;
        prev.addEventListener('click', () => onChange(Math.max(1, current - 1)));
        controls.appendChild(prev);
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = `pagination-btn ${i === current ? 'active' : ''}`; btn.textContent = i;
            btn.addEventListener('click', () => onChange(i));
            controls.appendChild(btn);
        }
        const next = document.createElement('button');
        next.type = 'button'; next.className = 'pagination-btn'; next.textContent = 'Next'; next.disabled = current === totalPages;
        next.addEventListener('click', () => onChange(Math.min(totalPages, current + 1)));
        controls.appendChild(next);
    }

    function initTable(table) {
        if (!table.tBodies[0] || table.tBodies[0].rows.length === 0) return;
        if (table.dataset.noAutoPagination === 'true') return;
        if (!table.dataset.pageSize) table.dataset.pageSize = PAGE_SIZE;
        refreshTable(table);
    }

    function refreshList(container, resetPage = false) {
        let state = listState.get(container);
        if (!state) {
            state = { page: 1, pageSize: parseInt(container.dataset.pageSize || PAGE_SIZE, 10), wrapper: createPaginationShell(container, 'list') };
            listState.set(container, state);
        }
        if (resetPage) state.page = 1;
        const rows = Array.from(container.children).filter(el => el.classList && el.classList.contains('data-item-row'));
        const visibleRows = rows.filter(visibleBySearch);
        const totalPages = Math.max(1, Math.ceil(visibleRows.length / state.pageSize));
        if (state.page > totalPages) state.page = totalPages;
        if (state.page < 1) state.page = 1;
        const start = (state.page - 1) * state.pageSize;
        const end = start + state.pageSize;
        observerSuspend = true;
        rows.forEach(row => { row.style.display = 'none'; });
        visibleRows.slice(start, end).forEach(row => { row.style.display = ''; });
        renderPagination(state.wrapper, state.page, totalPages, visibleRows.length, start + 1, Math.min(end, visibleRows.length), page => { state.page = page; refreshList(container); });
        observerSuspend = false;
    }

    function initList(container) {
        const count = container.querySelectorAll(':scope > .data-item-row').length;
        if (count === 0) return;
        refreshList(container);
    }

    function getSearchTargets(control) {
        const section = closestSection(control);
        const targets = [];
        if (!section) return targets;
        section.querySelectorAll('table').forEach(t => { if (t.tBodies[0] && t.tBodies[0].rows.length) targets.push({kind:'table', node:t}); });
        section.querySelectorAll('.data-matrix-container, [data-enhance-list="true"]').forEach(list => { if (list.querySelector(':scope > .data-item-row')) targets.push({kind:'list', node:list}); });
        return targets;
    }

    function applySearch(control) {
        const query = controlValue(control);
        const targets = getSearchTargets(control);
        targets.forEach(target => {
            if (target.kind === 'table') {
                const rows = Array.from(target.node.tBodies[0].rows);
                rows.forEach(row => { row.dataset.searchHidden = query && !row.textContent.toLowerCase().includes(query) ? 'true' : 'false'; });
                refreshTable(target.node, true);
            } else {
                const rows = Array.from(target.node.querySelectorAll(':scope > .data-item-row'));
                rows.forEach(row => { row.dataset.searchHidden = query && !row.textContent.toLowerCase().includes(query) ? 'true' : 'false'; });
                refreshList(target.node, true);
            }
        });
    }

    function initSearchControls() {
        const controls = Array.from(document.querySelectorAll('input[placeholder*="Search" i], md-outlined-text-field[placeholder*="Search" i], input[type="search"], [data-search-control="true"]'));
        controls.forEach(control => {
            ['input', 'change', 'keyup'].forEach(evt => control.addEventListener(evt, () => applySearch(control)));
        });
    }

    function initRegisteredStudentsControls() {
        const table = document.querySelector('title')?.textContent?.includes('Registered Students') ? document.querySelector('table') : null;
        if (!table || !table.tBodies[0]) return;
        const input = document.querySelector('.utility-row input');
        const sortSelect = document.querySelector('.sort-dropdown-select');
        const level3 = document.getElementById('filterLevel3');
        const level4 = document.getElementById('filterLevel4');
        const apply = () => {
            const query = controlValue(input);
            const activeLevel = level3?.classList.contains('active') ? 'Level 3' : (level4?.classList.contains('active') ? 'Level 4' : '');
            const rows = Array.from(table.tBodies[0].rows);
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const levelText = row.cells[3]?.textContent.trim() || '';
                row.dataset.searchHidden = query && !rowText.includes(query) ? 'true' : 'false';
                row.dataset.filterHidden = activeLevel && levelText !== activeLevel ? 'true' : 'false';
            });
            if (sortSelect) {
                const mode = sortSelect.value;
                rows.sort((a,b) => {
                    const nameA = a.cells[1]?.textContent.trim() || '';
                    const nameB = b.cells[1]?.textContent.trim() || '';
                    const gpaA = parseFloat(a.cells[4]?.textContent) || 0;
                    const gpaB = parseFloat(b.cells[4]?.textContent) || 0;
                    const idxA = a.cells[0]?.textContent.trim() || '';
                    const idxB = b.cells[0]?.textContent.trim() || '';
                    if (mode === 'gpa-high-low') return gpaB - gpaA;
                    if (mode === 'gpa-low-high') return gpaA - gpaB;
                    if (mode === 'index-order') return idxA.localeCompare(idxB);
                    return nameA.localeCompare(nameB);
                }).forEach(row => table.tBodies[0].appendChild(row));
            }
            refreshTable(table, true);
        };
        [input, sortSelect, level3, level4].filter(Boolean).forEach(el => ['input','change','click','keyup'].forEach(evt => el.addEventListener(evt, apply)));
        apply();
    }



    function initAcademicSubjectFilters() {
        const dropdown = document.getElementById('subjectDropdown');
        const search = document.getElementById('subjectSearch');
        const table = document.querySelector('#academicDetailsModal table');
        if (!dropdown || !table || !table.tBodies[0]) return;
        const apply = () => {
            const selected = String(dropdown.value || dropdown.getAttribute('value') || 'all');
            const query = controlValue(search);
            Array.from(table.tBodies[0].rows).forEach(row => {
                const code = row.cells[0]?.textContent.trim() || '';
                const text = row.textContent.toLowerCase();
                const subjectMatch = selected === 'all' || !selected || code === selected;
                const searchMatch = !query || text.includes(query);
                row.dataset.searchHidden = searchMatch ? 'false' : 'true';
                row.dataset.filterHidden = subjectMatch ? 'false' : 'true';
            });
            refreshTable(table, true);
        };
        ['input','change','keyup'].forEach(evt => search?.addEventListener(evt, apply));
        ['input','change','click'].forEach(evt => dropdown.addEventListener(evt, apply));
        apply();
    }

    function initShortlistFilters() {
        const master = document.getElementById('masterRosterTable');
        if (master) {
            const search = document.getElementById('companySearchInput');
            const companySelect = document.getElementById('companySelectorNode');
            const requestSelect = document.getElementById('requestSelectorNode');
            const applyMaster = () => {
                const textQuery = controlValue(search);
                const companyQuery = String(companySelect?.value || '');
                const roleQuery = String(requestSelect?.value || '');
                Array.from(master.querySelectorAll(':scope > .data-item-row')).forEach(row => {
                    const companyToken = row.getAttribute('data-company') || '';
                    const roleToken = row.getAttribute('data-role') || '';
                    const textPayload = row.textContent.toLowerCase();
                    const textMatch = !textQuery || textPayload.includes(textQuery);
                    const companyMatch = !companyQuery || companyToken === companyQuery;
                    const roleMatch = !roleQuery || roleToken === roleQuery;
                    row.dataset.searchHidden = textMatch ? 'false' : 'true';
                    row.dataset.filterHidden = (companyMatch && roleMatch) ? 'false' : 'true';
                });
                refreshList(master, true);
            };
            [search, companySelect, requestSelect].filter(Boolean).forEach(el => ['input','change','keyup','click'].forEach(evt => el.addEventListener(evt, applyMaster)));
            applyMaster();
        }

        const modalList = document.getElementById('modalCandidateTableBody');
        if (modalList) {
            const modalSearch = document.getElementById('modalCandidateSearch');
            const sort = document.getElementById('modalGpaSortRule');
            const applyModal = () => {
                const query = controlValue(modalSearch);
                const rows = Array.from(modalList.querySelectorAll(':scope > .data-item-row'));
                rows.forEach(row => {
                    row.dataset.searchHidden = query && !row.textContent.toLowerCase().includes(query) ? 'true' : 'false';
                    row.dataset.filterHidden = 'false';
                });
                if (sort?.value) {
                    rows.sort((a,b) => {
                        const gpaA = parseFloat(a.getAttribute('data-gpa')) || 0;
                        const gpaB = parseFloat(b.getAttribute('data-gpa')) || 0;
                        return sort.value === 'asc' ? gpaA - gpaB : gpaB - gpaA;
                    }).forEach(row => modalList.appendChild(row));
                }
                refreshList(modalList, true);
            };
            [modalSearch, sort].filter(Boolean).forEach(el => ['input','change','keyup','click'].forEach(evt => el.addEventListener(evt, applyModal)));
            applyModal();
        }
    }

    function initDropzones() {
        document.querySelectorAll('.uploader-dropzone').forEach(zone => {
            zone.addEventListener('click', () => window.showAppModal('Upload Workspace', 'Choose an official academic CSV/JSON ledger file from the secure upload dialog.', 'cloud_upload'));
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('active'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('active'));
            zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('active'); window.showAppModal('File Staged', 'The selected academic ledger file has been staged for review.', 'task_alt'); });
        });
    }

    function initOverlayClosing() {
        document.addEventListener('click', event => {
            const overlay = event.target.classList?.contains('modal-overlay') ? event.target : null;
            if (overlay && overlay.id !== 'appAlertModal') closeModal(overlay.id);
        });
        document.addEventListener('keydown', event => {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (event.key === 'Escape' && activeModal) closeModal(activeModal.id);
        });
    }

    function initCollections(root = document) {
        root.querySelectorAll('table').forEach(initTable);
        root.querySelectorAll('.data-matrix-container, [data-enhance-list="true"]').forEach(initList);
    }

    function observeDynamicContent() {
        const obs = new MutationObserver(mutations => {
            if (observerSuspend) return;
            let shouldRefresh = false;
            mutations.forEach(m => {
                if (m.addedNodes.length || m.removedNodes.length) shouldRefresh = true;
            });
            if (!shouldRefresh) return;
            window.requestAnimationFrame(() => initCollections(document));
        });
        obs.observe(document.body, {childList: true, subtree: true});
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        injectSkeleton();
        ensureAlertModal();
        initOverlayClosing();
        initDropzones();
        initCollections();
        initSearchControls();
        initRegisteredStudentsControls();
        initAcademicSubjectFilters();
        initShortlistFilters();
        observeDynamicContent();
    });
})();


/* ADMIN DESIGN MIGRATION THEME PATCH */
(function(){const AK='cv-admin-preferred-theme',SK='studentPortalDarkMode';function cur(){const s=localStorage.getItem(SK);if(s==='true')return'dark';if(s==='false')return'light';return localStorage.getItem(AK)||document.documentElement.getAttribute('data-theme')||'light'}function apply(t){const n=t==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',n);document.body.classList.toggle('dark-mode',n==='dark');localStorage.setItem(AK,n);localStorage.setItem(SK,n==='dark'?'true':'false');const b=document.getElementById('themeToggle');if(b){b.innerHTML='<span class="material-symbols-outlined">'+(n==='dark'?'light_mode':'dark_mode')+'</span><span>'+(n==='dark'?'Light Mode':'Dark Mode')+'</span>';b.setAttribute('aria-label',n==='dark'?'Switch to light mode':'Switch to dark mode')}}document.addEventListener('DOMContentLoaded',function(){apply(cur());const b=document.getElementById('themeToggle');if(b&&!b.dataset.adminDesignThemeBound){b.dataset.adminDesignThemeBound='true';b.addEventListener('click',function(){apply(document.body.classList.contains('dark-mode')?'light':'dark')})}});window.applyStoredTheme=window.applyStoredTheme||function(){apply(cur())};window.toggleThemeMode=window.toggleThemeMode||function(){apply(document.body.classList.contains('dark-mode')?'light':'dark')};window.updateThemeButton=window.updateThemeButton||function(){apply(cur())}})();
