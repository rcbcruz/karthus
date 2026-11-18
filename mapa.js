/* Mini mapa da selva com a rota do clear (usado no site, no editor de guias e na tela Carregamento da live).
   MapaSelva.svg(rota, { lado: "azul"|"vermelho", animar: true, clicavel: false, numeros: true })
   rota = ["azul", "sapo", "lobos", ...]; no lado vermelho o mapa é espelhado (a base fica em cima, à direita).
   Coordenadas aproximadas do Summoner's Rift (0..100, base azul embaixo à esquerda). */
(function () {
  const C = {   // campos da selva do time azul
    azul: [24.6, 46.5, "Azul"], sapo: [15.8, 43, "Sapo"], lobos: [25, 56.6, "Lobos"],
    galinhas: [47.2, 62.5, "Galinhas"], vermelho: [52.3, 73.6, "Vermelho"], golens: [56.6, 82, "Golens"],
    caranguejo_topo: [31, 37, "Caranguejo de cima"], caranguejo_baixo: [68.7, 63, "Caranguejo de baixo"],
  };
  const COR = { azul: "#5aa9ff", vermelho: "#ff6a5a", sapo: "#7fd17a", lobos: "#b8c2cc", galinhas: "#e7b75e", golens: "#c9a27e",
                caranguejo_topo: "#7fe0d0", caranguejo_baixo: "#7fe0d0" };
  let n = 0;
  function pos(k, lado) { const [x, y] = C[k]; return lado === "vermelho" ? [100 - x, 100 - y] : [x, y]; }

  function svg(rota, op = {}) {
    const lado = op.lado === "vermelho" ? "vermelho" : "azul", id = "ms" + (++n);
    const meus = Object.keys(C), r = (rota || []).filter(k => C[k]);
    const pontos = r.map(k => pos(k, lado));
    let caminho = "";
    pontos.forEach(([x, y], i) => {
      if (!i) { caminho += `M${x} ${y}`; return; }
      const [px, py] = pontos[i - 1], mx = (px + x) / 2, my = (py + y) / 2, dx = x - px, dy = y - py, l = Math.hypot(dx, dy) || 1;
      caminho += ` Q${(mx - dy / l * 4).toFixed(1)} ${(my + dx / l * 4).toFixed(1)} ${x} ${y}`;   // curva leve: a rota "anda" pela selva
    });
    const base = lado === "vermelho" ? [89, 11] : [11, 89], baseInimiga = lado === "vermelho" ? [11, 89] : [89, 11];
    const corTime = lado === "vermelho" ? "#ff6a5a" : "#5aa9ff", corInimigo = lado === "vermelho" ? "#5aa9ff" : "#ff6a5a";
    const campos = meus.map(k => {
      const [x, y] = pos(k, lado), i = r.indexOf(k), naRota = i >= 0, crab = k.startsWith("caranguejo");
      return `<g class="ms-campo${naRota ? " ms-na-rota" : ""}" data-campo="${k}" ${op.clicavel ? 'style="cursor:pointer"' : ""}>
        <title>${C[k][2]}</title>
        ${op.clicavel ? `<circle cx="${x}" cy="${y}" r="5.5" fill="transparent"/>` : ""}
        <rect x="${x - (crab ? 1.6 : 2.2)}" y="${y - (crab ? 1.6 : 2.2)}" width="${crab ? 3.2 : 4.4}" height="${crab ? 3.2 : 4.4}" rx=".6"
          transform="rotate(45 ${x} ${y})" fill="${naRota ? COR[k] : "rgba(255,255,255,.18)"}" stroke="${naRota ? "#fff" : "rgba(255,255,255,.35)"}" stroke-width=".4"/>
      </g>`;
    }).join("");
    const numeros = op.numeros === false ? "" : pontos.map(([x, y], i) => `
      <g class="ms-num" style="--i:${i}"><circle cx="${x + 3.6}" cy="${y - 3.6}" r="2.6" fill="rgba(0,0,0,.75)" stroke="${COR[r[i]]}" stroke-width=".5"/>
      <text x="${x + 3.6}" y="${y - 2.65}" text-anchor="middle" font-size="2.9" font-weight="700" fill="#fff" font-family="Rajdhani, sans-serif">${i + 1}</text></g>`).join("");
    // zoom: só a metade do mapa do seu time (onde fica a sua selva e os dois caranguejos)
    const vb = op.zoom ? (lado === "vermelho" ? "22 0 76 76" : "2 24 76 76") : "0 0 100 100";
    return `<svg class="mapa-selva${op.animar ? " ms-animar" : ""}${op.zoom ? " ms-zoom" : ""}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rota: ${r.map(k => C[k][2]).join(", ") || "sem rota"}">
      <defs>
        <radialGradient id="${id}f" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#1d2a1d"/><stop offset="1" stop-color="#0c120d"/></radialGradient>
        <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d5560"/><stop offset=".5" stop-color="#3a6e78"/><stop offset="1" stop-color="#2d5560"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="3" fill="url(#${id}f)"/>
      <path d="M14 14 C34 34 66 66 86 86" stroke="url(#${id}r)" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/>
      <g fill="none" stroke="rgba(214,190,140,.22)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 84 L9 14 Q9 9 14 9 L84 9"/><path d="M16 91 L86 91 Q91 91 91 86 L91 16"/><path d="M15 85 L85 15"/>
      </g>
      <circle cx="${base[0]}" cy="${base[1]}" r="6" fill="${corTime}" opacity=".35"/><circle cx="${base[0]}" cy="${base[1]}" r="2.6" fill="${corTime}"/>
      <circle cx="${baseInimiga[0]}" cy="${baseInimiga[1]}" r="6" fill="${corInimigo}" opacity=".18"/><circle cx="${baseInimiga[0]}" cy="${baseInimiga[1]}" r="2.6" fill="${corInimigo}" opacity=".6"/>
      ${campos}
      ${caminho ? `<path class="ms-rota" d="${caminho}" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.4 1.6" opacity=".9" pathLength="100"/>` : ""}
      ${numeros}
    </svg>`;
  }

  // estilos (uma vez por página)
  const st = document.createElement("style");
  st.textContent = `
    .mapa-selva { display: block; width: 100%; height: auto; overflow: visible; }
    .mapa-selva.ms-zoom { overflow: hidden; }
    .mapa-selva .ms-rota { filter: drop-shadow(0 0 1.2px rgba(255,255,255,.7)); }
    .ms-animar .ms-rota { stroke-dasharray: 100; stroke-dashoffset: 100; animation: ms-desenhar 2.6s .4s cubic-bezier(.45, 0, .2, 1) forwards; }
    .ms-animar .ms-num { opacity: 0; animation: ms-surgir .45s ease-out forwards; animation-delay: calc(.4s + var(--i) * .42s); }
    .ms-animar .ms-na-rota rect { animation: ms-pulso 2.4s ease-in-out infinite; }
    @keyframes ms-desenhar { to { stroke-dashoffset: 0; } }
    @keyframes ms-surgir { from { opacity: 0; transform: translateY(1.5px); } to { opacity: 1; transform: none; } }
    @keyframes ms-pulso { 50% { filter: drop-shadow(0 0 1.6px #fff); } }`;
  document.head.appendChild(st);

  window.MapaSelva = { svg, CAMPOS: Object.fromEntries(Object.entries(C).map(([k, v]) => [k, v[2]])), COR };
})();
