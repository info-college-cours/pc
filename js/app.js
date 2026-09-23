document.addEventListener("DOMContentLoaded", async () => {
  const DAYS = [
    {key:"monday", label:"Lundi", classes:["الثالثة 4","الثالثة 6"]},
    {key:"tuesday", label:"Mardi", classes:["الثالثة 7","الثالثة 5"]},
    {key:"wednesday", label:"Mercredi", classes:["الثالثة 3","الثالثة 2"]},
    {key:"thursday", label:"Jeudi", classes:["الثالثة 10","الثالثة 1"]},
    {key:"friday", label:"Vendredi", classes:["الثالثة 8"]},
    {key:"saturday", label:"Samedi", classes:["الثالثة 11","الثالثة 9"]}
  ];
  const dayNames=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const todayISO=()=>{const d=new Date(); const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
  let data;
  try { data = await fetch('data/groups.json?cb=1').then(r=>r.json()); } catch(e){ data={sessions:[],holidays:[]}; }
  const saved=localStorage.getItem('groupsData');
  if(saved){try{data=JSON.parse(saved)}catch(e){}}
  const sessions=data.sessions||[];
  const holidays=data.holidays||[];
  const today=todayISO();
  const holiday=holidays.find(h=>today>=h.start&&today<=h.end);
  const sessionToday=sessions.filter(s=>s.date===today);
  const nextSession=sessions.filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];

  const todayResult=document.getElementById('todaySchedule');
  if(todayResult){
    if(holiday) todayResult.innerHTML=`<span class="holiday-pill">🔴 ${holiday.name}</span><small>Pas de cours aujourd'hui.</small>`;
    else if(sessionToday.length) todayResult.innerHTML=sessionToday.map(s=>`<span><b dir="rtl">${s.class}</b> — <strong class="group-${s.group}">Groupe ${s.group}</strong></span>`).join('');
    else todayResult.textContent='Pas de séance de groupe aujourd’hui.';
  }
  const view=document.getElementById('scheduleView');
  if(view){
    const filter=document.getElementById('classFilter');
    const render=()=>{
      const selected=filter?.value||'all';
      const filtered=sessions.filter(s=>selected==='all'||s.class===selected).sort((a,b)=>a.date.localeCompare(b.date));
      const byDate={}; filtered.forEach(s=>(byDate[s.date]??=[]).push(s));
      const dates=Object.keys(byDate);
      view.innerHTML=dates.length?dates.map(date=>{
        const d=new Date(date+'T12:00:00'); const h=holidays.find(x=>date>=x.start&&date<=x.end);
        return `<div class="schedule-day ${date===today?'is-today':''} ${h?'is-holiday':''}"><div class="schedule-day-title"><span class="day">${dayNames[d.getDay()]}</span><span>${d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}</span>${date===today?'<span class="today-dot">Aujourd’hui</span>':''}</div><div class="schedule-classes">${h?`<div class="holiday-row">🔴 ${h.name} — aucune séance</div>`:byDate[date].map(s=>`<div class="schedule-class-card"><div class="class-title" dir="rtl">${s.class}</div><div class="active-class-group group-${s.group}">✓ Groupe ${s.group}</div></div>`).join('')}</div></div>`;
      }).join(''):'<div class="empty-state">Aucune séance enregistrée pour ce filtre.</div>';
    };
    const classes=[...new Set(sessions.map(s=>s.class))].sort((a,b)=>a.localeCompare(b,'ar'));
    if(filter){classes.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;filter.appendChild(o)});filter.addEventListener('change',render)}
    render();
  }
  const banner=document.getElementById('todayBanner');
  if(banner){
    banner.innerHTML=holiday?`<span>🔴</span><div><small>AUJOURD'HUI</small><strong>${holiday.name}</strong></div>`:sessionToday.length?`<span class="pulse"></span><div><small>AUJOURD'HUI · ${dayNames[new Date().getDay()]}</small><strong>${sessionToday.map(s=>`<span dir="rtl">${s.class} — Groupe ${s.group}</span>`).join(' &nbsp; | &nbsp; ')}</strong></div>`:`<span>📅</span><div><small>AUJOURD'HUI</small><strong>Pas de séance de groupe.</strong></div>`;
  }
  const holidayList=document.getElementById('holidayList');
  if(holidayList){ holidayList.innerHTML=holidays.length?holidays.map(h=>`<div class="holiday-item"><span>🔴</span><div><strong>${h.name}</strong><small>${h.start===h.end?h.start:`Du ${h.start} au ${h.end}`}</small></div></div>`).join(''):'<div class="empty-state">Aucune période enregistrée.</div>'; }
  const next=document.getElementById('nextSession');
  if(next&&nextSession) next.innerHTML=`<b>Prochaine séance</b><span>${nextSession.date} · <span dir="rtl">${nextSession.class}</span> · Groupe ${nextSession.group}</span>`;
});
