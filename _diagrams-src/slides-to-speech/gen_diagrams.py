#!/usr/bin/env python3
"""V1 diagrams for the `product-recommendation` example (cover + flow-v1)."""
import pathlib, subprocess, sys
OUT = pathlib.Path(__file__).resolve().parent
CREAM="#FCF3D8"; CREAM_SOFT="#F6F4E9"; MAROON="#532638"; MAROON_INK="#2A121B"; CORAL="#BE5133"
PEACH="#E59A63"; PALM="#27E62B"; PALM_INK="#16A534"; RULE="rgba(42,18,27,0.16)"; MUTED="rgba(42,18,27,0.58)"
GF=('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&'
    'family=Source+Serif+4:ital,wght@0,400;0,600;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap')
HEAD=f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="{GF}" rel="stylesheet">'

def cover_html():
    def chip(l): return (f'<div style="font-family:\'JetBrains Mono\',monospace;font-weight:600;font-size:23px;'
        f'color:{MAROON_INK};background:{CREAM};border:1.8px solid {MAROON};border-radius:11px;padding:14px 22px;white-space:nowrap;">{l}</div>')
    sep=f'<div style="color:{CORAL};font-size:30px;font-weight:700;">&rarr;</div>'
    pipe=sep.join([chip("Slides"),chip("Vision LLM"),chip("Piper TTS"),chip("LanceDB")])
    return f'''<!doctype html><html><head><meta charset="utf-8">{HEAD}<style>
*{{margin:0;padding:0;box-sizing:border-box}}html,body{{width:1200px;height:630px}}
body{{background:{CREAM};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;color:{MAROON_INK};padding:70px 80px;display:flex;flex-direction:column;justify-content:space-between}}
.eyebrow{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:{CORAL};display:flex;align-items:center;gap:14px}}
.eyebrow .dot{{width:13px;height:13px;border-radius:50%;background:{CORAL}}}
h1{{font-family:'Source Serif 4',serif;font-weight:600;font-size:74px;line-height:1.05;letter-spacing:-.02em}}h1 em{{font-style:italic;color:{CORAL}}}
.sub{{font-size:27px;color:{MUTED};line-height:1.4;max-width:940px;margin-top:6px}}.pipe{{display:flex;align-items:center;gap:18px}}.coco{{position:absolute;top:60px;right:78px;font-size:60px}}
</style></head><body><div class="coco">🥥</div><div><div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Example</div></div>
<div><h1>Slides to<br><em>Narrated Search</em></h1><div class="sub">Render each slide, write speaker notes with a vision LLM, narrate them with Piper TTS, and index it all in LanceDB.</div></div>
<div class="pipe">{pipe}</div></body></html>'''

def node(kind,cap,ttl,sub="",hl=False):
    s=f'<div class="sub">{sub}</div>' if sub else ""
    return f'<div class="node {kind}{" hl" if hl else ""}"><div class="cap">{cap}</div><div class="ttl mono">{ttl}</div>{s}</div>'
ARROW='<div class="arrow"><div class="line"></div><div class="head"></div></div>'

def flow_html():
    return f'''<!doctype html><html><head><meta charset="utf-8">{HEAD}<style>
*{{margin:0;padding:0;box-sizing:border-box}}html,body{{width:1240px}}
body{{background:{CREAM};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;color:{MAROON_INK};padding:48px 60px 40px;display:flex;flex-direction:column;align-items:center}}
.eyebrow{{align-self:flex-start;font-family:'JetBrains Mono',monospace;font-weight:600;font-size:21px;letter-spacing:.18em;text-transform:uppercase;color:{CORAL};display:flex;align-items:center;gap:12px;margin-bottom:28px}}
.eyebrow .dot{{width:12px;height:12px;border-radius:50%;background:{CORAL}}}.col{{display:flex;flex-direction:column;align-items:center}}.row{{display:flex;gap:30px;align-items:stretch}}
.node{{background:{CREAM};border:1.8px solid {MAROON};color:{MAROON_INK};padding:16px 30px;text-align:center;min-width:300px}}.row .node{{min-width:0;flex:1}}
.node.logic{{border-radius:18px}}.node.data{{border-radius:5px}}.node.target{{border-radius:4px 22px 22px 4px}}
.cap{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:{MUTED};margin-bottom:7px}}
.ttl{{font-weight:600;font-size:26px;letter-spacing:-.01em}}.ttl.mono{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:23px}}.sub{{font-size:18px;color:{MUTED};margin-top:7px;line-height:1.35}}
.arrow{{display:flex;flex-direction:column;align-items:center;height:42px}}.arrow .line{{width:2.6px;flex:1;background:{MAROON}}}.arrow .head{{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid {MAROON}}}
.comp{{background:color-mix(in oklab,{PEACH} 13%,{CREAM});border:2px solid {CORAL};border-radius:24px;padding:22px 34px 30px;display:flex;flex-direction:column;align-items:center}}
.comp-cap{{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:{CORAL};margin-bottom:20px;text-align:center}}
.comp-cap .reg{{color:{MUTED};text-transform:none;letter-spacing:0;font-weight:500;font-family:Inter;font-size:17px}}
.legend{{align-self:stretch;margin-top:38px;display:flex;justify-content:center;gap:34px;flex-wrap:wrap;border-top:1.5px solid {RULE};padding-top:24px}}
.lg{{display:flex;align-items:center;gap:12px;font-size:18px;color:{MUTED}}}.sw{{width:40px;height:26px;background:{CREAM};border:1.8px solid {MAROON};flex:none}}
.sw.logic{{border-radius:13px}}.sw.data{{border-radius:4px}}.sw.target{{border-radius:3px 13px 13px 3px}}.sw.comp{{background:color-mix(in oklab,{PEACH} 13%,{CREAM});border-color:{CORAL};border-radius:8px}}
</style></head><body><div class="eyebrow"><span class="dot"></span>CocoIndex &middot; Slides to speech flow</div><div class="col">
{node("logic","Source","localfs.walk_dir","slide decks · *.pdf")}{ARROW}
<div class="comp"><div class="comp-cap">Processing Component &middot; <span class="reg">mount_each &rarr; process_file (per deck, memoized)</span></div><div class="col">
{node("logic","Transform · pymupdf","pdf_to_slides","PDF → one image per slide")}{ARROW}
{node("data","Data","slides","SlidePage · page + image")}{ARROW}
<div class="comp" style="background:#F6F4E9;border:1.8px dashed color-mix(in oklab,#BE5133 60%,transparent)"><div class="comp-cap" style="color:#532638aa">coco.map &rarr; process_slide (per slide)</div><div class="col">
{node("logic","Transform · vision LLM","extract_speaker_notes","slide image → speaker notes")}{ARROW}
<div class="row">{node("logic","Transform · Piper TTS","text_to_speech","notes → MP3 audio")}{node("logic","Transform · embed","SentenceTransformer","notes → vector")}</div>{ARROW}
{node("target","Target state · one per slide","declare_row → SlideRecord","page · notes · voice · embedding")}</div></div></div></div>{ARROW}
{node("logic","Target","LanceDB","slides_to_speech table")}
<div class="legend"><div class="lg"><span class="sw logic"></span>Source / transform</div><div class="lg"><span class="sw data"></span>Data (state)</div><div class="lg"><span class="sw target"></span>Target state</div><div class="lg"><span class="sw comp"></span>Processing component</div></div>
</body></html>'''

(OUT/"cover.html").write_text(cover_html()); (OUT/"flow.html").write_text(flow_html()); print("wrote html")
if "--render" in sys.argv:
    ch="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    for name,size in [("cover","1200,630"),("flow-v1","1240,1500")]:
        src="cover.html" if name=="cover" else "flow.html"
        subprocess.run([ch,"--headless=new","--hide-scrollbars","--no-sandbox","--force-color-profile=srgb",
            "--virtual-time-budget=8000",f"--screenshot={OUT/(name+'.png')}",f"--window-size={size}",(OUT/src).as_uri()],check=True)
        print("rendered",name)
