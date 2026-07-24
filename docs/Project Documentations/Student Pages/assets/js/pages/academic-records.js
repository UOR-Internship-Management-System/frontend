document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('.results-section-card tbody');
  const search = document.querySelector('.results-section-card md-outlined-text-field');
  const pager = document.querySelector('.pagination-container');
  if (!tbody || !pager) return;
  const pageSize = 5;
  let page = 1;
  let query = '';
  const records = [
    ['CSC3112','Front-end Developer','3','A','3.0'],
    ['CSC3112','Programming Fundamentals','3','A+','3.7'],
    ['CSC3112','Web Technologies','4','B','2.7'],
    ['CSC3122','Database Management Systems','3','A','3.0'],
    ['CSC3132','Software Engineering','3','A+','3.7'],
    ['CSC3142','Data Structures and Algorithms','4','B+','3.3'],
    ['CSC3152','Computer Networks','3','A','3.0'],
    ['CSC3162','Operating Systems','3','B','2.7'],
    ['CSC3172','Human Computer Interaction','2','A+','3.7'],
    ['CSC3182','Object Oriented Programming','3','A','3.0'],
    ['CSC3192','Machine Learning Foundations','3','B+','3.3'],
    ['CSC3202','Professional Practice','2','A','3.0'],
    ['CSC3212','Research Methodology','2','A+','3.7']
  ];
  search?.addEventListener('input', () => { query = (search.value || '').toLowerCase().trim(); page = 1; render(); });
  function render() {
    const filtered = records.filter(row => !query || row.join(' ').toLowerCase().includes(query));
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(Math.max(1, page), totalPages);
    const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state-message">No records found.</div></td></tr>`;
    } else {
      const labels = ['Subject Code','Subject Name','Credits','Grade','Grade Point'];
      tbody.innerHTML = rows.map(row => `<tr>${row.map((cell, index) => `<td data-label="${labels[index]}">${window.appEscapeHtml(cell)}</td>`).join('')}</tr>`).join('');
    }
    pager.className = 'pagination-wrapper records-pagination';
    pager.innerHTML = window.paginationHtml(filtered.length, page, pageSize, 'records');
    window.bindPagination(pager, next => { page = next; render(); });
  }
  window.renderLoadingRows(tbody, 4, 'table');
  setTimeout(render, 400);
});
