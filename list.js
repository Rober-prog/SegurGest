import { byId, fmt, statusByExpiry, formatDate } from './utils.js';
import { load } from './storage.js';

const listEl = byId('list');
const emptyListEl = byId('emptyList');
const searchEl = byId('search');
const filterTypeEl = byId('filterType');
let openModalRef = null;

export function initList(openModal){
  openModalRef = openModal;
  searchEl.addEventListener('input', renderList);
  filterTypeEl.addEventListener('change', renderList);
}

export function renderList(){
  const data = load();
  const q = searchEl.value.trim().toLowerCase();
  const t = filterTypeEl.value;
  const filtered = data.filter(d=>{
    const s = `${d.type} ${d.company||''} ${d.policyNumber||''}`.toLowerCase();
    return (!q || s.includes(q)) && (!t || d.type===t);
  });
  listEl.innerHTML = '';
  emptyListEl.classList.toggle('hidden', filtered.length>0);
  if(filtered.length===0) return;
  filtered.forEach(item=>{
    const st = statusByExpiry(item.endDate);
    const div = document.createElement('div');
    div.className = 'insurance-card col-12';

    // Generate dynamic asset-specific details based on insurance type
    let assetDetailsHtml = '';
    if (item.type === 'Vehículo') {
      if (item.plate) assetDetailsHtml += `<div class="insurance-card-detail-item">Matrícula: <span class="insurance-card-detail-value">${item.plate}</span></div>`;
      if (item.model) assetDetailsHtml += `<div class="insurance-card-detail-item">Modelo: <span class="insurance-card-detail-value">${item.model}</span></div>`;
    } else if (item.type === 'Vivienda') {
      if (item.address) assetDetailsHtml += `<div class="insurance-card-detail-item">Dirección: <span class="insurance-card-detail-value">${item.address}</span></div>`;
      if (item.city) assetDetailsHtml += `<div class="insurance-card-detail-item">Población: <span class="insurance-card-detail-value">${item.city}</span></div>`;
    } else if (item.type === 'Salud') {
      if (item.coverageType) assetDetailsHtml += `<div class="insurance-card-detail-item">Cobertura: <span class="insurance-card-detail-value">${item.coverageType}</span></div>`;
    } else if (item.type === 'Vida') {
      if (item.capital) assetDetailsHtml += `<div class="insurance-card-detail-item">Capital: <span class="insurance-card-detail-value price">${fmt(item.capital)} €</span></div>`;
      if (item.beneficiary) assetDetailsHtml += `<div class="insurance-card-detail-item">Beneficiario: <span class="insurance-card-detail-value">${item.beneficiary}</span></div>`;
    } else if (item.type === 'Decesos') {
      if (item.coverages) assetDetailsHtml += `<div class="insurance-card-detail-item">Coberturas: <span class="insurance-card-detail-value">Ver detalles</span></div>`;
    } else if (item.type === 'Otros') {
      if (item.otherType) assetDetailsHtml += `<div class="insurance-card-detail-item">Tipo: <span class="insurance-card-detail-value">${item.otherType}</span></div>`;
      if (item.coverages) assetDetailsHtml += `<div class="insurance-card-detail-item">Coberturas: <span class="insurance-card-detail-value">Ver detalles</span></div>`;
    }

    div.innerHTML = `
      <div class="insurance-card-header-group">
        <div class="insurance-card-status-and-type">
          <div class="dot ${st.color}"></div>
          <div class="insurance-card-type">${item.type === 'Vehículo' ? item.vehicleType || 'Vehículo' : item.type}</div>
        </div>
        <div class="insurance-card-company-name">${item.company || '—'}</div>
      </div>
      <div class="insurance-card-details-group">
        <div class="insurance-card-detail-item">Póliza: <span class="insurance-card-detail-value">${item.policyNumber || '—'}</span></div>
        ${assetDetailsHtml}
        <div class="insurance-card-detail-item">Importe: <span class="insurance-card-detail-value price">${fmt(item.amount||0)} €</span></div>
        <div class="insurance-card-detail-item">Caduca: <span class="insurance-card-detail-value">${formatDate(item.endDate) || '—'}</span></div>
        <div class="insurance-card-detail-item">Teléfono: <span class="insurance-card-detail-value">${item.phone || '—'}</span></div>
      </div>
      <button class="edit-btn" data-id="${item.id}" title="Ver / Editar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M2.0499 12.0498C2.0499 12.0498 6.0499 4.0498 12.0499 4.0498C18.0499 4.0498 22.0499 12.0498 22.0499 12.0498C22.0499 12.0498 18.0499 20.0498 12.0499 20.0498C6.0499 20.0498 2.0499 12.0498 2.0499 12.0498Z" stroke="var(--icon-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.0499 15.0498C13.6067 15.0498 14.8499 13.8066 14.8499 12.2498C14.8499 10.693 13.6067 9.4498 12.0499 9.4498C10.4931 9.4498 9.2499 10.693 9.2499 12.2498C9.2499 13.8066 10.4931 15.0498 12.0499 15.0498Z" stroke="var(--icon-stroke)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    div.querySelector('.edit-btn').addEventListener('click', ()=> openModalRef?.(item.id));
    listEl.appendChild(div);
  });
}