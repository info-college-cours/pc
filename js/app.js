// JavaScript commun du site Informatique.

document.addEventListener("DOMContentLoaded", () => {
  const DAYS = [
    {key:"monday", label:"Lundi", classCount:2},
    {key:"tuesday", label:"Mardi", classCount:2},
    {key:"wednesday", label:"Mercredi", classCount:2},
    {key:"thursday", label:"Jeudi", classCount:2},
    {key:"friday", label:"Vendredi", classCount:1},
    {key:"saturday", label:"Samedi", classCount:2}
  ];
  const CLASSES = Array.from({length: 11}, (_, i) => `الثالثة ${i + 1}`);

  // Chaque classe possède deux groupes (Groupe 1 et Groupe 2).
  // Deux classes sont prévues par jour, sauf le vendredi où une seule classe a cours.
  const defaultSchedule = {
    monday:    {classes:["الثالثة 1", "الثالثة 2"]},
    tuesday:   {classes:["الثالثة 3", "الثالثة 4"]},
    wednesday: {classes:["الثالثة 5", "الثالثة 6"]},
    thursday:  {classes:["الثالثة 7", "الثالثة 8"]},
    friday:    {classes:["الثالثة 9"]},
    saturday:  {classes:["الثالثة 10", "الثالثة 11"]}
  };

  const schedule = loadSchedule(defaultSchedule, DAYS);

  // Affichage du programme du jour sur l'accueil.
  const today = document.getElementById("todaySchedule");
  if (today) {
    const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const day = dayKeys[new Date().getDay()];
    if (schedule[day]) {
      const items = schedule[day].classes.map(c => `<span dir="rtl"><b>${c}</b> — Groupe 1 + Groupe 2</span>`);
      today.innerHTML = items.join("<br>");
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
      const cards = item.classes.map(className => `
        <div class="schedule-class-card">
          <div class="class-title" dir="rtl">${className}</div>
          <div class="class-groups">
            <span class="group-pill">Groupe 1</span>
            <span class="group-pill group-2">Groupe 2</span>
          </div>
        </div>
      `).join("");

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
    if (!banner) return;
    if (todayIndex >= 0 && todayIndex <= 5) {
      const todayDay = DAYS[todayIndex];
      const item = schedule[todayDay.key];
      banner.innerHTML = `<span class="pulse"></span><div><small>AUJOURD'HUI · ${todayDay.label}</small><strong>${item.classes.map(c => `<span dir="rtl">${c} — Groupe 1 + Groupe 2</span>`).join(" &nbsp; | &nbsp; ")}</strong></div>`;
    } else {
      banner.innerHTML = `<span>📅</span><div><small>WEEK-END</small><strong>Le programme reprend lundi.</strong></div>`;
    }
  }

  function renderEditor() {
    editorRows.innerHTML = DAYS.map(day => {
      const item = schedule[day.key];
      const first = item.classes[0] || CLASSES[0];
      const second = item.classes[1] || CLASSES[1];
      const select = (field, selected) => `
        <label><strong>${field === "class1" ? "Classe 1" : "Classe 2"}</strong>
          <select data-day="${day.key}" data-field="${field}">
            ${CLASSES.map(c => `<option value="${c}" ${c === selected ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>`;
      return `<div class="edit-day ${day.classCount === 1 ? "single-class-day" : ""}">
        <h3>${day.label}</h3>
        <div class="edit-class-block">
          ${select("class1", first)}
          <div class="editor-groups"><span>Groupe 1</span><span>Groupe 2</span></div>
        </div>
        ${day.classCount === 2 ? `<div class="edit-class-block">${select("class2", second)}<div class="editor-groups"><span>Groupe 1</span><span>Groupe 2</span></div></div>` : `<div class="friday-note">Une seule classe ce jour — les deux groupes de cette classe ont cours.</div>`}
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
    DAYS.forEach(day => {
      const class1 = document.querySelector(`select[data-day="${day.key}"][data-field="class1"]`);
      const class2 = document.querySelector(`select[data-day="${day.key}"][data-field="class2"]`);
      schedule[day.key].classes = class2 ? [class1.value, class2.value] : [class1.value];
    });
    localStorage.setItem("informatiqueSchedule", JSON.stringify(schedule));
    renderSchedule();
    editor.classList.add("is-hidden");
  });

  renderSchedule();
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
