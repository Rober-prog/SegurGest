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

  function go(id) {
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[id]?.classList.add('active');

    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    // Notificar a Android el cambio de pantalla
    if (window.Android && window.Android.onNavigate) {
      window.Android.onNavigate(id);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Configurar todos los botones con data-go
  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        go(btn.dataset.go);
      });
    });
  }

  // Botón "Entrar" en la pantalla de bienvenida
  const enterBtn = byId('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      go('menu'); // Ir al menú
    });
  }

  // Inicializar navegación
  setupNavigation();

  // Re-setup navigation si el DOM cambia (botones dinámicos)
  const observer = new MutationObserver(() => {
    setupNavigation();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return go;
}

