// -------------------- State --------------------
const store = {
  tasks: JSON.parse(localStorage.getItem("acc_tasks") || "[]"),
  notes: JSON.parse(localStorage.getItem("acc_notes") || "[]")
};

function save() {
  localStorage.setItem("acc_tasks", JSON.stringify(store.tasks));
  localStorage.setItem("acc_notes", JSON.stringify(store.notes));
}

// -------------------- Elements --------------------
const tabButtons = document.querySelectorAll(".tab-btn");
const managerPanel = document.getElementById("tab-manager");
const brainPanel = document.getElementById("tab-brain");

const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterSelect = document.getElementById("filterSelect");
const openCount = document.getElementById("openCount");

const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const noteList = document.getElementById("noteList");
const noteCount = document.getElementById("noteCount");

const exportBtn = document.getElementById("exportBtn");

// -------------------- Tabs --------------------
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    if (tab === "manager") {
      managerPanel.classList.add("active");
      brainPanel.classList.remove("active");
    } else {
      brainPanel.classList.add("active");
      managerPanel.classList.remove("active");
    }
  });
});

// -------------------- Tasks --------------------
function addTask(title) {
  store.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: Date.now()
  });
  save();
  renderTasks();
}

function toggleTask(id) {
  const t = store.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  save();
  renderTasks();
}

function deleteTask(id) {
  store.tasks = store.tasks.filter(x => x.id !== id);
  save();
  renderTasks();
}

function renderTasks() {
  const filter = filterSelect.value;
  let tasks = store.tasks;

  if (filter === "open") tasks = tasks.filter(t => !t.done);
  if (filter === "done") tasks = tasks.filter(t => t.done);

  taskList.innerHTML = tasks.map(t => `
    <li class="item">
      <div class="meta">
        <div class="title">${t.title}</div>
        <div class="small">${new Date(t.createdAt).toLocaleString("fa-IR")}</div>
      </div>

      <div style="display:flex; gap:6px;">
        <button class="chip-btn" data-action="toggle" data-id="${t.id}">
          ${t.done ? "↩️ باز" : "✅ انجام"}
        </button>
        <button class="chip-btn" data-action="delete" data-id="${t.id}">
          🗑️
        </button>
      </div>
    </li>
  `).join("");

  // bind actions
  taskList.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      const action = b.dataset.action;
      if (action === "toggle") toggleTask(id);
      if (action === "delete") deleteTask(id);
    });
  });

  const open = store.tasks.filter(t => !t.done).length;
  openCount.textContent = `${open} کار باز`;
}

// Button: add task
addTaskBtn.addEventListener("click", () => {
  const title = prompt("عنوان کار جدید چی باشه؟");
  if (!title || !title.trim()) return;
  addTask(title.trim());
});

// Filter change
filterSelect.addEventListener("change", renderTasks);

// -------------------- Notes --------------------
function addNote(text) {
  store.notes.unshift({
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now()
  });
  save();
  renderNotes();
}

function deleteNote(id) {
  store.notes = store.notes.filter(n => n.id !== id);
  save();
  renderNotes();
}

function renderNotes() {
  noteList.innerHTML = store.notes.map(n => `
    <li class="item">
      <div class="meta">
        <div class="title">${n.text}</div>
        <div class="small">${new Date(n.createdAt).toLocaleString("fa-IR")}</div>
      </div>
      <button class="chip-btn" data-id="${n.id}">🗑️</button>
    </li>
  `).join("");

  noteList.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => deleteNote(b.dataset.id));
  });

  noteCount.textContent = `${store.notes.length} نوت`;
}

addNoteBtn.addEventListener("click", () => {
  const text = noteInput.value.trim();
  if (!text) return;
  addNote(text);
  noteInput.value = "";
});

noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addNoteBtn.click();
});

// -------------------- Export --------------------
exportBtn.addEventListener("click", () => {
  const data = {
    tasks: store.tasks,
    notes: store.notes,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "acc-lifeos-export.json";
  a.click();

  URL.revokeObjectURL(url);
});

// -------------------- Init --------------------
renderTasks();
renderNotes();