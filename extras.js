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
  b.insertAdjacentHTML("beforebegin",`<button class="btn ghost small" data-imgitem="${i.id}">🖼 ${t("إعلان جاهز للنشر")}</button><a class="btn ghost shareWa" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${t("شارك على واتساب")}</a>`);
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
/* ---------- ملصق إعلان مصمّم (على طريقة إعلانات واتساب المحلية) ---------- */
const FEAT_PT={
  "كرن (زاوية)":["📐","كرن (زاوية)","واجهتان وقيمة أعلى"],
  "على الكدرون (طريق معبّد)":["🛣️","على الكدرون","طريق معبّد أمامها"],
  "مقسّمة رسميًا":["🗺️","مقسّمة رسميًا","ضمن مخطط معتمد"],
  "ماء وكهرباء قريبة":["💧","ماء وكهرباء قريبة","توصيل سهل وسريع"],
  "جاهزة للبناء":["🏗️","جاهزة للبناء","ابدأ البناء فورًا"],
  "ماء":["💧","ماء متوفر","شبكة ماء"],
  "خزان ماء":["🛢️","خزان ماء","احتياط عند الانقطاع"],
  "عداد كهرباء":["⚡","عداد كهرباء","خاص بالمسكن"],
  "حوش":["🌴","حوش","مساحة خارجية"],
  "مدخل مستقل":["🚪","مدخل مستقل","خصوصية تامة"],
  "موقف سيارة":["🚗","موقف سيارة","داخل المبنى أو أمامه"],
  "مكيّفات":["❄️","مكيّفات","راحة في الحر"],
  "سطح":["🏠","سطح","مساحة إضافية"],
  "قرب مسجد":["🕌","قرب مسجد","على مسافة قريبة"],
  "قرب مدرسة":["🏫","قرب مدرسة","مناسب للعائلات"],
  "السعر قابل للتفاوض":["🤝","السعر قابل للتفاوض","تواصل واتفق"]
};
function rr(x,X,Y,w,h,r){x.beginPath();if(x.roundRect){x.roundRect(X,Y,w,h,r);return}x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function fitFont(x,txt,weight,size,fam,maxW){let s=size;do{x.font=`${weight} ${s}px ${fam}`;if(x.measureText(txt).width<=maxW)break;s-=4}while(s>26);return s}
/* قوالب التصميم: الأزرق الكلاسيكي، الصحراء، الذهبي الفاخر، هوية عقارك، والصورة */
const THEMES={
  classic:{name:"كلاسيكي",head:"#173B67",headTxt:"#fff",title:"#FF5A5F",size:"#F4C430",badge:"#F4C430",badgeTxt:"#C0262D",body:"#F7F3EA",why:"#C0262D",ic:"#173B67",icTxt:"#fff",ink:"#1D2333",muted:"#6B6F7B",box:"#fff",boxLine:"#C9CED8",price:"#C0262D",bar:"#173B67",barTxt:"#fff",phone:"#F4C430"},
  desert:{name:"صحراء",head:"#F3DDB3",headTxt:"#3B2A1A",title:"#3B2A1A",size:"#B7651F",badge:"#B7472A",badgeTxt:"#fff",body:"#FBF5EA",why:"#B7472A",ic:"#B7651F",icTxt:"#fff",ink:"#3B2A1A",muted:"#8A7561",box:"#fff",boxLine:"#E3CFAE",price:"#B7472A",bar:"#3B2A1A",barTxt:"#fff",phone:"#F2C14E"},
  gold:{name:"ذهبي فاخر",head:"#0F0F12",headTxt:"#F5EBD0",title:"#F5EBD0",size:"#D4AF37",badge:"#D4AF37",badgeTxt:"#0F0F12",body:"#16161B",why:"#D4AF37",ic:"#26262D",icTxt:"#D4AF37",ink:"#F5EBD0",muted:"#A69C84",box:"#1E1E24",boxLine:"#D4AF37",price:"#D4AF37",bar:"#D4AF37",barTxt:"#0F0F12",phone:"#0F0F12"},
  brand:{name:"عقارك",head:"#2E2AD6",headTxt:"#fff",title:"#fff",size:"#FFB547",badge:"#FF7A1A",badgeTxt:"#fff",body:"#FFFFFF",why:"#2E2AD6",ic:"#EEF0FF",icTxt:"#2E2AD6",ink:"#151532",muted:"#5D5F78",box:"#F5F6FF",boxLine:"#D9DBF5",price:"#2E2AD6",bar:"#FF7A1A",barTxt:"#fff",phone:"#fff"},
  photo:{name:"بالصورة",head:"#111",headTxt:"#fff",title:"#fff",size:"#F4C430",badge:"#F4C430",badgeTxt:"#111",body:"#FFFFFF",why:"#C0262D",ic:"#173B67",icTxt:"#fff",ink:"#1D2333",muted:"#6B6F7B",box:"#F7F3EA",boxLine:"#E5DCC8",price:"#C0262D",bar:"#25D366",barTxt:"#fff",phone:"#fff"}
};
function loadImg(src){return new Promise(r=>{if(!src)return r(null);const im=new Image();im.crossOrigin="anonymous";im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src;setTimeout(()=>r(null),6000)})}
let QRP=null;function qrLib(){if(window.qrcode)return Promise.resolve(window.qrcode);if(!QRP)QRP=new Promise(res=>{const sc=document.createElement("script");sc.src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js";sc.onload=()=>res(window.qrcode);sc.onerror=()=>res(null);document.head.appendChild(sc);setTimeout(()=>res(window.qrcode||null),5000)});return QRP}
async function drawQR(x,url,X,Y,size,fg,bg){const q=await qrLib();if(!q||!url)return false;try{const qr=q(0,"M");qr.addData(url);qr.make();const n=qr.getModuleCount(),pad=10,cell=(size-2*pad)/n;
  x.fillStyle=bg;rr(x,X,Y,size,size,14);x.fill();x.fillStyle=fg;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))x.fillRect(X+pad+c*cell,Y+pad+r*cell,Math.ceil(cell),Math.ceil(cell));return true}catch(_){return false}}
function paintHead(x,th,key,W,HH,fr){
  if(key==="desert"){const g=x.createLinearGradient(0,0,0,HH);g.addColorStop(0,"#FBEFD6");g.addColorStop(1,"#EFD3A2");x.fillStyle=g;x.fillRect(0,0,W,HH);
    x.fillStyle="rgba(255,240,200,.9)";x.beginPath();x.arc(fr?W-170:170,150,70,0,7);x.fill();
    const dune=(y0,amp,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,HH);x.lineTo(0,y0);x.bezierCurveTo(W*.25,y0-amp,W*.45,y0+amp*.6,W*.65,y0-amp*.3);x.bezierCurveTo(W*.8,y0-amp,W*.92,y0,W,y0-amp*.4);x.lineTo(W,HH);x.closePath();x.fill()};
    dune(HH-120,60,"rgba(226,182,120,.55)");dune(HH-60,45,"rgba(205,150,90,.55)");
    // نخلة صغيرة
    const px=fr?W-90:90,py=HH-70;x.strokeStyle="rgba(90,60,30,.55)";x.lineWidth=8;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+(fr?-10:10),py-80,px,py-150);x.stroke();
    x.fillStyle="rgba(90,60,30,.55)";for(let k=0;k<6;k++){x.save();x.translate(px,py-150);x.rotate(k*Math.PI/3);x.beginPath();x.ellipse(32,0,36,9,0,0,7);x.fill();x.restore()}
    return}
  if(key==="gold"){x.fillStyle=th.head;x.fillRect(0,0,W,HH);
    x.strokeStyle="rgba(212,175,55,.18)";x.lineWidth=1.5;for(let k=-HH;k<W;k+=46){x.beginPath();x.moveTo(k,0);x.lineTo(k+HH,HH);x.stroke()}
    const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,"rgba(212,175,55,0)");g.addColorStop(.5,"#D4AF37");g.addColorStop(1,"rgba(212,175,55,0)");x.fillStyle=g;x.fillRect(0,HH-4,W,4);return}
  if(key==="brand"){const g=x.createLinearGradient(0,0,W,HH);g.addColorStop(0,"#2E2AD6");g.addColorStop(1,"#5B2BE0");x.fillStyle=g;x.fillRect(0,0,W,HH);
    x.fillStyle="rgba(255,255,255,.08)";for(let i=0;i<14;i++)for(let j=0;j<5;j++){x.beginPath();x.arc(40+i*78,30+j*70,4,0,7);x.fill()}
    // السقف الأبيض يحتضن الجسم
    x.fillStyle="#fff";x.beginPath();x.moveTo(0,HH);x.lineTo(W/2,HH-70);x.lineTo(W,HH);x.closePath();x.fill();return}
  x.fillStyle=th.head;x.fillRect(0,0,W,HH);
  for(let i=0;i<5;i++){x.beginPath();x.arc(fr?W-120:120,HH-40,120+i*70,0,7);x.lineWidth=2;x.strokeStyle="rgba(255,255,255,.06)";x.stroke()}
}
// لقطة خريطة فضائية حول موقع العقار (بلاطات Esri تسمح بالرسم على canvas)
async function mapSnap(lat,lng,w,h,z){
  if(lat==null||lng==null||isNaN(lat)||isNaN(lng))return null;z=z||16;
  const n=256*Math.pow(2,z),px=(Number(lng)+180)/360*n,s=Math.sin(Number(lat)*Math.PI/180),py=(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n;
  const x0=px-w/2,y0=py-h/2,tx0=Math.floor(x0/256),ty0=Math.floor(y0/256),tx1=Math.floor((x0+w)/256),ty1=Math.floor((y0+h)/256);
  const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.fillStyle="#d9cdb4";g.fillRect(0,0,w,h);
  const jobs=[];for(let tx=tx0;tx<=tx1;tx++)for(let ty=ty0;ty<=ty1;ty++)jobs.push(loadImg(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`).then(im=>{if(im)g.drawImage(im,tx*256-x0,ty*256-y0);return !!im}));
  const ok=(await Promise.all(jobs)).filter(Boolean).length;if(!ok)return null;
  try{g.getImageData(0,0,1,1)}catch(_){return null}
  return c;
}
async function adPoster(o,key){
  key=THEMES[key]?key:"classic";const th=THEMES[key];
  try{await document.fonts.ready}catch(_){}
  const W=1080,H=1350,P=70,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const css=getComputedStyle(document.documentElement),v=n=>css.getPropertyValue(n).trim();
  const disp=v("--display")||"sans-serif",body=v("--body")||"sans-serif",fr=window.AQ_I18N&&AQ_I18N.lang==="fr";
  const R=W-P,L=P; x.direction=fr?"ltr":"rtl";
  const at=(txt,X,Y,align)=>{x.textAlign=align;x.fillText(txt,X,Y)};
  const START=fr?"left":"right",END=fr?"right":"left",SX=fr?L:R,EX=fr?R:L;
  let HH=500,img=null;
  if(key==="photo"){img=await loadImg(o.photo);if(!img){key="classic";return adPoster(o,"classic")}HH=560}
  // الجسم أولًا ثم الرأس
  x.fillStyle=th.body;x.fillRect(0,0,W,H);
  if(img){const s=Math.max(W/img.width,HH/img.height),w=img.width*s,h=img.height*s;x.save();x.beginPath();x.rect(0,0,W,HH);x.clip();x.drawImage(img,(W-w)/2,(HH-h)/2,w,h);x.restore();
    const g=x.createLinearGradient(0,0,0,HH);g.addColorStop(0,"rgba(0,0,0,.55)");g.addColorStop(.45,"rgba(0,0,0,.15)");g.addColorStop(1,"rgba(0,0,0,.8)");x.fillStyle=g;x.fillRect(0,0,W,HH)}
  else paintHead(x,th,key,W,HH,fr);
  // الوسم
  x.font=`800 42px ${body}`;const bw=x.measureText(o.badge).width+64;x.fillStyle=th.badge;rr(x,fr?L:R-bw,58,bw,78,key==="gold"?4:12);x.fill();
  x.fillStyle=th.badgeTxt;at(o.badge,fr?L+bw/2:R-bw/2,112,"center");
  x.fillStyle=th.headTxt;x.globalAlpha=.92;x.font=`500 30px ${body}`;at(o.top,EX,108,END);x.globalAlpha=1;
  // العنوان الكبير
  const base=img?HH-210:key==="brand"?250:270;
  const fs=fitFont(x,o.head+"  "+(o.size||""),"800",104,disp,W-2*P);x.font=`800 ${fs}px ${disp}`;const hw=x.measureText(o.head).width;
  if(img){x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=18}
  x.fillStyle=th.title;at(o.head,SX,base,START);
  if(o.size){x.fillStyle=th.size;at(o.size,fr?SX+hw+28:SX-hw-28,base,START)}
  let y=base+75;if(o.sub){x.fillStyle=th.headTxt;fitFont(x,o.sub,"600",40,body,W-2*P);at(o.sub,SX,y,START);y+=72}else y+=20;
  x.fillStyle=th.headTxt;x.font=`700 44px ${body}`;at("📍 "+o.place,SX,Math.min(y+10,HH-(key==="brand"?95:45)),START);x.shadowBlur=0;
  // الإطار الذهبي
  if(key==="gold"){x.strokeStyle="#D4AF37";x.lineWidth=3;x.strokeRect(24,24,W-48,H-48);x.lineWidth=1;x.strokeRect(36,36,W-72,H-72)}
  // لماذا؟
  const wy=HH+(key==="brand"?40:90);x.fillStyle=th.why;x.font=`800 50px ${disp}`;at(o.why,SX,wy,START);
  if(key!=="classic"){const tw=x.measureText(o.why).width;x.fillStyle=th.size;x.fillRect(fr?SX:SX-Math.min(tw,140),wy+16,Math.min(tw,140),6)}
  const colW=(W-2*P-30)/2,y0=wy+40,avail=(H-330-30)-y0;
  // خريطة الموقع: نصف المساحة، والمزايا في عمود واحد
  const mp=(!img&&o.lat!=null)?await mapSnap(o.lat,o.lng,Math.round(colW),Math.round(avail-10),16):null;
  if(mp){const MX=fr?R-colW:L,MY=y0+5;x.save();rr(x,MX,MY,colW,avail-10,22);x.clip();x.drawImage(mp,MX,MY);
    const gg=x.createLinearGradient(0,MY+avail-90,0,MY+avail);gg.addColorStop(0,"rgba(0,0,0,0)");gg.addColorStop(1,"rgba(0,0,0,.6)");x.fillStyle=gg;x.fillRect(MX,MY,colW,avail);x.restore();
    x.lineWidth=4;x.strokeStyle=key==="gold"?"#D4AF37":"#fff";rr(x,MX,MY,colW,avail-10,22);x.stroke();
    // دبوس الموقع
    const cx=MX+colW/2,cy=MY+(avail-10)/2;x.fillStyle="rgba(255,90,95,.25)";x.beginPath();x.arc(cx,cy,46,0,7);x.fill();
    x.fillStyle="#E53935";x.beginPath();x.arc(cx,cy-34,24,Math.PI*.85,Math.PI*2.15);x.lineTo(cx,cy);x.closePath();x.fill();x.fillStyle="#fff";x.beginPath();x.arc(cx,cy-36,9,0,7);x.fill();
    x.fillStyle="#fff";x.font=`700 30px ${body}`;at("🛰️ "+t("موقعه على الخريطة"),MX+colW/2,MY+avail-34,"center");
    x.font=`400 16px ${body}`;x.globalAlpha=.8;at("© Esri",fr?MX+colW-14:MX+14,MY+24,fr?"right":"left");x.globalAlpha=1}
  const one=!!mp,pts=o.points.slice(0,one?3:img?4:6),rows=Math.max(1,one?pts.length:Math.ceil(pts.length/2)),rowH=Math.min(150,avail/rows);
  let top=y0+(avail-rows*rowH)/2+(rowH-90)/2;
  pts.forEach((p,k)=>{
    const col=one?0:k%2,row=one?k:Math.floor(k/2),cx=fr?(L+col*(colW+30)):(R-col*(colW+30)),cy=top+row*rowH,icx=fr?cx+40:cx-40;
    x.fillStyle=th.ic;x.beginPath();x.arc(icx,cy+36,40,0,7);x.fill();if(key==="gold"){x.strokeStyle="#D4AF37";x.lineWidth=2;x.stroke()}
    x.font=`38px ${body}`;x.fillStyle=th.icTxt;at(p[0],icx,cy+50,"center");
    const tx=fr?cx+98:cx-98,maxW=colW-110;
    x.fillStyle=th.ink;fitFont(x,p[1],"700",38,body,maxW);at(p[1],tx,cy+30,START);
    if(p[2]){x.fillStyle=th.muted;fitFont(x,p[2],"500",28,body,maxW);at(p[2],tx,cy+72,START)}
  });
  // رمز QR إلى صفحة الإعلان بجانب السعر والتواصل
  const py=H-330,by=H-182,QS=238;
  const hasQR=o.url&&await drawQR(x,o.url,fr?R-QS:L,py,QS,key==="gold"?"#0F0F12":"#111",key==="gold"?"#D4AF37":"#fff");
  if(hasQR&&key!=="gold"){x.strokeStyle=th.boxLine;x.lineWidth=3;rr(x,fr?R-QS:L,py,QS,QS,14);x.stroke()}
  const BL=hasQR&&!fr?L+QS+20:L,BW=W-2*P-(hasQR?QS+20:0),BS=fr?BL:BL+BW,BE=fr?BL+BW:BL;
  // صندوق السعر
  x.lineWidth=3;x.strokeStyle=th.boxLine;x.fillStyle=th.box;rr(x,BL,py,BW,128,18);x.fill();x.stroke();
  x.fillStyle=th.muted;x.font=`600 28px ${body}`;at(o.priceLabel,BS+(fr?28:-28),py+40,START);
  if(o.price2){x.fillStyle=th.muted;fitFont(x,o.price2,"500",26,body,BW*.55);at(o.price2,BE+(fr?-28:28),py+40,END)}
  if(o.price){x.fillStyle=th.price;fitFont(x,o.price,"800",60,disp,BW-56);at(o.price,BS+(fr?28:-28),py+106,START)}
  // شريط واتساب
  x.fillStyle=th.bar;rr(x,BL,by,BW,110,18);x.fill();
  x.fillStyle=th.barTxt;fitFont(x,"💬 "+o.ctaLabel,"700",38,body,BW*.45);at("💬 "+o.ctaLabel,BS+(fr?30:-30),by+70,START);
  x.fillStyle=th.phone;fitFont(x,o.phone,"800",64,disp,BW*.5);x.direction="ltr";at(o.phone,BE+(fr?-30:30),by+78,fr?"right":"left");x.direction=fr?"ltr":"rtl";
  x.fillStyle=th.muted;x.font=`500 27px ${body}`;at(o.foot,W/2,H-(key==="gold"?44:30),"center");
  return new Promise(r=>c.toBlob(r,"image/png"));
}
async function shareImage(o,name,key){
  const blob=await adPoster(o,key);if(!blob){toast(t("تعذّر إنشاء الصورة"));return}
  const file=new File([blob],name,{type:"image/png"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:o.shareText||SITE()});return}}catch(err){if(err&&err.name==="AbortError")return}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast(t("حُفظت الصورة: انشرها في حالة واتساب"));
}
// نافذة اختيار التصميم مع معاينات حقيقية
let PICK=null;
async function pickDesign(o,name){
  const keys=Object.keys(THEMES).filter(k=>k!=="photo"||o.photo);
  let last="classic";try{last=localStorage.getItem("aq-theme")||"classic"}catch(_){}
  $("#itemBody").innerHTML=`<h3>${t("اختر تصميم الإعلان")}</h3><p class="muted small">${t("كل التصاميم فيها رقم المنصة ورمز QR يفتح الإعلان مباشرة.")}</p>
    <div class="designs">${keys.map(k=>`<button type="button" class="design${k===last?" on":""}" data-design="${k}"><span class="dimg" data-dimg="${k}"><span class="spin"></span></span><b>${t(THEMES[k].name)}</b></button>`).join("")}</div>
    <div class="row"><button class="btn or" id="designGo">${t("شارك هذا التصميم")}</button><button class="btn ghost" data-close>${t("إغلاق")}</button></div>`;
  if(!$("#dlgItem").open)$("#dlgItem").showModal();
  PICK={o,name,key:keys.includes(last)?last:"classic"};
  for(const k of keys){const bl=await adPoster(o,k);const el=$(`#itemBody [data-dimg="${k}"]`);if(!el||!bl)continue;
    const u=URL.createObjectURL(bl);el.innerHTML=`<img src="${u}" alt="">`}
}
document.addEventListener("click",e=>{
  const d=e.target.closest("[data-design]");if(d&&PICK){PICK.key=d.dataset.design;$$("#itemBody .design").forEach(b=>b.classList.toggle("on",b===d));try{localStorage.setItem("aq-theme",PICK.key)}catch(_){}}
  if(e.target.closest("#designGo")&&PICK)shareImage(PICK.o,PICK.name,PICK.key);
});
const OLD=v=>window.AQ.oldTxt(v);
const localNum=p=>{p=String(p||"").replace(/\D/g,"");return p.startsWith("222")&&p.length===11?p.slice(3):p};
const siteShort=()=>(CFG.SITE_URL||location.host+location.pathname).replace(/^https?:\/\//,"").replace(/index\.html$/,"").replace(/\/$/,"");
function whyOf(i){const k=i.kind==="land"||i.ptype==="أرض"?"land":i.ptype;
  return t({land:"لماذا هذه الأرض؟","شقة":"لماذا هذه الشقة؟","دار":"لماذا هذا البيت؟","محل":"لماذا هذا المحل؟","مكتب":"لماذا هذا المكتب؟","غرفة":"لماذا هذه الغرفة؟"}[k]||"لماذا هذا العقار؟")}
function pointsOf(i){
  const pts=[];const add=p=>{if(p&&pts.length<6&&!pts.some(q=>q[1]===p[1]))pts.push(p.map(s=>s&&t(s)))};
  if(i.title_doc)add(["📄","وثائق: "+i.title_doc,i.kind==="land"||i.kind==="home_sale"?"جاهزة للفرغ":"موثّقة"]);
  if(i.rooms&&i.kind!=="land")add(["🛏️",i.rooms+" "+(i.rooms>2&&i.rooms<11?"غرف":"غرفة"),i.size_m2?fmt(i.size_m2)+" م²":""]);
  if(i.solar)add(["☀️","بلا انقطاع كهرباء","طاقة بديلة أو مولّد"]);
  if(i.furnished)add(["🛋️","مفروشة","جاهزة للسكن"]);
  (Array.isArray(i.features)?i.features:[]).forEach(f=>add(FEAT_PT[f]||["✓",f,""]));
  if(i.kind==="rent"&&i.advance_months)add(["💵",window.AQ.ADV_TXT(i.advance_months),"وضوح قبل الاتفاق"]);
  if(pts.length<2)add(["🔍","معروض على عقارك","تفاصيله الكاملة على الموقع"]);
  return pts;
}
function listingPoster(i){
  const sale=i.kind==="land"||i.kind==="home_sale",per=i.kind==="rent"?" "+t("/ شهر"):i.kind==="daily"?" "+t("/ ليلة"):"";
  const head=t(i.kind==="land"||i.ptype==="أرض"?"قطعة أرضية":i.ptype);
  const plat=window.AQ.cleanPhone(CFG.PLATFORM_WHATSAPP),to=(CFG.CONTACT_VIA_PLATFORM&&plat)?plat:(window.AQ.cleanPhone(i.contact_whatsapp)||plat);
  const old=OLD(i.price);
  return {badge:t(sale?"للبيع":i.kind==="daily"?"إيجار يومي":"للإيجار"),
    top:t("عبر عقارك · سماسرة موثوقون"),head,size:i.size_m2?fmt(i.size_m2)+" "+t("م²"):"",
    sub:(i.title&&i.title!==head)?i.title:"",place:A.place(i).replace(/<[^>]+>/g,""),
    why:whyOf(i),points:pointsOf(i),priceLabel:t("السعر"),
    price:old?`${t(old)} ${t("أوقية قديمة")}${per}`:`${fmt(i.price)} ${t("أوقية")}${per}`,
    price2:old?`${fmt(i.price)} ${t("أوقية جديدة")}`:"",
    ctaLabel:t("للتواصل"),phone:localNum(to),
    foot:`${t("عقارك")} · ${siteShort()} · ${t("إعلان رقم")} ${i.id}`,
    lat:i.lat??null,lng:i.lng??null,photo:(window.AQ.photosOf(i)||[])[0]||"",url:`${SITE()}#l-${i.id}`,
    shareText:`${i.title} — ${SITE()}#l-${i.id}`};
}
function requestPoster(q){
  const pts=[];const add=p=>{if(p&&pts.length<6)pts.push(p.map(s=>s&&t(s)))};
  add(["📍",A.place(q).replace(/<[^>]+>/g,""),"المكان المطلوب"]);
  if(q.rooms)add(["🛏️",q.rooms+" "+(q.rooms>2&&q.rooms<11?"غرف":"غرفة"),"على الأقل"]);
  if(q.duration)add(["📅",q.duration,"مدة الإيجار"]);
  if(q.furnished)add(["🛋️","مفروشة",""]);
  (Array.isArray(q.features)?q.features:[]).forEach(f=>add(FEAT_PT[f]||["✓",f,""]));
  if(q.notes)add(["📝",String(q.notes).slice(0,40),""]);
  const plat=window.AQ.cleanPhone(CFG.PLATFORM_WHATSAPP);
  return {badge:t("مطلوب"),top:t("طلب حقيقي راجعته عقارك"),head:t(q.ptype),size:t(A.reqKind(q.kind)),
    sub:q.rooms?q.rooms+" "+t(q.rooms>2&&q.rooms<11?"غرف":"غرفة")+(q.duration?" · "+t(q.duration):""):"",place:A.place(q).replace(/<[^>]+>/g,""),why:t("ماذا يريد؟"),points:pts,
    priceLabel:t("الميزانية"),price:q.budget?`${t("حتى")} ${t(OLD(q.budget))} ${t("أوقية قديمة")}`:t("حسب العرض"),price2:q.budget?`${fmt(q.budget)} ${t("أوقية جديدة")}`:"",
    ctaLabel:t("عندك عرض؟"),phone:localNum(plat),foot:`${t("قدّم عرضك على")} ${siteShort()} · ${t("طلب رقم")} ${q.id}`,
    url:`${SITE()}?tab=req`,shareText:`${t("عندك عرض؟ قدّمه على عقارك")} ${SITE()}?tab=req`};
}
document.addEventListener("click",e=>{
  const r=e.target.closest("[data-imgreq]"),l=e.target.closest("[data-imgitem]");
  if(r){const q=A.reqs.find(x=>String(x.id)===r.dataset.imgreq);if(q)pickDesign(requestPoster(q),`aqarak-talab-${q.id}.png`)}
  if(l){const i=A.list.find(x=>String(x.id)===l.dataset.imgitem);if(i)pickDesign(listingPoster(i),`aqarak-${i.id}.png`)}
});
window.AQPOSTER={adPoster,listingPoster,requestPoster,THEMES,openFor:id=>{const i=A.list.find(x=>String(x.id)===String(id));if(i)pickDesign(listingPoster(i),`aqarak-${i.id}.png`)}};
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

/* ---------- زر واتساب العائم: يختفي عند النزول ويظهر عند الصعود أو فتح نافذة ---------- */
(function(){const w=document.getElementById("waFloat");if(!w)return;let last=scrollY,tick=false;
  const upd=()=>{const y=scrollY,open=!!document.querySelector("dialog[open]");w.classList.toggle("away",open||(y>last+4&&y>300));if(y<last-4||y<300)if(!open)w.classList.remove("away");last=y;tick=false};
  addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
  new MutationObserver(upd).observe(document.body,{subtree:true,attributes:true,attributeFilter:["open"]});})();
