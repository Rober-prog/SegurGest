import { byId, uid, showSuccessMessage, showConfirmation, closeConfirmationPopup } from './utils.js';
import { load, save } from './storage.js';

const typeEl = byId('type');
const typeFields = byId('typeFields');
const form = byId('insuranceForm');
const saveBtn = byId('saveBtn');
const cancelEdit = byId('cancelEdit');
const PAY_FORMS = ['Anual','Semestral','Trimestral','Mensual'];
let editingId = null;
let deps = { renderList: null, renderAccounting: null, go: null, showSuccessMessage: null, showConfirmation: null, closeConfirmationPopup: null };

export function resetFormState(){
  editingId = null; form.reset();
  saveBtn.textContent = 'Guardar';
  cancelEdit.style.display = 'none';
  typeFields.innerHTML = '';
  // Set a default type and render its fields when opening the form
  typeEl.value = 'Vehículo'; // Default to 'Vehículo'
  renderTypeFields(); // Render fields for the default type
}

export function initForm(d){
  deps = d;
  typeEl.addEventListener('change', ()=> renderTypeFields());
  cancelEdit.addEventListener('click', () => {
    resetFormState();
    deps.go?.('mis'); // Navigate back to "mis seguros" when canceling edit
  });
  form.addEventListener('submit', onSubmit);
  typeFields.addEventListener('change', (e)=>{
    if(e.target.id==='coverage'){
      const val = e.target.value.toLowerCase();
      const fran = typeFields.querySelector('#franchiseAmount');
      if(fran && val.includes('franquicia')){
        fran.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, .25)';
        fran.focus(); setTimeout(()=> fran.style.boxShadow='', 800);
      }
    }
  });
}

export function prefillForm(item){
  deps.go?.('add');
  typeEl.value = item.type;
  renderTypeFields(item);
  saveBtn.textContent = 'Guardar cambios';
  cancelEdit.style.display = 'inline-flex';
  editingId = item.id;
}

function renderTypeFields(prefill={}) {
  const t = typeEl.value;
  typeFields.className = 'grid';
  if(!t){ typeFields.innerHTML=''; return; }
  typeFields.innerHTML = builders[t]?.(prefill) || '';
  typeFields.querySelectorAll('.chip').forEach(ch=>{
    ch.addEventListener('click', ()=> ch.dataset.active = ch.dataset.active === 'true' ? 'false' : 'true');
  });
}

/* builders */
function commonMoneyCompanyPolicy(v={}, hideCompany=false, includePhone=false){
  return `
    ${hideCompany ? '' : `<div class=\"col-12 field\"><label>Compañía aseguradora</label><input id=\"company\" value=\"${v.company||''}\" required></div>`}
    ${hideCompany ? '' : `<div class=\"col-12 field\"><label>Número de póliza</label><input id=\"policyNumber\" value=\"${v.policyNumber||''}\" required></div>`}
    <div class=\"col-6 field\"><label>Importe (€)</label><input id=\"amount\" type=\"number\" step=\"0.01\" value=\"${v.amount||''}\" required></div>
    <div class=\"col-6 field\"><label>Forma de pago</label>
      <select id=\"paymentForm\">
        ${PAY_FORMS.map(p=>`<option ${v.paymentForm===p?'selected':''}>${p}</option>`).join('')}
      </select>
    </div>
    ${includePhone ? `<div class=\"col-6 field\"><label>Teléfono o E-mail</label><input id=\"phone\" value=\"${v.phone||''}\" placeholder=\"+34 ...\"></div>`:''}
  `;
}
const builders = {
  'Vehículo': (v={}) => `
    <div class=\"col-6 field\">
      <label>Tipo de vehículo</label>
      <div class=\"inline\">
        <select id=\"vehicleType\">
          <option ${v.vehicleType==='Coche'?'selected':''}>Coche</option>
          <option ${v.vehicleType==='Moto'?'selected':''}>Moto</option>
          <option ${v.vehicleType==='Otros'?'selected':''}>Otros</option>
        </select>
        <input id=\"vehicleOther\" placeholder=\"Especificar (si Otros)\" value=\"${v.vehicleOther||''}\">
      </div>
    </div>
    <div class=\"col-6 field\"><label>Matrícula</label><input id=\"plate\" value=\"${v.plate||''}\" placeholder=\"0000-ABC\"></div>
    <div class=\"col-6 field\"><label>Marca y modelo</label><input id=\"model\" value=\"${v.model||''}\" placeholder=\"Marca Modelo\"></div>
    <div class=\"col-6 field\"><label>Próxima ITV</label><input type=\"date\" id=\"nextItv\" value=\"${v.nextItv||''}\"></div>
    <div class=\"col-6 field inline\">
      <div class=\"field\"><label>Fecha inicio</label><input type=\"date\" id=\"startDate\" value=\"${v.startDate||''}\"></div>
      <div class=\"field\"><label>Fecha caducidad</label><input type=\"date\" id=\"endDate\" value=\"${v.endDate||''}\"></div>
    </div>
    <div class=\"col-12 field\">
      <label>Tipo de cobertura</label>
      <select id=\"coverage\">
        ${['Todo riesgo','Todo riesgo con franquicia','Terceros completo','Terceros con lunas/incendio','Terceros simple'].map(opt=>`<option ${v.coverage===opt?'selected':''}>${opt}</option>`).join('')}
      </select>
    </div>
    <div class=\"col-6 field\"><label>Importe franquicia (si aplica)</label><input id=\"franchiseAmount\" type=\"number\" step=\"0.01\" value=\"${v.franchiseAmount||''}\" placeholder=\"0.00\"></div>
    <div class=\"col-6 field\">
      <label>Extras</label>
      <div class=\"inline\">
        <div class=\"chip\" id=\"assist\" data-active=\"${!!v.assist}\">Asistencia grúa</div>
        <div class=\"chip\" id=\"replacement\" data-active=\"${!!v.replacement}\">Vehículo sustitución</div>
        <div class=\"chip\" id=\"freeWorkshop\" data-active=\"${!!v.freeWorkshop}\">Libre taller</div>
      </div>
    </div>
    ${commonMoneyCompanyPolicy(v, false, true)}
  `,
  'Vivienda': (v={}) => `
    <div class=\"col-12 field\"><label>Dirección</label><input id=\"address\" value=\"${v.address||''}\" placeholder=\"Calle, número, piso\"></div>
    <div class=\"col-12 field\"><label>Población</label><input id=\"city\" value=\"${v.city||''}\" placeholder=\"Ciudad / Municipio\"></div>
    <div class=\"col-6 field inline\">
      <div class=\"field\"><label>Fecha inicio</label><input type=\"date\" id=\"startDate\" value=\"${v.startDate||''}\"></div>
      <div class=\"field\"><label>Fecha caducidad</label><input type=\"date\" id=\"endDate\" value=\"${v.endDate||''}\"></div>
    </div>
    <div class=\"col-12 field\"><label>Tipo de cobertura</label><input id=\"coverage\" value=\"${v.coverage||''}\" placeholder=\"Contenido, Continente, Robo, etc.\"></div>
    ${commonMoneyCompanyPolicy(v, false, true)}
  `,
  'Salud': (v={}) => `
    <div class=\"col-12 field\"><label>Compañía aseguradora</label><input id=\"company\" value=\"${v.company||''}\" required></div>
    <div class=\"col-12 field\"><label>Número de póliza</label><input id=\"policyNumber\" value=\"${v.policyNumber||''}\" required></div>
    <div class=\"col-6 field inline\">
      <div class=\"field\"><label>Fecha inicio</label><input type=\"date\" id=\"startDate\" value=\"${v.startDate||''}\"></div>
      <div class=\"field\"><label>Fecha caducidad</label><input type=\"date\" id=\"endDate\" value=\"${v.endDate||''}\"></div>
    </div>
    <div class=\"col-12 field\">
      <label>Tipo de cobertura</label>
      <div class=\"inline\">
        <select id=\"coverageType\">
          ${['Completa','Completa con copagos','Solo especialidades','Otros'].map(opt=>`<option ${v.coverageType===opt?'selected':''}>${opt}</option>`).join('')}
        </select>
        <input id=\"coverageOther\" placeholder=\"Especificar (si Otros)\" value=\"${v.coverageOther||''}\">
      </div>
    </div>
    ${commonMoneyCompanyPolicy(v, true, true)}
  `,
  'Vida': (v={}) => `
    <div class=\"col-12 field\"><label>Compañía aseguradora</label><input id=\"company\" value=\"${v.company||''}\" required></div>
    <div class=\"col-12 field\"><label>Número de póliza</label><input id=\"policyNumber\" value=\"${v.policyNumber||''}\" required></div>
    <div class=\"col-6 field inline\">
      <div class=\"field\"><label>Fecha inicio</label><input type=\"date\" id=\"startDate\" value=\"${v.startDate||''}\"></div>
      <div class=\"field\"><label>Fecha caducidad</label><input type=\"date\" id=\"endDate\" value=\"${v.endDate||''}\"></div>
    </div>
    <div class=\"col-6 field\"><label>Capital asegurado</label><input id=\"capital\" type=\"number\" step=\"0.01\" value=\"${v.capital||''}\"></div>
    <div class=\"col-6 field\"><label>Beneficiario</label><input id=\"beneficiary\" value=\"${v.beneficiary||''}\"></div>
    <div class=\"col-12 field\">
      <label>Vinculado a hipoteca/préstamo</label>
      <div class=\"chip\" id=\"linked\" data-active=\"${!!v.linked}\">Vinculado</div>
    </div>
    ${commonMoneyCompanyPolicy(v, true, true)}
  `,
  'Decesos': (v={}) => `
    <div class=\"col-12 field\"><label>Compañía aseguradora</label><input id=\"company\" value=\"${v.company||''}\" required></div>
    <div class=\"col-12 field\"><label>Número de póliza</label><input id=\"policyNumber\" value=\"${v.policyNumber||''}\" required></div>
    <div class=\"col-6 field inline\">
      <div class=\"field\"><label>Fecha inicio</label><input type=\"date\" id=\"startDate\" value=\"${v.startDate||''}\"></div>
      <div class=\"field\"><label>Fecha caducidad</label><input type=\"date\" id=\"endDate\" value=\"${v.endDate||''}\"></div>
    </div>
    <div class=\"col-12 field\"><label>Coberturas</label><textarea id=\"coverages\" placeholder=\"Texto libre...\">${v.coverages||''}</textarea></div>
    ${commonMoneyCompanyPolicy(v, true, true)}
  `,
  'Otros': (v={}) => `
    <div class=\"col-12 field\"><label>Compañía aseguradora</label><input id=\"company\" value=\"${v.company||''}\" required></div>
    <div class=\"col-12 field\"><label>Número de póliza</label><input id=\"policyNumber\" value=\"${v.policyNumber||''}\" required></div>
    <div class=\"col-6 field inline\">
      <div class=\"field\"><label>Fecha inicio</label><input type=\"date\" id=\"startDate\" value=\"${v.startDate||''}\"></div>
      <div class=\"field\"><label>Fecha caducidad</label><input type=\"date\" id=\"endDate\" value=\"${v.endDate||''}\"></div>
    </div>
    <div class=\"col-12 field\"><label>Tipo de seguro</label><input id=\"otherType\" value=\"${v.otherType||''}\" placeholder=\"Texto libre\"></div>
    <div class=\"col-12 field\"><label>Coberturas</label><textarea id=\"coverages\" placeholder=\"Texto libre...\">${v.coverages||''}</textarea></div>
    ${commonMoneyCompanyPolicy(v, true, true)}
  `
};

function readCommon(v = {}){
  const get = id => typeFields.querySelector('#'+id)?.value ?? '';
  const chipVal = id => typeFields.querySelector('#'+id)?.dataset.active === 'true';
  return {
    company: typeFields.querySelector('#company')?.value?.trim() || v.company || '',
    policyNumber: typeFields.querySelector('#policyNumber')?.value?.trim() || v.policyNumber || '',
    amount: parseFloat(get('amount')||0) || 0,
    paymentForm: get('paymentForm') || 'Anual',
    phone: get('phone') || v.phone || '',
    startDate: get('startDate') || v.startDate || '',
    endDate: get('endDate') || v.endDate || '',
    chips: {
      assist: chipVal('assist'),
      replacement: chipVal('replacement'),
      freeWorkshop: chipVal('freeWorkshop'),
      linked: chipVal('linked')
    }
  };
}

function buildObjectFromForm(){
  const type = typeEl.value;
  if(!type) throw 'Selecciona el tipo de seguro.';
  let obj = { id: editingId || uid(), type };
  const c = readCommon();
  if(type==='Vehículo'){
    obj = { ...obj, ...c,
      vehicleType: typeFields.querySelector('#vehicleType').value,
      vehicleOther: typeFields.querySelector('#vehicleOther').value.trim(),
      plate: typeFields.querySelector('#plate').value.trim(),
      model: typeFields.querySelector('#model').value.trim(),
      nextItv: typeFields.querySelector('#nextItv').value.trim(),
      coverage: typeFields.querySelector('#coverage').value,
      franchiseAmount: parseFloat(typeFields.querySelector('#franchiseAmount').value || 0) || 0,
      assist: c.chips.assist, replacement: c.chips.replacement, freeWorkshop: c.chips.freeWorkshop
    };
  } else if(type==='Vivienda'){
    obj = { ...obj, ...c,
      address: typeFields.querySelector('#address').value.trim(),
      city: typeFields.querySelector('#city').value.trim(),
      coverage: typeFields.querySelector('#coverage').value.trim()
    };
  } else if(type==='Salud'){
    obj = { ...obj, ...c,
      coverageType: typeFields.querySelector('#coverageType').value,
      coverageOther: typeFields.querySelector('#coverageOther').value.trim()
    };
  } else if(type==='Vida'){
    obj = { ...obj, ...c,
      capital: parseFloat(typeFields.querySelector('#capital').value || 0) || 0,
      beneficiary: typeFields.querySelector('#beneficiary').value.trim(),
      linked: c.chips.linked
    };
  } else if(type==='Decesos'){
    obj = { ...obj, ...c, coverages: typeFields.querySelector('#coverages').value.trim() };
  } else if(type==='Otros'){
    obj = { ...obj, ...c,
      otherType: typeFields.querySelector('#otherType').value.trim(),
      coverages: typeFields.querySelector('#coverages').value.trim()
    };
  }
  return obj;
}

function validate(obj){
  const req = ['company','policyNumber','amount','paymentForm'];
  const missing = [];
  req.forEach(k=>{
    if((obj[k]===undefined || obj[k]==='' || (k==='amount' && !isFinite(+obj[k])))) missing.push(k);
  });
  if(obj.type==='Vehículo'){ if(!obj.plate) missing.push('plate'); if(!obj.model) missing.push('model'); }
  // Return missing fields array instead of throwing an error
  return missing;
}

function onSubmit(e){
  e.preventDefault();
  const obj = buildObjectFromForm();
  const missingFields = validate(obj);

  const saveConfirmed = () => {
    try {
      const data = load();
      const idx = data.findIndex(d=> d.id===obj.id);
      if(idx>-1) data[idx]=obj; else data.push(obj);
      save(data);
      deps.renderList?.();
      deps.renderAccounting?.();
      resetFormState();
      deps.showSuccessMessage?.('Seguro guardado correctamente');
      deps.go?.('menu');
    } catch(err) {
      alert(`Error al guardar: ${err.message || err}`); // Catch any actual saving errors
    }
  };

  if (missingFields.length > 0) {
    const missingMessage = missingFields.map(k => {
      // Improve readability for user-facing field names
      if (k === 'company') return 'Compañía aseguradora';
      if (k === 'policyNumber') return 'Número de póliza';
      if (k === 'amount') return 'Importe';
      if (k === 'paymentForm') return 'Forma de pago';
      if (k === 'plate') return 'Matrícula';
      if (k === 'model') return 'Marca y modelo';
      return k; // Fallback for any other field names
    }).join(', ');

    deps.showConfirmation(
      `Faltan los siguientes datos: ${missingMessage}. ¿Guardar de todos modos?`,
      saveConfirmed, // Callback if user confirms to save
      () => {
        // User cancelled, do nothing and stay on the form
      },
      'Sí', // Action button text
      'primary' // Action button class
    );
  } else {
    // No missing fields, proceed directly to save
    saveConfirmed();
  }
}
