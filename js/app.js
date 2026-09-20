// Shared small helpers for the static GitHub Pages site.
document.addEventListener("DOMContentLoaded", () => {
  const today = document.getElementById("todaySchedule");
  if (!today || !localStorage.getItem("informatiqueSchedule")) return;
  try {
    const schedule = JSON.parse(localStorage.getItem("informatiqueSchedule"));
    const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const day = dayKeys[new Date().getDay()];
    if (schedule[day]) {
      today.textContent = `${schedule[day].className} — Groupe ${schedule[day].group}`;
    } else {
      today.textContent = "Pas de cours de groupe aujourd'hui.";
    }
  } catch (_) {}
});
