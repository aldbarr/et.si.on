// ---------- stockage ----------
const LS = {
  get(k, d){ try{ const v = localStorage.getItem("esof_"+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("esof_"+k, JSON.stringify(v)); return true; }catch(e){ return false; } }
};
const S = {
  profile: LS.get("profile", null),          // {kids:[{n,a}], adults:"1"|"2"|"auto", mats:[]}
  ctx: LS.get("ctx", {time:60, energy:"all", place:"all"}),
  weather: LS.get("weather", null),          // {k, src:"auto"|"manual", temp, city, at}
  favs: LS.get("favs", []),
  journal: LS.get("journal", []),            // {id, act, date, note, stars, photo}
  cat: "all", tab: "idees"
};
S.lang = LS.get("lang", null) || ((navigator.language||"fr").slice(0,2) === "de" ? "de" : (navigator.language||"fr").slice(0,2) === "en" ? "en" : "fr");
const save = k => LS.set(k, S[k]);
const T = (k, ...a) => { const v = (UI[S.lang] && UI[S.lang][k] !== undefined) ? UI[S.lang][k] : UI.fr[k]; return typeof v === "function" ? v(...a) : v; };
const TRS = {en: typeof TR_EN !== "undefined" ? TR_EN : {}, de: typeof TR_DE !== "undefined" ? TR_DE : {}};
const L = a => { const tr = (TRS[S.lang] || {})[a.id]; return tr ? {t: tr.t || a.t, desc: tr.desc || a.desc, s: tr.s || a.s, v: Object.assign({}, a.v, tr.v || {})} : a; };
const catL = k => T("C")[k], wL = k => T("W")[k], matL = k => T("M")[k];
function setLang(l){ S.lang = l; save("lang"); document.documentElement.lang = l; document.title = T("htmlTitle"); render(); }
const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const byId = id => ACTS.find(a => a.id === id);
const band = age => age <= 2 ? "b" : age <= 5 ? "p" : age <= 11 ? "e" : "a";
function hash(s){ let h=2166136261; for(const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619);} return h>>>0; }
function rng(seed){ let x = seed || 1; return () => { x ^= x<<13; x ^= x>>>17; x ^= x<<5; return ((x>>>0)%10000)/10000; }; }
const fmtD = m => { const h = S.lang === "de" ? " Std." : " h", mn = S.lang === "de" ? " Min." : " min"; return m >= 120 ? `${Math.round(m/60)}${h}` : m >= 60 ? (m%60 ? `${Math.floor(m/60)}${h} ${m%60}${mn}` : `1${h}`) : `${m}${mn}`; };
const daysAgo = iso => Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);

// ---------- illustrations SVG ----------
function illus(a, big){
  const c = CATS[a.cat].c, r = rng(hash(a.id)), W = 400, H = 250;
  const out = a.w === "out", ok = a.ok || [];
  let deco = "";
  for(let i=0;i<6;i++){ const x=r()*W, y=r()*H*.7, s=20+r()*60; deco += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(0)}" fill="#fff" opacity="${(.12+r()*.18).toFixed(2)}"/>`; }
  for(let i=0;i<10;i++){ const x=r()*W, y=r()*H; deco += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2+r()*4).toFixed(1)}" fill="${c[2]}" opacity=".25"/>`; }
  let sky = "";
  if(a.w !== "in"){
    if(ok.includes("snow") && !ok.includes("sun")){ for(let i=0;i<16;i++) sky += `<text x="${(r()*W).toFixed(0)}" y="${(r()*H*.75).toFixed(0)}" font-size="${(10+r()*10).toFixed(0)}" fill="#fff" opacity=".9">❄</text>`; }
    else if(ok.includes("rain") && !ok.includes("sun")){ for(let i=0;i<22;i++){ const x=r()*W, y=r()*H*.7; sky += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x-6).toFixed(0)}" y2="${(y+14).toFixed(0)}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`; } }
    else { sky += `<circle cx="58" cy="50" r="26" fill="#FFE15C"/><circle cx="58" cy="50" r="38" fill="#FFE15C" opacity=".3"/>`; }
    sky += `<path d="M0 ${H-45} Q100 ${H-80} 200 ${H-50} T400 ${H-55} V${H} H0Z" fill="${ok.includes("snow")&&!ok.includes("sun")?"#fff":"#7BC96F"}" opacity=".85"/>`;
  } else {
    sky += `<rect x="0" y="${H-40}" width="${W}" height="40" fill="${c[2]}" opacity=".18"/><rect x="40" y="30" width="70" height="60" rx="6" fill="#fff" opacity=".35"/><line x1="75" y1="30" x2="75" y2="90" stroke="${c[1]}" stroke-width="4" opacity=".4"/><line x1="40" y1="60" x2="110" y2="60" stroke="${c[1]}" stroke-width="4" opacity=".4"/>`;
  }
  const g = "g"+a.id.replace(/[^a-z0-9]/g,"");
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(L(a).t)}">
<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>
<filter id="sh${g}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".18"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#${g})"/>${deco}${sky}
<circle cx="200" cy="125" r="72" fill="#fff" opacity=".55"/>
<g filter="url(#sh${g})"><text x="200" y="152" font-size="88" text-anchor="middle">${a.e[0]}</text></g>
<text x="${102+r()*12}" y="${200-r()*20}" font-size="44" text-anchor="middle" transform="rotate(${-14+r()*8} 110 190)">${a.e[1]}</text>
<text x="${292+r()*12}" y="${110+r()*20}" font-size="40" text-anchor="middle" transform="rotate(${8+r()*10} 300 110)">${a.e[2]}</text>
</svg>`;
}

// ---------- météo ----------
function codeToK(code, temp){
  if([71,73,75,77,85,86].includes(code)) return "snow";
  if((code>=51&&code<=67)||(code>=80&&code<=82)||code>=95) return "rain";
  if(temp >= 27) return "hot";
  if(temp <= 5) return "cold";
  if(code <= 1) return "sun";
  return "cloud";
}
async function fetchWeather(lat, lon, city){
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const ctl = new AbortController(); const t = setTimeout(()=>ctl.abort(), 6000);
  const j = await (await fetch(u, {signal: ctl.signal})).json(); clearTimeout(t);
  const temp = Math.round(j.current.temperature_2m), code = j.current.weather_code;
  S.weather = {k: codeToK(code, temp), src:"auto", temp, city: city || T("myPos"), at: Date.now(), lat, lon};
  save("weather"); render();
}
async function geocode(q){
  const ctl = new AbortController(); const t = setTimeout(()=>ctl.abort(), 6000);
  const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=fr`, {signal: ctl.signal})).json(); clearTimeout(t);
  if(!j.results || !j.results.length) throw new Error("introuvable");
  const p = j.results[0]; await fetchWeather(p.latitude, p.longitude, p.name);
}
function autoWeather(silent){
  // rafraîchir si la météo auto date de plus de 2 h
  if(S.weather && S.weather.src === "auto" && S.weather.lat && Date.now() - S.weather.at > 72e5){
    fetchWeather(S.weather.lat, S.weather.lon, S.weather.city).catch(()=>{});
  }
  if(S.weather) return;
  if(!navigator.geolocation){ if(!silent) openWeather(); return; }
  try{
    navigator.geolocation.getCurrentPosition(
      p => fetchWeather(p.coords.latitude.toFixed(3), p.coords.longitude.toFixed(3)).catch(()=>{ if(!silent) openWeather(true); }),
      () => { if(!silent) openWeather(true); }, {timeout:7000});
  }catch(e){ if(!silent) openWeather(true); }
}

// ---------- moteur de suggestion ----------
function ages(){ return (S.profile?.kids || []).map(k => +k.a); }
function evaluate(a){
  const K = ages(), wk = S.weather?.k || "cloud", ctx = S.ctx, P = S.profile || {};
  const fit = K.filter(x => x >= a.a[0] && x <= a.a[1]);
  if(K.length && !fit.length) return null;
  // lieu & météo
  const outdoorOK = a.w !== "in" && (a.ok || []).includes(wk);
  if(a.w === "out" && !outdoorOK) return null;
  if(ctx.place === "in" && a.w === "out") return null;
  if(ctx.place === "out" && (a.w === "in" || !outdoorOK)) return null;
  // adultes
  if(P.adults === "auto" && (a.ad || Math.min(...K) < 10)) return null;
  // temps
  if(a.d > ctx.time * 1.5) return null;
  let s = 10;
  if(fit.length === K.length) s += 4; else s += fit.length;
  if(ctx.energy !== "all" && a.en === ctx.energy) s += 4; else if(ctx.energy !== "all") s -= 2;
  if(outdoorOK){ s += (wk === "rain" || wk === "snow") ? 4 : (wk === "sun" || wk === "hot") ? 3 : 1.5; }
  if((wk === "rain" || wk === "snow") && a.w === "in") s += 1;
  if(ctx.time <= 30 && a.p === 1) s += 1.5;
  if(a.p === 3) s -= .5;
  if(P.adults === "2" && a.ad) s += .5;
  const miss = P.mats ? a.m.filter(m => !P.mats.includes(m)) : [];
  s -= miss.length * 1.5;
  const last = S.journal.find(j => j.act === a.id);
  const recent = last && daysAgo(last.date) < 7;
  if(recent) s -= 4;
  if(S.favs.includes(a.id)) s += 1;
  const day = new Date().toISOString().slice(0,10);
  s += rng(hash(a.id + day))() * 3; // variété du jour
  return {a, s, fit, miss, outdoorOK, recent, last};
}
function results(){
  return ACTS.map(evaluate).filter(Boolean)
    .filter(r => S.cat === "all" || r.a.cat === S.cat)
    .sort((x,y) => y.s - x.s);
}

// ---------- rendu ----------
const app = $("#app");
function render(){
  if(!S.profile){ renderOnboarding(); return; }
  app.innerHTML = `
  <header class="top"><div class="top-in">
    <div class="brand">🎈 ${T("brandA")}<span class="q">${T("brandQ")}</span></div>
    <select class="lang" id="langSel" aria-label="${T("lang")}">${["fr","en","de"].map(l=>`<option value="${l}" ${S.lang===l?"selected":""}>${l.toUpperCase()}</option>`).join("")}</select>
    <button class="wx" id="wxBtn" aria-label="${T("wxChange")}">${S.weather ? `<span class="e">${WEATHERS[S.weather.k].e}</span><span class="wl">${wL(S.weather.k)}</span>${S.weather.temp!=null?`<b class="tp">${S.weather.temp}°</b><small>${esc(S.weather.city)}</small>`:`<small>${T("wxChosen")}</small>`}` : `<span class="e">🌤️</span><span class="wl">${T("wxAsk")}</span>`}</button>
  </div></header>
  <main class="wrap" id="main"></main>
  <nav class="tabs">
    ${[["idees","💡",T("tabIdeas")],["favs","❤️",T("tabFavs")],["carnet","📸",T("tabJournal")],["profil","👨‍👩‍👧",T("tabFamily")]].map(([k,i,l])=>`<button class="tab ${S.tab===k?"on":""}" data-tab="${k}"><span class="i">${i}</span>${l}</button>`).join("")}
  </nav>`;
  $("#wxBtn").onclick = () => openWeather();
  $("#langSel").onchange = e => setLang(e.target.value);
  app.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { S.tab = b.dataset.tab; render(); window.scrollTo(0,0); });
  ({idees:renderIdeas, favs:renderFavs, carnet:renderJournal, profil:renderProfile})[S.tab]();
}

function greet(){
  const h = new Date().getHours(), names = (S.profile.kids||[]).map(k=>k.n).filter(Boolean);
  const who = names.length ? (names.length === 1 ? names[0] : names.slice(0,-1).join(", ") + " " + T("and") + " " + names.at(-1)) : T("theKids");
  const wk = S.weather?.k;
  const line = T(!wk ? "lineNone" : "line" + wk[0].toUpperCase() + wk.slice(1));
  const hi = T("hello")[h<12?0:h<18?1:2];
  return `<h1>${hi}${S.lang==="fr"?" !":"!"} ${T("whatDo", esc(who))}</h1><p>${line}</p>`;
}

function seg(key, opts){
  return `<div class="seg" data-seg="${key}">${opts.map(([v,l])=>`<button data-v="${v}" class="${String(S.ctx[key])===String(v)?"on":""}">${l}</button>`).join("")}</div>`;
}
function cardHTML(r){
  const a = r.a, fav = S.favs.includes(a.id);
  const K = ages(), allFit = r.fit.length === K.length;
  return `<div class="card" data-open="${a.id}" role="button" tabindex="0">
    <span class="ill">${illus(a)}</span>
    <button class="fav" data-fav="${a.id}" aria-label="${T("fav")}">${fav?"❤️":"🤍"}</button>
    ${r.recent?`<span class="done-b">${T("doneAgo", daysAgo(r.last.date)||0)}</span>`:""}
    <div class="body"><h3>${esc(L(a).t)}</h3>
      <div class="meta"><span class="tag">${CATS[a.cat].e} ${catL(a.cat)}</span><span class="tag">⏱ ${fmtD(a.d)}</span><span class="tag">${a.w==="in"?T("inS"):a.w==="out"?T("outS"):"🏠/🌳"}</span>
      <span class="tag">${"●".repeat(a.p)}${"○".repeat(3-a.p)} ${T("prep")}</span>
      ${!allFit&&K.length>1?`<span class="tag warn">${T("forKids", r.fit.length, K.length)}</span>`:""}
      ${r.miss.length?`<span class="tag warn">${T("missing")} ${r.miss.map(m=>MATS[m].e).join(" ")}</span>`:""}</div>
    </div></div>`;
}
function bindCards(root){
  root.querySelectorAll("[data-fav]").forEach(b => b.onclick = e => { e.stopPropagation(); toggleFav(b.dataset.fav); b.textContent = S.favs.includes(b.dataset.fav)?"❤️":"🤍"; });
  root.querySelectorAll("[data-open]").forEach(c => { c.onclick = () => openAct(c.dataset.open); c.onkeydown = e => { if(e.key==="Enter") openAct(c.dataset.open); }; });
}
function toggleFav(id){
  const i = S.favs.indexOf(id); if(i>=0) S.favs.splice(i,1); else { S.favs.push(id); toast(T("favAdded")); }
  save("favs");
}

function renderIdeas(){
  const R = results();
  const m = $("#main");
  m.innerHTML = `<section class="hero">${greet()}</section>
  <div class="ctx">
    ${seg("time",[[15,T("t15")],[30,T("t30")],[60,T("t60")],[120,T("t120")],[240,T("t240")]])}
    ${seg("energy",[["all",T("eAll")],["c",T("eC")],["k",T("eK")],["d",T("eD")]])}
    ${seg("place",[["all",T("pAll")],["in",T("pIn")],["out",T("pOut")]])}
  </div>
  <button class="surprise" id="surp"><span class="dice">🎲</span> ${T("surprise")}</button>
  <div class="cats">${[["all","✨",T("catAll")],...Object.entries(CATS).map(([k,v])=>[k,v.e,catL(k)])].map(([k,e,l])=>`<button class="chip ${S.cat===k?"on":""}" data-cat="${k}">${e} ${l}</button>`).join("")}</div>
  <div class="count">${T("count", R.length)}${S.weather?` · ${WEATHERS[S.weather.k].e} ${wL(S.weather.k)}`:""}</div>
  ${R.length ? `<div class="grid">${R.map(cardHTML).join("")}</div>` : `<div class="empty"><div class="big">🤷</div>${T("noIdeas")}</div>`}`;
  m.querySelectorAll("[data-seg] button").forEach(b => b.onclick = () => { const k = b.parentElement.dataset.seg; S.ctx[k] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; save("ctx"); renderIdeas(); });
  m.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { S.cat = b.dataset.cat; renderIdeas(); });
  $("#surp").onclick = surprise;
  bindCards(m);
}

function renderFavs(){
  const m = $("#main");
  const F = S.favs.map(byId).filter(Boolean).map(a => evaluate(a) || {a, s:0, fit:ages().filter(x=>x>=a.a[0]&&x<=a.a[1]), miss:[], recent:false});
  const hist = S.journal.slice(0, 15);
  m.innerHTML = `<section class="hero"><h1>${T("favTitle")}</h1><p>${T("favLead")}</p></section>
  ${F.length ? `<div class="grid">${F.map(cardHTML).join("")}</div>` : `<div class="empty"><div class="big">🤍</div>${T("favEmpty")}</div>`}
  <h2 class="sub-h">${T("history")}</h2>
  ${hist.length ? `<div class="hist">${hist.map(j => { const a = byId(j.act); return a ? `<button class="hi" data-open="${a.id}"><span class="em">${a.e[0]}</span><b>${esc(L(a).t)}</b><span class="d">${new Date(j.date).toLocaleDateString(T("locale"),{day:"numeric",month:"short"})}</span></button>` : ""; }).join("")}</div>` : `<p class="count">${T("histEmpty")}</p>`}`;
  bindCards(m);
}

function renderJournal(){
  const m = $("#main"), J = S.journal;
  const cats = new Set(J.map(j => byId(j.act)?.cat).filter(Boolean));
  const out = J.filter(j => byId(j.act)?.w !== "in").length;
  m.innerHTML = `<section class="hero"><h1>${T("jTitle")}</h1><p>${T("jLead")}</p></section>
  <div class="stats"><div class="stat"><b>${J.length}</b><span>${T("jLived", J.length)}</span></div><div class="stat"><b>${out}</b><span>${T("jOut")}</span></div><div class="stat"><b>${cats.size}/7</b><span>${T("jWorlds")}</span></div></div>
  ${J.length ? `<div class="journal">${J.map(j => { const a = byId(j.act) || {t:T("activity"),e:["⭐","",""],cat:"jeu",id:"x",w:"in"}; return `<div class="jc">
    ${j.photo ? `<img class="ph" src="${j.photo}" alt="">` : `<span class="ph">${illus(a)}</span>`}
    <div class="b"><h3>${esc(L(a).t)}</h3><div class="d">${new Date(j.date).toLocaleDateString(T("locale"),{weekday:"long",day:"numeric",month:"long"})}</div>
    ${j.stars?`<div class="stars">${"★".repeat(j.stars)}${"☆".repeat(5-j.stars)}</div>`:""}
    ${j.note?`<div class="n">${esc(j.note)}</div>`:""}
    <button class="del" data-del="${j.id}">${T("del")}</button></div></div>`; }).join("")}</div>`
  : `<div class="empty"><div class="big">📸</div>${T("jEmpty")}</div>`}`;
  m.querySelectorAll("[data-del]").forEach(b => b.onclick = () => confirmBox(T("delQ"), () => { S.journal = S.journal.filter(j => j.id !== b.dataset.del); save("journal"); renderJournal(); }));
}

function renderProfile(){
  const m = $("#main");
  m.innerHTML = `<section class="hero"><h1>${T("profTitle")}</h1><p>${T("profLead")}</p></section>
  <div style="max-width:560px">${profileForm()}<button class="go" id="saveP">${T("save")}</button>
  <p class="note" style="text-align:center;margin-top:14px"><button id="reset" style="text-decoration:underline;color:var(--muted)">${T("resetAll")}</button></p></div>`;
  bindProfileForm(m);
  $("#saveP").onclick = () => { if(commitProfile(m)){ toast(T("saved")); S.tab="idees"; render(); } };
  $("#reset").onclick = () => confirmBox(T("resetQ"), () => { try{ Object.keys(localStorage).filter(k=>k.startsWith("esof_")).forEach(k=>localStorage.removeItem(k)); }catch(e){} location.reload(); });
}

// ---------- questionnaire ----------
let draft = null;
function profileForm(){
  draft = draft || JSON.parse(JSON.stringify(S.profile || {kids:[{n:"",a:5}], adults:"1", mats:["papier","crayons","colle","ciseaux","scotch","carton","recup","tissu","cuisine","eau"]}));
  const ageOpts = a => Array.from({length:19},(_,i)=>`<option value="${i}" ${+a===i?"selected":""}>${T("age",i)}</option>`).join("");
  return `
  <div class="box"><h3>${T("kidsH")}</h3><div class="hint">${T("kidsHint")}</div>
    <div id="kids">${draft.kids.map((k,i)=>`<div class="kid"><input type="text" placeholder="${T("firstName")}" value="${esc(k.n)}" data-kn="${i}" maxlength="20"><select data-ka="${i}">${ageOpts(k.a)}</select>${draft.kids.length>1?`<button class="rm" data-rm="${i}" aria-label="${T("remove")}">✕</button>`:""}</div>`).join("")}</div>
    ${draft.kids.length<8?`<button class="add" id="addKid">${T("addKid")}</button>`:""}</div>
  <div class="box"><h3>${T("adultsH")}</h3><div class="hint">${T("adultsHint")}</div>
    <div class="opts" data-opt="adults">${[["1",T("ad1")],["2",T("ad2")],["auto",T("adAuto")]].map(([v,l])=>`<button class="opt ${draft.adults===v?"on":""}" data-v="${v}">${l}</button>`).join("")}</div></div>
  <div class="box"><h3>${T("matsH")}</h3><div class="hint">${T("matsHint")}</div>
    <div class="opts" data-mats>${Object.entries(MATS).map(([k,v])=>`<button class="opt ${draft.mats.includes(k)?"on":""}" data-m="${k}">${v.e} ${matL(k)}</button>`).join("")}</div></div>`;
}
function bindProfileForm(root){
  const rerender = () => { root.querySelector(".box").parentElement; const holder = root; const scroll = window.scrollY; (S.profile ? renderProfile : renderOnboarding)(); window.scrollTo(0, scroll); };
  root.querySelectorAll("[data-kn]").forEach(i => i.oninput = () => draft.kids[i.dataset.kn].n = i.value);
  root.querySelectorAll("[data-ka]").forEach(i => i.onchange = () => draft.kids[i.dataset.ka].a = +i.value);
  root.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { draft.kids.splice(+b.dataset.rm,1); rerender(); });
  const add = $("#addKid", root); if(add) add.onclick = () => { draft.kids.push({n:"",a:Math.max(0,(draft.kids.at(-1)?.a??5)-2)}); rerender(); };
  root.querySelectorAll("[data-opt=adults] .opt").forEach(b => b.onclick = () => { draft.adults = b.dataset.v; root.querySelectorAll("[data-opt=adults] .opt").forEach(x=>x.classList.toggle("on", x===b)); });
  root.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { const k=b.dataset.m, i=draft.mats.indexOf(k); if(i>=0) draft.mats.splice(i,1); else draft.mats.push(k); b.classList.toggle("on"); });
}
function commitProfile(){
  if(draft.adults === "auto" && draft.kids.some(k => k.a < 10)){ toast(T("autoErr")); return false; }
  S.profile = JSON.parse(JSON.stringify(draft)); draft = null; save("profile"); return true;
}
function renderOnboarding(){
  app.innerHTML = `<div class="ob"><div class="langs">${["fr","en","de"].map(l=>`<button class="opt ${S.lang===l?"on":""}" data-lang="${l}">${{fr:"Français",en:"English",de:"Deutsch"}[l]}</button>`).join("")}</div><div class="logo">🎈</div><h1>${T("brandA")}${T("brandQ")}</h1>
  <p class="lead">${T("obLead")}</p>
  ${profileForm()}<button class="go" id="start">${T("start")}</button></div>`;
  bindProfileForm(app);
  app.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));
  $("#start").onclick = () => { if(commitProfile()){ render(); window.scrollTo(0,0); autoWeather(false); } };
}

// ---------- modales ----------
function modal(html, cls=""){
  const ov = document.createElement("div"); ov.className = "ov";
  ov.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true"><button class="x" aria-label="${T("close")}">✕</button>${html}</div>`;
  const close = () => { ov.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", esc_); };
  const esc_ = e => { if(e.key === "Escape") close(); };
  ov.onclick = e => { if(e.target === ov) close(); };
  $(".x", ov).onclick = close;
  document.addEventListener("keydown", esc_);
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  return {el: ov, close};
}
function confirmBox(msg, ok){
  const md = modal(`<div class="sc"><h2 style="font-size:22px;padding-right:40px">${esc(msg)}</h2><div class="acts"><button class="btn" id="cN">${T("cancel")}</button><button class="btn cor" id="cY">${T("yes")}</button></div></div>`);
  $("#cN", md.el).onclick = md.close; $("#cY", md.el).onclick = () => { md.close(); ok(); };
}
function toast(t){ const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }

function openAct(id){
  const a = byId(id); if(!a) return; const la = L(a);
  const r = evaluate(a) || {fit:[], miss: S.profile?.mats ? a.m.filter(m=>!S.profile.mats.includes(m)) : []};
  const kids = S.profile?.kids || [];
  const myBands = {}; kids.forEach(k => { const b = band(+k.a); (myBands[b] = myBands[b] || []).push(k.n || T("ageY", k.a)); });
  const vars = Object.entries(la.v || {}).filter(([,t]) => t);
  const fav = S.favs.includes(a.id);
  const md = modal(`<div class="ill">${illus(a, true)}</div><div class="sc">
    <h2>${esc(la.t)}</h2>
    <div class="meta" style="margin-top:8px"><span class="tag">${CATS[a.cat].e} ${catL(a.cat)}</span><span class="tag">👶 ${a.a[0]}–${a.a[1]} ${T("years")}</span><span class="tag">⏱ ${fmtD(a.d)}</span><span class="tag">${a.w==="in"?T("inLong"):a.w==="out"?T("outLong"):T("both")}</span><span class="tag">${T("prepL")[a.p]}</span>${a.ad?`<span class="tag">${T("withAdult")}</span>`:""}</div>
    <p class="desc">${esc(la.desc)}</p>
    ${a.m.length?`<div class="sec"><h4>${T("matH")}</h4><div class="mats">${a.m.map(m=>`<span class="mat ${r.miss.includes(m)?"miss":""}">${MATS[m].e} ${matL(m)}${r.miss.includes(m)?T("toFind"):""}</span>`).join("")}</div></div>`:`<div class="sec"><h4>${T("matH")}</h4><span class="tag ok">${T("nothing")}</span></div>`}
    <div class="sec"><h4>${T("howH")}</h4><ol class="steps">${la.s.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>
    ${vars.length?`<div class="sec"><h4>${T("byAgeH")}</h4><div class="vars">${vars.map(([b,t])=>`<div class="var ${myBands[b]?"mine":""}"><b>${T("B")[b]}</b>${myBands[b]?`<span class="who">${T("forWho", esc(myBands[b].join(", ")))}</span><br>`:""}${esc(t)}</div>`).join("")}</div></div>`:""}
    <div class="acts"><button class="btn" id="mFav">${fav?T("favOn"):T("favOff")}</button><button class="btn pri" id="mDone">${T("didIt")}</button></div>
  </div>`);
  $("#mFav", md.el).onclick = e => { toggleFav(a.id); e.target.textContent = S.favs.includes(a.id) ? T("favOn") : T("favOff"); render(); };
  $("#mDone", md.el).onclick = () => { md.close(); openDone(a); };
}

function openDone(a){
  let stars = 0, photo = null;
  const md = modal(`<div class="sc form"><h2 style="padding-right:40px">${T("bravo")}</h2><p class="desc">${T("memoQ", esc(L(a).t))}</p>
    <label>${T("photoL")}</label><div class="photo-in"><label class="pbtn">${T("photoBtn")}<input type="file" accept="image/*" id="ph" hidden></label><span id="phPrev"></span></div>
    <label>${T("likeQ")}</label><div class="starpick">${[1,2,3,4,5].map(i=>`<button data-s="${i}" aria-label="${T("stars",i)}">★</button>`).join("")}</div>
    <label for="nt">${T("noteL")}</label><textarea id="nt" maxlength="500" placeholder="${T("notePh")}"></textarea>
    <div class="acts"><button class="btn" id="skip">${T("noMemo")}</button><button class="btn pri" id="ok">${T("addJ")}</button></div></div>`);
  md.el.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { stars = +b.dataset.s; md.el.querySelectorAll("[data-s]").forEach(x => x.classList.toggle("on", +x.dataset.s <= stars)); });
  $("#ph", md.el).onchange = async e => {
    const f = e.target.files[0]; if(!f) return;
    try{ photo = await shrink(f); $("#phPrev", md.el).innerHTML = `<img src="${photo}" alt="">`; }catch(err){ toast(T("badPhoto")); }
  };
  const add = withMemo => {
    const entry = {id: Date.now().toString(36), act: a.id, date: new Date().toISOString(), stars: withMemo ? stars : 0, note: withMemo ? $("#nt", md.el).value.trim() : "", photo: withMemo ? photo : null};
    S.journal.unshift(entry);
    if(!save("journal")){ entry.photo = null; if(!save("journal")){ S.journal.shift(); toast(T("full")); return; } toast(T("fullNoPhoto")); }
    else toast(withMemo ? T("addedJ") : T("addedH"));
    md.close(); if(withMemo){ S.tab = "carnet"; window.scrollTo(0,0); } render();
  };
  $("#ok", md.el).onclick = () => add(true);
  $("#skip", md.el).onclick = () => add(false);
}
function shrink(file){
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const max = 640, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width*k); c.height = Math.round(img.height*k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", .72)); };
    img.onerror = rej; img.src = url;
  });
}

function openWeather(autoFailed){
  const cur = S.weather?.k;
  const md = modal(`<div class="sc"><h2 style="padding-right:40px">${T("wxTitle")}</h2>
    <p class="desc">${autoFailed ? T("wxFail") : T("wxLead")}</p>
    <div class="wxgrid">${Object.entries(WEATHERS).map(([k,v])=>`<button class="wxo ${cur===k?"on":""}" data-w="${k}"><span class="e">${v.e}</span>${wL(k)}</button>`).join("")}</div>
    <div class="sec"><h4>${T("wxAuto")}</h4>
      <div class="row"><input id="city" placeholder="${T("cityPh")}" value="${S.weather?.src==="auto"&&S.weather.city!==T("myPos")?esc(S.weather.city):""}"><button class="btn pri" style="flex:none;padding:10px 16px" id="cityGo">OK</button></div>
      <button class="add" style="margin-top:8px" id="geo">${T("useLoc")}</button>
      <p class="note" id="wxMsg">${T("wxNote")}</p></div></div>`);
  md.el.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { S.weather = {k: b.dataset.w, src:"manual", temp:null, city:"", at: Date.now()}; save("weather"); md.close(); render(); });
  const msg = t => $("#wxMsg", md.el).textContent = t;
  $("#cityGo", md.el).onclick = async () => { const q = $("#city", md.el).value.trim(); if(!q) return; msg(T("searching")); try{ await geocode(q); md.close(); toast(T("wxUpd")); }catch(e){ msg(T("wxErr")); } };
  $("#city", md.el).onkeydown = e => { if(e.key === "Enter") $("#cityGo", md.el).click(); };
  $("#geo", md.el).onclick = () => { msg(T("locating")); try{ navigator.geolocation.getCurrentPosition(async p => { try{ await fetchWeather(p.coords.latitude.toFixed(3), p.coords.longitude.toFixed(3)); md.close(); toast(T("wxUpd")); }catch(e){ msg(T("wxErr2")); } }, () => msg(T("locDenied")), {timeout:7000}); }catch(e){ msg(T("locNA")); } };
}

function surprise(){
  const R = results(); if(!R.length){ toast(T("noFilter")); return; }
  const top = R.slice(0, 12), tot = top.reduce((s,r)=>s+Math.max(1,r.s),0);
  let x = Math.random()*tot, pick = top[0];
  for(const r of top){ x -= Math.max(1,r.s); if(x <= 0){ pick = r; break; } }
  const md = modal(`<div class="slot"><div class="reel" id="reel">🎲</div><p>${T("searchingIdea")}</p></div>`);
  const pool = top.map(r=>r.a.e[0]); let n = 0;
  const iv = setInterval(() => { const el = $("#reel", md.el); if(!el){ clearInterval(iv); return; } el.textContent = pool[n++ % pool.length]; if(n > 16){ clearInterval(iv); el.textContent = pick.a.e[0]; setTimeout(() => { md.close(); openAct(pick.a.id); }, 450); } }, 85);
}

// ---------- démarrage ----------
document.documentElement.lang = S.lang; document.title = T("htmlTitle");
render();
if(S.profile) autoWeather(true);

// ---------- PWA : fonctionne hors ligne une fois installée ----------
if("serviceWorker" in navigator && location.protocol === "https:"){
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
