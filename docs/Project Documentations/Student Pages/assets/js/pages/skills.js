
document.addEventListener('DOMContentLoaded', () => {
  if (typeof localProfileInventoryCollection === 'undefined') return;
  const esc = window.appEscapeHtml;
  const pageSize = 5;
  let page = 1;
  localProfileInventoryCollection.forEach(row => {
    if (row.competency) row.competency = String(row.competency).replace(/\s+/g, '').replace('Intermediatse', 'Intermediate');
  });
  window.dispatchGlobalFilter = dispatchGlobalFilter = function() {
    matrixSearchQueryToken = document.getElementById('skillTableSearch').value.toLowerCase().trim();
    page = 1;
    renderDynamicDGridTable();
  };
  window.renderDynamicDGridTable = renderDynamicDGridTable = function() {
    const tbody = document.getElementById('savedSkillsTableBody');
    const panel = document.querySelector('.saved-skills-panel');
    let pager = panel?.querySelector('.pagination-wrapper');
    if (!pager) {
      pager = document.createElement('div');
      pager.className = 'pagination-wrapper skills-pagination';
      panel?.appendChild(pager);
    }
    pager.className = 'pagination-wrapper skills-pagination';
    const filtered = localProfileInventoryCollection.map((row, index) => ({ row, index })).filter(({ row }) => {
      const text = [row.main, row.sub, row.skill, row.competency].join(' ').toLowerCase();
      return !matrixSearchQueryToken || text.includes(matrixSearchQueryToken);
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(Math.max(1, page), totalPages);
    const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state-message">No declared skills match the current search query.</div></td></tr>`;
    } else {
      tbody.innerHTML = rows.map(({ row, index }) => `<tr class="animated-row"><td data-label="Core Cluster">${esc(row.main)}</td><td data-label="Skill Category">${esc(row.sub)}</td><td data-label="Individual Skill">${esc(row.skill)}</td><td data-label="Competency Level">${esc(row.competency)}</td><td data-label="Action"><md-outlined-button type="button" class="button-danger-outline" onclick="dispatchDeleteRow(${index})">Remove</md-outlined-button></td></tr>`).join('');
    }
    pager.innerHTML = window.paginationHtml(filtered.length, page, pageSize, 'declared skills');
    window.bindPagination(pager, next => { page = next; renderDynamicDGridTable(); });
  };
  window.dispatchDeleteRow = dispatchDeleteRow = function(indexPosition) {
    const target = localProfileInventoryCollection[indexPosition];
    if (!target) return;
    window.showConfirmModal(`Remove ${target.skill} from your declared skills?`, { okText: 'Remove', danger: true }).then(confirmed => {
      if (!confirmed) return;
      localProfileInventoryCollection.splice(indexPosition, 1);
      renderDynamicDGridTable();
    });
  };
  const tbody = document.getElementById('savedSkillsTableBody');
  window.renderLoadingRows(tbody, 3, 'table');
  setTimeout(renderDynamicDGridTable, 300);
});
