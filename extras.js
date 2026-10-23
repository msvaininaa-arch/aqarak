// عقارك — إضافات تسويقية وأدوات: أرقام حقيقية، آخر الطلبات، المشاركة، روابط المدن،
// عقد الإيجار، المفضلة والمقارنة، الطلب بالصوت، مكتب السمسار، زر واتساب العائم
(function(){
const A=window.AQAPP,{CFG,DEMO,CITIES,NKC_AREAS,PTYPES,countryOf,ic,thumbBg,$,$$,fmt,esc,opts,toast,cleanPhone,waLink}=window.AQ;
if(!A)return;
const t=s=>A.t(s),PLATFORM=cleanPhone(CFG.PLATFORM_WHATSAPP);
const SITE=()=>location.origin+location.pathname;
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const median=a=>{const b=a.slice().sort((x,y)=>x-y);return b.length?b[Math.floor(b.length/2)]:0};

/* ---------- 1) أرقام حقيقية ---------- */
function proof(){
  const L=A.list,R=A.reqs,cities=new Set(L.map(i=>i.city));
  const parts=[[L.length,"عقار منشور"],[R.length,"طلب مفتوح"],[cities.size,"مدينة"]].filter(x=>x[0]>0);
  $("#proof").innerHTML=parts.map(([n,l])=>`<span><b>${fmt(n)}</b> ${t(l)}</span>`).join("");
  $("#proof").hidden=!parts.length;
}

/* ---------- 2) المشاركة على واتساب ---------- */
function shareLinks(){
  // على بطاقات الطلبات: «شارك مع سمسار تعرفه»
  $$("#grid [data-req],#reqStrip [data-req]").forEach(card=>{
    if(card.querySelector(".shareReq"))return;
    const q=A.reqs.find(x=>String(x.id)===card.dataset.req);if(!q)return;
    const txt=`مطلوب على عقارك: ${q.ptype} ${A.reqKind(q.kind)} في ${q.area?q.area+"، ":""}${q.city}${q.budget?" حتى "+fmt(q.budget)+" أوقية":""}.\nعندك عرض؟ ادخل وقدّم عرضك: ${SITE()}?tab=req`;
    card.querySelector(".actions").insertAdjacentHTML("beforeend",`<a class="btn small ghost shareReq" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${t("شارك")}</a>`);
  });
}
new MutationObserver(()=>{
  const b=$("#itemBody [data-share]");if(!b||$("#itemBody .shareWa"))return;
  const i=A.list.find(x=>String(x.id)===b.dataset.share);if(!i)return;
  const txt=`${i.title} — ${fmt(i.price)} أوقية\n${SITE()}#l-${i.id}`;
  b.insertAdjacentHTML("beforebegin",`<button class="btn ghost small" data-imgitem="${i.id}">🖼 ${t("صورة للحالة")}</button><a class="btn ghost shareWa" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${t("شارك على واتساب")}</a>`);
  // زر المفضلة داخل التفاصيل
  b.insertAdjacentHTML("afterend",`<button class="btn ghost small" data-fav="${i.id}" aria-pressed="${favs().includes(i.id)}">${favs().includes(i.id)?"♥":"♡"} ${t("المفضلة")}</button>`);
}).observe($("#itemBody"),{childList:true});


/* ---------- صورة جاهزة لحالة واتساب ---------- */
function wrap(ctx,txt,maxW){const words=String(txt).split(/\s+/),lines=[];let cur="";
  for(const w of words){const tst=cur?cur+" "+w:w;if(ctx.measureText(tst).width>maxW&&cur){lines.push(cur);cur=w}else cur=tst}if(cur)lines.push(cur);return lines}
async function statusImage(o){
  try{await document.fonts.ready}catch(_){}
  const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const css=getComputedStyle(document.documentElement),v=n=>css.getPropertyValue(n).trim();
  const disp=v("--display")||"sans-serif",body=v("--body")||"sans-serif",fr=window.AQ_I18N&&AQ_I18N.lang==="fr";
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#2E2AD6");g.addColorStop(1,"#4B2BE0");x.fillStyle=g;x.fillRect(0,0,W,H);
  // زخرفة خفيفة: نقاط
  x.fillStyle="rgba(255,255,255,.07)";for(let i=0;i<14;i++)for(let j=0;j<6;j++){x.beginPath();x.arc(60+i*75,40+j*60,4,0,7);x.fill()}
  // السقف الأبيض
  x.fillStyle="#FFFFFF";x.beginPath();x.moveTo(W/2,330);x.lineTo(W-70,470);x.lineTo(W-70,H-150);x.lineTo(70,H-150);x.lineTo(70,470);x.closePath();x.fill();
  x.direction=fr?"ltr":"rtl";x.textAlign="center";
  // الشعار
  x.fillStyle="#fff";x.font=`800 76px ${disp}`;x.fillText(fr?"Aqarak":"عقارك",W/2,150);
  x.font=`500 34px ${body}`;x.globalAlpha=.9;x.fillText(fr?"Immobilier en Mauritanie et ailleurs":"عقارات موريتانيا وخارجها · أوجد منزلك",W/2,210);x.globalAlpha=1;
  // الوسم
  x.font=`700 40px ${body}`;const tw=x.measureText(o.tag).width+70;x.fillStyle="#B35300";
  x.beginPath();if(x.roundRect)x.roundRect((W-tw)/2,520,tw,72,36);else{const X0=(W-tw)/2,Y0=520,r=36;x.moveTo(X0+r,Y0);x.arcTo(X0+tw,Y0,X0+tw,Y0+72,r);x.arcTo(X0+tw,Y0+72,X0,Y0+72,r);x.arcTo(X0,Y0+72,X0,Y0,r);x.arcTo(X0,Y0,X0+tw,Y0,r);x.closePath()}x.fill();x.fillStyle="#fff";x.fillText(o.tag,W/2,570);
  // العنوان
  x.fillStyle="#151532";x.font=`700 60px ${disp}`;let y=720;for(const l of wrap(x,o.title,W-220).slice(0,3)){x.fillText(l,W/2,y);y+=82}
  // السعر
  if(o.price){y+=30;x.fillStyle="#2E2AD6";x.font=`800 92px ${disp}`;x.fillText(o.price,W/2,y);y+=60;
    if(o.old){x.fillStyle="#5D5F78";x.font=`500 38px ${body}`;x.fillText(o.old,W/2,y);y+=20}}
  // المكان والتفاصيل
  y+=70;x.fillStyle="#151532";x.font=`600 40px ${body}`;x.fillText("📍 "+o.place,W/2,y);
  if(o.extra){y+=64;x.fillStyle="#5D5F78";x.font=`500 34px ${body}`;for(const l of wrap(x,o.extra,W-240).slice(0,2)){x.fillText(l,W/2,y);y+=50}}
  // الدعوة
  x.fillStyle="#fff";x.font=`700 44px ${body}`;x.fillText(o.cta,W/2,H-80);
  x.font=`500 30px ${body}`;x.globalAlpha=.85;x.fillText((CFG.SITE_URL||location.host+location.pathname).replace(/^https?:\/\//,"").replace(/index\.html$/,"").replace(/\/$/,""),W/2,H-32);x.globalAlpha=1;
  return new Promise(r=>c.toBlob(r,"image/png"));
}
async function shareImage(o,name){
  const blob=await statusImage(o);if(!blob){toast(t("تعذّر إنشاء الصورة"));return}
  const file=new File([blob],name,{type:"image/png"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:o.cta+" "+SITE()});return}}catch(err){if(err&&err.name==="AbortError")return}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast(t("حُفظت الصورة: انشرها في حالة واتساب"));
}
const OLD=v=>window.AQ.oldTxt(v);
document.addEventListener("click",e=>{
  const r=e.target.closest("[data-imgreq]"),l=e.target.closest("[data-imgitem]");
  if(r){const q=A.reqs.find(x=>String(x.id)===r.dataset.imgreq);if(!q)return;
    shareImage({tag:t("مطلوب")+" · "+t(A.reqKind(q.kind)),title:`${t(q.ptype)}${q.rooms?" · "+q.rooms+" "+t("غرف"):""}`,price:q.budget?`${t("حتى")} ${fmt(q.budget)}`:"",old:q.budget?`${t("بالقديمة")}: ${OLD(q.budget)}`:"",
      place:A.place(q).replace(/<[^>]+>/g,""),extra:q.notes||"",cta:t("عندك عرض؟ قدّمه على عقارك")},`aqarak-talab-${q.id}.png`)}
  if(l){const i=A.list.find(x=>String(x.id)===l.dataset.imgitem);if(!i)return;
    shareImage({tag:t(window.AQ.KIND_LABEL[i.kind]),title:i.title,price:`${fmt(i.price)} ${t("أوقية")}${i.kind==="rent"?" "+t("/ شهر"):i.kind==="daily"?" "+t("/ ليلة"):""}`,old:`${t("بالقديمة")}: ${OLD(i.price)}`,
      place:A.place(i).replace(/<[^>]+>/g,""),extra:(Array.isArray(i.features)?i.features.slice(0,3).map(t).join(" · "):""),cta:t("تفاصيله ورقمه على عقارك")+" · "+t("رقم")+" "+i.id},`aqarak-${i.id}.png`)}
});
/* ---------- 3) روابط المدن: ?city=نواذيبو ---------- */
(function cityLink(){
  const c=new URLSearchParams(location.search).get("city");
  if(c&&CITIES.some(x=>x[0]===c)){A.S.city=c;A.S.country=countryOf(c);const fc=$("#fCountry");if(fc){fc.value=A.S.country;fc.dispatchEvent(new Event("change"))}$("#fCity").value=c;$("#fCity").dispatchEvent(new Event("change"))}
})();
function cityLinks(){
  const top=["نواكشوط","نواذيبو","روصو","كيفة","أطار","الزويرات","داكار","دبي"];
  $("#cityLinks").innerHTML=top.map(c=>`<a href="?city=${encodeURIComponent(c)}">${t("عقارات")} ${esc(t(c))}</a>`).join("");
}

/* ---------- 4) المفضلة والمقارنة ---------- */
const favs=()=>store.get("aq-fav",[]);
function toggleFav(id){id=Number(id);let f=favs();f=f.includes(id)?f.filter(x=>x!==id):[...f,id].slice(-12);store.set("aq-fav",f);decorate();
  $$(`[data-fav="${id}"]`).forEach(b=>{const on=f.includes(id);b.setAttribute("aria-pressed",on);b.innerHTML=b.classList.contains("fav")?(on?"♥":"♡"):`${on?"♥":"♡"} ${t("المفضلة")}`})}
function decorate(){
  const f=favs();
  $$("#grid [data-item]").forEach(card=>{
    const id=Number(card.dataset.item),th=card.querySelector(".thumb");if(!th)return;
    let b=th.querySelector(".fav");if(!b){th.insertAdjacentHTML("beforeend",`<button class="fav" data-fav="${id}" aria-label="${t("المفضلة")}"></button>`);b=th.querySelector(".fav")}
    const on=f.includes(id);b.setAttribute("aria-pressed",on);b.textContent=on?"♥":"♡";
  });
  const n=f.filter(id=>A.list.some(i=>i.id===id)).length;
  $("#cmpBtn").hidden=n<2;$("#cmpBtn").textContent=`${t("قارن المفضلة")} (${n})`;
}
function compare(){
  const items=favs().map(id=>A.list.find(i=>i.id===id)).filter(Boolean).slice(-3);
  const rows=[["السعر",i=>`${fmt(i.price)} ${t("أوقية")}`],["المكان",i=>A.place(i)],["النوع",i=>esc(t(i.ptype))],["الغرف",i=>i.rooms||"—"],["المساحة",i=>i.size_m2?fmt(i.size_m2)+" "+t("م²"):"—"],
    ["سعر الغرفة",i=>i.rooms&&i.kind!=="land"?fmt(i.price/i.rooms):"—"],["مفروش",i=>i.furnished?"✓":"—"],["بلا انقطاع",i=>i.solar?"✓":"—"],["المقدم",i=>i.kind==="rent"&&i.advance_months?esc(t(window.AQ.ADV_TXT(i.advance_months))):"—"],["بالقديمة",i=>window.AQ.oldTxt(i.price)],["الوثيقة",i=>i.title_doc?esc(t(i.title_doc)):"—"]];
  $("#itemBody").innerHTML=`<h3>${t("مقارنة")}</h3><div class="tablewrap"><table><tr><th></th>${items.map(i=>`<th><a href="#l-${i.id}" data-item-link="${i.id}">${esc(i.title)}</a></th>`).join("")}</tr>${rows.map(([l,f])=>`<tr><td><b>${t(l)}</b></td>${items.map(i=>`<td>${f(i)}</td>`).join("")}</tr>`).join("")}</table></div><div class="row"><button class="btn ghost" data-close>${t("إغلاق")}</button></div>`;
  if(!$("#dlgItem").open)$("#dlgItem").showModal();
}

/* ---------- 5) مكتب السمسار: مدينتي + «جديد» منذ آخر زيارة ---------- */
const lastSeen=store.get("aq-req-seen",0);
function office(){
  if(A.S.kind!=="req")return;
  const mine=store.get("aq-mycity","");
  if(!$("#myCity")){$("#reqSeg").insertAdjacentHTML("afterend",`<label class="alt" style="display:flex;gap:6px;align-items:center">${t("مدينتي")} <select id="myCity" class="chip">${opts(CITIES.map(c=>c[0]),t("كل المدن"))}</select></label>`);
    $("#myCity").value=mine;I18apply();$("#myCity").addEventListener("change",e=>{store.set("aq-mycity",e.target.value);A.S.city=e.target.value;A.S.country=e.target.value?countryOf(e.target.value):"";$("#fCountry").value=A.S.country;$("#fCountry").dispatchEvent(new Event("change"));$("#fCity").value=A.S.city;$("#fCity").dispatchEvent(new Event("change"))})}
  $$("#grid [data-req],#reqStrip [data-req]").forEach(card=>{const q=A.reqs.find(x=>String(x.id)===card.dataset.req);
    if(q&&lastSeen&&new Date(q.created_at).getTime()>lastSeen&&!card.querySelector(".isnew"))card.querySelector(".facts").insertAdjacentHTML("afterbegin",`<span class="badge or isnew">${t("جديد")}</span>`)});
  store.set("aq-req-seen",Date.now());
}
const I18apply=()=>window.AQ_I18N&&window.AQ_I18N.apply();

/* ---------- 6) نموذج عقد الإيجار ---------- */
$("#contractForm").addEventListener("submit",e=>{
  e.preventDefault();const f=e.target,v=n=>f[n].value.trim()||"…………";
  const months=Number(f.cmonths.value)||12,start=f.cstart.value||"…………";
  const txt=`بسم الله الرحمن الرحيم
عقد إيجار

إنه في يوم ${start}، تم الاتفاق بين:
المؤجر: ${v("clord")}، رقم الهاتف: ${v("clordph")}
والمستأجر: ${v("ctenant")}، رقم الهاتف: ${v("ctenph")}

على ما يلي:
1. العقار: ${v("cprop")}، الكائن في ${v("caddr")}.
2. مدة الإيجار: ${months} شهرًا، تبدأ من ${start}.
3. الأجرة الشهرية: ${f.crent.value?fmt(f.crent.value):"…………"} أوقية جديدة، تُدفع ${v("cpay")}.
4. المقدم: دفع المستأجر ${(n=>n===0?"لا شيء":n===1?"شهرًا واحدًا":n===2?"شهرين":n<=10?n+" أشهر":n+" شهرًا")(Number(f.cadv.value)||0)} مقدمًا، تُحتسب من أول مدة الإيجار.
   التأمين (الضمان): ${f.cdep.value?fmt(f.cdep.value):"…………"} أوقية، يُرد عند انتهاء العقد بعد التأكد من سلامة العقار.
5. فواتير الماء والكهرباء على ${v("cbills")}.
6. يلتزم المستأجر بالمحافظة على العقار، وعدم تأجيره من الباطن أو تغيير معالمه إلا بإذن مكتوب من المؤجر.
7. يُشعر أي طرف الآخر قبل شهر على الأقل إذا أراد عدم التجديد.
8. شروط أخرى: ${v("cnotes")}

توقيع المؤجر: ……………          توقيع المستأجر: ……………
الشاهد: ……………`;
  $("#contractOut").value=txt;$("#contractOut").hidden=false;$("#contractActs").hidden=false;
  $("#contractWa").href=`https://wa.me/?text=${encodeURIComponent(txt)}`;
});
// فتح نموذج العقد من أي رابط #contract
document.addEventListener("click",ev=>{const a=ev.target.closest('a[href="#contract"]');if(a){const d=$("#contractBox");if(d)d.open=true}});
if(location.hash==="#contract"&&$("#contractBox"))$("#contractBox").open=true;
$("#contractPrint").addEventListener("click",()=>{const v=$("#contractOut").value;if(!v)return;const w=window.open("","_blank");if(!w){toast(t("اسمح بالنوافذ المنبثقة لطباعة العقد"));return}
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${t("عقد إيجار")}</title><style>body{font-family:Tahoma,'Readex Pro',sans-serif;font-size:15pt;line-height:2;padding:24px 40px;white-space:pre-wrap}</style></head><body>${esc(v)}</body></html>`);
  w.document.close();w.focus();setTimeout(()=>w.print(),300)});
$("#contractCopy").addEventListener("click",()=>{const v=$("#contractOut").value;try{navigator.clipboard.writeText(v).then(()=>toast(t("نُسخ العقد")),()=>{$("#contractOut").select()})}catch(_){$("#contractOut").select()}});

/* ---------- 7) الطلب بالصوت ---------- */
(function voice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition,b=$("#micBtn");
  if(!SR||!b){if(b)b.hidden=true;return}
  b.innerHTML=ic("mic",20);
  b.addEventListener("click",()=>{
    const r=new SR();r.lang=(window.AQ_I18N&&AQ_I18N.lang==="fr")?"fr-FR":"ar-SA";r.interimResults=false;
    b.classList.add("rec");toast(t("تكلم الآن…"));
    r.onresult=ev=>{$("#chatIn").value=ev.results[0][0].transcript;$("#chatForm").requestSubmit()};
    r.onerror=()=>toast(t("لم أسمعك جيدًا، حاول مرة أخرى أو اكتب طلبك"));
    r.onend=()=>b.classList.remove("rec");r.start();
  });
})();

/* ---------- 8) واتساب العائم + روابط التواصل ---------- */
if(PLATFORM){const w=$("#waFloat");w.href=waLink(PLATFORM,"السلام عليكم، أتواصل معكم من موقع عقارك");w.hidden=false}
const SOC=CFG.SOCIAL||{};
$("#social").innerHTML=[["facebook","فيسبوك"],["tiktok","تيك توك"],["instagram","إنستغرام"],["whatsapp_channel","قناة واتساب"]].filter(([k])=>SOC[k]).map(([k,l])=>`<a href="${esc(SOC[k])}" target="_blank" rel="noopener">${t(l)}</a>`).join(" · ");

/* ---------- تهيئة الحقول ---------- */
function all(){proof();shareLinks();decorate();office()}
document.addEventListener("aq-rendered",all);
document.addEventListener("aq-lang",()=>{cityLinks();all()});
document.addEventListener("click",e=>{const f=e.target.closest("[data-fav]");if(f){e.preventDefault();e.stopPropagation();toggleFav(f.dataset.fav)}},true);
$("#cmpBtn").addEventListener("click",compare);
cityLinks();all();
})();
