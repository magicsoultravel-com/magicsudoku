const Settings = (() => {
  const STORAGE_KEY = "sudoku-colors";

  const PRESETS = [
    "#ffffff", "#000000", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
    "#78716c", "#64748b", "#1e293b", "#94a3b8",
  ];

  const FIELDS = [
    { id: "borderStrong", label: "External borders", var: "--board-border-strong" },
    { id: "border", label: "Internal borders", var: "--board-border" },
    { id: "fontColor", label: "Font color", var: "--board-font" },
    { id: "highlightValue", label: "Number highlight", var: "--board-highlight-value" },
    { id: "highlightPeer", label: "Row & column area", var: "--board-highlight-peer" },
  ];

  let colors = {};

  function load() {
    try {
      colors = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      colors = {};
    }
    apply();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  }

  function apply() {
    FIELDS.forEach(({ id, var: cssVar }) => {
      const value = colors[id];
      if (value) {
        document.documentElement.style.setProperty(cssVar, value);
      } else {
        document.documentElement.style.removeProperty(cssVar);
      }
    });
  }

  function setColor(id, value) {
    if (!value) {
      delete colors[id];
    } else {
      colors[id] = value;
    }
    save();
    apply();
  }

  function getColor(id) {
    return colors[id] || "";
  }

  function reset() {
    colors = {};
    localStorage.removeItem(STORAGE_KEY);
    apply();
  }

  function buildDialog(container) {
    container.innerHTML = "";
    FIELDS.forEach((field) => {
      const row = document.createElement("div");
      row.className = "color-field";
      row.dataset.field = field.id;

      const label = document.createElement("label");
      label.className = "color-field-label";
      label.textContent = field.label;

      const presets = document.createElement("div");
      presets.className = "color-presets";
      presets.setAttribute("role", "group");
      presets.setAttribute("aria-label", field.label);

      PRESETS.forEach((hex) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "color-swatch";
        btn.style.backgroundColor = hex;
        btn.dataset.color = hex;
        btn.title = hex;
        btn.addEventListener("click", () => {
          setColor(field.id, hex);
          syncDialog(container);
        });
        presets.appendChild(btn);
      });

      const pickerWrap = document.createElement("div");
      pickerWrap.className = "color-picker-wrap";

      const picker = document.createElement("input");
      picker.type = "color";
      picker.className = "color-picker";
      picker.value = getColor(field.id) || "#3b82f6";
      picker.title = "Custom color";
      picker.addEventListener("input", () => {
        setColor(field.id, picker.value);
        syncDialog(container);
      });

      const current = document.createElement("span");
      current.className = "color-current";
      current.dataset.field = field.id;

      pickerWrap.append(picker, current);
      row.append(label, presets, pickerWrap);
      container.appendChild(row);
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "btn btn-reset";
    resetBtn.textContent = "Reset to default (Dark)";
    resetBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("sudoku:reset-appearance"));
    });
    container.appendChild(resetBtn);

    syncDialog(container);
  }

  function syncDialog(container) {
    FIELDS.forEach((field) => {
      const value = getColor(field.id);
      const row = container.querySelector(`[data-field="${field.id}"]`);
      if (!row) return;

      row.querySelectorAll(".color-swatch").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color === value);
      });

      const picker = row.querySelector(".color-picker");
      if (picker && value) picker.value = value;

      const current = row.querySelector(".color-current");
      if (current) current.textContent = value || "Theme default";
    });
  }

  return {
    FIELDS,
    load,
    reset,
    getColor,
    setColor,
    buildDialog,
    syncDialog,
  };
})();
