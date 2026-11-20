/* Conexión con Spotify desde el navegador (OAuth con PKCE, sin servidor ni secretos).
   El Client ID lo pegas tú en Ajustes; no queda guardado en el código. */
const SP=(()=>{
  const AUTH='https://accounts.spotify.com/authorize',TOKEN='https://accounts.spotify.com/api/token',API='https://api.spotify.com/v1';
  const SCOPES='user-read-playback-state user-modify-playback-state user-read-currently-playing';
  const g=k=>{try{return localStorage.getItem('sp.'+k)}catch(e){return null}};
  const s=(k,v)=>{try{v==null?localStorage.removeItem('sp.'+k):localStorage.setItem('sp.'+k,v)}catch(e){}};
  const E=(code,msg,status)=>{const e=new Error(msg||code);e.code=code;e.status=status;return e};
  const redirect=()=>location.origin+location.pathname.replace(/index\.html$/,'');
  const rand=n=>{const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~',a=new Uint8Array(n);crypto.getRandomValues(a);return[...a].map(x=>c[x%c.length]).join('')};
  const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const ready=()=>!!(g('rt')&&g('cid'));

  async function login(){
    const cid=(g('cid')||'').trim();if(!cid)throw E('NOCID','Falta el Client ID');
    const v=rand(96),st=rand(16);s('v',v);s('state',st);
    const ch=b64u(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
    location.href=AUTH+'?'+new URLSearchParams({client_id:cid,response_type:'code',redirect_uri:redirect(),code_challenge_method:'S256',code_challenge:ch,scope:SCOPES,state:st});
  }
  function save(j){s('at',j.access_token);s('exp',String(Date.now()+Math.max(30,(j.expires_in||3600)-60)*1000));if(j.refresh_token)s('rt',j.refresh_token)}
  async function post(body){
    const r=await fetch(TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)});
    let j={};try{j=await r.json()}catch(e){}
    if(!r.ok)throw E(j.error==='invalid_grant'?'NOAUTH':'TOKEN',j.error_description||j.error||('Error '+r.status),r.status);
    return j;
  }
  /* Se llama al cargar la página: si volvemos desde Spotify con ?code=..., cambia el código por tokens. */
  async function callback(){
    const p=new URLSearchParams(location.search),code=p.get('code'),err=p.get('error');
    if(!code&&!err)return null;
    history.replaceState(null,'',redirect());
    if(err)return{error:'Spotify respondió: '+err};
    const v=g('v');
    if(!v||g('state')!==p.get('state'))return{error:'lost'};
    try{
      save(await post({grant_type:'authorization_code',code,redirect_uri:redirect(),client_id:g('cid'),code_verifier:v}));
      s('v',null);s('state',null);return{ok:true};
    }catch(e){return{error:e.message}}
  }
  let rp=null;
  function refresh(){
    if(rp)return rp;
    rp=(async()=>{try{
      if(!ready())throw E('NOAUTH','No hay sesión de Spotify');
      save(await post({grant_type:'refresh_token',refresh_token:g('rt'),client_id:g('cid')}));
    }catch(e){if(e.code==='NOAUTH'){s('rt',null);s('at',null)}throw e}finally{rp=null}})();
    return rp;
  }
  async function token(){if(!ready())throw E('NOAUTH','No hay sesión de Spotify');if(!g('at')||Date.now()>+g('exp'))await refresh();return g('at')}
  async function api(method,path,body){
    let t=await token();
    for(let i=0;i<2;i++){
      const r=await fetch(API+path,{method,headers:{Authorization:'Bearer '+t,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
      if(r.status===401&&i===0){await refresh();t=g('at');continue}
      if(r.status===204||r.status===202)return null;
      if(r.status===429)throw E('RATE','Spotify pide esperar un momento',429);
      let j=null;try{j=await r.json()}catch(e){}
      if(!r.ok)throw E(j?.error?.reason||('HTTP'+r.status),j?.error?.message||('Error '+r.status),r.status);
      return j;
    }
  }
  const search=async(title,artist)=>{
    const q=`track:${title} artist:${artist||''}`.trim();
    const j=await api('GET','/search?type=track&limit=5&q='+encodeURIComponent(q));
    return j?.tracks?.items||[];
  };
  const state=()=>api('GET','/me/player');
  const current=()=>api('GET','/me/player/currently-playing');
  const resume=()=>api('PUT','/me/player/play');
  const pause=()=>api('PUT','/me/player/pause');
  async function play(uri,pos){
    const body={uris:[uri],position_ms:pos||0};
    try{return await api('PUT','/me/player/play',body)}
    catch(e){
      if(e.status!==404)throw e;
      const d=(await api('GET','/me/player/devices'))?.devices||[];
      const dev=d.find(x=>x.is_active)||d.find(x=>!x.is_restricted);
      if(!dev)throw E('NODEVICE','Spotify no tiene un dispositivo activo');
      return api('PUT','/me/player/play?device_id='+encodeURIComponent(dev.id),body);
    }
  }
  const logout=()=>{['at','rt','exp','v','state'].forEach(k=>s(k,null))};
  const exportCode=()=>btoa(JSON.stringify({c:g('cid'),r:g('rt')}));
  async function importCode(txt){
    let o;try{o=JSON.parse(atob(String(txt).trim()))}catch(e){throw E('BADCODE','El código no es válido')}
    if(!o.c||!o.r)throw E('BADCODE','El código no es válido');
    s('cid',o.c);s('rt',o.r);s('at',null);s('exp',null);await refresh();
  }
  return{get:g,set:s,ready,redirect,login,callback,logout,search,state,current,play,resume,pause,exportCode,importCode};
})();
