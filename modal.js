import { byId } from './utils.js';
import { load, save } from './storage.js';
import { fmt, formatDate, showSuccessMessage } from './utils.js';

const modal = byId('modal');
const modalClose = byId('modalClose');
const deleteBtn = byId('deleteBtn');
const editBtn = byId('editBtn');
const modalType = byId('modalType');
const modalCompany = byId('modalCompany');
const modalPolicy = byId('modalPolicy');
const modalContent = byId('modalContent');

// New confirmation popup elements
const confirmationPopup = byId('confirmationPopup');
const confirmMessage = confirmationPopup.querySelector('.confirmation-popup-message');
const confirmCancelBtn = byId('confirmCancelBtn');
const confirmDeleteBtn = byId('confirmDeleteBtn');

let modalId = null;
let deps = { renderList:null, renderAccounting:null, prefillForm:null, showSuccessMessage:null };

export function initModal(d){
  deps = d;
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if(e.target===modal) closeModal(); });
  deleteBtn.addEventListener('click', openConfirmationPopup); // Changed to open custom confirmation popup
  editBtn.addEventListener('click', onEdit);

  // Add event listeners for the new confirmation popup buttons
  confirmCancelBtn.addEventListener('click', closeConfirmationPopup);
  confirmDeleteBtn.addEventListener('click', executeDelete);
}

export function openModal(id){
  const data = load();
  const item = data.find(d=> d.id===id);
  if(!item) return;
  modalId = id;
  modalType.textContent = item.type;
  modalCompany.textContent = item.company || '—';
  modalPolicy.textContent = 'Póliza: ' + (item.policyNumber || '—');
  modalContent.innerHTML = detailGrid(item);
  modal.classList.add('open');
}
function closeModal(){ modal.classList.remove('open'); }

function openConfirmationPopup(){
  if(!modalId) return;
  // Do not close the detail modal, display the confirmation popup on top
  confirmMessage.textContent = '¿Estás seguro de que quieres eliminar este seguro?';
  confirmationPopup.classList.remove('hidden'); // Ensure it's not hidden
  confirmationPopup.classList.add('show');
}

function closeConfirmationPopup(){
  confirmationPopup.classList.remove('show');
  // After the fade-out transition, hide it completely
  setTimeout(() => {
    confirmationPopup.classList.add('hidden');
  }, 300); // Matches the CSS transition duration
}

function executeDelete(){
  if(!modalId) return;
  closeConfirmationPopup(); // Close the confirmation popup first
  closeModal(); // Then close the detail modal

  const data = load().filter(d=> d.id!==modalId);
  save(data);
  deps.renderList?.();
  deps.renderAccounting?.();
  deps.showSuccessMessage?.('Seguro eliminado correctamente');
  modalId = null; // Clear modalId after deletion
}

function onEdit(){
  const data = load();
  const item = data.find(d=> d.id===modalId);
  closeModal();
  if(item) deps.prefillForm?.(item);
}

function detailGrid(item){
  const rows = [];
  const push = (k,v)=> rows.push(`<div class="col-6 field"><label>${k}</label><div>${v||'—'}</div></div>`);
  push('Compañía', item.company);
  push('Póliza', item.policyNumber);
  push('Importe', fmt(item.amount)+' €');
  push('Pago', item.paymentForm);
  push('Inicio', formatDate(item.startDate)||'—');
  push('Caducidad', formatDate(item.endDate)||'—');
  push('Teléfono', item.phone||'—');
  if(item.type==='Vehículo'){
    push('Vehículo', item.vehicleType + (item.vehicleOther?` (${item.vehicleOther})`:'' ));
    push('Matrícula', item.plate); push('Modelo', item.model);
    push('Cobertura', item.coverage);
    push('Franquicia', item.franchiseAmount? fmt(item.franchiseAmount)+' €':'—');
    push('Asistencia', item.assist?'Sí':'No');
    push('Sustitución', item.replacement?'Sí':'No');
    push('Libre taller', item.freeWorkshop?'Sí':'No');
  }
  if(item.type==='Vivienda'){ push('Dirección', item.address); push('Población', item.city); push('Cobertura', item.coverage); }
  if(item.type==='Salud'){ push('Cobertura', item.coverageType + (item.coverageOther?` (${item.coverageOther})`:'')); }
  if(item.type==='Vida'){
    push('Capital', item.capital? fmt(item.capital)+' €':'—');
    push('Beneficiario', item.beneficiary||'—');
    push('Vinculado', item.linked?'Sí':'No');
  }
  if(item.type==='Decesos'){ push('Coberturas', item.coverages); }
  if(item.type==='Otros'){ push('Tipo', item.otherType); push('Coberturas', item.coverages); }
  return rows.join('');
}