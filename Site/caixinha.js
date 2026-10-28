// Caixinha de música da Joy e da Jane: as musiquinhas tocam pelo player do YouTube (assim conta visualização no canal).
// A lista vem sozinha da playlist "Pugs Aventuras - Musiquinhas 🎵": a música nova que entra na playlist aparece aqui.
// Vídeo agendado ou privado não aparece (o YouTube não deixa tocar), então só entra o que já foi lançado.
(() => {
  if (window.PugsCaixinha) return;
  const PLAYLIST = "PLV21PCZw5g98";
  const RESERVA = ["JTYJNlcolCY", "d0eg8tHLH-Y"]; // se a playlist não abrir
  const NOMES = { JTYJNlcolCY: "Dia das Crianças", "d0eg8tHLH-Y": "Tchau, tchau, Lambeijo!", LbfaEABEswc: "Festinha de Halloween" };

  const css = document.createElement("style");
  css.textContent = `
.cx-fundo{position:fixed;inset:0;z-index:60;background:rgba(40,20,60,.45);display:flex;align-items:flex-end;justify-content:center;padding:10px}
.cx-fundo[hidden]{display:none}
.cx-caixa{width:min(440px,100%);max-height:calc(100vh - 20px);overflow:auto;background:#fffdf7;border:4px solid #5a3a22;border-radius:26px;box-shadow:0 6px 0 #5a3a22;padding:12px 12px 14px;font-family:Fredoka,Arial,sans-serif;color:#5a3a22}
.cx-topo{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.cx-topo b{flex:1;font-size:1.3rem}
.cx-x{width:46px;height:46px;border-radius:50%;border:3px solid #5a3a22;background:#fff;font-size:1.3rem;cursor:pointer}
.cx-tela{position:relative;width:min(240px,60vw);aspect-ratio:9/16;margin:0 auto;border:4px solid #5a3a22;border-radius:18px;overflow:hidden;background:#2a1a3a}
.cx-tela iframe,.cx-tela>div{position:absolute;inset:0;width:100%;height:100%;border:0}
.cx-aviso{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;padding:14px;font-size:1.05rem;pointer-events:none}
.cx-controles{display:flex;justify-content:center;gap:14px;margin:10px 0 6px}
.cx-controles button{width:62px;height:62px;border-radius:50%;border:4px solid #5a3a22;background:#ffd23f;font-size:1.6rem;box-shadow:0 4px 0 #5a3a22;cursor:pointer}
.cx-lista{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 4px;scroll-snap-type:x mandatory}
.cx-musica{flex:0 0 auto;width:104px;scroll-snap-align:start;border:3px solid #5a3a22;border-radius:16px;background:#fff;padding:4px;cursor:pointer;font:600 .85rem/1.15 Fredoka,Arial,sans-serif;color:#5a3a22;text-align:center}
.cx-musica img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:11px;display:block;margin-bottom:4px}
.cx-musica.tocando{background:#ffe1ee;border-color:#f06ea8;box-shadow:0 0 0 3px #f06ea8}
.cx-musica.tocando img{animation:cx-pula 1s ease-in-out infinite}
@keyframes cx-pula{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
html.tema-halloween .cx-caixa{background:#fff6ee;border-color:#5b2d82;box-shadow:0 6px 0 #5b2d82}`;
  document.head.appendChild(css);

  const fundo = document.createElement("div"); fundo.className = "cx-fundo"; fundo.hidden = true;
  fundo.innerHTML = `<div class="cx-caixa" role="dialog" aria-label="Caixinha de música">
    <div class="cx-topo"><span style="font-size:1.8rem">🎶</span><b>Caixinha de música</b><button type="button" class="cx-x" aria-label="Fechar">✖</button></div>
    <div class="cx-tela"><div id="cx-player"></div><div class="cx-aviso" id="cx-aviso">Abrindo as musiquinhas... 🐾</div></div>
    <div class="cx-controles"><button type="button" id="cx-ant" aria-label="Música anterior">⏮</button><button type="button" id="cx-tocar" aria-label="Tocar ou pausar">▶️</button><button type="button" id="cx-prox" aria-label="Próxima música">⏭</button></div>
    <div class="cx-lista" id="cx-lista"></div></div>`;
  document.body.appendChild(fundo);
  const $ = (s) => fundo.querySelector(s);

  let player = null, lista = [], atual = 0, tocando = false, pronto = false;
  function aviso(t) { const a = $("#cx-aviso"); a.textContent = t || ""; a.hidden = !t; }
  function pintarLista() {
    $("#cx-lista").innerHTML = lista.map((id, i) => `<button type="button" class="cx-musica${i === atual ? " tocando" : ""}" data-i="${i}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">${NOMES[id] || "Música nova ✨"}</button>`).join("");
  }
  function tocar(i) {
    if (!player || !lista.length) return;
    atual = (i + lista.length) % lista.length; pintarLista();
    player.loadVideoById(lista[atual]);
    const b = $(".cx-musica.tocando"); if (b) b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  $("#cx-lista").addEventListener("click", (e) => { const b = e.target.closest(".cx-musica"); if (b) tocar(+b.dataset.i); });
  $("#cx-ant").onclick = () => tocar(atual - 1);
  $("#cx-prox").onclick = () => tocar(atual + 1);
  $("#cx-tocar").onclick = () => { if (!player) return; if (tocando) player.pauseVideo(); else if (pronto) player.playVideo(); else tocar(atual); };
  function fechar() {
    fundo.hidden = true; try { if (player) player.pauseVideo(); } catch (e) {}
    if (window.PugsSom && PugsSom.calar) PugsSom.calar(false);
  }
  $(".cx-x").onclick = fechar;
  fundo.addEventListener("click", (e) => { if (e.target === fundo) fechar(); });

  function montar(ids) {
    lista = ids.filter(Boolean); if (!lista.length) lista = RESERVA.slice();
    atual = 0; pintarLista(); aviso("Escolha uma musiquinha! 🎵");
  }
  function criarPlayer() {
    player = new YT.Player("cx-player", {
      host: "https://www.youtube.com",
      playerVars: { listType: "playlist", list: PLAYLIST, rel: 0, playsinline: 1, modestbranding: 1, iv_load_policy: 3, fs: 0 },
      events: {
        onReady: () => {
          // pega a lista da playlist (só o que já foi lançado)
          let tentativas = 0;
          const ler = () => { const l = player.getPlaylist && player.getPlaylist(); if (l && l.length) montar(l); else if (++tentativas < 12) setTimeout(ler, 400); else montar(RESERVA); };
          ler();
        },
        onStateChange: (e) => {
          tocando = e.data === 1; pronto = e.data === 1 || e.data === 2;
          $("#cx-tocar").textContent = tocando ? "⏸" : "▶️";
          if (tocando) aviso("");
          if (e.data === 0) tocar(atual + 1);       // acabou: vai para a próxima, como uma caixinha
          const vid = player.getVideoData && player.getVideoData(); if (vid && vid.video_id) { const i = lista.indexOf(vid.video_id); if (i >= 0 && i !== atual) { atual = i; pintarLista(); } }
        },
        onError: () => {
          // música que ainda não pode tocar (agendada/privada): sai da caixinha e pula
          const ruim = lista[atual]; lista = lista.filter((x) => x !== ruim);
          if (lista.length) { atual = atual % lista.length; pintarLista(); tocar(atual); } else aviso("As musiquinhas estão descansando. Tente mais tarde! 🐾");
        },
      },
    });
  }
  function carregarApi() {
    if (window.YT && YT.Player) return criarPlayer();
    const antes = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof antes === "function") antes(); criarPlayer(); };
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.onerror = () => aviso("Para ouvir as musiquinhas precisa de internet. 🐾"); document.head.appendChild(s);
    setTimeout(() => { if (!player) aviso("Para ouvir as musiquinhas precisa de internet. 🐾"); }, 8000);
  }
  window.PugsCaixinha = {
    abrir() {
      if (window.PugsSom) { if (PugsSom.calar) PugsSom.calar(true); else PugsSom.pausarMusica(); }
      fundo.hidden = false;
      if (!player) carregarApi();
    },
  };
})();
