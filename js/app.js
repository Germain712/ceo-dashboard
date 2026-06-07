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
