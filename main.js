import { initRouter } from './router.js';
import { renderList, initList } from './list.js';
import { renderAccounting } from './accounting.js';
import { initForm, prefillForm, resetFormState } from './form.js';
import { initModal, openModal } from './modal.js';
import { load } from './storage.js';
import { byId, showSuccessMessage, showConfirmation, closeConfirmationPopup } from './utils.js';

/* wire modules */
initList(openModal);
initModal({ renderList, renderAccounting, prefillForm, showSuccessMessage, showConfirmation, closeConfirmationPopup });
const go = initRouter({
  onMis: renderList,
  onConta: renderAccounting,
  onAdd: resetFormState
});
initForm({ renderList, renderAccounting, go, showSuccessMessage, showConfirmation, closeConfirmationPopup });

/* initial route */
// Always start on the welcome screen, the user will click "Entrar" to proceed to the menu.
go('welcome');

/* accessibility */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (byId('confirmationPopup').classList.contains('show')) {
      closeConfirmationPopup();
    } else if (byId('modal').classList.contains('open')) {
      byId('modal')?.classList.remove('open');
    }
  }
});