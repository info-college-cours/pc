// JavaScript commun du site Informatique.

document.addEventListener("DOMContentLoaded", () => {
  const DAYS = [
    {key:"monday", label:"Lundi"},
    {key:"tuesday", label:"Mardi"},
    {key:"wednesday", label:"Mercredi"},
    {key:"thursday", label:"Jeudi"},
    {key:"friday", label:"Vendredi"},
    {key:"saturday", label:"Samedi"}
  ];
  const CLASSES = Array.from({length: 11}, (_, i) => `الثالثة ${i + 1}`);

  // Deux classes chaque jour : une pour le Groupe 1 et une pour le Groupe 2.
  const defaultSchedule = {
    monday:    {group1:"الثالثة 1",  group2:"الثالثة 2"},
    tuesday:   {group1:"الثالثة 3",  group2:"الثالثة 4"},
    wednesday: {group1:"الثالثة 5",  group2:"الثالثة 6"},
    thursday:  {group1:"الثالثة 7",  group2:"الثالثة 8"},
    friday:    {group1:"الثالثة 9",  group2:"الثالثة 10"},
    saturday:  {group1:"الثالثة 11", group2:"الثالثة 1"}
  };

  const schedule = loadSchedule(defaultSchedule);

  // Affichage du programme du jour sur l'accueil.
  const today = document.getElementById("todaySchedule");
  if (today) {
    const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const day = dayKeys[new Date().getDay()];
    if (schedule[day]) {
      today.innerHTML = `Groupe 1 : <b dir="rtl">${schedule[day].group1}</b><br>Groupe 2 : <b dir="rtl">${schedule[day].group2}</b>`;
    } else {
      today.textContent = "Pas de cours de groupe aujourd'hui.";
    }
  }

  const editBtn = document.getElementById("editBtn");
  if (!editBtn) return;

  const editor = document.getElementById("scheduleEditor");
  const editorRows = document.getElementById("editorRows");
  const saveBtn = document.getElementById("saveBtn");

  function isToday(index) {
    return new Date().getDay() - 1 === index;
  }

  function renderSchedule() {
    const view = document.getElementById("scheduleView");
    if (!view) return;

    view.innerHTML = DAYS.map((day, index) => {
      const item = schedule[day.key];
      return `<div class="schedule-day ${isToday(index) ? "is-today" : ""}">
        <div class="schedule-day-title">
          <span class="day">${day.label}</span>
          ${isToday(index) ? '<span class="today-dot">Aujourd’hui</span>' : ""}
        </div>
        <div class="schedule-two-groups">
          <div class="schedule-group-card">
            <span class="group-pill">Groupe 1</span>
            <strong class="class-name" dir="rtl">${item.group1}</strong>
          </div>
          <div class="schedule-group-card">
            <span class="group-pill group-2">Groupe 2</span>
            <strong class="class-name" dir="rtl">${item.group2}</strong>
          </div>
        </div>
      </div>`;
    }).join("");

    const todayIndex = new Date().getDay() - 1;
    const banner = document.getElementById("todayBanner");
    if (!banner) return;
    if (todayIndex >= 0 && todayIndex <= 5) {
      const todayDay = DAYS[todayIndex];
      const item = schedule[todayDay.key];
      banner.innerHTML = `<span class="pulse"></span><div><small>AUJOURD'HUI · ${todayDay.label}</small><strong dir="rtl">Groupe 1 : ${item.group1} &nbsp; | &nbsp; Groupe 2 : ${item.group2}</strong></div>`;
    } else {
      banner.innerHTML = `<span>📅</span><div><small>WEEK-END</small><strong>Le programme reprend lundi.</strong></div>`;
    }
  }

  function renderEditor() {
    editorRows.innerHTML = DAYS.map(day => {
      const item = schedule[day.key];
      return `<div class="edit-day">
        <h3>${day.label}</h3>
        <label><strong>Groupe 1</strong>
          <select data-day="${day.key}" data-field="group1">
            ${CLASSES.map(c => `<option value="${c}" ${c === item.group1 ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
        <label><strong>Groupe 2</strong>
          <select data-day="${day.key}" data-field="group2">
            ${CLASSES.map(c => `<option value="${c}" ${c === item.group2 ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
      </div>`;
    }).join("");
  }

  editBtn.addEventListener("click", () => {
    const isHidden = editor.classList.toggle("is-hidden");
    if (!isHidden) {
      renderEditor();
      editor.scrollIntoView({behavior:"smooth", block:"nearest"});
    }
  });

  saveBtn.addEventListener("click", () => {
    document.querySelectorAll("select[data-day]").forEach(select => {
      const day = select.dataset.day;
      const field = select.dataset.field;
      if (schedule[day]) schedule[day][field] = select.value;
    });
    localStorage.setItem("informatiqueSchedule", JSON.stringify(schedule));
    renderSchedule();
    editor.classList.add("is-hidden");
  });

  renderSchedule();
});

function loadSchedule(fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem("informatiqueSchedule") || "null");
    if (saved && typeof saved === "object") {
      // Migration de l'ancienne version (une seule classe par jour).
      const migrated = {};
      Object.keys(fallback).forEach(key => {
        const old = saved[key];
        const fresh = fallback[key];
        if (old && old.group1 && old.group2) {
          migrated[key] = {group1: old.group1, group2: old.group2};
        } else if (old && old.className) {
          migrated[key] = {group1: old.className, group2: fresh.group2};
        } else {
          migrated[key] = fresh;
        }
      });
      return migrated;
    }
  } catch (_) {}
  return fallback;
}
