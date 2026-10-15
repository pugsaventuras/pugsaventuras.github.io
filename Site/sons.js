// Sons e musiquinhas dos jogos do Clube (feitos na hora pelo navegador, sem arquivos) + o "Eba!" da Joy no final.
const PugsSom = (() => {
  let ctx = null, eba = null;
  let ligado = true;
  try { ligado = localStorage.getItem("pugs-som") !== "off"; } catch (e) {}
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C();
      fetch("sons/eba-joy.mp3").then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => { eba = buf; }).catch(() => {});
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  // o iPad só libera som depois do primeiro toque
  addEventListener("pointerdown", () => { if (ligado) { ac(); if (musicaLigada) tocarMusica(); } }, { passive: true });

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

  // ---- musiquinha de fundo (melodias originais, bem baixinho, uma para cada jogo)
  const MUSICAS = {
    pintar: { bpm: 96, notas: "E4 G4 C5 B4 G4 E4 F4 A4 C5 B4 G4 - E4 G4 C5 D5 C5 A4 G4 E4 D4 C4 - -", baixo: "C3 F3 G3 C3", tempos: 3 },
    quebra: { bpm: 116, notas: "C5 C5 G4 E4 G4 A4 G4 - C5 C5 G4 E4 D4 E4 C4 - F4 F4 A4 C5 B4 G4 G4 - F4 E4 D4 G4 C4 - - -", baixo: "C3 C3 C3 G3 F3 G3 G3 C3", tempos: 4 },
    nome: { bpm: 88, notas: "C5 - E5 - D5 C5 A4 - G4 - C5 - D5 - E5 - - - F5 - E5 - D5 C5 A4 - G4 A4 C5 - D5 - C5 - - -", baixo: "C3 A2 F2 G2 C3 A2 F2 C3", tempos: 4 },
    joy: { bpm: 126, notas: "G4 - G4 A4 G4 E4 - - G4 - G4 A4 G4 D5 - - C5 - A4 - G4 E4 D4 - E4 G4 A4 G4 C5 - - -", baixo: "C3 C3 G2 G2 F2 C3 G2 C3", tempos: 4 },
    site: { bpm: 84, notas: "E5 - C5 - G4 - C5 - D5 - B4 - G4 - - - C5 - A4 - F4 - A4 - G4 - E4 - C4 - - - E5 - C5 - G4 - C5 - F5 - E5 - D5 - C5 - - - - - - -", baixo: "C3 G2 F2 C3 C3 G2 F2 C3", tempos: 6 },
    memoria: { bpm: 108, notas: "G4 E4 G4 E4 A4 G4 E4 - D4 E4 G4 A4 G4 - - - G4 E4 G4 C5 B4 A4 G4 - A4 G4 E4 D4 C4 - - -", baixo: "C3 C3 G3 G3 C3 G3 F3 C3", tempos: 4 },
  };
  const hz = (n) => { const m = n.match(/^([A-G])(#?)(\d)$/); const st = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0); return 440 * Math.pow(2, (st + (+m[3] + 1) * 12 - 69) / 12); };
  let musicaLigada = true; try { musicaLigada = localStorage.getItem("pugs-musica") !== "off"; } catch (e) {}
  let qual = null, timer = null, prox = 0, passo = 0;
  function tocarMusica() {
    const c = ac(); if (!c || !qual || timer) return;
    const m = MUSICAS[qual], notas = m.notas.split(" "), baixo = m.baixo.split(" "), dur = 60 / m.bpm;
    prox = c.currentTime + 0.1; passo = 0;
    timer = setInterval(() => {
      if (!ligado || !musicaLigada) return;
      while (prox < c.currentTime + 0.3) {
        const n = notas[passo % notas.length], q = prox - c.currentTime;
        if (n !== "-") tom(hz(n), dur * 0.9, { tipo: "triangle", vol: qual === "site" ? 0.05 : 0.085, quando: q });
        if (passo % m.tempos === 0) tom(hz(baixo[Math.floor(passo / m.tempos) % baixo.length]), dur * m.tempos * 0.8, { tipo: "sine", vol: qual === "site" ? 0.05 : 0.08, quando: q });
        prox += dur; passo++;
      }
    }, 100);
  }
  function pararMusica() { clearInterval(timer); timer = null; }
  addEventListener("blur", pararMusica);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pararMusica(); });
  // fala em voz alta (para quem ainda não lê)
  function falar(txt) {
    if (!ligado || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt); u.lang = "pt-BR"; u.rate = 0.95; u.pitch = 1.2;
      const v = speechSynthesis.getVoices().find((x) => /pt.BR/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const api = {
    get ligado() { return ligado; },
    alternar() { ligado = !ligado; try { localStorage.setItem("pugs-som", ligado ? "on" : "off"); } catch (e) {} if (ligado) { ac(); api.acerto(); if (musicaLigada) tocarMusica(); } else pararMusica(); return ligado; },
    virar() { chiado(0.12, { de: 2500, para: 6000, vol: 0.18 }); },
    // cada cor tem a sua notinha (como um xilofone)
    pintar(cor, idx) {
      const notas = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760, 1976, 2093, 2349, 2637, 2794];
      let i = idx >= 0 ? idx % notas.length : 0;
      const f = notas[i];
      tom(f, 0.35, { tipo: "sine", vol: 0.22 }); tom(f * 2, 0.18, { tipo: "sine", vol: 0.06 }); tom(f * 3, 0.1, { tipo: "triangle", vol: 0.03 });
    },
    pop() { tom(520, 0.09, { tipo: "triangle", vol: 0.3, ate: 980 }); tom(1300, 0.08, { vol: 0.12, quando: 0.05 }); },
    acerto() { tom(880, 0.14, { vol: 0.22 }); tom(1320, 0.22, { vol: 0.22, quando: 0.1 }); },
    erro() { tom(330, 0.22, { tipo: "triangle", vol: 0.2, ate: 160 }); },
    apagar() { chiado(0.35, { de: 3000, para: 500, vol: 0.18 }); },
    musica(nome) { qual = nome; },
    falar,
    get musicaLigada() { return musicaLigada; },
    alternarMusica() { musicaLigada = !musicaLigada; try { localStorage.setItem("pugs-musica", musicaLigada ? "on" : "off"); } catch (e) {} if (musicaLigada && ligado) tocarMusica(); else pararMusica(); return musicaLigada; },
    festa() {
      [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.22, { tipo: "triangle", vol: 0.25, quando: i * 0.11 }));
      tom(1047, 0.6, { tipo: "triangle", vol: 0.22, quando: 0.48 }); tom(1319, 0.6, { vol: 0.12, quando: 0.48 });
      for (let i = 0; i < 6; i++) chiado(0.06, { de: 1500, para: 2500, vol: 0.25, quando: 0.55 + i * 0.16, q: 2 }); // palminhas
      const c = ac();
      if (c && ligado && eba) { const s = c.createBufferSource(), g = c.createGain(); g.gain.value = 1; s.buffer = eba; s.connect(g).connect(c.destination); s.start(c.currentTime + 0.5); }
    },
  };
  // botão de som em todas as telas de jogo
  document.addEventListener("DOMContentLoaded", () => {
    const topo = document.querySelector(".jogo-topo");
    if (!topo) {
      // páginas do site: musiquinha leve, com botão redondo no canto
      qual = "site";
      const bm = document.createElement("button"); bm.type = "button"; bm.className = "musica-site";
      const pm = () => { const on = musicaLigada && ligado; bm.textContent = on ? "🎵" : "🔇"; bm.setAttribute("aria-label", on ? "Desligar a música" : "Ligar a música"); bm.classList.toggle("desligada", !on); };
      pm(); bm.onclick = (e) => { e.stopPropagation(); if (!ligado) api.alternar(); else api.alternarMusica(); pm(); };
      bm.addEventListener("pointerdown", (e) => e.stopPropagation());
      document.body.appendChild(bm); return;
    }
    const b = document.createElement("button"); b.type = "button"; b.className = "botao som";
    const pinta = () => { b.textContent = ligado ? "🔊" : "🔇"; b.setAttribute("aria-label", ligado ? "Desligar o som" : "Ligar o som"); };
    pinta(); b.onclick = () => { api.alternar(); pinta(); }; topo.appendChild(b);
    const pagina = (location.pathname.split("/").pop() || "").replace(".html", "");
    const nome = { pintar: "pintar", "quebra-cabeca": "quebra", "jogo-da-memoria": "memoria", album: "pintar", "escrever-nome": "nome", "onde-esta-a-joy": "joy" }[pagina];
    if (nome) {
      qual = nome;
      const bm = document.createElement("button"); bm.type = "button"; bm.className = "botao som";
      const pm = () => { bm.textContent = musicaLigada ? "🎵" : "🎵✖"; bm.setAttribute("aria-label", musicaLigada ? "Desligar a música" : "Ligar a música"); bm.style.opacity = musicaLigada ? 1 : 0.6; };
      pm(); bm.onclick = () => { api.alternarMusica(); pm(); }; topo.appendChild(bm); b.style.marginLeft = "auto"; bm.style.marginLeft = "0";
    }
  });
  return api;
})();
