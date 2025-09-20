export function initRouter({ onMis, onConta, onAdd }) {
  const sections = { welcome: byId('welcome'), menu: byId('menu'), mis: byId('mis'), add: byId('add'), conta: byId('conta') };
  let currentSection = 'welcome';

  function go(id) {
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[id]?.classList.add('active');

    // Llamada a Android para historial
    if (window.AndroidHistory && id !== currentSection) {
      AndroidHistory.notifySection(currentSection);
      currentSection = id;
    }

    if (id === 'mis') onMis?.();
    if (id === 'conta') onConta?.();
    if (id === 'add') onAdd?.();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      go(btn.dataset.go);
    });
  });

  return go;
}
