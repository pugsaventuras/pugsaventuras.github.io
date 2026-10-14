// Sons dos jogos do Clube (feitos na hora pelo navegador, sem arquivos) + o "Eba!" da Joy no final.
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
  addEventListener("pointerdown", () => { if (ligado) ac(); }, { passive: true });

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
  const api = {
    get ligado() { return ligado; },
    alternar() { ligado = !ligado; try { localStorage.setItem("pugs-som", ligado ? "on" : "off"); } catch (e) {} if (ligado) { ac(); api.acerto(); } return ligado; },
    virar() { chiado(0.12, { de: 2500, para: 6000, vol: 0.18 }); },
    pintar() { chiado(0.28, { de: 400, para: 1800, vol: 0.3, q: 0.8 }); tom(220, 0.18, { tipo: "sine", vol: 0.12, ate: 520 }); },
    pop() { tom(520, 0.09, { tipo: "triangle", vol: 0.3, ate: 980 }); tom(1300, 0.08, { vol: 0.12, quando: 0.05 }); },
    acerto() { tom(880, 0.14, { vol: 0.22 }); tom(1320, 0.22, { vol: 0.22, quando: 0.1 }); },
    erro() { tom(330, 0.22, { tipo: "triangle", vol: 0.2, ate: 160 }); },
    apagar() { chiado(0.35, { de: 3000, para: 500, vol: 0.18 }); },
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
    const topo = document.querySelector(".jogo-topo"); if (!topo) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "botao som";
    const pinta = () => { b.textContent = ligado ? "🔊" : "🔇"; b.setAttribute("aria-label", ligado ? "Desligar o som" : "Ligar o som"); };
    pinta(); b.onclick = () => { api.alternar(); pinta(); }; topo.appendChild(b);
  });
  return api;
})();
