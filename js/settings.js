const Settings = (() => {
  const STORAGE_KEY = "sudoku-colors";

  const PRESETS = [
    "#ffffff", "#000000", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
    "#78716c", "#64748b", "#1e293b", "#94a3b8",
  ];

  const FIELDS = [
    { id: "borderStrong", label: "Outer borders", var: "--board-border-strong" },
    { id: "border", label: "Grid lines", var: "--board-border" },
    { id: "fontColor", label: "Numbers", var: "--board-font" },
    { id: "highlightValue", label: "Match tint", var: "--board-highlight-value" },
    { id: "highlightPeer", label: "Row/col tint", var: "--board-highlight-peer" },
  ];

  let colors = {};
  let openMenu = null;
  let panelContainer = null;

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
    if (!value) delete colors[id];
    else colors[id] = value;
    save();
    apply();
    if (panelContainer) syncPanel(panelContainer);
  }

  function getColor(id) {
    return colors[id] || "";
  }

  function reset() {
    colors = {};
    localStorage.removeItem(STORAGE_KEY);
    apply();
    if (panelContainer) syncPanel(panelContainer);
  }

  function closeAllMenus() {
    if (!panelContainer) return;
    panelContainer.querySelectorAll(".color-menu").forEach((m) => {
      m.hidden = true;
    });
    panelContainer.querySelectorAll(".color-toggle").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
    });
    openMenu = null;
  }

  function toggleMenu(menu, toggleBtn) {
    const willOpen = menu.hidden;
    closeAllMenus();
    if (willOpen) {
      menu.hidden = false;
      toggleBtn.setAttribute("aria-expanded", "true");
      openMenu = menu;
    }
  }

  function updateCurrentSwatch(swatch, fieldId) {
    const value = getColor(fieldId);
    swatch.classList.toggle("is-theme", !value);
    if (value) swatch.style.backgroundColor = value;
    else swatch.style.backgroundColor = "";
  }

  function buildPanel(container) {
    panelContainer = container;
    container.innerHTML = "";

    FIELDS.forEach((field) => {
      const item = document.createElement("div");
      item.className = "settings-item";
      item.dataset.field = field.id;

      const head = document.createElement("div");
      head.className = "settings-item-head";

      const label = document.createElement("span");
      label.className = "settings-item-label";
      label.textContent = field.label;

      const current = document.createElement("span");
      current.className = "color-current-swatch";
      current.title = "Current color";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "btn btn-icon color-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Choose color for ${field.label}`);
      toggle.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

      const menu = document.createElement("div");
      menu.className = "color-menu";
      menu.hidden = true;

      const grid = document.createElement("div");
      grid.className = "color-menu-grid";

      const defaultBtn = document.createElement("button");
      defaultBtn.type = "button";
      defaultBtn.className = "color-opt theme-default";
      defaultBtn.title = "Theme default";
      defaultBtn.addEventListener("click", () => {
        setColor(field.id, "");
        closeAllMenus();
      });
      grid.appendChild(defaultBtn);

      PRESETS.forEach((hex) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "color-opt";
        btn.style.backgroundColor = hex;
        btn.title = hex;
        btn.dataset.color = hex;
        btn.addEventListener("click", () => {
          setColor(field.id, hex);
          closeAllMenus();
        });
        grid.appendChild(btn);
      });

      const pickerWrap = document.createElement("label");
      pickerWrap.className = "color-picker-label";
      pickerWrap.title = "Custom color";

      const picker = document.createElement("input");
      picker.type = "color";
      picker.className = "color-menu-picker";
      picker.value = getColor(field.id) || "#3b82f6";
      picker.addEventListener("input", () => {
        setColor(field.id, picker.value);
      });

      pickerWrap.appendChild(picker);
      menu.append(grid, pickerWrap);

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu(menu, toggle);
      });

      head.append(label, current, toggle);
      item.append(head, menu);
      container.appendChild(item);

      updateCurrentSwatch(current, field.id);
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "btn btn-reset";
    resetBtn.textContent = "Reset";
    resetBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("sudoku:reset-appearance"));
    });
    container.appendChild(resetBtn);

    document.addEventListener("click", (e) => {
      if (!openMenu) return;
      if (e.target.closest(".settings-item")) return;
      closeAllMenus();
    });
  }

  function syncPanel(container) {
    FIELDS.forEach((field) => {
      const item = container.querySelector(`[data-field="${field.id}"]`);
      if (!item) return;

      const swatch = item.querySelector(".color-current-swatch");
      updateCurrentSwatch(swatch, field.id);

      const value = getColor(field.id);
      item.querySelectorAll(".color-opt:not(.theme-default)").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color === value);
      });
      item.querySelector(".theme-default")?.classList.toggle("active", !value);

      const picker = item.querySelector(".color-menu-picker");
      if (picker && value) picker.value = value;
    });
  }

  return {
    load,
    reset,
    getColor,
    setColor,
    buildPanel,
    syncPanel,
    closeAllMenus,
  };
})();
