const STORAGE_KEY = 'gs_seguros_v1';
export { STORAGE_KEY };
export function load(){ try{ const raw=localStorage.getItem(STORAGE_KEY); const arr=raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch(e){ console.warn('load error',e); return []; } }
export function save(arr){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr||[])); }catch(e){ alert('No se pudo guardar en este dispositivo.'); } }