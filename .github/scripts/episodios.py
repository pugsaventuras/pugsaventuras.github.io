"""Le os videos do canal @PugsAventuras e grava Site/episodios.json.
Se o YouTube nao responder, mantem o arquivo que ja existe (o site continua igual)."""
import json, re, urllib.request, urllib.parse, os, sys

CANAL = "https://www.youtube.com/@PugsAventuras"
SAIDA = "Site/episodios.json"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9"}

def pegar(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

ids = []
for aba in ("videos", "streams", "shorts"):
    try:
        html = pegar(f"{CANAL}/{aba}?hl=pt-BR&persist_hl=1")
    except Exception as e:
        print("aviso:", aba, e)
        continue
    for v in re.findall(r'"videoId":"([\w-]{11})"', html):
        if v not in ids:
            ids.append(v)

antigo = {}
if os.path.exists(SAIDA):
    try:
        for x in json.load(open(SAIDA, encoding="utf-8")).get("videos", []):
            antigo[x["id"]] = x
    except Exception:
        pass

videos = []
for v in ids:
    try:
        o = json.loads(pegar("https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(f"https://www.youtube.com/watch?v={v}")))
    except Exception:
        continue  # privado, agendado ou removido: fica de fora
    titulo = o.get("title", "")
    m = re.search(r"Epis[oó]dio\s*(\d+)", titulo, re.I)
    item = {"id": v, "titulo": titulo, "ep": int(m.group(1)) if m else None}
    item["visto_em"] = antigo.get(v, {}).get("visto_em")
    videos.append(item)

if not videos:
    print("nenhum video encontrado; mantendo o arquivo atual")
    sys.exit(0)

from datetime import datetime, timezone
agora = datetime.now(timezone.utc).strftime("%Y-%m-%d")
for x in videos:
    x["visto_em"] = x["visto_em"] or agora
videos.sort(key=lambda x: (x["ep"] is None, -(x["ep"] or 0)))
json.dump({"atualizado": datetime.now(timezone.utc).isoformat(timespec="minutes"), "videos": videos},
          open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(videos, ensure_ascii=False, indent=1))
