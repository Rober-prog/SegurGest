export const fmt = (n)=> (isFinite(+n) ? (+n).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}) : n);
export const uid = ()=> Math.random().toString(36).slice(2)+Date.now().toString(36);
export const byId = (id)=> document.getElementById(id);
export const monthsES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export function monthsDiff(from,to){ const a=new Date(from), b=new Date(to); return (b.getFullYear()-a.getFullYear())*12 + (b.getMonth()-a.getMonth()); }
export function statusByExpiry(endDate){
  if(!endDate) return {color:'orange',label:'Sin fecha'};
  const now=new Date(), end=new Date(endDate);
  if(end < new Date(now.toDateString())) return {color:'red',label:'Caducado'};
  const diffM = monthsDiff(now,end);
  if(diffM >= 3) return {color:'green',label:'> 3 meses'};
  if(diffM >= 2) return {color:'orange',label:'< 3 meses'};
  return {color:'yellow',label:'< 2 meses'};
}
export function genColors(n){
  const base=['#60a5fa','#34d399','#f472b6','#f59e0b','#a78bfa','#22d3ee','#fb7185','#4ade80','#facc15','#93c5fd','#c084fc','#5eead4'];
  return Array.from({length:n},(_,i)=> base[i%base.length]);
}
export function annualFromPayment(d){
  const a=+d.amount||0;
  // If payment is monthly, the entered amount is the monthly payment, so multiply by 12 for annual total.
  // For Semestral, Trimestral, and Anual, the entered amount is now considered the annual total.
  return d.paymentForm==='Mensual'?a*12:a;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}

export function showSuccessMessage(message) {
  const popup = byId('successPopup');
  if (!popup) return;

  popup.textContent = message;
  popup.classList.remove('hidden');
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    // After the fade-out transition, hide it completely
    setTimeout(() => {
      popup.classList.add('hidden');
    }, 300); // Matches the CSS transition duration
  }, 2700); // Display for 2.7 seconds before starting fade out
}

// New confirmation popup elements and functions
const confirmationPopup = byId('confirmationPopup');
const confirmMessage = confirmationPopup.querySelector('.confirmation-popup-message');
const confirmCancelBtn = byId('confirmCancelBtn');
const confirmActionBtn = byId('confirmDeleteBtn'); // Using confirmDeleteBtn as the generic action button

let currentOnConfirm = null;
let currentOnCancel = null;

function executeCurrentConfirm() {
  if (currentOnConfirm) currentOnConfirm();
}

function executeCurrentCancel() {
  if (currentOnCancel) currentOnCancel();
}

export function closeConfirmationPopup() {
  confirmationPopup.classList.remove('show');
  setTimeout(() => {
    confirmationPopup.classList.add('hidden');
    // Important: Remove listeners to prevent memory leaks and unintended calls
    confirmActionBtn.removeEventListener('click', executeCurrentConfirm);
    confirmCancelBtn.removeEventListener('click', executeCurrentCancel);
    currentOnConfirm = null;
    currentOnCancel = null;
  }, 300); // Matches CSS transition duration
}

export function showConfirmation(message, onConfirm, onCancel = () => {}, actionText = 'Sí', actionClass = 'primary') {
  confirmMessage.textContent = message;
  confirmActionBtn.textContent = actionText;
  confirmActionBtn.className = `btn ${actionClass}`; // Set button classes dynamically

  currentOnConfirm = () => {
    onConfirm();
    closeConfirmationPopup();
  };
  currentOnCancel = () => {
    onCancel();
    closeConfirmationPopup();
  };

  // Ensure old listeners are removed before adding new ones
  confirmActionBtn.removeEventListener('click', executeCurrentConfirm);
  confirmCancelBtn.removeEventListener('click', executeCurrentCancel);

  confirmActionBtn.addEventListener('click', executeCurrentConfirm);
  confirmCancelBtn.addEventListener('click', executeCurrentCancel);

  confirmationPopup.classList.remove('hidden');
  confirmationPopup.classList.add('show');
}