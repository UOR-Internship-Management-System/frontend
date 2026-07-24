document.addEventListener('DOMContentLoaded', () => {
  if (typeof profileState === 'undefined') return;
  const esc = window.appEscapeHtml;
  const pageSize = 4;
  const pages = { certificates: 1, awards: 1, activities: 1, experiences: 1 };
  const filters = { certificates: '', awards: '', activities: '', experiences: '' };
  if (!profileState.certificates.length) {
    profileState.certificates.push(
      { id:'cert-a1', name:'Oracle Certified Professional', authority:'Oracle', year:'2025', url:'https://credential-link.com/verify', fileName:'oracle-certificate.pdf', includeCv:true },
      { id:'cert-a2', name:'Cisco Certified Network Associate', authority:'Cisco', year:'2024', url:'https://credential-link.com/verify', fileName:'ccna-certificate.pdf', includeCv:true },
      { id:'cert-a3', name:'AWS Cloud Practitioner', authority:'Amazon Web Services', year:'2025', url:'https://credential-link.com/verify', fileName:'aws-certificate.pdf', includeCv:true },
      { id:'cert-a4', name:'Microsoft Azure Fundamentals', authority:'Microsoft', year:'2024', url:'https://credential-link.com/verify', fileName:'azure-certificate.pdf', includeCv:false },
      { id:'cert-a5', name:'ISTQB Foundation Level', authority:'ISTQB', year:'2025', url:'https://credential-link.com/verify', fileName:'istqb-certificate.pdf', includeCv:true },
      { id:'cert-a6', name:'Google Data Analytics Certificate', authority:'Google', year:'2024', url:'https://credential-link.com/verify', fileName:'google-data-analytics.pdf', includeCv:false },
      { id:'cert-a7', name:'Flutter Development Certificate', authority:'Udemy', year:'2025', url:'https://credential-link.com/verify', fileName:'flutter-certificate.pdf', includeCv:true }
    );
  }
  if (!profileState.awards.length) {
    profileState.awards.push(
      { id:'award-a1', title:'Best Innovative Project', institution:'University of Ruhuna', date:'October 2025', includeCv:true },
      { id:'award-a2', title:'Inter-University Hackathon Runner Up', institution:'IIT Sri Lanka', date:'December 2025', includeCv:true },
      { id:'award-a3', title:'Dean List Recognition', institution:'Faculty of Science', date:'March 2025', includeCv:true },
      { id:'award-a4', title:'Software Engineering Mini Project Award', institution:'Department of Computer Science', date:'July 2024', includeCv:false },
      { id:'award-a5', title:'Academic Presentation Merit', institution:'University Research Forum', date:'November 2024', includeCv:true },
      { id:'award-a6', title:'Community Technology Volunteer Recognition', institution:'Tech Society', date:'January 2025', includeCv:false }
    );
  }
  if (!profileState.activities.length) {
    profileState.activities.push(
      { id:'activity-a1', organization:'Computer Science Society', role:'Committee Member', description:'Coordinated programmatic duties and local technology event setup workflows.', includeCv:true },
      { id:'activity-a2', organization:'IEEE Student Branch', role:'Volunteer', description:'Supported technical session planning and registration operations.', includeCv:true },
      { id:'activity-a3', organization:'University Coding Club', role:'Mentor', description:'Guided junior students through beginner programming workshops.', includeCv:true },
      { id:'activity-a4', organization:'Faculty Media Unit', role:'Technical Assistant', description:'Maintained digital media assets for faculty events.', includeCv:false },
      { id:'activity-a5', organization:'Robotics Circle', role:'Member', description:'Participated in embedded systems prototyping activities.', includeCv:true },
      { id:'activity-a6', organization:'University Athletics Association', role:'Track Team Member', description:'Participated in regional university sporting meets.', includeCv:false }
    );
  }
  if (!profileState.experiences.length) {
    profileState.experiences.push(
      { id:'exp-a1', jobTitle:'Associate Software Engineer Intern', company:'Virtusa', location:'Colombo, Western Province', startDate:'January 2025', endDate:'June 2025', duties:'Supported backend API testing workflows and frontend component documentation.', includeCv:true },
      { id:'exp-a2', jobTitle:'Freelance Frontend Web Developer', company:'Fiverr Ecosystem', location:'Remote', startDate:'2023', endDate:'2024', duties:'Developed responsive minimalist component frameworks utilizing custom CSS properties.', includeCv:true },
      { id:'exp-a3', jobTitle:'Student Research Assistant', company:'Department Laboratory', location:'Matara', startDate:'February 2025', endDate:'Present', duties:'Prepared structured datasets and maintained experiment tracking logs.', includeCv:false },
      { id:'exp-a4', jobTitle:'Retail Community Pharmacy Assistant', company:'Retail Pharmacy Body', location:'Matara, Sri Lanka', startDate:'2024', endDate:'Present', duties:'Managed prescription tracking workflows with structured verification controls.', includeCv:true },
      { id:'exp-a5', jobTitle:'Junior QA Trainee', company:'Local Software Studio', location:'Hybrid', startDate:'August 2024', endDate:'December 2024', duties:'Executed test cases and documented defect reproduction steps.', includeCv:true }
    );
  }
  function addFilter(section, placeholder) {
    const list = document.getElementById(section === 'experiences' ? 'experienceList' : `${section}List`);
    const sectionCard = list?.closest('.profile-section-card, .work-experience-trigger-wrapper');
    if (!sectionCard || sectionCard.querySelector(`[data-profile-filter="${section}"]`)) return;
    const wrap = document.createElement('div');
    wrap.className = 'toolbar-row';
    wrap.innerHTML = `<div class="toolbar-search"><md-outlined-text-field type="text" label="${placeholder}" data-profile-filter="${section}"><span slot="leading-icon" class="material-symbols-outlined">search</span></md-outlined-text-field></div>`;
    list.parentElement.insertBefore(wrap, list);
    wrap.querySelector('md-outlined-text-field').addEventListener('input', (e) => { filters[section] = (e.target.value || '').toLowerCase().trim(); pages[section] = 1; renderSection(section); });
  }
  function actionButtons(section, absoluteIndex, label) {
    const editFn = { certificates:'editCertificateEntry', awards:'editAwardEntry', activities:'editActivityEntry', experiences:'editExperienceEntry' }[section];
    return `<div class="saved-entry-actions row-actions-group"><md-outlined-button type="button" onclick="${editFn}(${absoluteIndex})">Edit</md-outlined-button><md-outlined-button type="button" class="button-danger-outline" onclick="requestDeleteEntry('${section}', ${absoluteIndex}, '${label}')">Remove</md-outlined-button></div>`;
  }
  function renderItems(section, item, absoluteIndex) {
    if (section === 'certificates') return `<div class="saved-entry-card"><div class="saved-entry-content"><div class="saved-entry-title">${esc(item.name)}</div><div class="saved-entry-meta">${esc([item.authority, item.year].filter(Boolean).join(' • ')) || 'No issuing details added'}</div>${item.url ? `<div class="saved-entry-meta">Credential URL: ${esc(item.url)}</div>` : ''}${item.fileName ? `<div class="saved-entry-file">Attached File: ${esc(item.fileName)}</div>` : ''}<span class="cv-status-pill">${item.includeCv ? 'Included in CV' : 'Not included in CV'}</span></div>${actionButtons(section, absoluteIndex, 'Certificate')}</div>`;
    if (section === 'awards') return `<div class="saved-entry-card"><div class="saved-entry-content"><div class="saved-entry-title">${esc(item.title)}</div><div class="saved-entry-meta">${esc([item.institution, item.date].filter(Boolean).join(' • ')) || 'No awarding details added'}</div><span class="cv-status-pill">${item.includeCv ? 'Included in CV' : 'Not included in CV'}</span></div>${actionButtons(section, absoluteIndex, 'Award')}</div>`;
    if (section === 'activities') return `<div class="saved-entry-card"><div class="saved-entry-content"><div class="saved-entry-title">${esc(item.organization)}</div><div class="saved-entry-meta">${esc(item.role) || 'No role added'}</div>${item.description ? `<div class="saved-entry-description">${esc(item.description)}</div>` : ''}<span class="cv-status-pill">${item.includeCv ? 'Included in CV' : 'Not included in CV'}</span></div>${actionButtons(section, absoluteIndex, 'Activity')}</div>`;
    return `<div class="saved-entry-card"><div class="saved-entry-content"><div class="saved-entry-title">${esc(item.jobTitle)}</div><div class="saved-entry-meta">${esc([item.company, item.location].filter(Boolean).join(' • ')) || 'No company details added'}</div><div class="saved-entry-meta">${esc([item.startDate, item.endDate].filter(Boolean).join(' - ')) || 'No duration added'}</div>${item.duties ? `<div class="saved-entry-description">${esc(item.duties)}</div>` : ''}<span class="cv-status-pill">${item.includeCv ? 'Included in CV' : 'Not included in CV'}</span></div>${actionButtons(section, absoluteIndex, 'Experience')}</div>`;
  }
  function renderSection(section) {
    const list = document.getElementById(section === 'experiences' ? 'experienceList' : `${section}List`);
    if (!list) return;
    const raw = profileState[section].map((item, index) => ({ item, index }));
    const q = filters[section];
    const filtered = raw.filter(({ item }) => !q || Object.values(item).join(' ').toLowerCase().includes(q));
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    pages[section] = Math.min(Math.max(1, pages[section]), totalPages);
    const start = (pages[section] - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);
    const labels = { certificates:'certificates', awards:'awards or achievements', activities:'extracurricular activities', experiences:'professional experience' };
    if (!pageRows.length) {
      list.innerHTML = `<div class="empty-list-message">No ${labels[section]} added yet.</div>`;
    } else {
      list.innerHTML = pageRows.map(({ item, index }) => renderItems(section, item, index)).join('');
    }
    let pager = list.parentElement.querySelector(`[data-profile-pager="${section}"]`);
    if (!pager) { pager = document.createElement('div'); pager.className = `pagination-wrapper profile-pagination profile-pagination-${section}`; pager.dataset.profilePager = section; list.parentElement.appendChild(pager); }
    pager.innerHTML = window.paginationHtml(filtered.length, pages[section], pageSize, labels[section]);
    window.bindPagination(pager, next => { pages[section] = next; renderSection(section); });
  }
  const originals = { renderCertificatesList, renderAwardsList, renderActivitiesList, renderExperienceList };
  window.renderCertificatesList = renderCertificatesList = () => renderSection('certificates');
  window.renderAwardsList = renderAwardsList = () => renderSection('awards');
  window.renderActivitiesList = renderActivitiesList = () => renderSection('activities');
  window.renderExperienceList = renderExperienceList = () => renderSection('experiences');
  addFilter('certificates', 'Search saved certificates');
  addFilter('awards', 'Search saved awards');
  addFilter('activities', 'Search saved extracurricular activities');
  addFilter('experiences', 'Search saved professional experience');
  ['certificates','awards','activities','experiences'].forEach(section => {
    const list = document.getElementById(section === 'experiences' ? 'experienceList' : `${section}List`);
    window.renderLoadingRows(list, 2);
  });
  setTimeout(() => { renderCertificatesList(); renderAwardsList(); renderActivitiesList(); renderExperienceList(); }, 450);
});
