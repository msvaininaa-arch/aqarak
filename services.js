// عقارك — الخدمات (مبنية على مشاكل قائمة في موريتانيا) + أدوات الانتشار
(function(){
const A=window.AQAPP,{CFG,$,$$,esc,fmt,toast,cleanPhone,waLink,ic}=window.AQ;if(!A)return;
const t=s=>A.t(s),PLATFORM=cleanPhone(CFG.PLATFORM_WHATSAPP),SITE=()=>(CFG.SITE_URL||location.origin+location.pathname).replace(/index\.html$/,"");

/* ---------- الخدمات: كل خدمة تحل مشكلة موثقة ---------- */
const SVC=[
 {id:"doc",ico:"land",t:"فحص وثيقة الأرض",s:"قبل أن تدفع",
  why:"في نواكشوط عشرات آلاف النزاعات العقارية: قطعة تُباع لأكثر من شخص، ومخططات متداخلة، ووثائق مزورة.",
  pts:["نتحقق أن القطعة في مخطط تجزئة معتمد ومؤرشف","نتأكد أنها موجودة فعلًا على الأرض بحدودها","نسأل المصالح العقارية عن صحة الوثيقة وأي نزاع قائم","تقرير مكتوب بما وجدناه (لا يضمن الملكية)"]},
 {id:"notary",ico:"office",t:"توثيق العقد",s:"بيع أو إيجار",
  why:"كثير من البيوع تمت بين أشخاص غير مخولين، أو بلا عقد واضح، فضاعت الحقوق.",
  pts:["نكتب عقد البيع أو الإيجار بلغة واضحة","نرتب موعد الموثّق ونرافقك","نراجع الوكالة إن كان البائع أو المؤجر غائبًا","نسخة من العقد تبقى عندك وعند الطرف الآخر"]},
 {id:"expat",ico:"pin",t:"حزمة المغترب",s:"سكن قبل وصولك",
  why:"المغترب لا يستطيع أن يرى العقار ولا أن يتفاوض ولا أن يدفع بسهولة من الخارج.",
  pts:["نبحث لك عن السكن حسب طلبك ونرسل صوره وفيديو من صاحبه","نتفاوض على السعر والمقدم نيابة عنك","تدفع من بلدك بعملتك عبر شركائنا في الصرافة","تجد المفتاح جاهزًا عند وصولك"]},
 {id:"manage",ico:"house",t:"إدارة عقار المغترب",s:"تأجير ومتابعة",
  why:"عقارات كثيرة لأهل الخارج تبقى فارغة أو يضيع إيجارها لغياب من يتابعها.",
  pts:["نؤجر عقارك لمستأجر موثوق بعقد مكتوب","نتابع الإيجار والصيانة","تقرير شهري بالصور على واتساب","نحوّل لك العائد بعملتك"]},
 {id:"power",ico:"store",t:"ماء وكهرباء بلا انقطاع",s:"شمسي وخزانات",
  why:"انقطاع الكهرباء متكرر، وإنتاج الماء في نواكشوط ثلث حاجة المدينة تقريبًا.",
  pts:["ألواح شمسية وبطاريات بأسعار المصدر","خزانات ماء ومضخات","العقار «بلا انقطاع» يؤجَّر أسرع وبسعر أعلى","نضع شارة «بلا انقطاع» على إعلانك بعد التركيب"]}
];
const ON=()=>Array.isArray(CFG.SERVICES)?SVC.filter(x=>CFG.SERVICES.includes(x.id)):SVC;
function renderSvc(){const g=$("#svcGrid");if(!g)return;const L=ON();
  $("#services .lead").hidden=L.length===1;g.classList.toggle("one",L.length===1);
  if(L.length===1){const x=L[0];g.innerHTML=`<div class="svcfeat"><i>${ic(x.ico,30)}</i><div><b>${esc(t(x.t))}</b><span>${esc(t(x.why))}</span></div><button class="btn or" type="button" data-svc="${x.id}">${t("اطلب الفحص")}</button></div>`;return}
  g.innerHTML=L.map(x=>`<button class="svct" type="button" data-svc="${x.id}"><i>${ic(x.ico,24)}</i><b>${esc(t(x.t))}</b><small>${esc(t(x.s))}</small></button>`).join("")}
function openSvc(id,pre){pre=pre||{};const x=SVC.find(s=>s.id===id);if(!x)return;
  const msg=`السلام عليكم، أطلب خدمة «${x.t}» من عقارك.`;
  $("#itemBody").innerHTML=`<button class="xclose" data-close aria-label="${t("إغلاق")}">×</button>
   <div class="svchead"><i>${ic(x.ico,28)}</i><div><h3 style="margin:0">${esc(t(x.t))}</h3><span class="alt">${esc(t(x.s))}</span></div></div>
   <p class="why"><b>${t("المشكلة")}:</b> ${esc(t(x.why))}</p>
   <ul class="svcpts">${x.pts.map(p=>`<li>${esc(t(p))}</li>`).join("")}</ul>
   ${x.id==="doc"?docForm(pre):`<div class="row">${PLATFORM?`<a class="btn wa" href="${waLink(PLATFORM,msg)}" target="_blank" rel="noopener">${t("اطلب على واتساب")}</a>`:`<span class="alt">${t("أضف رقم واتساب المنصة في config.js لتفعيل الطلب.")}</span>`}</div>`}`;
  const d=$("#dlgItem");if(!d.open)d.showModal();d.scrollTop=0}
document.addEventListener("click",e=>{const b=e.target.closest("[data-svc]");if(b){let pre={};try{pre=JSON.parse(b.dataset.pre||"{}")}catch(_){}openSvc(b.dataset.svc,pre)}});
/* نموذج فحص الوثيقة: يجمع البيانات ثم يفتح واتساب برسالة مرتبة؛ صورة الوثيقة تُرسل في المحادثة لا في الموقع */
function docForm(p){return `<form class="fg docform" id="docForm">
  <label>${t("نوع الوثيقة")}<select name="dtype"><option>${t("سند عقاري")}</option><option>${t("ترخيص")}</option><option>${t("غير ذلك / لا أعرف")}</option></select></label>
  <label>${t("المدينة والحي")}<input name="dplace" maxlength="80" value="${esc(p.place||"")}" placeholder="${t("مثال: نواكشوط، توجنين")}"></label>
  <label>${t("رقم القطعة أو الوثيقة (إن وجد)")}<input name="dnum" maxlength="40"></label>
  <label>${t("رقم العقار في الموقع (إن وجد)")}<input name="did" maxlength="12" inputmode="numeric" value="${esc(p.id||"")}"></label>
  <label class="full">${t("اسمك")}<input name="dname" maxlength="60"></label>
  <p class="full alt" style="margin:0">🔒 ${t("لا ترفع صورة الوثيقة هنا: أرسلها في محادثة واتساب التي ستُفتح، حفاظًا على خصوصيتك.")}</p>
  <div class="full row">${PLATFORM?`<button class="btn wa" type="submit">${t("أرسل الطلب على واتساب")}</button>`:`<span class="alt">${t("أضف رقم واتساب المنصة في config.js لتفعيل الطلب.")}</span>`}</div></form>`}
document.addEventListener("submit",e=>{if(e.target.id!=="docForm")return;e.preventDefault();const f=e.target;
  const lines=["السلام عليكم، أطلب خدمة «فحص وثيقة الأرض» من عقارك.","نوع الوثيقة: "+f.dtype.value,f.dplace.value.trim()&&("المكان: "+f.dplace.value.trim()),f.dnum.value.trim()&&("رقم القطعة/الوثيقة: "+f.dnum.value.trim()),f.did.value.trim()&&("رقم العقار في الموقع: "+f.did.value.trim()),f.dname.value.trim()&&("الاسم: "+f.dname.value.trim()),"سأرسل صورة الوثيقة هنا."].filter(Boolean);
  window.open(waLink(PLATFORM,lines.join("\n")),"_blank","noopener");toast(t("أرسل صورة الوثيقة في المحادثة"))});

/* ---------- معلومة الحي: الأحياء المنخفضة ---------- */
const LOW={"السبخة":1,"الميناء":1};
new MutationObserver(()=>{
  const share=$("#itemBody [data-share]");if(!share||$("#itemBody [data-poster]"))return;  // مرة واحدة لكل فتح
  const i=A.list.find(x=>String(x.id)===share.dataset.share);if(!i)return;
  if(i.city==="نواكشوط"&&LOW[i.area])share.closest(".row").insertAdjacentHTML("beforebegin",`<p class="areanote">ℹ️ ${t("أجزاء من هذا الحي منخفضة عند مستوى البحر أو دونه، فاسأل عن حال العقار في موسم الأمطار ومع ارتفاع المياه الجوفية.")}</p>`);
  if((i.kind==="land"||i.kind==="home_sale")&&ON().some(x=>x.id==="doc")){const pre=JSON.stringify({id:String(i.id),place:(i.area?i.area+"، ":"")+i.city});
    share.closest(".row").insertAdjacentHTML("beforebegin",`<button class="btn or docbtn" type="button" data-svc="doc" data-pre='${esc(pre)}'>🔎 ${t("افحص وثيقة هذا العقار قبل الشراء")}</button>`)}
  // لافتة للطباعة
  share.insertAdjacentHTML("afterend",`<button class="btn ghost small" data-poster="${i.id}">🪧 ${t("لافتة للطباعة")}</button>`);
}).observe($("#itemBody"),{childList:true});

/* ---------- لافتة QR تُلصق على باب العقار ---------- */
let QRLIB=null;
function loadQR(){if(window.qrcode)return Promise.resolve(window.qrcode);if(QRLIB)return QRLIB;
  QRLIB=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js";s.onload=()=>res(window.qrcode);s.onerror=rej;document.head.appendChild(s)});return QRLIB}
async function poster(id){
  const i=A.list.find(x=>String(x.id)===String(id));if(!i)return;
  const url=`${SITE()}#l-${i.id}`,sale=i.kind==="land"||i.kind==="home_sale";
  let qr="";try{const Q=await loadQR();const q=Q(0,"M");q.addData(url);q.make();qr=q.createSvgTag({cellSize:8,margin:2,scalable:true})}catch(_){qr=""}
  const w=window.open("","_blank");if(!w){toast(t("اسمح بالنوافذ المنبثقة لطباعة اللافتة"));return}
  const unit=i.kind==="rent"?" / شهر":i.kind==="daily"?" / ليلة":"";
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>عقارك — ${esc(i.title)}</title>
<style>@page{size:A4;margin:12mm}body{font-family:Tahoma,'Readex Pro',sans-serif;margin:0;text-align:center;color:#151532}
.big{font-size:96pt;font-weight:900;margin:0;color:${sale?"#B35300":"#2E2AD6"}}.t{font-size:26pt;font-weight:700;margin:8px 0}
.p{font-size:40pt;font-weight:900;margin:6px 0}.o{font-size:18pt;color:#555}.qr{width:62mm;height:62mm;margin:10px auto}.qr svg{width:100%;height:100%}
.f{margin-top:10px;font-size:16pt}.n{font-size:20pt;font-weight:700}.b{display:inline-block;margin-top:14px;background:#2E2AD6;color:#fff;padding:8px 22px;border-radius:99px;font-size:18pt;font-weight:700}</style></head>
<body><p class="big">${sale?"للبيع":"للإيجار"}</p><p class="t">${esc(i.title)}</p><p class="p">${fmt(i.price)} أوقية${unit}</p><p class="o">بالقديمة: ${window.AQ.oldTxt(i.price)}</p>
${qr?`<div class="qr">${qr}</div><p class="f">امسح الرمز بكاميرا هاتفك لترى الصور والتفاصيل وتتواصل</p>`:`<p class="f">${esc(url)}</p>`}
<p class="n">رقم العقار على عقارك: ${i.id}</p><span class="b">عقارك · أوجد منزلك</span></body></html>`);
  w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-poster]");if(b)poster(b.dataset.poster)});

/* ---------- زر «شارك الموقع» ---------- */
async function shareSite(){const text=t("اطلب عقارك أو اعرض عقارك مجانًا على عقارك");const url=SITE()+(window.AQ.myRef()?"?ref="+window.AQ.myRef():"");
  try{if(navigator.share){await navigator.share({title:t("عقارك"),text,url});return}}catch(err){if(err&&err.name==="AbortError")return}
  window.open(waLink("",text+"\n"+url).replace("wa.me/?","wa.me/?"),"_blank","noopener")}
document.addEventListener("click",e=>{if(e.target.closest("[data-sharesite]")){e.preventDefault();shareSite()}});

/* ---------- اقتراح التثبيت على الهاتف (للزائر العائد) ---------- */
let DEFER=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();DEFER=e;
  let v=0;try{v=+localStorage.getItem("aq-visits")||0;if(localStorage.getItem("aq-noinstall"))return}catch(_){}
  if(v>=2&&$("#installBar"))$("#installBar").hidden=false});
try{localStorage.setItem("aq-visits",String((+localStorage.getItem("aq-visits")||0)+1))}catch(_){}
document.addEventListener("click",async e=>{
  if(e.target.closest("#installYes")&&DEFER){DEFER.prompt();await DEFER.userChoice.catch(()=>{});DEFER=null;$("#installBar").hidden=true}
  if(e.target.closest("#installNo")){$("#installBar").hidden=true;try{localStorage.setItem("aq-noinstall","1")}catch(_){}}
});

/* ---------- سماسرة موثوقون ---------- */
const since=d=>{try{return new Date(d).toLocaleDateString(document.documentElement.lang==="fr"?"fr-FR":"ar-EG-u-nu-latn",{month:"long",year:"numeric"})}catch(_){return ""}};
function renderBrokers(){const box=$("#brokerList");if(!box)return;const L=A.brokers||[];
  if(!L.length){box.innerHTML=`<div class="empty">${t("نعتمد أول السماسرة قريبًا.")} <button class="btn small" data-open="dlgBroker">${t("سجّل كسمسار")}</button></div>`;return}
  box.innerHTML=L.map(b=>`<div class="brcard"><span class="av" aria-hidden="true">${esc((b.name||"؟").trim()[0])}</span>
    <div class="brinfo"><b>${esc(b.name)}</b><span class="badge vb">✓ ${t("موثّق منذ")} ${esc(since(b.verified_at))}</span>
    ${b.areas?`<span class="alt">${esc(b.areas)}</span>`:""}${b.about?`<span class="alt">${esc(b.about)}</span>`:""}${b.deals?`<span class="alt">${b.deals} ${t(b.deals>=3&&b.deals<=10?"صفقات عبر عقارك":"صفقة عبر عقارك")}</span>`:""}</div>
    <a class="btn small wa" target="_blank" rel="noopener" href="${waLink(b.whatsapp,"السلام عليكم، وجدتك في «سماسرة موثوقون» على عقارك.")}">${t("واتساب")}</a></div>`).join("")}
$("#reportBroker").addEventListener("click",e=>{e.preventDefault();if(!PLATFORM){toast(t("أضف رقم واتساب المنصة في config.js لتفعيل الطلب."));return}
  window.open(waLink(PLATFORM,"السلام عليكم، أريد الإبلاغ عن سمسار. الاسم أو الرقم: "),"_blank","noopener")});
document.addEventListener("aq-rendered",()=>{if(!renderBrokers.done&&(A.brokers||[]).length){renderBrokers.done=true;renderBrokers()}});
renderSvc();renderBrokers();document.addEventListener("aq-lang",()=>{renderSvc();renderBrokers()});
})();
