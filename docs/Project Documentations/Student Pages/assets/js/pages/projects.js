
document.addEventListener('DOMContentLoaded', () => {
  if (typeof localProjectsCollection === 'undefined') return;
  const samples = [
    { id:'p4', title:'Internship Filtering Dashboard', type:'Web Application', startDate:'2026-02-01', endDate:'2026-04-10', underDevelopment:false, includeCv:true, linkedin:'', github:'https://github.com/dev/filtering-dashboard', docLink:'https://drive.google.com/file/d/filtering-dashboard/view', abstract:'A deterministic candidate filtering dashboard aligned with direct skill filtering and academic GPA visibility.', skills:['React','Java'] },
    { id:'p5', title:'HSE Smart TV Dashboard', type:'Desktop System', startDate:'2025-11-01', endDate:'', underDevelopment:true, includeCv:true, linkedin:'', github:'https://github.com/dev/hse-dashboard', docLink:'', abstract:'A full screen safety performance dashboard with monthly and annual reporting panels.', skills:['JavaScript','PostgreSQL'] },
    { id:'p6', title:'Research Partner Finder', type:'Web Application', startDate:'2026-03-15', endDate:'', underDevelopment:true, includeCv:false, linkedin:'https://www.linkedin.com/in/research-partner', github:'', docLink:'https://drive.google.com/file/d/research-platform/view', abstract:'A Sri Lankan research collaboration platform for connecting science and engineering contributors.', skills:['Supabase','React'] }
  ];
  samples.forEach(project => {
    if (!localProjectsCollection.some(x => x.id === project.id || x.title === project.title)) localProjectsCollection.push(project);
  });
  const track = document.getElementById('dynamicProjectsListTrack');
  window.renderLoadingRows(track, 3);
  setTimeout(renderDynamicProjectsGrid, 300);
});
