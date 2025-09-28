import { byId, monthsES, genColors, annualFromPayment, fmt, getStartOfDayLocal, getEndOfDayLocal } from './utils.js';
import { load } from './storage.js';

let chart;

function distributionByMonths(items){
  const labels = monthsES;
  const colors = genColors(items.length);
  const currentYear = new Date().getFullYear();

  const datasets = items.map((it, i)=>{
    const arr = new Array(12).fill(0); // This will hold the total payment for each month
    const itemAmount = +it.amount || 0; // This is the amount per installment

    if (itemAmount <= 0) {
        return { label: `${it.type} (${it.company||'—'})`, data: arr, backgroundColor: colors[i] };
    }

    const policyStart = it.startDate ? getStartOfDayLocal(it.startDate) : null;
    const policyEnd = it.endDate ? getEndOfDayLocal(it.endDate) : null;

    if (!policyStart) { // If no start date, we can't determine payment months
        return { label: `${it.type} (${it.company||'—'})`, data: arr, backgroundColor: colors[i] };
    }

    const startDay = policyStart.getDate();
    const startMonthIdx = policyStart.getMonth(); // 0-indexed month of policy start

    let paymentIntervalMonths = 0; // Number of months between payments (e.g., 1 for monthly, 3 for quarterly)
    let numberOfPaymentsInAYear = 0; // Maximum number of payments if active for the full year

    switch (it.paymentForm) {
      case 'Mensual': paymentIntervalMonths = 1; numberOfPaymentsInAYear = 12; break;
      case 'Trimestral': paymentIntervalMonths = 3; numberOfPaymentsInAYear = 4; break;
      case 'Semestral': paymentIntervalMonths = 6; numberOfPaymentsInAYear = 2; break;
      case 'Anual': paymentIntervalMonths = 12; numberOfPaymentsInAYear = 1; break;
      default:
        console.warn('Unknown payment form:', it.paymentForm);
        return { label: `${it.type} (${it.company||'—'})`, data: arr, backgroundColor: colors[i] };
    }

    // Determine the effective policy start and end dates within the current year for payment checks
    const currentYearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const effectivePolicyStart = (policyStart < currentYearStart) ? currentYearStart : policyStart;
    const effectivePolicyEnd = (policyEnd > currentYearEnd) ? currentYearEnd : policyEnd;

    // Project payments for the current year
    for (let j = 0; j < numberOfPaymentsInAYear; j++) {
        // Calculate the potential payment month in a full year cycle based on policy's start month
        let paymentMonthIdx = (startMonthIdx + j * paymentIntervalMonths);

        // Adjust paymentMonthIdx if it's for a future year (e.g., if startMonthIdx is Dec, and paymentIntervalMonths is 3, it becomes Mar next year)
        // We need to find the equivalent month in the currentYear.
        // If paymentMonthIdx is e.g. 13, it means Jan of next year. We only care about currentYear.
        // If it's 12, it's Jan of next year.
        // It's simpler to just ensure the calculated date falls into the current year.

        // Construct a Date object for this potential payment in the current year
        // Ensure the day does not exceed the maximum day of the month
        const lastDayOfMonth = new Date(currentYear, paymentMonthIdx % 12 + 1, 0).getDate();
        const paymentOccursDate = new Date(currentYear, paymentMonthIdx % 12, Math.min(startDay, lastDayOfMonth), 0, 0, 0, 0); // Start of day

        // Check if this specific payment date falls within the policy's effective active period in the current year
        if (paymentOccursDate >= effectivePolicyStart && paymentOccursDate <= effectivePolicyEnd) {
            arr[paymentOccursDate.getMonth()] += itemAmount;
        }
    }

    // Determine the label for the dataset
    let labelText = it.type;
    if (it.type === 'Vehículo' && it.vehicleType) {
      labelText = it.vehicleType;
    }
    return { label: `${labelText} (${it.company||'—'})`, data: arr, backgroundColor: colors[i] };
  });
  return { labels, datasets, colors };
}

export function renderAccounting(){
  const data = load();
  const summaryList = byId('summaryList');
  const totalAnnual = byId('totalAnnual');
  const legend = byId('legend');

  summaryList.innerHTML = '';
  let total = 0;
  const items = data.map(d=>{
    const annual = annualFromPayment(d); // Uses the updated annualFromPayment
    total += annual;
    const div = document.createElement('div');
    div.className = 'col-12';
    // Determine the label for the summary item
    let labelText = d.type;
    if (d.type === 'Vehículo' && d.vehicleType) {
      labelText = d.vehicleType;
    }
    div.innerHTML = `
      <div class="row" style="justify-content:space-between; background:var(--summary-row-bg); border:1px solid var(--summary-row-border); border-radius:10px; padding:8px 10px;">
        <div>${labelText} <span class="muted">(${d.company||'—'})</span></div>
        <div class="strong summary-amount">${fmt(annual)} €</div>
      </div>
    `;
    summaryList.appendChild(div);
    return d;
  });
  totalAnnual.textContent = fmt(total)+' €';

  const dist = distributionByMonths(items);
  const ctx = byId('chart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'bar',
    data:{ labels: dist.labels, datasets: dist.datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      scales:{
        x:{
          stacked:false, // Changed from true to false
          ticks:{
            color:'#666666',
            font: {
              size: 9 // Fuente pequeña para los meses
            }
          },
          grid:{ color:'rgba(0,0,0,.1)'},
          categoryPercentage: 0.8, // Increased from 0.6 for better spacing
          barPercentage: 0.9 // Increased from 0.7 for thinner individual bars
        },
        y:{
          stacked:false, // Changed from true to false
          ticks:{
            color:'#666666',
            callback:(v)=> v>=1000? (v/1000)+'k' : v,
            min: 0, // Inicia desde 0 para una mejor representación de barras
          },
          grid:{ color:'rgba(0,0,0,.1)'}
        }
      },
      plugins:{
        legend:{ display:false },
        title: {
          display: true,
          text: 'Distribución Mensual de Gastos',
          color: '#333333', /* Changed to dark text */
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip:{ callbacks:{ label:(ctx)=> `${ctx.dataset.label}: ${fmt(ctx.parsed.y)} €` } }
      }
    }
  });

  legend.innerHTML = '';
  dist.datasets.forEach((ds, index) => {
    const el = document.createElement('div');
    el.className = 'item legend-item';
    el.dataset.index = index;
    el.dataset.active = 'true';
    el.innerHTML = `<span class="swatch" style="background:${ds.backgroundColor}"></span>${ds.label}`;
    
    // Add click event to toggle dataset visibility
    el.addEventListener('click', () => {
      const isActive = el.dataset.active === 'true';
      el.dataset.active = isActive ? 'false' : 'true';
      chart.getDatasetMeta(index).hidden = isActive;
      chart.update();
      
      // Update visual state
      if (isActive) {
        el.style.opacity = '0.5';
        el.style.textDecoration = 'line-through';
      } else {
        el.style.opacity = '1';
        el.style.textDecoration = 'none';
      }
    });
    
    legend.appendChild(el);
  });
}