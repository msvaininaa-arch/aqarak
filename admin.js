// عقارك — لوحة الإدارة
(function(){
const {DEMO,API,KIND_LABEL,UNIT,$,$$,fmt,esc,toast,waLink,photosOf,CFG,CITIES,NKC_AREAS,countryOf,cleanPhone,oldTxt}=window.AQ;
let LOADED=false,TAB="today",DATA={listings:[],requests:[],brokers:[],offers:[]};
$("#demoBar").hidden=!DEMO;

async function boot(){
  try{window.AQ.applySettings(await API.settings())}catch(err){console.error(err)}
  const s=await API.session();
  $("#loginForm").hidden=!!s;$("#panel").hidden=!s;document.body.classList.toggle("signin",!s);$("#logout").hidden=!s||DEMO;
  if(s)await reload();
}
async function reload(){
  try{[DATA.listings,DATA.requests,DATA.brokers,DATA.offers]=await Promise.all([API.all("listings"),API.all("requests"),API.all("brokers"),API.all("offers")])}
  catch(err){console.error(err);toast("تعذّر التحميل. تأكد أن حسابك مضاف إلى جدول admins.");return}
  const pend=DATA.listings.filter(l=>l.status==="pending").length;
  $("#stats").innerHTML=[["تنتظر المراجعة",pend],["إعلانات منشورة",DATA.listings.filter(l=>l.status==="approved").length],["طلبات تنتظر/مفتوحة",DATA.requests.filter(r=>r.status==="pending").length+" / "+DATA.requests.filter(r=>r.status==="open").length],["عروض على الطلبات",DATA.offers.length]]
    .map(([l,n])=>`<div><b>${n}</b>${l}</div>`).join("");
  draw();LOADED=true;document.dispatchEvent(new Event("adm-data"));
}
const when=t=>t?new Date(t).toLocaleDateString("ar-EG-u-nu-latn",{day:"numeric",month:"short"}):"";
function draw(){
  $$("#admTabs .tab").forEach(t=>t.setAttribute("aria-selected",t.dataset.t===TAB));
  const T=$("#tbl");
  if(TAB==="today"||TAB==="bulk"||TAB==="settings")return;
  if(TAB==="pending"||TAB==="listings"){
    const rows=DATA.listings.filter(l=>TAB==="listings"||l.status==="pending");
    T.innerHTML=`<tr><th>#</th><th>العقار</th><th>السعر</th><th>المكان</th><th>التواصل</th><th>الحالة</th><th></th></tr>`+(rows.length?rows.map(l=>`<tr>
      <td>${l.id}<br><span class="alt">${when(l.created_at)}</span></td>
      <td><b>${esc(l.title)}</b><br><span class="alt">${KIND_LABEL[l.kind]||""} · ${esc(l.ptype||"")}${l.rooms?" · "+l.rooms+" غرف":""}${l.photos&&l.photos.length?" · "+l.photos.length+" صور":""}${l.views?" · "+l.views+" مشاهدة":""}${l.ref?" · عن طريق "+esc(l.ref):""}${l.title_doc?" · "+esc(l.title_doc):""}${l.advance_months?" · "+esc(window.AQ.ADV_TXT(l.advance_months)):""}${Array.isArray(l.features)&&l.features.length?"<br>"+l.features.map(esc).join(" · "):""}</span>${l.description?`<div class="alt" style="max-width:320px;white-space:pre-line">${esc(l.description).slice(0,220)}</div>`:""}<div>${photosOf(l).map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="" style="height:52px;width:72px;object-fit:cover;border-radius:6px;display:inline-block;margin:4px 0 0 4px"></a>`).join("")}</div></td>
      <td>${fmt(l.price)} ${UNIT[l.kind]||""}<br><span class="alt">بالقديمة: ${window.AQ.oldTxt(l.price)}</span></td>
      <td>${esc(l.city)}${l.area?"<br>"+esc(l.area):""}</td>
      <td>${esc(l.contact_name||"")}<br>${l.contact_whatsapp?`<a href="${waLink(l.contact_whatsapp)}" target="_blank" rel="noopener">${esc(l.contact_whatsapp)}</a>`:""}</td>
      <td><span class="st ${l.status}">${{pending:"ينتظر",approved:"منشور",rejected:"مرفوض",rented:"مؤجَّر/مباع"}[l.status]||l.status}</span>${l.featured?'<br><span class="st approved">مميّز</span>':""}</td>
      <td><div class="row">
        ${l.status!=="approved"?`<button class="btn small" data-a="approve" data-id="${l.id}">انشر</button>`:""}
        ${l.status==="pending"?`<button class="btn small ghost" data-a="reject" data-id="${l.id}">ارفض</button>`:""}
        ${l.status==="approved"&&window.AQ.FEAT("FRESHNESS")?`<button class="btn small ghost" data-a="confirm" data-id="${l.id}">✓ ما زال متوفرًا</button>`:""}${l.status==="approved"?`<button class="btn small ghost" data-a="feature" data-id="${l.id}">${l.featured?"ألغِ التمييز":"ميّز"}</button><button class="btn small ghost" data-a="rented" data-id="${l.id}">أُجّر/بيع</button>`:""}
        <button class="btn small danger" data-a="del" data-id="${l.id}">احذف</button></div></td></tr>`).join(""):`<tr><td colspan="7" class="alt">لا شيء هنا.</td></tr>`);
  }else if(TAB==="requests"){
    T.innerHTML=`<tr><th>#</th><th>الطلب</th><th>الميزانية</th><th>المقيم في</th><th>صاحب الطلب</th><th>الحالة</th><th></th></tr>`+(DATA.requests.length?DATA.requests.slice().sort((x,y)=>(y.status==="pending")-(x.status==="pending")).map(r=>`<tr>
      <td>${r.id}<br><span class="alt">${when(r.created_at)}</span></td>
      <td><b>${esc(r.ptype)} ${r.kind==="buy"?"للشراء":r.kind==="invest"?"استثمار":r.kind==="daily"?"إيجار يومي":"للإيجار"}</b> · ${esc(r.city)}${r.area?" · "+esc(r.area):""}<br><span class="alt">${r.rooms?r.rooms+" غرف · ":""}${esc(r.duration||"")}${r.furnished?" · مفروش":""}${r.solar?" · بلا انقطاع":""}${r.move_in?" · الدخول "+esc(r.move_in):""}${r.ref?" · عن طريق "+esc(r.ref):""}${r.advance_max?" · يدفع "+esc(window.AQ.ADV_TXT(r.advance_max))+" كحد أقصى":""}</span>${r.notes?`<div class="alt">${esc(r.notes)}</div>`:""}</td>
      <td>${r.budget?fmt(r.budget)+`<br><span class="alt">بالقديمة: ${window.AQ.oldTxt(r.budget)}</span>`:"—"}</td><td>${esc(r.residence)}</td>
      <td>${esc(r.name||"")}<br><a href="${waLink(r.whatsapp,"السلام عليكم، بخصوص طلبك رقم "+r.id+" على عقارك")}" target="_blank" rel="noopener">${esc(r.whatsapp)}</a></td>
      <td><span class="st ${r.status}">${{pending:"ينتظر",open:"مفتوح",matched:"وُجد عرض",closed:"مغلق"}[r.status]}</span></td>
      <td><div class="row">${r.status==="pending"?`<button class="btn small" data-a="ropen" data-id="${r.id}">انشر</button><button class="btn small ghost" data-a="close" data-id="${r.id}">ارفض</button>`:`<button class="btn small" data-a="match" data-id="${r.id}">وُجد عرض</button><button class="btn small ghost" data-a="close" data-id="${r.id}">أغلق</button>`}</div></td></tr>`).join(""):`<tr><td colspan="7" class="alt">لا طلبات بعد.</td></tr>`);
  }else if(TAB==="offers"){
    T.innerHTML=`<tr><th>#</th><th>على الطلب</th><th>العرض</th><th>السعر</th><th>صاحب العرض</th><th></th></tr>`+(DATA.offers.length?DATA.offers.map(o=>{const r=DATA.requests.find(x=>x.id===o.request_id);return `<tr>
      <td>${o.id}<br><span class="alt">${when(o.created_at)}</span></td>
      <td>#${o.request_id}${r?`<br><span class="alt">${esc(r.ptype)} · ${esc(r.city)}${r.area?" · "+esc(r.area):""}</span>`:""}</td>
      <td>${esc(o.message)}${o.listing_id?`<br><span class="alt">عقار رقم ${o.listing_id}</span>`:""}</td>
      <td>${o.price?fmt(o.price):"—"}</td>
      <td>${esc(o.name||"")}<br><a href="${waLink(o.whatsapp)}" target="_blank" rel="noopener">${esc(o.whatsapp)}</a></td>
      <td>${o.status==="hidden"?'<span class="st">مخفي</span>':`<button class="btn small ghost" data-a="ohide" data-id="${o.id}">أخفِ</button>`}</td></tr>`}).join(""):`<tr><td colspan="6" class="alt">لا عروض بعد.</td></tr>`);
  }else{
    T.innerHTML=`<tr><th>#</th><th>السمسار</th><th>المدن</th><th>واتساب</th><th>الحالة</th><th></th></tr>`+(DATA.brokers.length?DATA.brokers.map(b=>`<tr>
      <td>${b.id}</td><td><b>${esc(b.name)}</b>${b.areas?`<br><span class="alt">${esc(b.areas)}</span>`:""}</td><td>${esc((b.cities||[]).join("، "))}</td>
      <td><a href="${waLink(b.whatsapp)}" target="_blank" rel="noopener">${esc(b.whatsapp)}</a></td>
      <td><span class="st ${b.verified?"approved":"pending"}">${b.verified?"موثّق":"ينتظر"}</span>${b.verified_at?`<br><span class="alt">${when(b.verified_at)}</span>`:""}
        <div class="checks" style="margin-top:6px;font-size:13px">${[["id_checked","البطاقة"],["phone_checked","الرقم"],["met","المقابلة"]].map(([k,l])=>`<label><input type="checkbox" data-chk="${k}" data-id="${b.id}" ${b[k]?"checked":""} ${b.verified?"disabled":""}> ${l}</label>`).join("")}</div></td>
      <td><div class="row">${b.verified?`<button class="btn small danger" data-a="unverify" data-id="${b.id}">اسحب الشارة</button>`:`<button class="btn small" data-a="verify" data-id="${b.id}" ${b.id_checked&&b.phone_checked&&b.met?"":"disabled title=\"أكمل التحققات الثلاثة أولًا\""}>وثّقه</button>`}${window.AQ.FEAT("SUBSCRIPTIONS")&&b.verified?`<button class="btn small ghost" data-a="plan" data-id="${b.id}">${b.plan==="pro"&&(!b.plan_until||new Date(b.plan_until)>new Date())?"⭐ مشترك حتى "+when(b.plan_until)+" · ألغِ":"⭐ اشتراك 30 يومًا"}</button>`:""}<button class="btn small danger" data-a="bdel" data-id="${b.id}">احذف</button></div></td></tr>`).join(""):`<tr><td colspan="6" class="alt">لا سماسرة بعد.</td></tr>`);
  }
}
function show(t){TAB=t;$$("#admTabs .tab").forEach(x=>x.setAttribute("aria-selected",x.dataset.t===t));
  $("#bulk").hidden=t!=="bulk";$("#today").hidden=t!=="today";$("#settingsBox").hidden=t!=="settings";$("#tblWrap").hidden=["bulk","today","settings"].includes(t);
  if(t==="settings")drawSettings();else if(t!=="bulk"&&t!=="today")draw()}
/* ---------- الإعدادات: تشغيل الميزات دون إعادة رفع الموقع ---------- */
const FEATS=[["COMMISSION","عمولة السمسار المعلنة","يكتب السمسار عمولته على كل إعلان وعرض، فلا مفاجأة بعد الاتفاق."],
 ["RATINGS","تقييم السماسرة","صاحب الطلب وحده يقيّم من قدّم له عرضًا (نجوم)، ويظهر المتوسط في «سماسرة موثوقون»."],
 ["FRESHNESS","تأكيد توفر الإعلان","«تأكّد قبل X يوم» على كل إعلان، ويختفي ما لم يُؤكَّد خلال 30 يومًا. أكّد من «اليوم» أو «كل الإعلانات»."],
 ["SUBSCRIPTIONS","اشتراك السماسرة","صفحة الباقات، وشارة «مشترك» وأولوية، وحدّ يومي لعروض المجاني يطبقه الخادم."],
 ["PRICE_INDEX","مؤشر الإيجار","متوسط الإيجار في كل حي من العروض المنشورة."]];
const SVCS=[["doc","فحص وثيقة الأرض"],["escrow","أمانة العربون"],["notary","توثيق العقد"],["expat","حزمة المغترب"],["manage","إدارة عقار المغترب"],["power","ماء وكهرباء بلا انقطاع"]];
function drawSettings(){const F=CFG.FEATURES||{},S=CFG.SERVICES||[],P=CFG.PLANS||{},FA=window.AQ.FOCUS_AREAS;
  $("#settingsBox").innerHTML=`<h3 style="margin:0 0 4px">⚙️ الإعدادات</h3><p class="alt" style="margin:0 0 12px">تُحفظ في قاعدة البيانات وتظهر للزوار فورًا، دون إعادة رفع الموقع.</p>
  <h4>الميزات</h4><div class="setlist">${FEATS.map(([k,l,d])=>`<label class="setrow"><input type="checkbox" name="f_${k}" ${F[k]?"checked":""}><span><b>${l}</b><small>${d}</small></span></label>`).join("")}</div>
  <h4>باقة المشترك</h4><div class="fg"><label>سعر الاشتراك (يظهر للسماسرة)<input name="pro_price" maxlength="40" value="${esc(P.pro_price||"")}" placeholder="مثال: 1,000 أوقية في الشهر"></label><label>عروض المجاني في اليوم<input name="free_offers_per_day" type="number" min="1" max="100" value="${Number(P.free_offers_per_day)||5}"></label></div>
  <h4>الخدمات الظاهرة</h4><div class="checks">${SVCS.map(([k,l])=>`<label><input type="checkbox" name="s_${k}" ${S.includes(k)?"checked":""}> ${l}</label>`).join("")}</div>
  <h4>أحياء البداية (أزرار سريعة)</h4><div class="checks">${NKC_AREAS.map(a=>`<label><input type="checkbox" name="a_${esc(a)}" ${FA.includes(a)?"checked":""}> ${esc(a)}</label>`).join("")}</div>
  <div class="row" style="margin-top:14px"><button class="btn" id="saveSettings" type="button">احفظ الإعدادات</button></div>`}
document.addEventListener("click",async e=>{if(!e.target.closest("#saveSettings"))return;const box=$("#settingsBox"),q=n=>box.querySelector(`[name="${n}"]`);
  const features=Object.fromEntries(FEATS.map(([k])=>[k,q("f_"+k).checked]));
  const services=SVCS.map(([k])=>k).filter(k=>q("s_"+k).checked);
  const focus_areas=NKC_AREAS.filter(a=>q("a_"+a).checked);
  const plans={pro_price:q("pro_price").value.trim(),free_offers_per_day:Math.max(1,Number(q("free_offers_per_day").value)||5)};
  try{for(const [k,v] of Object.entries({features,services,focus_areas,plans}))await API.saveSetting(k,v);
    window.AQ.applySettings({features,services,focus_areas,plans});toast("حُفظت الإعدادات");drawSettings();draw()}catch(err){console.error(err);toast("تعذّر الحفظ")}});
$("#admTabs").addEventListener("click",e=>{const t=e.target.closest("[data-t]");if(t)show(t.dataset.t)});
window.ADM={get loaded(){return LOADED},get data(){return DATA},reload:()=>reload(),show,when};
/* ---------- إضافة سريعة بالجملة ---------- */
const KMAP={"إيجار":"rent","ايجار":"rent","للإيجار":"rent","يومي":"daily","إيجار يومي":"daily","أرض":"land","ارض":"land","قطعة":"land","بيع":"home_sale","للبيع":"home_sale","بيت للبيع":"home_sale"};
const CITY=CFG.FOCUS_CITY||"نواكشوط";let BULK=[];
function parseLine(line){
  // كل علامة أو جدولة = خانة، حتى لو كانت الخانة فارغة
  const c=line.split(/ *\| *|\t/).map(x=>x.trim());if(c.length<4)return {err:"أقل من 4 خانات"};
  const kind=KMAP[c[0]];if(!kind)return {err:"النوع غير معروف: "+c[0]};
  let ptype=kind==="land"?"أرض":(c[1]||"شقة");
  let area=c[2]||"",city=CITY;if(CITIES.some(x=>x[0]===area)){city=area;area=""}else if(area&&!NKC_AREAS.includes(area))return {err:"الحي غير معروف: "+area};
  let pr=c[3]||"",old=/قديم/.test(pr);let price=Number(pr.replace(/[^\d.]/g,""));if(!price)return {err:"السعر غير صحيح"};if(old)price=Math.round(price/10);
  const rooms=Number(c[4])||null,size=Number(c[7])||null;
  const wa=cleanPhone(c[6]||"")||cleanPhone(CFG.PLATFORM_WHATSAPP||"");if(wa.length<6)return {err:"لا يوجد رقم واتساب"};
  const unit={rent:"للإيجار",daily:"إيجار يومي",land:"للبيع",home_sale:"للبيع"}[kind];
  const title=c[5]||(kind==="land"?`قطعة أرضية${size?" "+size+" م²":""} ${unit} في ${area||city}`:`${ptype}${rooms?" "+rooms+" غرف":""} ${unit} في ${area||city}`);
  return {o:{kind,ptype,city,country:countryOf(city),area:city==="نواكشوط"?(area||null):null,title,price,rooms:kind==="land"?null:rooms,size_m2:size,contact_whatsapp:wa,status:"approved",featured:false,photos:[],features:[]}};
}
$("#bulkCheck").addEventListener("click",()=>{
  const lines=$("#bulkIn").value.split(/\n/).map(x=>x.trim()).filter(Boolean);BULK=lines.map(parseLine);
  const ok=BULK.filter(x=>x.o).length;
  $("#bulkTbl").innerHTML=`<tr><th>#</th><th>العقار</th><th>السعر</th><th>المكان</th><th>واتساب</th><th>الحالة</th></tr>`+BULK.map((x,k)=>x.o?`<tr><td>${k+1}</td><td>${esc(x.o.title)}</td><td>${fmt(x.o.price)}<br><span class="alt">بالقديمة: ${oldTxt(x.o.price)}</span></td><td>${esc(x.o.area||x.o.city)}</td><td>${esc(x.o.contact_whatsapp)}</td><td><span class="st approved">جاهز</span></td></tr>`
    :`<tr><td>${k+1}</td><td colspan="4" class="alt">${esc(lines[k])}</td><td><span class="st pending">${esc(x.err)}</span></td></tr>`).join("");
  $("#bulkGo").disabled=!ok;$("#bulkGo").textContent=`انشر ${ok} ${ok>=3&&ok<=10?"إعلانات":"إعلانًا"}`;
});
$("#bulkGo").addEventListener("click",async e=>{const b=e.currentTarget,todo=BULK.filter(x=>x.o);b.disabled=true;let n=0;
  for(const x of todo){try{await API.insert("listings",x.o);n++;b.textContent=`… ${n}/${todo.length}`}catch(err){console.error(err)}}
  toast(`نُشر ${n} من ${todo.length}`);$("#bulkIn").value="";$("#bulkTbl").innerHTML="";BULK=[];b.textContent="انشر";await reload()});
$("#tbl").addEventListener("click",async e=>{
  const b=e.target.closest("[data-a]");if(!b)return;const id=Number(b.dataset.id),a=b.dataset.a;
  const L=DATA.listings.find(x=>x.id===id),B=DATA.brokers.find(x=>x.id===id);
  try{
    if(a==="approve")await API.update("listings",id,{status:"approved"});
    if(a==="reject")await API.update("listings",id,{status:"rejected"});
    if(a==="feature")await API.update("listings",id,{featured:!L.featured});
    if(a==="rented")await API.update("listings",id,{status:"rented"});
    if(a==="del"){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="تأكيد الحذف";return}await API.remove("listings",id)}
    if(a==="ropen")await API.update("requests",id,{status:"open"});
    if(a==="match")await API.update("requests",id,{status:"matched"});
    if(a==="close")await API.update("requests",id,{status:"closed"});
    if(a==="ohide")await API.update("offers",id,{status:"hidden"});
    if(a==="verify"){if(!(B.id_checked&&B.phone_checked&&B.met)){toast("أكمل التحققات الثلاثة أولًا");return}await API.update("brokers",id,{verified:true,verified_at:new Date().toISOString()})}
    if(a==="unverify")await API.update("brokers",id,{verified:false});
    if(a==="plan"){const on=B.plan==="pro"&&(!B.plan_until||new Date(B.plan_until)>new Date());await API.update("brokers",id,on?{plan:"free",plan_until:null}:{plan:"pro",plan_until:new Date(Date.now()+30*864e5).toISOString()})}
    if(a==="confirm")await API.update("listings",id,{confirmed_at:new Date().toISOString()});
    if(a==="bdel"){if(b.dataset.sure!=="1"){b.dataset.sure="1";b.textContent="تأكيد الحذف";return}await API.remove("brokers",id)}
    toast("تم");await reload();
  }catch(err){console.error(err);toast("تعذّر التنفيذ")}
});
$("#tbl").addEventListener("change",async e=>{const c=e.target.closest("[data-chk]");if(!c)return;try{await API.update("brokers",Number(c.dataset.id),{[c.dataset.chk]:c.checked});await reload()}catch(err){console.error(err);toast("تعذّر التنفيذ")}});
$("#loginForm").addEventListener("submit",async e=>{e.preventDefault();try{await API.signIn(e.target.email.value,e.target.password.value);await boot()}catch(err){toast("البريد أو كلمة المرور غير صحيحة")}});
$("#logout").addEventListener("click",async()=>{await API.signOut();location.reload()});
boot();
})();
