window.CatModels = (() => {
  const SVG = `
    <svg class="cat-sprite" viewBox="0 0 80 50" width="52" height="34" aria-hidden="true">
      <g class="cat-view-side">
        <path class="cf cat-tail" d="M14 34 L9 33 L6 28 L7 22 L10 18 L12 21 L13 27 L14 34 Z"/>
        <path class="cf cat-body" d="M16 32 L20 26 L30 23 L44 23 L54 26 L58 30 L57 34 L52 36 L36 36 L22 35 L16 32 Z"/>
        <g class="cat-head">
          <path class="cf" d="M46 24 L50 19 L58 19 L62 24 L62 29 L58 33 L50 33 L46 29 Z"/>
          <path class="cf" d="M49 19 L51 14 L53 19 Z"/>
          <path class="cf" d="M57 19 L59 13 L62 20 Z"/>
          <rect class="cat-eye" x="52" y="24" width="2" height="2" rx="0.3"/>
          <rect class="cat-eye" x="56" y="24" width="2" height="2" rx="0.3"/>
        </g>
        <g class="cat-legs">
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M22 35 L23 47 L20 50 L26 50 L28 47 L27 35 Z"/>
            <path class="cf" d="M28 35 L28 46 L25 49 L31 49 L33 46 L32 35 Z"/>
            <path class="cf" d="M40 35 L39 46 L36 49 L42 49 L44 46 L43 35 Z"/>
            <path class="cf" d="M48 35 L49 47 L46 50 L52 50 L54 47 L50 35 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M22 35 L21 46 L18 49 L24 49 L26 46 L25 35 Z"/>
            <path class="cf" d="M28 35 L29 47 L26 50 L32 50 L34 47 L33 35 Z"/>
            <path class="cf" d="M40 35 L41 47 L38 50 L44 50 L46 47 L45 35 Z"/>
            <path class="cf" d="M48 35 L47 46 L44 49 L50 49 L52 46 L51 35 Z"/>
          </g>
        </g>
      </g>
      <g class="cat-view-front">
        <path class="cf cat-tail" d="M10 32 L8 28 L9 23 L11 21 L12 26 L10 32 Z"/>
        <path class="cf" d="M22 36 L24 28 L30 24 L38 24 L44 28 L46 36 L42 38 L30 38 L22 36 Z"/>
        <path class="cf" d="M28 22 L30 16 L34 22 Z"/>
        <path class="cf" d="M46 22 L48 16 L52 22 Z"/>
        <rect class="cat-eye" x="31" y="26" width="2" height="2" rx="0.3"/>
        <rect class="cat-eye" x="37" y="26" width="2" height="2" rx="0.3"/>
        <path class="cf cat-mouth" d="M32 31 L34 33 L38 33 L40 31 Z"/>
        <path class="cf" d="M26 36 L25 48 L22 50 L28 50 L30 48 L28 36 Z"/>
        <path class="cf" d="M50 36 L49 48 L46 50 L52 50 L54 48 L52 36 Z"/>
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
