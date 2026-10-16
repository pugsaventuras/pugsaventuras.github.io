// Sons, músicas e vozes do Pugs Aventuras.
// Músicas: arquivos sons/musica-<jogo>.mp3 em loop. Vozes: sons/voz/<chave>.mp3 (lista em sons/voz/lista.json);
// enquanto uma voz não estiver gravada, o aparelho fala sozinho (voz do sistema).
const PugsSom = (() => {
  let ctx = null, eba = null, ligado = true, musicaLigada = true;
  try { ligado = localStorage.getItem("pugs-som") !== "off"; musicaLigada = localStorage.getItem("pugs-musica") !== "off"; } catch (e) {}
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C();
      fetch("sons/eba-joy.mp3").then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => { eba = buf; }).catch(() => {});
    }
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    return ctx;
  }

  // ---- música de fundo (arquivo em loop: continua tocando sozinha)
  let qual = null, faixa = null;
  function tocarMusica() {
    if (!ligado || !musicaLigada || !qual || document.hidden) return;
    if (!faixa) { faixa = new Audio("sons/musica-" + qual + ".mp3"); faixa.loop = true; faixa.preload = "auto"; faixa.volume = qual === "site" ? 0.5 : 0.7; }
    if (faixa.paused) { const p = faixa.play(); if (p && p.catch) p.catch(() => {}); }
  }
  function pararMusica() { if (faixa) faixa.pause(); }
  // o iPad só libera som num toque "de verdade" (quando o dedo sai da tela)
  const destravar = () => { if (ligado) { ac(); tocarMusica(); } };
  ["touchend", "click", "keydown", "pointerup"].forEach((ev) => addEventListener(ev, destravar, { passive: true }));
  addEventListener("blur", pararMusica);                     // tocou num vídeo do YouTube
  document.addEventListener("visibilitychange", () => { if (document.hidden) pararMusica(); });
  addEventListener("pagehide", pararMusica);

  // ---- efeitos (feitos na hora)
  function tom(freq, dur, { tipo = "sine", vol = 0.25, ate = null, quando = 0 } = {}) {
    const c = ac(); if (!c || !ligado) return;
    const t = c.currentTime + quando, o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(freq, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function chiado(dur, { de = 800, para = 3000, vol = 0.2, quando = 0, q = 1.2 } = {}) {
    const c = ac(); if (!c || !ligado) return;
    const t = c.currentTime + quando, n = c.sampleRate * dur, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = "bandpass"; f.Q.value = q;
    f.frequency.setValueAtTime(de, t); f.frequency.exponentialRampToValueAtTime(para, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }

  // ---- vozes
  const VOZES = new Set();
  const vozesProntas = fetch("sons/voz/lista.json").then((r) => r.json()).then((l) => l.forEach((k) => VOZES.add(k))).catch(() => {});
  const PRONUNCIA = { Joy: "Djói", Jane: "Djêine", RanRan: "Ran Ran" };
  const LETRAS = { A: "á", B: "bê", C: "cê", D: "dê", E: "é", F: "éfe", G: "gê", H: "agá", I: "í", J: "jóta", K: "cá", L: "éle", M: "ême", N: "êne", O: "ó", P: "pê", Q: "quê", R: "érre", S: "ésse", T: "tê", U: "ú", V: "vê", W: "dáblio", X: "xis", Y: "ípsilon", Z: "zê", "Ç": "cê cedilha" };
  const NUMEROS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];
  const SEM_ACENTO = { "Á": "A", "À": "A", "Â": "A", "Ã": "A", "É": "E", "Ê": "E", "Í": "I", "Ó": "O", "Ô": "O", "Õ": "O", "Ú": "U", "Ü": "U" };
  let vozAtual = null;
  function melhorVoz() {
    if (!window.speechSynthesis) return null;
    const vs = speechSynthesis.getVoices().filter((v) => /^pt[-_]BR/i.test(v.lang));
    for (const p of [/premium|enhanced|aprimorad|neural|natural/i, /Luciana/i, /Google/i, /Francisca|Fernanda|Thalita/i]) { const v = vs.find((x) => p.test(x.name)); if (v) return v; }
    return vs[0] || null;
  }
  if (window.speechSynthesis) speechSynthesis.getVoices();
  function tts(txt) {
    if (!window.speechSynthesis || !txt) return;
    let t = txt; for (const [k, v] of Object.entries(PRONUNCIA)) t = t.replace(new RegExp("\\b" + k + "\\b", "g"), v);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = "pt-BR"; u.rate = 0.88; u.pitch = 1.1;
    const v = melhorVoz(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function tocarUrl(url, depois) {
    if (vozAtual) vozAtual.pause();
    if (window.speechSynthesis) speechSynthesis.cancel();
    vozAtual = new Audio(url); vozAtual.onended = depois || null;
    const p = vozAtual.play(); if (p && p.catch) p.catch(() => {});
  }
  // vozes gravadas tocam pelo mesmo "motor" dos efeitos: o iPad libera uma vez e depois toca sempre
  const buffers = {};
  let fonteVoz = null;
  function carregar(url) {
    const c = ac(); if (!c) return Promise.reject();
    if (!buffers[url]) buffers[url] = fetch(url).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, erro) => c.decodeAudioData(b, ok, erro)));
    return buffers[url];
  }
  function tocarVoz(url) {
    const c = ac(); if (!c) return;
    if (fonteVoz) { try { fonteVoz.stop(); } catch (e) {} fonteVoz = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
    carregar(url).then((buf) => {
      const s = c.createBufferSource(), g = c.createGain(); g.gain.value = 1.2;
      s.buffer = buf; s.connect(g).connect(c.destination); s.start(); fonteVoz = s;
    }).catch(() => {});
  }
  // fala uma frase: usa a voz gravada (chave) se existir; senão a voz do aparelho (se txt vier)
  function falar(txt, chave) {
    if (!ligado) return;
    if (chave && VOZES.has(chave)) { tocarVoz("sons/voz/" + chave + ".mp3"); return; }
    try { tts(txt); } catch (e) {}
  }
  // deixa as vozes prontas antes (para não atrasar)
  function preparar(chaves) { (chaves || []).forEach((k) => { if (VOZES.has(k)) carregar("sons/voz/" + k + ".mp3").catch(() => {}); }); }
  const api = {
    get ligado() { return ligado; },
    alternar() { ligado = !ligado; try { localStorage.setItem("pugs-som", ligado ? "on" : "off"); } catch (e) {} if (ligado) { ac(); api.acerto(); tocarMusica(); } else { pararMusica(); if (window.speechSynthesis) speechSynthesis.cancel(); } return ligado; },
    get musicaLigada() { return musicaLigada; },
    alternarMusica() { musicaLigada = !musicaLigada; try { localStorage.setItem("pugs-musica", musicaLigada ? "on" : "off"); } catch (e) {} if (musicaLigada) tocarMusica(); else pararMusica(); return musicaLigada; },
    musica(nome) { qual = nome; },
    falar, tocarUrl, preparar,
    chaveLetra: (L) => { const b = SEM_ACENTO[L] || L; return "letra-" + (b === "Ç" ? "c-cedilha" : b.toLowerCase()); },
    temVoz: (chave) => VOZES.has(chave),
    vozesProntas,
    // fala só a letra, do jeito que a criança conhece ("érre", não "R maiúsculo")
    letra(L) { const b = SEM_ACENTO[L] || L; falar(LETRAS[b] || b.toLowerCase(), "letra-" + (b === "Ç" ? "c-cedilha" : b.toLowerCase())); },
    numero(n) { falar(NUMEROS[n] || String(n), "numero-" + n); },
    virar() { chiado(0.12, { de: 2500, para: 6000, vol: 0.18 }); },
    // cada cor tem a sua notinha (como um xilofone)
    pintar(cor, idx) {
      const notas = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760, 1976, 2093, 2349, 2637, 2794];
      const f = notas[idx >= 0 ? idx % notas.length : 0];
      tom(f, 0.35, { tipo: "sine", vol: 0.22 }); tom(f * 2, 0.18, { tipo: "sine", vol: 0.06 }); tom(f * 3, 0.1, { tipo: "triangle", vol: 0.03 });
    },
    pop() { tom(520, 0.09, { tipo: "triangle", vol: 0.3, ate: 980 }); tom(1300, 0.08, { vol: 0.12, quando: 0.05 }); },
    acerto() { tom(880, 0.14, { vol: 0.22 }); tom(1320, 0.22, { vol: 0.22, quando: 0.1 }); },
    erro() { tom(330, 0.22, { tipo: "triangle", vol: 0.2, ate: 160 }); },
    apagar() { chiado(0.35, { de: 3000, para: 500, vol: 0.18 }); },
    festa() {
      [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.22, { tipo: "triangle", vol: 0.25, quando: i * 0.11 }));
      tom(1047, 0.6, { tipo: "triangle", vol: 0.22, quando: 0.48 }); tom(1319, 0.6, { vol: 0.12, quando: 0.48 });
      for (let i = 0; i < 6; i++) chiado(0.06, { de: 1500, para: 2500, vol: 0.25, quando: 0.55 + i * 0.16, q: 2 }); // palminhas
      const c = ac();
      if (c && ligado && eba) { const s = c.createBufferSource(); s.buffer = eba; s.connect(c.destination); s.start(c.currentTime + 0.5); }
    },
  };
  // botões de som e música
  document.addEventListener("DOMContentLoaded", () => {
    const topo = document.querySelector(".jogo-topo");
    const pagina = (location.pathname.split("/").pop() || "index").replace(".html", "");
    if (!topo) {
      // páginas do site: musiquinha leve, com botão redondo no canto
      qual = "site";
      const bm = document.createElement("button"); bm.type = "button"; bm.className = "musica-site";
      const pm = () => { const on = musicaLigada && ligado; bm.textContent = on ? "🎵" : "🔇"; bm.setAttribute("aria-label", on ? "Desligar a música" : "Ligar a música"); bm.classList.toggle("desligada", !on); };
      pm(); bm.onclick = (e) => { e.stopPropagation(); if (!ligado) api.alternar(); else api.alternarMusica(); pm(); };
      ["pointerup", "touchend"].forEach((ev) => bm.addEventListener(ev, (e) => e.stopPropagation()));
      document.body.appendChild(bm); return;
    }
    const b = document.createElement("button"); b.type = "button"; b.className = "botao som";
    const pinta = () => { b.textContent = ligado ? "🔊" : "🔇"; b.setAttribute("aria-label", ligado ? "Desligar o som" : "Ligar o som"); };
    pinta(); b.onclick = () => { api.alternar(); pinta(); }; topo.appendChild(b);
    const nome = { pintar: "pintar", "quebra-cabeca": "quebra", "jogo-da-memoria": "memoria", album: "site", "escrever-nome": "nome", "onde-esta-a-joy": "joy" }[pagina];
    if (nome) {
      qual = nome;
      const bm = document.createElement("button"); bm.type = "button"; bm.className = "botao som";
      const pm = () => { bm.textContent = musicaLigada ? "🎵" : "🎵✖"; bm.setAttribute("aria-label", musicaLigada ? "Desligar a música" : "Ligar a música"); bm.style.opacity = musicaLigada ? 1 : 0.6; };
      pm(); bm.onclick = () => { api.alternarMusica(); pm(); }; topo.appendChild(bm); b.style.marginLeft = "auto"; bm.style.marginLeft = "0";
    }
  });
  return api;
})();
