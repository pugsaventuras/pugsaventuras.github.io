// Guarda o Clube no aparelho para os jogos funcionarem sem internet.
const CACHE = "pugs-clube-v3";
const ARQUIVOS = [
  "clube.html", "pintar.html", "quebra-cabeca.html", "jogo-da-memoria.html", "album.html", "entrar.html", "escrever-nome.html", "onde-esta-a-joy.html",
  "imagens/jogos/joy-face.jpg", "imagens/jogos/ranran.jpg", "imagens/jogos/chinelo.jpg", "imagens/jogos/caminha.jpg", "imagens/memoria/m02.jpg",
  "estilo.css", "clube.js", "sons.js", "sons/eba-joy.mp3", "manifest.json", "apple-touch-icon.png", "favicon.png",
  "imagens/marca-pugs-aventuras.png", "imagens/pintar-dia-das-criancas.png", "imagens/capa-ep2.jpg", "imagens/fig-ep1.jpg",
  "imagens/capa-dia-das-criancas.jpg", "imagens/banner-pugs-aventuras.jpg", "imagens/fig-ep1-album.jpg", "imagens/fig-ep2.jpg",
  "imagens/fig-especial-dia-das-criancas.jpg",
  ...Array.from({ length: 12 }, (_, i) => "imagens/memoria/m" + String(i + 1).padStart(2, "0") + ".jpg"),
  "supabase.js",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(ARQUIVOS.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.hostname.endsWith("supabase.co")) return;              // login e cadastro sempre pela internet
  const meu = u.origin === location.origin, cdn = u.hostname === "cdn.jsdelivr.net";
  if (!meu && !cdn) return;
  if (meu && u.pathname.endsWith("episodios.json")) return;     // episódio novo: sempre da internet
  // mostra o que já está guardado (rápido e funciona sem internet) e atualiza por trás
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const guardado = await c.match(r, { ignoreSearch: true });
    const daRede = fetch(r).then((resp) => { if (resp && (resp.ok || resp.type === "opaque")) c.put(r, resp.clone()); return resp; }).catch(() => guardado);
    return guardado || daRede;
  }));
});
