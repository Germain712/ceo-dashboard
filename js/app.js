// js/app.js

const state = {
  priorities: [
    {
      id: 1,
      title: "Review key emails",
      date: new Date().toISOString().slice(0, 10),
      priority: "High",
      category: "Admin",
    },
    {
      id: 2,
      title: "Work on CEO Dashboard",
      date: new Date().toISOString().slice(0, 10),
      priority: "Medium",
      category: "Career",
    },
  ],
  projects: [
    {
      id: 1,
      name: "CEO Dashboard Web App",
      area: "Career",
      progress: 20,
      nextAction: "Finish base layout & priorities panel",
      deadline: "2026-07-01",
    },
    {
      id: 2,
      name: "GitHub Portfolio Upgrade",
      area: "Career",
      progress: 40,
      nextAction: "Polish READMEs for 3 main projects",
      deadline: "2026-08-01",
    },
  ],
};

function init() {
  renderToday();
  renderPriorities();
  renderProjects();
  initNotes();
}

function renderToday() {
  const el = document.getElementById("today-date");
  const today = new Date();
  const formatted = today.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  el.textContent = formatted;
}

function priorityBadgeClass(priority) {
  if (priority === "High") return "badge badge-priority-high";
  if (priority === "Medium") return "badge badge-priority-med";
  return "badge badge-priority-low";
}

function renderPriorities() {
  const container = document.getElementById("priorities-list");
  container.innerHTML = "";

  state.priorities.forEach((p) => {
    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
      <div class="item-main">
        <span class="item-title">${p.title}</span>
        <span class="item-meta">
          ${p.category} • ${p.date}
        </span>
      </div>
      <span class="${priorityBadgeClass(p.priority)}">${p.priority}</span>
    `;

    container.appendChild(item);
  });
}

function renderProjects() {
  const container = document.getElementById("projects-list");
  container.innerHTML = "";

  state.projects.forEach((proj) => {
    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
      <div class="item-main">
        <span class="item-title">${proj.name}</span>
        <span class="item-meta">
          ${proj.area} • Due ${proj.deadline} • Next: ${proj.nextAction}
        </span>
        <div class="progress-bar" aria-label="Project progress">
          <div class="progress-bar-inner" style="width: ${proj.progress}%"></div>
        </div>
      </div>
      <span class="badge">${proj.progress}%</span>
    `;

    container.appendChild(item);
  });
}

function initNotes() {
  const textarea = document.getElementById("quick-notes");
  const saved = localStorage.getItem("ceoDashboard.quickNotes");
  if (saved) textarea.value = saved;

  textarea.addEventListener("input", () => {
    localStorage.setItem("ceoDashboard.quickNotes", textarea.value);
  });
}

document.addEventListener("DOMContentLoaded", init);
