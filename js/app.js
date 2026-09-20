// JavaScript commun du site Informatique.

document.addEventListener("DOMContentLoaded", () => {
  const DAYS = [
    {key:"monday", label:"Lundi", classes:["الثالثة 4", "الثالثة 6"]},
    {key:"tuesday", label:"Mardi", classes:["الثالثة 7", "الثالثة 5"]},
    {key:"wednesday", label:"Mercredi", classes:["الثالثة 3", "الثالثة 2"]},
    {key:"thursday", label:"Jeudi", classes:["الثالثة 10", "الثالثة 1"]},
    {key:"friday", label:"Vendredi", classes:["الثالثة 8"]},
    {key:"saturday", label:"Samedi", classes:["الثالثة 11", "الثالثة 9"]}
  ];

  // Groupe actif de la semaine.
  // IMPORTANT : les élèves ne peuvent pas modifier ces valeurs depuis la page publique.
  // Pour la semaine suivante, le professeur change simplement 1 en 2 (ou 2 en 1) ici.
  const WEEK_GROUP = {
    "الثالثة 4": 1, "الثالثة 6": 1,
    "الثالثة 7": 1, "الثالثة 5": 1,
    "الثالثة 3": 1, "الثالثة 2": 1,
    "الثالثة 10": 1, "الثالثة 1": 1,
    "الثالثة 8": 1,
    "الثالثة 11": 1, "الثالثة 9": 1
  };

  // Affichage du programme du jour sur l'accueil.
  const today = document.getElementById("todaySchedule");
  if (today) {
    const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const dayKey = dayKeys[new Date().getDay()];
    const day = DAYS.find(d => d.key === dayKey);
    if (day) {
      today.innerHTML = day.classes.map(c => `<span dir="rtl"><b>${c}</b> — Groupe ${WEEK_GROUP[c]}</span>`).join("<br>");
    } else {
      today.textContent = "Pas de cours de groupe aujourd'hui.";
    }
  }

  const view = document.getElementById("scheduleView");
  if (!view) return;

  function isToday(index) {
    return new Date().getDay() - 1 === index;
  }

  view.innerHTML = DAYS.map((day, index) => {
    const cards = day.classes.map(className => {
      const active = WEEK_GROUP[className] || 1;
      const inactive = active === 1 ? 2 : 1;
      return `
        <div class="schedule-class-card">
          <div class="class-title" dir="rtl">${className}</div>
          <div class="class-groups">
            <span class="group-pill ${active === 1 ? "active-group" : "inactive-group"}">Groupe 1${active === 1 ? " · cette semaine" : ""}</span>
            <span class="group-pill group-2 ${active === 2 ? "active-group" : "inactive-group"}">Groupe 2${active === 2 ? " · cette semaine" : ""}</span>
          </div>
        </div>`;
    }).join("");

    return `<div class="schedule-day ${isToday(index) ? "is-today" : ""}">
      <div class="schedule-day-title">
        <span class="day">${day.label}</span>
        ${isToday(index) ? '<span class="today-dot">Aujourd’hui</span>' : ""}
      </div>
      <div class="schedule-classes">${cards}</div>
    </div>`;
  }).join("");

  const todayIndex = new Date().getDay() - 1;
  const banner = document.getElementById("todayBanner");
  if (banner) {
    if (todayIndex >= 0 && todayIndex <= 5) {
      const day = DAYS[todayIndex];
      banner.innerHTML = `<span class="pulse"></span><div><small>AUJOURD'HUI · ${day.label}</small><strong>${day.classes.map(c => `<span dir="rtl">${c} — Groupe ${WEEK_GROUP[c]}</span>`).join(" &nbsp; | &nbsp; ")}</strong></div>`;
    } else {
      banner.innerHTML = `<span>📅</span><div><small>WEEK-END</small><strong>Le programme reprend lundi.</strong></div>`;
    }
  }
});

function loadSchedule(fallback, days) {
  try {
    const saved = JSON.parse(localStorage.getItem("informatiqueSchedule") || "null");
    if (saved && typeof saved === "object") {
      const migrated = {};
      days.forEach(day => {
        const fresh = fallback[day.key];
        const old = saved[day.key];
        if (old && Array.isArray(old.classes)) {
          migrated[day.key] = {classes: old.classes.slice(0, day.classCount)};
          while (migrated[day.key].classes.length < day.classCount) {
            const candidate = fresh.classes[migrated[day.key].classes.length];
            migrated[day.key].classes.push(candidate || fallback.monday.classes[0]);
          }
        } else if (old && old.group1 && old.group2) {
          // Migration de la version précédente : les deux classes deviennent deux classes,
          // chacune possédant désormais Groupe 1 et Groupe 2.
          migrated[day.key] = {classes: day.classCount === 1 ? [old.group1] : [old.group1, old.group2]};
        } else if (old && old.className) {
          migrated[day.key] = {classes: day.classCount === 1 ? [old.className] : [old.className, fresh.classes[1]]};
        } else {
          migrated[day.key] = fresh;
        }
      });
      return migrated;
    }
  } catch (_) {}
  return fallback;
}
