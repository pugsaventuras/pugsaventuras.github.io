// 🎶 Caixinha da Joy e da Jane: musiquinhas e episódios tocando pelo player do YouTube (assim conta visualização no canal).
// - Musiquinhas: lista em musiquinhas.json ({ id, nome, desde }). Com "desde", só aparece depois do lançamento.
// - Episódios: vêm sozinhos do episodios.json (o GitHub atualiza com os vídeos do canal; entram os que têm "ep").
// - Só passam os NOSSOS vídeos, um atrás do outro: acabou a lista de músicas, vai para os episódios, e volta.
// - "Telinha": o vídeo fica pequeno no canto e a criança continua jogando. Ao trocar de página, a telinha volta
//   no mesmo vídeo e no mesmo ponto (é só tocar no ▶ para continuar).
(() => {
  if (window.PugsCaixinha) return;
  const RESERVA_MUS = [{ id: "d0eg8tHLH-Y", nome: "Tchau, tchau, Lambeijo!" }, { id: "JTYJNlcolCY", nome: "Dia das Crianças" }];
  const RESERVA_EPS = [{ id: "xPRLTGgTwU4", nome: "Ep. 1 · Procura-se uma pug" }, { id: "LefTp1EOWZ0", nome: "Ep. 2 · Os chinelos do papai" }, { id: "eY9A0SQG6yc", nome: "Ep. 3 · A roupinha de meia" }];
  const GUARDA = "pugs-tv";

  const css = document.createElement("style");
  css.textContent = `
.cx-fundo{position:fixed;inset:0;z-index:60;background:rgba(40,20,60,.45);display:flex;align-items:flex-end;justify-content:center;padding:10px}
.cx-fundo[hidden]{display:none}
.cx-caixa{position:relative;width:min(460px,100%);max-height:calc(100vh - 20px);overflow:auto;background:#fffdf7;border:4px solid #5a3a22;border-radius:26px;box-shadow:0 6px 0 #5a3a22;padding:12px 12px 14px;font-family:Fredoka,Arial,sans-serif;color:#5a3a22}
.cx-topo{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.cx-topo b{flex:1;font-size:1.3rem;line-height:1.15}
.cx-x,.cx-mini-btn{width:46px;height:46px;border-radius:50%;border:3px solid #5a3a22;background:#fff;font-size:1.25rem;cursor:pointer;flex:0 0 auto}
.cx-abas{display:flex;gap:8px;margin-bottom:8px}
.cx-abas button{flex:1;font:700 1.05rem Fredoka,Arial,sans-serif;color:#5a3a22;background:#fff;border:3px solid #5a3a22;border-radius:999px;padding:6px;cursor:pointer}
.cx-abas button.ativa{background:#ffd23f;box-shadow:0 3px 0 #5a3a22}
.cx-tela{position:relative;width:min(240px,60vw);aspect-ratio:9/16;margin:0 auto;border:4px solid #5a3a22;border-radius:18px;overflow:hidden;background:#2a1a3a}
.cx-tela.deitada{width:100%;aspect-ratio:16/9}
.cx-tela iframe,.cx-tela>div{position:absolute;inset:0;width:100%;height:100%;border:0}
.cx-aviso{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;padding:14px;font-size:1.05rem;pointer-events:none;background:rgba(42,26,58,.55)}
.cx-aviso[hidden]{display:none}
.cx-continuar{position:absolute;inset:0;margin:auto;width:84px;height:84px;border-radius:50%;border:4px solid #5a3a22;background:#ffd23f;font-size:2.2rem;cursor:pointer;z-index:2;box-shadow:0 4px 0 #5a3a22}
.cx-continuar[hidden]{display:none}
.cx-controles{display:flex;justify-content:center;gap:14px;margin:10px 0 6px}
.cx-controles button{width:62px;height:62px;border-radius:50%;border:4px solid #5a3a22;background:#ffd23f;font-size:1.6rem;box-shadow:0 4px 0 #5a3a22;cursor:pointer}
.cx-lista{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 4px;scroll-snap-type:x mandatory}
.cx-musica{flex:0 0 auto;width:110px;scroll-snap-align:start;border:3px solid #5a3a22;border-radius:16px;background:#fff;padding:4px;cursor:pointer;font:600 .85rem/1.15 Fredoka,Arial,sans-serif;color:#5a3a22;text-align:center}
.cx-musica img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:11px;display:block;margin-bottom:4px}
.cx-musica.ep img{aspect-ratio:16/10}
.cx-musica.tocando{background:#ffe1ee;border-color:#f06ea8;box-shadow:0 0 0 3px #f06ea8}
.cx-musica.tocando img{animation:cx-pula 1s ease-in-out infinite}
@keyframes cx-pula{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
/* telinha: pequena no canto, a criança continua jogando */
.cx-fundo.mini{background:none;pointer-events:none;align-items:flex-end;justify-content:flex-end;padding:0 12px 12px 0}
.cx-fundo.mini .cx-caixa{pointer-events:auto;width:auto;padding:6px;border-radius:20px;overflow:visible}
.cx-fundo.mini .cx-topo,.cx-fundo.mini .cx-abas,.cx-fundo.mini .cx-lista{display:none}
.cx-fundo.mini .cx-tela{width:min(150px,34vw);border-width:3px;border-radius:14px}
.cx-fundo.mini .cx-tela.deitada{width:min(260px,52vw)}
.cx-fundo.mini .cx-controles{gap:6px;margin:6px 0 0}
.cx-fundo.mini .cx-controles button{width:40px;height:40px;font-size:1.05rem;border-width:3px;box-shadow:0 3px 0 #5a3a22}
.cx-fundo.mini .cx-continuar{width:54px;height:54px;font-size:1.5rem}
.cx-so-mini{display:none}
.cx-fundo.mini .cx-so-mini{display:inline-block}
.cx-fundo.mini .cx-so-grande{display:none}
html.tema-halloween .cx-caixa{background:#fff6ee;border-color:#5b2d82;box-shadow:0 6px 0 #5b2d82}`;
  document.head.appendChild(css);

  const fundo = document.createElement("div"); fundo.className = "cx-fundo"; fundo.hidden = true;
  fundo.innerHTML = `<div class="cx-caixa" role="dialog" aria-label="Caixinha da Joy e da Jane">
    <div class="cx-topo"><span style="font-size:1.8rem">🎶</span><b>Caixinha da Joy e da Jane<br><small style="font-weight:500;font-size:.9rem">Escolha uma musiquinha ou um episódio 🐾</small></b>
      <button type="button" class="cx-mini-btn" id="cx-diminuir" aria-label="Deixar pequenininho e continuar brincando">↘️</button><button type="button" class="cx-x" aria-label="Fechar">✖</button></div>
    <div class="cx-abas"><button type="button" data-aba="mus" class="ativa">🎵 Musiquinhas</button><button type="button" data-aba="eps">📺 Episódios</button></div>
    <div class="cx-tela" id="cx-tela"><div id="cx-player"></div><div class="cx-aviso" id="cx-aviso">Abrindo... 🐾</div><button type="button" class="cx-continuar" id="cx-continuar" hidden aria-label="Continuar">▶️</button></div>
    <div class="cx-controles">
      <button type="button" class="cx-so-grande" id="cx-ant" aria-label="Anterior">⏮</button>
      <button type="button" id="cx-tocar" aria-label="Tocar ou pausar">▶️</button>
      <button type="button" id="cx-prox" aria-label="Próximo">⏭</button>
      <button type="button" class="cx-so-mini" id="cx-aumentar" aria-label="Ver grande">⤢</button>
      <button type="button" class="cx-so-mini" id="cx-fechar2" aria-label="Fechar">✖</button>
    </div>
    <div class="cx-lista" id="cx-lista"></div></div>`;
  document.body.appendChild(fundo);
  const $ = (s) => fundo.querySelector(s);

  const LISTAS = { mus: [], eps: [] };
  let aba = "mus", fila = "mus", atual = 0, player = null, tocando = false, pronto = false, listasProntas = null, inicio = null;
  const item = () => LISTAS[fila][atual];
  function aviso(t) { const a = $("#cx-aviso"); a.textContent = t || ""; a.hidden = !t; }
  function pintarLista() {
    $(".cx-abas").querySelectorAll("button").forEach((b) => b.classList.toggle("ativa", b.dataset.aba === aba));
    $("#cx-lista").innerHTML = LISTAS[aba].map((m, i) => `<button type="button" class="cx-musica${aba === "eps" ? " ep" : ""}${fila === aba && i === atual ? " tocando" : ""}" data-i="${i}"><img src="https://i.ytimg.com/vi/${m.id}/hqdefault.jpg" alt="" loading="lazy">${m.nome}</button>`).join("") || "<p>Em breve! 🐾</p>";
  }
  function formato() { $("#cx-tela").classList.toggle("deitada", fila === "eps"); }
  function guardar() {
    try {
      if (!player || !item() || !player.getCurrentTime) return;
      sessionStorage.setItem(GUARDA, JSON.stringify({ fila, atual, id: item().id, t: Math.floor(player.getCurrentTime() || 0), mini: fundo.classList.contains("mini"), quando: Date.now() }));
    } catch (e) {}
  }
  setInterval(() => { if (tocando) guardar(); }, 3000);
  addEventListener("pagehide", guardar);
  function tocar(qualFila, i, seg) {
    if (!player) return;
    const l = LISTAS[qualFila]; if (!l.length) return;
    fila = qualFila; atual = (i + l.length) % l.length; formato(); pintarLista();
    $("#cx-continuar").hidden = true;
    player.loadVideoById({ videoId: l[atual].id, startSeconds: seg || 0 });
    const b = $(".cx-musica.tocando"); if (b) b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  // acabou: o próximo da lista; no fim da lista, passa para a outra (músicas ↔ episódios). Só os nossos vídeos.
  function proximo() {
    if (atual + 1 < LISTAS[fila].length) return tocar(fila, atual + 1);
    const outra = fila === "mus" ? "eps" : "mus";
    if (LISTAS[outra].length) { aba = outra; tocar(outra, 0); } else tocar(fila, 0);
  }
  $("#cx-lista").addEventListener("click", (e) => { const b = e.target.closest(".cx-musica"); if (b) tocar(aba, +b.dataset.i); });
  $(".cx-abas").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { aba = b.dataset.aba; pintarLista(); } });
  $("#cx-ant").onclick = () => tocar(fila, atual - 1);
  $("#cx-prox").onclick = proximo;
  $("#cx-tocar").onclick = () => { if (!player) return; if (tocando) player.pauseVideo(); else if (pronto) player.playVideo(); else tocar(fila, atual, inicio && inicio.t); };
  $("#cx-continuar").onclick = () => tocar(fila, atual, inicio && inicio.t);
  function modoMini(sim) { fundo.classList.toggle("mini", !!sim); guardar(); }
  $("#cx-diminuir").onclick = () => modoMini(true);
  $("#cx-aumentar").onclick = () => modoMini(false);
  function fechar() {
    fundo.hidden = true; fundo.classList.remove("mini"); try { if (player) player.pauseVideo(); } catch (e) {}
    try { sessionStorage.removeItem(GUARDA); } catch (e) {}
    if (window.PugsSom && PugsSom.calar) PugsSom.calar(false);
  }
  $(".cx-x").onclick = fechar; $("#cx-fechar2").onclick = fechar;
  fundo.addEventListener("click", (e) => { if (e.target === fundo) modoMini(true); });   // tocou fora: vira telinha

  function carregarListas() {
    if (listasProntas) return listasProntas;
    const agora = Date.now(), pega = (u) => fetch(u + "?t=" + agora, { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    listasProntas = Promise.all([pega("musiquinhas.json"), pega("episodios.json")]).then(([mus, eps]) => {
      const m = (mus || []).filter((x) => x && x.id && (!x.desde || Date.parse(x.desde) <= agora));
      LISTAS.mus = m.length ? m : RESERVA_MUS;
      const e = ((eps && eps.videos) || []).filter((v) => v && v.id && v.ep).sort((a, b) => a.ep - b.ep)
        .map((v) => ({ id: v.id, nome: "Ep. " + v.ep + " · " + String(v.titulo || "").split(/[!|🐾]/)[0].trim() }));
      LISTAS.eps = e.length ? e : RESERVA_EPS;
    });
    return listasProntas;
  }
  function criarPlayer() {
    const comeco = item() || LISTAS.mus[0];
    player = new YT.Player("cx-player", {
      host: "https://www.youtube.com",
      videoId: comeco.id,
      playerVars: { rel: 0, playsinline: 1, modestbranding: 1, iv_load_policy: 3, fs: 0, start: (inicio && inicio.t) || 0 },
      events: {
        onReady: () => { aviso(""); if (inicio) $("#cx-continuar").hidden = false; },
        onStateChange: (e) => {
          tocando = e.data === 1; pronto = e.data === 1 || e.data === 2;
          $("#cx-tocar").textContent = tocando ? "⏸" : "▶️";
          if (tocando) { aviso(""); $("#cx-continuar").hidden = true; inicio = null; }
          if (e.data === 0) proximo();
        },
        onError: (e) => {
          // vídeo que não pode tocar aqui (ainda privado/agendado, ou removido): tira da lista e segue
          if ([100, 101, 150].includes(e.data)) { LISTAS[fila].splice(atual, 1); atual--; }
          pintarLista(); setTimeout(proximo, 600);
        },
      },
    });
  }
  function carregarApi() {
    if (window.YT && YT.Player) return criarPlayer();
    const antes = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof antes === "function") antes(); criarPlayer(); };
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.onerror = () => aviso("Para ver e ouvir precisa de internet. 🐾"); document.head.appendChild(s);
    setTimeout(() => { if (!player) aviso("Para ver e ouvir precisa de internet. 🐾"); }, 8000);
  }
  function mostrar(mini) {
    if (window.PugsSom) { if (PugsSom.calar) PugsSom.calar(true); else PugsSom.pausarMusica(); }
    fundo.hidden = false; fundo.classList.toggle("mini", !!mini);
    carregarListas().then(() => { formato(); pintarLista(); if (!player) carregarApi(); });
  }
  window.PugsCaixinha = {
    abrir() { mostrar(false); },
    // veio de outra página com a telinha ligada: volta no mesmo vídeo e no mesmo ponto
    restaurar() {
      let s = null; try { s = JSON.parse(sessionStorage.getItem(GUARDA) || "null"); } catch (e) {}
      if (!s || Date.now() - s.quando > 30 * 60 * 1000) return false;
      carregarListas().then(() => {
        const l = LISTAS[s.fila] || []; let i = l.findIndex((m) => m.id === s.id); if (i < 0) i = 0;
        fila = aba = s.fila; atual = i; inicio = { t: s.t };
        mostrar(s.mini);
      });
      return true;
    },
  };
})();
