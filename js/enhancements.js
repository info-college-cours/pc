(function(){
  "use strict";

  /* ---------- Mode sombre (mémorisé) ---------- */
  const root=document.documentElement, btn=document.getElementById('themeToggle');
  const apply=t=>{root.setAttribute('data-theme',t);if(btn){btn.textContent=t==='dark'?'☀️':'🌙';btn.setAttribute('aria-pressed',t==='dark');}try{localStorage.setItem('siteTheme',t)}catch(e){}};
  let theme='light';
  try{theme=localStorage.getItem('siteTheme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}
  apply(theme);
  if(btn)btn.addEventListener('click',()=>apply(root.getAttribute('data-theme')==='dark'?'light':'dark'));

  /* ---------- Lien actif dans la navigation ---------- */
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.nav-inner a').forEach(a=>{
    const href=(a.getAttribute('href')||'').toLowerCase();
    if(href===page)a.setAttribute('aria-current','page');
  });

  /* ---------- Bouton retour en haut ---------- */
  const topBtn=document.createElement('button');
  topBtn.className='to-top';topBtn.type='button';topBtn.textContent='↑';
  topBtn.setAttribute('aria-label','Retour en haut de page');
  document.body.appendChild(topBtn);
  addEventListener('scroll',()=>topBtn.classList.toggle('show',scrollY>400),{passive:true});
  topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

  /* ---------- Quiz : barre de progression + sauvegarde locale ---------- */
  const quiz=document.getElementById('quiz');
  if(!quiz)return;
  const total=20, KEY='quizAnswers';
  const bar=document.createElement('div');
  bar.className='quiz-progress';
  bar.innerHTML='<div class="quiz-progress-fill"></div><span class="quiz-progress-text" role="status"></span>';
  quiz.parentNode.insertBefore(bar,quiz);
  const fill=bar.querySelector('.quiz-progress-fill'),txt=bar.querySelector('.quiz-progress-text');

  function update(){
    const names=new Set([...quiz.querySelectorAll('input:checked')].map(i=>i.name));
    if(quiz.querySelector('.component-tile.selected'))names.add('q5');
    fill.style.width=(names.size/total*100)+'%';
    txt.textContent=names.size+' / '+total+' questions traitées';
  }
  function save(){
    const d={};
    quiz.querySelectorAll('input:checked').forEach(i=>{(d[i.name]=d[i.name]||[]).push(i.value)});
    try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}
  }
  /* Restaurer les réponses d'une visite précédente */
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
    Object.entries(saved).forEach(([name,vals])=>{
      if(name==='q5'){
        const t=quiz.querySelector('.component-tile[data-q5="'+vals[0]+'"]');
        if(t)t.click(); /* déclenche aussi la sélection interne du quiz */
        return;
      }
      vals.forEach(v=>{const i=quiz.querySelector('input[name="'+name+'"][value="'+v+'"]');if(i)i.checked=true;});
    });
  }catch(e){}
  quiz.addEventListener('change',()=>{save();update()});
  quiz.addEventListener('click',e=>{if(e.target.closest('.component-tile')){save();update()}});
  const reset=document.getElementById('resetQuiz');
  if(reset)reset.addEventListener('click',()=>{try{localStorage.removeItem(KEY)}catch(e){}update();});
  update();
})();
