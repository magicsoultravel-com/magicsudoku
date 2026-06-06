const Settings = (() => {
  const STORAGE_KEY = "sudoku-colors";
  const CUSTOM = "__custom__";

  const PRESETS = [
    { value: "#ffffff", label: "White" },
    { value: "#000000", label: "Black" },
    { value: "#ef4444", label: "Red" },
    { value: "#f97316", label: "Orange" },
    { value: "#eab308", label: "Yellow" },
    { value: "#22c55e", label: "Green" },
    { value: "#14b8a6", label: "Teal" },
    { value: "#06b6d4", label: "Cyan" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#6366f1", label: "Indigo" },
    { value: "#8b5cf6", label: "Violet" },
    { value: "#ec4899", label: "Pink" },
    { value: "#78716c", label: "Stone" },
    { value: "#64748b", label: "Slate" },
    { value: "#1e293b", label: "Navy" },
    { value: "#94a3b8", label: "Silver" },
  ];

  const FIELDS = [
    { id: "borderStrong", label: "Outer borders", var: "--board-border-strong" },
    { id: "border", label: "Grid lines", var: "--board-border" },
    { id: "fontColor", label: "Numbers", var: "--board-font" },
    { id: "highlightValue", label: "Match tint", var: "--board-highlight-value" },
    { id: "highlightPeer", label: "Row/col tint", var: "--board-highlight-peer" },
  ];

  let colors = {};

  function isPreset(value) {
    return PRESETS.some((p) => p.value === value);
  }

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

  function selectValueForField(id) {
    const value = getColor(id);
    if (!value) return "";
    if (isPreset(value)) return value;
    return CUSTOM;
  }

  function buildDialog(container) {
    container.innerHTML = "";

    FIELDS.forEach((field) => {
      const row = document.createElement("div");
      row.className = "setting-row";
      row.dataset.field = field.id;

      const label = document.createElement("label");
      label.className = "setting-label";
      label.textContent = field.label;
      label.htmlFor = `setting-${field.id}`;

      const select = document.createElement("select");
      select.id = `setting-${field.id}`;
      select.className = "setting-select";

      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = "Theme default";
      select.appendChild(defaultOpt);

      PRESETS.forEach((preset) => {
        const opt = document.createElement("option");
        opt.value = preset.value;
        opt.textContent = preset.label;
        select.appendChild(opt);
      });

      const customOpt = document.createElement("option");
      customOpt.value = CUSTOM;
      customOpt.textContent = "Custom…";
      select.appendChild(customOpt);

      const picker = document.createElement("input");
      picker.type = "color";
      picker.className = "setting-color-picker";
      picker.title = "Custom color";
      picker.hidden = true;

      select.addEventListener("change", () => {
        if (select.value === "") {
          picker.hidden = true;
          setColor(field.id, "");
        } else if (select.value === CUSTOM) {
          picker.hidden = false;
          if (!getColor(field.id) || isPreset(getColor(field.id))) {
            picker.value = "#3b82f6";
            setColor(field.id, picker.value);
          } else {
            picker.value = getColor(field.id);
          }
        } else {
          picker.hidden = true;
          setColor(field.id, select.value);
        }
        syncDialog(container);
      });

      picker.addEventListener("input", () => {
        setColor(field.id, picker.value);
        syncDialog(container);
      });

      row.append(label, select, picker);
      container.appendChild(row);
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "btn btn-reset";
    resetBtn.textContent = "Reset all (Dark theme)";
    resetBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("sudoku:reset-appearance"));
    });
    container.appendChild(resetBtn);

    syncDialog(container);
  }

  function syncDialog(container) {
    FIELDS.forEach((field) => {
      const row = container.querySelector(`[data-field="${field.id}"]`);
      if (!row) return;

      const select = row.querySelector(".setting-select");
      const picker = row.querySelector(".setting-color-picker");
      const value = getColor(field.id);
      const selected = selectValueForField(field.id);

      select.value = selected;
      picker.hidden = selected !== CUSTOM;
      if (selected === CUSTOM && value) picker.value = value;
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
