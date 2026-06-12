#!/usr/bin/env python3
"""V1 diagrams for the `docs-to-knowledge-graph` example.

Adapted from _diagrams-src/text-embedding/gen_diagrams.py, fitted to
examples/docs_to_knowledge_graph/main.py:
  walk_dir -> files -> [process_file (per doc, memoized): LLM extraction ->
  Document node + DocTriples] -> [build_graph (one pass): dedupe entities,
  stable triple ids -> Entity nodes + RELATIONSHIP / MENTION edges] -> Neo4j.

Renders:
  flow-v1.png        full vertical pipeline (hero)
  schema.png         graph schema (Document / Entity, MENTION / RELATIONSHIP)
  stage-phase1.png   per-doc extraction components highlighted
  stage-phase2.png   single graph-building pass highlighted

Usage:
  python3 gen_diagrams.py            # write HTML
  python3 gen_diagrams.py --render   # also rasterize PNGs via headless Chrome (macOS)
"""
import pathlib, subprocess, sys

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR

CREAM = "#FCF3D8"; CREAM_SOFT = "#F6F4E9"
MAROON = "#532638"; MAROON_INK = "#2A121B"; CORAL = "#BE5133"
PEACH = "#E59A63"; PALM = "#27E62B"; PALM_INK = "#16A534"
RULE = "rgba(42,18,27,0.16)"; MUTED = "rgba(42,18,27,0.58)"
APP_FILL = "color-mix(in oklab, #E59A63 11%, #FCF3D8)"

GF = ('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&'
      'family=Source+Serif+4:ital,wght@0,400;0,600;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap')
HEAD = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        f'<link href="{GF}" rel="stylesheet">')


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
.row{{display:flex;gap:30px;align-items:stretch;}}

.node{{background:{CREAM};border:1.8px solid {MAROON};color:{MAROON_INK};
  padding:16px 30px;text-align:center;min-width:300px;}}
.row .node{{min-width:0;flex:1;}}
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

.legend{{align-self:stretch;margin-top:38px;display:flex;justify-content:center;gap:34px;flex-wrap:wrap;
  border-top:1.5px solid {RULE};padding-top:24px;}}
.lg{{display:flex;align-items:center;gap:12px;font-size:18px;color:{MUTED};}}
.sw{{width:40px;height:26px;background:{CREAM};border:1.8px solid {MAROON};flex:none;}}
.sw.logic{{border-radius:13px;}} .sw.data{{border-radius:4px;}}
.sw.target{{border-radius:3px 13px 13px 3px;}}
.sw.comp{{background:color-mix(in oklab,{PEACH} 13%,{CREAM});border-color:{CORAL};border-radius:8px;}}
</style></head><body>
  <div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Docs &rarr; knowledge graph flow</div>

  <div class="col">
    {node("logic", "Source", "localfs.walk_dir", "Markdown docs folder &middot; *.md / *.mdx")}
    {ARROW}
    {node("data", "Data", "files", "one File per document")}
    {ARROW}

    <div class="comp">
      <div class="comp-cap">Phase 1 &middot; Processing Component &middot; <span class="reg">use_mount &rarr; process_file (per doc, memoized)</span></div>
      <div class="col">
        {node("logic", "Transform &middot; LLM extraction", "instructor + LiteLLM", "extract_summary &middot; extract_relationships")}
        {ARROW}
        <div class="row">
          {node("target", "Target state", "Document node", "declare_record &middot; filename &middot; title &middot; summary")}
          {node("data", "Data &middot; carried forward", "DocTriples", "(subject, predicate, object) &times; N")}
        </div>
      </div>
    </div>

    {ARROW}

    <div class="comp">
      <div class="comp-cap">Phase 2 &middot; Processing Component &middot; <span class="reg">mount &rarr; build_graph (one pass, all docs)</span></div>
      <div class="col">
        {node("logic", "Transform", "dedupe entities &middot; stable ids", "generate_id(subject, predicate, object)")}
        {ARROW}
        {node("target", "Target states", "Entity &middot; RELATIONSHIP &middot; MENTION", "declare_record &middot; declare_relation")}
      </div>
    </div>

    {ARROW}
    {node("logic", "Target", "Neo4j", "property graph &middot; Document &middot; Entity &middot; edges")}
  </div>

  <div class="legend">
    <div class="lg"><span class="sw logic"></span>Source / transform</div>
    <div class="lg"><span class="sw data"></span>Data (state)</div>
    <div class="lg"><span class="sw target"></span>Target state</div>
    <div class="lg"><span class="sw comp"></span>Processing component</div>
  </div>
</body></html>'''


# ─────────────────────────── SVG helpers ───────────────────────────
def _stroke(base, hl):
    return (PALM, 4.0) if hl else base


def tlines(cx, cy, lines, size, weight=600, color=MAROON_INK, mono=False):
    fam = "'JetBrains Mono', monospace" if mono else "Inter, sans-serif"
    lh = size * 1.16
    y0 = cy - lh * (len(lines) - 1) / 2
    spans = "".join(
        f'<tspan x="{cx}" y="{y0 + i*lh:.1f}">{t}</tspan>' for i, t in enumerate(lines))
    return (f'<text text-anchor="middle" dominant-baseline="central" '
            f'font-family="{fam}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}">{spans}</text>')


def logic(x, y, w, h, lines, *, hl=False, size=26, mono=False, sub=None):
    st, sw = _stroke((MAROON, 2.4), hl)
    body = (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" '
            f'fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>')
    if sub:
        body += tlines(x + w/2, y + h/2 - 12, lines, size, mono=mono)
        body += tlines(x + w/2, y + h/2 + 22, [sub], 19, weight=500, color=MUTED)
    else:
        body += tlines(x + w/2, y + h/2, lines, size, mono=mono)
    return body


def data(x, y, w, h, lines, *, hl=False, size=23, mono=True):
    st, sw = _stroke((MAROON, 2.4), hl)
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" '
            f'fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>'
            + tlines(x + w/2, y + h/2, lines, size, mono=mono))


def bullet(x, y, w, h, lines, *, hl=False, size=21):
    st, sw = _stroke((MAROON, 2.4), hl)
    r = h / 2
    d = f"M {x} {y} L {x+w-r} {y} A {r} {r} 0 0 1 {x+w-r} {y+h} L {x} {y+h} Z"
    return (f'<path d="{d}" fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>'
            + tlines(x + (w-r)/2 + 2, y + h/2, lines, size, mono=True))


def app(x, y, w, h, label, *, hl=False):
    st, sw = _stroke((CORAL, 2.6), hl)
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" '
            f'fill="{APP_FILL}" stroke="{st}" stroke-width="{sw}"/>'
            + tlines(x + w/2, y + 26, [label], 19, weight=600, color=CORAL, mono=True))


def pc(x, y, w, h, label, *, hl=False):
    st, sw = _stroke((MAROON, 2.2), hl)
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="11" '
            f'fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>'
            + tlines(x + w/2, y + 24, [label], 18, weight=600, color=MUTED, mono=True))


def arrow(x1, y, x2):
    return (f'<line x1="{x1}" y1="{y}" x2="{x2-11}" y2="{y}" stroke="{MAROON}" '
            f'stroke-width="2.6" marker-end="url(#ah)"/>')


def bind(x1, y, x2):
    return (f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{MAROON}" '
            f'stroke-width="2.4" stroke-dasharray="7 6"/>')


DEFS = (f'<defs><marker id="ah" markerWidth="13" markerHeight="12" refX="10" refY="4" '
        f'orient="auto" markerUnits="userSpaceOnUse">'
        f'<path d="M0 0 L11 4 L0 8 Z" fill="{MAROON}"/></marker></defs>')


# ─────────────────────────── stage: phase 1 fan-out ───────────────────────────
def phase1_svg():
    APP_X = 260; APP_Y = 40; APP_H = 530
    PADX = 30; FILE_W = 130; FILE_H = 52; GAPF = 40
    PC_PADX = 26; XFM_W = 290; XFM_H = 92; GAPX = 36; OUT_W = 252; PCH = 184
    PCW = PC_PADX + XFM_W + GAPX + OUT_W + PC_PADX
    APP_W = PADX + FILE_W + GAPF + PCW + PADX
    TGT_W = 184
    TGT_X = APP_X + APP_W + 40
    W = TGT_X + TGT_W + 40; H = APP_Y + APP_H + 32

    file_x = APP_X + PADX
    pc_x = file_x + FILE_W + GAPF
    xfm_x = pc_x + PC_PADX
    out_x = xfm_x + XFM_W + GAPX
    SRC = (40, APP_Y, 180, APP_H)

    s = [DEFS]
    s.append(logic(*SRC, ["Docs", "folder"], size=26, sub="walk_dir"))
    s.append(app(APP_X, APP_Y, APP_W, APP_H, "CocoIndex App"))
    s.append(logic(TGT_X, APP_Y, TGT_W, APP_H, ["Neo4j"], size=26, sub="graph"))

    for cy, fname in [(182, "a.md"), (372, "b.md")]:
        s.append(bind(SRC[0] + SRC[2], cy, file_x))
        s.append(data(file_x, cy - FILE_H/2, FILE_W, FILE_H, [fname], hl=True))
        s.append(arrow(file_x + FILE_W, cy, pc_x))
        s.append(pc(pc_x, cy - PCH/2, PCW, PCH, "process_file", hl=True))
        s.append(logic(xfm_x, cy - XFM_H/2 + 12, XFM_W, XFM_H,
                       ["LLM extract"], size=25, sub="memoized"))
        s.append(arrow(xfm_x + XFM_W, cy - 26, out_x))
        s.append(bullet(out_x, cy - 26 - 27, OUT_W, 54, ["Document node"], size=18))
        s.append(arrow(xfm_x + XFM_W, cy + 44, out_x))
        s.append(data(out_x, cy + 44 - 25, OUT_W, 50, ["DocTriples ⟶ ②"], size=17))
        s.append(bind(out_x + OUT_W, cy - 26, TGT_X))

    ex = APP_X + APP_W / 2
    for dy in (-20, 0, 20):
        s.append(f'<circle cx="{ex}" cy="{518 + dy}" r="6" fill="{MUTED}"/>')
    return W, H, "".join(s)


# ─────────────────────────── stage: phase 2 graph pass ───────────────────────────
def phase2_svg():
    APP_Y = 40; APP_H = 380
    SRC = (40, APP_Y, 196, APP_H)
    APP_X = 276
    PADX = 32; IN_W = 168; IN_H = 56; GAPF = 42
    PC_PADX = 26; XFM_W = 330; XFM_H = 100; GAPX = 36; OUT_W = 300; PCH = 286
    PCW = PC_PADX + XFM_W + GAPX + OUT_W + PC_PADX
    APP_W = PADX + IN_W + GAPF + PCW + PADX
    TGT_W = 184
    TGT_X = APP_X + APP_W + 40
    W = TGT_X + TGT_W + 40; H = APP_Y + APP_H + 32

    in_x = APP_X + PADX
    pc_x = in_x + IN_W + GAPF
    xfm_x = pc_x + PC_PADX
    out_x = xfm_x + XFM_W + GAPX
    CY = APP_Y + APP_H/2 + 20

    s = [DEFS]
    s.append(logic(*SRC, ["DocTriples", "× all docs"], size=24, sub="from phase ①"))
    s.append(app(APP_X, APP_Y, APP_W, APP_H, "CocoIndex App"))
    s.append(logic(TGT_X, APP_Y, TGT_W, APP_H, ["Neo4j"], size=26, sub="graph"))

    s.append(bind(SRC[0] + SRC[2], CY, in_x))
    s.append(data(in_x, CY - IN_H/2, IN_W, IN_H, ["docs"], size=21))
    s.append(arrow(in_x + IN_W, CY, pc_x))
    s.append(pc(pc_x, CY - PCH/2, PCW, PCH, "build_graph (one pass)", hl=True))
    s.append(logic(xfm_x, CY - XFM_H/2 + 14, XFM_W, XFM_H,
                   ["Dedupe entities"], size=24, sub="generate_id(s, p, o)"))
    for dy, label in [(-58, "Entity nodes"), (14, "RELATIONSHIP"), (86, "MENTION")]:
        s.append(arrow(xfm_x + XFM_W, CY + dy, out_x))
        s.append(bullet(out_x, CY + dy - 26, OUT_W, 52, [label], size=18))
        s.append(bind(out_x + OUT_W, CY + dy, TGT_X))
    return W, H, "".join(s)


# ─────────────────────────── graph schema ───────────────────────────
def edge(x1, y1, x2, y2, label=None, *, lx=None, ly=None):
    s = (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{MAROON}" '
         f'stroke-width="2.6" marker-end="url(#ah)"/>')
    if label:
        s += (f'<text x="{lx}" y="{ly}" text-anchor="middle" '
              f'font-family="JetBrains Mono, monospace" font-size="15" font-weight="600" '
              f'letter-spacing=".08em" fill="{CORAL}">{label}</text>')
    return s


def entity(cx, cy, label="Entity", sub="value"):
    return (f'<circle cx="{cx}" cy="{cy}" r="66" fill="{CREAM_SOFT}" '
            f'stroke="{MAROON}" stroke-width="2.4"/>'
            + tlines(cx, cy - 8, [label], 23)
            + tlines(cx, cy + 20, [sub], 17, weight=500, color=MUTED, mono=True))


def schema_svg():
    W, H = 1060, 500
    s = [DEFS]
    # Document node
    DX, DY, DW, DH = 60, 184, 264, 132
    s.append(f'<rect x="{DX}" y="{DY}" width="{DW}" height="{DH}" rx="8" '
             f'fill="{CREAM}" stroke="{MAROON}" stroke-width="2.6"/>')
    s.append(tlines(DX + DW/2, DY + 44, ["Document"], 27))
    s.append(tlines(DX + DW/2, DY + 84, ["filename · title", "summary"], 17,
                    weight=500, color=MUTED, mono=True))
    # Entities
    E1 = (610, 120); E2 = (610, 380); E3 = (930, 250)
    s.append(entity(*E1)); s.append(entity(*E2)); s.append(entity(*E3))
    # MENTION edges (Document -> Entity)
    s.append(edge(DX + DW, 222, E1[0] - 62, 142, "MENTION", lx=438, ly=158))
    s.append(edge(DX + DW, 278, E2[0] - 62, 358, "MENTION", lx=438, ly=342))
    # RELATIONSHIP edges (Entity -> Entity, predicate on the edge)
    s.append(edge(E1[0], E1[1] + 70, E2[0], E2[1] - 70,
                  "RELATIONSHIP", lx=610, ly=242))
    s.append(tlines(610, 264, ["predicate"], 15, weight=500, color=MUTED, mono=True))
    s.append(edge(E1[0] + 58, E1[1] + 32, E3[0] - 58, E3[1] - 32))
    s.append(edge(E2[0] + 58, E2[1] - 32, E3[0] - 58, E3[1] + 32))
    return W, H, "".join(s)


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
(OUT_DIR / "flow.html").write_text(flow_html())
print("wrote flow.html")

SVG_DIAGRAMS = {
    "schema": schema_svg,
    "stage-phase1": phase1_svg,
    "stage-phase2": phase2_svg,
}
svg_sizes = {}
for name, fn in SVG_DIAGRAMS.items():
    w, h, body = fn()
    (OUT_DIR / f"{name}.html").write_text(page(w, h, body))
    svg_sizes[name] = (w + 68, h + 68)
    print(f"wrote {name}.html")

if "--render" in sys.argv:
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    subprocess.run([
        chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
        "--force-color-profile=srgb", "--virtual-time-budget=8000",
        f"--screenshot={OUT_DIR / 'flow-v1.png'}", "--window-size=1240,1680",
        (OUT_DIR / "flow.html").as_uri(),
    ], check=True)
    print("rendered flow-v1.png")
    for name, (ww, hh) in svg_sizes.items():
        subprocess.run([
            chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
            "--force-color-profile=srgb", "--virtual-time-budget=8000",
            f"--screenshot={OUT_DIR / (name + '.png')}", f"--window-size={ww},{hh}",
            (OUT_DIR / f"{name}.html").as_uri(),
        ], check=True)
        print(f"rendered {name}.png")
