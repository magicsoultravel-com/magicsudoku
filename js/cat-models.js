window.CatModels = (() => {
  const LABELS = ["", "Classic", "Willow", "Siamese"];

  const MODELS = {
    1: `
      <svg class="cat-sprite" viewBox="0 0 80 56" width="52" height="36" aria-hidden="true">
        <g class="cat-view-side">
          <g class="cat-tail">
            <path class="cf" d="M6 34 C2 30 1 24 3 18 C5 14 8 12 11 14 C13 16 12 20 10 23 C8 26 7 30 8 33 C9 35 8 36 6 34 Z"/>
            <path class="cs" d="M4 28 C5 24 7 20 9 17" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>
          </g>
          <path class="cf" d="M14 30 C16 26 20 23 26 21 C32 19 40 19 46 21 C52 23 56 26 57 30 C58 34 56 37 52 38 C48 39 42 39 36 39 C30 39 24 38 20 36 C16 34 14 32 14 30 Z"/>
          <path class="cl" d="M22 28 C28 26 36 26 42 28 C44 30 44 33 42 35 C36 37 28 37 22 35 C20 33 20 30 22 28 Z"/>
          <path class="cs" d="M24 24 L28 22 M30 23 L34 21 M38 24 L42 22" stroke="currentColor" stroke-width="0.7" fill="none" opacity="0.35"/>
          <path class="cf" d="M46 20 C50 17 54 16 58 18 C62 20 64 24 63 28 C62 32 58 34 54 34 C50 34 47 31 46 27 C45 24 45 22 46 20 Z"/>
          <path class="cf" d="M48 18 L50 11 L53 18 Z"/>
          <path class="cf" d="M56 18 L58 10 L62 19 Z"/>
          <path class="cl" d="M52 22 C54 21 56 22 56 24 C56 26 54 27 52 26 C50 25 50 23 52 22 Z"/>
          <ellipse class="ce" cx="58" cy="24" rx="1.2" ry="2"/>
          <path class="ce" d="M62 26 L64 27 L62 28 Z"/>
          <path class="cw" d="M62 25 L68 23 M62 26 L68 26 M62 27 L68 29" stroke="currentColor" stroke-width="0.45" fill="none" opacity="0.45"/>
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M22 38 L21 48 L19 50 L23 50 L25 48 L24 38 Z M44 38 L43 48 L41 50 L45 50 L47 48 L46 38 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M24 38 L23 49 L21 51 L25 51 L27 49 L26 38 Z M46 38 L45 49 L43 51 L47 51 L49 49 L48 38 Z"/>
          </g>
        </g>
        <g class="cat-view-front">
          <path class="cf" d="M22 36 C20 34 20 30 22 26 C24 22 28 20 32 20 C36 20 40 22 42 24 C44 26 48 26 50 24 C52 22 56 20 60 20 C64 20 68 22 70 26 C72 30 72 34 70 36 C68 38 64 38 62 36 C60 34 56 34 54 36 C52 38 48 38 46 36 C44 34 40 34 38 36 C36 38 32 38 30 36 C28 34 24 34 22 36 Z"/>
          <path class="cl" d="M28 26 C36 24 44 24 52 26 C54 28 54 32 52 34 C44 36 36 36 28 34 C26 32 26 28 28 26 Z"/>
          <path class="cf" d="M30 16 L32 8 L36 16 Z"/>
          <path class="cf" d="M48 16 L50 8 L54 16 Z"/>
          <ellipse class="ce" cx="36" cy="22" rx="1.5" ry="2.2"/>
          <ellipse class="ce" cx="44" cy="22" rx="1.5" ry="2.2"/>
          <path class="ce" d="M38 28 L42 28 L40 30 Z"/>
          <path class="cw" d="M34 26 L28 24 M34 27 L28 27 M34 28 L28 30 M46 26 L52 24 M46 27 L52 27 M46 28 L52 30" stroke="currentColor" stroke-width="0.45" fill="none" opacity="0.45"/>
          <path class="cf" d="M8 32 C6 28 6 24 8 20 C9 18 11 17 12 18 C13 19 13 21 12 23 C11 25 11 28 12 30 C13 32 12 34 10 34 C8 34 7 32 8 32 Z"/>
          <path class="cf" d="M28 36 L27 48 L25 50 L29 50 L31 48 L30 36 Z M50 36 L49 48 L47 50 L51 50 L53 48 L52 36 Z"/>
        </g>
      </svg>`,
    2: `
      <svg class="cat-sprite" viewBox="0 0 80 56" width="52" height="36" aria-hidden="true">
        <g class="cat-view-side">
          <g class="cat-tail">
            <path class="cf" d="M4 32 C1 28 0 22 2 16 C3 13 5 12 7 14 C9 16 8 20 7 24 C6 28 6 32 7 35 C8 37 6 37 4 32 Z"/>
          </g>
          <path class="cf" d="M12 28 C14 24 18 21 24 20 C30 19 38 19 44 20 C50 21 54 24 55 28 C56 32 54 35 50 36 C46 37 40 37 34 37 C28 37 22 36 18 34 C14 32 12 30 12 28 Z"/>
          <path class="cl" d="M20 27 C26 25 34 25 40 27 C42 29 41 32 39 33 C33 35 26 35 20 33 C18 31 18 29 20 27 Z"/>
          <path class="cf" d="M44 18 C48 15 53 14 57 16 C61 18 63 22 62 26 C61 30 57 32 53 32 C49 32 46 29 45 25 C44 22 44 20 44 18 Z"/>
          <path class="cf" d="M46 16 L48 9 L51 16 Z"/>
          <path class="cf" d="M54 16 L56 8 L60 17 Z"/>
          <ellipse class="ce" cx="57" cy="22" rx="1" ry="1.8"/>
          <path class="ce" d="M61 24 L63 25 L61 26 Z"/>
          <path class="cw" d="M61 23 L67 21 M61 24 L67 24 M61 25 L67 26" stroke="currentColor" stroke-width="0.4" fill="none" opacity="0.4"/>
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M20 36 L18 50 L16 52 L20 52 L22 50 L21 36 Z M42 36 L40 50 L38 52 L42 52 L44 50 L43 36 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M22 36 L20 51 L18 53 L22 53 L24 51 L23 36 Z M44 36 L42 51 L40 53 L44 53 L46 51 L45 36 Z"/>
          </g>
        </g>
        <g class="cat-view-front">
          <path class="cf" d="M24 34 C22 32 22 28 24 24 C26 20 30 18 34 18 C38 18 42 20 44 22 C46 24 50 24 52 22 C54 20 58 18 62 18 C66 18 70 20 72 24 C74 28 74 32 72 34 C70 36 66 36 64 34 C62 32 58 32 56 34 C54 36 50 36 48 34 C46 32 42 32 40 34 C38 36 34 36 32 34 C30 32 26 32 24 34 Z"/>
          <path class="cl" d="M30 24 C38 22 46 22 54 24 C56 26 55 30 53 31 C46 33 38 33 30 31 C28 29 28 26 30 24 Z"/>
          <path class="cf" d="M32 14 L34 6 L38 14 Z"/>
          <path class="cf" d="M50 14 L52 6 L56 14 Z"/>
          <ellipse class="ce" cx="38" cy="20" rx="1.2" ry="2"/>
          <ellipse class="ce" cx="46" cy="20" rx="1.2" ry="2"/>
          <path class="ce" d="M40 26 L44 26 L42 28 Z"/>
          <path class="cw" d="M36 24 L30 22 M36 25 L30 25 M46 24 L52 22 M46 25 L52 25" stroke="currentColor" stroke-width="0.4" fill="none" opacity="0.4"/>
          <path class="cf" d="M30 34 L28 50 L26 52 L30 52 L32 50 L31 34 Z M52 34 L50 50 L48 52 L52 52 L54 50 L53 34 Z"/>
        </g>
      </svg>`,
    3: `
      <svg class="cat-sprite" viewBox="0 0 80 56" width="52" height="36" aria-hidden="true">
        <g class="cat-view-side">
          <g class="cat-tail">
            <path class="cf" d="M3 30 C0 26 0 20 2 14 C3 11 5 10 7 12 C9 14 8 18 7 22 C6 26 5 30 6 33 C7 35 5 35 3 30 Z"/>
          </g>
          <path class="cf" d="M11 26 C13 22 18 19 24 18 C30 17 38 17 46 18 C52 19 57 22 58 26 C59 30 57 33 53 34 C49 35 42 35 36 35 C30 35 24 34 20 32 C16 30 14 28 11 26 Z"/>
          <path class="cl" d="M20 25 C28 23 36 23 44 25 C46 27 45 30 43 31 C36 33 28 33 20 31 C18 29 18 27 20 25 Z"/>
          <path class="cf" d="M46 16 C51 12 57 11 62 14 C67 17 69 22 68 27 C67 32 62 35 57 35 C52 35 48 31 47 26 C46 22 46 18 46 16 Z"/>
          <path class="cf" d="M48 14 L51 5 L54 14 Z"/>
          <path class="cf" d="M58 14 L61 4 L66 15 Z"/>
          <path class="cl" d="M54 20 C56 19 58 20 58 22 C58 24 56 25 54 24 C52 23 52 21 54 20 Z"/>
          <ellipse class="ce" cx="62" cy="22" rx="1.3" ry="2.2"/>
          <path class="ce" d="M66 24 L68 25 L66 26 Z"/>
          <path class="cw" d="M66 23 L72 20 M66 24 L72 24 M66 25 L72 27" stroke="currentColor" stroke-width="0.45" fill="none" opacity="0.45"/>
          <path class="cs" d="M28 22 L32 20 M36 21 L40 19" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.3"/>
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M19 34 L17 50 L15 52 L19 52 L21 50 L20 34 Z M43 34 L41 50 L39 52 L43 52 L45 50 L44 34 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M21 34 L19 51 L17 53 L21 53 L23 51 L22 34 Z M45 34 L43 51 L41 53 L45 53 L47 51 L46 34 Z"/>
          </g>
        </g>
        <g class="cat-view-front">
          <path class="cf" d="M26 32 C24 30 24 26 26 22 C28 18 32 16 36 16 C40 16 44 18 46 20 C48 22 52 22 54 20 C56 18 60 16 64 16 C68 16 72 18 74 22 C76 26 76 30 74 32 C72 34 68 34 66 32 C64 30 60 30 58 32 C56 34 52 34 50 32 C48 30 44 30 42 32 C40 34 36 34 34 32 C32 30 28 30 26 32 Z"/>
          <path class="cl" d="M32 22 C40 20 48 20 56 22 C58 24 57 28 55 29 C48 31 40 31 32 29 C30 27 30 24 32 22 Z"/>
          <path class="cf" d="M34 12 L36 3 L40 12 Z"/>
          <path class="cf" d="M52 12 L54 3 L58 12 Z"/>
          <ellipse class="ce" cx="40" cy="18" rx="1.3" ry="2.2"/>
          <ellipse class="ce" cx="48" cy="18" rx="1.3" ry="2.2"/>
          <path class="ce" d="M42 24 L46 24 L44 26 Z"/>
          <path class="cw" d="M38 22 L32 20 M38 23 L32 23 M38 24 L32 25 M50 22 L56 20 M50 23 L56 23 M50 24 L56 25" stroke="currentColor" stroke-width="0.45" fill="none" opacity="0.45"/>
          <path class="cf" d="M32 32 L30 50 L28 52 L32 52 L34 50 L33 32 Z M54 32 L52 50 L50 52 L54 52 L56 50 L55 32 Z"/>
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
