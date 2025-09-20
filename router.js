import { byId } from './utils.js';

export function initRouter({ onMis, onConta, onAdd }) {
  const sections = {
    welcome: byId('welcome'),
    menu: byId('menu'),
    mis: byId('mis'),
    add: byId('add'),
    conta: byId('conta')
  };

  function go(id) {
    Object.values(sections).forEach(s => s?.classList.remove('active'));
    const target = sections[id];
    if (!target) return;
    target.classList.add('active');

    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delegación de eventos: funciona aunque los botones se creen después
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go]');
    if (!btn) return;
    e.preventDefault();
    go(btn.dataset.go);
  });

  // Inicializamos la vista
  go('welcome');

  return go;
}
