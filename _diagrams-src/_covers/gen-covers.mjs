// Wide dark-hero COVER svg per example — the homepage "Real-time codebase
// indexing" visual language, baked self-contained: parchment frame → window
// chrome (tag pill + traffic-light main.py) → grid + corner dots → a CLEAN
// source → transform → target lane with the coconut-sprout mascot as the
// through-line. Per-example pipeline facts mirror _cards/gen-cards.mjs.
//
// Output: public/docs-v1/img/examples/<slug>/cover.svg
// Run:    node _diagrams-src/_covers/gen-covers.mjs [slug...]
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = (slug) => resolve(ROOT, 'public/docs-v1/img/examples', slug, 'cover.svg');

const C = {
  parchment: '#F3E9D2', win: '#381E2E', maroon: '#532638', ink: '#2A121B',
  cream: '#FCF3D8', peach: '#E59A63', coral: '#BE5133', palm: '#3DE05A',
  violet: '#C9A0FF', gold: '#F5D76E', pink: '#FB6A76',
};
const MONO = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cm = (o) => `rgba(252,243,216,${o})`;

// ── shared chrome ───────────────────────────────────────────────────────────
function defs() {
  return `<defs>
    <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 H0 V20" fill="none" stroke="${C.cream}" stroke-opacity="0.05" stroke-width="1"/></pattern>
    <pattern id="d" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${C.cream}" fill-opacity="0.06"/></pattern>
    <radialGradient id="halo" cx="50%" cy="40%" r="62%"><stop offset="0%" stop-color="${C.maroon}" stop-opacity="0.5"/><stop offset="100%" stop-color="${C.win}" stop-opacity="0"/></radialGradient>
    <clipPath id="win"><rect x="10" y="10" width="460" height="280" rx="18"/></clipPath>
    <style>
      .flow{stroke-dasharray:4 4;animation:mv 1.1s linear infinite}@keyframes mv{to{stroke-dashoffset:-16}}
      .node{animation:pl 2.4s ease-in-out infinite;transform-origin:center;transform-box:fill-box}@keyframes pl{0%,100%{opacity:1}50%{opacity:.55}}
      .sq{animation:sq 2.6s ease-in-out infinite}@keyframes sq{0%,100%{opacity:.55}50%{opacity:1}}
      @media (prefers-reduced-motion:reduce){*{animation:none!important}}
    </style></defs>`;
}
function chrome(tag, file = 'main.py') {
  const tw = Math.round(tag.length * 6.9 + 30), fw = Math.round(54 + file.length * 6.4 + 16);
  return `<g transform="translate(26,26)"><rect width="${tw}" height="25" rx="12.5" fill="${cm(0.05)}" stroke="${cm(0.14)}"/><text x="15" y="13" dominant-baseline="central" font-family="${MONO}" font-size="10" letter-spacing="0.13em" font-weight="700" fill="${cm(0.82)}">${esc(tag)}</text></g>
  <g transform="translate(${454 - fw},26)"><rect width="${fw}" height="25" rx="12.5" fill="${cm(0.05)}" stroke="${cm(0.14)}"/><circle cx="17" cy="12.5" r="3" fill="${C.pink}"/><circle cx="28" cy="12.5" r="3" fill="${C.peach}"/><circle cx="39" cy="12.5" r="3" fill="${C.palm}"/><text x="53" y="13" dominant-baseline="central" font-family="${MONO}" font-size="10.5" fill="${cm(0.62)}">${esc(file)}</text></g>`;
}
function mascot(x, y, s = 0.92) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0,-13 L0,-23" stroke="${C.palm}" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="-7" cy="-25" rx="6" ry="2.6" fill="${C.palm}" transform="rotate(-30 -7 -25)"/>
    <ellipse cx="7" cy="-25" rx="6" ry="2.6" fill="${C.palm}" transform="rotate(30 7 -25)"/>
    <circle r="15" fill="${C.peach}"/><circle cx="-6" cy="-2" r="1.7" fill="${C.ink}"/><circle cx="6" cy="-2" r="1.7" fill="${C.ink}"/>
    <path d="M-6,4 Q0,9 6,4" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/></g>`;
}
const flow = (d, col, op = 0.9, w = 1.6) => `<path class="flow" d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}"/>`;
const cap = (x, y, t, col, sz = 8) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="${sz}" letter-spacing="0.05em" fill="${col}">${esc(t)}</text>`;
function panel(x, y, w, h, tag, accent = C.peach) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${cm(0.05)}" stroke="${cm(0.16)}" stroke-width="1.2"/>${tag ? `<text x="${x + 11}" y="${y + 15}" font-family="${MONO}" font-size="7.6" letter-spacing="0.12em" font-weight="800" fill="${accent}">${esc(tag)}</text>` : ''}`;
}

// ── SOURCE glyphs (left, ~x36 y104 w96 h116) ────────────────────────────────
const SX = 36, SY = 104, SW = 96, SH = 116;
function srcRows(tag, rows, accent = C.peach, hot = -1) {
  const body = rows.slice(0, 4).map((t, i) => `<text x="${SX + 12}" y="${SY + 36 + i * 16}" font-family="${MONO}" font-size="8.4" fill="${i === hot ? C.palm : (i === 0 ? accent : cm(0.6))}">${esc(t)}</text>`).join('');
  return panel(SX, SY, SW, SH, tag, accent) + body;
}
function srcImage(tag) {
  return panel(SX, SY, SW, SH, tag, C.gold) + `<g transform="translate(${SX},${SY})"><rect x="16" y="30" width="64" height="46" rx="4" fill="${cm(0.06)}" stroke="${cm(0.18)}"/><circle cx="32" cy="44" r="5.5" fill="${C.gold}"/><path d="M18 74 L38 54 L52 66 L64 52 L78 64 L78 74 Z" fill="${C.violet}" opacity="0.72"/><text x="48" y="100" text-anchor="middle" font-family="${MONO}" font-size="7.6" fill="${cm(0.4)}">pixels</text></g>`;
}
function srcAudio(tag) {
  const bars = Array.from({ length: 13 }, (_, i) => { const h = 6 + Math.abs(Math.sin(i * 0.9)) * 22; return `<rect class="sq" x="${i * 5.6}" y="${-h / 2}" width="3" height="${h}" rx="1.5" fill="${C.peach}" style="animation-delay:${(i % 5) * 0.12}s"/>`; }).join('');
  return panel(SX, SY, SW, SH, tag, C.peach) + `<g transform="translate(${SX + 14},${SY + 60})">${bars}</g><text x="${SX + 48}" y="${SY + 100}" text-anchor="middle" font-family="${MONO}" font-size="7.6" fill="${cm(0.4)}">waveform</text>`;
}
function srcProducts(tag) {
  const tiles = [[C.peach, 'cam'], [C.violet, 'lens'], [C.palm, 'pod'], [C.coral, 'bag']].map((p, i) => { const x = SX + 12 + (i % 2) * 40, y = SY + 28 + Math.floor(i / 2) * 38; return `<g transform="translate(${x},${y})"><rect width="34" height="30" rx="4" fill="${cm(0.05)}" stroke="${cm(0.14)}"/><rect x="6" y="6" width="22" height="9" rx="2" fill="${p[0]}" opacity="0.85"/><text x="6" y="26" font-family="${MONO}" font-size="6.4" fill="${cm(0.6)}">${p[1]}</text></g>`; }).join('');
  return panel(SX, SY, SW, SH, tag, C.peach) + tiles;
}
function srcRepos(tag) {
  const cards = [['sdk-core', C.peach], ['web-app', C.violet], ['infra', C.palm]].map((r, i) => `<g transform="translate(${SX + 10},${SY + 28 + i * 28})"><rect width="76" height="22" rx="6" fill="${cm(0.05)}" stroke="${cm(0.14)}"/><text x="10" y="14" font-family="${MONO}" font-size="8.4" font-weight="700" fill="${r[1]}">▸ ${esc(r[0])}</text></g>`).join('');
  return panel(SX, SY, SW, SH, tag, C.peach) + cards;
}

// ── TRANSFORM (center, mascot at 250,92) ────────────────────────────────────
function embedMid(accent, dim) {
  let g = `<text x="222" y="126" font-family="${MONO}" font-size="8" letter-spacing="0.06em" fill="${accent}" fill-opacity="0.9">embed</text>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) g += `<rect class="sq" x="${222 + c * 18}" y="${132 + r * 14}" width="14" height="8" rx="1.5" fill="${r === 2 ? C.coral : accent}" style="animation-delay:${((r + c) % 6) * 0.15}s"/>`;
  return g + cap(250, 192, dim || '768-d', cm(0.4));
}
function llmMid(label) {
  return `<g transform="translate(250,150)"><rect x="-27" y="-15" width="54" height="30" rx="9" fill="${C.maroon}" stroke="${C.coral}" stroke-width="1.3"/><text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-family="${MONO}" font-size="11" font-weight="800" fill="${C.peach}">LLM</text><path d="M21,-20 l2.4,5 5,2.4 -5,2.4 -2.4,5 -2.4,-5 -5,-2.4 5,-2.4 z" fill="${C.gold}"/></g>` + cap(250, 188, label || 'extract', cm(0.4));
}
function convertMid(label) {
  return `<g transform="translate(250,150)"><circle r="17" fill="${C.maroon}" stroke="${C.peach}" stroke-width="1.3"/><path d="M-7,-4 h10 M-7,0 h14 M-7,4 h8" stroke="${C.peach}" stroke-width="1.5" stroke-linecap="round"/></g>` + cap(250, 186, label || 'convert', cm(0.4));
}

// ── TARGET glyphs (right, ~x360) ────────────────────────────────────────────
const TX = 364, TCX = 410;
function cyl(col, label) {
  const x = 388, y = 122, w = 44, h = 60, ry = 7;
  return `<g fill="none" stroke="${col}" stroke-width="1.5"><rect x="${x}" y="${y + ry}" width="${w}" height="${h - ry * 2}" fill="${C.maroon}" stroke="none"/><ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}" fill="${C.maroon}"/><path d="M${x} ${y + ry} V${y + h - ry} a${w / 2} ${ry} 0 0 0 ${w} 0 V${y + ry}"/><line x1="${x + 6}" y1="${y + h * 0.5}" x2="${x + w - 6}" y2="${y + h * 0.5}" stroke="${C.coral}" stroke-opacity="0.9"/></g>` + cap(TCX, 202, label, col);
}
function cube(col, label) {
  return `<g transform="translate(386,120)" fill="none" stroke="${col}" stroke-width="1.6"><path d="M24 4 L44 14 V40 L24 50 L4 40 V14 Z"/><path d="M4 14 L24 24 L44 14 M24 24 V50"/></g>` + cap(TCX, 202, label, col);
}
function disk(col, label) {
  const x = 388, y = 122, w = 44, h = 56, ry = 18;
  return `<g fill="none" stroke="${col}" stroke-width="1.5"><ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}"/><path d="M${x} ${y + ry} V${y + h - ry} a${w / 2} ${ry} 0 0 0 ${w} 0 V${y + ry}"/><circle cx="${x + w / 2}" cy="${y + ry}" r="3" fill="${col}"/></g>` + cap(TCX, 202, label, col);
}
function cloud(col, label) {
  return `<g transform="translate(380,126)" fill="none" stroke="${col}" stroke-width="1.6"><path d="M16 36 a13 13 0 0 1 1 -25 a17 17 0 0 1 31 4 a10 10 0 0 1 -3 21 z"/></g>` + cap(TCX, 202, label, col);
}
function graphT(col, label) {
  const cols = [C.coral, C.violet, C.palm, C.peach, C.gold];
  const cx = TCX, cy = 152;
  const pts = Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [cx + Math.cos(a) * 30, cy + Math.sin(a) * 24]; });
  let g = pts.map(p => `<path d="M${cx} ${cy} L${p[0].toFixed(1)} ${p[1].toFixed(1)}" stroke="${cm(0.3)}" stroke-width="1.3"/>`).join('');
  g += pts.map((p, i) => `<circle class="node" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5.5" fill="${cols[i]}" style="animation-delay:${i * 0.4}s"/>`).join('');
  g += `<circle r="9" cx="${cx}" cy="${cy}" fill="${C.cream}"/>`;
  return g + cap(TCX, 202, label, C.palm);
}
function filesT(col, label) {
  return `${[0, 1, 2].map(i => `<rect x="${380 + i * 5}" y="${120 + i * 5}" width="48" height="56" rx="5" fill="${cm(0.05)}" stroke="${cm(0.16)}"/>`).join('')}<text x="${390}" y="${158}" font-family="${MONO}" font-size="8.5" fill="${C.palm}">&lt;/&gt;</text>` + cap(TCX, 202, label, C.palm);
}
function recordT(fields, label) {
  const x = 362, y = 116, w = 96, h = 74;
  let g = panel(x, y, w, h, '', C.palm) + `<text x="${x + 10}" y="${y + 20}" font-family="${MONO}" font-size="10" fill="${C.gold}">{</text>`;
  g += fields.slice(0, 3).map(([k, v], i) => `<g transform="translate(${x + 18},${y + 34 + i * 14})"><text font-family="${MONO}" font-size="8.2" fill="${C.pink}">"${esc(k)}"</text><text x="${k.length * 5.6 + 12}" font-family="${MONO}" font-size="8.2" fill="${cm(0.6)}">: ${esc(v)}</text></g>`).join('');
  return g + cap(TCX, 202, label, C.palm);
}
function kafkaT(col, label) {
  const msgs = ['orders ▦', 'users  ▦', 'events ▦'];
  let g = msgs.map((m, i) => `<g transform="translate(364,${120 + i * 20})"><rect width="92" height="16" rx="4" fill="${cm(0.05)}" stroke="${cm(0.16)}"/><circle cx="11" cy="8" r="2.6" fill="${[C.peach, C.violet, C.palm][i]}"/><text x="20" y="11" font-family="${MONO}" font-size="7.8" fill="${cm(0.6)}">${esc(m)}</text></g>`).join('');
  return g + cap(TCX, 202, label, col || C.gold);
}
function hybridT(col, label) {
  return `<g transform="translate(384,122)" fill="none" stroke="${C.palm}" stroke-width="1.5" stroke-linecap="round"><circle cx="18" cy="20" r="13"/><path d="M18 7 v26 M5 20 h26" stroke-opacity="0.5"/></g><text x="${TCX + 6}" y="148" font-family="${MONO}" font-size="9" fill="${C.gold}">RRF</text>` + cap(TCX, 202, label, C.palm);
}
const TGT = { cyl, cube, disk, cloud, graph: graphT, files: filesT, record: recordT, kafka: kafkaT, hybrid: hybridT };

// ── lane assembly ───────────────────────────────────────────────────────────
function lane(spec) {
  const acc = spec.accent || C.violet;
  const src = spec.src();
  const mid = spec.mid();
  const tgt = spec.tgt.kind === 'record'
    ? recordT(spec.tgt.fields, spec.tgt.label)
    : TGT[spec.tgt.kind](spec.tgt.col || acc, spec.tgt.label);
  const midGapL = spec.midKind === 'embed' ? 'M132,150 C168,150 184,132 216,134' : 'M132,150 C176,150 196,150 222,150';
  const midGapR = spec.midKind === 'embed' ? 'M286,150 C320,150 340,150 360,150' : 'M278,150 C312,150 336,150 360,150';
  return `${src}${flow(midGapL, spec.srcCol || C.peach)}${mascot(250, 92)}${mid}${flow(midGapR, acc)}${tgt}`;
}

// bespoke index-codebase scene (homepage port), placed inside the cover chrome
function codeScene() {
  return `<g transform="translate(0,12)">
    <g><rect x="36" y="92" width="92" height="122" rx="8" fill="${cm(0.05)}" stroke="${cm(0.16)}" stroke-width="1.2"/>
      <rect x="40" y="78" width="68" height="17" rx="8.5" fill="${C.maroon}" stroke="${C.peach}" stroke-width="1"/><text x="74" y="90" font-size="8" letter-spacing="0.04em" text-anchor="middle" fill="${C.peach}">Δ commit</text>
      <line x1="48" y1="112" x2="116" y2="112" stroke="${cm(0.18)}"/>
      <rect x="48" y="122" width="28" height="4" rx="1" fill="${C.peach}"/><rect x="80" y="122" width="30" height="4" rx="1" fill="${cm(0.5)}"/>
      <rect x="48" y="136" width="54" height="4" rx="1" fill="${cm(0.45)}"/><rect x="48" y="150" width="40" height="4" rx="1" fill="${cm(0.45)}"/>
      <rect class="sq" x="48" y="164" width="46" height="4" rx="1" fill="${C.palm}" fill-opacity="0.8"/><rect x="48" y="178" width="58" height="4" rx="1" fill="${cm(0.45)}"/><rect x="48" y="192" width="34" height="4" rx="1" fill="${cm(0.45)}"/></g>
    <path class="flow" d="M128,138 C150,138 160,106 190,98" fill="none" stroke="${C.peach}" stroke-width="1.6"/>
    <g fill="none" stroke-linecap="round">
      <path d="M210,107 L186,150" stroke="${cm(0.4)}" stroke-width="1.6"/><path d="M210,107 L246,150" stroke="${C.coral}" stroke-width="1.8"/>
      <path d="M186,150 L172,196" stroke="${cm(0.4)}" stroke-width="1.6"/><path d="M186,150 L202,196" stroke="${cm(0.4)}" stroke-width="1.6"/>
      <path d="M246,150 L232,196" stroke="${cm(0.4)}" stroke-width="1.6"/><path d="M246,150 L268,196" stroke="${C.coral}" stroke-width="1.8"/></g>
    <g><circle cx="186" cy="150" r="6" fill="${C.cream}"/><circle cx="246" cy="150" r="6" fill="${C.peach}"/><circle cx="172" cy="196" r="4" fill="${cm(0.6)}"/><circle cx="202" cy="196" r="4" fill="${cm(0.6)}"/><circle cx="232" cy="196" r="4" fill="${C.peach}"/><circle class="node" cx="268" cy="196" r="5" fill="${C.coral}"/></g>
    <text x="268" y="198.6" font-size="7" text-anchor="middle" fill="${C.ink}">Δ</text>
    <text x="210" y="218" font-size="8" letter-spacing="0.08em" text-anchor="middle" fill="${cm(0.4)}">tree-sitter · ast</text>
    <g><path d="M210,79 L210,69" stroke="${C.palm}" stroke-width="2" stroke-linecap="round"/><ellipse cx="203" cy="67" rx="6" ry="2.6" fill="${C.palm}" transform="rotate(-30 203 67)"/><ellipse cx="217" cy="67" rx="6" ry="2.6" fill="${C.palm}" transform="rotate(30 217 67)"/><circle cx="210" cy="92" r="15" fill="${C.peach}"/><circle cx="204" cy="90" r="1.7" fill="${C.ink}"/><circle cx="216" cy="90" r="1.7" fill="${C.ink}"/><path d="M204,96 Q210,101 216,96" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/></g>
    <path class="flow" d="M232,196 C282,194 292,150 312,140" fill="none" stroke="${C.violet}" stroke-width="1.4" stroke-opacity="0.85"/><path class="flow" d="M268,196 C296,188 300,154 312,152" fill="none" stroke="${C.coral}" stroke-width="1.4"/>
    <g><text x="312" y="120" font-size="8" letter-spacing="0.06em" fill="${C.violet}" fill-opacity="0.9">embed</text>
      ${[0, 1, 2].map(r => `<g fill="${r === 2 ? C.coral : C.violet}" fill-opacity="${r === 2 ? 1 : 0.6}">${[0, 1, 2, 3].map(c => `<rect class="sq" x="${312 + c * 18}" y="${126 + r * 14}" width="14" height="8" rx="1.5" style="animation-delay:${((r + c) % 6) * 0.15}s"/>`).join('')}</g>`).join('')}</g>
    <path class="flow" d="M384,144 H402" fill="none" stroke="${C.violet}" stroke-width="1.6"/>
    <g><rect x="406" y="120" width="44" height="48" fill="${C.maroon}"/><path d="M406,168 A22,6.5 0 0 0 450,168" fill="none" stroke="${C.violet}" stroke-width="1.4"/><line x1="406" y1="120" x2="406" y2="168" stroke="${C.violet}" stroke-width="1.4"/><line x1="450" y1="120" x2="450" y2="168" stroke="${C.violet}" stroke-width="1.4"/><line x1="412" y1="136" x2="444" y2="136" stroke="${C.violet}" stroke-opacity="0.55"/><line x1="412" y1="150" x2="444" y2="150" stroke="${C.coral}" stroke-opacity="0.9"/><ellipse cx="428" cy="120" rx="22" ry="6.5" fill="${C.maroon}" stroke="${C.violet}" stroke-width="1.4"/><text x="428" y="186" font-size="8" letter-spacing="0.04em" text-anchor="middle" fill="${C.violet}">pgvector</text></g>
  </g>`;
}

function buildCover(spec) {
  const inner = spec.scene ? spec.scene() : lane(spec);
  return `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(spec.aria || spec.tag)}">
${defs()}
  <rect width="480" height="300" rx="20" fill="${C.parchment}"/>
  <g clip-path="url(#win)">
    <rect x="10" y="10" width="460" height="280" fill="${C.win}"/>
    <rect x="10" y="10" width="460" height="280" fill="url(#halo)"/>
    <rect x="10" y="10" width="460" height="280" fill="url(#g)"/>
    <rect x="300" y="182" width="170" height="108" fill="url(#d)"/>
    <g font-family="${MONO}">${inner}</g>
    ${chrome(spec.tag, spec.file || 'main.py')}
  </g>
</svg>`;
}

// helpers to build lane specs compactly
const S = {
  rows: (tag, rows, acc, hot) => () => srcRows(tag, rows, acc, hot),
  image: (tag) => () => srcImage(tag),
  audio: (tag) => () => srcAudio(tag),
  products: (tag) => () => srcProducts(tag),
  repos: (tag) => () => srcRepos(tag),
};
const M = {
  embed: (dim, acc) => ({ midKind: 'embed', mid: () => embedMid(acc || C.violet, dim) }),
  llm: (label) => ({ midKind: 'llm', mid: () => llmMid(label) }),
  convert: (label) => ({ midKind: 'convert', mid: () => convertMid(label) }),
};
const T = (kind, label, col) => ({ kind, label, col });

// ── per-example covers (32 documented slugs) ────────────────────────────────
const SPECS = {
  'index-codebase': { tag: 'CODEBASE · REAL-TIME', scene: codeScene, aria: 'CocoIndex real-time codebase indexing: a committed file is parsed into a Tree-sitter AST, only the changed chunk is re-embedded and upserted into pgvector.' },

  // search → vectors → store
  'text-embedding': { tag: 'TEXT · SEARCH 101', src: S.rows('# *.MD', ['# heading', 'install…', 'usage…', 'run it']), ...M.embed('384-d'), tgt: T('cyl', 'pgvector'), accent: C.violet, aria: 'Markdown chunked, embedded, stored in Postgres pgvector for semantic search.' },
  'text-embedding-qdrant': { tag: 'TEXT · QDRANT', src: S.rows('# *.MD', ['# guide', 'setup', 'usage', '…']), ...M.embed('384-d', C.palm), tgt: T('cube', 'Qdrant', C.palm), accent: C.palm, aria: 'Markdown embedded into a managed Qdrant collection for semantic search.' },
  'text-embedding-lancedb': { tag: 'TEXT · LANCEDB', src: S.rows('# *.MD', ['# guide', 'setup', 'usage', '…']), ...M.embed('384-d', C.palm), tgt: T('disk', 'LanceDB', C.palm), accent: C.palm, aria: 'Markdown embedded into an embedded file-based LanceDB store, no server.' },
  'text-embedding-turbopuffer': { tag: 'TEXT · TURBOPUFFER', src: S.rows('# *.MD', ['# guide', 'setup', 'usage', '…']), ...M.embed('384-d', C.palm), tgt: T('cloud', 'Turbopuffer', C.palm), accent: C.palm, aria: 'Markdown embedded into a managed Turbopuffer namespace for semantic search.' },
  'amazon-s3-embedding': { tag: 'S3 · VECTORS', src: S.rows('🪣 S3 BUCKET', ['s3://docs/', 'guide.md', 'spec.md', '…'], C.gold), ...M.embed('384-d'), tgt: T('cyl', 'pgvector'), accent: C.violet, aria: 'Markdown from an Amazon S3 bucket embedded into Postgres pgvector.' },
  'google-drive-embedding': { tag: 'DRIVE · VECTORS', src: S.rows('🗂 GDRIVE', ['/Team Docs', 'plan.gdoc', 'notes.gdoc', '…'], C.gold), ...M.embed('768-d'), tgt: T('cyl', 'pgvector'), accent: C.violet, aria: 'Documents from Google Drive embedded into Postgres pgvector.' },
  'oci-object-storage-embedding': { tag: 'OCI · OBJECTS', src: S.rows('☁ OCI BUCKET', ['/oci/docs', 'guide.md', 'spec.md', '…'], C.gold), ...M.embed('384-d'), tgt: T('cyl', 'pgvector'), accent: C.violet, aria: 'Markdown objects from OCI Object Storage embedded into Postgres pgvector.' },
  'postgres-source': { tag: 'POSTGRES · SOURCE', src: S.rows('🗄 PG TABLE', ['id  name', '1   ada', '2   alan', '…'], C.peach), ...M.embed('768-d'), tgt: T('cyl', 'pgvector'), accent: C.violet, aria: 'Read rows from a Postgres table, derive and embed, write vectors back.' },
  'entire-session-search': { tag: 'SESSIONS · SEARCH', src: S.rows('💬 SESSIONS', ['▸ user: fix…', '◯ context', '▸ tool call', '…'], C.peach), ...M.embed('768-d'), tgt: T('cyl', 'Postgres'), accent: C.violet, aria: 'Index AI coding session transcripts and prompts into Postgres for semantic search.' },
  'pdf-embedding': { tag: 'PDF · GPU · VECTORS', src: S.rows('📕 *.PDF', ['report.pdf', 'spec.pdf', 'manual.pdf', '…'], C.coral), ...M.embed('768-d'), tgt: T('cyl', 'pgvector'), accent: C.violet, aria: 'PDFs converted to Markdown with docling on a GPU runner, chunked, embedded into Postgres.' },
  'sec-edgar-analytics': { tag: 'FILINGS · HYBRID', src: S.rows('📑 SEC FILING', ['10-K · XBRL', 'scrub PII', 'chunk + tag', '…'], C.coral), ...M.embed('vec+fts', C.palm), tgt: T('hybrid', 'Doris · RRF', C.palm), accent: C.palm, aria: 'SEC filings scrubbed, chunked, embedded and tagged into Apache Doris with vector and full-text indexes for hybrid RRF search.' },

  // multimodal (image/audio sources)
  'image-search': { tag: 'IMAGES · CLIP', src: S.image('🖼 PHOTOS'), ...M.embed('CLIP', C.palm), tgt: T('cube', 'Qdrant', C.palm), accent: C.palm, aria: 'Images embedded with CLIP into Qdrant, searched in natural language.' },
  'image-search-colpali': { tag: 'IMAGES · COLPALI', src: S.image('🖼 PHOTOS'), ...M.embed('MaxSim', C.palm), tgt: T('cube', 'Qdrant', C.palm), accent: C.palm, aria: 'Images embedded into multi-vector ColPali bags in Qdrant, ranked with MaxSim.' },
  'multi-format-indexing': { tag: 'PDF+IMG · COLPALI', src: S.image('🖼 PDF+IMG'), ...M.embed('MaxSim', C.palm), tgt: T('cube', 'Qdrant', C.palm), accent: C.palm, aria: 'PDFs and images indexed as page screenshots with ColPali into Qdrant, no OCR or chunking.' },
  'face-recognition': { tag: 'PHOTOS · FACES', src: S.image('🖼 PHOTOS'), ...M.embed('128-d', C.palm), tgt: T('cube', 'Qdrant', C.palm), accent: C.palm, aria: 'Detect every face in a folder of photos, embed each into a 128-d vector, index in Qdrant.' },
  'audio-to-text': { tag: 'AUDIO · LITELLM', src: S.audio('🎧 AUDIO'), ...M.llm('transcribe'), tgt: T('cyl', 'Postgres', C.peach), accent: C.peach, aria: 'Audio files transcribed with a LiteLLM speech-to-text model, stored row-per-file in Postgres.' },
  'slides-to-speech': { tag: 'SLIDES · NARRATE', src: S.image('🖼 SLIDES'), ...M.llm('vision + TTS'), tgt: T('disk', 'LanceDB', C.palm), accent: C.palm, aria: 'Render slides, write speaker notes with a vision LLM, narrate with Piper TTS, embed notes into LanceDB.' },

  // knowledge graphs (source → LLM → graph)
  'podcast-to-knowledge-graph': { tag: 'PODCAST · GRAPH', src: S.audio('🎙 EPISODE'), ...M.llm('extract'), tgt: T('graph', 'SurrealDB'), accent: C.palm, aria: 'Podcasts diarized, transcribed and LLM-extracted into a SurrealDB knowledge graph.' },
  'docs-to-knowledge-graph': { tag: 'DOCS · TRIPLES', src: S.rows('📄 DOCS/*.MD', ['# Heading', '- item one', 'A relates B', '…'], C.peach), ...M.llm('triples'), tgt: T('graph', 'Neo4j'), accent: C.palm, aria: 'Markdown docs turned into a Neo4j concept graph of LLM-extracted triples.' },
  'meeting-notes-to-knowledge-graph': { tag: 'MEETINGS · GRAPH', src: S.rows('📝 NOTES', ['Standup · today', '☑ ship Q3', '☐ draft PRD', '…'], C.peach), ...M.llm('extract'), tgt: T('graph', 'Neo4j'), accent: C.palm, aria: 'Google Drive meeting notes extracted into a Neo4j knowledge graph with entity resolution.' },
  'product-recommendation': { tag: 'PRODUCTS · GRAPH', src: S.products('🛍 CATALOG'), ...M.llm('taxonomy'), tgt: T('graph', 'Neo4j'), accent: C.palm, aria: 'LLM-extract what each product is and what pairs with it into a Neo4j recommendation graph.' },

  // structured extraction (source → LLM → record)
  'hackernews-trending-topics': { tag: 'HN · TRENDING', src: S.rows('🟧 HN API', ['Show HN:…', 'Ask HN:…', '+ comments', '…'], C.gold), ...M.llm('topics'), tgt: T('cyl', 'Postgres', C.coral), accent: C.coral, aria: 'Scrape HackerNews threads, LLM-extract topics, rank trending in Postgres.' },
  'paper-metadata': { tag: 'PAPERS · FIELDS', src: S.rows('📄 PAPER.PDF', ['Attention Is', 'All You Need', 'Vaswani 2017', '…'], C.coral), ...M.llm('extract'), tgt: { kind: 'record', label: 'typed + embedded', col: C.palm, fields: [['title', 'str'], ['authors', 'list'], ['year', 'int']] }, accent: C.coral, aria: 'LLM-extract title, authors and abstract from PDF papers into typed rows with embeddings.' },
  'patient-intake-baml': { tag: 'FORMS · BAML', src: S.rows('🏥 INTAKE.PDF', ['Name: J. Doe', 'DOB: 1984', 'Allergies:', 'penicillin'], C.coral), ...M.llm('BAML'), tgt: { kind: 'record', label: 'BAML · validated', col: C.palm, fields: [['name', 'str'], ['dob', 'date'], ['meds', 'list']] }, accent: C.coral, aria: 'Extract schema-validated patient records from intake PDFs with type-safe BAML.' },
  'patient-intake-dspy': { tag: 'VISION · DSPY', src: S.image('🖼 PAGE'), ...M.llm('DSPy vision'), tgt: { kind: 'record', label: 'DSPy · typed', col: C.palm, fields: [['name', 'str'], ['dob', 'date'], ['plan', 'str']] }, accent: C.coral, aria: 'Render intake PDFs to images and extract typed Patient data with a DSPy vision module.' },
  'manuals-llm-extraction': { tag: 'MANUALS · RECORDS', src: S.rows('📘 MANUAL.PDF', ['§ Module A', 'specs…', '§ Module B', 'specs…'], C.coral), ...M.llm('extract'), tgt: { kind: 'record', label: 'records → PG', col: C.palm, fields: [['module', 'str'], ['summary', 'str'], ['part_no', 'str']] }, accent: C.coral, aria: 'Convert PDF manuals to Markdown, LLM-extract typed module summaries, store records in Postgres.' },

  // custom blocks / transforms
  'pdf-to-markdown': { tag: 'PDF · MARKDOWN', src: S.rows('📕 INPUT.PDF', ['report.pdf', 'page 1…', 'page 2…', '…'], C.coral), ...M.convert('docling'), tgt: T('files', 'Markdown'), accent: C.gold, aria: 'Incrementally convert a folder of PDFs to Markdown with docling.' },
  'files-transform': { tag: 'MD · MARKDOWN-IT', src: S.rows('📁 DOCS/', ['intro.md', 'guide.md', 'faq.md', '…'], C.peach), ...M.convert('markdown-it'), tgt: T('files', 'HTML'), accent: C.gold, aria: 'Watch a folder of Markdown and render each file to HTML incrementally.' },

  // streaming
  'csv-to-kafka': { tag: 'CSV · LIVE KAFKA', src: S.rows('📄 ORDERS.CSV', ['id user total', '101 alice 49', '102 bob 18', '103 dave 27'], C.peach, 3), ...M.convert('row'), tgt: T('kafka', 'Kafka topic', C.gold), accent: C.gold, aria: 'Watch a folder of CSVs and publish each row as a JSON message to a Kafka topic.' },
  'kafka-to-lancedb': { tag: 'KAFKA · DISPATCH', src: S.rows('📨 KAFKA', ['{type:order}', '{type:user}', '{type:event}', '…'], C.violet), ...M.convert('by shape'), tgt: T('disk', 'LanceDB', C.palm), accent: C.palm, aria: 'Consume JSON messages off a Kafka topic and dispatch each by shape into LanceDB tables.' },

  // summarize
  'multi-codebase-summarization': { tag: 'REPOS · SUMMARIZE', src: S.repos('↻ ON PUSH'), ...M.llm('summarize'), tgt: T('files', 'org wiki'), accent: C.gold, aria: 'Walk many repos, LLM-extract typed per-file info, aggregate into an always-fresh Markdown wiki per project.' },

  // undocumented variants (no docs walkthrough; cover only)
  'code-embedding-lancedb': { tag: 'CODE · LANCEDB', src: S.rows('</> CODE', ['def embed(', '  chunk', '  …', ')'], C.peach), ...M.embed('code', C.palm), tgt: T('disk', 'LanceDB', C.palm), accent: C.palm, aria: 'Tree-sitter code chunks embedded into an embedded file-based LanceDB store for semantic code search.' },
  'meeting-notes-to-knowledge-graph-falkordb': { tag: 'MEETINGS · FALKORDB', src: S.rows('📝 NOTES', ['Standup · today', '☑ ship Q3', '☐ draft PRD', '…'], C.peach), ...M.llm('extract'), tgt: T('graph', 'FalkorDB'), accent: C.palm, aria: 'Google Drive meeting notes extracted into a FalkorDB knowledge graph.' },
};

const want = process.argv.slice(2);
let n = 0;
for (const [slug, spec] of Object.entries(SPECS)) {
  if (want.length && !want.includes(slug)) continue;
  const dir = dirname(OUT(slug));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(OUT(slug), buildCover(spec) + '\n');
  n++;
}
console.log(`wrote ${n} cover(s)`);
