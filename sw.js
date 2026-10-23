// عقارك — عامل الخدمة: يفتح الموقع بسرعة ويعمل عند ضعف الإنترنت
const V="aq-2026.10.23";
const SHELL=["./","index.html","styles.css?v=2026.10.23","config.js?v=2026.10.23","i18n.js?v=2026.10.23","art.js?v=2026.10.23","common.js?v=2026.10.23","app.js?v=2026.10.23","extras.js?v=2026.10.23","services.js?v=2026.10.23","icon.svg","icon-192.png","manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET")return;
  if(/supabase\.co$/.test(u.hostname))return;                 // البيانات الحية لا تُخزَّن أبدًا
  if(r.mode==="navigate"){                                       // الصفحة: الشبكة أولًا، ثم النسخة المحفوظة
    // نحفظ الصفحة الرئيسية فقط، وفقط إن نجح تحميلها (لا لوحة الإدارة ولا صفحة 404)
    const home=/\/(index\.html)?$/.test(u.pathname);
    e.respondWith(fetch(r).then(res=>{if(home&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put("index.html",cp))}return res}).catch(()=>caches.match("index.html")));return}
  const cacheable=u.origin===location.origin||/^(fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|cdn\.jsdelivr\.net)$/.test(u.hostname); // صور الخريطة لا تُحفظ (تملأ ذاكرة الهاتف)
  if(!cacheable)return;
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net}));
});
