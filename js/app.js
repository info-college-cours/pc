document.addEventListener("DOMContentLoaded", () => {
  const DAYS = [
    {key:"monday", label:"Lundi", classes:["الثالثة 4","الثالثة 6"]},
    {key:"tuesday", label:"Mardi", classes:["الثالثة 7","الثالثة 5"]},
    {key:"wednesday", label:"Mercredi", classes:["الثالثة 3","الثالثة 2"]},
    {key:"thursday", label:"Jeudi", classes:["الثالثة 10","الثالثة 1"]},
    {key:"friday", label:"Vendredi", classes:["الثالثة 8"]},
    {key:"saturday", label:"Samedi", classes:["الثالثة 11","الثالثة 9"]}
  ];

  // Semaine de référence : Groupe 1. La semaine suivante passe automatiquement au Groupe 2,
  // puis revient au Groupe 1, etc. Les élèves n'ont aucun réglage à modifier.
  const REFERENCE_ISO_WEEK = 39;
  const REFERENCE_YEAR = 2026;

  function isoWeek(date){
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d-yearStart)/86400000)+1)/7);
  }

  function activeGroup(){
    const now = new Date();
    const year = now.getFullYear();
    const week = isoWeek(now);
    const weekDelta = (year - REFERENCE_YEAR) * 52 + (week - REFERENCE_ISO_WEEK);
    return ((weekDelta % 2) + 2) % 2 === 0 ? 1 : 2;
  }

  const WEEK_GROUP = activeGroup();

  const today = document.getElementById("todaySchedule");
  const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const dayKey = dayKeys[new Date().getDay()];
  const todayDay = DAYS.find(d => d.key === dayKey);
  if(today){
    if(todayDay){
      today.innerHTML = todayDay.classes.map(c => `<span dir="rtl"><b>${c}</b> — Groupe ${WEEK_GROUP}</span>`).join("");
    } else today.textContent = "Pas de cours de groupe aujourd'hui.";
  }

  const view = document.getElementById("scheduleView");
  if(!view) return;

  view.innerHTML = DAYS.map((day,index) => {
    const jsDay = index + 1;
    const isToday = new Date().getDay() === jsDay;
    const cards = day.classes.map(className => `
      <div class="schedule-class-card">
        <div class="class-title" dir="rtl">${className}</div>
        <div class="class-groups">
          <span class="group-pill ${WEEK_GROUP===1?'active-group':'inactive-group'}">Groupe 1${WEEK_GROUP===1?' · cette semaine':''}</span>
          <span class="group-pill ${WEEK_GROUP===2?'active-group':'inactive-group'}">Groupe 2${WEEK_GROUP===2?' · cette semaine':''}</span>
        </div>
      </div>`).join("");
    return `<div class="schedule-day ${isToday?'is-today':''} ${day.classes.length===1?'single-class-day':''}">
      <div class="schedule-day-title"><span class="day">${day.label}</span>${isToday?'<span class="today-dot">Aujourd’hui</span>':''}</div>
      <div class="schedule-classes">${cards}</div>
    </div>`;
  }).join("");

  const banner = document.getElementById("todayBanner");
  if(banner){
    const idx = new Date().getDay()-1;
    if(idx>=0 && idx<6){
      const day=DAYS[idx];
      banner.innerHTML=`<span class="pulse"></span><div><small>AUJOURD'HUI · ${day.label}</small><strong>${day.classes.map(c=>`<span dir="rtl">${c} — Groupe ${WEEK_GROUP}</span>`).join(" &nbsp; | &nbsp; ")}</strong></div>`;
    }else banner.innerHTML=`<span>📅</span><div><small>WEEK-END</small><strong>Le programme reprend lundi.</strong></div>`;
  }
});
