const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
if(!window.confetti)window.confetti=()=>{}; // site still works if the confetti CDN is blocked
const fx={z:10}; // camera depth per scene

/* ===== 1. Three.js: glowing heart, halo, orbiting hearts, particles ===== */
if(window.THREE)(function(){ // skipped gracefully if the CDN is blocked
  const r=new THREE.WebGLRenderer({canvas:$('#bg'),antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
  const scn=new THREE.Scene(),cam=new THREE.PerspectiveCamera(55,1,.1,200);
  const sh=new THREE.Shape();sh.moveTo(0,-2.2);sh.bezierCurveTo(-3.6,.4,-2.2,3,0,1.4);sh.bezierCurveTo(2.2,3,3.6,.4,0,-2.2);
  const geo=new THREE.ExtrudeGeometry(sh,{depth:1.1,bevelEnabled:true,bevelThickness:.5,bevelSize:.45,bevelSegments:10,curveSegments:36});geo.center();
  const heart=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0xff4fa3,emissive:0x5a0a3a,metalness:.3,roughness:.25,clearcoat:1}));
  heart.position.set(0,.2,-3);
  scn.add(new THREE.AmbientLight(0x4b1d8f,1.1));
  const L=[[0xff4fa3,-6,4,6],[0xffd9a0,6,-3,5],[0x8a4dff,0,6,-4]].map(([c,x,y,z])=>{const l=new THREE.PointLight(c,2.4,40);l.position.set(x,y,z);scn.add(l);return l});
  const hc=document.createElement('canvas');hc.width=hc.height=128;const hx=hc.getContext('2d'),g=hx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,79,163,.9)');g.addColorStop(.4,'rgba(255,79,163,.25)');g.addColorStop(1,'rgba(255,79,163,0)');hx.fillStyle=g;hx.fillRect(0,0,128,128);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(hc),blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(14,14,1);halo.position.set(0,.2,-4.5);
  const orbit=new THREE.Group();orbit.position.set(0,.2,-3);
  for(let i=0;i<14;i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:i%2?0xffd9a0:0xff8cc6}));const a=i/14*6.283;m.position.set(Math.cos(a)*5.5,Math.sin(a*2)*.8,Math.sin(a)*5.5);m.scale.setScalar(.09);orbit.add(m)}
  
  const N=1500,P=new Float32Array(N*3),C=new Float32Array(N*3),pal=[0xff4fa3,0xffd9a0,0x9b6bff].map(c=>new THREE.Color(c));
  for(let i=0;i<N;i++){P.set([(Math.random()-.5)*50,(Math.random()-.5)*34,(Math.random()-.5)*40-4],i*3);C.set([pal[i%3].r,pal[i%3].g,pal[i%3].b],i*3)}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(P,3));pg.setAttribute('color',new THREE.BufferAttribute(C,3));
  const stars=new THREE.Points(pg,new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending}));scn.add(stars);
  const m={x:0,y:0,tx:0,ty:0},mv=(x,y)=>{m.tx=(x/innerWidth-.5)*2;m.ty=(y/innerHeight-.5)*2};
  addEventListener('mousemove',e=>mv(e.clientX,e.clientY));addEventListener('touchmove',e=>mv(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
  const rz=()=>{r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener('resize',rz);rz();
  const clk=new THREE.Clock();
  (function loop(){
    const t=clk.getElapsedTime();m.x+=(m.tx-m.x)*.05;m.y+=(m.ty-m.y)*.05;
    cam.position.z+=(fx.z-cam.position.z)*.04;cam.position.x=m.x*.8;cam.position.y=-m.y*.5;cam.lookAt(0,0,0);
    heart.rotation.y=t*.45+m.x*.6;heart.rotation.x=m.y*.35;heart.position.y=.2+Math.sin(t)*.25;
    heart.scale.setScalar(.8+Math.pow(Math.sin(t*2.6),8)*.07);
    orbit.rotation.y=t*.35;orbit.rotation.z=.25;orbit.children.forEach(c=>c.rotation.y=t*2);
    halo.material.opacity=.75+Math.sin(t*2.6)*.25;halo.position.y=heart.position.y;
    stars.rotation.y=t*.02+m.x*.08;stars.rotation.x=m.y*.05;
    L[0].position.x=Math.sin(t*.7)*7;L[1].position.y=Math.cos(t*.6)*5;
    r.render(scn,cam);requestAnimationFrame(loop);
  })();
})();

/* ===== 2. Ambient layers: blurred rising hearts + cursor sparkles ===== */
for(let i=0;i<16;i++){const h=document.createElement('span');h.className='h';h.textContent='♥';
  h.style.cssText=`left:${Math.random()*100}%;font-size:${20+Math.random()*60}px;filter:blur(${1+Math.random()*3}px);animation-duration:${14+Math.random()*16}s;animation-delay:${-Math.random()*20}s`;document.body.appendChild(h)}
const spk=$('#spark'),sx=spk.getContext('2d');let sp=[],ss=[];
const rs=()=>{spk.width=innerWidth;spk.height=innerHeight};rs();addEventListener('resize',rs);
const addSp=(x,y)=>{for(let i=0;i<2;i++)sp.push({x,y,vx:(Math.random()-.5)*1.2,vy:Math.random()*1.2+.3,l:1,d:.02,g:0,c:Math.random()<.5?'255,217,160':'255,79,163'})};
const tapBurst=(x,y)=>{for(let i=0;i<16;i++){const a=Math.random()*6.283,s=1.5+Math.random()*3.5;sp.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,d:.017,g:.07,h:i%3===0,c:['255,217,160','255,79,163','255,255,255'][i%3]})}};
addEventListener('mousemove',e=>addSp(e.clientX,e.clientY));addEventListener('touchmove',e=>addSp(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
addEventListener('pointerdown',e=>{if(!e.target.closest('input,#player'))tapBurst(e.clientX,e.clientY)});
setInterval(()=>{if(!document.hidden&&ss.length<2)ss.push({x:innerWidth*(.3+Math.random()*.7),y:Math.random()*innerHeight*.35,l:1})},3800);
(function d(){sx.clearRect(0,0,spk.width,spk.height);sp=sp.filter(p=>p.l>0);
  sp.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.l-=p.d;sx.fillStyle='rgba('+p.c+','+Math.max(0,p.l)+')';
    if(p.h){sx.font=(10+p.l*10)+'px sans-serif';sx.fillText('♥',p.x,p.y)}else{sx.beginPath();sx.arc(p.x,p.y,2.5*p.l+.5,0,7);sx.fill()}});
  ss=ss.filter(s=>s.l>0);ss.forEach(s=>{s.x-=9;s.y+=4.5;s.l-=.016;const g=sx.createLinearGradient(s.x,s.y,s.x+60,s.y-30);g.addColorStop(0,'rgba(255,255,255,'+s.l+')');g.addColorStop(1,'rgba(255,255,255,0)');sx.strokeStyle=g;sx.lineWidth=2;sx.beginPath();sx.moveTo(s.x,s.y);sx.lineTo(s.x+60,s.y-30);sx.stroke()});
  requestAnimationFrame(d)})();
$$('.tilt').forEach(el=>{el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;el.style.transform=`perspective(900px) rotateY(${x*9}deg) rotateX(${-y*9}deg)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

/* ===== 3. Confetti + fireworks ===== */
const COL=['#ff4fa3','#ffd9a0','#9b6bff','#ffffff'];
function burst(){confetti({particleCount:150,spread:100,origin:{y:.6},colors:COL});setTimeout(()=>{confetti({particleCount:80,angle:60,spread:70,origin:{x:0,y:.7},colors:COL});confetti({particleCount:80,angle:120,spread:70,origin:{x:1,y:.7},colors:COL})},250)}
function fireworks(ms=5000){const end=Date.now()+ms,R=(a,b)=>Math.random()*(b-a)+a;const iv=setInterval(()=>{if(Date.now()>end)return clearInterval(iv);confetti({startVelocity:32,spread:360,ticks:70,zIndex:100,particleCount:55,origin:{x:R(.1,.9),y:Math.random()*.5},colors:COL})},320)}

/* ===== 4. Photos (SVG placeholders — replace src values with real photos) ===== */
const MEM=CONFIG.photos.length?CONFIG.photos.map(p=>[p.cap||'','#ff4fa3','#8a4dff']):[['First hello','#ff4fa3','#8a4dff'],['Sunsets','#ffb347','#ff4fa3'],['Silly faces','#8a4dff','#2ad4ff'],['That trip','#ff6aa8','#ffd9a0'],['Late talks','#3b1b8f','#ff4fa3'],['Coffee dates','#ffd9a0','#ff4fa3'],['Our song','#ff8cc6','#6a3cff'],['Forever','#ff4fa3','#ffd9a0']];
const art=(a,b,i)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="${90+i*35}" cy="110" r="60" fill="#fff" opacity=".18"/><path d="M200 330c-90-60-60-130 0-95 60-35 90 35 0 95z" fill="#fff" opacity=".9"/></svg>`);
const pic=i=>{const k=i%MEM.length,p=CONFIG.photos[k];return(p&&p.src)||art(MEM[k][1],MEM[k][2],k)};
const lb=$('#lb');
MEM.forEach(([cap0,a,b],i)=>{const cap=(CONFIG.photos[i]&&CONFIG.photos[i].cap)||cap0;const p=document.createElement('button');p.className='pl';p.style.cssText=`--r:${[-4,3,-2,5,-5,2,-3,4][i%8]}deg;--i:${i%8}`;
  p.innerHTML=`<img loading="lazy" src="${pic(i)}" alt="${cap||'Photo '+(i+1)}"><em>${cap}</em>`;
  p.onclick=()=>openLb(i);$('#wall').appendChild(p)});
lb.onclick=()=>lb.classList.remove('show');
let lbI=0;
function openLb(i){lbI=(i+MEM.length)%MEM.length;const im=$$('#wall .pl img')[lbI];$('#lbImg').src=im.src;$('#lbImg').alt=im.alt;$('#lbCap').textContent=MEM[lbI][0];lb.classList.add('show')}
$('#lbPrev').onclick=e=>{e.stopPropagation();openLb(lbI-1)};$('#lbNext').onclick=e=>{e.stopPropagation();openLb(lbI+1)};
// polaroids that fly into the corners on scene 2
[[4,3,-60,-50,-10],[3,70,60,-40,8],[62,4,40,-60,-6],[64,76,70,50,9],[40,80,0,60,-4],[8,40,-70,10,6]].forEach(([t,l,x,y,rot],i)=>{
  const f=document.createElement('div');f.className='fp';f.style.cssText=`top:${t}%;left:${l}%;--fx:${x}vw;--fy:${y}vh;--r:${rot}deg;--d:${.3+i*.25}s`;
  f.innerHTML=`<img src="${pic(i)}" alt="">`;$('#s2').appendChild(f)});

/* ===== 5. Scene director ===== */
const scenes=$$('.scene');let cur=0,timers=[];
const Z=[10,8,9,11,12,12,11,7];
/* Full-screen background videos, cross-faded per scene */
const VK={0:'moon',1:'gift',2:'hearts',3:'lanterns',4:'hearts',5:'lanterns',6:'balloons',7:'fireworks'};
const vids=$$('.bgv');let autoMusic=false;
const needV=v=>{if(v&&!v.src)v.src=v.dataset.src};
function showBg(n){const k=VK[n];
  vids.forEach(v=>{if(v.dataset.k===k){needV(v);v.classList.add('on');v.play().catch(()=>{})}else if(v.dataset.k!=='giftopen'){v.classList.remove('on');setTimeout(()=>{if(!v.classList.contains('on'))v.pause()},1400)}});
  needV(vids.find(v=>v.dataset.k===VK[n+1]));
}
function go(n){
  const prev=cur;if(prev===5&&n!==5){cakeStop();Cake.stop()}
  timers.forEach(clearTimeout);timers=[];cur=n;
  scenes.forEach((s,i)=>s.classList.toggle('on',i===n));fx.z=Z[n];
  showBg(n);
  if(n===1&&prev===0&&!autoMusic){autoMusic=true;if(!playing)playBtn.click()} // start the song after the first tap
  if(enter[n])enter[n]();
}
showBg(0);
document.addEventListener('click',e=>{if(e.target.closest('[data-next]:not(:disabled)'))go(cur+1)});
const seg=window.Intl&&Intl.Segmenter?new Intl.Segmenter('si',{granularity:'grapheme'}):null;
const chars=s=>seg?[...seg.segment(s)].map(x=>x.segment):Array.from(s);
async function typeLetter(){
  const ps=$$('#s3 [data-t]'),nx=$('#s3 .next');nx.classList.remove('show');
  ps.forEach(p=>{p.dataset.full=p.dataset.full||p.textContent;p.textContent='';p.classList.remove('typing')});
  for(const p of ps){p.classList.add('typing');for(const c of chars(p.dataset.full)){if(cur!==3)return;p.textContent+=c;await new Promise(r=>setTimeout(r,30))}p.classList.remove('typing')}
  nx.classList.add('show');
}
const enter={
  2(){burst();timers.push(setTimeout(()=>go(3),9000))},
  3(){typeLetter()},
  5(){cakeStart()},
  7(){fireworks(6000);burst();petals()}
};

/* S0: flip-card countdown to 20 Oct 2026 + MMDD unlock */
const target=new Date(...CONFIG.birthday).getTime(),goBtn=$('#goBtn');
function tick(){
  const d=Math.max(0,target-Date.now()),v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];
  $$('#flip b').forEach((b,i)=>{const t=String(v[i]).padStart(2,'0');if(b.textContent!==t){b.textContent=t;b.classList.remove('f');void b.offsetWidth;b.classList.add('f')}});
  goBtn.disabled=d>0;goBtn.textContent=d>0?'Waiting for the moment…':'Open your surprise';
}
tick();setInterval(tick,1000);
$('#code').addEventListener('input',e=>{
  const c=e.target;c.value=c.value.replace(/\D/g,'');if(c.value.length<4){$('#hint').textContent='';return}
  if(c.value===CONFIG.code){burst();setTimeout(()=>go(1),600)}
  else{$('#hint').textContent='Not quite, Chuti, think of a very special day 💭';c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');c.value=''}
});
/* S1: gift */
$('#gift').onclick=function(){
  if(this.dataset.busy)return;this.dataset.busy=1;
  if(!playing&&!userPaused)playBtn.click(); // phones only allow audio after a real tap
  const o=vids.find(v=>v.dataset.k==='giftopen');needV(o);
  vids.forEach(v=>{if(v.dataset.k==='gift')v.classList.remove('on')});
  o.currentTime=0;o.classList.add('on');o.play().catch(()=>{});
  setTimeout(burst,1200);
  let done=false;const fin=()=>{if(done)return;done=true;o.classList.remove('on');delete this.dataset.busy;go(2)};
  o.onended=fin;setTimeout(fin,4600);
};
/* S6/S7 */
$('#reveal').onclick=()=>{fireworks();setTimeout(()=>$('#secret').classList.add('show'),500)};
const closeS=()=>$('#secret').classList.remove('show');$('#closeS').onclick=closeS;
addEventListener('keydown',e=>{if(e.key==='Escape'){closeS();lb.classList.remove('show')}if(lb.classList.contains('show')){if(e.key==='ArrowRight')openLb(lbI+1);if(e.key==='ArrowLeft')openLb(lbI-1)}});
$('#replay').onclick=()=>go(1);

/* ===== 5b. 3D CAKE (Three.js): blow into the mic or tap. Blows 1-2 = pop-up hint, blow 3 = candles out ===== */
const msgEl=$('#cakeMsg'),hintEl=$('#cakeHint'),popEl=$('#cakePop'),box=$('#cakeBox');
const setMsg=(t,big)=>{msgEl.textContent=t;msgEl.classList.toggle('big',!!big)};
let popT;function showPop(t){clearTimeout(popT);popEl.textContent=t;popEl.classList.remove('go');void popEl.offsetWidth;popEl.classList.add('go');popT=setTimeout(()=>popEl.classList.remove('go'),2700)}
const Cake=(()=>{
  if(!window.THREE){box.classList.add('fb');return{start(){},stop(){},wob(){},out(){},reset(){},rot(){}}}
  const T=THREE,cv=$('#cake3d');
  let R,scn,cam,root,heart,stars,fl=[],sm=[],act=false,raf=0,ready=false,user=0,bl=false,outT=-1,y3=0,smokeTex;
  const tex=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return new T.CanvasTexture(c)};
  const glow=(a,b)=>tex(128,128,x=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,128,128)});
  const M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:0},o));
  function build(){
    R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;
    scn=new T.Scene();cam=new T.PerspectiveCamera(38,1,.1,60);
    scn.add(new T.HemisphereLight(0xffe3f2,0x3a1a6e,.95));
    const dl=new T.DirectionalLight(0xffffff,.85);dl.position.set(3,7,6);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-4,right:4,top:5,bottom:-3});scn.add(dl);
    const rim=new T.DirectionalLight(0x9b6bff,.9);rim.position.set(-5,3,-5);scn.add(rim);
    const fg=new T.Mesh(new T.PlaneGeometry(10,10),new T.MeshBasicMaterial({map:glow('rgba(255,79,163,.55)','rgba(255,79,163,0)'),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));fg.rotation.x=-Math.PI/2;fg.position.y=-.14;scn.add(fg);
    root=new T.Group();scn.add(root);
    const gold=M(0xffcf70,{metalness:.7,roughness:.28,emissive:0x4a2a00}),cream=M(0xfff4f9,{roughness:.35}),pearl=M(0xffe7a8,{metalness:.6,roughness:.25,emissive:0x3a2600});
    const plate=new T.Mesh(new T.CylinderGeometry(2.5,2.6,.14,72),gold);plate.position.y=-.07;root.add(plate);
    const doily=new T.Mesh(new T.CylinderGeometry(2.25,2.25,.03,72),M(0xfff6fb));doily.position.y=.01;root.add(doily);
    const arc=(r,yc,h,a,draw)=>{const w=1024,hh=Math.round(w*h/(r*a));const m=new T.Mesh(new T.CylinderGeometry(r+.006,r+.006,h,48,1,true,-a/2,a),new T.MeshBasicMaterial({map:tex(w,hh,(x,W,H)=>draw(x,W,H)),transparent:true,depthWrite:false}));m.position.y=yc;m.userData.ns=1;root.add(m)};
    const fit=(x,s,font,W,H,fill,stroke)=>{let px=H*.9;x.font=font(px);const mw=x.measureText(s).width;if(mw>W*.92){px*=W*.92/mw;x.font=font(px)}x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=px*.07;x.strokeStyle=stroke;x.strokeText(s,W/2,H/2);x.fillStyle=fill;x.fillText(s,W/2,H/2)};
    const tiers=[[1.7,.95,0xff7fb8],[1.25,.85,0xd9b8ff],[.85,.75,0xff7fb8]];let y=.03;
    tiers.forEach(([r,h,c],k)=>{
      const m=new T.Mesh(new T.CylinderGeometry(r,r,h,64),M(c,{roughness:.55,emissive:c,emissiveIntensity:.08}));m.position.y=y+h/2;root.add(m);
      const top=y+h;
      const cap=new T.Mesh(new T.CylinderGeometry(r+.02,r+.02,.07,64),cream);cap.position.y=top+.02;root.add(cap);
      const rm=new T.Mesh(new T.TorusGeometry(r+.01,.075,12,72),cream);rm.rotation.x=Math.PI/2;rm.position.y=top+.05;root.add(rm);
      const n=Math.round(r*14);
      for(let i=0;i<n;i++){const a=i/n*6.283,L=.14+Math.random()*.2,px=Math.sin(a)*(r+.03),pz=Math.cos(a)*(r+.03);
        const d=new T.Mesh(new T.CylinderGeometry(.065,.065,L,10),cream);d.position.set(px,top-L/2,pz);root.add(d);
        const e=new T.Mesh(new T.SphereGeometry(.065,10,8),cream);e.position.set(px,top-L,pz);root.add(e)}
      const n2=Math.round(r*9);
      for(let i=0;i<n2;i++){const a=i/n2*6.283,p=new T.Mesh(new T.SphereGeometry(.065,12,10),pearl);p.position.set(Math.sin(a)*(r+.02),y+.07,Math.cos(a)*(r+.02));root.add(p)}
      const sp=new T.InstancedMesh(new T.BoxGeometry(.11,.03,.03),M(0xffffff),30),dm=new T.Object3D(),col=new T.Color();
      for(let i=0;i<30;i++){const a=Math.random()*6.283,rr=r*.3+Math.sqrt(Math.random())*r*.55;dm.position.set(Math.sin(a)*rr,top+.07,Math.cos(a)*rr);dm.rotation.y=Math.random()*6;dm.updateMatrix();sp.setMatrixAt(i,dm.matrix);sp.setColorAt(i,col.set([0xffd27a,0xffffff,0xff4fa3,0x8a4dff][i%4]))}
      root.add(sp);
      if(k<2){const cn=k?7:9;for(let i=0;i<cn;i++){const a=i/cn*6.283+k,rr=r-.3,g=new T.Group();
        const b=new T.Mesh(new T.SphereGeometry(.13,20,16),M(0xe0203f,{roughness:.15,emissive:0x400010}));b.position.y=.12;g.add(b);
        const st=new T.Mesh(new T.CylinderGeometry(.012,.012,.25,6),M(0x3f7a2e));st.position.set(.03,.3,0);st.rotation.z=-.3;g.add(st);
        g.position.set(Math.sin(a)*rr,top+.07,Math.cos(a)*rr);root.add(g)}}
      const FS=s=>`${s}px`;
      if(k===0)arc(r,y+.4,.42,2.3,(x,W,H)=>fit(x,'Happy Birthday',p=>`400 ${p}px "Great Vibes",cursive`,W,H,'#fff','#c2207a'));
      if(k===1)arc(r,y+.4,.46,1.9,(x,W,H)=>fit(x,'Chuti ♥',p=>`400 ${p}px "Great Vibes",cursive`,W,H,'#5b2a86','#fff'));
      if(k===2)arc(r,y+.36,.5,1.6,(x,W,H)=>fit(x,'24',p=>`700 ${p}px "Cormorant Garamond",serif`,W,H,'#ffd27a','#a02060'));
      tops=top;y=top});
    y3=y+.07;
    const ct=tex(64,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#ff7fb8';for(let i=-2;i<8;i++){x.beginPath();x.moveTo(0,i*20);x.lineTo(w,i*20-20);x.lineTo(w,i*20-4);x.lineTo(0,i*20+16);x.fill()}});ct.wrapS=ct.wrapT=T.RepeatWrapping;
    const ft=tex(128,256,x=>{const g=x.createRadialGradient(64,170,4,64,170,70);g.addColorStop(0,'#fffbe0');g.addColorStop(.35,'#ffc45a');g.addColorStop(1,'rgba(255,90,30,0)');x.fillStyle=g;x.beginPath();x.moveTo(64,10);x.bezierCurveTo(120,110,120,230,64,240);x.bezierCurveTo(8,230,8,110,64,10);x.fill()});
    const gt=glow('rgba(255,200,100,.7)','rgba(255,120,40,0)');
    for(let i=0;i<5;i++){const a=i/5*6.283+.6,cx=Math.sin(a)*.5,cz=Math.cos(a)*.5;
      const c=new T.Mesh(new T.CylinderGeometry(.055,.055,.6,16),M(0xffffff,{map:ct}));c.position.set(cx,y3+.3,cz);root.add(c);
      const wk=new T.Mesh(new T.CylinderGeometry(.008,.008,.08,6),M(0x222222));wk.position.set(cx,y3+.64,cz);root.add(wk);
      const s=new T.Sprite(new T.SpriteMaterial({map:ft,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));s.scale.set(.22,.44,1);s.position.set(cx,y3+.9,cz);root.add(s);
      const g=new T.Sprite(new T.SpriteMaterial({map:gt,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));g.scale.setScalar(1.1);g.position.set(cx,y3+.88,cz);root.add(g);
      let l=null;if(i<2){l=new T.PointLight(0xffa550,.7,3.5);l.position.set(cx,y3+.9,cz);root.add(l)}
      fl.push({s,g,l,x:cx,i})}
    const sh=new T.Shape();sh.moveTo(0,-2.2);sh.bezierCurveTo(-3.6,.4,-2.2,3,0,1.4);sh.bezierCurveTo(2.2,3,3.6,.4,0,-2.2);
    const hg=new T.ExtrudeGeometry(sh,{depth:1.1,bevelEnabled:true,bevelThickness:.5,bevelSize:.45,bevelSegments:6,curveSegments:24});hg.center();
    heart=new T.Mesh(hg,gold);heart.scale.setScalar(.055);heart.position.y=y3+.32;root.add(heart);
    const N=90,P=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*6.283,rr=2.8+Math.random()*2;P.set([Math.sin(a)*rr,Math.random()*4.6,Math.cos(a)*rr],i*3)}
    const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(P,3));
    stars=new T.Points(pg,new T.PointsMaterial({size:.16,map:glow('#fff','rgba(255,255,255,0)'),color:0xffd9a0,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));scn.add(stars);
    smokeTex=glow('rgba(210,195,225,.8)','rgba(210,195,225,0)');
    root.traverse(o=>{if(o.isMesh&&!o.userData.ns){o.castShadow=o.receiveShadow=true}});
    new ResizeObserver(rz).observe(box);
  }
  let tops=0;
  function rz(){if(!ready)return;const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;const f=Math.tan(cam.fov*Math.PI/360),d=Math.max(2.55/f,2.9/(f*cam.aspect));cam.position.set(0,1.9+d*.26,d*.96);cam.lookAt(0,1.8,0);cam.updateProjectionMatrix()}
  function loop(t){
    raf=requestAnimationFrame(loop);const s=t/1000;
    user*=.96;root.rotation.y=Math.sin(s*.5)*.4+user;
    heart.rotation.y=s*1.6;heart.position.y=y3+.32+Math.sin(s*2)*.03;stars.rotation.y=s*.05;
    fl.forEach(f=>{if(f.dead)return;const k=1+Math.sin(s*17+f.i*2)*.07+Math.sin(s*29+f.i)*.05;let sc=bl?.7:1;
      if(outT>=0){const q=Math.min(1,(s-outT)/.35);sc*=1-q;if(q>=1){f.dead=true;f.s.visible=f.g.visible=false;if(f.l)f.l.intensity=0;return}}
      f.s.scale.set(.22*k*sc,.44*k*sc*(bl?.85:1),1);f.g.scale.setScalar(1.1*k*sc);f.s.position.x=f.x+(bl?.04+Math.sin(s*30)*.02:0);
      if(f.l)f.l.intensity=(.6+Math.sin(s*20+f.i)*.15)*sc});
    sm=sm.filter(m=>{m.position.y+=.014;m.scale.multiplyScalar(1.012);m.material.opacity-=.006;if(m.material.opacity<=0){root.remove(m);return false}return true});
    R.render(scn,cam);
  }
  return{
    start(){const go=()=>{if(!ready){build();ready=true}rz();cancelAnimationFrame(raf);if(cur===5)raf=requestAnimationFrame(loop)};
      (document.fonts?Promise.all([document.fonts.load('80px "Great Vibes"','Chuti Happy Birthday'),document.fonts.load('700 80px "Cormorant Garamond"','24')]):Promise.resolve()).catch(()=>{}).then(go)},
    stop(){cancelAnimationFrame(raf)},
    wob(on){bl=on},
    rot(dx){user+=dx*.01},
    out(){outT=performance.now()/1000;fl.forEach(f=>{const m=new T.Sprite(new T.SpriteMaterial({map:smokeTex,transparent:true,opacity:.6,depthWrite:false}));m.position.set(f.x,y3+.75,f.s.position.z||0);m.position.z=f.s.parent?f.s.position.z:0;m.scale.setScalar(.4);root.add(m);sm.push(m)})},
    reset(){outT=-1;bl=false;user=0;fl.forEach(f=>{f.dead=false;f.s.visible=f.g.visible=true});sm.forEach(m=>root.remove(m));sm=[]}
  };
})();
let dn=false,lx=0,mvd=0;
box.addEventListener('pointerdown',e=>{dn=true;lx=e.clientX;mvd=0;try{box.setPointerCapture(e.pointerId)}catch(_){}});
box.addEventListener('pointermove',e=>{if(!dn)return;const dx=e.clientX-lx;lx=e.clientX;mvd+=Math.abs(dx);Cake.rot(dx)});
box.addEventListener('pointerup',()=>{if(dn&&mvd<8)blow();dn=false});box.addEventListener('pointercancel',()=>dn=false);
box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();blow()}});
const cake={blows:0,out:false,cool:0,raf:0,stream:null,ac:null,was:false};
function flowerRain(ms=8000){
  const sh=confetti.shapeFromText?['🌸','🌹','🌷','🌺','💮','🌼'].map(text=>confetti.shapeFromText({text,scalar:4})):undefined,end=Date.now()+ms;
  const iv=setInterval(()=>{if(Date.now()>end)return clearInterval(iv);
    confetti({particleCount:2,angle:90,spread:160,startVelocity:0,gravity:.45,ticks:420,scalar:sh?4:1.2,drift:Math.random()-.5,origin:{x:Math.random(),y:-.05},zIndex:100,...(sh?{shapes:sh}:{colors:COL})})},70);
}
function blow(){
  const now=Date.now();if(cake.out||now<cake.cool)return;cake.cool=now+1600;cake.blows++;
  Cake.wob(true);setTimeout(()=>Cake.wob(false),1100);
  if(cake.blows<3){showPop(cake.blows===1?'තව පොඩ්ඩක් හයියෙන් පිඹින්න චුටී 😚':'ආයෙත් එක පාරක් පිඹින්න චුටී, ඔයාට පුළුවන් 💨');return}
  cake.out=true;clearTimeout(popT);popEl.classList.remove('go');Cake.out();
  setTimeout(()=>{setMsg('මම ඔයාට ගොඩාක් ආදරෙයි චුටී ❤️',true);hintEl.style.display='none';flowerRain();burst();$('#cakeNext').classList.add('show')},700);
  cakeStop(true);
}
async function cakeStart(){
  cake.blows=0;cake.out=false;cake.cool=0;setMsg('');hintEl.style.display='';$('#cakeNext').classList.remove('show');popEl.classList.remove('go');
  Cake.reset();Cake.start();
  cake.was=playing;if(playing)playBtn.click(); // pause the song so the mic only hears the blow
  try{
    const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    if(cur!==5){st.getTracks().forEach(t=>t.stop());return}
    cake.stream=st;cake.ac=new (window.AudioContext||window.webkitAudioContext)();
    const an=cake.ac.createAnalyser();an.fftSize=1024;cake.ac.createMediaStreamSource(st).connect(an);
    const buf=new Float32Array(an.fftSize);let base=0,n=0,loud=0;const t0=performance.now();let last=t0;
    (function loop(){
      if(cur!==5||cake.out)return;cake.raf=requestAnimationFrame(loop);
      an.getFloatTimeDomainData(buf);let sum=0;for(const x of buf)sum+=x*x;const rms=Math.sqrt(sum/buf.length);
      const now=performance.now(),dt=now-last;last=now;
      if(now-t0<700){base+=rms;n++;return}
      const th=Math.max(.04,(base/n)*4+.02);
      if(rms>th){loud+=dt;Cake.wob(true);if(loud>350){loud=0;blow()}}else{loud=Math.max(0,loud-dt*2);if(Date.now()>cake.cool)Cake.wob(false)}
    })();
  }catch(e){hintEl.textContent='Mic එක allow කරලා නෑ, ඒ නිසා කේක් එක touch කරන්න 👆'}
}
function cakeStop(done){
  cancelAnimationFrame(cake.raf);
  if(cake.stream){cake.stream.getTracks().forEach(t=>t.stop());cake.stream=null}
  if(cake.ac){cake.ac.close().catch(()=>{});cake.ac=null}
  if(cake.was&&!playing){cake.was=false;playBtn.click()}
}

/* ===== 6. Music: synth lullaby, or load your own song ===== */
const viz=$('#viz'),bars=[];for(let i=0;i<16;i++){const b=document.createElement('i');viz.appendChild(b);bars.push(b)}
let ctx,master,timer,vt,playing=false,step=0,el=null,an,data;
const notes=[261.6,329.6,392,523.3,392,329.6,293.7,349.2,440,587.3,440,349.2];
function note(f){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(.25,ctx.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.6);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+1.7)}
function start(){
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
  if(!master){master=ctx.createGain();master.gain.value=.5;master.connect(ctx.destination)}
  ctx.resume();
  if(el){el.play().catch(()=>{playing=false;playBtn.textContent='▶';stop()});vt=setInterval(()=>{an.getByteFrequencyData(data);bars.forEach((b,i)=>b.style.height=(4+data[i%data.length]/255*24)+'px')},60);return}
  timer=setInterval(()=>note(notes[step++%notes.length]),520);
  vt=setInterval(()=>bars.forEach((b,i)=>b.style.height=(4+Math.abs(Math.sin(Date.now()/260+i))*Math.random()*24)+'px'),120);
}
function stop(){if(el)el.pause();clearInterval(timer);clearInterval(vt);bars.forEach(b=>b.style.height='4px')}
const playBtn=$('#play');
playBtn.onclick=()=>{playing=!playing;playBtn.textContent=playing?'❚❚':'▶';playBtn.setAttribute('aria-label',playing?'Pause music':'Play music');playing?start():stop()};
function loadSong(url,name){
  if(playing)playBtn.click();
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
  const a=new Audio(url);a.loop=true;
  a.addEventListener('error',()=>{if(el===a){el=null;$('#sname').textContent='Birthday melody'}}); // missing file: fall back to synth melody
  const src=ctx.createMediaElementSource(a);an=ctx.createAnalyser();an.fftSize=64;data=new Uint8Array(an.frequencyBinCount);src.connect(an);an.connect(ctx.destination);
  el=a;$('#sname').textContent=name.slice(0,20);
}
let userPaused=false;
playBtn.addEventListener('click',e=>{if(e.isTrusted)userPaused=!playing});
$('#song').onchange=e=>{const f=e.target.files[0];if(f)loadSong(URL.createObjectURL(f),f.name)};
if(CONFIG.song)loadSong(CONFIG.song,CONFIG.songTitle||'Our song');

/* ===== 7. Text animation helpers + finale petals ===== */
function splitText(el){let k=0;const walk=n=>[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();
  c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.append(' ');return}const s=document.createElement('span');s.className='wd';
    chars(w).forEach(ch=>{const i=document.createElement('span');i.className='ch';i.setAttribute('aria-hidden','true');i.textContent=ch;i.style.setProperty('--i',k++);s.append(i)});f.append(s)});c.replaceWith(f)}else walk(c)});
  el.setAttribute('aria-label',el.textContent);walk(el)}
$$('h1,.shim').forEach(splitText);
scenes.forEach(s=>[...s.children].forEach((c,i)=>c.style.setProperty('--k',i)));
function petals(){const s=$('#s7');$$('#s7 .petal').forEach(p=>p.remove());for(let i=0;i<26;i++){const p=document.createElement('span');p.className='petal';p.textContent=['🌸','💮','🌷','♥'][i%4];p.style.cssText=`left:${Math.random()*100}%;font-size:${14+Math.random()*18}px;animation-duration:${7+Math.random()*7}s;animation-delay:${-Math.random()*10}s`;s.appendChild(p)}}
