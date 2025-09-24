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

  // Hacer la función go global para que Android pueda acceder
  window.go = function(id) {
    if (!sections[id]) {
      console.error('Sección no encontrada:', id);
      return false;
    }
    
    // Ocultar todas las secciones
    Object.values(sections).forEach(s => {
      if (s) {
        s.classList.remove('active');
        s.style.display = 'none';
      }
    });
    
    // Mostrar la sección solicitada
    sections[id].style.display = 'block';
    sections[id].classList.add('active');

    // Llamar a los callbacks si existen
    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    console.log('Navegación exitosa a:', id);
    return true;
  };

  // Configurar navegación
  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.go;
        window.go(target);
      });
    });
  }

  // Botón "Entrar"
  const enterBtn = byId('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.go('menu');
    });
  }

  // Inicializar con welcome
  window.go('welcome');
  
  setupNavigation();

  const observer = new MutationObserver(() => {
    setupNavigation();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return window.go;
}
