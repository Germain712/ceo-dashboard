/* ---------------------------------------------------
   CORE STATE + STORAGE + UTILITIES
--------------------------------------------------- */

// Global application state
const state = {
  priorities: [],
  todos: [],
  projects: [],
  emails: [],
  finances: [],
  investments: [],
  notes: "",
};

/* ---------------------------------------------------
   LOCAL STORAGE HELPERS
--------------------------------------------------- */

function saveState() {
  localStorage.setItem("ceoDashboard.state", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("ceoDashboard.state");
  if (saved) {
    const parsed = JSON.parse(saved);

    // Merge saved state into current state
    Object.keys(state).forEach((key) => {
      if (parsed[key] !== undefined) state[key] = parsed[key];
    });
  }
}

/* ---------------------------------------------------
   ID GENERATOR
--------------------------------------------------- */

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/* ---------------------------------------------------
   MODULE‑SPECIFIC CATEGORIES
--------------------------------------------------- */

const CATEGORY_MAP = {
  priorities: ["Admin", "Career", "Personal", "Study", "Errands"],
  todos: ["Personal", "Career", "Study", "Errands", "Admin"],
  projects: ["Career", "Personal", "Business", "Learning"],
  emails: ["Work", "Personal", "Finance", "Projects", "Follow‑Up"],
  finances: [
    "Income",
    "Bills",
    "Subscriptions",
    "Food",
    "Transport",
    "Shopping",
    "Savings",
  ],
  investments: ["Stocks", "ETFs", "Crypto", "Real Estate", "Cash"],
};

/* ---------------------------------------------------
   PRIORITY OPTIONS
--------------------------------------------------- */

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

/* ---------------------------------------------------
   DATE HELPER
--------------------------------------------------- */

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------------------------------------------
   SWIPE‑TO‑DELETE HELPER
--------------------------------------------------- */

function enableSwipeToDelete(element, onDelete) {
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  element.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    dragging = true;
    element.style.transition = "none";
  });

  element.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    currentX = e.clientX - startX;

    if (currentX < 0) {
      element.style.transform = `translateX(${currentX}px)`;
    }
  });

  element.addEventListener("pointerup", () => {
    dragging = false;
    element.style.transition = "transform 0.2s ease";

    if (currentX < -80) {
      // Trigger delete
      element.style.transform = "translateX(-120%)";
      setTimeout(onDelete, 180);
    } else {
      // Reset
      element.style.transform = "translateX(0)";
    }

    currentX = 0;
  });
}
/* ---------------------------------------------------
   RENDER HELPERS
--------------------------------------------------- */

function renderToday() {
  const el = document.getElementById("today-date");
  if (!el) return;

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

/* ---------------------------------------------------
   RENDER PRIORITIES
--------------------------------------------------- */

function renderPriorities() {
  const container = document.getElementById("priorities-list");
  if (!container) return;
  container.innerHTML = "";

  state.priorities.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    wrapper.innerHTML = `
      <div class="item-main">
        <span class="item-title">${item.title}</span>
        <span class="item-meta">
          ${item.category || "General"} • ${item.date || todayISO()}
        </span>
      </div>
      <span class="${priorityBadgeClass(item.priority || "Medium")}">
        ${item.priority || "Medium"}
      </span>
    `;

    enableSwipeToDelete(wrapper, () => {
      deletePriority(item.id);
    });

    container.appendChild(wrapper);
  });
}

/* ---------------------------------------------------
   RENDER TODOS
--------------------------------------------------- */

function renderTodos() {
  const container = document.getElementById("todo-list");
  if (!container) return;
  container.innerHTML = "";

  state.todos.forEach((task) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item" + (task.completed ? " todo-completed" : "");

    wrapper.innerHTML = `
      <div class="item-main">
        <span class="item-title">${task.title}</span>
        <span class="item-meta">
          ${task.category || "General"} • Due ${task.due || "None"}
        </span>
        <div class="progress-bar" style="height: 4px;">
          <div class="progress-bar-inner" style="width: ${
            task.completed ? 100 : 0
          }%"></div>
        </div>
      </div>
      <input 
        type="checkbox" 
        ${task.completed ? "checked" : ""} 
        data-id="${task.id}" 
        class="todo-toggle"
      />
    `;

    enableSwipeToDelete(wrapper, () => {
      deleteTodo(task.id);
    });

    container.appendChild(wrapper);
  });

  // checkbox listeners
  container.querySelectorAll(".todo-toggle").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const id = Number(e.target.dataset.id);
      const t = state.todos.find((x) => x.id === id);
      if (!t) return;
      t.completed = e.target.checked;
      saveState();
      renderTodos();
    });
  });
}

/* ---------------------------------------------------
   RENDER PROJECTS
--------------------------------------------------- */

function renderProjects() {
  const container = document.getElementById("projects-list");
  if (!container) return;
  container.innerHTML = "";

  state.projects.forEach((proj) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    wrapper.innerHTML = `
      <div class="item-main">
        <span class="item-title">${proj.name}</span>
        <span class="item-meta">
          ${proj.area || "General"} • Due ${proj.deadline || "None"} • Next: ${
            proj.nextAction || "Not set"
          }
        </span>
        <div class="progress-bar" aria-label="Project progress">
          <div class="progress-bar-inner" style="width: ${
            proj.progress || 0
          }%"></div>
        </div>
      </div>
      <span class="badge">${proj.progress || 0}%</span>
    `;

    enableSwipeToDelete(wrapper, () => {
      deleteProject(proj.id);
    });

    container.appendChild(wrapper);
  });
}

/* ---------------------------------------------------
   RENDER EMAILS
--------------------------------------------------- */

function renderEmails() {
  const container = document.getElementById("email-list");
  if (!container) return;
  container.innerHTML = "";

  state.emails.forEach((email) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    wrapper.innerHTML = `
      <div class="item-main">
        <span class="item-title">${email.subject}</span>
        <span class="item-meta">
          ${email.category || "Work"} • From ${email.from || "Unknown"} • ${
            email.due ? "Reply by " + email.due : "No deadline"
          }
        </span>
      </div>
      <span class="badge">${email.status || "Open"}</span>
    `;

    enableSwipeToDelete(wrapper, () => {
      deleteEmail(email.id);
    });

    container.appendChild(wrapper);
  });
}

/* ---------------------------------------------------
   RENDER FINANCES
--------------------------------------------------- */

function calculateFinanceSummary() {
  let income = 0;
  let expenses = 0;

  state.finances.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    if (amount >= 0) income += amount;
    else expenses += amount;
  });

  return {
    income,
    expenses,
    net: income + expenses,
  };
}

function renderFinances() {
  const summaryEl = document.getElementById("finance-summary");
  const listEl = document.getElementById("finance-list");
  if (!summaryEl || !listEl) return;

  const { income, expenses, net } = calculateFinanceSummary();

  summaryEl.innerHTML = `
    <div class="item">
      <div class="item-main">
        <span class="item-title">This Month</span>
        <span class="item-meta">
          Income: £${income.toFixed(2)} • Expenses: £${Math.abs(
            expenses,
          ).toFixed(2)} • Net: £${net.toFixed(2)}
        </span>
      </div>
    </div>
  `;

  listEl.innerHTML = "";

  state.finances.forEach((tx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    const sign = Number(tx.amount) >= 0 ? "+" : "−";
    const amountAbs = Math.abs(Number(tx.amount) || 0).toFixed(2);

    wrapper.innerHTML = `
      <div class="item-main">
        <span class="item-title">${tx.title}</span>
        <span class="item-meta">
          ${tx.category || "General"} • ${tx.date || todayISO()}
        </span>
      </div>
      <span class="badge" style="color: ${
        Number(tx.amount) >= 0 ? "#16a34a" : "#dc2626"
      }">
        ${sign}£${amountAbs}
      </span>
    `;

    enableSwipeToDelete(wrapper, () => {
      deleteTransaction(tx.id);
    });

    listEl.appendChild(wrapper);
  });
}

/* ---------------------------------------------------
   RENDER INVESTMENTS
--------------------------------------------------- */

function calculateInvestmentSummary() {
  let total = 0;

  state.investments.forEach((inv) => {
    const value = Number(inv.currentValue) || 0;
    total += value;
  });

  return { total };
}

function renderInvestments() {
  const summaryEl = document.getElementById("investments-summary");
  const listEl = document.getElementById("investments-list");
  if (!summaryEl || !listEl) return;

  const { total } = calculateInvestmentSummary();

  summaryEl.innerHTML = `
    <div class="item">
      <div class="item-main">
        <span class="item-title">Portfolio Value</span>
        <span class="item-meta">Total current value across all holdings</span>
      </div>
      <span class="badge">£${total.toFixed(2)}</span>
    </div>
  `;

  listEl.innerHTML = "";

  state.investments.forEach((inv) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";

    wrapper.innerHTML = `
      <div class="item-main">
        <span class="item-title">${inv.name}</span>
        <span class="item-meta">
          ${inv.category || "General"} • Units: ${inv.units || 0} • Buy: £${
            inv.buyPrice || 0
          } • Current: £${inv.currentPrice || inv.currentValue || 0}
        </span>
      </div>
      <span class="badge">£${(Number(inv.currentValue) || 0).toFixed(2)}</span>
    `;

    enableSwipeToDelete(wrapper, () => {
      deleteInvestment(inv.id);
    });

    listEl.appendChild(wrapper);
  });
}

/* ---------------------------------------------------
   RENDER NOTES
--------------------------------------------------- */

function renderNotes() {
  const textarea = document.getElementById("quick-notes");
  if (!textarea) return;
  textarea.value = state.notes || "";

  textarea.addEventListener("input", () => {
    state.notes = textarea.value;
    saveState();
  });
}

/* ---------------------------------------------------
   RENDER HABITS (placeholder for now)
--------------------------------------------------- */

function renderHabits() {
  const container = document.getElementById("habits-list");
  if (!container) return;

  container.innerHTML = `
    <div class="item">
      <div class="item-main">
        <span class="item-title">Habits module coming soon</span>
        <span class="item-meta">You can track daily routines here later.</span>
      </div>
    </div>
  `;
}
/* ---------------------------------------------------
   UNIVERSAL MODAL ENGINE
--------------------------------------------------- */

const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");

/**
 * Open modal with dynamic HTML content
 */
function openModal(html) {
  modalContent.innerHTML = html;

  modal.classList.add("active");
  modalOverlay.classList.add("active");

  // Prevent scroll behind modal
  document.body.style.overflow = "hidden";
}

/**
 * Close modal
 */
function closeModal() {
  modal.classList.remove("active");
  modalOverlay.classList.remove("active");

  // Allow scrolling again
  document.body.style.overflow = "";
}

/**
 * Close modal when clicking overlay
 */
modalOverlay.addEventListener("click", () => {
  closeModal();
});

/**
 * Close modal on ESC key
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

/**
 * Helper to wrap form HTML with modal structure
 */
function modalWrapper(title, formHtml) {
  return `
    <h3>${title}</h3>
    <form class="modal-form">
      ${formHtml}

      <div class="modal-actions">
        <button type="button" class="btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button type="submit" class="btn-primary" id="modal-save-btn">Save</button>
      </div>
    </form>
  `;
}

/**
 * Attach cancel button listener after modal opens
 */
function attachModalCancel() {
  const cancelBtn = document.getElementById("modal-cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }
}
/* ---------------------------------------------------
   FORM BUILDERS (PROFESSIONAL FULL FORMS)
--------------------------------------------------- */

/**
 * Build a <select> from an array
 */
function buildSelect(name, options, selected = "") {
  return `
    <label>${name}</label>
    <select name="${name.toLowerCase()}">
      ${options
        .map(
          (opt) =>
            `<option value="${opt}" ${opt === selected ? "selected" : ""}>${opt}</option>`,
        )
        .join("")}
    </select>
  `;
}

/**
 * Build a text input
 */
function buildInput(label, name, value = "", type = "text") {
  return `
    <label>${label}</label>
    <input type="${type}" name="${name}" value="${value}" />
  `;
}

/**
 * Build a textarea
 */
function buildTextarea(label, name, value = "") {
  return `
    <label>${label}</label>
    <textarea name="${name}">${value}</textarea>
  `;
}

/* ---------------------------------------------------
   PRIORITY FORM
--------------------------------------------------- */

function openPriorityForm() {
  const formHtml = `
    ${buildInput("Title (required)", "title")}
    ${buildSelect("Category", CATEGORY_MAP.priorities)}
    ${buildSelect("Priority", PRIORITY_OPTIONS)}
    ${buildInput("Date", "date", todayISO(), "date")}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Add Priority", formHtml));
  attachModalCancel();

  document.querySelector("#modal-save-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const title = form.title.value.trim();

    if (!title) return; // soft validation

    addPriority({
      id: generateId(),
      title,
      category: form.category.value,
      priority: form.priority.value,
      date: form.date.value,
      notes: form.notes.value,
    });

    closeModal();
  });
}

/* ---------------------------------------------------
   TODO FORM
--------------------------------------------------- */

function openTodoForm() {
  const formHtml = `
    ${buildInput("Task Title (required)", "title")}
    ${buildSelect("Category", CATEGORY_MAP.todos)}
    ${buildSelect("Priority", PRIORITY_OPTIONS)}
    ${buildInput("Due Date", "due", todayISO(), "date")}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Add Task", formHtml));
  attachModalCancel();

  document.querySelector("#modal-save-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const title = form.title.value.trim();
    if (!title) return;

    addTodo({
      id: generateId(),
      title,
      category: form.category.value,
      priority: form.priority.value,
      due: form.due.value,
      notes: form.notes.value,
      completed: false,
    });

    closeModal();
  });
}

/* ---------------------------------------------------
   PROJECT FORM
--------------------------------------------------- */

function openProjectForm() {
  const formHtml = `
    ${buildInput("Project Name (required)", "name")}
    ${buildSelect("Area", CATEGORY_MAP.projects)}
    ${buildInput("Deadline", "deadline", todayISO(), "date")}
    ${buildInput("Progress (%)", "progress", "0", "number")}
    ${buildTextarea("Next Action", "nextAction")}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Add Project", formHtml));
  attachModalCancel();

  document.querySelector("#modal-save-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const name = form.name.value.trim();
    if (!name) return;

    addProject({
      id: generateId(),
      name,
      area: form.area.value,
      deadline: form.deadline.value,
      progress: Number(form.progress.value) || 0,
      nextAction: form.nextAction.value,
      notes: form.notes.value,
    });

    closeModal();
  });
}

/* ---------------------------------------------------
   EMAIL FORM
--------------------------------------------------- */

function openEmailForm() {
  const formHtml = `
    ${buildInput("Subject (required)", "subject")}
    ${buildInput("From", "from")}
    ${buildSelect("Category", CATEGORY_MAP.emails)}
    ${buildInput("Reply By", "due", todayISO(), "date")}
    ${buildSelect("Status", ["Open", "Waiting", "Done"])}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Track Email", formHtml));
  attachModalCancel();

  document.querySelector("#modal-save-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const subject = form.subject.value.trim();
    if (!subject) return;

    addEmail({
      id: generateId(),
      subject,
      from: form.from.value,
      category: form.category.value,
      due: form.due.value,
      status: form.status.value,
      notes: form.notes.value,
    });

    closeModal();
  });
}

/* ---------------------------------------------------
   TRANSACTION FORM
--------------------------------------------------- */

function openTransactionForm() {
  const formHtml = `
    ${buildInput("Title (required)", "title")}
    ${buildSelect("Category", CATEGORY_MAP.finances)}
    ${buildInput("Amount (£)", "amount", "", "number")}
    ${buildInput("Date", "date", todayISO(), "date")}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Add Transaction", formHtml));
  attachModalCancel();

  document.querySelector("#modal-save-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const title = form.title.value.trim();
    if (!title) return;

    addTransaction({
      id: generateId(),
      title,
      category: form.category.value,
      amount: Number(form.amount.value) || 0,
      date: form.date.value,
      notes: form.notes.value,
    });

    closeModal();
  });
}

/* ---------------------------------------------------
   INVESTMENT FORM
--------------------------------------------------- */

function openInvestmentForm() {
  const formHtml = `
    ${buildInput("Asset Name (required)", "name")}
    ${buildSelect("Category", CATEGORY_MAP.investments)}
    ${buildInput("Units", "units", "", "number")}
    ${buildInput("Buy Price (£)", "buyPrice", "", "number")}
    ${buildInput("Current Price (£)", "currentPrice", "", "number")}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Add Investment", formHtml));
  attachModalCancel();

  document.querySelector("#modal-save-btn").addEventListener("click", (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const name = form.name.value.trim();
    if (!name) return;

    const units = Number(form.units.value) || 0;
    const currentPrice = Number(form.currentPrice.value) || 0;

    addInvestment({
      id: generateId(),
      name,
      category: form.category.value,
      units,
      buyPrice: Number(form.buyPrice.value) || 0,
      currentPrice,
      currentValue: units * currentPrice,
      notes: form.notes.value,
    });

    closeModal();
  });
}
/* ---------------------------------------------------
   CRUD LOGIC — ADD + DELETE + SAVE + RENDER
--------------------------------------------------- */

/* -------------------------
   PRIORITIES
------------------------- */

function addPriority(item) {
  state.priorities.unshift(item);
  saveState();
  renderPriorities();
}

function deletePriority(id) {
  state.priorities = state.priorities.filter((p) => p.id !== id);
  saveState();
  renderPriorities();
}

/* -------------------------
   TODOS
------------------------- */

function addTodo(task) {
  state.todos.unshift(task);
  saveState();
  renderTodos();
}

function deleteTodo(id) {
  state.todos = state.todos.filter((t) => t.id !== id);
  saveState();
  renderTodos();
}

/* -------------------------
   PROJECTS
------------------------- */

function addProject(project) {
  state.projects.unshift(project);
  saveState();
  renderProjects();
}

function deleteProject(id) {
  state.projects = state.projects.filter((p) => p.id !== id);
  saveState();
  renderProjects();
}

/* -------------------------
   EMAILS
------------------------- */

function addEmail(email) {
  state.emails.unshift(email);
  saveState();
  renderEmails();
}

function deleteEmail(id) {
  state.emails = state.emails.filter((e) => e.id !== id);
  saveState();
  renderEmails();
}

/* -------------------------
   FINANCES
------------------------- */

function addTransaction(tx) {
  state.finances.unshift(tx);
  saveState();
  renderFinances();
}

function deleteTransaction(id) {
  state.finances = state.finances.filter((t) => t.id !== id);
  saveState();
  renderFinances();
}

/* -------------------------
   INVESTMENTS
------------------------- */

function addInvestment(inv) {
  state.investments.unshift(inv);
  saveState();
  renderInvestments();
}

function deleteInvestment(id) {
  state.investments = state.investments.filter((i) => i.id !== id);
  saveState();
  renderInvestments();
}
/* ---------------------------------------------------
   EVENT LISTENERS + INIT
--------------------------------------------------- */

/* -------------------------
   BUTTON LISTENERS
------------------------- */

document.getElementById("add-priority-btn")?.addEventListener("click", () => {
  openPriorityForm();
});

document.getElementById("add-todo-btn")?.addEventListener("click", () => {
  openTodoForm();
});

document.getElementById("add-project-btn")?.addEventListener("click", () => {
  openProjectForm();
});

document.getElementById("add-email-btn")?.addEventListener("click", () => {
  openEmailForm();
});

document
  .getElementById("add-transaction-btn")
  ?.addEventListener("click", () => {
    openTransactionForm();
  });

document.getElementById("add-investment-btn")?.addEventListener("click", () => {
  openInvestmentForm();
});

/* -------------------------
   THEME TOGGLE
------------------------- */

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "ceoDashboard.theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
});

/* -------------------------
   LOAD THEME
------------------------- */

function loadTheme() {
  const saved = localStorage.getItem("ceoDashboard.theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
  }
}

/* -------------------------
   INITIALIZE NOTES
------------------------- */

function initNotes() {
  const textarea = document.getElementById("quick-notes");
  if (!textarea) return;

  textarea.value = state.notes || "";

  textarea.addEventListener("input", () => {
    state.notes = textarea.value;
    saveState();
  });
}

/* -------------------------
   INIT FUNCTION
------------------------- */

function init() {
  loadState();
  loadTheme();
  renderToday();

  renderPriorities();
  renderTodos();
  renderProjects();
  renderEmails();
  renderFinances();
  renderInvestments();
  renderNotes();
  renderHabits();

  initNotes();
}

init();
