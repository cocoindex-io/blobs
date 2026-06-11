#!/usr/bin/env python3
"""Incremental-update diagram for the 'Incremental updates' section.

A single file is edited and re-chunked, so the new chunk set partially
overlaps the old one. Unchanged chunks are reused (no re-embed, row left
as-is), a chunk that disappeared has its row deleted, and a genuinely new
chunk is embedded and inserted. The same partial-overlap diff is what a
chunking-parameter change produces.

Shape/colour semantics (house style): sharp rect = data (a chunk / a row),
palm green = new -> embed + insert, terracotta = gone -> delete,
muted grey = unchanged -> reused. Only the delta does any work.

Renders ../incremental-diff.png .

Usage:
  python3 gen_incremental.py            # write HTML
  python3 gen_incremental.py --render   # rasterize PNG via headless Chrome (macOS)
"""
import pathlib, subprocess, sys

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
POST_DIR = SCRIPT_DIR

CREAM = "#FCF3D8"; MAROON = "#532638"; MAROON_INK = "#2A121B"; CORAL = "#BE5133"
PALM = "#16A534"; MUTED = "rgba(42,18,27,0.58)"; FAINT = "rgba(42,18,27,0.34)"
PALM_FILL = "color-mix(in oklab, #16A534 13%, #FCF3D8)"
CORAL_FILL = "color-mix(in oklab, #BE5133 12%, #FCF3D8)"
GREY_FILL = "color-mix(in oklab, #2A121B 5%, #FCF3D8)"

GF = ('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&'
      'family=JetBrains+Mono:wght@400;500;600&display=swap')


def tlines(cx, cy, lines, size, weight=600, color=MAROON_INK, mono=False):
    fam = "'JetBrains Mono', monospace" if mono else "Inter, sans-serif"
    lh = size * 1.16
    y0 = cy - lh * (len(lines) - 1) / 2
    spans = "".join(
        f'<tspan x="{cx}" y="{y0 + i*lh:.1f}">{t}</tspan>' for i, t in enumerate(lines))
    return (f'<text text-anchor="middle" dominant-baseline="central" '
            f'font-family="{fam}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}">{spans}</text>')


def text(cx, cy, s, size, *, weight=600, color=MAROON_INK, mono=False, anchor="middle"):
    fam = "'JetBrains Mono', monospace" if mono else "Inter, sans-serif"
    return (f'<text x="{cx}" y="{cy}" text-anchor="{anchor}" dominant-baseline="central" '
            f'font-family="{fam}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}">{s}</text>')


def rect(x, y, w, h, *, stroke, sw=2.4, fill=CREAM, rx=6, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"{d}/>')


def chip(cx, cy, w, h, label, *, stroke, fill=CREAM, tcolor=MAROON_INK, size=19, rx=6, sw=2.4):
    return (rect(cx - w/2, cy - h/2, w, h, stroke=stroke, sw=sw, fill=fill, rx=rx)
            + tlines(cx, cy, [label], size, color=tcolor, mono=True))


def line(x1, y1, x2, y2, color, sw=2.4, dash=None, marker=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    m = f' marker-end="url(#{marker})"' if marker else ''
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{sw}"{d}{m}/>')


def _marker(mid, color):
    return (f'<marker id="{mid}" markerWidth="12" markerHeight="11" refX="9" refY="4" '
            f'orient="auto" markerUnits="userSpaceOnUse">'
            f'<path d="M0 0 L10 4 L0 8 Z" fill="{color}"/></marker>')


DEFS = ('<defs>' + _marker("ahc", CORAL) + _marker("ahp", PALM)
        + _marker("ahg", FAINT) + '</defs>')


def svg():
    # columns
    OLD_CX = 150; NEW_CX = 345; CW = 122; CH = 50
    PG_X = 606; PG_W = 212; PG_RX = 16
    ROW_CX = PG_X + PG_W / 2; ROW_W = 168; ROW_H = 44
    new_r = NEW_CX + CW / 2          # right edge of the "after" column
    old_r = OLD_CX + CW / 2
    # bands (one chunk story per row)
    b1, b2, b3, b4 = 156, 230, 304, 378
    PG_Y = 126; PG_H = (b4 + 30) - PG_Y
    W = PG_X + PG_W + 36; H = 476

    s = [DEFS]

    # ---- headers ----------------------------------------------------------
    head_cx = (OLD_CX + NEW_CX) / 2
    s.append(text(head_cx, 42, "file.md", 20, mono=True, color=MAROON_INK))
    s.append(text(head_cx, 66, "edited → re-chunked", 14, weight=500, color=MUTED))
    s.append(text(OLD_CX, 98, "before", 14, weight=600, color=MUTED))
    s.append(text(NEW_CX, 98, "after", 14, weight=600, color=MUTED))
    s.append(text(ROW_CX, 98, "Postgres", 14, weight=600, color=MUTED))

    # ---- Postgres container + resulting rows ------------------------------
    s.append(rect(PG_X, PG_Y, PG_W, PG_H, stroke=MAROON, sw=2.4, rx=PG_RX))
    s.append(chip(ROW_CX, b1, ROW_W, ROW_H, "row A", stroke=FAINT, fill=GREY_FILL, tcolor=MUTED))
    # deleted row: struck through, faded
    s.append(chip(ROW_CX, b2, ROW_W, ROW_H, "row B", stroke=CORAL, fill=CORAL_FILL,
                  tcolor=CORAL, sw=2.0))
    s.append(line(ROW_CX - 40, b2, ROW_CX + 40, b2, CORAL, sw=2.0))
    s.append(chip(ROW_CX, b3, ROW_W, ROW_H, "row C", stroke=FAINT, fill=GREY_FILL, tcolor=MUTED))
    s.append(chip(ROW_CX, b4, ROW_W, ROW_H, "row D", stroke=PALM, fill=PALM_FILL,
                  tcolor=MAROON_INK, sw=2.8))

    # ---- reused bands: old chunk == new chunk, row untouched --------------
    for cy, name in [(b1, "chunk A"), (b3, "chunk C")]:
        s.append(chip(OLD_CX, cy, CW, CH, name, stroke=FAINT, fill=GREY_FILL, tcolor=MUTED))
        s.append(chip(NEW_CX, cy, CW, CH, name, stroke=FAINT, fill=GREY_FILL, tcolor=MUTED))
        s.append(line(old_r, cy, NEW_CX - CW/2, cy, FAINT, sw=2.0))
        s.append(text((old_r + NEW_CX - CW/2) / 2, cy - 14, "reuse", 12, weight=600, color=MUTED))
        s.append(line(new_r, cy, PG_X - 2, cy, FAINT, sw=2.0, dash="6 6", marker="ahg"))
        s.append(text((new_r + PG_X) / 2, cy - 13, "no-op", 13, weight=600, color=MUTED))

    # ---- removed band: old chunk B gone -> delete its row -----------------
    s.append(chip(OLD_CX, b2, CW, CH, "chunk B", stroke=CORAL, fill=CORAL_FILL, tcolor=CORAL))
    s.append(line(old_r, b2, PG_X - 2, b2, CORAL, sw=2.6, marker="ahc"))
    s.append(text((old_r + PG_X) / 2, b2 - 14, "delete", 13.5, weight=700, color=CORAL))

    # ---- added band: new chunk D -> embed -> insert -----------------------
    s.append(chip(NEW_CX, b4, CW, CH, "chunk D", stroke=PALM, fill=PALM_FILL,
                  tcolor=MAROON_INK, sw=2.8))
    pill_cx = (new_r + PG_X) / 2; pill_w = 92; pill_h = 34
    s.append(line(new_r, b4, pill_cx - pill_w/2, b4, PALM, sw=2.6, marker="ahp"))
    s.append(rect(pill_cx - pill_w/2, b4 - pill_h/2, pill_w, pill_h,
                  stroke=PALM, sw=2.4, fill=PALM_FILL, rx=pill_h // 2))
    s.append(tlines(pill_cx, b4, ["embed"], 16, weight=600, color=PALM, mono=True))
    s.append(line(pill_cx + pill_w/2, b4, PG_X - 2, b4, PALM, sw=2.6, marker="ahp"))
    s.append(text((pill_cx + pill_w/2 + PG_X) / 2, b4 - 14, "insert", 13.5, weight=700, color=PALM))

    # ---- caption ----------------------------------------------------------
    s.append(text(W / 2, 442,
                  "Unchanged chunks are reused — only the delta is embedded, inserted, or deleted.",
                  15, weight=500, color=MUTED))
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


w, h, body = svg()
(SCRIPT_DIR / "incremental-diff.html").write_text(page(w, h, body))
print("wrote incremental-diff.html")

if "--render" in sys.argv:
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    subprocess.run([
        chrome, "--headless=new", "--hide-scrollbars", "--no-sandbox",
        "--force-color-profile=srgb", "--virtual-time-budget=8000",
        f"--screenshot={POST_DIR / 'incremental-diff.png'}",
        f"--window-size={w + 68},{h + 68}",
        (SCRIPT_DIR / "incremental-diff.html").as_uri(),
    ], check=True)
    print("rendered incremental-diff.png")
