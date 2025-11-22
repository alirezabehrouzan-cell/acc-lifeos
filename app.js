// ACC LifeOS v0.1 — Local-first PWA
const LS_KEY = "acc_lifeos_v01";

const state = loadState() ?? {
  lifeGroups: [
    { id: uid(), title: "Orbiq", color: "good", tasks: [] },
    { id: uid(), title: "Skincare", color: "warn", tasks: [] },
    { id: uid(), title: "Lakehead", color: "good", tasks: [] },
    { id: uid(), title: "دارایی‌ها و بدهی‌ها", color: "bad", tasks: [] },
    { id: uid(), title: "استرس‌ها", color: "warn", tasks: [] },
    { id: uid(), title: "برنامه‌های Ariana", color: "good", tasks: [] },
    { id: uid(), title: "رابطه با Parnian", color: "warn", tasks: [] },
    { id: uid(), title: "برنامه‌ریزی سفرها", color: "good", tasks: [] },
  ],
  notes: []
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
const now = () => new Date().toISOString();

// Tabs
$$(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    $$(".panel").forEach(p=>p.classList.remove("active"));
    $("#tab-"+tab).classList.add("active");
  });
});

// Render
function render(){
  renderLife();
  renderBrain();
  renderStats();
  saveState();
}

// LIFE
function renderLife(){
  const wrap = $("#life-groups");
  wrap.innerHTML = "";

  const filter = $("#life-filter").value;
  state.lifeGroups.forEach(g=>{
    const openCount = g.tasks.filter(t=>!t.done).length;

    const groupEl = document.createElement("div");
    groupEl.className = "group";

    groupEl.innerHTML = `
      <div class="group-head">
        <div class="group-title">
          <span>${g.title}</span>
          <span class="badge">${openCount} باز</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="ghost" data-action="add-task" data-gid="${g.id}">+ کار</button>
          <button class="ghost" data-action="edit-group" data-gid="${g.id}">ویرایش</button>
        </div>
      </div>
      <div class="tasks"></div>
    `;

    const tasksWrap = groupEl.querySelector(".tasks");
    let tasks = g.tasks.slice().sort((a,b)=> (a.done===b.done)?0:(a.done?1:-1));
    if(filter==="open") tasks = tasks.filter(t=>!t.done);
    if(filter==="done") tasks = tasks.filter(t=>t.done);

    if(tasks.length===0){
      const empty = document.createElement("div");
      empty.className="task";
      empty.innerHTML = `<div class="task-meta">اینجا هنوز کاری نیست.</div>`;
      tasksWrap.appendChild(empty);
    } else {
      tasks.forEach(t=>{
        const taskEl = document.createElement("div");
        taskEl.className="task";
        taskEl.innerHTML=`
          <div class="task-row">
            <div class="task-title">${escapeHtml(t.title)}</div>
            <div style="display:flex;gap:6px">
              <button class="ghost" data-action="toggle-task" data-gid="${g.id}" data-tid="${t.id}">
                ${t.done?"↩️ بازکن":"✅ انجام"}
              </button>
              <button class="ghost" data-action="edit-task" data-gid="${g.id}" data-tid="${t.id}">✏️</button>
              <button class="ghost" data-action="del-task" data-gid="${g.id}" data-tid="${t.id}">🗑️</button>
            </div>
          </div>
          <div class="task-meta">${t.due?("ددلاین: "+prettyDate(t.due)):"بدون ددلاین"} • ${prettyDate(t.createdAt)}</div>
          <div class="task-tags">
            ${(t.tags||[]).map(tag=>`<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
          ${t.note?`<div class="task-meta">${escapeHtml(t.note)}</div>`:""}
        `;
        tasksWrap.appendChild(taskEl);
      });
    }

    wrap.appendChild(groupEl);
  });
}

// Brain
function renderBrain(){
  const wrap = $("#brain-list");
  wrap.innerHTML="";
  const q = $("#brain-search").value?.trim().toLowerCase() || "";

  let notes = state.notes.slice().sort((a,b)=> b.updatedAt.localeCompare(a.updatedAt));
  if(q){
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      (n.tags||[]).join