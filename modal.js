import { byId } from './utils.js';
import { load, save } from './storage.js';
import { fmt, formatDate, showSuccessMessage, showConfirmation, closeConfirmationPopup } from './utils.js';

const modal = byId('modal');
const modalClose = byId('modalClose');
const deleteBtn = byId('deleteBtn');
const editBtn = byId('editBtn');
const modalType = byId('modalType');
const modalCompany = byId('modalCompany');
const modalPolicy = byId('modalPolicy');
const modalContent = byId('modalContent');

let modalId = null;
let deps = { renderList:null, renderAccounting:null, prefillForm:null, showSuccessMessage:null, showConfirmation:null, closeConfirmationPopup:null };

export function initModal(d){
  deps = d;
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if(e.target===modal) closeModal(); });
  deleteBtn.addEventListener('click', handleDeleteClick);
  editBtn.addEventListener('click', onEdit);

  // The confirmation popup buttons are now wired in utils.js when showConfirmation is called.
  // We no longer need these event listeners here.
  // confirmCancelBtn.addEventListener('click', closeConfirmationPopup);
  // confirmDeleteBtn.addEventListener('click', executeDelete);
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

function handleDeleteClick(){
  if(!modalId) return;
  // Use the generic showConfirmation from utils.js
  deps.showConfirmation(
    '¿Estás seguro de que quieres eliminar este seguro?',
    () => { // onConfirm callback (user clicked 'Eliminar')
      executeDelete();
    },
    () => { // onCancel callback (user clicked 'Cancelar')
      // User cancelled deletion, do nothing, just the popup closes
    },
    'Eliminar', // Text for the action button
    'danger' // Class for the action button
  );
}

function executeDelete(){
  if(!modalId) return;
  // closeConfirmationPopup() is called by showConfirmation's internal currentOnConfirm
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
    push('Próxima ITV', formatDate(item.nextItv)||'—');
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