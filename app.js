'use strict';
{
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const enc=encodeURIComponent;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mmss=ms=>{const t=Math.round(ms/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
let tt;const toast=(m,ms=4500)=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{t.hidden=true},ms)};

/* ---------- datos ---------- */
const LS='cancionero.v1';
let mine={},prefs={fs:innerWidth<500?15:17,mode:'play'},cur=null,genre='all';
try{mine=JSON.parse(localStorage.getItem(LS)||'{}')||{}}catch(e){}
try{Object.assign(prefs,JSON.parse(localStorage.getItem(LS+'.p')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(mine));localStorage.setItem(LS+'.p',JSON.stringify(prefs))}catch(e){toast('No se pudo guardar en este dispositivo')}};
function all(){const m=new Map(SEED.map(s=>[s.id,{...s}]));for(const[id,v]of Object.entries(mine)){if(v.deleted){m.delete(id);continue}m.set(id,{...(m.get(id)||{}),...v,id})}return[...m.values()]}
const get=id=>all().find(s=>s.id===id);
const upd=(id,patch)=>{mine[id]={...(mine[id]||{}),...patch,id,upd:Date.now()};save()};
const mkId=(t,a)=>norm(t+'-'+a).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const findSong=(t,a)=>all().find(s=>norm(s.t)===norm(t)&&(!a||!s.a||norm(s.a)===norm(a)));

/* ---------- acordes ---------- */
const CH=/^[A-G](#|b)?(maj|min|m|M|dim|aug|sus|add|°|\+)?\d*((sus|add|maj|b|#|\+|-)?\d+)*(sus[24]?)?(\/[A-G](#|b)?)?$/;
const ORN=/^(\||\|\||x\d+|×\d*|\d+x|-+|\.\.\.|n\.c\.|%|\/)$/i;
const core=t=>t.replace(/^[(\[|]+|[)\]|,.]+$/g,'');
const isCh=t=>CH.test(core(t));
const isChLine=l=>{const k=l.trim().split(/\s+/).filter(Boolean);return k.length>0&&k.every(t=>isCh(t)||ORN.test(core(t))||ORN.test(t))&&k.some(isCh)};
const SH=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],FL=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
function nt(n,s,f){let i=SH.indexOf(n);if(i<0)i=FL.indexOf(n);if(i<0)return n;return(f?FL:SH)[((i+s)%12+12)%12]}
function tr(ch,s){if(!s)return ch;return ch.replace(/^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/,(m,r,q,b)=>{const f=r.includes('b')||(s<0&&!r.includes('#'));return nt(r,s,f)+q+(b?'/'+nt(b,s,f):'')})}
function trTok(t,s){const m=t.match(/^([(\[|]*)(.*?)([)\]|,.]*)$/);return m&&CH.test(m[2])?m[1]+tr(m[2],s)+m[3]:t}
function trLine(l,s){let out='';l.replace(/\S+/g,(t,i)=>{if(out.length<i)out+=' '.repeat(i-out.length);else if(out.length>0&&out.length>=i)out+=' ';out+=trTok(t,s);return t});return out}
function trText(txt,s){return String(txt||'').split('\n').map(l=>isChLine(l)?trLine(l,s):l.replace(/\[([^\]]+)\]/g,(m,c)=>CH.test(c)?'['+tr(c,s)+']':m)).join('\n')}
function render(txt,s){
  const out=[];
  for(const l of String(txt||'').replace(/\r/g,'').split('\n')){
    const t=l.trim();let m;
    if(/^\{(soc|start_of_chorus)\}$/i.test(t)){out.push('<div class="sec">Coro</div>');continue}
    if(/^\{(eoc|end_of_chorus|title|t|artist|subtitle|st|key|capo|tempo)\b/i.test(t))continue;
    if(m=t.match(/^\{(?:comment|c|ci):\s*(.*)\}$/i)){out.push('<div class="note">'+esc(m[1])+'</div>');continue}
    if((m=t.match(/^\[([^\]]+)\]$/))&&!CH.test(m[1])){out.push('<div class="sec">'+esc(m[1])+'</div>');continue}
    if((m=t.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ0-9 /()-]{2,22}):\s*(.*)$/))&&(!m[2]||isChLine(m[2]))){out.push('<div class="sec">'+esc(m[1])+'</div>');if(m[2])out.push('<div class="c">'+esc(trLine(m[2],s))+'</div>');continue}
    if(isChLine(l)){out.push('<div class="c">'+esc(trLine(l,s))+'</div>');continue}
    if(/^\(.*\)$/.test(t)){out.push('<div class="note">'+esc(t)+'</div>');continue}
    if(/\[[^\]]+\]/.test(l)){out.push('<div class="ly">'+esc(l).replace(/\[([^\]]+)\]/g,(x,c)=>CH.test(c)?'<span class="ic">'+esc(tr(c,s))+'</span>':x)+'</div>');continue}
    out.push('<div class="ly">'+esc(l)+'</div>');
  }
  return out.join('');
}

/* ---------- lista ---------- */
function drawChips(){const o=[['all','Todas'],...Object.entries(GEN).filter(([k])=>k!=='otro'),['mine','Mis canciones']];$('#chips').innerHTML=o.map(([k,v])=>`<button class="chip" data-g="${k}" aria-pressed="${genre===k}">${v}</button>`).join('')}
function drawList(){
  const q=norm($('#q').value).trim();
  let songs=all().filter(s=>genre==='all'||(genre==='mine'?(!s.seed||mine[s.id]?.c):s.g===genre));
  if(q)songs=songs.filter(s=>norm([s.t,s.a,GEN[s.g],s.c].join(' ')).includes(q));
  songs.sort((a,b)=>a.t.localeCompare(b.t,'es'));
  if(!songs.length){$('#list').innerHTML='<p class="empty">Nada por aquí. Prueba otra búsqueda o agrega la canción con “+ Nueva”.</p>';return}
  const by={};songs.forEach(s=>(by[s.g||'otro']=by[s.g||'otro']||[]).push(s));
  $('#list').innerHTML=Object.keys(GEN).filter(g=>by[g]).map(g=>`<h2 class="grp">${GEN[g]}</h2>`+by[g].map(s=>`<button class="item" data-id="${esc(s.id)}" aria-current="${cur===s.id}"><div><b>${esc(s.t)}</b><span>${esc(s.a)}</span></div><span class="k ${s.c?'':'no'}">${s.c?esc(s.k?tr(s.k,s.tr||0):'♪'):'sin acordes'}</span></button>`).join('')).join('');
}

/* ---------- canción ---------- */
const links=s=>`Buscar acordes: <a href="https://www.google.com/search?q=${enc('acordes '+s.t+' '+s.a+' lacuerda')}" target="_blank" rel="noopener">LaCuerda</a> · <a href="https://www.google.com/search?q=${enc('cifra club '+s.t+' '+s.a)}" target="_blank" rel="noopener">Cifra Club</a> · <a href="https://www.ultimate-guitar.com/search.php?search_type=title&value=${enc(s.t+' '+s.a)}" target="_blank" rel="noopener">Ultimate Guitar</a>`;
function shareText(s){const t=s.tr||0;return `🎸 ${s.t} — ${s.a}${s.k?'\nTono: '+tr(s.k,t):''}\n\n${s.c?trText(s.c,t):'(sin acordes todavía)'}`}
const modeSel=()=>`<select class="mode" id="mode" aria-label="Modo de reproducción"><option value="play"${prefs.mode==='play'?' selected':''}>Spotify: suena y avanza</option><option value="follow"${prefs.mode==='follow'?' selected':''}>Spotify: solo seguir lo que suena</option><option value="off"${prefs.mode==='off'?' selected':''}>Sin música: avance manual</option></select>`;
function spBlock(s){
  let x='';
  if(prefs.mode!=='off'){
    if(!SP.ready())x=`<button class="btn sm" id="spConnect">Conectar Spotify</button><span class="msg">para que suene y avance sola</span>`;
    else if(s.sp?.uri)x=`<a class="btn sm" href="${esc(s.sp.url||'https://open.spotify.com')}" target="_blank" rel="noopener">Abrir en Spotify</a><button class="btn sm" id="spPick">Cambiar versión</button><span class="msg">${esc(s.sp.name||'')}${s.sp.dur?' · '+mmss(s.sp.dur):''}${s.anchors?.length?` · ${s.anchors.length} marca(s)`:''}</span>`;
    else x=`<button class="btn sm" id="spFind">Buscar en Spotify</button><span class="msg" id="spMsg"></span>`;
  }
  return `<div class="row">${modeSel()}${x}</div>`;
}
function drawSong(){
  stopAll();const s=cur&&get(cur);
  if(!s){$('#song').innerHTML='<div class="blank"><div><h3>Elige una canción</h3><p>Busca arriba o toca una de la lista. Con “+ Nueva” pegas tus propias hojas de acordes.</p></div></div>';return}
  const t=s.tr||0;
  $('#song').innerHTML=`
  <div class="shead">
    <div class="row"><button class="btn sm back" id="back">← Lista</button><span class="msg">${GEN[s.g]||''}</span></div>
    <h2>${esc(s.t)}</h2>
    <div class="meta">${esc(s.a)}${s.k?` · Tono <b>${esc(tr(s.k,t))}</b>`:''}${t?` (${t>0?'+':''}${t})`:''}</div>
    ${spBlock(s)}
  </div>
  <div class="sheetWrap" id="sw"><div class="sheet" id="sheet" style="--fs:${prefs.fs}px">${s.c?render(s.c,t):`<div class="note">Esta canción todavía no tiene acordes. Búscalos en los enlaces de abajo y pégalos con “Pegar hoja”.</div><p><button class="btn pri" id="paste">Pegar hoja</button></p>`}</div>
    ${s.seed&&s.c&&!mine[s.id]?.c?`<p class="hint" style="margin-top:2em">${REF}</p>`:''}
    <p class="hint" style="margin-top:1em">${links(s)}</p></div>
  <div class="bar">
    <button class="play" id="play" aria-label="Iniciar">▶</button>
    <div class="ctl spd"><label for="spd">Velocidad</label><input type="range" id="spd" min="4" max="120" value="${s.spd||25}"><output id="spdO">${s.spd||25}</output></div>
    <div class="ctl"><label>Tono</label><button class="sq" data-tr="-1" aria-label="Bajar semitono">−</button><output>${t>0?'+':''}${t}</output><button class="sq" data-tr="1" aria-label="Subir semitono">+</button></div>
    <div class="ctl"><label>Letra</label><button class="sq" data-fs="-1" aria-label="Achicar">A−</button><button class="sq" data-fs="1" aria-label="Agrandar">A+</button></div>
    <div class="acts"><a class="btn sm" id="wa" href="#" target="_blank" rel="noopener">WhatsApp</a><button class="btn sm" id="copy">Copiar</button><button class="btn sm" id="edit">Editar</button>${!s.seed?'<button class="btn sm" id="del">Borrar</button>':''}</div>
  </div>
  <div class="fol" id="fol" hidden><span class="msg" id="folMsg">…</span><button class="btn sm pri" id="mark">Marcar aquí</button><button class="btn sm" id="resume">Retomar</button>${s.anchors?.length?'<button class="btn sm" id="clrMarks">Borrar marcas</button>':''}</div>`;
  $('#wa').href='https://wa.me/?text='+enc(shareText(s));
}
const redraw=()=>{const y=$('#sw')?.scrollTop||0;drawSong();const w=$('#sw');if(w)w.scrollTop=y};

/* ---------- avance manual ---------- */
let playing=false,pos=0,last=0,lock=null;
const setPlay=on=>{const p=$('#play');if(p){p.textContent=on?'❚❚':'▶';p.setAttribute('aria-label',on?'Pausar':'Iniciar')}};
async function lockOn(){try{lock=await navigator.wakeLock?.request('screen')}catch(e){}}
function lockOff(){try{lock?.release()}catch(e){}lock=null}
function manualFrame(ts){if(!playing)return;const sw=$('#sw');if(!sw){manualStop();return}const dt=last?(ts-last)/1000:0;last=ts;
  if(Math.abs(sw.scrollTop-pos)>3)pos=sw.scrollTop;pos+=(+($('#spd')?.value||25))*dt;sw.scrollTop=pos;
  if(sw.scrollTop+sw.clientHeight>=sw.scrollHeight-2){manualStop();return}requestAnimationFrame(manualFrame)}
function manualStart(){const sw=$('#sw');if(!sw)return;playing=true;pos=sw.scrollTop;last=0;setPlay(true);lockOn();requestAnimationFrame(manualFrame)}
function manualStop(){if(!playing)return;playing=false;setPlay(false);lockOff()}

/* ---------- seguir a Spotify ---------- */
let fol=null;
function mapY(t,s,dur){dur=dur||s.sp?.dur||1;t=Math.max(0,t);const a=(s.anchors||[]).filter(p=>p.t>0&&p.t<dur).sort((x,y)=>x.t-y.t);const pts=[{t:0,y:0},...a,{t:dur,y:1}];
  for(let i=1;i<pts.length;i++){if(t<=pts[i].t){const p=pts[i-1],q=pts[i];return p.y+(q.y-p.y)*((t-p.t)/Math.max(1,q.t-p.t))}}return 1}
const nowMs=()=>{const r=fol?.ref;return r?r.pos+(r.playing?performance.now()-r.t0:0):null};
const folMsg=t=>{const m=$('#folMsg');if(m)m.textContent=t};
function folStop(note){if(fol){clearInterval(fol.timer);cancelAnimationFrame(fol.raf);fol=null}const f=$('#fol');if(f)f.hidden=true;setPlay(false);lockOff();if(note)toast(note)}
function stopAll(){manualStop();folStop()}
async function folPoll(){
  if(!fol)return;
  try{
    const st=await SP.state();if(!fol)return;
    if(!st||!st.item){fol.ref=null;folMsg('Esperando que suene en Spotify…');return}
    if(st.item.uri!==fol.uri){folStop('Ahora suena otro tema en Spotify: dejé de seguirlo.');return}
    fol.ref={pos:st.progress_ms,t0:performance.now(),playing:st.is_playing,dur:st.item.duration_ms};
    folMsg(!st.is_playing?'En pausa en Spotify':fol.hold?'Scroll en pausa: toca Marcar aquí o Retomar':'Siguiendo a Spotify');
  }catch(e){folMsg(errText(e));if(e.code==='NOAUTH')folStop()}
}
function folFrame(){
  if(!fol)return;const sw=$('#sw'),t=nowMs();
  if(sw&&t!=null&&!fol.hold){const max=sw.scrollHeight-sw.clientHeight;sw.scrollTop=mapY(t,get(fol.id),fol.ref.dur)*max;if(t>=fol.ref.dur+1500){folStop();return}}
  fol.raf=requestAnimationFrame(folFrame);
}
async function folStart(s){
  stopAll();fol={uri:s.sp.uri,id:s.id,ref:null,hold:false};setPlay(true);$('#fol').hidden=false;folMsg('Conectando…');lockOn();
  await folPoll();if(!fol)return;
  fol.timer=setInterval(folPoll,3000);fol.raf=requestAnimationFrame(folFrame);
}
function mark(){
  if(!fol||!fol.ref)return;const s=get(fol.id),sw=$('#sw'),t=Math.round(nowMs()),max=sw.scrollHeight-sw.clientHeight;
  const a=(s.anchors||[]).filter(p=>Math.abs(p.t-t)>4000);a.push({t,y:+(max?sw.scrollTop/max:0).toFixed(4)});
  upd(s.id,{anchors:a});fol.hold=false;folMsg('Siguiendo a Spotify');toast('Marca guardada ('+mmss(t)+')');
}
function errText(e){
  const m={NOAUTH:'Conecta Spotify en ⚙ Ajustes.',NOCID:'Falta el Client ID en Ajustes.',NODEVICE:'Abre la app de Spotify en este dispositivo, reproduce algo un segundo y vuelve a intentar.',PREMIUM_REQUIRED:'Spotify exige Premium para controlar la reproducción.',RATE:'Spotify pide esperar un momento. Reintenta en unos segundos.',BADCODE:'Ese código no es válido.'};
  if(m[e.code])return m[e.code];
  if(e.status===403)return 'Spotify rechazó la petición (403). Revisa que tu usuario esté agregado en User Management de tu app en el panel de Spotify.';
  if(e instanceof TypeError)return 'Sin conexión con Spotify.';
  return e.message||'Error con Spotify';
}
function toSp(t){return{uri:t.uri,url:t.external_urls?.spotify,dur:t.duration_ms,name:`${t.name} — ${(t.artists||[]).map(a=>a.name).join(', ')}`}}
async function spFind(s){
  const r=await SP.search(s.t,s.a);if(!r.length)return null;
  const pick=r.find(x=>norm(x.name)===norm(s.t)&&(!s.a||x.artists.some(a=>norm(a.name).includes(norm(s.a).split(' ')[0]))))||r[0];
  upd(s.id,{sp:toSp(pick),anchors:[]});return pick;
}
async function onPlay(){
  const s=cur&&get(cur);if(!s)return;
  if(playing||fol){if(fol&&prefs.mode==='play'){try{await SP.pause()}catch(e){}}stopAll();return}
  const m=prefs.mode;
  if(m==='off'){manualStart();return}
  if(!SP.ready()){toast('Spotify no está conectado (⚙ Ajustes). Uso avance manual.');manualStart();return}
  try{
    if(!s.sp?.uri)await spFind(s);
    const s2=get(s.id);
    if(!s2.sp?.uri){toast('No encontré el tema en Spotify. Uso avance manual.');manualStart();return}
    if(m==='play'){
      const st=await SP.state();
      if(st?.item?.uri===s2.sp.uri){if(!st.is_playing)await SP.resume()}else await SP.play(s2.sp.uri,0);
      await sleep(600);
    }
    redraw();const s3=get(s.id);await folStart(s3);
  }catch(e){toast(errText(e),7000)}
}
async function nowPlaying(){
  if(!SP.ready()){openSettings();return}
  const b=$('#nowBtn');b.textContent='…';
  try{
    const st=await SP.current(),it=st?.item;b.textContent='♪ Suena';
    if(!it){toast('Spotify no está reproduciendo nada ahora');return}
    const art=(it.artists||[]).map(a=>a.name).join(', '),n=norm(it.name).replace(/\s*[-(].*$/,'');
    const hit=all().find(x=>norm(x.t)===n||norm(x.t).startsWith(n)||(n.length>3&&n.startsWith(norm(x.t))));
    if(hit){if(!hit.sp?.uri)upd(hit.id,{sp:toSp(it)});open(hit.id);return}
    openForm(null,{t:it.name,a:art,sp:toSp(it)});$('#fMsg').textContent='Suena en Spotify y no está en tu cancionero: pega sus acordes.';
  }catch(e){b.textContent='♪ Suena';toast(errText(e),6000)}
}
async function pickVersion(){
  const s=get(cur);$('#spList').innerHTML='<p class="msg">Buscando…</p>';$('#spDlg').showModal();
  try{
    const r=await SP.search(s.t,s.a);
    $('#spList').innerHTML=r.length?r.map((x,i)=>`<button class="pick" data-i="${i}"><b>${esc(x.name)}</b><span>${esc((x.artists||[]).map(a=>a.name).join(', '))} · ${esc(x.album?.name||'')} · ${mmss(x.duration_ms)}</span></button>`).join(''):'<p class="msg">Sin resultados.</p>';
    $('#spList').onclick=e=>{const b=e.target.closest('.pick');if(!b)return;upd(s.id,{sp:toSp(r[+b.dataset.i]),anchors:[]});$('#spDlg').close();redraw()};
  }catch(e){$('#spList').innerHTML='<p class="msg">'+esc(errText(e))+'</p>'}
}

/* ---------- formulario ---------- */
let editing=null,pendingSp=null;
$('#fG').innerHTML=Object.entries(GEN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
function openForm(id,pre){
  editing=id;const s=id?get(id):{g:genre in GEN?genre:'otro',...pre};pendingSp=pre?.sp||null;
  $('#dlgT').textContent=id?'Editar canción':'Agregar canción';$('#fT').value=s.t||'';$('#fA').value=s.a||'';$('#fG').value=s.g||'otro';$('#fK').value=s.k||'';$('#fC').value=s.c||'';$('#fMsg').textContent='';
  $('#dlg').showModal();
}
$('#fC').addEventListener('paste',()=>setTimeout(()=>{const v=$('#fC').value,g=k=>(v.match(new RegExp('\\{(?:'+k+'):\\s*([^}]*)\\}','i'))||[])[1];
  if(!$('#fT').value&&g('title|t'))$('#fT').value=g('title|t');if(!$('#fA').value&&g('artist|subtitle|st'))$('#fA').value=g('artist|subtitle|st');if(!$('#fK').value&&g('key'))$('#fK').value=g('key')},0));
$('#form').addEventListener('submit',e=>{
  e.preventDefault();if(e.submitter?.value==='cancel'){$('#dlg').close();return}
  const t=$('#fT').value.trim();if(!t){$('#fMsg').textContent='Falta el título';return}
  const a=$('#fA').value.trim(),id=editing||findSong(t,a)?.id||mkId(t,a);
  const patch={t,a,g:$('#fG').value,k:$('#fK').value.trim(),c:$('#fC').value.replace(/\t/g,'    ')};
  if(pendingSp)patch.sp=pendingSp;
  upd(id,patch);$('#dlg').close();drawList();open(id);
});

/* ---------- ajustes, respaldo, importación ---------- */
function setStat(){$('#spStat').textContent=SP.ready()?'Conectado.':'Sin conectar.';$('#cid').value=SP.get('cid')||'';$('#ruri').value=SP.redirect()}
function openSettings(){setStat();$('#setDlg').showModal()}
async function exportBackup(){
  const blob=new Blob([JSON.stringify({v:1,mine,prefs},null,1)],{type:'application/json'}),f=new File([blob],'cancionero-respaldo.json',{type:'application/json'});
  if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f],title:'Respaldo del cancionero'});return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}
async function importBackup(file){
  try{const o=JSON.parse(await file.text());let n=0;
    for(const[id,v]of Object.entries(o.mine||{})){if(!mine[id]||(v.upd||0)>=(mine[id].upd||0)){mine[id]=v;n++}}
    save();drawList();toast(n+' canción(es) importadas del respaldo')}catch(e){toast('El archivo no es un respaldo válido')}
}
async function importSheets(files){
  let n=0;
  for(const f of files){
    const txt=(await f.text()).replace(/\r/g,''),dir=k=>(txt.match(new RegExp('\\{(?:'+k+'):\\s*([^}]*)\\}','i'))||[])[1];
    const name=f.name.replace(/\.[^.]+$/,'');let a=dir('artist|subtitle|st'),t=dir('title|t');
    if(!t){const m=name.match(/^(.+?)\s+-\s+(.+)$/);if(m){a=a||m[1];t=m[2]}else t=name}
    t=t.trim();a=(a||'').trim();const ex=findSong(t,a);
    upd(ex?.id||mkId(t,a),{t:ex?.t||t,a:ex?.a||a,g:ex?.g||(genre in GEN?genre:'otro'),k:(dir('key')||ex?.k||'').trim(),c:txt});n++;
  }
  drawList();toast(n+' hoja(s) importada(s)');
}

/* ---------- navegación y eventos ---------- */
function open(id,push=true){
  stopAll();cur=id;
  const reading=document.body.classList.contains('reading');
  try{if(push&&innerWidth<900&&!reading)history.pushState({s:id},'','#'+id);else history.replaceState({s:id},'','#'+id)}catch(e){}
  document.body.classList.add('reading');drawList();drawSong();
}
addEventListener('popstate',e=>{if(e.state?.s&&get(e.state.s)){open(e.state.s,false)}else{stopAll();document.body.classList.remove('reading')}});
const fit=()=>document.documentElement.style.setProperty('--toph',$('#top').offsetHeight+'px');

document.addEventListener('click',e=>{
  const el=e.target.closest('button,a');if(!el)return;const s=cur&&get(cur);
  if(el.dataset.g){genre=el.dataset.g;drawChips();drawList();return}
  if(el.dataset.id){open(el.dataset.id);return}
  switch(el.id){
    case'back':if(history.state?.s)history.back();else{stopAll();document.body.classList.remove('reading')}return;
    case'play':onPlay();return;
    case'mark':mark();return;
    case'resume':if(fol){fol.hold=false;folMsg('Siguiendo a Spotify')}return;
    case'clrMarks':if(s){upd(s.id,{anchors:[]});redraw();toast('Marcas borradas')}return;
    case'copy':if(s)navigator.clipboard?.writeText(shareText(s)).then(()=>toast('Copiado')).catch(()=>toast('No se pudo copiar'));return;
    case'edit':case'paste':if(s)openForm(s.id);return;
    case'del':if(s){if(el.dataset.sure){upd(s.id,{deleted:true});cur=null;document.body.classList.remove('reading');drawList();drawSong()}else{el.dataset.sure=1;el.textContent='¿Seguro? Toca otra vez'}}return;
    case'spFind':if(s){const m=$('#spMsg');m.textContent='Buscando…';spFind(s).then(r=>{if(r)redraw();else m.textContent='No la encontré en Spotify'}).catch(err=>{m.textContent=errText(err)})}return;
    case'spPick':pickVersion();return;
    case'spClose':$('#spDlg').close();return;
    case'spConnect':case'setBtn':openSettings();return;
    case'nowBtn':nowPlaying();return;
    case'addBtn':openForm(null);return;
    case'setClose':$('#setDlg').close();return;
    case'copyRuri':navigator.clipboard?.writeText($('#ruri').value).then(()=>toast('Redirect URI copiada')).catch(()=>toast('Cópiala manualmente'));return;
    case'spLogin':{const cid=$('#cid').value.trim();if(!cid){toast('Pega primero el Client ID');return}SP.set('cid',cid);SP.login().catch(err=>toast(errText(err)));return}
    case'spOut':SP.logout();setStat();redraw();toast('Spotify desconectado');return;
    case'copyCode':if(!SP.ready()){toast('Primero conecta Spotify en este navegador')}else navigator.clipboard?.writeText(SP.exportCode()).then(()=>toast('Código copiado')).catch(()=>toast('No se pudo copiar'));return;
    case'useCode':SP.importCode($('#codeIn').value).then(()=>{setStat();$('#codeIn').value='';redraw();toast('Spotify conectado')}).catch(err=>toast(errText(err)));return;
    case'expBk':exportBackup();return;
    case'impBk':$('#fBk').click();return;
    case'impTxt':$('#fTxt').click();return;
    case'instBtn':if(dip){dip.prompt();dip=null;el.hidden=true}return;
  }
  if(el.dataset.tr&&s){upd(s.id,{tr:((s.tr||0)+ +el.dataset.tr+18)%12-6});redraw();drawList();return}
  if(el.dataset.fs){prefs.fs=Math.min(30,Math.max(11,prefs.fs+ +el.dataset.fs*2));save();$('#sheet').style.setProperty('--fs',prefs.fs+'px')}
});
document.addEventListener('input',e=>{
  if(e.target.id==='q')drawList();
  if(e.target.id==='spd'&&cur){$('#spdO').textContent=e.target.value;upd(cur,{spd:+e.target.value})}
});
document.addEventListener('change',e=>{if(e.target.id==='mode'){prefs.mode=e.target.value;save();redraw()}});
$('#fBk').addEventListener('change',e=>{if(e.target.files[0])importBackup(e.target.files[0]);e.target.value=''});
$('#fTxt').addEventListener('change',e=>{if(e.target.files.length)importSheets([...e.target.files]);e.target.value=''});
/* tocar la hoja mientras avanza: en manual se detiene; siguiendo a Spotify se pausa el scroll hasta "Retomar" o "Marcar aquí" */
const touch=e=>{if(!e.target.closest('#sw'))return;if(playing)manualStop();if(fol&&!fol.hold){fol.hold=true;folMsg('Scroll en pausa: toca Marcar aquí o Retomar')}};
['touchstart','wheel','pointerdown'].forEach(n=>document.addEventListener(n,touch,{passive:true}));
let dip=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#instBtn').hidden=false});
new ResizeObserver(fit).observe($('#top'));

/* ---------- arranque ---------- */
drawChips();
const h=location.hash.slice(1);
if(h&&get(h)){cur=h;if(innerWidth<900)document.body.classList.add('reading')}else if(innerWidth>=900)cur='wish-you-were-here';
drawList();drawSong();fit();
SP.callback().then(r=>{
  if(!r)return;
  if(r.ok){toast('Spotify conectado');redraw();return}
  if(r.error==='lost'){openSettings();$('#spStat').textContent='Volviste de Spotify a otro contexto del navegador (típico de iPhone/iPad). Conecta desde Safari y pasa el código de enlace a la app instalada.';return}
  openSettings();$('#spStat').textContent=r.error;
});
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
}
