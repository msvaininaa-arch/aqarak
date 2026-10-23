// عقارك — رسوم توضيحية للعقارات التي لا صور لها بعد (بدون صور خارجية)
(function(){
function rnd(seed){let s=(seed*9301+49297)%233280;return()=>{s=(s*9301+49297)%233280;return s/233280}}
const SKY=[["#BFD9F6","#F5E7CF"],["#C7D7FF","#FFE3C4"],["#B5E0F0","#FFF1D6"],["#D7CCF5","#FFE0D0"]];
function scene(type,id){
  const r=rnd((id||1)*7+type.length),sky=SKY[(id||0)%SKY.length];
  const win=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${r()>.55?"#FFD27A":"#5E7FA8"}"/>`;
  let body="";
  if(type==="apt"){
    body=`<rect x="70" y="40" width="110" height="130" fill="#E9E4DA"/><rect x="70" y="40" width="110" height="8" fill="#CFC6B6"/>
      ${[0,1,2,3,4].map(row=>[0,1,2,3].map(c=>win(80+c*25,56+row*21,15,12)).join("")).join("")}
      <rect x="180" y="75" width="70" height="95" fill="#D9D2C5"/>${[0,1,2].map(row=>[0,1].map(c=>win(190+c*28,88+row*24,16,13)).join("")).join("")}
      <rect x="112" y="150" width="22" height="20" fill="#7A5A3A"/>`;
  }else if(type==="house"){
    body=`<rect x="85" y="80" width="150" height="90" fill="#F1E6D2"/><rect x="80" y="74" width="160" height="10" fill="#E2D2B6"/>
      ${[0,1,2,3,4,5,6,7].map(k=>`<rect x="${82+k*20}" y="66" width="10" height="9" fill="#E2D2B6"/>`).join("")}
      <path d="M145 170v-36a15 15 0 0 1 30 0v36z" fill="#2E2AD6"/>${win(100,100,26,20)}${win(194,100,26,20)}
      <rect x="250" y="100" width="6" height="70" fill="#8A6A3A"/><path d="M253 100c-20-6-30 2-34 8 12-6 22-5 34-8zm0 0c20-6 30 2 34 8-12-6-22-5-34-8zm0 0c-12-14-24-14-30-10 12 0 20 4 30 10zm0 0c12-14 24-14 30-10-12 0-20 4-30 10z" fill="#2F7A4F"/>`;
  }else if(type==="room"){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><rect width="320" height="180" fill="#EDE6DC"/><rect y="138" width="320" height="42" fill="#C9B79C"/>
      <rect x="200" y="30" width="80" height="60" fill="${sky[0]}" stroke="#FFF" stroke-width="5"/><line x1="240" y1="30" x2="240" y2="90" stroke="#FFF" stroke-width="4"/>
      <rect x="40" y="100" width="150" height="40" rx="6" fill="#FFFFFF"/><rect x="40" y="86" width="40" height="22" rx="6" fill="#E8E1F7"/><rect x="40" y="114" width="150" height="26" rx="4" fill="#6A2BC9"/><rect x="34" y="70" width="8" height="74" rx="3" fill="#7A5A3A"/>
      <rect x="205" y="112" width="34" height="28" fill="#A88A64"/><rect x="216" y="92" width="12" height="20" fill="#F5C76A"/></svg>`;
  }else if(type==="shop"){
    body=`<rect x="60" y="62" width="200" height="108" fill="#F3E9DA"/>
      <path d="M55 62h210l-8 22H63z" fill="#E9830F"/>${[0,1,2,3,4,5,6].map(k=>`<path d="M${63+k*28} 62h14l-4 22h-14z" fill="#FFF" opacity=".55"/>`).join("")}
      <rect x="78" y="96" width="70" height="48" fill="#9FC3E8"/><rect x="164" y="96" width="78" height="74" fill="#6E5A44"/><rect x="170" y="102" width="66" height="62" fill="#8C7258"/>
      <rect x="78" y="148" width="70" height="22" fill="#E2D2B6"/>`;
  }else if(type==="office"){
    body=`<rect x="110" y="20" width="100" height="150" fill="#51617F"/>${[...Array(9)].map((_,row)=>[0,1,2,3].map(c=>`<rect x="${118+c*23}" y="${28+row*15}" width="17" height="10" fill="${r()>.4?"#BFD9F6":"#8FA3C4"}"/>`).join("")).join("")}
      <rect x="60" y="90" width="50" height="80" fill="#2F3B57"/>${[0,1,2,3].map(row=>`<rect x="68" y="${100+row*17}" width="34" height="9" fill="#9FB3D6"/>`).join("")}
      <rect x="210" y="70" width="55" height="100" fill="#3B4866"/>${[0,1,2,3,4].map(row=>`<rect x="218" y="${80+row*17}" width="40" height="9" fill="#BFD9F6"/>`).join("")}`;
  }else if(type==="store"){
    body=`<path d="M60 90 160 50l100 40v80H60z" fill="#D9CDB8"/><rect x="100" y="110" width="120" height="60" fill="#8C7258"/>${[0,1,2,3,4,5,6].map(k=>`<rect x="100" y="${114+k*8}" width="120" height="3" fill="#6E5A44"/>`).join("")}`;
  }else{ // land
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
      <rect width="320" height="180" fill="url(#s)"/><circle cx="260" cy="40" r="16" fill="#FFD27A"/>
      <path d="M0 110c60-20 110-18 170-4s110 10 150-6v80H0z" fill="#E7C98F"/><path d="M0 130c70-16 140-10 200 2s90 6 120-4v52H0z" fill="#D9B676"/>
      <path d="M90 120 230 112 260 160 70 168z" fill="#E9D3A2" stroke="#8A6A2E" stroke-width="2" stroke-dasharray="6 5"/>
      ${[[90,120],[230,112],[260,160],[70,168]].map(([x,y])=>`<rect x="${x-3}" y="${y-12}" width="6" height="14" fill="#8A6A2E"/>`).join("")}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="320" height="180" fill="url(#s)"/><circle cx="${40+r()*40}" cy="36" r="14" fill="#FFD27A"/>
    <rect y="166" width="320" height="14" fill="#D9C39A"/>${body}</svg>`;
}
window.AQ_ART=(type,id)=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(scene(type,id));
})();
