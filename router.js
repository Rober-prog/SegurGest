import { byId } from './utils.js';

export const router = (() => {
  const sections = {
    welcome: byId('welcome'),
    menu: byId('menu'),
    mis: byId('mis'),
    add: byId('add'),
    conta: byId('conta')
  };

  let historyStack = ['welcome'];

  function go(id) {
    if (!sections[id]) return;

    sections[id].classList.add('active');
    Object.entries(sections).forEach(([key, s]) => {
      if (key !== id) s.classList.remove('active');
    });

    // Actualizar historial
    if (historyStack[historyStack.length - 1] !== id) {
      historyStack.push(id);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    if (historyStack.length > 1) {
      // Sacar la sección actual
      historyStack.pop();
      const previous = historyStack[historyStack.length - 1];
      go(previous);
      return false; // No salir
    } else {
      return true; // Primera sección, preguntar por salir
    }
  }

  // Botones con data-go
  function setupNavigation() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        go(btn.dataset.go);
      });
    });
  }

  setupNavigation();

  const observer = new MutationObserver(setupNavigation);
  observer.observe(document.body, { childList: true, subtree: true });

  return { go, goBack };
})();
