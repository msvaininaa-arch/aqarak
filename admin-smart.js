// عقارك — مركز القيادة الذكي في لوحة الإدارة:
// مهام اليوم، مطابقة الطلبات بالعروض، إرسال الطلبات للسماسرة، كشف المشبوه والمكرر، أرقام الأسبوع، تصدير البيانات
(function(){
const {CFG,$,$$,fmt,esc,toast,waLink,cleanPhone,oldTxt,KIND_LABEL}=window.AQ;
const ADM=window.ADM;if(!ADM)return;
const SITE=(CFG.SITE_URL||location.origin+location.pathname.replace(/admin\.html$/,"")).replace(/\/?$/,"/");
const H=36e5,DAY=24*H,now=()=>Date.now(),age=d=>now()-new Date(d).getTime();
const median=a=>{const b=a.slice().sort((x,y)=>x-y);return b.length?b[Math.floor(b.length/2)]:0};
const reqKind=k=>({buy:"للشراء",invest:"استثمار",daily:"إيجار يومي"}[k]||"للإيجار");
const place=x=>(x.area?x.area+"، ":"")+x.city;
const reqLabel=r=>`${r.ptype} ${reqKind(r.kind)} — ${place(r)}${r.rooms?" · "+r.rooms+" غرف":""}${r.budget?" · حتى "+fmt(r.budget)+" أوقية":""}`;

/* مطابقة طلب بعروض منشورة */
function matches(r,L){
  const kinds=r.kind==="rent"?["rent"]:r.kind==="daily"?["daily"]:r.ptype==="أرض"?["land"]:["home_sale","land"];
  return L.filter(l=>l.status==="approved"&&kinds.includes(l.kind)&&l.city===r.city&&(!r.area||l.area===r.area)
    &&(l.kind==="land"||!r.ptype||r.ptype==="أرض"||l.ptype===r.ptype)&&(!r.rooms||l.kind==="land"||(l.rooms||0)>=r.rooms)
    &&(!r.budget||Number(l.price)<=r.budget*1.1)&&(!r.furnished||l.furnished)&&(!r.solar||l.solar))
   .sort((a,b)=>Math.abs(a.price-(r.budget||a.price))-Math.abs(b.price-(r.budget||b.price))).slice(0,3);
}
/* سماسرة موثّقون يناسبون الطلب (المدينة ثم الحي) */
function brokersFor(r,B){
  const v=B.filter(b=>b.verified&&(!b.cities||!b.cities.length||b.cities.includes(r.city)));
  const inArea=v.filter(b=>r.area&&(b.areas||"").includes(r.area));
  return (inArea.length?inArea:v).slice(0,4);
}
/* كشف المشبوه: سعر أقل من نصف المعتاد في الحي، أو إعلان مكرر من الرقم نفسه */
function suspicious(L){
  const pub=L.filter(l=>l.status==="approved"||l.status==="pending"),out=[];
  pub.forEach(l=>{
    const peers=pub.filter(p=>p.id!==l.id&&p.kind===l.kind&&p.city===l.city&&(!l.area||p.area===l.area)&&(l.kind==="land"||p.ptype===l.ptype));
    if(peers.length>=3){const m=median(peers.map(p=>l.kind==="land"&&l.size_m2&&p.size_m2?p.price/p.size_m2:Number(p.price)));
      const v=l.kind==="land"&&l.size_m2?l.price/l.size_m2:Number(l.price);
      if(m&&v<m*0.5)out.push({l,why:`السعر أقل من نصف المعتاد في ${place(l)} (المعتاد نحو ${fmt(l.kind==="land"&&l.size_m2?m*l.size_m2:m)})`})}
    const dup=pub.find(p=>p.id<l.id&&cleanPhone(p.contact_whatsapp)===cleanPhone(l.contact_whatsapp)&&cleanPhone(l.contact_whatsapp)!==cleanPhone(CFG.PLATFORM_WHATSAPP)
      &&p.kind===l.kind&&p.area===l.area&&p.ptype===l.ptype&&Math.abs(p.price-l.price)<=Math.max(p.price,l.price)*0.05);
    if(dup)out.push({l,why:`مكرر محتمل للإعلان رقم ${dup.id} (الرقم والحي والسعر نفسها)`});
  });
  return out;
}
/* أرقام فترة */
function stats(D,from,to){
  const inR=x=>{const t=new Date(x.created_at).getTime();return t>=from&&t<to};
  const R=D.requests.filter(inR),O=D.offers.filter(o=>o.status!=="hidden");
  const first=R.map(r=>{const os=O.filter(o=>o.request_id===r.id).map(o=>new Date(o.created_at)-new Date(r.created_at));return os.length?Math.min(...os):null});
  const answered=first.filter(x=>x!=null);
  return {req:R.length,lst:D.listings.filter(inR).length,off:D.offers.filter(inR).length,
    perReq:R.length?(R.reduce((a,r)=>a+O.filter(o=>o.request_id===r.id).length,0)/R.length):0,
    hrs:answered.length?median(answered)/H:null,within24:R.length?Math.round(answered.filter(x=>x<=DAY).length/R.length*100):0};
}
const trend=(a,b)=>b===0?(a?"▲":""):a>b?`▲ ${Math.round((a-b)/b*100)}%`:a<b?`▼ ${Math.round((b-a)/b*100)}%`:"=";

function render(){
  const D=ADM.data,box=$("#today");if(!box)return;
  const L=D.listings,R=D.requests,B=D.brokers;
  const pend=L.filter(l=>l.status==="pending"),pendR=R.filter(r=>r.status==="pending");
  const lonely=R.filter(r=>r.status==="open"&&age(r.created_at)>DAY&&!D.offers.some(o=>o.request_id===r.id&&o.status!=="hidden"));
  const fresh=R.filter(r=>r.status==="open"&&age(r.created_at)<=DAY);
  const stale=L.filter(l=>l.status==="approved"&&age(l.confirmed_at||l.created_at)>30*DAY);
  const waitingB=B.filter(b=>!b.verified);
  const sus=suspicious(L);
  const w0=stats(D,now()-7*DAY,now()+H),w1=stats(D,now()-14*DAY,now()-7*DAY);
  // الطلب مقابل العرض في الأحياء
  const areas=(window.AQ.FOCUS_AREAS&&window.AQ.FOCUS_AREAS.length?window.AQ.FOCUS_AREAS:window.AQ.NKC_AREAS.slice(0,4));
  const gap=areas.map(a=>({a,d:R.filter(r=>r.status==="open"&&r.area===a).length,s:L.filter(l=>l.status==="approved"&&l.area===a).length}));
  const refs={};[...L,...R].forEach(x=>{if(x.ref)refs[x.ref]=(refs[x.ref]||0)+1});
  const topRefs=Object.entries(refs).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const refName=c=>{const b=B.find(b=>("b"+cleanPhone(b.whatsapp).slice(-8))===c);return b?b.name:c};

  const task=(n,title,body,act)=>n?`<details class="task" ${n?"open":""}><summary><b class="n">${n}</b> ${title}${act||""}</summary><div class="tbody">${body}</div></details>`:"";
  const tasks=[
   task(pendR.length,"طلبات تنتظر مراجعتك — لا تظهر للسماسرة قبل موافقتك",pendR.map(r=>`<div class="trow"><div><b>#${r.id}</b> ${esc(reqLabel(r))}${r.notes?`<br><span class="alt">${esc(r.notes)}</span>`:""}</div><div class="row"><button class="btn small" data-rq="open" data-id="${r.id}">انشر</button><button class="btn small ghost" data-rq="closed" data-id="${r.id}">ارفض</button></div></div>`).join("")),
   task(pend.length,"إعلانات تنتظر مراجعتك","<p class='alt'>لا يظهر أي إعلان قبل موافقتك.</p>",` <button class="btn small" data-go-tab="pending">راجعها</button>`),
   task(lonely.length,"طلبات مرّ عليها يوم بلا عرض — لا تتركها تبرد",lonely.map(r=>{
     const m=matches(r,L),bs=brokersFor(r,B);
     const toReq=m.length?waLink(r.whatsapp,`السلام عليكم، بخصوص طلبك على عقارك (${reqLabel(r)}). هذه عروض قد تناسبك:\n`+m.map(l=>`• ${l.title} — ${fmt(l.price)} أوقية\n${SITE}#l-${l.id}`).join("\n")):"";
     const msgB=`طلب جديد على عقارك: ${reqLabel(r)}${r.residence&&r.residence!=="موريتانيا"?" — صاحبه مقيم في "+r.residence:""}${r.notes?"\nملاحظات: "+r.notes:""}\nقدّم عرضك من هنا: ${SITE}?tab=req`;
     return `<div class="trow"><div><b>#${r.id}</b> ${esc(reqLabel(r))} <span class="alt">· منذ ${Math.round(age(r.created_at)/DAY)} يوم</span></div><div class="row">
       ${m.length?`<a class="btn small wa" target="_blank" rel="noopener" href="${toReq}">أرسل له ${m.length} ${m.length>2?"عروض":"عرض"} مطابقة</a>`:`<span class="alt">لا عروض مطابقة بعد</span>`}
       ${bs.map(b=>`<a class="btn small ghost" target="_blank" rel="noopener" href="${waLink(b.whatsapp,msgB)}">أرسله لـ ${esc(b.name)}</a>`).join("")}
       ${bs.length?"":`<a class="btn small ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msgB)}">انشره في مجموعة السماسرة</a>`}</div></div>`}).join("")),
   task(fresh.length,"طلبات جديدة اليوم — أرسلها للسماسرة الآن",fresh.map(r=>{const bs=brokersFor(r,B),m=matches(r,L);
     const msgB=`طلب جديد على عقارك: ${reqLabel(r)}\nقدّم عرضك من هنا: ${SITE}?tab=req`;
     return `<div class="trow"><div><b>#${r.id}</b> ${esc(reqLabel(r))}${m.length?` <span class="badge vb">${m.length} مطابق في الموقع</span>`:""}</div><div class="row">${bs.map(b=>`<a class="btn small ghost" target="_blank" rel="noopener" href="${waLink(b.whatsapp,msgB)}">لـ ${esc(b.name)}</a>`).join("")}<a class="btn small ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msgB)}">لمجموعة</a></div></div>`}).join("")),
   task(sus.length,"إعلانات تحتاج نظرة (سعر غريب أو تكرار)",sus.map(({l,why})=>`<div class="trow"><div><b>#${l.id}</b> ${esc(l.title)} — ${fmt(l.price)}<br><span class="alt">${esc(why)}</span></div><div class="row"><a class="btn small ghost" target="_blank" rel="noopener" href="${waLink(l.contact_whatsapp,`السلام عليكم، بخصوص إعلانك رقم ${l.id} على عقارك (${l.title})، نريد التأكد من السعر والتفاصيل.`)}">اسأل صاحبه</a></div></div>`).join("")),
   task(stale.length,"إعلانات منشورة منذ أكثر من شهر — هل ما زالت متوفرة؟",stale.map(l=>`<div class="trow"><div><b>#${l.id}</b> ${esc(l.title)} <span class="alt">· ${esc(place(l))}</span></div><div class="row"><a class="btn small ghost" target="_blank" rel="noopener" href="${waLink(l.contact_whatsapp,`السلام عليكم، إعلانك على عقارك «${l.title}» (رقم ${l.id}): هل ما زال متوفرًا؟ أجب بنعم أو لا من فضلك.`)}">اسأل صاحبه</a>${window.AQ.FEAT("FRESHNESS")?`<button class="btn small ghost" data-smart="confirm" data-id="${l.id}">✓ ما زال متوفرًا</button>`:""}<button class="btn small ghost" data-smart="rented" data-id="${l.id}">أُجّر/بيع</button></div></div>`).join("")),
   task(waitingB.length,"سماسرة ينتظرون التوثيق",`<p class="alt">${waitingB.map(b=>esc(b.name)).join("، ")}</p>`,` <button class="btn small" data-go-tab="brokers">افتح</button>`)
  ].filter(Boolean);

  const kpi=(l,a,b,fmtv)=>`<div><b>${fmtv?fmtv(a):a}</b>${l}<span class="tr">${b==null?"":trend(a,b)}</span></div>`;
  const tips=[];
  gap.forEach(g=>{if(g.d>g.s)tips.push(`الطلب في <b>${esc(g.a)}</b> (${g.d}) أكثر من العروض (${g.s}): اجلب عروضًا من سماسرة هذا الحي.`);});
  if(w0.req&&w0.within24<60)tips.push(`${100-w0.within24}% من طلبات الأسبوع لم يصلها عرض خلال 24 ساعة: جنّد سماسرة أكثر أو أرسل الطلبات بنفسك من «مهام اليوم».`);
  if(w0.req<w1.req&&w1.req)tips.push("الطلبات أقل من الأسبوع الماضي: انشر «صورة للحالة» لبعض العروض في مجموعات الأحياء.");
  if(!B.some(b=>b.verified))tips.push("لا يوجد سمسار موثّق بعد: قابل أول 5 سماسرة ووثّقهم، فقسم «سماسرة موثوقون» يبني الثقة.");
  if(L.filter(l=>l.status==="approved").length<50)tips.push("العروض المنشورة أقل من 50: استعمل «➕ إضافة سريعة» قبل الإعلان الواسع.");

  box.innerHTML=`
   <div class="smartgrid">
    <section class="card pad"><h3>📋 مهام اليوم</h3>${tasks.length?tasks.join(""):`<p class="ok">✓ لا شيء عاجل. أحسنت.</p>`}</section>
    <section class="card pad"><h3>📊 هذا الأسبوع مقارنة بالسابق</h3>
      <div class="kpis">${kpi("طلبات جديدة",w0.req,w1.req)}${kpi("إعلانات جديدة",w0.lst,w1.lst)}${kpi("عروض على الطلبات",w0.off,w1.off)}
      ${kpi("عروض لكل طلب",w0.perReq,w1.perReq,v=>v.toFixed(1))}${kpi("ساعات حتى أول عرض",w0.hrs==null?"—":Math.round(w0.hrs),null)}${kpi("طلبات أُجيبت خلال 24 س",w0.within24+"%",null)}</div>
      <h4>الطلب مقابل العرض</h4>
      <table class="mini"><tr><th>الحي</th><th>طلبات مفتوحة</th><th>عروض منشورة</th></tr>${gap.map(g=>`<tr><td>${esc(g.a)}</td><td>${g.d}</td><td>${g.s}</td></tr>`).join("")}</table>
      ${topRefs.length?`<h4>من يجلب الزبائن (روابط الدعوة)</h4><ol class="alt">${topRefs.map(([c,n])=>`<li>${esc(refName(c))} — ${n}</li>`).join("")}</ol>`:""}
      ${tips.length?`<h4>💡 اقتراحات</h4><ul class="tips">${tips.map(t=>`<li>${t}</li>`).join("")}</ul>`:""}
      <div class="row" style="margin-top:10px"><button class="btn small" id="copyReport">انسخ تقرير الأسبوع</button><button class="btn small ghost" id="exportData">نزّل نسخة من البيانات</button></div>
      <p class="alt" style="margin:6px 0 0">أرسل التقرير أو ملف البيانات إلى Claude ليحلل ويقترح عليك.</p>
    </section>
   </div>`;
  box._report=`تقرير عقارك — أسبوع حتى ${new Date().toLocaleDateString("ar-EG-u-nu-latn")}
طلبات جديدة: ${w0.req} (السابق ${w1.req}) · إعلانات جديدة: ${w0.lst} (${w1.lst}) · عروض: ${w0.off} (${w1.off})
عروض لكل طلب: ${w0.perReq.toFixed(1)} · طلبات أُجيبت خلال 24 ساعة: ${w0.within24}%${w0.hrs!=null?` · الوقت حتى أول عرض: ${Math.round(w0.hrs)} ساعة`:""}
الطلب/العرض: ${gap.map(g=>`${g.a} ${g.d}/${g.s}`).join(" · ")}
مهام معلقة: طلبات للمراجعة ${pendR.length} · إعلانات للمراجعة ${pend.length} · طلبات بلا عرض ${lonely.length} · مشبوه ${sus.length} · قديم ${stale.length} · سماسرة ينتظرون ${waitingB.length}`;
}
document.addEventListener("click",async e=>{
  const g=e.target.closest("[data-go-tab]");if(g){ADM.show(g.dataset.goTab);return}
  if(e.target.closest("#copyReport")){const t=$("#today")._report||"";try{await navigator.clipboard.writeText(t);toast("نُسخ التقرير")}catch(_){prompt("انسخ التقرير:",t)}}
  if(e.target.closest("#exportData")){const D=ADM.data;
    // نسخة للتحليل: بلا أرقام هواتف أصحاب الطلبات ولا مفاتيحهم السرية
    const safe={exported_at:new Date().toISOString(),listings:D.listings,requests:D.requests.map(({whatsapp,name,owner_token,...r})=>r),offers:D.offers.map(({whatsapp,name,...o})=>o),brokers:D.brokers.map(({whatsapp,...b})=>b)};
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(safe,null,1)],{type:"application/json"}));a.download=`aqarak-data-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
  const q=e.target.closest("[data-rq]");if(q){try{await window.AQ.API.update("requests",Number(q.dataset.id),{status:q.dataset.rq});toast("تم");await ADM.reload()}catch(err){console.error(err);toast("تعذّر التنفيذ")}return}
  const s=e.target.closest("[data-smart]");if(s){try{await window.AQ.API.update("listings",Number(s.dataset.id),s.dataset.smart==="confirm"?{confirmed_at:new Date().toISOString()}:{status:"rented"});toast("تم");await ADM.reload()}catch(err){console.error(err);toast("تعذّر التنفيذ")}}
});
document.addEventListener("adm-data",render);
if(ADM.loaded)render();   // البيانات قد تصل قبل تحميل هذا الملف
})();
