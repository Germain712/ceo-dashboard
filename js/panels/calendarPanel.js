/* ---------------------------------------------------
   CALENDAR ENGINE
--------------------------------------------------- */

state.calendarEvents = state.calendarEvents || [];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix = [];
  let week = [];

  // Fill empty cells before month starts
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }

  // Fill days
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  // Fill trailing empty cells
  while (week.length < 7) week.push(null);
  matrix.push(week);

  return matrix;
}

function renderCalendar() {
  const label = document.getElementById("cal-month-label");
  const grid = document.getElementById("calendar-grid");

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    },
  );

  label.textContent = monthName;
  grid.innerHTML = "";

  const matrix = getMonthMatrix(currentYear, currentMonth);

  matrix.forEach((week) => {
    week.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";

      if (day) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        cell.innerHTML = `
          <div class="calendar-date">${day}</div>
        `;

        // Events for this date
        const events = state.calendarEvents.filter((e) => e.date === dateStr);

        if (events.length > 0) {
          const dot = document.createElement("div");
          dot.className = "calendar-event-dot";
          cell.appendChild(dot);

          const tooltip = document.createElement("div");
          tooltip.className = "calendar-event-tooltip";
          tooltip.innerHTML = events.map((e) => e.title).join("<br>");
          cell.appendChild(tooltip);
        }

        // Today highlight
        const today = new Date();
        if (
          day === today.getDate() &&
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear()
        ) {
          cell.classList.add("today");
        }

        // Click handler
        cell.addEventListener("click", () => openDateMenu(dateStr));
      }

      grid.appendChild(cell);
    });
  });
}

// Month navigation
document.getElementById("cal-prev").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("cal-next").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

/* ---------------------------------------------------
   CALENDAR EVENT FORM
--------------------------------------------------- */

function openDateMenu(dateStr) {
  const html = `
    <h3>Add to ${dateStr}</h3>
    <div class="modal-form">
      <button class="btn-primary" id="add-event-btn">Add Event</button>
      <button class="btn-secondary" id="add-task-btn">Add Task</button>
      <button class="btn-secondary" id="add-priority-btn2">Add Priority</button>
    </div>
  `;

  openModal(html);

  document.getElementById("add-event-btn").onclick = () =>
    openCalendarEventForm(dateStr);
  document.getElementById("add-task-btn").onclick = () => {
    closeModal();
    openTodoForm();
    document.querySelector("input[name='due']").value = dateStr;
  };
  document.getElementById("add-priority-btn2").onclick = () => {
    closeModal();
    openPriorityForm();
    document.querySelector("input[name='date']").value = dateStr;
  };
}

function openCalendarEventForm(dateStr) {
  const formHtml = `
    ${buildInput("Title (required)", "title")}
    ${buildSelect("Category", ["General", "Work", "Personal", "Study", "Health"])}
    ${buildInput("Date", "date", dateStr, "date")}
    ${buildInput("Start Time", "start", "", "time")}
    ${buildInput("End Time", "end", "", "time")}
    ${buildInput("Location", "location")}
    ${buildSelect("Reminder", ["None", "10 minutes before", "30 minutes before", "1 hour before", "1 day before"])}
    ${buildTextarea("Notes", "notes")}
  `;

  openModal(modalWrapper("Add Event", formHtml));
  attachModalCancel();

  document.getElementById("modal-save-btn").onclick = (e) => {
    e.preventDefault();

    const form = document.querySelector(".modal-form");
    const title = form.title.value.trim();
    if (!title) return;

    state.calendarEvents.push({
      id: generateId(),
      title,
      category: form.category.value,
      date: form.date.value,
      start: form.start.value,
      end: form.end.value,
      location: form.location.value,
      reminder: form.reminder.value,
      notes: form.notes.value,
    });

    saveState();
    renderCalendar();
    closeModal();
  };
}
