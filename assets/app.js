(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// 테마
$$('[data-theme-toggle]').forEach(b=>b.onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}});
// 읽기 진행바
const bar=$('#progress');addEventListener('scroll',()=>{const h=document.documentElement,m=h.scrollHeight-h.clientHeight;bar.style.width=(m>0?h.scrollTop/m*100:0)+'%'},{passive:true});
// 검색
const IDX=window.__IDX||[],R=window.ROOT||'',dlg=$('#search'),inp=$('#q'),res=$('#results');let sel=0,hits=[];
function run(){const ts=inp.value.toLowerCase().split(/\s+/).filter(Boolean);
 hits=ts.length?IDX.map(p=>{let s=0;for(const t of ts){const a=5*p.t.toLowerCase().includes(t)+3*p.g.toLowerCase().includes(t)+2*p.d.toLowerCase().includes(t)+p.x.toLowerCase().includes(t);if(!a)return null;s+=a}return[p,s]}).filter(Boolean).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]):IDX.slice(0,6);
 sel=0;draw()}
function draw(){res.innerHTML=hits.length?hits.map((p,i)=>`<li class="${i===sel?'on':''}"><a href="${R+p.u}"><small>${esc(p.c)}</small><b>${esc(p.t)}</b><small>${esc(p.d)}</small></a></li>`).join(''):'<li class="empty">검색 결과가 없습니다.</li>'}
function open(q){dlg.hidden=false;inp.value=q||'';inp.focus();run();document.body.style.overflow='hidden'}
function close(){dlg.hidden=true;document.body.style.overflow=''}
$$('[data-open-search]').forEach(b=>b.onclick=()=>open());
inp.oninput=run;dlg.onclick=e=>{if(e.target===dlg)close()};
addEventListener('keydown',e=>{
 const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}
 else if(e.key==='/'&&!typing&&dlg.hidden){e.preventDefault();open()}
 else if(!dlg.hidden){
  if(e.key==='Escape')close();
  else if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,hits.length-1);draw()}
  else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0);draw()}
  else if(e.key==='Enter'&&hits[sel])location.href=R+hits[sel].u}});
const q0=new URLSearchParams(location.search).get('q');if(q0)open(q0);
// 목차 스크롤 추적
const heads=$$('.content h2[id]');if(heads.length&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('.toc a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-80px 0px -70% 0px'});heads.forEach(h=>io.observe(h))}
// 여러 줄 코드 → 코드블록 + 복사 버튼
$$('.content p > code').forEach(c=>{if(!/<br/i.test(c.innerHTML))return;
 const t=document.createElement('div');t.innerHTML=c.innerHTML.replace(/<br\s*\/?>/gi,'\n');const txt=t.textContent;
 const w=document.createElement('div');w.className='codeblock';w.innerHTML='<button type="button">복사</button><pre><code></code></pre>';
 $('code',w).textContent=txt;const b=$('button',w);
 b.onclick=async()=>{try{await navigator.clipboard.writeText(txt);b.textContent='복사됨'}catch(e){b.textContent='복사 실패'}setTimeout(()=>b.textContent='복사',1500)};
 c.parentElement.replaceWith(w)});
// 전기 계산기
const num=(f,n)=>{const v=f.elements[n].value;return v===''?null:parseFloat(v)},fmt=x=>Number.isFinite(x)?String(+x.toPrecision(5)):'—';
const calc={
 ohm(f){const g=n=>num(f,n);if(['v','i','r','p'].filter(n=>g(n)!==null).length!==2)return'네 값 중 아는 두 가지만 입력하세요.';
  let V=g('v'),I=g('i'),R=g('r'),P=g('p');
  if(V!==null&&I!==null){R=V/I;P=V*I}else if(V!==null&&R!==null){I=V/R;P=V*V/R}else if(V!==null&&P!==null){I=P/V;R=V*V/P}
  else if(I!==null&&R!==null){V=I*R;P=I*I*R}else if(I!==null&&P!==null){V=P/I;R=P/(I*I)}else{V=Math.sqrt(P*R);I=Math.sqrt(P/R)}
  return`V = ${fmt(V)} [V] · I = ${fmt(I)} [A] · R = ${fmt(R)} [Ω] · P = ${fmt(P)} [W]`},
 three(f){const V=num(f,'v'),I=num(f,'i'),c=num(f,'c');if([V,I,c].includes(null))return'선간전압·전류·역률을 모두 입력하세요.';if(c<0||c>1)return'역률은 0~1 사이 값입니다.';
  const S=Math.sqrt(3)*V*I;return`피상 S = ${fmt(S/1e3)} [kVA] · 유효 P = ${fmt(S*c/1e3)} [kW] · 무효 Q = ${fmt(S*Math.sqrt(1-c*c)/1e3)} [kVar]`},
 drop(f){const K=parseFloat(f.elements.k.value),L=num(f,'l'),I=num(f,'i'),A=num(f,'a');if([L,I,A].includes(null)||A<=0)return'길이·전류·단면적을 입력하세요.';
  return`전압강하 e = ${fmt(K*L*I/(1000*A))} [V]`}};
$$('form.calc').forEach(f=>{const o=$('output',f),go=()=>o.textContent=calc[f.dataset.calc](f);f.addEventListener('input',go);f.onsubmit=e=>{e.preventDefault();go()};go()});
})();
