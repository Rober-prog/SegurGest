import { byId, monthsES, genColors, annualFromPayment, fmt } from './utils.js';
import { load } from './storage.js';

let chart;

function distributionByMonths(items){
  const labels = monthsES;
  const colors = genColors(items.length);
  const datasets = items.map((it, i)=>{
    const arr = new Array(12).fill(0);
    const enteredAmount = +it.amount || 0; // The 'importe total introducido'
    const start = it.startDate ? new Date(it.startDate) : null;
    const end = it.endDate ? new Date(it.endDate) : null;

    if(it.paymentForm==='Mensual'){
      // For monthly, enteredAmount is the monthly payment
      for(let m=0;m<12;m++) arr[m]+=enteredAmount;
    } else if(it.paymentForm==='Trimestral'){
      // For quarterly, enteredAmount is the annual total, so divide by 4 for per-quarter payment
      const perPeriodAmt = enteredAmount / 4;
      if(start){ const m0=start.getMonth(); [0,3,6,9].forEach(k=> arr[(m0+k)%12]+=perPeriodAmt); }
      else { [0,3,6,9].forEach(m=> arr[m]+=perPeriodAmt); }
    } else if(it.paymentForm==='Semestral'){
      // For semi-annual, enteredAmount is the annual total, so divide by 2 for per-semester payment
      const perPeriodAmt = enteredAmount / 2;
      if(start){ const m1=start.getMonth(), m2=(m1+6)%12; arr[m1]+=perPeriodAmt; arr[m2]+=perPeriodAmt; }
      else { [0,6].forEach(m=>arr[m]+=perPeriodAmt); }
    } else { // Anual
      // For annual, enteredAmount is the annual total
      if(start){ arr[start.getMonth()] += enteredAmount; } else { for(let m=0;m<12;m++) arr[m]+=enteredAmount/12; }
    }
    if(start && end){
      for(let m=0;m<12;m++){
        const sample = new Date(new Date().getFullYear(), m, 15);
        if(sample < start || sample > end){ arr[m]=0; }
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
    const annual = annualFromPayment(d);
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
          stacked:false,
          ticks:{
            color:'#666666',
            font: {
              size: 9 // Fuente pequeña para los meses
            }
          },
          grid:{ color:'rgba(0,0,0,.1)'},
          categoryPercentage: 0.7, // Reduce the space taken by the category
          barPercentage: 0.8 // Reduce the width of individual bars
        },
        y:{
          stacked:false,
          ticks:{
            color:'#666666',
            callback:(v)=> v>=1000? (v/1000)+'k' : v,
            min: 0, // Inicia desde 0 para una mejor representación de barras
            max: 2000, // Máximo valor en el eje Y
            stepSize: 100 // Incrementos de 100
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
  dist.datasets.forEach(ds=>{
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<span class="swatch" style="background:${ds.backgroundColor}"></span>${ds.label}`;
    legend.appendChild(el);
  });
}