window.CatModels = (() => {
  const SVG = `
    <svg class="cat-sprite" viewBox="0 0 80 56" width="52" height="36" aria-hidden="true">
      <g class="cat-view-side">
        <path class="cf cat-tail" d="M16 31 C12 30 9 27 8 24 C7 21 8 18 10 16 C11 15 12 16 12 18 C11 20 10 23 11 26 C12 28 14 30 16 31 Z"/>
        <path class="cf" d="M16 28 C18 24 22 22 28 21 C34 20 42 20 48 21 C54 22 58 25 59 28 C60 31 59 34 56 35 C52 36 46 36 40 36 C34 36 28 35 24 34 C20 33 16 31 16 28 Z"/>
        <path class="cf" d="M48 19 C52 16 57 15 61 17 C65 19 67 23 66 27 C65 31 61 33 57 33 C53 33 50 30 49 26 C48 23 48 21 48 19 Z"/>
        <path class="cf" d="M50 17 L52 12 L54 17 Z"/>
        <path class="cf" d="M58 17 L60 11 L63 18 Z"/>
        <g class="cat-legs">
          <g class="cat-leg cat-leg-a">
            <path class="cf" d="M22 35 L24 47 L22 49 L26 49 L28 47 L26 35 Z"/>
            <path class="cf" d="M28 35 L27 46 L25 48 L29 48 L31 46 L30 35 Z"/>
            <path class="cf" d="M40 35 L38 46 L36 48 L40 48 L42 46 L42 35 Z"/>
            <path class="cf" d="M48 35 L50 47 L48 49 L52 49 L54 47 L50 35 Z"/>
          </g>
          <g class="cat-leg cat-leg-b">
            <path class="cf" d="M22 35 L20 46 L18 48 L22 48 L24 46 L24 35 Z"/>
            <path class="cf" d="M28 35 L30 47 L28 49 L32 49 L34 47 L32 35 Z"/>
            <path class="cf" d="M40 35 L42 47 L40 49 L44 49 L46 47 L44 35 Z"/>
            <path class="cf" d="M48 35 L46 46 L44 48 L48 48 L50 46 L48 35 Z"/>
          </g>
        </g>
      </g>
      <g class="cat-view-front">
        <path class="cf" d="M24 34 C22 32 22 28 24 24 C26 20 30 18 34 18 C38 18 42 20 44 22 C46 24 50 24 52 22 C54 20 58 18 62 18 C66 18 70 20 72 24 C74 28 74 32 72 34 C70 36 66 36 64 34 C62 32 58 32 56 34 C54 36 50 36 48 34 C46 32 42 32 40 34 C38 36 34 36 32 34 C30 32 26 32 24 34 Z"/>
        <path class="cf" d="M30 14 L32 8 L36 14 Z"/>
        <path class="cf" d="M48 14 L50 8 L54 14 Z"/>
        <path class="cf cat-tail" d="M10 30 C8 28 7 25 8 22 C9 19 10 18 11 19 C12 20 11 22 11 24 C11 26 11 28 10 30 Z"/>
        <path class="cf" d="M28 34 L27 48 L25 50 L29 50 L31 48 L30 34 Z"/>
        <path class="cf" d="M50 34 L49 48 L47 50 L51 50 L53 48 L52 34 Z"/>
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
