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

  // Historial interno de pantallas (no incluye "welcome")
  const historyStack = [];

  function go(id) {
    // Evitar volver a welcome
    if (id === 'welcome') {
      Object.values(sections).forEach(s => s.classList.remove('active'));
      sections['welcome']?.classList.add('active');
      return;
    }

    // Guardar en historial solo si no es repetido
    if (id !== 'menu') {
      if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== id) {
        historyStack.push(id);
      }
    }

    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[id]?.classList.add('active');

    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Control desde Android Back Button
  window.handleAndroidBack = function () {
    if (historyStack.length > 0) {
      // Retrocede en historial
      historyStack.pop(); // quitar pantalla actual
      const prev = historyStack.pop() || 'menu'; // volver a la anterior o al menú
      go(prev);
    } else {
      // Si ya estamos en menú → pedir confirmación de salida
      if (sections.menu.classList.contains('active')) {
        if (window.Android && window.Android.showExitConfirm) {
          window.Android.showExitConfirm();
        }
      } else {
        // Si por alguna razón no está en menú, lo enviamos al menú
        go('menu');
      }
    }
  };

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
