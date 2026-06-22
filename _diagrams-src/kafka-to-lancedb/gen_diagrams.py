#!/usr/bin/env python3
"""V1 diagrams for the `kafka-to-lancedb` example.

Adapted from _diagrams-src/image-search and csv-to-kafka generators, fitted to
examples/kafka_to_lancedb/main.py:

  kafka.topic_as_map(consumer, [TOPIC]) -> keyed messages -> [process_message
  (per message): json.loads, shape check ("sku" vs "emp_id") ->
  declare_row(Product) | declare_row(Employee)] -> two LanceDB tables
  (products / employees), upsert by primary key.

It is the consumer side of csv-to-kafka: Kafka is the SOURCE here.

Renders:
  cover.png              social/hero cover
  flow-v1.png            full vertical pipeline (hero)
  stage-file-process.png per-message dispatch: one process_message per message,
                         routed to products / employees by message shape

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


# ─────────────────────────── cover ───────────────────────────
def cover_html():
    def chip(label):
        return (f'<div style="font-family:\'JetBrains Mono\',monospace;font-weight:600;font-size:23px;'
                f'color:{MAROON_INK};background:{CREAM};border:1.8px solid {MAROON};border-radius:11px;'
                f'padding:14px 22px;white-space:nowrap;">{label}</div>')
    sep = (f'<div style="color:{CORAL};font-size:30px;font-weight:700;">&rarr;</div>')
    pipeline = sep.join([chip("Kafka topic"), chip("process_message"), chip("products / employees")])
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
.sub{{font-size:27px;color:{MUTED};line-height:1.4;max-width:940px;margin-top:6px;}}
.pipe{{display:flex;align-items:center;gap:18px;}}
.coco{{position:absolute;top:60px;right:78px;font-size:60px;}}
</style></head><body>
  <div class="coco">🥥</div>
  <div>
    <div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Example</div>
  </div>
  <div>
    <h1>Consume Kafka<br>into <em>LanceDB</em></h1>
    <div class="sub">Read JSON messages off a Kafka topic and dispatch each one — by its shape — into the right LanceDB table, with offsets managed for you.</div>
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
.row{{display:flex;gap:30px;align-items:stretch;}}

.node{{background:{CREAM};border:1.8px solid {MAROON};color:{MAROON_INK};
  padding:16px 30px;text-align:center;min-width:340px;}}
.row .node{{min-width:0;flex:1;}}
.node.logic{{border-radius:18px;}}
.node.data{{border-radius:5px;}}
.node.target{{border-radius:4px 22px 22px 4px;}}
.node.hl{{border-color:{PALM_INK};border-width:3px;}}
.cap{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:.14em;
  text-transform:uppercase;color:{MUTED};margin-bottom:7px;}}
.ttl{{font-weight:600;font-size:26px;letter-spacing:-.01em;}}
.ttl.mono{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:23px;}}
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
  <div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Kafka &rarr; LanceDB flow (consume)</div>

  <div class="col">
    {node("logic", "Source", "kafka.topic_as_map", "subscribe topic &middot; keyed messages &middot; offsets managed")}
    {ARROW}
    {node("data", "Data", "messages", "one Message per Kafka record")}
    {ARROW}

    <div class="comp">
      <div class="comp-cap">Processing Component &middot; <span class="reg">mount_each &rarr; process_message (per message)</span></div>
      <div class="col">
        {node("logic", "Transform &middot; parse &amp; dispatch", "json.loads(value)", "shape check: &quot;sku&quot; &rarr; Product &middot; &quot;emp_id&quot; &rarr; Employee")}
        {ARROW}
        <div class="row">
          {node("target", "Target state", "declare_row(Product)", "products table &middot; pk = sku")}
          {node("target", "Target state", "declare_row(Employee)", "employees table &middot; pk = emp_id")}
        </div>
      </div>
    </div>

    {ARROW}
    <div class="row">
      {node("logic", "Target", "LanceDB &middot; products", "upsert by sku")}
      {node("logic", "Target", "LanceDB &middot; employees", "upsert by emp_id")}
    </div>
  </div>

  <div class="legend">
    <div class="lg"><span class="sw logic"></span>Source / transform</div>
    <div class="lg"><span class="sw data"></span>Data (state)</div>
    <div class="lg"><span class="sw target"></span>Target state</div>
    <div class="lg"><span class="sw comp"></span>Processing component</div>
  </div>
</body></html>'''


# ─────────────────────────── stages (SVG) ───────────────────────────
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


# ─────────── stage: per-message dispatch (shape -> table) ───────────
def fanout_svg(*, hl_fn=True):
    APP_X = 256; APP_Y = 40; APP_H = 480
    PADX = 30; FILE_W = 150; FILE_H = 52; GAPF = 40
    PC_PADX = 28; XFM_W = 312; XFM_H = 92; GAPX = 36; OUT_W = 232; OUT_H = 56
    PCW = PC_PADX + XFM_W + GAPX + OUT_W + PC_PADX; PCH = 152
    APP_W = PADX + FILE_W + GAPF + PCW + PADX
    TGT_W = 200
    TGT_X = APP_X + APP_W + 40
    W = TGT_X + TGT_W + 40; H = APP_Y + APP_H + 32

    file_x = APP_X + PADX
    pc_x = file_x + FILE_W + GAPF
    xfm_x = pc_x + PC_PADX
    out_x = xfm_x + XFM_W + GAPX
    SRC = (40, APP_Y, 188, APP_H)

    s = [DEFS]
    s.append(logic(*SRC, ["Kafka", "topic"], size=26, sub="topic_as_map"))
    s.append(app(APP_X, APP_Y, APP_W, APP_H, "CocoIndex App"))

    rows = [
        (162, '{"sku": …}', "declare_row(Product)", ["LanceDB", "products"], "pk = sku"),
        (358, '{"emp_id": …}', "declare_row(Employee)", ["LanceDB", "employees"], "pk = emp_id"),
    ]
    tgt_h = (APP_H - 40) / 2 - 14
    for i, (cy, mlabel, outlabel, tlabel, tsub) in enumerate(rows):
        s.append(bind(SRC[0] + SRC[2], cy, file_x))
        s.append(data(file_x, cy - FILE_H/2, FILE_W, FILE_H, [mlabel], hl=hl_fn, size=18))
        s.append(arrow(file_x + FILE_W, cy, pc_x))
        s.append(pc(pc_x, cy - PCH/2, PCW, PCH, "process_message", hl=hl_fn))
        s.append(logic(xfm_x, cy - XFM_H/2 + 10, XFM_W, XFM_H,
                       ["json.loads · shape check"], hl=hl_fn, size=21))
        s.append(arrow(xfm_x + XFM_W, cy, out_x))
        s.append(bullet(out_x, cy - OUT_H/2, OUT_W, OUT_H, [outlabel], hl=hl_fn, size=16))
        tgt_y = APP_Y + (tgt_h + 28) * i
        s.append(bind(out_x + OUT_W, cy, TGT_X))
        s.append(logic(TGT_X, tgt_y, TGT_W, tgt_h, tlabel, size=23, sub=tsub))

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
(OUT_DIR / "cover.html").write_text(cover_html())
print("wrote cover.html")
(OUT_DIR / "flow.html").write_text(flow_html())
print("wrote flow.html")

SVG_DIAGRAMS = {"stage-file-process": fanout_svg}
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
        f"--screenshot={OUT_DIR / 'cover.png'}", "--window-size=1200,630",
        (OUT_DIR / "cover.html").as_uri(),
    ], check=True)
    print("rendered cover.png")
    subprocess.run([
        chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
        "--force-color-profile=srgb", "--virtual-time-budget=8000",
        f"--screenshot={OUT_DIR / 'flow-v1.png'}", "--window-size=1240,1380",
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
