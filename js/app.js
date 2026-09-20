// JavaScript commun du site Informatique.

document.addEventListener("DOMContentLoaded", () => {
  // Affichage du programme du jour sur l'accueil.
  const today = document.getElementById("todaySchedule");
  if (today) {
    const schedule = loadSchedule();
    const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const day = dayKeys[new Date().getDay()];
    if (schedule[day]) {
      today.textContent = `${schedule[day].className} — Groupe ${schedule[day].group}`;
    } else {
      today.textContent = "Pas de cours de groupe aujourd'hui.";
    }
  }

  // Gestion de la page Groupes.
  const editBtn = document.getElementById("editBtn");
  if (!editBtn) return;

  const DAYS = [
    {key:"monday", label:"Lundi"},
    {key:"tuesday", label:"Mardi"},
    {key:"wednesday", label:"Mercredi"},
    {key:"thursday", label:"Jeudi"},
    {key:"friday", label:"Vendredi"},
    {key:"saturday", label:"Samedi"}
  ];
  const CLASSES = Array.from({length: 11}, (_, i) => `الثالثة ${i + 1}`);
  const defaultSchedule = {
    monday: {className:"الثالثة 1", group:"1"},
    tuesday: {className:"الثالثة 2", group:"2"},
    wednesday: {className:"الثالثة 3", group:"1"},
    thursday: {className:"الثالثة 4", group:"2"},
    friday: {className:"الثالثة 5", group:"1"},
    saturday: {className:"الثالثة 6", group:"2"}
  };

  let schedule = loadSchedule(defaultSchedule);
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
      return `<div class="schedule-row ${isToday(index) ? "is-today" : ""}">
        <div class="day">${day.label}${isToday(index) ? '<span class="today-dot">Aujourd’hui</span>' : ""}</div>
        <div class="class-name" dir="rtl">${item.className}</div>
        <div class="group-pill">Groupe ${item.group}</div>
      </div>`;
    }).join("");

    const todayIndex = new Date().getDay() - 1;
    const banner = document.getElementById("todayBanner");
    if (!banner) return;
    if (todayIndex >= 0 && todayIndex <= 5) {
      const today = DAYS[todayIndex];
      const item = schedule[today.key];
      banner.innerHTML = `<span class="pulse"></span><div><small>AUJOURD'HUI · ${today.label}</small><strong dir="rtl">${item.className} — Groupe ${item.group}</strong></div>`;
    } else {
      banner.innerHTML = `<span>📅</span><div><small>WEEK-END</small><strong>Le programme reprend lundi.</strong></div>`;
    }
  }

  function renderEditor() {
    editorRows.innerHTML = DAYS.map(day => {
      const item = schedule[day.key];
      return `<div class="edit-row">
        <label><strong>${day.label}</strong>
          <select data-day="${day.key}" data-field="className">
            ${CLASSES.map(c => `<option value="${c}" ${c === item.className ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
        <label><strong>Groupe</strong>
          <select data-day="${day.key}" data-field="group">
            <option value="1" ${item.group === "1" ? "selected" : ""}>Groupe 1</option>
            <option value="2" ${item.group === "2" ? "selected" : ""}>Groupe 2</option>
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
      if (!fallback) return saved;
      return Object.fromEntries(Object.keys(fallback).map(key => [
        key, saved[key] || fallback[key]
      ]));
    }
  } catch (_) {}
  return fallback || {};
}
