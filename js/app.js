document.addEventListener('DOMContentLoaded', async () => {
  const scheduleView = document.getElementById('scheduleView');
  if (!scheduleView) return;

  const CLASSES = ['الثالثة 1','الثالثة 2','الثالثة 3','الثالثة 4','الثالثة 5','الثالثة 6','الثالثة 7','الثالثة 8','الثالثة 9','الثالثة 10','الثالثة 11'];
  const WEEKLY = {
    1:['الثالثة 4','الثالثة 6'], 2:['الثالثة 7','الثالثة 5'], 3:['الثالثة 3','الثالثة 2'],
    4:['الثالثة 10','الثالثة 1'], 5:['الثالثة 8'], 6:['الثالثة 11','الثالثة 9']
  };
  const DAY_NAMES = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const START_DATE = '2026-09-21'; // première semaine de rotation: Groupe 1

  // Vacances scolaires 2026/2027 + jours fériés fixes connus.
  // Les fêtes religieuses à date lunaire peuvent être ajoutées depuis l'espace professeur.
  const HOLIDAY_RANGES = [
    ['2026-10-18','2026-10-25'],
    ['2026-12-06','2026-12-13'],
    ['2027-01-24','2027-01-31'],
    ['2027-03-21','2027-03-28'],
    ['2027-05-09','2027-05-16']
  ];
  const FIXED_HOLIDAYS = ['2026-10-31','2026-11-06','2026-11-18','2027-01-01','2027-01-11','2027-01-14','2027-05-01'];

  const iso = d => {
    const x = new Date(d); x.setHours(12,0,0,0);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  };
  const fromIso = s => new Date(s + 'T12:00:00');
  const inRange = (date, a, b) => date >= a && date <= b;
  const isHoliday = date => FIXED_HOLIDAYS.includes(date) || HOLIDAY_RANGES.some(([a,b]) => inRange(date,a,b));

  function scheduleForDate(date, overrides) {
    const d = fromIso(date), dow = d.getDay();
    if (dow === 0 || !WEEKLY[dow] || date < START_DATE || isNoCourse(date)) return [];
    const result = [];
    for (const classe of WEEKLY[dow]) {
      const override = overrides.find(x => x.date === date && x.classe === classe);
      if (override) result.push({date, classe, groupe:+override.groupe, manual:true});
      else result.push({date, classe, groupe:automaticGroup(classe, date, overrides), manual:false});
    }
    return result;
  }

  // Le numéro de séance réelle de chaque classe détermine le groupe.
  // Une semaine sans cours / un jour férié ne fait donc pas avancer l'alternance.
  function automaticGroup(classe, date, overrides) {
    let count = 0;
    const start = fromIso(START_DATE), end = fromIso(date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
      const s = iso(d), dow = d.getDay();
      if (dow === 0 || s > date || isNoCourse(s) || !(WEEKLY[dow]||[]).includes(classe)) continue;
      const manual = overrides.find(x => x.date === s && x.classe === classe);
      // Une séance enregistrée manuellement compte comme une séance réelle,
      // mais son groupe remplace seulement le choix automatique de cette date.
      count++;
    }
    return count % 2 === 1 ? 1 : 2;
  }

  let overrides = [];
  let closedDates = [];
  try {
    const payload = JSON.parse(localStorage.getItem('groupsPayload') || 'null');
    if (payload && !Array.isArray(payload)) { overrides = Array.isArray(payload.overrides) ? payload.overrides : []; closedDates = Array.isArray(payload.closedDates) ? payload.closedDates : []; }
    else { const saved = JSON.parse(localStorage.getItem('groupsData') || '[]'); if (Array.isArray(saved)) overrides = saved; }
  } catch(e) {}
  const isClosedExtra = date => closedDates.some(x => x.date === date);
  const oldIsHoliday = isHoliday;
  // Les exceptions ajoutées par le professeur s'ajoutent aux vacances officielles.
  const isNoCourse = date => oldIsHoliday(date) || isClosedExtra(date);

  // Après publication, le fichier groups.json permet de partager les exceptions
  // avec tous les élèves. En cas d'échec, la prévisualisation locale reste utilisable.
  try {
    const response = await fetch('data/groups.json', {cache:'no-store'});
    if (response.ok) {
      const remote = await response.json();
      if (Array.isArray(remote)) overrides = remote;
      else if (remote && typeof remote === 'object') { overrides = Array.isArray(remote.overrides) ? remote.overrides : []; closedDates = Array.isArray(remote.closedDates) ? remote.closedDates : []; }
    }
  } catch(e) {}

  const today = new Date();
  const todayIso = iso(today);
  const todayRows = scheduleForDate(todayIso, overrides);
  const todayBanner = document.getElementById('todayBanner');
  if (todayBanner) {
    if (todayRows.length) {
      todayBanner.innerHTML = `<span class="pulse"></span><div><small>AUJOURD'HUI · ${DAY_NAMES[today.getDay()]}</small><strong>${todayRows.map(r=>r.classe+' — Groupe '+r.groupe).join(' &nbsp; | &nbsp; ')}</strong></div>`;
    } else {
      todayBanner.innerHTML = `<span>📅</span><div><small>AUJOURD'HUI</small><strong>Aucune séance pour aujourd’hui.</strong></div>`;
    }
  }

  const start = fromIso(START_DATE);
  const end = new Date(start); end.setMonth(end.getMonth()+10);
  const all = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const rows = scheduleForDate(iso(d), overrides);
    all.push(...rows);
  }
  all.sort((a,b)=>a.date.localeCompare(b.date)||a.classe.localeCompare(b.classe));

  const grouped = {};
  all.forEach(r => (grouped[r.date] ||= []).push(r));
  scheduleView.innerHTML = Object.entries(grouped).map(([date, rows]) => {
    const d = fromIso(date);
    return `<div class="schedule-day"><div class="schedule-day-title"><span class="day">${date}</span><span>${DAY_NAMES[d.getDay()]}</span></div><div class="schedule-classes">${rows.map(r=>`<div class="schedule-class-card"><div class="class-title" dir="rtl">${r.classe}</div><div class="active-class-group ${r.manual?'manual-group':''}">✓ Groupe ${r.groupe}${r.manual?' · modification professeur':''}</div></div>`).join('')}</div></div>`;
  }).join('') || '<div class="empty">Aucune séance à afficher.</div>';

  // Boutons des exercices: correction question par question + explication.
  const quiz = document.getElementById('quiz');
  if (!quiz) return;
  const answers = {
    q1:'b', q2:'a', q3:'b', q4:'a', q5:'2', q6:'2', q7:'3', q8:'6', q9:'4',
    q10:'a', q11:'b', q12:'C', q13:'a', q14:'v', q15:'a', q16:'b', q17:'a', q19:'b', q20:'v'
  };
  const multiAnswers = {q18:['hardware','software']};
  const explanations = {
    q1:'L’information est un ensemble de données ayant un sens.', q2:'Traiter une information consiste à lui appliquer des opérations pour obtenir des résultats.',
    q3:'L’informatique étudie le traitement automatique des informations.', q4:'Un ordinateur est une machine qui permet le traitement automatique des informations.',
    q5:'Le composant correspondant au repère n°2 est le processeur. Dans les images ci-dessous, il s’agit de l’image n°2.', q6:'Le processeur (CPU) est le composant n°2.', q7:'La mémoire vive (RAM) est le composant n°3.', q8:'Le disque SSD est le composant n°6.', q9:'La carte graphique (GPU) est le composant n°4.',
    q10:'Le clavier envoie des informations vers l’ordinateur : c’est une entrée.', q11:'L’écran restitue l’information : c’est une sortie.', q12:'La clé USB (C) est un support de stockage.',
    q13:'La caméra capte des informations : c’est une entrée.', q14:'Une imprimante restitue l’information sur papier : c’est une sortie.',
    q15:'Un logiciel est un ensemble de programmes donnant des commandes à la machine.', q16:'Windows et Linux sont des systèmes d’exploitation.', q17:'Word et PowerPoint sont des logiciels d’application.',
    q18:'Un système informatique comprend une partie matérielle (Hardware) et une partie logicielle (Software).', q19:'Un système informatique permet de conserver, traiter et transmettre l’information.',
    q20:'Le Hardware correspond aux éléments physiques de l’ordinateur.'
  };
  const correctText = {q1:'une information',q2:'appliquer des opérations aux données',q3:'la science du traitement automatique de l’information',q4:'le traitement automatique des informations',q5:'2 — image du processeur',q6:'2',q7:'3',q8:'6',q9:'4',q10:'d’entrée',q11:'de sortie',q12:'C — Clé USB',q13:'d’entrée',q14:'Vrai',q15:'un ensemble de programmes',q16:'des systèmes d’exploitation',q17:'des logiciels d’application',q18:'Hardware + Software',q19:'conserver, traiter et transmettre l’information',q20:'Vrai'};

  let q5Selected = null;
  quiz.querySelectorAll('.component-tile[data-q5]').forEach(tile=>{
    tile.addEventListener('click',()=>{
      quiz.querySelectorAll('.component-tile[data-q5]').forEach(t=>t.classList.remove('selected'));
      tile.classList.add('selected');
      q5Selected = tile.dataset.q5;
    });
  });
  function valuesFor(q){
    if(q==='q5') return q5Selected ? [q5Selected] : [];
    return [...quiz.querySelectorAll(`input[name="${q}"]:checked`)].map(x=>x.value);
  }
  function isCorrect(q){
    if (multiAnswers[q]) {
      const v = valuesFor(q).sort(), e = [...multiAnswers[q]].sort();
      return v.length===e.length && v.every((x,i)=>x===e[i]);
    }
    return valuesFor(q)[0] === answers[q];
  }
  function showFeedback(q, ok, unanswered=false){
    const section = q==='q5' ? quiz.querySelector('.question:nth-of-type(5)') : quiz.querySelector(`[name="${q}"]`)?.closest('.question');
    if(!section) return;
    let box = section.querySelector('.question-feedback');
    if(!box){ box=document.createElement('div'); box.className='question-feedback'; section.appendChild(box); }
    box.className='question-feedback '+(ok?'is-correct':'is-wrong');
    box.innerHTML = ok ? `✅ Correct !` : `❌ ${unanswered?'Aucune réponse. ':''}<strong>Réponse : ${correctText[q]}</strong><br><span>${explanations[q]||''}</span>`;
  }

  quiz.addEventListener('submit', function(e){
    e.preventDefault();
    let score=0, total=Object.keys(answers).length+Object.keys(multiAnswers).length;
    [...Object.keys(answers),...Object.keys(multiAnswers)].forEach(q=>{
      const vals=valuesFor(q), ok=isCorrect(q); if(ok) score++;
      showFeedback(q, ok, vals.length===0);
    });
    const box=document.getElementById('quizResult'); box.hidden=false;
    const percent=Math.round(score/total*100);
    let message='Relis les explications en rouge et réessaie.';
    if(score===total) message='Excellent ! Toutes les réponses sont correctes 🎉';
    else if(score>=16) message='Très bien ! Quelques notions restent à revoir.';
    else if(score>=12) message='Bon travail ! Continue à t’entraîner.';
    box.innerHTML=`<strong>${score}/${total}</strong><span>${percent}% — ${message}</span>`;
    box.className='quiz-result '+(score===total?'success':'partial');
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  document.getElementById('resetQuiz')?.addEventListener('click',()=>{
    quiz.reset(); quiz.querySelectorAll('.question-feedback').forEach(x=>x.remove());
    const box=document.getElementById('quizResult'); box.hidden=true; window.scrollTo({top:0,behavior:'smooth'});
  });
});
