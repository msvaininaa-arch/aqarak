// عقارك — أدوات مشتركة وطبقة البيانات (Supabase أو الوضع التجريبي)
(function(){
const CFG = window.AQARAK_CONFIG || {};
const DEMO = !(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
const BROKEN = !DEMO && !window.supabase;   // المفاتيح موجودة لكن مكتبة Supabase لم تُحمَّل (انقطاع إنترنت مثلًا)
const sb = (!DEMO && window.supabase) ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY) : null;
const need = ()=>{ if(!sb) throw new Error("تعذّر الاتصال بقاعدة البيانات"); };

// المدن: [الاسم، الدولة، خط الطول، خط العرض]
const CITIES = [
  ["نواكشوط","موريتانيا",-15.98,18.08],["نواذيبو","موريتانيا",-17.03,20.94],["روصو","موريتانيا",-15.81,16.51],
  ["كيهيدي","موريتانيا",-13.50,16.15],["بوكي","موريتانيا",-14.27,16.59],["ألاك","موريتانيا",-13.92,17.05],
  ["كيفة","موريتانيا",-11.40,16.62],["لعيون","موريتانيا",-9.60,16.66],["النعمة","موريتانيا",-7.26,16.62],
  ["سيلبابي","موريتانيا",-12.18,15.16],["تجكجة","موريتانيا",-11.43,18.56],["أطار","موريتانيا",-13.05,20.52],
  ["أكجوجت","موريتانيا",-14.38,19.75],["الزويرات","موريتانيا",-12.47,22.73],
  ["داكار","السنغال",-17.45,14.69],["الدار البيضاء","المغرب",-7.59,33.57],["دبي","الإمارات",55.27,25.20],
  ["أبيدجان","ساحل العاج",-4.01,5.32],["باماكو","مالي",-8.00,12.64],["باريس","فرنسا",2.35,48.86],["مدريد","إسبانيا",-3.70,40.42]
];
const FOCUS_AREAS = Array.isArray(CFG.FOCUS_AREAS)?CFG.FOCUS_AREAS:[];
const NKC_AREAS = FOCUS_AREAS.concat(["تفرغ زينة","لكصر","تيارت","السبخة","الميناء","عرفات","دار النعيم","توجنين","الرياض"].filter(a=>!FOCUS_AREAS.includes(a)));
const RESIDENCES = ["موريتانيا","الإمارات","السعودية","قطر","السنغال","المغرب","مالي","ساحل العاج","فرنسا","إسبانيا","الولايات المتحدة","بلد آخر"];
const CUR_BY_RES = {"الإمارات":"AED","السنغال":"XOF","مالي":"XOF","ساحل العاج":"XOF","المغرب":"MAD","فرنسا":"EUR","إسبانيا":"EUR","الولايات المتحدة":"USD"};
const CUR_LABEL = {MRU:"أوقية",USD:"دولار",EUR:"يورو",AED:"درهم إماراتي",XOF:"فرنك إفريقي",MAD:"درهم مغربي"};
const KIND_LABEL = {rent:"للإيجار",daily:"إيجار يومي",land:"أرض للبيع",home_sale:"للبيع"};
const UNIT = {rent:"/ شهر",daily:"/ ليلة",land:"",home_sale:""};
const PTYPES = ["شقة","دار","غرفة","محل","مكتب","مستودع"];

const cityInfo = n => CITIES.find(c=>c[0]===n);
const countryOf = n => (cityInfo(n)||[])[1] || "موريتانيا";

// أيقونات
const ICP={all:"M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",apt:"M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M8 8h3M8 12h3M8 16h3M3 21h18",house:"M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5",room:"M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01",shop:"M4 9h16l-1.5-4h-13zM5 9v11h14V9M9 20v-6h6v6",office:"M4 8h16v11H4zM9 8V5h6v3M4 13h16",store:"M3 10 12 4l9 6v10H3zM7 20v-6h10v6",land:"M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14",home:"M3 11 12 4l9 7M5 10v10h14V10",pin:"M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11zM12 11.5a1.5 1.5 0 1 0 0-.01",list:"M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",chat:"M4 5h16v11H9l-5 4z",plus:"M12 5v14M5 12h14",mic:"M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.2-4.2",users:"M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1.5a4 4 0 0 0-3-3.8M15.5 4.2a3.5 3.5 0 0 1 0 6.6"};
const ic=(k,s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICP[k]||ICP.apt}"/></svg>`;
const typeKey=i=>i.kind==="land"?"land":({"دار":"house","غرفة":"room","محل":"shop","مكتب":"office","مستودع":"store"}[i.ptype]||"apt");
const GRAD={apt:["#2E2AD6","#5B3BF0"],house:["#0F7A6B","#22A38C"],room:["#6A2BC9","#9A4FE0"],shop:["#D9700A","#F2A33A"],office:["#2F3B57","#51617F"],store:["#5B4A3A","#8C7258"],land:["#8A6A2E","#C49A4F"]};
// لا نقبل إلا روابط صور آمنة (https بلا علامات قد تكسر الصفحة)
const safeUrl=u=>typeof u==="string"&&(/^https:\/\/[^\s'"()<>\\]+$/.test(u)||/^blob:[^\s'"()<>]+$/.test(u))?u:"";
const photosOf=i=>(Array.isArray(i.photos)?i.photos:[]).map(safeUrl).filter(Boolean);
const thumbBg=i=>photosOf(i).length?`url("${photosOf(i)[0]}") center/cover, #444`:window.AQ_ART?`url("${window.AQ_ART(typeKey(i),i.id)}") center/cover`:`linear-gradient(135deg,${GRAD[typeKey(i)][0]},${GRAD[typeKey(i)][1]})`;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ---------- عادات السوق الموريتاني ---------- */
// الناس يحسبون بالأوقية القديمة (×10): 30,000 جديدة = «ثلاث مائة ألف»
const oldTxt=v=>{const o=Math.round(Number(v)||0)*10;if(!o)return "";
  const tr=n=>String(Math.round(n*100)/100);
  const m=o/1e6,k=o/1000;return o>=1e6?(m===2?"مليونان":tr(m)+(m>=3&&m<=10&&m%1===0?" ملايين":" مليون")):(k>=3&&k<=10&&k%1===0?tr(k)+" آلاف":tr(k)+" ألف")};
const N=s=>String(s||"").toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[ًٌٍَُِّْ]/g,"");
// أسماء يتداولها الناس بالحسانية أو الفرنسية
const ALIAS={"تفرغ":"تفرغ زينة","تفرق زينه":"تفرغ زينة","tevragh":"تفرغ زينة","الكصر":"لكصر","ksar":"لكصر","sebkha":"السبخة","سبخه":"السبخة","el mina":"الميناء","arafat":"عرفات","dar naim":"دار النعيم","toujounine":"توجنين","teyarett":"تيارت","riyadh":"الرياض",
 "حوش":"دار","كبه":"دار","فيلا":"دار","villa":"دار","maison":"دار","appartement":"شقة","apt":"شقة","studio":"غرفة","ملحق":"غرفة","chambre":"غرفة","بوتيك":"محل","boutique":"محل","bureau":"مكتب","مخزن":"مستودع","magasin":"مستودع","terrain":"أرض","قطعه":"أرض","كودرون":"كدرون","كدرون":"كدرون","goudron":"كدرون","معبد":"كدرون","مسفلت":"كدرون","كرن":"كرن","corner":"كرن","angle":"كرن","زاويه":"كرن","ركن":"كرن"};
function qMatch(text,q){const T=N(text);return N(q).split(/\s+/).filter(Boolean).every(w=>T.includes(w)||(ALIAS[w]&&T.includes(N(ALIAS[w]))))}
const HOME_FEATS=["ماء","خزان ماء","عداد كهرباء","حوش","مدخل مستقل","موقف سيارة","مكيّفات","سطح","قرب مسجد","قرب مدرسة","على الكدرون (طريق معبّد)"];
const LAND_FEATS=["كرن (زاوية)","على الكدرون (طريق معبّد)","مقسّمة رسميًا","ماء وكهرباء قريبة","جاهزة للبناء"];
const NEGO="السعر قابل للتفاوض";
const ADV_TXT=n=>n?(n===1?"مقدم شهر واحد":n===2?"مقدم شهرين":n===12?"مقدم سنة":`مقدم ${n} أشهر`):"";
const fmt=n=>Math.round(Number(n)||0).toLocaleString("en-US");
const esc=s=>{const d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML};
const opts=(arr,all)=>(all?`<option value="">${all}</option>`:"")+arr.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join("");
function toast(t){let e=$("#toast");if(!e){e=document.createElement("div");e.id="toast";e.className="toast";document.body.appendChild(e)}e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3200)}
// يقبل الرقم بأي صيغة: 36000000 أو 0022236000000 أو +222 36 00 00 00 — الرقم الموريتاني (8 أرقام) يُضاف له 222
const cleanPhone=p=>{let d=String(p||"").replace(/[^\d]/g,"").replace(/^00/,"");if(d.length===8&&/^[234]/.test(d))d="222"+d;return d};
const waLink=(phone,text)=>`https://wa.me/${cleanPhone(phone)}${text?"?text="+encodeURIComponent(text):""}`;

// ---------- بيانات الوضع التجريبي (أمثلة توضيحية فقط) ----------
const SAMPLE = [
 {kind:"rent",ptype:"شقة",city:"نواكشوط",area:"تفرغ زينة",title:"شقة 3 غرف وصالون، طابق أول",price:35000,rooms:3,solar:true,featured:true,advance_months:2,features:["ماء","عداد كهرباء","موقف سيارة"]},
 {kind:"rent",ptype:"شقة",city:"نواكشوط",area:"لكصر",title:"شقة غرفتين قرب السوق",price:18000,rooms:2,advance_months:1,features:["ماء","قرب مسجد"]},
 {kind:"rent",ptype:"غرفة",city:"نواكشوط",area:"السبخة",title:"استوديو بمدخل خاص",price:9000,rooms:1},
 {kind:"rent",ptype:"دار",city:"نواكشوط",area:"تفرغ زينة",title:"دار 5 غرف بفناء وموقف",price:60000,rooms:5,advance_months:3,features:["حوش","موقف سيارة","السعر قابل للتفاوض"]},
 {kind:"rent",ptype:"محل",city:"نواكشوط",area:"لكصر",title:"محل تجاري على شارع رئيسي",price:25000,rooms:1},
 {kind:"rent",ptype:"مكتب",city:"نواكشوط",area:"تفرغ زينة",title:"مكتب مجهز في عمارة",price:30000,rooms:2,furnished:true,solar:true},
 {kind:"daily",ptype:"شقة",city:"نواكشوط",area:"تفرغ زينة",title:"شقة مفروشة غرفتين، واي فاي",price:2500,rooms:2,furnished:true,solar:true},
 {kind:"daily",ptype:"شقة",city:"نواذيبو",area:"",title:"شقة مفروشة قرب الميناء",price:1800,rooms:1,furnished:true},
 {kind:"rent",ptype:"شقة",city:"نواذيبو",area:"",title:"شقة 3 غرف",price:20000,rooms:3},
 {kind:"rent",ptype:"دار",city:"روصو",area:"",title:"دار 4 غرف بفناء",price:12000,rooms:4},
 {kind:"land",ptype:"أرض",city:"نواكشوط",area:"توجنين",title:"قطعة أرضية 20×15 على شارع",price:1200000,size_m2:300,title_doc:"سند عقاري",features:["كرن (زاوية)","على الكدرون (طريق معبّد)","السعر قابل للتفاوض"]},
 {kind:"rent",ptype:"شقة",city:"نواكشوط",area:"تيارت",title:"شقة غرفتين وصالون، طابق ثانٍ",price:15000,rooms:2,advance_months:1,features:["ماء","عداد كهرباء"]},
 {kind:"rent",ptype:"دار",city:"نواكشوط",area:"تيارت",title:"دار 3 غرف بحوش",price:22000,rooms:3,advance_months:2,features:["حوش","خزان ماء"]},
 {kind:"land",ptype:"أرض",city:"نواكشوط",area:"تيارت",title:"قطعة 240 م² على الكدرون",price:1100000,size_m2:240,title_doc:"سند عقاري",features:["على الكدرون (طريق معبّد)"]},
 {kind:"rent",ptype:"محل",city:"نواكشوط",area:"تيارت",title:"محل على الشارع قرب السوق",price:12000,rooms:1},
 {kind:"home_sale",ptype:"دار",city:"نواكشوط",area:"عرفات",title:"دار 4 غرف بحوش، طابق أرضي",price:2500000,rooms:4,size_m2:240,title_doc:"سند عقاري",features:["حوش","ماء","عداد كهرباء","السعر قابل للتفاوض"]},
 {kind:"home_sale",ptype:"شقة",city:"نواكشوط",area:"تفرغ زينة",title:"شقة 3 غرف في عمارة حديثة",price:3800000,rooms:3,size_m2:130,features:["موقف سيارة","مكيّفات"]},
 {kind:"land",ptype:"أرض",city:"نواكشوط",area:"دار النعيم",title:"قطعة 300 م² كرن على الكدرون",price:900000,size_m2:300,title_doc:"ترخيص",features:["كرن (زاوية)","على الكدرون (طريق معبّد)"]},
 {kind:"land",ptype:"أرض",city:"أطار",area:"",title:"قطعة 500 م² قرب النخيل",price:600000,size_m2:500,title_doc:"ترخيص"},
 {kind:"rent",ptype:"شقة",city:"داكار",area:"",title:"شقة غرفتين، حي المرسى",price:29700,rooms:2},
 {kind:"rent",ptype:"غرفة",city:"دبي",area:"",title:"غرفة في سكن مشترك للموظفين",price:21600,rooms:1,furnished:true}
].map((x,k)=>Object.assign({id:101+k,created_at:new Date().toISOString(),country:countryOf(x.city),photos:[],contact_whatsapp:"",status:"approved",furnished:false,solar:false,featured:false,description:"",features:[],advance_months:null},x));
// ضغط الصورة قبل الرفع: أقصى ضلع 1600 بكسل، JPEG — يوفّر الإنترنت ويقبل صور الهواتف الكبيرة
async function compress(file){
  try{
    if(!/^image\//.test(file.type))return file;
    const bmp=await createImageBitmap(file);const k=Math.min(1,1600/Math.max(bmp.width,bmp.height));
    const c=document.createElement("canvas");c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);
    c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
    const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",0.82));
    return blob&&blob.size<file.size?blob:file;
  }catch(_){return file}
}
const SAMPLE_REQ=[
 {kind:"rent",ptype:"شقة",duration:"شهري",city:"نواكشوط",area:"تفرغ زينة",rooms:3,budget:30000,residence:"موريتانيا",notes:"عائلة، طابق أرضي أو أول"},
 {kind:"rent",ptype:"شقة",duration:"سنوي",city:"نواكشوط",area:"لكصر",rooms:2,budget:20000,residence:"الإمارات",notes:"للأهل، يفضّل بلا انقطاع",solar:true,advance_max:1},
 {kind:"buy",ptype:"أرض",city:"نواكشوط",area:"توجنين",budget:1000000,residence:"فرنسا",notes:"قطعة 300 م² بسند عقاري"},
 {kind:"buy",ptype:"دار",city:"نواكشوط",area:"تفرغ زينة",rooms:4,budget:6000000,residence:"الإمارات",notes:"دار للعائلة بسند عقاري"},
 {kind:"daily",ptype:"شقة",duration:"يومي",city:"نواذيبو",rooms:1,budget:2000,residence:"موريتانيا",furnished:true},
 {kind:"rent",ptype:"محل",duration:"شهري",city:"نواكشوط",area:"عرفات",budget:15000,residence:"موريتانيا",notes:"محل على شارع للبقالة"}
].map((x,k)=>Object.assign({id:501+k,created_at:new Date(Date.now()-k*7200e3).toISOString(),country:countryOf(x.city),status:"open",whatsapp:"",owner_token:"demo-"+k,furnished:false,solar:false},x));
const SAMPLE_BROKERS=[
 {id:901,name:"سيدي محمد",whatsapp:"22236112233",cities:["نواكشوط"],areas:"تفرغ زينة، لكصر",about:"شقق ودور للإيجار والبيع",deals:12,verified:true,id_checked:true,phone_checked:true,met:true,verified_at:new Date(Date.now()-120*864e5).toISOString()},
 {id:902,name:"أحمد سالم",whatsapp:"22246223344",cities:["نواكشوط"],areas:"تيارت",about:"أراضٍ وبيوت في تيارت",deals:5,verified:true,id_checked:true,phone_checked:true,met:true,verified_at:new Date(Date.now()-40*864e5).toISOString()},
 {id:903,name:"مريم",whatsapp:"22222334455",cities:["نواكشوط"],areas:"لكصر",about:"",deals:0,verified:false,id_checked:true,phone_checked:false,met:false,verified_at:null}
].map(b=>Object.assign({created_at:new Date(Date.now()-200*864e5).toISOString(),rating:0},b));
// عرضان في الأمثلة يعرضهما سمسار موثّق
SAMPLE[0].contact_whatsapp="22236112233";SAMPLE.find(x=>x.area==="تيارت").contact_whatsapp="22246223344";
const DEMO_DB={listings:SAMPLE.slice(),requests:SAMPLE_REQ.slice().reverse(),brokers:SAMPLE_BROKERS.slice(),offers:[]};
// رابط الدعوة: ?ref=رمز يُحفظ 30 يومًا ويُرفق بالطلبات والإعلانات والعروض
(function(){try{const r=new URLSearchParams(location.search).get("ref");if(r&&/^[a-z0-9_-]{2,30}$/i.test(r))localStorage.setItem("aq-ref",JSON.stringify({r,at:Date.now()}))}catch(_){}})();
const refOf=()=>{try{const o=JSON.parse(localStorage.getItem("aq-ref")||"null");return o&&Date.now()-o.at<30*864e5?o.r:null}catch(_){return null}};
const myRef=()=>{try{return localStorage.getItem("aq-myref")}catch(_){return null}};
const withRef=o=>{const r=refOf();return r&&r!==myRef()?Object.assign(o,{ref:r}):o};
const uuid=()=>(window.crypto&&crypto.randomUUID)?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==="x"?r:(r&3|8)).toString(16)});
let demoId=1000;

// ---------- واجهة البيانات ----------
const API = {
  demo: DEMO,
  async listings(){
    if(DEMO) return DEMO_DB.listings.filter(l=>l.status==="approved");
    need();
    const {data,error}=await sb.from("listings").select("*").eq("status","approved").order("featured",{ascending:false}).order("created_at",{ascending:false}).limit(500);
    if(error) throw error; return data;
  },
  async publicRequests(){
    if(DEMO) return DEMO_DB.requests.filter(r=>r.status==="open").map(({whatsapp,name,owner_token,...r})=>Object.assign(r,{offers_count:DEMO_DB.offers.filter(o=>o.request_id===r.id).length})).reverse();
    need();
    const {data,error}=await sb.from("requests_public").select("*").order("created_at",{ascending:false}).limit(200);
    if(error) throw error; return data;
  },
  async addListing(obj){
    obj=withRef(Object.assign({},obj,{status:"pending",featured:false}));
    if(DEMO){obj.id=++demoId;obj.created_at=new Date().toISOString();DEMO_DB.listings.push(obj);return obj}
    need();
    const {error}=await sb.from("listings").insert(obj); if(error) throw error; return obj;
  },
  async addRequest(obj){
    obj=withRef(Object.assign({},obj,{status:"open",owner_token:uuid()}));
    if(DEMO){obj.id=++demoId;obj.created_at=new Date().toISOString();DEMO_DB.requests.push(obj);return obj}
    need();
    const {error}=await sb.from("requests").insert(obj); if(error) throw error; return obj;
  },
  async addOffer(obj){
    obj=withRef(Object.assign({},obj,{status:"new"}));
    if(DEMO){obj.id=++demoId;obj.created_at=new Date().toISOString();DEMO_DB.offers.push(obj);return obj}
    need();const {error}=await sb.from("offers").insert(obj); if(error) throw error; return obj;
  },
  async myRequest(token){
    if(DEMO){const r=DEMO_DB.requests.find(x=>x.owner_token===token);return r?[r]:[]}
    need();const {data,error}=await sb.rpc("my_request",{p_token:token}); if(error) throw error; return data||[];
  },
  async myOffers(token){
    if(DEMO){const r=DEMO_DB.requests.find(x=>x.owner_token===token);return r?DEMO_DB.offers.filter(o=>o.request_id===r.id).slice().reverse().map(o=>Object.assign({},o,{verified_broker:DEMO_DB.brokers.some(b=>b.verified&&b.whatsapp===cleanPhone(o.whatsapp))})):[]}
    need();const {data,error}=await sb.rpc("my_offers",{p_token:token}); if(error) throw error; return data||[];
  },
  async addView(id){
    if(DEMO){const l=DEMO_DB.listings.find(x=>x.id==id);if(l)l.views=(l.views||0)+1;return}
    if(sb) sb.rpc("add_view",{p_id:Number(id)}).then(()=>{},()=>{});
  },
  async verifiedBrokers(){
    if(DEMO) return DEMO_DB.brokers.filter(b=>b.verified).map(({id_checked,phone_checked,met,rating,...b})=>b);
    need();const {data,error}=await sb.from("brokers_public").select("*").order("verified_at",{ascending:true}).limit(300);
    if(error) throw error; return data||[];
  },
  async addBroker(obj){
    obj=Object.assign({},obj,{verified:false,rating:0,deals:0,id_checked:false,phone_checked:false,met:false});
    if(DEMO){obj.id=++demoId;DEMO_DB.brokers.push(obj);return obj}
    need();
    const {error}=await sb.from("brokers").insert(obj); if(error) throw error; return obj;
  },
  async uploadPhoto(file){
    const img=await compress(file);
    if(img.size>5*1024*1024) throw new Error("الصورة كبيرة جدًا");
    if(DEMO) return URL.createObjectURL(img);
    need();
    const ext=img.type==="image/png"?"png":img.type==="image/webp"?"webp":"jpg";
    const path=`listings/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const {error}=await sb.storage.from("photos").upload(path,img,{contentType:img.type||"image/jpeg",upsert:false});
    if(error) throw error;
    return sb.storage.from("photos").getPublicUrl(path).data.publicUrl;
  },
  // ---- للمدير ----
  async signIn(email,password){need();const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error},
  async signOut(){await sb.auth.signOut()},
  async session(){if(DEMO)return {demo:true};need();const {data}=await sb.auth.getSession();return data.session},
  async all(table){
    if(DEMO) return DEMO_DB[table].slice().reverse();
    const {data,error}=await sb.from(table).select("*").order("created_at",{ascending:false}).limit(1000);
    if(error) throw error; return data;
  },
  async insert(table,obj){   // للمدير فقط (السياسات تمنع غيره من النشر المباشر)
    if(DEMO){obj=Object.assign({id:++demoId,created_at:new Date().toISOString(),photos:[],features:[]},obj);DEMO_DB[table].push(obj);return obj}
    const {error}=await sb.from(table).insert(obj); if(error) throw error; return obj;
  },
  async update(table,id,patch){
    if(DEMO){Object.assign(DEMO_DB[table].find(x=>x.id===id)||{},patch);return}
    const {error}=await sb.from(table).update(patch).eq("id",id); if(error) throw error;
  },
  async remove(table,id){
    if(DEMO){DEMO_DB[table]=DEMO_DB[table].filter(x=>x.id!==id);return}
    const {error}=await sb.from(table).delete().eq("id",id); if(error) throw error;
  }
};

window.AQ={FOCUS_AREAS,refOf,myRef,oldTxt,N,ALIAS,qMatch,HOME_FEATS,LAND_FEATS,NEGO,ADV_TXT,CFG,DEMO,BROKEN,API,photosOf,safeUrl,CITIES,NKC_AREAS,RESIDENCES,CUR_BY_RES,CUR_LABEL,KIND_LABEL,UNIT,PTYPES,cityInfo,countryOf,ic,typeKey,thumbBg,$,$$,fmt,esc,opts,toast,cleanPhone,waLink};
})();
