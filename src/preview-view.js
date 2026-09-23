/** @param {unknown} value */
function serialized(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
/** @param {string} value */
function escaped(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** @param {{nonce: string, channel: string, text: Record<string, string>, locale: string, instance: string}} options */
export function previewDocument({ nonce, channel, text, locale, instance }) {
  return `<!doctype html><html lang="${locale === 'pt_BR' ? 'pt-BR' : 'en'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escaped(text.preview_title)} · Pubvero</title>
<style nonce="${nonce}">
:root{color-scheme:light dark;--paper:oklch(.992 .006 88);--ink:oklch(.205 .012 92);--muted:oklch(.47 .018 82);--line:oklch(.83 .018 84);--green:oklch(.385 .095 153);--on-green:oklch(.985 .008 92);--wash:oklch(.944 .013 88)}
@media(prefers-color-scheme:dark){:root{--paper:oklch(.205 .012 90);--ink:oklch(.935 .012 88);--muted:oklch(.72 .018 88);--line:oklch(.34 .018 88);--green:oklch(.71 .125 153);--on-green:oklch(.16 .02 153);--wash:oklch(.245 .014 90)}}
*{box-sizing:border-box}body{margin:0;height:100dvh;display:flex;flex-direction:column;background:var(--paper);color:var(--ink);font:1rem/1.5 'Avenir Next',Avenir,'Segoe UI',system-ui,sans-serif;scrollbar-color:var(--muted) var(--paper)}
::selection{background:var(--green);color:var(--on-green)}header{display:flex;align-items:center;gap:16px;padding:12px 24px;border-bottom:1px solid var(--line);flex-wrap:wrap}.brand{font-weight:600}.details{flex:1;min-width:0}h1{font-size:1rem;line-height:1.35;font-weight:600;margin:0;overflow-wrap:anywhere}.meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.875rem;color:var(--muted);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}button{font:inherit;font-size:.875rem;font-weight:600;min-height:44px;padding:10px 20px;border:0;border-radius:9px;background:var(--green);color:var(--on-green);cursor:pointer}button:hover{filter:brightness(.92)}button:focus-visible{outline:2px solid var(--green);outline-offset:3px}button:disabled{opacity:.65;cursor:wait}main{flex:1;min-height:0;display:flex;position:relative}iframe{border:0;width:100%;height:100%;background:white}#notice{max-width:65ch;padding:32px;margin:0;align-self:flex-start} [hidden]{display:none!important}@media(max-width:600px){header{padding:12px 16px;gap:8px 12px}.brand{width:100%}.details{min-width:160px}button{padding:10px 14px}#notice{padding:24px 16px}}
</style></head><body>
<header><span class="brand">Pubvero</span><div class="details"><h1 id="title">${escaped(text.preview_title)}</h1><div class="meta"><span>${escaped(instance)}</span><span id="status" role="status" aria-live="polite">${escaped(text.preview_loading)}</span></div></div><button id="reload" type="button">${escaped(text.preview_reload)}</button></header>
<main><p id="notice" role="alert" hidden></p><iframe title="${escaped(text.preview_title)}" sandbox="allow-scripts" referrerpolicy="no-referrer" hidden></iframe></main>
<script nonce="${nonce}">
(() => {
const text=${serialized(text)},channel=${serialized(channel)},locale=${serialized(locale === 'pt_BR' ? 'pt-BR' : 'en')};
const frame=document.querySelector('iframe'),button=document.querySelector('#reload'),status=document.querySelector('#status'),notice=document.querySelector('#notice');
let snapshot=null,active=0;
class PreviewError extends Error {}
async function request(path,body){const response=await fetch(path,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(35000)});const data=await response.json();if(!response.ok)throw new PreviewError(['file_unreadable','invalid_file'].includes(data.code)?text[data.code]:text.preview_query_failed);return data;}
async function reload(){button.disabled=true;button.textContent=text.preview_loading;status.textContent=text.preview_loading;notice.hidden=true;frame.hidden=true;frame.removeAttribute('src');snapshot=null;try{const data=await request('prepare',{});snapshot=data.snapshot;document.querySelector('#title').textContent=data.title;frame.src='frame/'+encodeURIComponent(snapshot);frame.hidden=false;status.textContent=text.preview_connected+' · '+text.preview_version+' '+new Intl.NumberFormat(locale).format(data.version);}catch(error){status.textContent=text.preview_unavailable;notice.textContent=(error instanceof PreviewError?error.message:text.preview_query_failed)+' '+text.preview_retry;notice.hidden=false;}finally{button.disabled=false;button.textContent=text.preview_reload;}}
window.addEventListener('message',async event=>{const message=event.data;if(event.source!==frame.contentWindow||!message||message.channel!==channel||typeof message.requestId!=='string'||message.requestId.length>128||!snapshot)return;if(!['page.query.request','page.viewer.request'].includes(message.type))return;const current=snapshot;const respond=(payload,error)=>{if(snapshot===current)frame.contentWindow.postMessage({channel,requestId:message.requestId,type:message.type.replace('.request','.response'),payload,error},'*');};if(active>=8){respond(undefined,text.preview_query_failed);return;}active++;try{const kind=message.type==='page.query.request'?'query':'viewer';respond(await request(kind,{snapshot:current,name:message.name,parameters:message.parameters}));}catch{respond(undefined,text.preview_query_failed);}finally{active--;}});
button.addEventListener('click',reload);void reload();
})();</script></body></html>`;
}

/** @param {string} html @param {string} channel @param {string} failure */
export function injectBridge(html, channel, failure) {
  const bridge = `<script>(()=>{const channel=${serialized(channel)},pending=new Map();let sequence=0;window.addEventListener('message',event=>{const message=event.data;if(event.source!==parent||!message||message.channel!==channel)return;const request=pending.get(message.requestId);if(!request||message.type!=='page.'+request.name+'.response')return;clearTimeout(request.timer);pending.delete(message.requestId);if(typeof message.error==='string')request.reject(new Error(message.error));else request.resolve(message.payload);});const send=(name,payload={})=>new Promise((resolve,reject)=>{const requestId=String(++sequence);if(pending.size>=8){reject(new Error(${serialized(failure)}));return;}const timer=setTimeout(()=>{pending.delete(requestId);reject(new Error(${serialized(failure)}));},40000);pending.set(requestId,{name,resolve,reject,timer});parent.postMessage({channel,requestId,type:'page.'+name+'.request',...payload},'*');});window.page=Object.freeze({viewer:()=>send('viewer'),query:(name,parameters={})=>send('query',{name,parameters})});})();</script>`;
  return /<head(?:\s[^>]*)?>/i.test(html)
    ? html.replace(/<head(?:\s[^>]*)?>/i, (match) => match + bridge)
    : bridge + html;
}
