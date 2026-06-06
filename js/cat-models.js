window.CatModels = (() => {
  const LABELS = ["", "Classic", "Fluffy", "Sleek"];

  const MODELS = {
    1: `
      <svg class="cat-sprite" viewBox="0 0 64 44" width="48" height="33" aria-hidden="true">
        <g class="cat-view-side">
          <path class="cf" d="M4 30 C2 26 2 18 6 12 C10 8 16 8 22 10 C28 12 34 10 40 14 C46 18 48 24 46 30 L44 36 C42 40 36 42 28 42 H14 C8 42 4 38 4 32 V24 Z"/>
          <path class="cl" d="M16 24 C22 22 30 22 36 24 V32 C30 34 22 34 16 32 Z"/>
          <path class="cs" d="M14 16 H18 V18 H14 Z M22 16 H26 V18 H22 Z M30 18 H33 V20 H30 Z"/>
          <path class="cf" d="M36 12 C40 8 46 8 50 12 L52 18 C54 22 52 26 48 28 H40 C36 28 34 24 34 20 V14 Z"/>
          <path class="cf" d="M38 10 L40 4 L44 10 Z"/>
          <path class="cf" d="M46 10 L48 4 L52 12 Z"/>
          <circle class="ce" cx="46" cy="18" r="2"/>
          <path class="ce" d="M52 20 L54 21 L52 22 Z"/>
          <path class="cf" d="M6 28 C2 22 2 14 6 8 C8 6 10 6 12 8 C14 10 14 14 12 18 C10 22 10 26 8 28 C6 30 4 30 4 26 C4 22 6 18 6 28 Z"/>
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M16 34 V42 H24 V34 Z M34 34 V42 H42 V34 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M18 34 V42 H26 V34 Z M36 34 V42 H44 V34 Z"/>
          </g>
        </g>
        <g class="cat-view-front">
          <path class="cf" d="M8 30 C6 28 6 24 8 20 C10 16 14 14 18 14 C22 14 26 16 28 18 C30 20 34 20 36 18 C38 16 42 14 46 14 C50 14 54 16 56 20 C58 24 58 28 56 30 C54 32 50 32 48 30 C46 28 42 28 40 30 C38 32 34 32 32 30 C30 28 26 28 24 30 C22 32 18 32 16 30 C14 28 10 28 8 30 Z"/>
          <path class="cl" d="M18 22 C26 20 34 20 42 22 V32 C34 34 26 34 18 32 Z"/>
          <path class="cf" d="M20 8 L22 2 L26 8 Z"/>
          <path class="cf" d="M38 8 L40 2 L44 8 Z"/>
          <circle class="ce" cx="26" cy="16" r="2"/>
          <circle class="ce" cx="38" cy="16" r="2"/>
          <path class="ce" d="M30 22 H34 V24 H30 Z"/>
          <path class="cf" d="M6 28 C4 24 4 20 6 16 C7 14 9 13 10 14 C11 15 11 17 10 19 C9 21 9 24 10 26 C11 28 10 30 8 30 C6 30 5 28 6 28 Z"/>
          <path class="cf" d="M18 32 V42 H28 V32 Z M36 32 V42 H46 V32 Z"/>
        </g>
      </svg>`,
    2: `
      <svg class="cat-sprite" viewBox="0 0 64 44" width="48" height="33" aria-hidden="true">
        <g class="cat-view-side">
          <ellipse class="cf" cx="28" cy="26" rx="18" ry="12"/>
          <ellipse class="cl" cx="28" cy="27" rx="12" ry="7"/>
          <ellipse class="cf" cx="42" cy="16" rx="10" ry="9"/>
          <path class="cf" d="M34 10 L36 4 L41 11 Z"/>
          <path class="cf" d="M44 8 L46 2 L51 10 Z"/>
          <circle class="ce" cx="40" cy="15" r="2"/>
          <circle class="ce" cx="46" cy="15" r="1.5"/>
          <path class="cf" d="M4 24 C0 18 0 10 6 6 C10 4 14 6 14 10 C14 14 12 18 10 22 C8 26 8 30 12 32 C14 33 14 36 12 38 C10 40 6 38 4 32 C2 28 2 24 4 24 Z"/>
          <path class="cf" d="M6 20 C4 14 6 8 12 6 C14 5 16 6 16 8 C16 10 14 12 12 16 C10 20 10 24 12 28 C14 30 14 32 12 34 C10 36 8 34 6 28 C4 22 4 18 6 20 Z" opacity="0.8"/>
          <g class="cat-leg cat-leg-a">
            <rect class="cf" x="16" y="34" width="7" height="9" rx="2"/>
            <rect class="cf" x="28" y="34" width="7" height="9" rx="2"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <rect class="cf" x="19" y="34" width="7" height="9" rx="2"/>
            <rect class="cf" x="31" y="34" width="7" height="9" rx="2"/>
          </g>
        </g>
        <g class="cat-view-front">
          <ellipse class="cf" cx="32" cy="24" rx="18" ry="14"/>
          <ellipse class="cl" cx="32" cy="26" rx="12" ry="8"/>
          <ellipse class="cf" cx="32" cy="12" rx="12" ry="10"/>
          <path class="cf" d="M22 8 L24 2 L30 9 Z"/>
          <path class="cf" d="M34 6 L36 0 L42 8 Z"/>
          <circle class="ce" cx="27" cy="12" r="2"/>
          <circle class="ce" cx="37" cy="12" r="2"/>
          <path class="ce" d="M29 16 H35 V18 H29 Z"/>
          <path class="cf" d="M8 26 C4 22 4 16 8 12 C10 10 12 10 14 12 C16 14 16 18 14 22 C12 26 10 28 8 26 Z"/>
          <rect class="cf" x="18" y="34" width="9" height="9" rx="2"/>
          <rect class="cf" x="37" y="34" width="9" height="9" rx="2"/>
        </g>
      </svg>`,
    3: `
      <svg class="cat-sprite" viewBox="0 0 64 44" width="48" height="33" aria-hidden="true">
        <g class="cat-view-side">
          <path class="cf" d="M10 28 L14 12 C16 6 22 4 30 6 L42 8 C48 9 52 14 52 20 V28 C52 34 48 38 42 38 H24 C18 38 14 34 12 30 L10 28 Z"/>
          <path class="cl" d="M18 22 L36 20 V30 L18 32 Z"/>
          <path class="cf" d="M34 10 L38 4 L44 12 Z"/>
          <path class="cf" d="M42 8 L46 2 L52 12 Z"/>
          <path class="cf" d="M38 12 C44 10 50 12 54 18 L56 26 C57 30 55 34 50 34 H44 C40 34 38 30 38 26 V20 C38 16 36 14 38 12 Z"/>
          <ellipse class="ce" cx="46" cy="17" rx="1.5" ry="2"/>
          <path class="ce" d="M52 19 H55 V20 H52 Z"/>
          <path class="cf" d="M2 26 C0 18 4 10 12 8 C14 8 16 10 15 12 C14 14 12 16 10 20 C8 24 8 28 12 30 C14 31 14 34 12 36 C10 38 6 36 4 30 C2 26 2 22 2 26 Z"/>
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M18 32 V44 H23 V32 Z M38 32 V44 H43 V32 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M20 32 V44 H25 V32 Z M40 32 V44 H45 V32 Z"/>
          </g>
        </g>
        <g class="cat-view-front">
          <path class="cf" d="M20 30 L24 14 H40 L44 30 Z"/>
          <path class="cl" d="M26 18 H38 V30 H26 Z"/>
          <path class="cf" d="M24 12 L26 4 L34 14 Z"/>
          <path class="cf" d="M36 10 L38 2 L46 14 Z"/>
          <ellipse class="ce" cx="28" cy="16" rx="1.5" ry="2"/>
          <ellipse class="ce" cx="38" cy="16" rx="1.5" ry="2"/>
          <path class="ce" d="M30 20 H38 V21 H30 Z"/>
          <path class="cf" d="M6 24 C4 18 8 12 14 10 C16 9 17 11 16 13 C15 15 13 17 12 20 C11 23 12 26 14 28 C15 29 15 31 13 32 C11 33 9 31 8 28 C7 25 6 22 6 24 Z"/>
          <path class="cf" d="M22 32 V44 H28 V32 Z M36 32 V44 H42 V32 Z"/>
        </g>
      </svg>`,
  };

  function mount(container) {
    container.querySelectorAll(".cat-model-wrap").forEach((el) => el.remove());
    Object.entries(MODELS).forEach(([id, html]) => {
      const wrap = document.createElement("div");
      wrap.className = "cat-model-wrap";
      wrap.dataset.catModel = id;
      wrap.hidden = true;
      wrap.innerHTML = html;
      container.appendChild(wrap);
    });
  }

  function show(container, modelId) {
    container.querySelectorAll(".cat-model-wrap").forEach((el) => {
      el.hidden = parseInt(el.dataset.catModel, 10) !== modelId;
    });
    container.dataset.model = String(modelId);
  }

  function label(modelId) {
    return LABELS[modelId] || "Off";
  }

  return { mount, show, label, LABELS };
})();
