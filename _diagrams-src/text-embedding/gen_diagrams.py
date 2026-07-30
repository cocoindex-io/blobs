#!/usr/bin/env python3
"""V1 diagrams for the `text-embedding` (Semantic Search 101) example.

Adapted from the index-codebase-v1 blog generators, fitted to
examples/text_embedding/main.py:
  walk_dir -> files -> [process_file: RecursiveSplitter(markdown)
  -> for each chunk: embed -> declare_row(DocEmbedding)] -> Postgres/pgvector.

Renders (SVG is what the docs page embeds; HTML files are local previews):
  flow-v1.svg             full vertical pipeline (hero)
  stage-file-process.svg  per-file transform + output highlighted
  stage-main-function.svg files + processing components highlighted (mount_each)
  stage-create-app.svg    App container highlighted (binding the app)

Everything is vector: text stays live text with a web-safe font stack (Inter /
JetBrains Mono with system fallbacks), matching the card.svg convention in this
repo. No @font-face is embedded, so viewers without Inter get the fallback.

Usage:
  python3 gen_diagrams.py            # write SVG + HTML previews
  python3 gen_diagrams.py --render   # also rasterize PNGs via headless Chrome (macOS)
"""
import pathlib, subprocess, sys

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR

CREAM = "#FCF3D8"; CREAM_SOFT = "#F6F4E9"
MAROON = "#532638"; MAROON_INK = "#2A121B"; CORAL = "#BE5133"
PEACH = "#E59A63"; PALM = "#27E62B"; PALM_INK = "#16A534"
RULE = "rgba(42,18,27,0.16)"; MUTED = "rgba(42,18,27,0.58)"
# Precomputed color-mix(in oklab, PEACH 11%, CREAM). Kept as a literal because a
# standalone SVG loaded via <img> must not depend on CSS Color 5 support: an
# unparsed fill falls back to black, not to the intended tint.
APP_FILL = "#FAE9CB"
# Precomputed color-mix(in oklab, CORAL 60%, transparent) over CREAM_SOFT.
SUB_STROKE = "#D28D6F"

SANS = "Inter, 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"

GF = ('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&'
      'family=Source+Serif+4:ital,wght@0,400;0,600;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap')
HEAD = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        f'<link href="{GF}" rel="stylesheet">')


# ─────────────────────────── SVG helpers (stages) ───────────────────────────
def _stroke(base, hl):
    return (PALM, 4.0) if hl else base


def _esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def tlines(cx, cy, lines, size, weight=600, color=MAROON_INK, mono=False):
    fam = MONO if mono else SANS
    lh = size * 1.16
    y0 = cy - lh * (len(lines) - 1) / 2
    spans = "".join(
        f'<tspan x="{cx}" y="{y0 + i*lh:.1f}">{_esc(t)}</tspan>' for i, t in enumerate(lines))
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


def fanout_svg(*, hl_fn=False, hl_file=False, hl_pc=False):
    APP_X = 250; APP_Y = 40; APP_H = 464
    PADX = 30; FILE_W = 116; FILE_H = 52; GAPF = 40
    PC_PADX = 28; XFM_W = 280; XFM_H = 84; GAPX = 36; OUT_W = 176; OUT_H = 54
    PCW = PC_PADX + XFM_W + GAPX + OUT_W + PC_PADX; PCH = 152
    APP_W = PADX + FILE_W + GAPF + PCW + PADX
    TGT_W = 184
    TGT_X = APP_X + APP_W + 40
    W = TGT_X + TGT_W + 40; H = APP_Y + APP_H + 32

    file_x = APP_X + PADX
    pc_x = file_x + FILE_W + GAPF
    xfm_x = pc_x + PC_PADX
    out_x = xfm_x + XFM_W + GAPX
    SRC = (40, APP_Y, 170, APP_H)

    s = [DEFS]
    s.append(logic(*SRC, ["Docs", "folder"], size=26, sub="walk_dir"))
    s.append(app(APP_X, APP_Y, APP_W, APP_H, "CocoIndex App"))
    s.append(logic(TGT_X, APP_Y, TGT_W, APP_H, ["Postgres"], size=26, sub="pgvector"))

    for cy, fname in [(160, "a.md"), (340, "b.md")]:
        s.append(bind(SRC[0] + SRC[2], cy, file_x))
        s.append(data(file_x, cy - FILE_H/2, FILE_W, FILE_H, [fname], hl=hl_file))
        s.append(arrow(file_x + FILE_W, cy, pc_x))
        s.append(pc(pc_x, cy - PCH/2, PCW, PCH, "process_file", hl=hl_pc))
        s.append(logic(xfm_x, cy - XFM_H/2 + 10, XFM_W, XFM_H,
                       ["Chunk & embed"], hl=hl_fn, size=24))
        s.append(arrow(xfm_x + XFM_W, cy, out_x))
        s.append(bullet(out_x, cy - OUT_H/2, OUT_W, OUT_H,
                        ["DocEmbedding", "row"], hl=hl_fn, size=18))
        s.append(bind(out_x + OUT_W, cy, TGT_X))

    ex = APP_X + APP_W / 2
    for dy in (-20, 0, 20):
        s.append(f'<circle cx="{ex}" cy="{452 + dy}" r="6" fill="{MUTED}"/>')
    return W, H, "".join(s)


def appdef_svg():
    SRC = (40, 40, 178, 252)
    PADX = 36; ST_W = 150; ST_H = 64; GAP = 58; XF_W = 210; XF_H = 76; TS_W = 178; TS_H = 60
    APP_W = PADX + ST_W + GAP + XF_W + GAP + TS_W + PADX
    APP_X = 258; CY = 40 + 126
    TGT_W = 178; TGT_X = APP_X + APP_W + 40
    W = TGT_X + TGT_W + 40; H = 332

    st_x = APP_X + PADX; xf_x = st_x + ST_W + GAP; ts_x = xf_x + XF_W + GAP
    s = [DEFS]
    s.append(logic(*SRC, ["Source", "System"], size=25))
    s.append(app(APP_X, 40, APP_W, 252, "CocoIndex App", hl=True))
    s.append(data(st_x, CY - ST_H/2, ST_W, ST_H, ["State"], size=24, mono=False))
    s.append(arrow(st_x + ST_W, CY, xf_x))
    s.append(logic(xf_x, CY - XF_H/2, XF_W, XF_H, ["Transform F(x)"], size=24))
    s.append(arrow(xf_x + XF_W, CY, ts_x))
    s.append(bullet(ts_x, CY - TS_H/2, TS_W, TS_H, ["Target State"], size=21))
    s.append(logic(TGT_X, 40, TGT_W, 252, ["Target", "System"], size=25))
    s.append(bind(SRC[0] + SRC[2], CY, st_x))
    s.append(bind(ts_x + TS_W, CY, TGT_X))
    return W, H, "".join(s)


# ─────────────────────────── flow (hero), as SVG ───────────────────────────
# Vector port of the previous flow.html: same vertical pipeline, same shape
# language (rounded = logic, square-ish = data, flag = target state,
# peach = component, dashed = per-chunk sub-component).

def _shape(kind, x, y, w, h, st, sw):
    if kind == "logic":
        return (f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="18" '
                f'fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>')
    if kind == "data":
        return (f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="5" '
                f'fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>')
    # target state: flag shape, rounded on the trailing edge. The radius is
    # clamped so the small legend swatch keeps the same silhouette.
    rl, rr = 4, min(22, h / 2)
    d = (f"M {x+rl:.0f} {y:.0f} L {x+w-rr:.0f} {y:.0f} A {rr} {rr} 0 0 1 {x+w:.0f} {y+rr:.0f} "
         f"L {x+w:.0f} {y+h-rr:.0f} A {rr} {rr} 0 0 1 {x+w-rr:.0f} {y+h:.0f} "
         f"L {x+rl:.0f} {y+h:.0f} A {rl} {rl} 0 0 1 {x:.0f} {y+h-rl:.0f} "
         f"L {x:.0f} {y+rl:.0f} A {rl} {rl} 0 0 1 {x+rl:.0f} {y:.0f} Z")
    return f'<path d="{d}" fill="{CREAM}" stroke="{st}" stroke-width="{sw}"/>'


def _text(cx, y, text, *, size, weight=600, color=MAROON_INK, mono=False, track=None):
    ls = f' letter-spacing="{track}"' if track else ""
    return (f'<text x="{cx:.0f}" y="{y:.0f}" text-anchor="middle" dominant-baseline="central" '
            f'font-family="{MONO if mono else SANS}" font-size="{size}" '
            f'font-weight="{weight}" fill="{color}"{ls}>{_esc(text)}</text>')


FNODE_H = 104


def fnode(cx, y, w, kind, cap, ttl, sub="", *, mono=True, hl=False, h=FNODE_H):
    x = cx - w / 2
    st, sw = (PALM_INK, 3.0) if hl else (MAROON, 1.8)
    s = [_shape(kind, x, y, w, h, st, sw)]
    s.append(_text(cx, y + 26, cap.upper(), size=14, color=MUTED, mono=True, track="1.9"))
    s.append(_text(cx, y + h / 2 + 4, ttl, size=24 if mono else 26, mono=mono))
    if sub:
        s.append(_text(cx, y + h - 20, sub, size=18, weight=400, color=MUTED))
    return "".join(s)


def vdown(cx, y, length=42):
    """Vertical connector with a solid arrowhead, matching the CSS version."""
    y2 = y + length
    return (f'<line x1="{cx:.0f}" y1="{y:.0f}" x2="{cx:.0f}" y2="{y2-9:.0f}" '
            f'stroke="{MAROON}" stroke-width="2.6"/>'
            f'<path d="M {cx-7:.0f} {y2-9:.0f} L {cx+7:.0f} {y2-9:.0f} L {cx:.0f} {y2:.0f} Z" '
            f'fill="{MAROON}"/>')


def fcomp(cx, y, w, h, cap_mono, cap_reg):
    x = cx - w / 2
    return ("".join([
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="24" '
        f'fill="{APP_FILL}" stroke="{CORAL}" stroke-width="2"/>',
        _text(cx, y + 32, cap_mono.upper(), size=16, color=CORAL, mono=True, track="1.3"),
        _text(cx, y + 58, cap_reg, size=17, weight=500, color=MUTED),
    ]))


def fsubcomp(cx, y, w, h, cap):
    x = cx - w / 2
    return ("".join([
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="20" '
        f'fill="{CREAM_SOFT}" stroke="{SUB_STROKE}" stroke-width="1.8" '
        f'stroke-dasharray="8 7"/>',
        _text(cx, y + 30, cap.upper(), size=14, color=MUTED, mono=True, track="1.1"),
    ]))


VGAP = 42          # arrow length
COMP_PAD_T = 82    # component top pad through both caption lines
COMP_PAD_B = 30
COMP_PAD_X = 34
SUB_PAD_T = 56     # sub-component top pad through its single caption line
SUB_PAD_B = 26
SUB_PAD_X = 28


def flow_svg():
    W = 1240
    CX = W / 2
    COMP_W = W - 120
    NODE_W = 760
    INNER_W = COMP_W - 2 * COMP_PAD_X
    SUB_W = INNER_W
    SUB_INNER_W = SUB_W - 2 * SUB_PAD_X

    SUB_H = SUB_PAD_T + FNODE_H + VGAP + FNODE_H + SUB_PAD_B
    COMP_H = COMP_PAD_T + FNODE_H + VGAP + FNODE_H + VGAP + SUB_H + COMP_PAD_B

    s = []
    y = 48

    # eyebrow
    s.append(f'<circle cx="60" cy="{y+11}" r="6" fill="{CORAL}"/>')
    s.append(f'<text x="82" y="{y+11}" dominant-baseline="central" font-family="{MONO}" '
             f'font-size="21" font-weight="600" fill="{CORAL}" letter-spacing="3.8">'
             f'COCOINDEX · TEXT EMBEDDING FLOW</text>')
    y += 30 + 28

    s.append(fnode(CX, y, NODE_W, "logic", "Source", "localfs.walk_dir",
                   "Local filesystem · watches for changes (live=True)"))
    y += FNODE_H
    s.append(vdown(CX, y)); y += VGAP

    s.append(fnode(CX, y, NODE_W, "data", "Data", "files", "one FileLike per Markdown file"))
    y += FNODE_H
    s.append(vdown(CX, y)); y += VGAP

    # ── processing component ──
    s.append(fcomp(CX, y, COMP_W, COMP_H, "Processing component",
                   "mount_each → process_file (per file, memoized)"))
    iy = y + COMP_PAD_T
    s.append(fnode(CX, iy, INNER_W, "logic", "Transform · Markdown", "RecursiveSplitter",
                   "split into overlapping chunks (2000 / 500)", hl=True))
    iy += FNODE_H
    s.append(vdown(CX, iy)); iy += VGAP
    s.append(fnode(CX, iy, INNER_W, "data", "Data", "chunks", "Chunk · text, char offsets"))
    iy += FNODE_H
    s.append(vdown(CX, iy)); iy += VGAP

    s.append(fsubcomp(CX, iy, SUB_W, SUB_H, "coco.map → process_chunk (per chunk)"))
    sy = iy + SUB_PAD_T
    s.append(fnode(CX, sy, SUB_INNER_W, "logic", "Transform",
                   "SentenceTransformerEmbedder.embed",
                   "chunk text → embedding (384-d vector)"))
    sy += FNODE_H
    s.append(vdown(CX, sy)); sy += VGAP
    s.append(fnode(CX, sy, SUB_INNER_W, "target", "Target state",
                   "declare_row → DocEmbedding",
                   "id · filename · text · embedding · char offsets"))
    y += COMP_H
    s.append(vdown(CX, y)); y += VGAP

    s.append(fnode(CX, y, NODE_W, "logic", "Target", "Postgres · pgvector",
                   "doc_embeddings table · vector index (cosine)"))
    y += FNODE_H

    # ── legend ──
    y += 38
    s.append(f'<line x1="60" y1="{y}" x2="{W-60}" y2="{y}" stroke="{RULE}" stroke-width="1.5"/>')
    y += 24
    items = [("logic", "Source / transform"), ("data", "Data (state)"),
             ("target", "Target state"), ("comp", "Processing component")]
    widths = [40 + 12 + len(label) * 8.9 for _, label in items]
    total = sum(widths) + 34 * (len(items) - 1)
    lx = CX - total / 2
    for (kind, label), iw in zip(items, widths):
        if kind == "comp":
            s.append(f'<rect x="{lx:.0f}" y="{y:.0f}" width="40" height="26" rx="8" '
                     f'fill="{APP_FILL}" stroke="{CORAL}" stroke-width="1.8"/>')
        else:
            s.append(_shape(kind, lx, y, 40, 26, MAROON, 1.8))
        s.append(f'<text x="{lx+52:.0f}" y="{y+13}" dominant-baseline="central" '
                 f'font-family="{SANS}" font-size="18" font-weight="400" fill="{MUTED}">'
                 f'{label}</text>')
        lx += iw + 34
    y += 26 + 40

    return W, int(y), "".join(s)


def svg_file(w, h, body, *, pad=0):
    """Standalone SVG: cream plate, padded content, no external assets."""
    ow, oh = w + 2 * pad, h + 2 * pad
    inner = f'<g transform="translate({pad},{pad})">{body}</g>' if pad else body
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{ow}" height="{oh}" '
            f'viewBox="0 0 {ow} {oh}" role="img">'
            f'<rect width="{ow}" height="{oh}" fill="{CREAM}"/>{inner}</svg>')


def page(w, h, body, *, pad=0):
    return (f'<!doctype html><html><head><meta charset="utf-8">'
            f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link href="{GF}" rel="stylesheet"><style>'
            f'*{{margin:0;padding:0;box-sizing:border-box}}'
            f'body{{background:{CREAM};padding:{pad}px}}'
            f'svg{{display:block}}</style></head><body>'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">{body}</svg></body></html>')


# ─────────────────────────── render all ───────────────────────────
DIAGRAMS = {
    "flow-v1": (flow_svg, 0),
    "stage-file-process": (lambda: fanout_svg(hl_fn=True), 34),
    "stage-main-function": (lambda: fanout_svg(hl_file=True, hl_pc=True), 34),
    "stage-create-app": (appdef_svg, 34),
}

sizes = {}
for name, (fn, pad) in DIAGRAMS.items():
    w, h, body = fn()
    (OUT_DIR / f"{name}.svg").write_text(svg_file(w, h, body, pad=pad))
    # HTML preview: same SVG, plus the webfont links so a local browser shows
    # the intended Inter / JetBrains Mono rendering.
    (OUT_DIR / f"{name}.html").write_text(page(w, h, body, pad=pad))
    sizes[name] = (w + 2 * pad, h + 2 * pad)
    print(f"wrote {name}.svg + {name}.html")

if "--render" in sys.argv:
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    for name, (ww, hh) in sizes.items():
        subprocess.run([
            chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
            "--force-color-profile=srgb", "--virtual-time-budget=8000",
            f"--screenshot={OUT_DIR / (name + '.png')}", f"--window-size={ww},{hh}",
            (OUT_DIR / f"{name}.html").as_uri(),
        ], check=True)
        print(f"rendered {name}.png")
