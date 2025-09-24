import { byId } from './utils.js';

export function initRouter({ onMis, onConta, onAdd }) {
  const sections = {
    welcome: byId('welcome'),
    menu: byId('menu'),
    mis: byId('mis'),
    add: byId('add'),
    conta: byId('conta'),
    infoApp: byId('infoApp')
  };

  // Hacer la función go global para Android
  window.go = function(id) {
    if (!sections[id]) {
      console.error('Sección no encontrada:', id);
      return false;
    }
    
    // Solo manipular clases, NO display (para no romper CSS)
    Object.values(sections).forEach(s => {
      if (s) s.classList.remove('active');
    });
    
    sections[id].classList.add('active');

    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    console.log('Navegado a:', id);
    return true;
  };

  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.go(btn.dataset.go);
      });
    });
  }

  const enterBtn = byId('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go('menu');
    });
  }

  // Inicializar
  window.go('welcome');
  setupNavigation();

  const observer = new MutationObserver(() => {
    setupNavigation();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return window.go;
}
