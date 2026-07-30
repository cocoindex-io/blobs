#!/usr/bin/env python3
"""V1 diagrams for the `multi-format-indexing` example.

Fitted to examples/multi_format_indexing/main.py:
  walk_dir(*.pdf / *.jpg / *.png) -> [process_file (per file, memoized):
  file_to_pages (pdf2image) -> pages -> coco.map process_page: ColPali
  embed_page -> declare_point] -> Qdrant collection (multi-vector, MaxSim).

Renders (light variant — cover + flow only, no stage diagrams):
  cover.png     social/hero cover (raster, used as og:image)
  flow-v1.svg   full vertical pipeline (hero) — what the docs page embeds
  flow-v1.html  local preview of the same SVG with webfonts

Everything in the flow is vector: text stays live text with a web-safe font
stack (Inter / JetBrains Mono with system fallbacks), matching the card.svg
convention in this repo. No @font-face is embedded.

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


# ─────────────────────────── cover ───────────────────────────
def cover_html():
    def chip(l): return (f'<div style="font-family:\'JetBrains Mono\',monospace;font-weight:600;font-size:23px;'
        f'color:{MAROON_INK};background:{CREAM};border:1.8px solid {MAROON};border-radius:11px;padding:14px 22px;white-space:nowrap;">{l}</div>')
    sep=f'<div style="color:{CORAL};font-size:30px;font-weight:700;">&rarr;</div>'
    pipe=sep.join([chip("PDF + Images"),chip("Pages"),chip("ColPali"),chip("Qdrant")])
    return f'''<!doctype html><html><head><meta charset="utf-8">{HEAD}<style>
*{{margin:0;padding:0;box-sizing:border-box}}html,body{{width:1200px;height:630px}}
body{{background:{CREAM};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;color:{MAROON_INK};padding:70px 80px;display:flex;flex-direction:column;justify-content:space-between}}
.eyebrow{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:{CORAL};display:flex;align-items:center;gap:14px}}
.eyebrow .dot{{width:13px;height:13px;border-radius:50%;background:{CORAL}}}
h1{{font-family:'Source Serif 4',serif;font-weight:600;font-size:74px;line-height:1.05;letter-spacing:-.02em}}h1 em{{font-style:italic;color:{CORAL}}}
.sub{{font-size:27px;color:{MUTED};line-height:1.4;max-width:940px;margin-top:6px}}.pipe{{display:flex;align-items:center;gap:18px}}.coco{{position:absolute;top:60px;right:78px;font-size:60px}}
</style></head><body><div class="coco">🥥</div><div><div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Example</div></div>
<div><h1>Index <em>Any Format</em><br>Together</h1><div class="sub">Render every PDF page to an image, embed pages and images with multi-vector ColPali, and search them all in one Qdrant collection.</div></div>
<div class="pipe">{pipe}</div></body></html>'''


# ─────────────────────────── flow (hero), as SVG ───────────────────────────
# Vector port of the previous flow.html: same vertical pipeline, same shape
# language (rounded = logic, square-ish = data, flag = target state,
# peach = component, dashed = per-page sub-component).

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
            f'font-weight="{weight}" fill="{color}"{ls}>{text}</text>')


FNODE_H = 104


def fnode(cx, y, w, kind, cap, ttl, sub="", *, mono=True, h=FNODE_H):
    x = cx - w / 2
    s = [_shape(kind, x, y, w, h, MAROON, 1.8)]
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
             f'COCOINDEX · MULTI-FORMAT INDEXING FLOW</text>')
    y += 30 + 28

    s.append(fnode(CX, y, NODE_W, "logic", "Source", "localfs.walk_dir",
                   "source_files · *.pdf / *.jpg / *.png"))
    y += FNODE_H
    s.append(vdown(CX, y)); y += VGAP

    # ── processing component ──
    s.append(fcomp(CX, y, COMP_W, COMP_H, "Processing component",
                   "mount_each → process_file (per file, memoized)"))
    iy = y + COMP_PAD_T
    s.append(fnode(CX, iy, INNER_W, "logic", "Transform · pdf2image", "file_to_pages",
                   "PDF → one image per page · image → one page"))
    iy += FNODE_H
    s.append(vdown(CX, iy)); iy += VGAP
    s.append(fnode(CX, iy, INNER_W, "data", "Data", "pages", "Page · page_number + image"))
    iy += FNODE_H
    s.append(vdown(CX, iy)); iy += VGAP

    s.append(fsubcomp(CX, iy, SUB_W, SUB_H, "coco.map → process_page (per page)"))
    sy = iy + SUB_PAD_T
    s.append(fnode(CX, sy, SUB_INNER_W, "logic", "Transform · ColPali",
                   "embed_page",
                   "page image → multi-vector embedding"))
    sy += FNODE_H
    s.append(vdown(CX, sy)); sy += VGAP
    s.append(fnode(CX, sy, SUB_INNER_W, "target", "Target state · one per page",
                   "declare_point → Qdrant",
                   "id · vectors · payload {filename, page}"))
    y += COMP_H
    s.append(vdown(CX, y)); y += VGAP

    s.append(fnode(CX, y, NODE_W, "logic", "Target", "Qdrant",
                   "collection · multi-vector · MaxSim", mono=False))
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


def page(w, h, body):
    return (f'<!doctype html><html><head><meta charset="utf-8">'
            f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link href="{GF}" rel="stylesheet"><style>'
            f'*{{margin:0;padding:0;box-sizing:border-box}}'
            f'body{{background:{CREAM}}}'
            f'svg{{display:block}}</style></head><body>'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">{body}</svg></body></html>')


# ─────────────────────────── render ───────────────────────────
(OUT_DIR / "cover.html").write_text(cover_html())
print("wrote cover.html")

fw, fh, fbody = flow_svg()
(OUT_DIR / "flow-v1.svg").write_text(svg_file(fw, fh, fbody))
(OUT_DIR / "flow-v1.html").write_text(page(fw, fh, fbody))
print("wrote flow-v1.svg + flow-v1.html")

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
        f"--screenshot={OUT_DIR / 'flow-v1.png'}", f"--window-size={fw},{fh}",
        (OUT_DIR / "flow-v1.html").as_uri(),
    ], check=True)
    print("rendered flow-v1.png")
