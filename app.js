// عقارك — منطق الصفحة العامة
(function(){
const {oldTxt,N,qMatch,HOME_FEATS,LAND_FEATS,NEGO,ADV_TXT,CFG,DEMO,BROKEN,API,photosOf,CITIES,NKC_AREAS,RESIDENCES,CUR_BY_RES,CUR_LABEL,KIND_LABEL,UNIT,PTYPES,cityInfo,countryOf,ic,typeKey,thumbBg,$,$$,fmt,esc,opts,toast,cleanPhone,waLink}=window.AQ;
const I18=window.AQ_I18N||{t:s=>s,apply(){},setLang(){},lang:"ar"};
const t=s=>I18.t(s);
const RATES=CFG.RATES||{MRU:1};
const PLATFORM=cleanPhone(CFG.PLATFORM_WHATSAPP);

let LIST=[],REQS=[];
const FOCUS_CITY=window.AQ.CFG.FOCUS_CITY||"";
const S={rq:"",sort:"new",kind:"rent",rentType:"",furn:false,sun:false,country:"",city:FOCUS_CITY,area:"",max:Infinity,q:"",cur:"MRU"};

/* ---------- init ---------- */
$("#demoBar").hidden=!DEMO;
try{const c=localStorage.getItem("aq-cur");if(c&&RATES[c])S.cur=c}catch(_){}
const countries=[...new Set(CITIES.map(c=>c[1]))];
const allCities=CITIES.map(c=>c[0]);
function fillSelects(){
  $("#cur").innerHTML=Object.keys(RATES).map(k=>`<option value="${k}">${t(CUR_LABEL[k]||k)}</option>`).join("");$("#cur").value=S.cur;
  const keep=sel=>{const v=$(sel).value;return ()=>{$(sel).value=v}};
  const k1=keep("#fCountry"),k2=keep("#sCity"),k3=keep("#sType"),k4=keep("#fArea");
  $("#fCountry").innerHTML=opts(countries,"كل الدول");$("#sCity").innerHTML=opts(allCities,"كل المدن");
  $("#sType").innerHTML=opts(PTYPES,"كل الأنواع");$("#fArea").innerHTML=opts(NKC_AREAS,"كل الأحياء");
  k1();k2();k3();k4();fillCity();
  if(!fillSelects.done&&FOCUS_CITY){$("#sCity").value=FOCUS_CITY;fillSelects.done=true}
  [["#rCity",allCities],["#aCity",allCities],["#rRes",RESIDENCES],["#bCities",allCities]].forEach(([id,a])=>{const v=$(id).value;$(id).innerHTML=opts(a);if(v)$(id).value=v});
  ["#rArea","#aArea"].forEach(id=>{const v=$(id).value;$(id).innerHTML=opts(NKC_AREAS,"أي حي");$(id).value=v});
  $$("select[name=ptype]").forEach(s=>{const v=s.value;s.innerHTML=opts(PTYPES.concat(["أرض"]));if(v)s.value=v});
  I18.apply();
}
function fillCity(){const c=$("#fCountry").value;$("#fCity").innerHTML=opts(CITIES.filter(x=>!c||x[1]===c).map(x=>x[0]),"كل المدن");$("#fCity").value=S.city&&(!c||countryOf(S.city)===c)?S.city:"";}
const TILES=[["rent","","all","الكل"],["rent","شقة","apt","شقق"],["rent","دار","house","دور وفلل"],["rent","غرفة","room","غرف واستوديو"],["rent","محل","shop","محلات"],["rent","مكتب","office","مكاتب"]];
const SALE_TILES=[["land","","land","أراضٍ"],["home_sale","","all","كل البيوت"],["home_sale","دار","house","دور وفلل"],["home_sale","شقة","apt","شقق"],["home_sale","محل","shop","محلات"],["home_sale","مستودع","store","مستودعات"]];
const isSale=()=>S.kind==="land"||S.kind==="home_sale";
function renderTiles(){const sale=isSale(),T=sale?SALE_TILES:TILES;
  $("#rtiles").innerHTML=T.map(([k,v,ico,l])=>{const on=sale?(S.kind===k&&(k==="land"||v===S.rentType)):(v===S.rentType);
    const n=LIST.filter(i=>(sale?i.kind===k:(i.kind==="rent"||i.kind==="daily"))&&(!v||i.ptype===v)).length;
    return `<button class="rtile" data-k="${k}" data-pt="${v}" aria-pressed="${on}"><i>${ic(ico,24)}</i>${t(l)}<small>${n} ${t("عرض")}</small></button>`}).join("");
  $$("#modeSeg [data-mode]").forEach(b=>b.setAttribute("aria-pressed",(b.dataset.mode==="sale")===sale));
  $("#rentRow").hidden=sale;$("#saleRow").hidden=!sale;
  $$("[data-sf]").forEach(b=>b.setAttribute("aria-pressed",!!S[b.dataset.sf]));}
const CORNER="كرن (زاوية)",ROAD="على الكدرون (طريق معبّد)";
$$("[data-ic]").forEach(s=>s.innerHTML=ic(s.dataset.ic,22));
const {FEAT,COMMISSIONS}=window.AQ;
const applyGates=()=>$$("[data-feature]").forEach(el=>el.hidden=!FEAT(el.dataset.feature));applyGates();
$$("select[name=commission]").forEach(s=>s.innerHTML=`<option value="">—</option>`+COMMISSIONS.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(""));
const svcText=x=>PLATFORM?waLink(PLATFORM,x):"#";

/* ---------- helpers ---------- */
const place=x=>esc(t(x.city))+(x.area?" · "+esc(t(x.area)):"");
const roomsTxt=n=>n?`${n} ${t(n>1?"غرف":"غرفة")}`:"";
const alt=m=>S.cur==="MRU"?"":`<div class="alt">≈ ${fmt(m/RATES[S.cur])} ${t(CUR_LABEL[S.cur])}</div>`;
const old=v=>v&&I18.lang!=="fr"?`<div class="old">${t("بالقديمة")}: ${oldTxt(v)}</div>`:"";
const priceHTML=(v,k)=>`<div class="price">${fmt(v)} <small>${t("أوقية")} ${t(UNIT[k]||"")}</small></div>${old(v)}${alt(v)}`;
const feats=i=>Array.isArray(i.features)?i.features:[];
function fairRange(i){
  const peers=LIST.filter(x=>x.id!==i.id&&x.kind===i.kind&&x.city===i.city&&(i.kind==="land"?x.size_m2>0:(x.ptype===i.ptype&&(x.rooms||0)===(i.rooms||0))));
  if(peers.length<2||(i.kind==="land"&&!i.size_m2))return "";
  const vals=i.kind==="land"?peers.map(p=>p.price/p.size_m2*i.size_m2):peers.map(p=>Number(p.price));
  vals.sort((a,b)=>a-b);const med=vals[Math.floor(vals.length/2)],lo=med*.85,hi=med*1.15;
  const tag=i.price>hi?"أعلى من المعتاد":i.price<lo?"أقل من المعتاد":"ضمن المعتاد";
  return `<div class="hint">${t("السعر")} <b>${t(tag)}</b> · ${t("المعتاد هنا")} <bdi dir="ltr">${fmt(lo)} – ${fmt(hi)}</bdi></div>`;
}
const textOf=i=>[i.title,i.description,i.area,i.city,i.notes,i.ptype,...feats(i)].filter(Boolean).join(" ");
function matches(i){
  if(i.kind!==S.kind)return false;
  if(S.country&&(i.country||countryOf(i.city))!==S.country)return false;
  if(S.city&&i.city!==S.city)return false;
  if(S.area&&S.city==="نواكشوط"&&i.area!==S.area)return false;
  if(!(Number(i.price)<=S.max))return false;
  if(i.kind==="rent"||i.kind==="daily"){if(S.rentType&&i.ptype!==S.rentType)return false;if(S.furn&&!i.furnished)return false}
  if(i.kind==="home_sale"&&S.rentType&&i.ptype!==S.rentType)return false;
  if(i.kind==="land"||i.kind==="home_sale"){const f=Array.isArray(i.features)?i.features:[];
    if(S.doc&&i.title_doc!=="سند عقاري")return false;if(S.corner&&!f.includes(CORNER))return false;if(S.road&&!f.includes(ROAD))return false}
  if(S.sun&&!i.solar)return false;
  if(S.adv&&i.kind==="rent"&&!(i.advance_months===1))return false;
  if(S.water&&!feats(i).some(f=>f==="ماء"||f==="خزان ماء"))return false;
  if(S.q&&!qMatch(textOf(i),S.q))return false;
  if(!inBounds(i))return false;
  if(FEAT("FRESHNESS")&&i.confirmed_at&&Date.now()-new Date(i.confirmed_at)>30*864e5)return false;
  return true;
}
const label=i=>i.kind==="land"?(i.size_m2?fmt(i.size_m2)+" "+t("م²"):t("أرض")):t(i.ptype||"شقة")+(i.kind==="daily"?" · "+t("يومي"):"");
const reqKind=k=>({buy:"للشراء",invest:"فرصة استثمارية",daily:"إيجار يومي"}[k]||"للإيجار");
const since=d=>{if(!d)return "";const h=Math.round((Date.now()-new Date(d))/36e5);return h<1?(I18.lang==="fr"?"à l'instant":"الآن"):h<24?(I18.lang==="fr"?`il y a ${h} h`:`قبل ${h} ساعة`):(I18.lang==="fr"?`il y a ${Math.round(h/24)} j`:`قبل ${Math.round(h/24)} يوم`)};

function cardHTML(i){
  return `<article class="card" tabindex="0" data-item="${i.id}" aria-label="${esc(i.title)}">
    <div class="thumb" style='background:${thumbBg(i)}'>${photosOf(i).length||window.AQ_ART?"":ic(typeKey(i),48)}
      <div class="badges">${vbOf(i.contact_whatsapp)?`<span class="badge vb">✓ ${t("سمسار موثّق")}</span>`:""}${i.featured?`<span class="badge or">${t("مميّز")}</span>`:''}${i.solar?`<span class="badge sun">${t("بلا انقطاع")}</span>`:''}${i.title_doc==="سند عقاري"?`<span class="badge ok">${t("سند عقاري")}</span>`:''}<span class="badge">${place(i)}</span></div>
      <span class="phl">${esc(label(i))}</span></div>
    <div class="cbody">${priceHTML(i.price,i.kind)}
      <p class="title">${esc(i.title)}</p>${FEAT("FRESHNESS")&&i.confirmed_at?`<span class="when">✓ ${t("تأكّد")} ${since(i.confirmed_at)}</span>`:i.created_at?`<span class="when">${since(i.created_at)}</span>`:""}${FEAT("COMMISSION")&&i.commission?`<span class="when">${t("العمولة")}: ${esc(t(i.commission))}</span>`:""}
      <div class="facts">${i.kind!=="land"&&i.ptype!=="محل"&&i.rooms?`<span>${roomsTxt(i.rooms)}</span>`:""}${i.furnished?`<span>${t("مفروش")}</span>`:""}${i.title_doc?`<span>${esc(t(i.title_doc))}</span>`:""}${i.kind==="rent"&&i.advance_months?`<span class="adv">${t(ADV_TXT(i.advance_months))}</span>`:""}${feats(i).filter(x=>x!==NEGO).slice(0,2).map(x=>`<span>${esc(t(x))}</span>`).join("")}${feats(i).includes(NEGO)?`<span class="nego">${t("قابل للتفاوض")}</span>`:""}</div>
      ${fairRange(i)}</div></article>`;
}
function reqHTML(q){
  return `<article class="card" style="cursor:default" data-req="${q.id}"><div class="cbody">
    <div class="facts">${q.kind==="buy"||q.kind==="invest"?`<span class="badge buy">${t("شراء")}</span>`:`<span class="badge rent">${t("إيجار")}</span>`}<span>${place(q)}</span><span>${since(q.created_at)}</span>${q.residence&&q.residence!=="موريتانيا"?`<span>${t("الطالب في")} ${esc(t(q.residence))}</span>`:""}</div>
    <p class="title">${t("مطلوب")}: ${esc(t(q.ptype))} ${t(reqKind(q.kind))}${q.rooms?" · "+roomsTxt(q.rooms):""}${q.duration?" · "+esc(t(q.duration)):""}</p>
    ${q.budget?`<div class="price">${t("حتى")} ${fmt(q.budget)} <small>${t("أوقية")}</small></div>${old(q.budget)}${alt(q.budget)}`:`<div class="alt">${t("الميزانية بالتفاوض")}</div>`}
    <div class="facts">${q.furnished?`<span>${t("مفروش")}</span>`:""}${q.solar?`<span>${t("بلا انقطاع")}</span>`:""}${q.move_in?`<span>${t("تاريخ الدخول")}: ${esc(q.move_in)}</span>`:""}${q.advance_max?`<span class="adv">${t("يدفع")} ${t(ADV_TXT(q.advance_max))} ${t("كحد أقصى")}</span>`:""}</div>
    ${q.notes?`<p style="margin:0;font-size:14px;color:var(--muted)">${esc(q.notes)}</p>`:""}
    <div class="actions"><button class="btn small or" data-offer="${q.id}">${t("قدّم عرضًا")}</button><span class="alt" style="align-self:center;flex:0 0 auto">${q.offers_count||0} ${t("عروض")}</span></div>
  </div></article>`;
}

/* ---------- أحدث الطلبات ---------- */
function renderStrip(){const box=$("#latestReq");if(!box)return;
  const r=[...REQS].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,8);
  box.hidden=!r.length;if(!r.length)return;
  $("#reqStrip").innerHTML=r.map(reqHTML).join("")+`<button class="card more" data-tab="req"><b>${t("كل الطلبات")}</b><span>${REQS.length} ${t("طلب مفتوح")}</span></button>`;
  const today=REQS.filter(q=>Date.now()-new Date(q.created_at)<864e5).length;
  $("#reqLive").textContent=today?`· ${today} ${t("اليوم")}`:"";
}
let BROKERS=[],VB=new Map();const vbOf=p=>p?VB.get(cleanPhone(p)):null;
const PAGE=8;let SHOWN=PAGE,LASTKEY="";
document.addEventListener("click",e=>{if(e.target.closest("#moreCards")){SHOWN+=PAGE;render()}});
/* أزرار الأحياء السريعة (نطاق البداية) */
function renderAreaChips(){const box=$("#areaChips");if(!box)return;const F=window.AQ.FOCUS_AREAS;
  box.hidden=!F.length||S.city!=="نواكشوط";if(box.hidden)return;
  const n=a=>(S.kind==="req"?REQS:LIST).filter(i=>i.city==="نواكشوط"&&(!a||i.area===a)&&(S.kind==="req"||i.kind===S.kind)).length;
  box.innerHTML=[["",t("كل نواكشوط")]].concat(F.map(a=>[a,t(a)])).map(([a,l])=>`<button class="chip" data-area="${esc(a)}" aria-pressed="${S.area===a}">${esc(l)} <small>${n(a)}</small></button>`).join("")}
document.addEventListener("click",e=>{const b=e.target.closest("[data-area]");if(!b)return;S.area=b.dataset.area;$("#fArea").value=S.area;S.bounds=null;$("#boundsChip").hidden=true;render()});
/* ---------- render ---------- */
function render(){
  renderAreaChips();
  renderStrip();
  $("#areaWrap").hidden=S.city!=="نواكشوط";
  $("#curNote").textContent=t(S.cur==="MRU"?"الأسعار بالأوقية الجديدة":"بالأوقية مع ما يقابلها تقريبًا");
  $$("#viewSeg [data-view]").forEach(x=>x.setAttribute("aria-pressed",(x.dataset.view==="req")===(S.kind==="req")));$("#rent").classList.toggle("dim",S.kind==="req");
  $$("[data-dur]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.dur===S.kind));
  if(S.kind!=="req")renderTiles();
  const g=$("#grid");
  if(S.kind==="req"){
    $("#reqSeg").hidden=false;$$("[data-rq]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.rq===S.rq));
    const r=REQS.filter(q=>(!S.rq||(S.rq==="buy"?(q.kind==="buy"||q.kind==="invest"):(q.kind==="rent"||q.kind==="daily")))&&(!S.country||q.country===S.country)&&(!S.city||q.city===S.city)&&(!S.area||S.city!=="نواكشوط"||q.area===S.area)&&(!S.q||qMatch(textOf(q),S.q))&&(S.max===Infinity||!q.budget||q.budget<=S.max));
    $("#count").textContent=r.length+" "+t("طلب مفتوح");
    const by={};r.forEach(q=>{const k=q.area?q.area:q.city;by[k]=(by[k]||0)+1});
    const top=Object.entries(by).sort((x,y)=>y[1]-x[1]).slice(0,8),mx=top.length?top[0][1]:1;
    const demand=top.length?`<div class="box" style="grid-column:1/-1;margin:0"><b>${t("أين يبحث الناس الآن؟")}</b>${top.map(([k,n])=>`<div style="display:grid;grid-template-columns:110px 1fr 30px;gap:8px;align-items:center;font-size:13.5px;margin-top:6px"><span>${esc(t(k))}</span><span style="height:10px;border-radius:5px;background:var(--bg);overflow:hidden"><span style="display:block;height:100%;width:${n/mx*100}%;background:var(--orange)"></span></span><span>${n}</span></div>`).join("")}</div>`:"";
    g.innerHTML=r.length?demand+r.map(reqHTML).join(""):`<div class="empty">${t("لا طلبات مفتوحة هنا بعد.")}</div>`;
    drawReqMap(r);return;
  }
  $("#reqSeg").hidden=true;
  const r=LIST.filter(matches);
  if(S.sort==="low")r.sort((a,b)=>a.price-b.price);else if(S.sort==="high")r.sort((a,b)=>b.price-a.price);
  if(!LIST.length&&!DEMO){$("#count").textContent="";g.innerHTML=`<div class="empty">${t("لا عقارات منشورة بعد.")} <button class="btn small or" data-open="dlgAdd">${t("كن أول من يضيف عقارًا")}</button></div>`;drawMarkers([]);return}
  $("#count").textContent=r.length+" "+t("عرض");
  const fkey=JSON.stringify([!!S.water,!!S.bounds,S.kind,S.city,S.area,S.q,S.max,S.rentType,S.furn,S.sun,S.adv,S.sort,S.country,S.doc,S.corner,S.road]);
  if(fkey!==LASTKEY){LASTKEY=fkey;SHOWN=PAGE}
  const more=r.length>SHOWN?`<div class="empty" style="padding:12px"><button class="btn ghost" id="moreCards">${t("عرض المزيد")} (${r.length-SHOWN})</button></div>`:"";
  g.innerHTML=r.length?r.slice(0,SHOWN).map(cardHTML).join("")+more:`<div class="empty">${t("لا عروض بهذه الشروط.")} <button class="btn small or" data-open="dlgReq">${t("اطلب عقارك")}</button> ${t("ويأتيك السماسرة بالعروض.")}</div>`;
  LASTR=r;drawMarkers(r);
}

/* ---------- map ---------- */
let MAP=null,LAYER=null;
// على الجوال: الخريطة مطوية حتى يطلبها الزائر (توفير الرصيد وسرعة الفتح)
const SMALL=matchMedia("(max-width:720px)").matches;let LASTR=[];
function initMap(){
  if(!window.L){$("#mapWrap").hidden=true;$("#mapToggle").hidden=true;return}
  if(SMALL&&!MAP&&!initMap.force){$("#mapWrap").hidden=true;$("#mapToggle").hidden=false;return}
  if(MAP)return;$("#mapWrap").hidden=false;
  MAP=L.map("map",{scrollWheelZoom:false,tap:true}).setView([19.5,-11],5);
  BASE.street=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap'});
  BASE.sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:'Imagery &copy; Esri'});
  BASE.street.addTo(MAP);
  LAYER=L.layerGroup().addTo(MAP);
  MAP.on("zoomend",()=>{if(MODE==="items")paintPins()});
  MAP.on("movestart",()=>{if(!AUTO)$("#areaSearch").hidden=S.kind==="req"});
  MAP.on("moveend",()=>{AUTO=false});
}
let BASE={},MODE="items",ITEMS=[],AUTO=false,ME=null;
// سعر مختصر يقرؤه الناس بسرعة على الدبوس: 35 ألف، 1.2 م
const short=v=>{v=Number(v)||0;if(I18.lang==="fr")return v>=1e6?(Math.round(v/1e5)/10)+"M":v>=1e3?Math.round(v/1e3)+"k":String(v);
  return v>=1e6?(Math.round(v/1e5)/10)+" م":v>=1e3?Math.round(v/1e3)+" ألف":String(v)};
function posOf(i){
  if(i.lat!=null&&i.lng!=null)return [i.lat,i.lng];
  if(i.city==="نواكشوط"&&i.area&&AREA_POS[i.area]){const a=AREA_POS[i.area],j=(i.id%11)/11-.5,k=(i.id%7)/7-.5;return [a[0]+j*.012,a[1]+k*.012]}
  const c=cityInfo(i.city);if(!c)return null;
  const j=(i.id%17)/17-.5,k=(i.id%13)/13-.5;return [c[3]+j*.03,c[2]+k*.03];
}
function fitTo(pts,max){AUTO=true;if(pts.length===1)MAP.setView(pts[0],max);else if(pts.length)MAP.fitBounds(pts,{padding:[40,40],maxZoom:max});
  else{const c=cityInfo(S.city);if(c)MAP.setView([c[3],c[2]],11);else MAP.setView([19.5,-11],5)}}
function drawMarkers(items){
  if(!MAP)return;MODE="items";ITEMS=items.map(i=>({i,p:posOf(i)})).filter(x=>x.p);
  if(!S.bounds){let pts=ITEMS.map(x=>x.p);
    // بلا اختيار دولة: نبدأ بموريتانيا إن كان فيها عروض، والدول الأخرى عبر الفلتر
    if(!S.country){const mr=ITEMS.filter(x=>(x.i.country||countryOf(x.i.city))==="موريتانيا").map(x=>x.p);if(mr.length)pts=mr}
    fitTo(pts,14)}
  paintPins();
}
// تجميع الدبابيس المتقاربة على الشاشة في دائرة واحدة عليها العدد
function paintPins(){
  if(!MAP)return;LAYER.clearLayers();const z=MAP.getZoom(),cell=56,cells={};
  ITEMS.forEach(x=>{const pt=MAP.project(x.p,z),k=Math.floor(pt.x/cell)+":"+Math.floor(pt.y/cell);(cells[k]=cells[k]||[]).push(x)});
  Object.values(cells).forEach(g=>{
    if(g.length===1||z>=16){g.forEach(({i,p})=>{
      const sale=i.kind==="land"||i.kind==="home_sale";
      const m=L.marker(p,{icon:L.divIcon({className:"",html:`<span class="pin${sale?" sale":""}${i.featured?" feat":""}" data-pin="${i.id}">${short(i.price)}</span>`,iconSize:null,iconAnchor:[0,0]}),title:i.title,keyboard:true});
      m.on("click",()=>openItem(i.id));m.addTo(LAYER)});return}
    const lat=g.reduce((a,x)=>a+x.p[0],0)/g.length,lng=g.reduce((a,x)=>a+x.p[1],0)/g.length;
    const min=Math.min(...g.map(x=>x.i.price));
    const m=L.marker([lat,lng],{icon:L.divIcon({className:"",html:`<span class="cluster"><b>${g.length}</b><small>${t("من")} ${short(min)}</small></span>`,iconSize:null,iconAnchor:[0,0]}),title:g.length+" "+t("عرض"),keyboard:true});
    m.on("click",()=>{AUTO=true;MAP.fitBounds(g.map(x=>x.p),{padding:[50,50],maxZoom:Math.min(z+3,17)})});m.addTo(LAYER);
  });
  if(ME)ME.addTo(LAYER);
}
function inBounds(i){if(!S.bounds)return true;const p=posOf(i);return !!p&&S.bounds.contains(p)}
function setBounds(b){S.bounds=b;$("#boundsChip").hidden=!b;$("#areaSearch").hidden=true;render()}
/* خريطة الطلبات: دوائر برتقالية حجمها بعدد الطلبات في كل حي أو مدينة */
const AREA_POS={"تفرغ زينة":[18.105,-15.975],"لكصر":[18.105,-15.952],"السبخة":[18.07,-15.985],"الميناء":[18.045,-15.968],"عرفات":[18.05,-15.93],"دار النعيم":[18.12,-15.918],"توجنين":[18.09,-15.895],"تيارت":[18.135,-15.94],"الرياض":[17.99,-15.95]};
function drawReqMap(reqs){
  if(!MAP)return;MODE="req";LAYER.clearLayers();const groups={};
  reqs.forEach(q=>{const k=q.area&&AREA_POS[q.area]?q.area:q.city;(groups[k]=groups[k]||[]).push(q)});
  const pts=[];
  Object.entries(groups).forEach(([k,list])=>{
    const p=AREA_POS[k]||(c=>c?[c[3],c[2]]:null)(cityInfo(k));if(!p)return;pts.push(p);
    L.circleMarker(p,{radius:10+Math.sqrt(list.length)*6,color:"#E9830F",fillColor:"#E9830F",fillOpacity:.55,weight:2})
     .addTo(LAYER).bindTooltip(`${esc(t(k))}: ${list.length}`,{permanent:true,direction:"top",className:"reqtip"})
     .bindPopup(`<div style="font-family:var(--body);min-width:200px"><b>${esc(t(k))} · ${list.length} ${t("طلب مفتوح")}</b>${list.slice(0,5).map(q=>`<div style="margin-top:6px">${esc(t(q.ptype))} ${t(reqKind(q.kind))}${q.budget?` · ${t("حتى")} ${fmt(q.budget)}`:""}<br><button class="btn small or" data-offer="${q.id}">${t("قدّم عرضًا")}</button></div>`).join("")}</div>`);
  });
  fitTo(pts,12);
}

/* ---------- listing detail ---------- */
const VIEWED=new Set();
function similar(i){
  return LIST.filter(x=>x.id!==i.id&&x.kind===i.kind&&x.city===i.city&&(i.kind==="land"||x.ptype===i.ptype||!i.ptype))
    .sort((a,b)=>Math.abs(a.price-i.price)-Math.abs(b.price-i.price)).slice(0,3);
}
const SAFE={
  sale:["تأكد أن القطعة في مخطط تجزئة معتمد، وأنها موجودة فعلًا على الأرض بحدودها.","تحقّق من الوثيقة (سند عقاري أو ترخيص) لدى المصالح العقارية قبل أي دفعة.","احذر القطع المقتطعة من امتيازات ريفية غير مخصصة للسكن، والقطعة المعروضة على أكثر من مشترٍ.","لا تدفع الثمن كاملًا إلا عند الموثّق، مع المالك نفسه أو وكيله بوكالة موثّقة."],
  rent:["شاهد العقار بنفسك أو بقريب تثق به قبل دفع المقدم.","اكتب عقدًا يذكر المقدم والتأمين ومن يدفع الماء والكهرباء — استعمل نموذج العقد في الموقع.","لا تحوّل مالًا لشخص لم تتأكد أنه المالك أو وكيله، وجرّب الماء والكهرباء قبل الاستلام."]};
function safety(i){const L=(i.kind==="land"||i.kind==="home_sale")?SAFE.sale:SAFE.rent;
  return `<details class="safe"><summary>${t(i.kind==="land"||i.kind==="home_sale"?"قبل أن تشتري: نصائح تحميك":"قبل أن تدفع المقدم: 3 نصائح")}</summary><ul>${L.map(x=>`<li>${esc(t(x))}</li>`).join("")}</ul>${i.kind==="rent"?`<a href="#contract" data-close>${t("اكتب عقد الإيجار الآن")}</a>`:(Array.isArray(CFG.SERVICES)&&!CFG.SERVICES.includes("doc"))?"":`<button type="button" class="linkbtn" data-svc="doc" data-pre='${esc(JSON.stringify({id:String(i.id),place:(i.area?i.area+"، ":"")+i.city}))}'>${t("نفحص الوثيقة نيابة عنك")}</button>`}</details>`}
function openItem(id){
  const i=LIST.find(x=>String(x.id)===String(id));if(!i)return;
  if(!VIEWED.has(i.id)){VIEWED.add(i.id);API.addView(i.id)}
  const to=(CFG.CONTACT_VIA_PLATFORM&&PLATFORM)?PLATFORM:(cleanPhone(i.contact_whatsapp)||PLATFORM);
  const msg=`السلام عليكم، أستفسر عن العقار رقم ${i.id} على عقارك: ${i.title}`;
  const sim=similar(i);
  $("#itemBody").innerHTML=`<button class="xclose" data-close aria-label="${t("إغلاق")}">×</button>${photosOf(i).length?`<div class="gallery">${photosOf(i).map(u=>`<img src="${esc(u)}" alt="" loading="lazy">`).join("")}</div>`:`<div class="thumb" style='height:190px;border-radius:12px;background:${thumbBg(i)}'>${window.AQ_ART?"":ic(typeKey(i),60)}</div>`}
    <div>${priceHTML(i.price,i.kind)}</div>
    <h3 style="margin:0">${esc(i.title)}</h3>
    <div class="facts"><span>${place(i)}</span><span>${t(KIND_LABEL[i.kind])}</span><span>${esc(label(i))}</span>${i.rooms&&i.kind!=="land"?`<span>${roomsTxt(i.rooms)}</span>`:""}${i.size_m2?`<span>${fmt(i.size_m2)} ${t("م²")}</span>`:""}${i.furnished?`<span>${t("مفروش")}</span>`:""}${i.solar?`<span>${t("بلا انقطاع")}</span>`:""}${i.title_doc?`<span>${esc(t(i.title_doc))}</span>`:""}${i.kind==="rent"&&i.advance_months?`<span class="adv">${t(ADV_TXT(i.advance_months))}</span>`:""}</div>
    ${feats(i).length?`<div class="facts">${feats(i).map(x=>`<span class="${x===NEGO?"nego":""}">✓ ${esc(t(x))}</span>`).join("")}</div>`:""}
    ${(b=>b?`<div class="vbline">✓ ${t("يعرضه سمسار موثّق")}: <b>${esc(b.name)}</b> <button type="button" class="linkbtn" data-go="brokers">${t("ماذا يعني؟")}</button></div>`:"")(vbOf(i.contact_whatsapp))}
    ${i.lat!=null&&i.lng!=null?`<div class="locrow"><a class="btn ghost small" href="https://www.google.com/maps/dir/?api=1&destination=${Number(i.lat)},${Number(i.lng)}" target="_blank" rel="noopener">🧭 ${t("الطريق إليه")}</a><a class="btn ghost small" href="https://www.google.com/maps?q=${Number(i.lat)},${Number(i.lng)}&t=k" target="_blank" rel="noopener">🛰️ ${t("صورته الفضائية")}</a></div>`:""}
    ${fairRange(i)}
    ${i.description?`<p style="margin:0;white-space:pre-line">${esc(i.description)}</p>`:""}
    <div class="row">
      ${to?`<a class="btn wa" href="${waLink(to,msg)}" target="_blank" rel="noopener">${t("تواصل على واتساب")}</a>`:""}
    </div>
    <div class="row minor"><button class="btn ghost small" data-share="${i.id}">${t("انسخ الرابط")}</button></div><div class="alt">${t("رقم العقار")} ${i.id}</div>
    ${safety(i)}
    ${sim.length?`<h4 style="margin:6px 0 0">${t("عقارات مشابهة")}</h4><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${sim.map(x=>`<div class="card" data-item="${x.id}" tabindex="0"><div class="thumb" style='height:90px;background:${thumbBg(x)}'></div><div class="cbody" style="padding:8px 10px"><div class="price" style="font-size:16px">${fmt(x.price)}</div><div class="alt">${esc(x.title)}</div></div></div>`).join("")}</div>`:""}`;
  const dlg=$("#dlgItem");if(!dlg.open)dlg.showModal();dlg.scrollTop=0;
  try{history.replaceState(null,"","#l-"+i.id)}catch(_){}
}
$("#dlgItem").addEventListener("close",()=>{if(/^#l-/.test(location.hash)){try{history.replaceState(null,"",location.pathname+location.search)}catch(_){}}});

/* ---------- offers on requests (Deal-style) ---------- */
function openOffer(id){
  const q=REQS.find(x=>String(x.id)===String(id));if(!q)return;
  const f=$("#offerForm");f.reset();f.request_id.value=q.id;
  $("#offerReq").innerHTML=`${t("مطلوب")}: ${esc(t(q.ptype))} ${t(reqKind(q.kind))} · ${place(q)}${q.budget?` · ${t("حتى")} ${fmt(q.budget)} ${t("أوقية")}`:""}`;
  $("#dlgOffer").showModal();
}
$("#offerForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target,btn=f.querySelector("[type=submit]");if(!guardOK(f))return;
  const o={request_id:Number(f.request_id.value),price:Number(f.price.value)||null,message:f.message.value.trim(),name:f.name.value.trim()||null,whatsapp:cleanPhone(f.whatsapp.value),listing_id:Number(f.listing_id.value)||null};
  if(FEAT("COMMISSION")&&f.commission.value)o.commission=f.commission.value;
  if(o.message.length<3){toast(t("اكتب تفاصيل العرض"));return}
  if(o.whatsapp.length<6){toast(t("اكتب رقم واتساب صحيحًا مع رمز الدولة"));return}
  btn.disabled=true;
  try{await API.addOffer(o);f.reset();$("#dlgOffer").close();REQS=await API.publicRequests().catch(()=>REQS);render();renderMine();
    done("وصل عرضك","سيرى صاحب الطلب عرضك ويتواصل معك على واتساب إن ناسبه.","")}
  catch(err){console.error(err);toast(sendErr(err))}finally{btn.disabled=false}
});

/* ---------- my requests (private token) ---------- */
const MYKEY="aq-my";
const myList=()=>{try{return JSON.parse(localStorage.getItem(MYKEY)||"[]")}catch(_){return []}};
const saveMy=a=>{try{localStorage.setItem(MYKEY,JSON.stringify(a.slice(-20)))}catch(_){}};
function addMy(token,labelTxt){const a=myList().filter(x=>x.token!==token);a.push({token,label:labelTxt,at:Date.now()});saveMy(a)}
async function renderMine(){
  const box=$("#mineList"),a=myList().slice().reverse();
  $("#mine").hidden=!a.length;if(!a.length)return;
  box.innerHTML=`<div class="empty">${t("جارٍ التحميل…")}</div>`;
  const parts=await Promise.all(a.map(async m=>{
    let offers=[],req=null;try{[req]=await API.myRequest(m.token);offers=(await API.myOffers(m.token)).sort((x,y)=>(y.verified_broker?1:0)-(x.verified_broker?1:0))}catch(err){console.error(err)}
    const link=location.origin+location.pathname+"?my="+m.token;
    return `<div class="box" style="margin:0"><div class="row" style="justify-content:space-between"><b>${esc(m.label)}</b><span class="alt">${req&&req.status==="pending"?t("ينتظر المراجعة"):req&&req.status!=="open"?t("مغلق"):""}</span></div>
      ${offers.length?offers.map(o=>`<div class="offer" style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;background:var(--bg);border-radius:10px;padding:8px 10px;margin-top:8px">
        <span>${o.verified_broker?`<span class="badge vb">✓ ${t("سمسار موثّق")}</span> `:""}${FEAT("COMMISSION")&&o.commission?`<span class="badge">${t("العمولة")}: ${esc(t(o.commission))}</span> `:""}${o.name?`<b>${esc(o.name)}</b> · `:""}${esc(o.message)}${o.listing_id?` · <a href="#l-${o.listing_id}" data-item-link="${o.listing_id}">${t("رقم العقار")} ${o.listing_id}</a>`:""}</span>
        <span class="row">${o.price?`<b style="color:var(--brand)">${fmt(o.price)} ${t("أوقية")}</b>`:""}<a class="btn small" href="${waLink(o.whatsapp,"السلام عليكم، بخصوص عرضك على طلبي في عقارك")}" target="_blank" rel="noopener">${t("تواصل")}</a></span></div>`).join("")
        :`<div class="alt" style="margin-top:6px">${t("لم تصل عروض بعد. سنرسل طلبك للسماسرة، وتظهر العروض هنا.")}</div>`}
      ${FEAT("RATINGS")&&offers.length&&req&&req.status!=="open"?`<div class="rate"><span class="alt">${t("تعاملت مع أحدهم؟ قيّمه ليعرف غيرك:")}</span>${offers.map(o=>`<div class="row" data-rate="${o.id}" data-token="${esc(m.token)}"><span>${esc(o.name||t("صاحب العرض"))}</span>${[1,2,3,4,5].map(n=>`<button type="button" class="star" data-stars="${n}" aria-label="${n}">★</button>`).join("")}</div>`).join("")}</div>`:""}
      <div class="row" style="margin-top:8px"><button class="btn small ghost" data-copylink="${esc(link)}">${t("انسخ رابط طلبك الخاص")}</button></div></div>`;
  }));
  box.innerHTML=parts.join("");
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const it=e.target.closest("[data-item]");if(it&&!e.target.closest("a,button")){openItem(it.dataset.item);return}
  const il=e.target.closest("[data-item-link]");if(il){e.preventDefault();openItem(il.dataset.itemLink);return}
  const tb=e.target.closest("[data-tab]");if(tb){const dl=tb.closest("dialog");if(dl)dl.close();if(tb.dataset.city){S.city=tb.dataset.city;S.country=countryOf(S.city);$("#fCountry").value=S.country;fillCity()}S.kind=tb.dataset.tab;render();$("#market").scrollIntoView({behavior:"smooth"});return}
  const of=e.target.closest("[data-offer]");if(of){openOffer(of.dataset.offer);return}
  const op=e.target.closest("[data-open]");if(op){e.preventDefault();openDialog(op.dataset.open,op.dataset.preset);return}
  const cl=e.target.closest("[data-close]");if(cl){cl.closest("dialog").close();return}
  const go=e.target.closest("[data-go]");if(go){const dl=go.closest("dialog");if(dl)dl.close();if(go.dataset.go==="map"&&!MAP&&window.L){initMap.force=true;initMap();$("#mapToggle").hidden=true;drawMarkers(LASTR)}const el=go.dataset.go==="map"?$("#map"):document.getElementById(go.dataset.go);if(el&&!el.hidden)el.scrollIntoView({behavior:"smooth",block:"start"});else if(go.dataset.go==="mine")openDialog("dlgReq");return}
  const sh=e.target.closest("[data-share],[data-copylink]");if(sh){const u=sh.dataset.copylink||location.origin+location.pathname+"#l-"+sh.dataset.share;try{navigator.clipboard.writeText(u).then(()=>toast(t("نُسخ الرابط")),()=>toast(u))}catch(_){toast(u)}}
});
$("#grid").addEventListener("keydown",e=>{const c=e.target.closest("[data-item]");if(c&&e.target===c&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openItem(c.dataset.item)}});
let LASTKIND="rent";
$("#viewSeg").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(!b)return;if(b.dataset.view==="req"){if(S.kind!=="req")LASTKIND=S.kind;S.kind="req"}else if(S.kind==="req")S.kind=LASTKIND;render()});
$$("[data-dur]").forEach(b=>b.addEventListener("click",()=>{S.kind=b.dataset.dur;render()}));
$("#modeSeg").addEventListener("click",e=>{const b=e.target.closest("[data-mode]");if(!b)return;const sale=b.dataset.mode==="sale";if(sale!==isSale()){S.kind=sale?"land":"rent";S.rentType=""}render()});
$("#saleRow").addEventListener("click",e=>{const b=e.target.closest("[data-sf]");if(!b)return;S[b.dataset.sf]=!S[b.dataset.sf];render()});
$("#rtiles").addEventListener("click",e=>{const b=e.target.closest(".rtile");if(!b)return;S.rentType=b.dataset.pt;if(b.dataset.k==="rent"){if(S.kind!=="rent"&&S.kind!=="daily")S.kind="rent"}else S.kind=b.dataset.k;render();$("#market").scrollIntoView({behavior:"smooth"})});
$("#furnChip").addEventListener("click",e=>{S.furn=!S.furn;e.currentTarget.setAttribute("aria-pressed",S.furn);render()});
$("#waterChip").addEventListener("click",e=>{S.water=!S.water;e.currentTarget.setAttribute("aria-pressed",S.water);render()});
$("#advChip").addEventListener("click",e=>{S.adv=!S.adv;e.currentTarget.setAttribute("aria-pressed",S.adv);if(S.kind!=="rent"){S.kind="rent"}render()});
$("#sunChip").addEventListener("click",e=>{S.sun=!S.sun;e.currentTarget.setAttribute("aria-pressed",S.sun);render()});
$("#mapToggle").addEventListener("click",e=>{const b=e.currentTarget;
  if(!MAP){initMap.force=true;initMap();drawMarkers(LASTR);b.setAttribute("aria-expanded","true");b.textContent=t("🗺 أخفِ الخريطة");return}
  const m=$("#mapWrap"),show=m.hidden;m.hidden=!show;b.setAttribute("aria-expanded",show);b.textContent=t(show?"🗺 أخفِ الخريطة":"🗺 اعرض الخريطة");if(show)MAP.invalidateSize()});
/* أدوات الخريطة */
$("#areaSearch").addEventListener("click",()=>{if(MAP)setBounds(MAP.getBounds())});
$("#boundsChip").addEventListener("click",()=>setBounds(null));
$("#satBtn").addEventListener("click",e=>{if(!MAP)return;const on=!MAP.hasLayer(BASE.sat);
  if(on){MAP.removeLayer(BASE.street);BASE.sat.addTo(MAP)}else{MAP.removeLayer(BASE.sat);BASE.street.addTo(MAP)}e.currentTarget.setAttribute("aria-pressed",on)});
function fullMap(on){const w=$("#mapWrap");w.classList.toggle("full",on);document.body.classList.toggle("noscroll",on);$("#fullBtn").setAttribute("aria-pressed",on);
  $("#fullBtn span").textContent=t(on?"خروج":"ملء الشاشة");setTimeout(()=>MAP&&MAP.invalidateSize(),60)}
$("#fullBtn").addEventListener("click",()=>fullMap(!$("#mapWrap").classList.contains("full")));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("#mapWrap").classList.contains("full"))fullMap(false)});
function locate(cb){if(!navigator.geolocation){toast(t("المتصفح لا يدعم تحديد الموقع"));return}
  toast(t("جارٍ تحديد موقعك…"));
  navigator.geolocation.getCurrentPosition(p=>cb([p.coords.latitude,p.coords.longitude]),()=>toast(t("لم نتمكن من تحديد موقعك. اسمح للموقع بذلك من إعدادات المتصفح")),{enableHighAccuracy:true,timeout:12000,maximumAge:60000})}
$("#nearBtn").addEventListener("click",()=>{if(!MAP)return;locate(ll=>{
  ME=L.circleMarker(ll,{radius:8,color:"#fff",weight:3,fillColor:"#1A73E8",fillOpacity:1});
  AUTO=true;MAP.setView(ll,14);setBounds(L.latLng(ll[0],ll[1]).toBounds(6000));
  const n=$("#count").textContent;toast(t("العروض في حدود 3 كم حولك")+" · "+n)})});
// تمرير الفأرة على بطاقة يبرز دبوسها على الخريطة
$("#grid").addEventListener("mouseover",e=>{const c=e.target.closest("[data-item]");$$(".pin.on").forEach(x=>x.classList.remove("on"));if(c){const p=document.querySelector(`.pin[data-pin="${c.dataset.item}"]`);if(p)p.classList.add("on")}});
$("#moreBtn").addEventListener("click",e=>{const m=$("#moreF"),o=m.hidden;m.hidden=!o;e.currentTarget.setAttribute("aria-expanded",o)});
$("#fCountry").addEventListener("change",e=>{S.country=e.target.value;S.bounds=null;$("#boundsChip").hidden=true;S.city="";fillCity();I18.apply();render()});
$("#fCity").addEventListener("change",e=>{S.city=e.target.value;S.bounds=null;$("#boundsChip").hidden=true;S.area="";$("#fArea").value="";render()});
$("#fArea").addEventListener("change",e=>{S.area=e.target.value;render()});
$("#reqSeg").addEventListener("click",e=>{const b=e.target.closest("[data-rq]");if(!b)return;S.rq=b.dataset.rq;render()});
$("#fSort").addEventListener("change",e=>{S.sort=e.target.value;render()});
$("#fMax").addEventListener("input",e=>{S.max=Number(e.target.value)||Infinity;render()});
$("#fQ").addEventListener("input",e=>{S.q=e.target.value.trim();render()});
$("#cur").addEventListener("change",e=>{S.cur=e.target.value;try{localStorage.setItem("aq-cur",S.cur)}catch(_){}render()});
$("#langBtn").addEventListener("click",()=>I18.setLang(I18.lang==="fr"?"ar":"fr"));
document.addEventListener("aq-lang",()=>{fillSelects();render();renderMine()});
$("#roleSearch").addEventListener("click",e=>{const f=$("#searchForm"),open=f.hidden;f.hidden=!open;e.currentTarget.setAttribute("aria-expanded",open);if(open)$("#sKind").focus()});
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();
  S.kind=$("#sKind").value;S.rentType=(S.kind==="rent"||S.kind==="daily")?$("#sType").value:"";S.city=$("#sCity").value;S.country=S.city?countryOf(S.city):"";$("#fCountry").value=S.country;fillCity();I18.apply();render();$("#market").scrollIntoView({behavior:"smooth"})});

/* ---------- dialogs ---------- */
function syncArea(form){const city=form.querySelector("[name=city]").value;const w=form.querySelector("[id$=AreaWrap]");if(w)w.hidden=city!=="نواكشوط"}
function openDialog(id,preset){
  const d=document.getElementById(id);if(!d)return;
  if(id==="dlgReq"){const f=$("#reqForm");if(preset)f.kind.value=preset;if(S.rentType)f.ptype.value=S.rentType;if(preset==="buy"&&S.kind==="land")f.ptype.value="أرض";f.furnished.checked=S.furn;if(S.city)f.city.value=S.city;syncArea(f);syncKind()}
  if(id==="dlgAdd"){const f=$("#addForm");if(preset==="rent")f.kind.value=S.kind==="daily"?"daily":"rent";if(preset==="sale")f.kind.value=S.kind==="land"?"land":"home_sale";syncAdd();syncArea(f);setTimeout(initPick,50)}
  if(!d.open)d.showModal();
}
["#reqForm","#addForm"].forEach(f=>$(f).querySelector("[name=city]").addEventListener("change",()=>syncArea($(f))));
function syncKind(){const f=$("#reqForm"),buy=f.kind.value==="buy"||f.kind.value==="invest";f.duration.closest("label").hidden=buy;f.advance_max.closest("label").hidden=f.kind.value!=="rent";if(f.kind.value==="daily")f.duration.value="يومي"}
$("#reqForm").addEventListener("change",e=>{if(e.target.name==="kind")syncKind()});

/* حماية من الرسائل المزعجة: حقل خفي لا يملؤه إلا الروبوت، ومهلة 30 ثانية بين إرسالين */
function guardOK(f){
  if(f.website&&f.website.value){f.reset();return false}
  const k="aq-last-"+f.id,now=Date.now();let last=0;try{last=Number(localStorage.getItem(k))||0}catch(_){}
  if(now-last<30000){toast(t("انتظر قليلًا قبل الإرسال مرة أخرى"));return false}
  try{localStorage.setItem(k,String(now))}catch(_){}
  return true;
}
const d=id=>document.getElementById(id);
function done(title,text,wa){
  $("#itemBody").innerHTML=`<h3>${esc(t(title))}</h3><p style="margin:0">${esc(t(text))}</p><div class="row">${wa?`<a class="btn" href="${wa}" target="_blank" rel="noopener">${t("أكّد عبر واتساب")}</a>`:""}<button class="btn ghost" data-close>${t("حسنًا")}</button></div>`;
  if(!$("#dlgItem").open)$("#dlgItem").showModal();
}

const sendErr=err=>t(/plan_limit/.test(String(err&&(err.message||err)))?"وصلت إلى حد العروض المجانية اليوم. اشترك لعروض بلا حد":/too_many/.test(String(err&&(err.message||err)))?"أرسلت كثيرًا في وقت قصير، حاول بعد قليل":!navigator.onLine?"لا يوجد اتصال بالإنترنت، أرسل حين يعود":"تعذّر الإرسال، حاول مرة أخرى");
/* تقييم السمسار (مطفأ حتى تفعيله) */
document.addEventListener("click",async e=>{const b=e.target.closest("[data-stars]");if(!b)return;const row=b.closest("[data-rate]");
  try{await API.rateOffer(row.dataset.token,Number(row.dataset.rate),Number(b.dataset.stars),null);row.innerHTML=`<span class="ok">✓ ${t("شكرًا، وصل تقييمك")}</span>`}
  catch(err){console.error(err);toast(t(/already|duplicate|unique/i.test(String(err&&err.message))?"قيّمت هذا العرض من قبل":"تعذّر الإرسال، حاول مرة أخرى"))}});
/* request */
$("#reqForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target,btn=f.querySelector("[type=submit]");if(!guardOK(f))return;
  const o={kind:f.kind.value,ptype:f.ptype.value,duration:(f.kind.value==="buy"||f.kind.value==="invest")?null:f.duration.value,city:f.city.value,country:countryOf(f.city.value),area:f.city.value==="نواكشوط"?(f.area.value||null):null,
    rooms:Number(f.rooms.value)||null,budget:Number(f.budget.value)||null,move_in:f.move_in.value||null,furnished:f.furnished.checked,solar:f.solar.checked,advance_max:(f.kind.value==="rent"&&Number(f.advance_max.value))||null,
    residence:f.residence.value,notes:f.notes.value.trim()||null,name:f.name.value.trim()||null,whatsapp:cleanPhone(f.whatsapp.value)};
  if(o.whatsapp.length<6){toast(t("اكتب رقم واتساب صحيحًا مع رمز الدولة"));return}
  btn.disabled=true;
  try{
    const saved=await API.addRequest(o);
    const lbl=`${o.ptype} ${reqKind(o.kind)} — ${o.area?o.area+"، ":""}${o.city}${o.budget?" — "+fmt(o.budget)+" أوقية":""}`;
    addMy(saved.owner_token,lbl);
    if(CUR_BY_RES[o.residence]&&RATES[CUR_BY_RES[o.residence]]){S.cur=CUR_BY_RES[o.residence];$("#cur").value=S.cur}
    f.reset();d("dlgReq").close();
    REQS=await API.publicRequests().catch(()=>REQS);render();renderMine();
    const sum=`طلب جديد على عقارك: ${lbl}${o.residence!=="موريتانيا"?" — مقيم في "+o.residence:""}`;
    done("وصل طلبك","سنراجعه بسرعة ثم نرسله إلى السماسرة الموثوقين، وتأتيك العروض على واتساب.",PLATFORM?waLink(PLATFORM,sum):"");
    $("#itemBody").insertAdjacentHTML("beforeend",`<div class="alt">${t("تابع العروض التي تصلك في قسم «طلباتي» في هذه الصفحة.")}</div>`);
  }catch(err){console.error(err);toast(sendErr(err))}finally{btn.disabled=false}
});

/* add listing */
let PICK=null,PICKM=null,PICKED=null;
function initPick(){
  if(!window.L||PICK){if(PICK)PICK.invalidateSize();return}
  PICK=L.map("pickMap").setView([18.08,-15.98],11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(PICK);
  PICK.on("click",ev=>{PICKED=ev.latlng;if(PICKM)PICKM.setLatLng(ev.latlng);else PICKM=L.marker(ev.latlng).addTo(PICK)});
  PICK._sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:'Imagery &copy; Esri'});
}
/* حقول تتغير حسب نوع العرض + مقابل الأوقية القديمة أثناء الكتابة */
function fillFeats(){const box=$("#featBox");if(!box)return;const mk=(v,cls)=>`<label class="${cls}"><input type="checkbox" name="feat" value="${esc(v)}"> ${esc(t(v))}</label>`;
  box.innerHTML=HOME_FEATS.map(v=>mk(v,"fh")).join("")+LAND_FEATS.filter(v=>!HOME_FEATS.includes(v)).map(v=>mk(v,"fl")).join("")+mk(NEGO,"fn")}
function syncAdd(){const f=$("#addForm"),k=f.kind.value,land=k==="land";
  f.advance_months.closest("label").hidden=k!=="rent";f.title_doc.closest("label").hidden=!(land||k==="home_sale");
  f.rooms.closest("label").hidden=land;f.ptype.closest("label").hidden=land;f.furnished.closest("label").hidden=land;f.solar.closest("label").hidden=land;
  $$("#featBox .fh").forEach(x=>x.hidden=land&&!LAND_FEATS.includes(x.querySelector("input").value));$$("#featBox .fl").forEach(x=>x.hidden=!land)}
fillFeats();syncAdd();
$("#addForm").addEventListener("change",e=>{if(e.target.name==="kind")syncAdd()});
function oldHint(inp){if(!inp)return;const h=document.createElement("span");h.className="oldhint";inp.after(h);
  const up=()=>{h.textContent=Number(inp.value)>0&&I18.lang!=="fr"?"= "+oldTxt(inp.value)+" "+t("بالقديمة"):""};inp.addEventListener("input",up);up()}
["#addForm [name=price]","#reqForm [name=budget]","#contractForm [name=crent]","#offerForm [name=price]"].forEach(q=>oldHint($(q)));
$("#pickSat").addEventListener("click",e=>{if(!PICK)return;const on=!PICK.hasLayer(PICK._sat);if(on)PICK._sat.addTo(PICK);else PICK.removeLayer(PICK._sat);e.currentTarget.setAttribute("aria-pressed",on)});
$("#pickMe").addEventListener("click",()=>{if(!PICK)return;locate(ll=>{PICKED=L.latLng(ll[0],ll[1]);if(PICKM)PICKM.setLatLng(PICKED);else PICKM=L.marker(PICKED).addTo(PICK);PICK.setView(ll,17);toast(t("حُدّد موقع العقار"))})});
$("#aCity").addEventListener("change",e=>{const c=cityInfo(e.target.value);if(PICK&&c)PICK.setView([c[3],c[2]],12)});
$("#genDesc").addEventListener("click",()=>{
  const f=$("#addForm"),k=f.kind.value,r=Number(f.rooms.value)||0,pl=(f.city.value==="نواكشوط"&&f.area.value?f.area.value+"، ":"")+f.city.value;
  const ar=k==="land"?`قطعة أرضية للبيع في ${pl}${f.size_m2.value?" بمساحة "+f.size_m2.value+" م²":""}${f.title_doc.value?"، "+f.title_doc.value:""}.`
    :`${f.ptype.value} ${KIND_LABEL[k]} في ${pl}${r&&f.ptype.value!=="محل"?"، "+r+(r>1?" غرف":" غرفة"):""}${f.furnished.checked?"، مفروش":""}${f.solar.checked?"، كهرباء بلا انقطاع (نظام شمسي وبطارية)":""}.`;
  const fr=k==="land"?`Terrain à vendre à ${I18.t(f.city.value)}${f.size_m2.value?", "+f.size_m2.value+" m²":""}.`:`${k==="daily"?"Location à la nuit":k==="home_sale"?"À vendre":"À louer"} à ${I18.t(f.city.value)}${r?", "+r+" pièce"+(r>1?"s":""):""}${f.furnished.checked?", meublé":""}${f.solar.checked?", électricité sans coupure":""}.`;
  f.description.value=ar+"\n\n"+fr+(f.description.value?"\n\n"+f.description.value:"");
  if(!f.title.value)f.title.value=ar.replace(/\.$/,"").slice(0,80);
});
$("#addForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target,btn=f.querySelector("[type=submit]");if(!guardOK(f))return;
  const files=[...f.photos.files].slice(0,6);
  const o={kind:f.kind.value,ptype:f.kind.value==="land"?"أرض":f.ptype.value,city:f.city.value,country:countryOf(f.city.value),area:f.city.value==="نواكشوط"?(f.area.value||null):null,
    title:f.title.value.trim(),price:Number(f.price.value)||0,rooms:Number(f.rooms.value)||null,size_m2:Number(f.size_m2.value)||null,title_doc:f.title_doc.value||null,
    furnished:f.furnished.checked,solar:f.solar.checked,advance_months:(f.kind.value==="rent"&&Number(f.advance_months.value))||null,features:[...f.querySelectorAll("[name=feat]:checked")].map(x=>x.value).filter(v=>f.kind.value==="land"?LAND_FEATS.includes(v)||v===NEGO:HOME_FEATS.includes(v)||v===NEGO),commission:FEAT("COMMISSION")&&f.commission.value?f.commission.value:undefined,description:f.description.value.trim()||null,contact_name:f.contact_name.value.trim()||null,
    contact_whatsapp:cleanPhone(f.contact_whatsapp.value),lat:PICKED?PICKED.lat:null,lng:PICKED?PICKED.lng:null,photos:[]};
  if(o.contact_whatsapp.length<6){toast(t("اكتب رقم واتساب صحيحًا مع رمز الدولة"));return}
  if(o.commission===undefined)delete o.commission;
  const label0=btn.textContent;btn.disabled=true;btn.textContent="…";
  try{
    for(const file of files)o.photos.push(await API.uploadPhoto(file));
    await API.addListing(o);f.reset();syncAdd();PICKED=null;if(PICKM){PICKM.remove();PICKM=null}
    d("dlgAdd").close();done("وصل عقارك","سيظهر عقارك في الموقع بعد مراجعة سريعة.",PLATFORM?waLink(PLATFORM,"أضفت عقارًا على عقارك: "+o.title):"");
    const sale=o.kind==="land"||o.kind==="home_sale",mt=REQS.filter(q=>q.city===o.city&&(sale?(q.kind==="buy"||q.kind==="invest"):(q.kind==="rent"||q.kind==="daily"))&&(!q.budget||o.price<=q.budget*1.1));
    if(mt.length)$("#itemBody").insertAdjacentHTML("beforeend",`<div class="matchbox"><b>${mt.length} ${t("طلبات مفتوحة في")} ${esc(t(o.city))} ${t("قد تناسب عقارك")}</b><span>${t("لا تنتظر الزبون: اعرض عقارك على أصحابها الآن.")}</span><button class="btn or small" data-tab="req" data-city="${esc(o.city)}">${t("اعرضه على الطلبات")}</button></div>`);
  }catch(err){console.error(err);toast(sendErr(err))}finally{btn.disabled=false;btn.textContent=label0}
});

/* broker */
$("#brokerForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target,btn=f.querySelector("[type=submit]");if(!guardOK(f))return;
  const o={name:f.name.value.trim(),whatsapp:cleanPhone(f.whatsapp.value),cities:[...f.cities.selectedOptions].map(x=>x.value),areas:f.areas.value.trim()||null};
  if(o.whatsapp.length<6){toast(t("اكتب رقم واتساب صحيحًا مع رمز الدولة"));return}
  btn.disabled=true;
  try{await API.addBroker(o);f.reset();d("dlgBroker").close();done("وصل تسجيلك","سنتحقق من حسابك ونتواصل معك على واتساب.",PLATFORM?waLink(PLATFORM,"سجّلت كسمسار على عقارك باسم "+o.name):"");
    const code="b"+o.whatsapp.slice(-8);try{localStorage.setItem("aq-myref",code)}catch(_){}
    const link=(CFG.SITE_URL||location.origin+location.pathname)+"?ref="+code;
    $("#itemBody").insertAdjacentHTML("beforeend",`<div class="matchbox"><b>${t("رابط دعوتك الخاص")}</b><span>${t("انشره في مجموعاتك وحالتك: كل طلب أو إعلان يأتي عن طريقه يُسجَّل باسمك.")}</span><code dir="ltr" style="word-break:break-all">${esc(link)}</code><a class="btn small wa" target="_blank" rel="noopener" href="${waLink("",t("اطلب عقارك أو اعرض عقارك مجانًا على عقارك")+"\n"+link)}">${t("انشره على واتساب")}</a></div>`)}
  catch(err){console.error(err);toast(sendErr(err))}finally{btn.disabled=false}
});

/* ---------- assistant (rule-based parser) ---------- */
const ALIAS2=Object.fromEntries(Object.entries(window.AQ.ALIAS).map(([k,v])=>[N(k),v]));
const NUMW={"واحد":1,"وحده":1,"غرفتين":2,"بيتين":2,"اثنين":2,"ثلاث":3,"ثلاثه":3,"اربع":4,"اربعه":4,"خمس":5,"خمسه":5};
function parse(txt){
  let s=N(txt);const o={};
  for(const k in ALIAS2){if(s.includes(k))s+=" "+N(ALIAS2[k])}
  o.kind=/قطعه|ارض/.test(s)?"land":/شراء|اشتري|نشري|للبيع/.test(s)?"home_sale":/يوم|ليله|ليالي/.test(s)?"daily":"rent";
  const ab=txt.match(/(?:انا|أنا|ساكن|مقيم|نسكن)\s+(?:في|ف)\s*([^\s،,.]+)/);
  if(ab){o.from=ab[1];const fc=CITIES.find(c=>N(c[0])===N(o.from));
    if(fc&&fc[1]!=="موريتانيا")o.res=fc[1];
    else for(const r of RESIDENCES){if(N(o.from).replace(/^ال/,"")===N(r).replace(/^ال/,""))o.res=r}}
  const s2=ab?s.replace(N(ab[0]),""):s;
  for(const c of CITIES){if(s2.includes(N(c[0])))o.city=c[0]}
  for(const a of NKC_AREAS){if(s2.includes(N(a))){o.area=a;o.city="نواكشوط"}}
  for(const p of ["محل","مكتب","غرفه","استوديو","دار","فيلا","شقه","مستودع"])if(s.includes(p)){o.ptype={"غرفه":"غرفة","استوديو":"غرفة","فيلا":"دار","شقه":"شقة"}[p]||p;break}
  const m=s.match(/(\d+)\s*(غرف|غرفه|بيوت|بيت)/);if(m)o.rooms=+m[1];
  else{for(const w in NUMW){if(new RegExp(w+"\\s*(غرف|غرفه|بيوت|بيت)").test(s)||(w==="غرفتين"||w==="بيتين")&&s.includes(w)){o.rooms=NUMW[w];break}}}
  const W={"واحد":1,"اثنين":2,"ثلاث":3,"ثلاثه":3,"اربع":4,"اربعه":4,"خمس":5,"خمسه":5,"ست":6,"سته":6,"سبع":7,"سبعه":7,"ثمان":8,"ثمانيه":8,"تسع":9,"تسعه":9,"عشر":10,"عشره":10};
  const half=/(ونص|ونصف)/.test(s);
  const mw=s.match(/(?:^|\s|ب)(مليونين|(\S+)\s*ملايين|مليون)/);
  const hw=s.match(/(?:^|\s|ب)(?:(\S+?)\s*)?(مائه|ميه|مايه|ميتين|مائتين|متين)\s*(الف)?/);
  if(mw&&!/\d\s*مليون/.test(s)){const n=mw[1]==="مليونين"?2:mw[2]?(W[mw[2].replace(/^ب/,"")]||+mw[2]||1):1;o.budget=(n+(half?.5:0))*1e6}
  else if(hw&&!/\d/.test(s)){const n=/تين$/.test(hw[2])?2:(W[(hw[1]||"").replace(/^ب/,"")]||1);o.budget=n*100*(hw[3]?1000:1)}
  else if(/مليون ونصف/.test(s))o.budget=1500000;
  else{const nums=[...s.matchAll(/(\d+(?:[.,]\d+)?)\s*(الف|مليون)?/g)].map(x=>{const n=parseFloat(x[1].replace(",","."));return x[2]==="مليون"?n*1e6:x[2]==="الف"?n*1000:n}).filter(n=>n>=500);if(nums.length)o.budget=Math.max(...nums);else if(/مليون/.test(s))o.budget=1e6}
  // الأوقية القديمة: «بالقديمة» صراحة، أو مبلغ إيجار شهري لا يُعقل بالجديدة
  if(o.budget&&(/قديم/.test(s)||(o.kind==="rent"&&o.budget>=400000)||(o.kind==="daily"&&o.budget>=40000)||((o.kind==="land"||o.kind==="home_sale")&&/مليون|ملايين/.test(s)&&!/جديد/.test(s)))){o.budget=Math.round(o.budget/10);o.oldConv=true}
  const adv=s.match(/مقدم\s*(\d+|شهر|شهرين|ثلاث|سته)/);if(adv)o.adv={"شهر":1,"شهرين":2,"ثلاث":3,"سته":6}[adv[1]]||+adv[1];
  if(/مفروش/.test(s))o.furn=true;
  if(/باتري|بطاريه|بلا انقطاع|شمسي|مولد/.test(s))o.sun=true;
  return o;
}
function say(html,who){const el=document.createElement("div");el.className="msg "+who;el.innerHTML=html;$("#msgs").appendChild(el);$("#msgs").scrollTop=1e6}
say("السلام عليكم. اكتب ما تبحث عنه: المدينة، والحي، ونوع العقار، وعدد الغرف، والميزانية.","bot");
$("#chatForm").addEventListener("submit",e=>{
  e.preventDefault();const txt=$("#chatIn").value.trim();if(!txt)return;$("#chatIn").value="";say(esc(txt),"me");
  const p=parse(txt);
  const rows=[["النوع",KIND_LABEL[p.kind]],p.ptype?["العقار",p.ptype]:null,["المدينة",p.city||"لم أفهمها"],p.area?["الحي",p.area]:null,p.rooms?["الغرف",p.rooms]:null,["الميزانية",p.budget?fmt(p.budget)+" أوقية"+(p.oldConv?" (حوّلتها من القديمة: "+oldTxt(p.budget)+")":" = "+oldTxt(p.budget)+" بالقديمة"):"لم أفهمها"],p.adv?["المقدم",ADV_TXT(p.adv)]:null,p.furn?["مفروش","نعم"]:null,p.sun?["شرط","بلا انقطاع"]:null,p.res?["مقيم في",p.res]:null].filter(Boolean);
  say(`فهمت طلبك هكذا:<dl>${rows.map(r=>`<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl>`,"bot");
  const m=LIST.filter(i=>i.kind===p.kind&&(!p.city||i.city===p.city)&&(!p.area||i.area===p.area)&&(!p.ptype||i.ptype===p.ptype)&&(!p.rooms||i.kind==="land"||(i.rooms||0)>=p.rooms)&&(!p.budget||i.price<=p.budget*1.05)&&(!p.sun||i.solar)&&(!p.furn||i.furnished)).slice(0,4);
  if(m.length)say("هذه عروض تناسبك الآن:\n"+m.map(i=>`• <a href="#l-${i.id}" data-item-link="${i.id}">${esc(i.title)}</a> — ${fmt(i.price)} أوقية`).join("\n"),"bot");
  else say("لا يوجد عرض مطابق الآن.","bot");
  say(`أرسل طلبك للسماسرة ليبحثوا لك: <button class="btn small or" data-fill='${esc(JSON.stringify(p))}'>أكمل الطلب</button>`,"bot");
  if(p.res&&CUR_BY_RES[p.res]&&RATES[CUR_BY_RES[p.res]]){S.cur=CUR_BY_RES[p.res];$("#cur").value=S.cur;render()}
});
$("#msgs").addEventListener("click",e=>{
  const b=e.target.closest("[data-fill]");if(!b)return;const p=JSON.parse(b.dataset.fill),f=$("#reqForm");
  f.kind.value=p.kind==="land"||p.kind==="home_sale"?"buy":p.kind;if(p.ptype)f.ptype.value=p.ptype;if(p.kind==="land")f.ptype.value="أرض";
  if(p.city)f.city.value=p.city;if(p.area)f.area.value=p.area;if(p.rooms)f.rooms.value=p.rooms;if(p.budget)f.budget.value=p.budget;
  f.furnished.checked=!!p.furn;f.solar.checked=!!p.sun;if(p.adv)f.advance_max.value=String(Math.min(p.adv,12));if(p.res)f.residence.value=p.res;if(p.kind==="daily")f.duration.value="يومي";
  syncArea(f);syncKind();if(!d("dlgReq").open)d("dlgReq").showModal();
});

/* ---------- اتصال، تثبيت، اختصارات ---------- */
function netState(){const off=!navigator.onLine;$("#offBar").hidden=!off}
addEventListener("online",()=>{netState();load()});addEventListener("offline",netState);netState();
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)&&!DEMO_PREVIEW())navigator.serviceWorker.register("sw.js").catch(()=>{});
function DEMO_PREVIEW(){return /claude\.ai|claudeusercontent/.test(location.hostname)}
/* ---------- load ---------- */
async function load(){
  if(BROKEN){toast("تعذّر الاتصال بالخادم. تحقق من الإنترنت ثم أعد تحميل الصفحة.")}
  const my=new URLSearchParams(location.search).get("my");
  if(my&&/^[0-9a-f-]{36}$/i.test(my)){addMy(my,"طلبي");try{history.replaceState(null,"",location.pathname)}catch(_){}}
  try{window.AQ.applySettings(await API.settings())}catch(err){console.error(err)}
  applyGates();document.dispatchEvent(new Event("aq-settings"));
  fillSelects();initMap();
  try{LIST=await API.listings()}catch(err){console.error(err);toast(t("تعذّر تحميل العقارات"))}
  try{REQS=await API.publicRequests()}catch(err){console.error(err)}
  try{BROKERS=await API.verifiedBrokers();VB=new Map(BROKERS.map(b=>[cleanPhone(b.whatsapp),b]))}catch(err){console.error(err)}
  if(new URLSearchParams(location.search).get("tab")==="req")S.kind="req";
  $("#grid").removeAttribute("aria-busy");
  render();renderMine();
  const op=new URLSearchParams(location.search).get("open");if(op==="req")openDialog("dlgReq","rent");if(op==="add")openDialog("dlgAdd","rent");if(op)try{history.replaceState(null,"",location.pathname+location.hash)}catch(_){}
  const h=location.hash.match(/^#l-(\d+)(-p)?$/);if(h){openItem(h[1]);if(h[2]){let n=0;const iv=setInterval(()=>{if(window.AQPOSTER||++n>40){clearInterval(iv);if(window.AQPOSTER)AQPOSTER.openFor(h[1])}},150)}}
  if(location.hash==="#requests"){S.kind="req";render();$("#market").scrollIntoView()}
}
// واجهة للإضافات (extras.js): تقرأ البيانات وتعيد الرسم
const _render=render;render=function(){_render();document.dispatchEvent(new Event("aq-rendered"))};
window.AQAPP={get brokers(){return BROKERS},get list(){return LIST},get reqs(){return REQS},S,render:()=>render(),openItem,openOffer,openDialog,t,fmt,place,reqKind};
load();
// تحديث «طلباتي» تلقائيًا حين يعود الزائر إلى الصفحة
document.addEventListener("visibilitychange",()=>{if(!document.hidden)renderMine()});
})();
