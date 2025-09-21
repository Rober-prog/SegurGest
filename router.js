import { byId } from './utils.js';
export function initRouter({ onMis, onConta, onAdd }){
  const sections = { welcome: byId('welcome'), menu: byId('menu'), mis: byId('mis'), add: byId('add'), conta: byId('conta'), infoApp: byId('infoApp') };
  
  function go(id){
    Object.values(sections).forEach(s=>s.classList.remove('active'));
    sections[id]?.classList.add('active');
    if(id==='mis') onMis?.();
    if(id==='conta') onConta?.();
    if(id==='add') onAdd?.();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  
  // Set up click handlers for all data-go elements
  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        go(btn.dataset.go);
      });
    });
  }
  
  // Initial setup
  setupNavigation();
  
  // Re-setup navigation when DOM changes (for dynamically added buttons)
  const observer = new MutationObserver(() => {
    setupNavigation();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  return go;
}