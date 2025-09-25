// removed: storage helpers (STORAGE_KEY, load, save) -> moved to storage.js
// removed: router (sections, go, nav listeners) -> moved to router.js
// removed: utilities (fmt, uid, byId, monthsES, monthsDiff, statusByExpiry) -> moved to utils.js
// removed: list rendering (renderList, search/filter handlers) -> moved to list.js
// removed: dynamic form builders, validation, submit, prefill -> moved to form.js
// removed: modal open/close, delete/edit wiring -> moved to modal.js
// removed: accounting (renderAccounting, distribution, annualFromPayment, genColors) -> moved to accounting.js
console.warn('app.js has been refactored. Entry point is now main.js');