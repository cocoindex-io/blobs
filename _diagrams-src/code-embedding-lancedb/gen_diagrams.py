#!/usr/bin/env python3
"""V1 diagrams for the `code-embedding-lancedb` example.

Adapted from _diagrams-src/text-embedding-lancedb/gen_diagrams.py, fitted to
examples/code_embedding_lancedb/main.py — Tree-sitter code chunking, LanceDB
as the target instead of Postgres:
  walk_dir -> files -> [process_file: RecursiveSplitter(code, Tree-sitter)
  -> for each chunk: embed -> declare_row(CodeEmbedding)] -> LanceDB (embedded).

Light variant: renders only the cover + flow hero (no stage diagrams).

Renders:
  cover.png              social/hero cover
  flow-v1.png            full vertical pipeline (hero)

Usage:
  python3 gen_diagrams.py            # write HTML
  python3 gen_diagrams.py --render   # also rasterize PNGs via headless Chrome (macOS)
"""
import pathlib, subprocess, sys

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR

CREAM = "#FCF3D8"; CREAM_SOFT = "#F6F4E9"; PAPER = "#FBF6E8"
MAROON = "#532638"; MAROON_INK = "#2A121B"; CORAL = "#BE5133"
PEACH = "#E59A63"; PALM = "#27E62B"; PALM_INK = "#16A534"
RULE = "rgba(42,18,27,0.16)"; MUTED = "rgba(42,18,27,0.58)"
APP_FILL = "color-mix(in oklab, #E59A63 11%, #FCF3D8)"

GF = ('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&'
      'family=Source+Serif+4:ital,wght@0,400;0,600;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap')
HEAD = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        f'<link href="{GF}" rel="stylesheet">')


# ─────────────────────────── cover ───────────────────────────
def cover_html():
    def chip(label):
        return (f'<div style="font-family:\'JetBrains Mono\',monospace;font-weight:600;font-size:23px;'
                f'color:{MAROON_INK};background:{CREAM};border:1.8px solid {MAROON};border-radius:11px;'
                f'padding:14px 22px;white-space:nowrap;">{label}</div>')
    sep = (f'<div style="color:{CORAL};font-size:30px;font-weight:700;">&rarr;</div>')
    pipeline = sep.join([chip("Code files"), chip("Chunks"),
                         chip("Vectors"), chip("LanceDB")])
    return f'''<!doctype html><html><head><meta charset="utf-8">{HEAD}<style>
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{width:1200px;height:630px;}}
body{{background:{CREAM};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;
  color:{MAROON_INK};padding:70px 80px;display:flex;flex-direction:column;justify-content:space-between;}}
.eyebrow{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:22px;letter-spacing:.2em;
  text-transform:uppercase;color:{CORAL};display:flex;align-items:center;gap:14px;}}
.eyebrow .dot{{width:13px;height:13px;border-radius:50%;background:{CORAL};}}
h1{{font-family:'Source Serif 4',serif;font-weight:600;font-size:78px;line-height:1.05;letter-spacing:-.02em;}}
h1 em{{font-style:italic;color:{CORAL};}}
.sub{{font-size:27px;color:{MUTED};line-height:1.4;max-width:920px;margin-top:6px;}}
.pipe{{display:flex;align-items:center;gap:18px;}}
.coco{{position:absolute;top:60px;right:78px;font-size:60px;}}
</style></head><body>
  <div class="coco">🥥</div>
  <div>
    <div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Example</div>
  </div>
  <div>
    <h1>Index Your Codebase<br>with <em>LanceDB</em></h1>
    <div class="sub">Chunk code with Tree-sitter, embed each chunk, and store the vectors in an embedded LanceDB table — no server, incremental, in plain async Python.</div>
  </div>
  <div class="pipe">{pipeline}</div>
</body></html>'''


# ─────────────────────────── flow (hero) ───────────────────────────
def node(kind, cap, ttl, sub="", *, mono=True, hl=False):
    cls = f"node {kind}" + (" hl" if hl else "")
    sub_html = f'<div class="sub">{sub}</div>' if sub else ""
    ttlcls = "ttl mono" if mono else "ttl"
    return (f'<div class="{cls}"><div class="cap">{cap}</div>'
            f'<div class="{ttlcls}">{ttl}</div>{sub_html}</div>')


ARROW = '<div class="arrow"><div class="line"></div><div class="head"></div></div>'


def flow_html():
    return f'''<!doctype html><html><head><meta charset="utf-8">{HEAD}<style>
*{{margin:0;padding:0;box-sizing:border-box;}}
html,body{{width:1240px;}}
body{{background:{CREAM};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;
  color:{MAROON_INK};padding:48px 60px 40px;display:flex;flex-direction:column;align-items:center;}}

.eyebrow{{align-self:flex-start;font-family:'JetBrains Mono',monospace;font-weight:600;font-size:21px;
  letter-spacing:.18em;text-transform:uppercase;color:{CORAL};display:flex;align-items:center;gap:12px;margin-bottom:28px;}}
.eyebrow .dot{{width:12px;height:12px;border-radius:50%;background:{CORAL};}}

.col{{display:flex;flex-direction:column;align-items:center;}}

.node{{background:{CREAM};border:1.8px solid {MAROON};color:{MAROON_INK};
  padding:16px 30px;text-align:center;min-width:300px;}}
.node.logic{{border-radius:18px;}}
.node.data{{border-radius:5px;}}
.node.target{{border-radius:4px 22px 22px 4px;}}
.node.hl{{border-color:{PALM_INK};border-width:3px;}}
.cap{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:.14em;
  text-transform:uppercase;color:{MUTED};margin-bottom:7px;}}
.ttl{{font-weight:600;font-size:26px;letter-spacing:-.01em;}}
.ttl.mono{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:24px;}}
.sub{{font-size:18px;color:{MUTED};margin-top:7px;line-height:1.35;}}

.arrow{{display:flex;flex-direction:column;align-items:center;height:42px;}}
.arrow .line{{width:2.6px;flex:1;background:{MAROON};}}
.arrow .head{{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;
  border-top:9px solid {MAROON};}}

.comp{{background:color-mix(in oklab,{PEACH} 13%,{CREAM});border:2px solid {CORAL};border-radius:24px;
  padding:22px 34px 30px;display:flex;flex-direction:column;align-items:center;}}
.comp-cap{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:16px;letter-spacing:.08em;
  text-transform:uppercase;color:{CORAL};margin-bottom:20px;text-align:center;}}
.comp-cap .reg{{color:{MUTED};text-transform:none;letter-spacing:0;font-weight:500;
  font-family:'Inter';font-size:17px;}}

.subcomp{{background:{CREAM_SOFT};border:1.8px dashed color-mix(in oklab,{CORAL} 60%,transparent);
  border-radius:20px;padding:18px 28px 24px;display:flex;flex-direction:column;align-items:center;}}
.subcomp-cap{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:.06em;
  text-transform:uppercase;color:{MUTED};margin-bottom:16px;text-align:center;}}

.legend{{align-self:stretch;margin-top:38px;display:flex;justify-content:center;gap:34px;flex-wrap:wrap;
  border-top:1.5px solid {RULE};padding-top:24px;}}
.lg{{display:flex;align-items:center;gap:12px;font-size:18px;color:{MUTED};}}
.sw{{width:40px;height:26px;background:{CREAM};border:1.8px solid {MAROON};flex:none;}}
.sw.logic{{border-radius:13px;}} .sw.data{{border-radius:4px;}}
.sw.target{{border-radius:3px 13px 13px 3px;}}
.sw.comp{{background:color-mix(in oklab,{PEACH} 13%,{CREAM});border-color:{CORAL};border-radius:8px;}}
</style></head><body>
  <div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Code embedding flow &middot; LanceDB</div>

  <div class="col">
    {node("logic", "Source", "localfs.walk_dir", "Local codebase &middot; watches for changes (live=True)")}
    {ARROW}
    {node("data", "Data", "files", "one FileLike per code file (.py .rs .toml .md)")}
    {ARROW}

    <div class="comp">
      <div class="comp-cap">Processing Component &middot; <span class="reg">mount_each &rarr; process_file (per file, memoized)</span></div>
      <div class="col">
        {node("logic", "Transform &middot; Tree-sitter", "RecursiveSplitter", "syntax-aware chunks (1000 / 300 overlap)")}
        {ARROW}
        {node("data", "Data", "chunks", "Chunk &middot; code text, line range")}
        {ARROW}
        <div class="subcomp">
          <div class="subcomp-cap">coco.map &rarr; process_chunk (per chunk)</div>
          <div class="col">
            {node("logic", "Transform", "SentenceTransformerEmbedder.embed", "chunk text &rarr; embedding (384-d vector)")}
            {ARROW}
            {node("target", "Target state", "declare_row &rarr; CodeEmbedding", "id &middot; filename &middot; code &middot; embedding &middot; start/end line")}
          </div>
        </div>
      </div>
    </div>

    {ARROW}
    {node("logic", "Target", "LanceDB &middot; embedded", "code_embeddings table &middot; ./lancedb_data &middot; no server")}
  </div>

  <div class="legend">
    <div class="lg"><span class="sw logic"></span>Source / transform</div>
    <div class="lg"><span class="sw data"></span>Data (state)</div>
    <div class="lg"><span class="sw target"></span>Target state</div>
    <div class="lg"><span class="sw comp"></span>Processing component</div>
  </div>
</body></html>'''


def page(w, h, body):
    return (f'<!doctype html><html><head><meta charset="utf-8">'
            f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link href="{GF}" rel="stylesheet"><style>'
            f'*{{margin:0;padding:0;box-sizing:border-box}}'
            f'body{{background:{CREAM};padding:34px}}'
            f'svg{{display:block}}</style></head><body>'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">{body}</svg></body></html>')


# ─────────────────────────── render all ───────────────────────────
(OUT_DIR / "cover.html").write_text(cover_html())
print("wrote cover.html")
(OUT_DIR / "flow.html").write_text(flow_html())
print("wrote flow.html")

if "--render" in sys.argv:
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    # cover
    subprocess.run([
        chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
        "--force-color-profile=srgb", "--virtual-time-budget=8000",
        f"--screenshot={OUT_DIR / 'cover.png'}", "--window-size=1200,630",
        (OUT_DIR / "cover.html").as_uri(),
    ], check=True)
    print("rendered cover.png")
    # flow (hero)
    subprocess.run([
        chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
        "--force-color-profile=srgb", "--virtual-time-budget=8000",
        f"--screenshot={OUT_DIR / 'flow-v1.png'}", "--window-size=1240,1500",
        (OUT_DIR / "flow.html").as_uri(),
    ], check=True)
    print("rendered flow-v1.png")
