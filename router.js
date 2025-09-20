import { byId } from './utils.js';

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

  Object.values(sections).forEach(s => s.classList.remove('active'));
  sections[id].classList.add('active');

  // Actualizar historial
  if (historyStack[historyStack.length - 1] !== id) {
    historyStack.push(id);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  if (historyStack.length > 1) {
    historyStack.pop();
    const previous = historyStack[historyStack.length - 1];
    go(previous);
    return false; // No salir
  } else {
    return true; // Primera pantalla, preguntar salir
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

// Hacemos router global para poder llamarlo desde Android
window.router = { go, goBack };
