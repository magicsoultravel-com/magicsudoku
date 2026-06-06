window.CatModels = (() => {
  const SVG = `
    <svg class="cat-sprite" viewBox="0 0 80 42" width="52" height="28" aria-hidden="true">
      <g class="cat-view-side">
        <path class="cf cat-tail" d="M16 28 L13 27 L11 25 L10 22 L11 19 L13 20 L15 25 L16 28 Z"/>
        <path class="cf cat-body" d="M17 28 L21 24 L32 22 L46 23 L54 25 L56 28 L54 31 L40 32 L24 31 L17 28 Z"/>
        <g class="cat-head">
          <path class="cf" d="M47 23 L50 19 L57 19 L60 23 L60 27 L57 30 L50 30 L47 27 Z"/>
          <path class="cf" d="M49 19 L51 15 L53 19 Z"/>
          <path class="cf" d="M56 19 L58 14 L60 20 Z"/>
          <rect class="cat-eye" x="52" y="23" width="1.6" height="1.6"/>
          <rect class="cat-eye" x="55" y="23" width="1.6" height="1.6"/>
        </g>
        <g class="cat-legs">
          <g class="cat-leg cat-leg-l1">
            <path class="cf" d="M23 30 L23.5 39 L22.6 41 L24.4 41 L25.1 39 L24.8 30 Z"/>
          </g>
          <g class="cat-leg cat-leg-l2">
            <path class="cf" d="M28 30 L28.5 39 L27.6 41 L29.4 41 L30.1 39 L29.8 30 Z"/>
          </g>
          <g class="cat-leg cat-leg-l3">
            <path class="cf" d="M40 30 L40.5 39 L39.6 41 L41.4 41 L42.1 39 L41.8 30 Z"/>
          </g>
          <g class="cat-leg cat-leg-l4">
            <path class="cf" d="M47 30 L47.5 39 L46.6 41 L48.4 41 L49.1 39 L48.8 30 Z"/>
          </g>
        </g>
      </g>
      <g class="cat-view-lie">
        <path class="cf cat-tail" d="M12 41 L9 40 L8 38 L9 36 L11 37 L12 41 Z"/>
        <path class="cf cat-body" d="M14 42 L24 40 L40 39 L56 40 L64 42 L56 41 L40 40 L22 41 L14 42 Z"/>
        <path class="cf" d="M56 40 L60 38 L64 39 L65 42 L61 42 L56 40 Z"/>
        <rect class="cat-eye" x="59" y="39" width="1.4" height="1.4"/>
      </g>
      <g class="cat-view-front">
        <path class="cf cat-tail" d="M10 29 L9 26 L10 23 L11 25 L10 29 Z"/>
        <path class="cf" d="M24 32 L26 26 L32 23 L38 23 L42 26 L44 32 L40 33 L30 33 L24 32 Z"/>
        <path class="cf" d="M29 21 L31 16 L34 21 Z"/>
        <path class="cf" d="M44 21 L46 16 L49 21 Z"/>
        <rect class="cat-eye" x="31" y="25" width="1.6" height="1.6"/>
        <rect class="cat-eye" x="36" y="25" width="1.6" height="1.6"/>
        <path class="cf cat-mouth" d="M32 28 L34 29.5 L38 29.5 L40 28 Z"/>
        <path class="cf" d="M28 32 L28.5 39 L27.6 41 L29.4 41 L30.1 39 L29.8 32 Z"/>
        <path class="cf" d="M48 32 L48.5 39 L47.6 41 L49.4 41 L50.1 39 L49.8 32 Z"/>
      </g>
    </svg>`;

  function mount(container) {
    container.querySelectorAll(".cat-model-wrap").forEach((el) => el.remove());
    const wrap = document.createElement("div");
    wrap.className = "cat-model-wrap";
    wrap.innerHTML = SVG;
    container.appendChild(wrap);
  }

  return { mount };
})();
