// Generates the comprehensive, homepage-style example cards for /docs/examples.
// One self-contained animated SVG per example, in the hum-07 brand palette on a
// dark maroon-ink ground — the same visual language as the homepage "Built with
// CocoIndex" cards (example-meeting.svg / example-csv-kafka.svg), recolored to
// the brand. Each card exposes the example's special part: its real source →
// transform → target pipeline.
//
// Output: public/docs-v1/img/examples/<slug>/card.svg
// Run:    node _diagrams-src/_cards/gen-cards.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = (slug) => resolve(ROOT, 'public/docs-v1/img/examples', slug);

// ── hum-07 palette ────────────────────────────────────────────────────────
const C = {
  // Card surface: maroon-ink warmed with 10% lavender (oklab) → deep plum,
  // matching the homepage --card-ink. ink stays #2A121B for dark-on-light text.
  cardBg: '#381E2E',
  ink: '#2A121B', maroon: '#532638', maroonDeep: '#401E2B',
  cream: '#FCF3D8', cream70: 'rgba(252,243,216,0.72)', cream55: 'rgba(252,243,216,0.55)',
  cream40: 'rgba(252,243,216,0.40)', cream12: 'rgba(252,243,216,0.12)', cream07: 'rgba(252,243,216,0.07)',
  coral: '#BE5133', peach: '#E59A63', palm: '#3DE05A', palmDeep: '#16A534',
  gold: '#F5D76E', berry: '#FF9B8A', violet: '#C9A0FF', strg: '#8EF09E', pink: '#FB6A76',
};
const SANS = "'Plus Jakarta Sans','Inter',system-ui,-apple-system,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";

// ── small builders ──────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frameOpen() {
  return `<defs>
    <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
      <path d="M22 0 H0 V22" fill="none" stroke="${C.cream}" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
    <marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="${C.palm}"/>
    </marker>
    <marker id="ahc" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="${C.peach}"/>
    </marker>
    <style>
      .flow{stroke-dasharray:4 6;animation:mv 1.4s linear infinite}
      @keyframes mv{to{stroke-dashoffset:-20}}
      .pulse{animation:pl 2.2s ease-in-out infinite;transform-origin:center;transform-box:fill-box}
      @keyframes pl{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.2)}}
      .blink{animation:bk 1.05s steps(2,jump-none) infinite}
      @keyframes bk{50%{opacity:0}}
      .sq{opacity:.35;animation:sq 2.4s ease-in-out infinite}
      @keyframes sq{0%,100%{opacity:.3}50%{opacity:1}}
      .rise{transform-origin:bottom;transform-box:fill-box;animation:rs 3s ease-in-out infinite}
      @keyframes rs{0%,100%{transform:scaleY(.82)}50%{transform:scaleY(1)}}
      .drift{animation:df 6s ease-in-out infinite}
      @keyframes df{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
      @media (prefers-reduced-motion:reduce){*{animation:none!important}}
    </style>
  </defs>
  <rect width="480" height="300" fill="${C.cardBg}"/>
  <rect width="480" height="300" fill="url(#grid)"/>`;
}

// title with *accent* marker → coral italic; rest cream
function titleSVG(title, y = 58) {
  const m = title.match(/^(.*?)\*(.+?)\*(.*)$/);
  let inner;
  if (m) {
    inner = `${esc(m[1])}<tspan fill="${C.peach}" font-style="italic">${esc(m[2])}</tspan>${esc(m[3])}`;
  } else inner = esc(title);
  return `<text x="20" y="${y}" font-family="${SANS}" font-size="21" font-weight="800" letter-spacing="-0.02em" fill="${C.cream}">${inner}</text>`;
}

function topbar(tag, file = 'main.py') {
  const tw = tag.length * 6.7 + 24;
  // top-right: window traffic-light dots + filename, in a subtle pill
  const fw = 52 + file.length * 6.2 + 14;
  const fx = 464 - fw;
  return `<g transform="translate(16,14)">
    <rect width="${tw}" height="24" rx="12" fill="rgba(252,243,216,0.05)" stroke="rgba(252,243,216,0.12)"/>
    <text x="13" y="12.5" dominant-baseline="central" font-family="${MONO}" font-size="9.5" letter-spacing="0.13em" font-weight="700" fill="rgba(252,243,216,0.82)">${esc(tag)}</text>
  </g>
  <g transform="translate(${fx},14)">
    <rect width="${fw}" height="24" rx="12" fill="rgba(252,243,216,0.05)" stroke="rgba(252,243,216,0.12)"/>
    <circle cx="16" cy="12" r="3" fill="${C.pink}"/><circle cx="27" cy="12" r="3" fill="${C.peach}"/><circle cx="38" cy="12" r="3" fill="${C.palm}"/>
    <text x="52" y="12.5" dominant-baseline="central" font-family="${MONO}" font-size="10" letter-spacing="0.02em" fill="rgba(252,243,216,0.62)">${esc(file)}</text>
  </g>`;
}

function subtitle(text, y = 78) {
  // supports a single *accent* span (palm italic)
  const m = text.match(/^(.*?)\*(.+?)\*(.*)$/);
  let inner;
  if (m) inner = `${esc(m[1])}<tspan fill="${C.palm}" font-style="italic">${esc(m[2])}</tspan>${esc(m[3])}`;
  else inner = esc(text);
  return `<text x="20" y="${y}" font-family="${SANS}" font-size="11.5" font-weight="500" fill="${C.cream70}">${inner}</text>`;
}

// footer chip row + right note
function footer(chips, right = 'GITHUB →') {
  let x = 20; const parts = [];
  for (const ch of chips) {
    const w = ch.label.length * 6.6 + 18;
    parts.push(`<g transform="translate(${x},0)"><rect width="${w}" height="20" rx="10" fill="${ch.bg || 'rgba(252,243,216,0.08)'}"/><text x="${w / 2}" y="10.5" text-anchor="middle" dominant-baseline="central" font-family="${MONO}" font-size="8.5" letter-spacing="0.1em" font-weight="700" fill="${ch.fg || C.cream70}">${esc(ch.label)}</text></g>`);
    x += w + 7;
  }
  const r = right ? `<text x="460" y="10.5" text-anchor="end" dominant-baseline="central" font-family="${MONO}" font-size="9" letter-spacing="0.1em" font-weight="800" fill="${C.cream55}">${esc(right)}</text>` : '';
  return `<g transform="translate(0,272)">${parts.join('')}${r}</g>`;
}

// reusable: a labelled panel
function panel(x, y, w, h, { label, labelColor = C.peach, fill = C.cream07, stroke = C.cream12, rx = 10 } = {}) {
  const lbl = label ? `<text x="${x + 12}" y="${y + 16}" font-family="${MONO}" font-size="8.5" letter-spacing="0.16em" font-weight="800" fill="${labelColor}">${esc(label)}</text>` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>${lbl}`;
}

// animated vector grid — two-tone rounded tiles (orange + lavender), like the
// homepage "embed" block. `color`/`alt` set the two hues.
function vecGrid(x, y, cols, rows, { gap = 12, color = C.peach, alt = C.violet, sz = 7 } = {}) {
  const tiles = [];
  let i = 0;
  for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) {
    const fill = (c + row) % 2 === 0 ? color : alt;
    tiles.push(`<rect class="sq" x="${x + c * gap}" y="${y + row * gap}" width="${sz}" height="${sz}" rx="1.6" fill="${fill}" style="animation-delay:${(i % 6) * 0.18}s"/>`);
    i++;
  }
  return `<g>${tiles.join('')}</g>`;
}

function arrow(x1, y1, x2, y2, { color = C.palm, marker = 'ah', label = '', w = 1.8, cls = 'flow' } = {}) {
  const lbl = label ? `<text x="${(x1 + x2) / 2}" y="${Math.min(y1, y2) - 7}" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="0.12em" font-weight="700" fill="${color}">${esc(label)}</text>` : '';
  return `<path class="${cls}" d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" marker-end="url(#${marker})"/>${lbl}`;
}

function cylinder(x, y, w, h, { color = C.cream, op = 0.9 } = {}) {
  const ry = w * 0.18;
  return `<g fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1.6">
    <ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}"/>
    <path d="M${x} ${y + ry} V${y + h - ry} a${w / 2} ${ry} 0 0 0 ${w} 0 V${y + ry}"/>
    <path d="M${x} ${y + h / 2} a${w / 2} ${ry} 0 0 0 ${w} 0" stroke-opacity="${op * 0.6}"/>
  </g>`;
}

function docIcon(x, y, w, h, { color = C.cream, lines = 4 } = {}) {
  const ls = [];
  for (let i = 0; i < lines; i++) ls.push(`<line x1="${x + 6}" y1="${y + 12 + i * 7}" x2="${x + w - (i === lines - 1 ? 14 : 6)}" y2="${y + 12 + i * 7}" stroke="${color}" stroke-opacity="0.55" stroke-width="1.4"/>`);
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="${color}" stroke-width="1.6"/>${ls.join('')}</g>`;
}

// shared "embed → vector grid → store" middle/target for search-like cards
function embedToStore(s, x0) {
  const acc = s.accent || C.peach;
  const mid = `<g transform="translate(${x0},104)">
    <text x="63" y="22" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="0.12em" font-weight="700" fill="${acc}">${esc(s.midLabel || 'EMBED')}</text>
    ${arrow(0, 65, 26, 65, { color: acc, marker: 'ahc' })}
    ${vecGrid(42, 44, 4, 4, { color: acc, gap: 11 })}
    <text x="59" y="120" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="0.1em" fill="${C.cream40}">${esc(s.dim || '768-d')}</text>
    ${arrow(100, 65, 126, 65, { color: C.palm })}
  </g>`;
  return mid;
}

// ── ARCHETYPE: semantic search (source → vectors → store) ───────────────────
function vizSearch(s) {
  const acc = s.accent || C.peach;
  const srcLines = (s.sourceRows || ['# heading', 'lorem ipsum', 'dolor sit', 'amet…']);
  const srcBody = srcLines.map((t, i) => `<text x="12" y="${32 + i * 15}" font-family="${MONO}" font-size="9" fill="${i === 0 ? acc : C.cream70}">${esc(t)}</text>`).join('');
  const src = `<g transform="translate(20,104)">${panel(0, 0, 130, 130, { label: s.sourceLabel })}${srcBody}<text x="12" y="120" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.cream40}">${esc(s.sourceNote || 'watched · incremental')}</text></g>`;
  const mid = embedToStore(s, 164);
  const store = `<g transform="translate(316,104)">${panel(0, 0, 144, 130, { label: s.storeLabel, labelColor: C.palm })}
    <g transform="translate(0,6)">${s.storeGlyph ? s.storeGlyph : cylinder(48, 36, 48, 62, { color: C.palm })}</g>
    <text x="72" y="120" text-anchor="middle" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.palm}">${esc(s.storeNote || 'upsert · only Δ')}</text>
  </g>`;
  return src + mid + store;
}

// ── ARCHETYPE: code editor + chunks/AST + live index (index-codebase) ────────
function vizCode(s) {
  const code = [
    ['@coco.', { t: 'fn', c: C.peach }, '', ''],
    ['def ', { t: 'index_repo', c: C.berry }, '(repo):', ''],
    ['  for ', { t: 'f', c: C.cream }, ' in repo.', { t: 'files', c: C.violet }],
    ['    ch = ', { t: 'split', c: C.berry }, '(f)  ', { t: '# tree-sitter', c: C.cream40 }],
    ['    ', { t: 'embed', c: C.berry }, '(ch) ', { t: '→ pgvector', c: C.palm }],
  ];
  const rows = code.map((parts, i) => {
    let x = 12, spans = '';
    for (const p of parts) { if (typeof p === 'string') { spans += `<tspan x="${x}" dx="0">${esc(p)}</tspan>`; x += p.length * 5.4; } else { spans += `<tspan fill="${p.c}">${esc(p.t)}</tspan>`; x += p.t.length * 5.4; } }
    const lns = code[i].map(p => typeof p === 'string' ? esc(p) : `<tspan fill="${p.c}">${esc(p.t)}</tspan>`).join('');
    return `<text x="14" y="${32 + i * 17}" font-family="${MONO}" font-size="9.5" fill="${C.cream}">${lns}</text>`;
  }).join('');
  const editor = `<g transform="translate(20,102)">
    <rect width="248" height="134" rx="9" fill="rgba(0,0,0,0.28)" stroke="${C.cream12}"/>
    <circle cx="14" cy="14" r="2.6" fill="${C.berry}"/><circle cx="24" cy="14" r="2.6" fill="${C.peach}"/><circle cx="34" cy="14" r="2.6" fill="${C.palm}"/>
    <g transform="translate(0,8)">${rows}</g>
    <rect class="blink" x="92" y="110" width="6" height="12" fill="${C.palm}"/>
  </g>`;
  const right = `<g transform="translate(286,102)">${panel(0, 0, 174, 134, { label: 'CHUNKS · AST', labelColor: C.peach })}
    <g transform="translate(12,28)">
      ${[150, 120, 138, 108, 130].map((w, i) => `<rect class="sq" x="0" y="${i * 13}" width="${w}" height="8" rx="2" fill="rgba(190,81,51,0.22)" stroke="${C.coral}" stroke-width="1" style="animation-delay:${i * 0.12}s"/>`).join('')}
    </g>
    <line x1="12" y1="98" x2="162" y2="98" stroke="${C.cream12}"/>
    <circle class="pulse" cx="18" cy="114" r="3.4" fill="${C.palm}"/>
    <text x="28" y="114" dominant-baseline="central" font-family="${MONO}" font-size="9" letter-spacing="0.12em" font-weight="700" fill="${C.palm}">LIVE · FRESH</text>
    <text x="162" y="114" text-anchor="end" dominant-baseline="central" font-family="${MONO}" font-size="8.5" fill="${C.cream40}">Δ 12</text>
  </g>`;
  return editor + right;
}

// ── ARCHETYPE: multi-repo summarize (repos → LLM → org summary) ──────────────
function vizSummarize(s) {
  const repos = s.repos || [['sdk-core', '2.4k'], ['web-app', '1.1k'], ['infra', '380']];
  const cards = repos.map((r, i) => `<g transform="translate(0,${i * 40})">
     <rect width="120" height="32" rx="7" fill="${C.cream07}" stroke="${C.cream12}"/>
     <text x="12" y="13" font-family="${MONO}" font-size="9.5" font-weight="700" fill="${C.peach}">▸ ${esc(r[0])}</text>
     <text x="12" y="25" font-family="${MONO}" font-size="8" fill="${C.cream55}">${esc(r[1])} files</text>
   </g>`).join('');
  const left = `<g transform="translate(20,100)"><text x="0" y="-2" font-family="${MONO}" font-size="8.5" letter-spacing="0.16em" font-weight="800" fill="${C.peach}">↻ ON PUSH</text>${cards}</g>`;
  const mid = `<g transform="translate(150,150)">${arrow(0, 0, 40, 0, { color: C.coral, marker: 'ahc', label: 'LLM' })}<text x="20" y="20" text-anchor="middle" font-family="${MONO}" font-size="8" fill="${C.cream40}">summarize</text></g>`;
  const right = `<g transform="translate(206,102)">${panel(0, 0, 254, 134, { label: 'ORG SUMMARY', labelColor: C.palm })}
    <text x="12" y="40" font-family="${SANS}" font-size="12" font-weight="700" fill="${C.cream}">platform overview</text>
    ${[210, 230, 180, 215].map((w, i) => `<rect x="12" y="${50 + i * 13}" width="${w}" height="6" rx="3" fill="${C.cream}" fill-opacity="${0.34 - i * 0.04}"/>`).join('')}
    <g transform="translate(12,118)"><circle class="pulse" cx="4" cy="0" r="3.2" fill="${C.palm}"/><text x="14" y="0" dominant-baseline="central" font-family="${MONO}" font-size="8.5" fill="${C.palm}">refreshed · just now</text></g>
    <text x="242" y="118" text-anchor="end" dominant-baseline="central" font-family="${MONO}" font-size="8.5" fill="${C.cream40}">+ mermaid</text>
  </g>`;
  return left + mid + right;
}

// ── ARCHETYPE: knowledge graph (source → entities/edges) ────────────────────
// Knowledge-graph entity hues — all drawn from the hum-07 palette (no off-brand cool tones).
// Knowledge-graph entity hues — drawn from the hum-07 palette, matched to the
// homepage card: people=coral, action=peach, decision=green, topic=lavender.
const GTYPES = { person: C.coral, topic: C.violet, decision: C.palm, action: C.peach, product: C.peach, concept: C.gold, episode: C.coral };
// ── cute source illustrations that feed each knowledge graph ────────────────
function waveBars(n, col) {
  return Array.from({ length: n }, (_, i) => { const h = 6 + Math.abs(Math.sin(i * 0.9)) * 17; return `<rect class="rise" x="${i * 6}" y="${-h / 2}" width="3" height="${h}" rx="1.5" fill="${col}" style="animation-delay:${(i % 5) * 0.12}s"/>`; }).join('');
}
const SRCBUILD = {
  podcast: () => `<g transform="translate(14,82)">${panel(0, 0, 134, 132, { label: '🎙 EPISODE' })}
    <rect x="12" y="26" width="110" height="32" rx="6" fill="rgba(252,243,216,0.06)"/>
    <g transform="translate(30,42)"><circle r="11" fill="${C.coral}"/><path d="M-4 -6 L7 0 L-4 6 Z" fill="${C.cream}"/></g>
    <text x="49" y="39" font-family="${MONO}" font-size="9" font-weight="700" fill="${C.cream70}">EP · 07</text>
    <text x="49" y="51" font-family="${MONO}" font-size="8" fill="${C.cream40}">00:42 / 58:10</text>
    <g transform="translate(14,78)">${waveBars(16, C.peach)}</g>
    <g transform="translate(12,100)" font-family="${MONO}" font-size="8" font-weight="700"><circle cx="4" cy="-3" r="4" fill="${C.coral}"/><text x="13" y="0" fill="${C.coral}">host</text><circle cx="60" cy="-3" r="4" fill="${C.violet}"/><text x="69" y="0" fill="${C.violet}">guest</text></g>
    <text x="12" y="122" font-family="${SANS}" font-size="8" font-style="italic" fill="${C.cream40}">diarized · transcribed</text></g>`,
  docs: () => `<g transform="translate(14,82)">${panel(0, 0, 134, 132, { label: '📄 DOCS/*.MD' })}
    <rect x="24" y="30" width="84" height="92" rx="5" fill="rgba(252,243,216,0.04)" stroke="${C.cream12}"/>
    <rect x="16" y="36" width="86" height="90" rx="5" fill="rgba(252,243,216,0.07)" stroke="${C.cream12}"/>
    <text x="24" y="54" font-family="${MONO}" font-size="9" fill="${C.gold}"># Heading</text>
    <text x="24" y="68" font-family="${MONO}" font-size="8.5" fill="${C.cream70}">- item one</text>
    <text x="24" y="80" font-family="${MONO}" font-size="8.5" fill="${C.cream70}">- item two</text>
    <text x="24" y="94" font-family="${MONO}" font-size="8.5" fill="${C.violet}">**bold**</text>
    <text x="24" y="108" font-family="${MONO}" font-size="8" fill="${C.cream40}">A relates B</text>
    <g transform="translate(72,108)"><rect width="26" height="14" rx="3" fill="${C.coral}" opacity="0.9"/><text x="13" y="8" text-anchor="middle" dominant-baseline="central" font-family="${MONO}" font-size="7.5" font-weight="800" fill="${C.cream}">.md</text></g></g>`,
  meeting: () => `<g transform="translate(14,82)">${panel(0, 0, 134, 132, { label: '📝 NOTES' })}
    <text x="12" y="36" font-family="${SANS}" font-size="10" font-weight="700" fill="${C.cream}">Standup · today</text>
    <g transform="translate(13,50)"><circle cx="6" cy="0" r="6.5" fill="${C.coral}"/><text x="6" y="1" text-anchor="middle" dominant-baseline="central" font-family="${SANS}" font-size="7.5" font-weight="800" fill="${C.ink}">A</text><circle cx="23" cy="0" r="6.5" fill="${C.coral}"/><text x="23" y="1" text-anchor="middle" dominant-baseline="central" font-family="${SANS}" font-size="7.5" font-weight="800" fill="${C.ink}">B</text><text x="36" y="1" dominant-baseline="central" font-family="${MONO}" font-size="8" fill="${C.cream40}">+3</text></g>
    <g transform="translate(12,68)" font-family="${MONO}" font-size="8.5">
      <g><rect width="11" height="11" rx="2.5" fill="${C.palm}"/><path d="M2.5 5.5 L4.5 7.5 L8.5 3" stroke="${C.ink}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="17" y="9" fill="${C.cream70}">ship Q3</text></g>
      <g transform="translate(0,16)"><rect width="11" height="11" rx="2.5" fill="none" stroke="${C.cream40}"/><text x="17" y="9" fill="${C.cream70}">draft PRD</text></g>
      <g transform="translate(0,32)"><rect width="11" height="11" rx="2.5" fill="none" stroke="${C.cream40}"/><text x="17" y="9" fill="${C.cream70}">hire 2</text></g></g>
    <text x="12" y="124" font-family="${SANS}" font-size="8" font-style="italic" fill="${C.cream40}">Google Drive</text></g>`,
  products: () => `<g transform="translate(14,82)">${panel(0, 0, 134, 132, { label: '🛍 CATALOG' })}
    ${[[C.peach, 'camera'], [C.violet, 'lens'], [C.palm, 'tripod'], [C.coral, 'bag']].map((p, i) => { const x = 12 + (i % 2) * 62, y = 28 + Math.floor(i / 2) * 46; return `<g transform="translate(${x},${y})"><rect width="56" height="38" rx="5" fill="rgba(252,243,216,0.05)" stroke="${C.cream12}"/><rect x="8" y="8" width="40" height="14" rx="2" fill="${p[0]}" opacity="0.85"/><text x="8" y="32" font-family="${MONO}" font-size="7.5" fill="${C.cream70}">${p[1]}</text></g>`; }).join('')}
    <text x="12" y="124" font-family="${SANS}" font-size="8" font-style="italic" fill="${C.cream40}">bought-together</text></g>`,
};

// ── ARCHETYPE: knowledge graph — a cute source illustration on the left feeds a
// radial graph on the right (cream hub, curved colored edges, symbol-in-node).
function vizGraph(s) {
  const hasSrc = !!s.srcKind;
  const cx = hasSrc ? 296 : 240, cy = 164, rx = hasSrc ? 102 : 150, ry = 92;
  const nodes = s.nodes, N = nodes.length;
  let pts;
  if (hasSrc) {
    const sweep = (s.sweep ?? 220) * Math.PI / 180, a0 = -sweep / 2;
    pts = nodes.map((n, i) => { const t = N === 1 ? 0.5 : i / (N - 1); const a = a0 + t * sweep; return { x: Math.round(cx + rx * Math.cos(a)), y: Math.round(cy + ry * Math.sin(a)) }; });
  } else {
    const start = (s.startAngle ?? -90) * Math.PI / 180;
    pts = nodes.map((n, i) => { const a = start + (i * 2 * Math.PI) / N; return { x: Math.round(cx + rx * Math.cos(a)), y: Math.round(cy + ry * Math.sin(a)) }; });
  }
  const edges = nodes.map((n, i) => {
    const p = pts[i], mx = (cx + p.x) / 2, my = (cy + p.y) / 2;
    const ox = -(p.y - cy) * 0.12, oy = (p.x - cx) * 0.12;
    return `<path d="M${cx} ${cy} Q${Math.round(mx + ox)} ${Math.round(my + oy)} ${p.x} ${p.y}" fill="none" stroke="${GTYPES[n.type]}" stroke-opacity="0.65" stroke-width="1.7" stroke-linecap="round"/>`;
  }).join('');
  const ring = pts.map((p, i) => (hasSrc && i === N - 1) ? '' : `<path d="M${p.x} ${p.y} Q${cx} ${cy} ${pts[(i + 1) % N].x} ${pts[(i + 1) % N].y}" fill="none" stroke="${C.cream}" stroke-opacity="0.1" stroke-width="1"/>`).join('');
  const nodeG = nodes.map((n, i) => {
    const p = pts[i], r = n.r || 12, dx = p.x - cx, dy = p.y - cy, len = Math.hypot(dx, dy) || 1;
    const lx = Math.round(p.x + (dx / len) * (r + 9)), ly = Math.round(p.y + (dy / len) * (r + 9)) + 3;
    const anchor = dx > 18 ? 'start' : dx < -18 ? 'end' : 'middle';
    const sym = n.sym ? `<text y="1" text-anchor="middle" dominant-baseline="central" font-family="${SANS}" font-size="${r > 11 ? 11 : 9}" font-weight="800" fill="${C.ink}">${esc(n.sym)}</text>` : '';
    return `<g transform="translate(${p.x},${p.y})"><circle class="pulse" r="${r}" fill="${GTYPES[n.type]}" style="animation-delay:${(i % 5) * 0.45}s"/>${sym}</g>
      <text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="${SANS}" font-size="9.5" font-weight="700" fill="${GTYPES[n.type]}">${esc(n.label)}</text>`;
  }).join('');
  const hubR = s.hubR || 19;
  const hubG = `<g transform="translate(${cx},${cy})"><circle r="${hubR + 5}" fill="${C.cream}" opacity="0.12"/><circle r="${hubR}" fill="${C.cream}"/><text y="1" text-anchor="middle" dominant-baseline="central" font-family="${SANS}" font-size="10.5" font-weight="800" fill="${C.ink}">${esc(s.hub.label)}</text></g>`;
  const source = hasSrc ? (SRCBUILD[s.srcKind]?.() ?? '') : '';
  const inflow = hasSrc ? `${arrow(150, 158, cx - hubR - 4, 162, { color: C.palm, label: 'LLM EXTRACT' })}<text x="${Math.round((150 + cx - hubR) / 2)}" y="178" text-anchor="middle" font-family="${MONO}" font-size="7.5" letter-spacing="0.08em" fill="${C.cream40}">→ ${esc(s.store || 'Neo4j')}</text>` : '';
  return `${source}${inflow}<g stroke-linecap="round">${ring}${edges}</g>${nodeG}${hubG}`;
}

// ── ARCHETYPE: LLM extract → typed record (forms/papers/manuals) ────────────
function vizExtract(s) {
  const acc = s.accent || C.peach;
  const srcLines = s.sourceRows || ['Patient: …', 'DOB: …', 'meds: …'];
  const src = `<g transform="translate(20,104)">${panel(0, 0, 134, 130, { label: s.sourceLabel })}
    ${srcLines.map((t, i) => `<text x="12" y="${34 + i * 16}" font-family="${MONO}" font-size="8.8" fill="${C.cream70}">${esc(t)}</text>`).join('')}
    ${s.sourceGlyph || ''}
  </g>`;
  const mid = `<g transform="translate(162,162)">${arrow(0, 0, 36, 0, { color: C.coral, marker: 'ahc', label: s.midLabel || 'LLM' })}<text x="18" y="20" text-anchor="middle" font-family="${MONO}" font-size="7.5" fill="${C.cream40}">${esc(s.midSub || 'extract')}</text></g>`;
  const fields = s.fields || [['name', 'str'], ['dob', 'date'], ['meds', 'list']];
  const rec = `<g transform="translate(214,104)">${panel(0, 0, 246, 130, { label: s.recordLabel || 'TYPED · VALIDATED', labelColor: C.palm })}
    <text x="14" y="38" font-family="${MONO}" font-size="11" fill="${C.gold}">{</text>
    ${fields.map(([k, v], i) => `<g transform="translate(26,${36 + i * 18})"><text x="0" y="0" font-family="${MONO}" font-size="9.5" fill="${C.berry}">"${esc(k)}"</text><text x="${k.length * 6.4 + 14}" y="0" font-family="${MONO}" font-size="9.5" fill="${C.cream70}">: ${esc(v)}</text></g>`).join('')}
    <text x="14" y="${44 + fields.length * 18}" font-family="${MONO}" font-size="11" fill="${C.gold}">}</text>
    <g transform="translate(214,116)"><circle r="8" fill="${C.palm}" fill-opacity="0.9"/><path d="M-3 0 L-1 2.5 L3.5 -3" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  </g>`;
  return src + mid + rec;
}

// ── ARCHETYPE: file transform (file → render → file) ────────────────────────
function vizTransform(s) {
  const src = `<g transform="translate(24,108)">${panel(0, 0, 132, 122, { label: s.sourceLabel })}<g transform="translate(34,30)">${s.sourceGlyph || docIcon(0, 0, 64, 80, { color: C.peach })}</g></g>`;
  const mid = `<g transform="translate(166,160)">${arrow(0, 0, 44, 0, { color: C.coral, marker: 'ahc', label: s.midLabel || 'RENDER' })}<text x="22" y="20" text-anchor="middle" font-family="${MONO}" font-size="7.5" fill="${C.cream40}">${esc(s.midSub || '')}</text></g>`;
  const out = `<g transform="translate(224,108)">${panel(0, 0, 236, 122, { label: s.outLabel, labelColor: C.palm })}
    <g transform="translate(14,30)">${s.outBody || ''}</g></g>`;
  return src + mid + out;
}

// ── ARCHETYPE: stream (table/source → messages → topic/tables) ──────────────
function vizStream(s) {
  const src = `<g transform="translate(20,104)">${panel(0, 0, 150, 130, { label: s.sourceLabel })}
    ${(s.sourceRows || []).map((r, i) => `<text x="12" y="${32 + i * 15}" font-family="${MONO}" font-size="8.6" fill="${i === s.hot ? C.gold : C.cream70}" font-weight="${i === s.hot ? 800 : 400}">${esc(r)}</text>`).join('')}
    <text x="12" y="120" font-family="${SANS}" font-size="8" font-style="italic" fill="${C.cream40}">${esc(s.sourceNote || 'watched')}</text></g>`;
  const mid = `<g transform="translate(176,162)">${arrow(0, 0, 34, 0, { color: C.palm, label: s.midLabel || 'ROW' })}
     <rect class="sq" x="8" y="-4" width="8" height="8" rx="2" fill="${C.gold}"/></g>`;
  const out = `<g transform="translate(226,104)">${panel(0, 0, 234, 130, { label: s.outLabel, labelColor: C.gold })}
    <g transform="translate(12,30)">${(s.msgs || []).map((m, i) => `<g transform="translate(0,${i * 24})"><rect width="210" height="20" rx="5" fill="${i === s.outhot ? 'rgba(245,215,110,0.22)' : C.cream07}" stroke="${i === s.outhot ? C.gold : 'none'}"/><text x="9" y="11" dominant-baseline="central" font-family="${MONO}" font-size="8.6" fill="${i === s.outhot ? C.gold : C.cream}" font-weight="${i === s.outhot ? 800 : 400}">${esc(m)}</text></g>`).join('')}</g></g>`;
  return src + mid + out;
}

// ── ARCHETYPE: db roundtrip (postgres-source) ───────────────────────────────
function vizDb(s) {
  const left = `<g transform="translate(36,108)"><text x="48" y="-2" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="0.14em" font-weight="800" fill="${C.peach}">SOURCE TABLE</text>${cylinder(0, 4, 96, 116, { color: C.peach })}
     ${[40, 60, 80].map((y, i) => `<text x="48" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="8.5" fill="${C.cream70}">row ${i + 1}</text>`).join('')}</g>`;
  const mid = `<g transform="translate(150,150)">${arrow(0, 0, 42, 0, { color: C.coral, marker: 'ahc', label: 'DERIVE' })}${vecGrid(8, 20, 4, 2, { color: C.peach, gap: 10 })}<text x="24" y="58" text-anchor="middle" font-family="${MONO}" font-size="8" fill="${C.cream40}">embed</text>${arrow(52, 0, 88, 0, { color: C.palm })}</g>`;
  const right = `<g transform="translate(348,108)"><text x="48" y="-2" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="0.14em" font-weight="800" fill="${C.palm}">VECTORS</text>${cylinder(0, 4, 96, 116, { color: C.palm })}<text x="48" y="${64}" text-anchor="middle" font-family="${SANS}" font-size="9" font-style="italic" fill="${C.palm}">write back</text></g>`;
  return left + mid + right;
}

// ── bespoke image-family archetypes ─────────────────────────────────────────
function photoGlyph(x, y, w, h, col, peak = true) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="${col}" stroke-width="1.6"/>
    <circle cx="${x + w * 0.28}" cy="${y + h * 0.3}" r="3.5" fill="${col}" fill-opacity="0.8"/>
    <path d="M${x + 4} ${y + h - 6} L${x + w * 0.4} ${y + h * 0.55} L${x + w * 0.6} ${y + h * 0.72} L${x + w * 0.8} ${y + h * 0.45} L${x + w - 4} ${y + h - 6}" fill="none" stroke="${col}" stroke-width="1.6" stroke-linejoin="round"/>`;
}
function vizImageSearch(s) {
  const left = `<g transform="translate(20,104)">${panel(0, 0, 132, 130, { label: 'IMG FOLDER' })}
    <g transform="translate(18,26)">${photoGlyph(0, 0, 44, 34, C.peach)}${photoGlyph(52, 0, 44, 34, C.peach)}${photoGlyph(0, 42, 44, 34, C.peach)}${photoGlyph(52, 42, 44, 34, C.peach)}</g>
    <text x="12" y="120" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.cream40}">CLIP image encoder</text></g>`;
  const mid = embedToStore({ midLabel: 'CLIP', dim: '768-d', accent: C.peach }, 164);
  const right = `<g transform="translate(316,104)">${panel(0, 0, 144, 130, { label: 'QDRANT', labelColor: C.palm })}
    <rect x="14" y="26" width="116" height="20" rx="10" fill="rgba(252,243,216,0.08)"/><text x="22" y="36" dominant-baseline="central" font-family="${MONO}" font-size="9" fill="${C.cream}">🔍 "a giraffe"</text>
    ${[['🦒 giraffe', '0.231', C.palm], ['🐘 elephant', '0.402', C.cream70], ['🐈 cat', '0.560', C.cream55]].map((r, i) => `<g transform="translate(14,${56 + i * 18})"><text x="0" y="0" font-family="${MONO}" font-size="8.8" fill="${r[2]}">${esc(r[0])}</text><text x="116" y="0" text-anchor="end" font-family="${MONO}" font-size="8.5" fill="${r[2]}">${esc(r[1])}</text></g>`).join('')}</g>`;
  return left + mid + right;
}
function vizColpali(s) {
  const left = `<g transform="translate(20,104)">${panel(0, 0, 132, 130, { label: 'PAGE · IMAGE' })}
    <g transform="translate(20,26)"><rect width="92" height="74" rx="3" fill="none" stroke="${C.peach}" stroke-width="1.4"/>${[0, 1, 2, 3].map(c => [0, 1, 2].map(r => `<rect x="${4 + c * 22}" y="${4 + r * 23}" width="20" height="21" fill="${C.peach}" fill-opacity="${(c + r) % 2 ? 0.08 : 0.18}"/>`).join('')).join('')}</g>
    <text x="12" y="120" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.cream40}">no OCR · patches</text></g>`;
  const mid = `<g transform="translate(166,118)"><text x="32" y="-6" text-anchor="middle" font-family="${MONO}" font-size="8" font-weight="700" fill="${C.peach}">MULTI-VEC</text>${arrow(0, 50, 22, 50, { color: C.peach, marker: 'ahc' })}
     ${[0, 1, 2, 3, 4].map(i => `<rect class="sq" x="${34 + i * 9}" y="20" width="5" height="60" rx="2" fill="${C.peach}" style="animation-delay:${i * 0.15}s"/>`).join('')}
     ${arrow(88, 50, 110, 50, { color: C.palm })}</g>`;
  const right = `<g transform="translate(296,104)">${panel(0, 0, 164, 130, { label: 'MAXSIM RANK', labelColor: C.palm })}
    ${[['page 7', 92], ['page 2', 74], ['page 9', 58]].map((r, i) => `<g transform="translate(14,${34 + i * 24})"><text x="0" y="6" font-family="${MONO}" font-size="9" fill="${i === 0 ? C.palm : C.cream70}">${esc(r[0])}</text><rect x="56" y="0" width="${r[1]}" height="9" rx="2" fill="${i === 0 ? C.palm : 'rgba(252,243,216,0.2)'}"/></g>`).join('')}
    <text x="14" y="116" font-family="${MONO}" font-size="8" fill="${C.cream40}">Qdrant · multivector</text></g>`;
  return left + mid + right;
}
function vizFace(s) {
  const left = `<g transform="translate(22,104)">${panel(0, 0, 150, 130, { label: 'PHOTOS' })}
    <g transform="translate(30,24)">
      <circle cx="44" cy="40" r="30" fill="none" stroke="${C.peach}" stroke-width="1.6"/>
      <circle cx="34" cy="34" r="3" fill="${C.peach}"/><circle cx="54" cy="34" r="3" fill="${C.peach}"/>
      <path d="M36 50 a10 6 0 0 0 16 0" fill="none" stroke="${C.peach}" stroke-width="1.6" stroke-linecap="round"/>
      <g class="pulse" stroke="${C.gold}" stroke-width="1.6" fill="none"><path d="M8 18 V8 H18 M70 8 H80 V18 M80 62 V72 H70 M18 72 H8 V62"/></g>
    </g><text x="12" y="120" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.cream40}">detect every face</text></g>`;
  const mid = embedToStore({ midLabel: '128-d', dim: 'embed', accent: C.peach }, 186);
  const right = `<g transform="translate(338,104)">${panel(0, 0, 122, 130, { label: 'QDRANT', labelColor: C.palm })}
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${24 + c * 36}" cy="${36 + r * 28}" r="9" fill="none" stroke="${(r === 0 && c === 0) ? C.palm : C.cream40}" stroke-width="1.4"/>`).join('')).join('')}
    <text x="61" y="120" text-anchor="middle" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.palm}">match faces</text></g>`;
  return left + mid + right;
}
function vizAudio(s) {
  const bars = Array.from({ length: 22 }, (_, i) => { const h = 8 + Math.abs(Math.sin(i * 0.9)) * 40; return `<rect class="rise" x="${i * 9}" y="${48 - h / 2}" width="4" height="${h}" rx="2" fill="${C.peach}" style="animation-delay:${(i % 6) * 0.12}s"/>`; }).join('');
  const left = `<g transform="translate(24,108)">${panel(0, 0, 220, 124, { label: '🎙 AUDIO.MP3' })}<g transform="translate(14,40)">${bars}</g><text x="12" y="112" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.cream40}">LiteLLM speech-to-text</text></g>`;
  const mid = arrow(252, 170, 286, 170, { color: C.coral, marker: 'ahc', label: 'STT' });
  const right = `<g transform="translate(296,108)">${panel(0, 0, 164, 124, { label: 'TRANSCRIPT', labelColor: C.palm })}
    ${[140, 120, 134, 96].map((w, i) => `<rect class="sq" x="14" y="${34 + i * 16}" width="${w}" height="7" rx="3" fill="${C.cream}" fill-opacity="0.32" style="animation-delay:${i * 0.18}s"/>`).join('')}
    <text x="14" y="112" font-family="${MONO}" font-size="8" fill="${C.palm}">→ Postgres · by file</text></g>`;
  return left + mid + right;
}
function vizSlides(s) {
  const left = `<g transform="translate(22,106)">${panel(0, 0, 120, 126, { label: 'SLIDES.PDF' })}
    <g transform="translate(20,28)"><rect width="80" height="50" rx="3" fill="none" stroke="${C.peach}" stroke-width="1.5"/><path d="M34 18 l14 7 l-14 7 z" fill="${C.peach}"/></g>
    <text x="60" y="106" text-anchor="middle" font-family="${SANS}" font-size="8.5" font-style="italic" fill="${C.cream40}">render each slide</text></g>`;
  const mid = `<g transform="translate(150,118)"><text x="26" y="-4" text-anchor="middle" font-family="${MONO}" font-size="7.5" font-weight="700" fill="${C.coral}">VISION→TTS</text>${arrow(0, 28, 50, 28, { color: C.coral, marker: 'ahc' })}
    <g transform="translate(8,44)">${Array.from({ length: 8 }, (_, i) => `<rect class="rise" x="${i * 6}" y="${-8}" width="3" height="16" rx="1.5" fill="${C.gold}" style="animation-delay:${i * 0.1}s"/>`).join('')}</g></g>`;
  const right = `<g transform="translate(228,106)">${panel(0, 0, 232, 126, { label: 'NOTES + AUDIO → LANCEDB', labelColor: C.palm })}
    ${[200, 176, 190].map((w, i) => `<rect x="14" y="${34 + i * 14}" width="${w}" height="6" rx="3" fill="${C.cream}" fill-opacity="${0.34 - i * 0.05}"/>`).join('')}
    <text x="14" y="96" font-family="${MONO}" font-size="8.5" fill="${C.gold}">🔊 piper TTS narration</text>
    <text x="14" y="112" font-family="${MONO}" font-size="8" fill="${C.palm}">embed → LanceDB</text></g>`;
  return left + mid + right;
}
function vizMultiFormat(s) {
  const left = `<g transform="translate(20,106)">${panel(0, 0, 116, 126, { label: 'PDF + IMG' })}
    <g transform="translate(22,26)"><rect width="72" height="30" rx="3" fill="none" stroke="${C.peach}" stroke-width="1.4"/><text x="36" y="19" text-anchor="middle" font-family="${MONO}" font-size="9" fill="${C.peach}">PDF</text>
    ${photoGlyph(0, 42, 72, 34, C.peach)}</g></g>`;
  const mid = `<g transform="translate(146,118)"><text x="30" y="-4" text-anchor="middle" font-family="${MONO}" font-size="7.5" font-weight="700" fill="${C.peach}">SCREENSHOT</text>${arrow(0, 24, 26, 24, { color: C.peach, marker: 'ahc' })}
    <g transform="translate(34,2)"><rect width="38" height="44" rx="3" fill="none" stroke="${C.peach}" stroke-width="1.3"/>${[0, 1, 2].map(c => [0, 1, 2].map(r => `<rect x="${4 + c * 11}" y="${4 + r * 13}" width="9" height="11" fill="${C.peach}" fill-opacity="${(c + r) % 2 ? 0.1 : 0.2}"/>`).join('')).join('')}</g>${arrow(78, 24, 100, 24, { color: C.palm })}</g>`;
  const right = `<g transform="translate(296,106)">${panel(0, 0, 164, 126, { label: 'QDRANT · COLPALI', labelColor: C.palm })}
    <text x="14" y="34" font-family="${SANS}" font-size="9.5" fill="${C.cream}">no OCR · no chunking</text>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect class="sq" x="${14 + i * 24}" y="48" width="16" height="${30 + (i % 3) * 12}" rx="2" fill="${C.peach}" fill-opacity="0.5" style="animation-delay:${i * 0.12}s"/>`).join('')}
    <text x="14" y="112" font-family="${MONO}" font-size="8" fill="${C.palm}">page-image vectors</text></g>`;
  return left + mid + right;
}
// hackernews trending — threads → ranked rising topics
function vizTrending(s) {
  const left = `<g transform="translate(20,106)">${panel(0, 0, 128, 126, { label: 'HN THREADS' })}
    ${['▲ 412 · rust gpu', '▲ 287 · agents', '▲ 196 · postgres', '▲ 150 · wasm'].map((t, i) => `<text x="12" y="${34 + i * 18}" font-family="${MONO}" font-size="8.6" fill="${i === 0 ? C.peach : C.cream70}">${esc(t)}</text>`).join('')}
    <text x="12" y="116" font-family="${SANS}" font-size="8" font-style="italic" fill="${C.cream40}">scraped · incremental</text></g>`;
  const mid = `<g transform="translate(156,160)">${arrow(0, 0, 34, 0, { color: C.coral, marker: 'ahc', label: 'LLM' })}<text x="17" y="18" text-anchor="middle" font-family="${MONO}" font-size="7.5" fill="${C.cream40}">topics</text></g>`;
  const right = `<g transform="translate(210,106)">${panel(0, 0, 250, 126, { label: 'TRENDING ↑', labelColor: C.palm })}
    <polyline class="" points="14,96 54,84 94,80 134,58 174,50 214,26" fill="none" stroke="${C.peach}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="14,104 54,100 94,90 134,86 174,72 214,60" fill="none" stroke="${C.coral}" stroke-width="1.8" stroke-dasharray="4 4"/>
    ${[[214, 26], [134, 58], [54, 84]].map((p, i) => `<circle class="pulse" cx="${p[0]}" cy="${p[1]}" r="${4 - i}" fill="${C.gold}" style="animation-delay:${i * 0.4}s"/>`).join('')}
    <text x="186" y="22" font-family="${MONO}" font-size="8" fill="${C.gold}">↑ rust</text>
    <text x="14" y="118" font-family="${MONO}" font-size="8" fill="${C.cream40}">t-6h → now · ranked in Postgres</text></g>`;
  return left + mid + right;
}

// ── card assembly ───────────────────────────────────────────────────────────
function card(s, inner) {
  // No title / subtitle / footer baked into the artwork — those live in the
  // card body (homepage style). The thumb is the tag pill + window dots +
  // filename + the illustration only.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" role="img" aria-label="${esc(s.aria || s.titlePlain || '')}">
  <title>${esc(s.titlePlain || '')}</title>
  ${frameOpen()}
  ${topbar(s.tag, s.file)}
  ${inner}
</svg>`;
}

const ARCHE = {
  search: vizSearch, code: vizCode, summarize: vizSummarize, graph: vizGraph,
  extract: vizExtract, transform: vizTransform, stream: vizStream, db: vizDb,
  imageSearch: vizImageSearch, colpali: vizColpali, face: vizFace, audio: vizAudio,
  slides: vizSlides, multiformat: vizMultiFormat, trending: vizTrending,
};
function plainTitle(t) { return t.replace(/\*/g, ''); }

// store glyphs (currentColor → palm) for the search variants
const G = {
  cube: `<g transform="translate(48,30)" fill="none" stroke="${C.palm}" stroke-width="1.6"><path d="M24 4 L44 14 V40 L24 50 L4 40 V14 Z"/><path d="M4 14 L24 24 L44 14 M24 24 V50"/></g>`,
  disk: cylinder(48, 32, 48, 60, { color: C.palm }),
  cloud: `<g transform="translate(34,42)" fill="none" stroke="${C.palm}" stroke-width="1.6"><path d="M16 34 a13 13 0 0 1 1 -25 a17 17 0 0 1 31 4 a10 10 0 0 1 -3 21 z"/></g>`,
  bucket: `<g transform="translate(48,28)" fill="none" stroke="${C.palm}" stroke-width="1.6"><path d="M2 8 h44 l-4 50 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 z"/><ellipse cx="24" cy="8" rx="22" ry="6"/></g>`,
  drive: `<g transform="translate(36,40)" fill="none" stroke="${C.palm}" stroke-width="1.5" stroke-linejoin="round"><path d="M24 2 H44 L62 32 H42 Z"/><path d="M22 6 L4 36 H22 L40 6 Z"/><path d="M8 40 L26 40 L36 56 H18 Z"/></g>`,
};

const SPECS = [
  { slug: 'text-embedding', arche: 'search', tag: 'MARKDOWN · 101', title: 'Semantic Search *101*', sub: 'Chunk, embed, *search in plain English*', sourceLabel: '📄 DOCS/*.MD', sourceRows: ['# install', 'pip install', 'cocoindex', 'run it…'], midLabel: 'CHUNK', dim: '384-d', storeLabel: 'POSTGRES', storeNote: 'pgvector · Δ only', chips: [{ label: 'LOCAL FS' }, { label: 'PGVECTOR', fg: C.palm }, { label: 'STARTER', fg: C.gold }], aria: 'Semantic Search 101 — chunk Markdown, embed, store vectors in Postgres pgvector, search in natural language.' },
  { slug: 'index-codebase', arche: 'code', tag: 'CODE · TREE-SITTER', title: 'Index Your *Codebase*', sub: 'Split by syntax, embed, *query in English*', chips: [{ label: 'TREE-SITTER' }, { label: 'PGVECTOR', fg: C.palm }, { label: 'AGENTS', fg: C.gold }], aria: 'Index your codebase — split by syntax with Tree-sitter, embed, query in English; a live vector index for coding agents.' },
  { slug: 'multi-codebase-summarization', arche: 'summarize', tag: 'REPOS · SUMMARIZE', title: 'Multi-codebase *Summarization*', sub: 'Walk N repos, LLM-summarize, *roll up an org wiki*', chips: [{ label: 'TREE-SITTER' }, { label: 'LLM', fg: C.coral }, { label: 'MERMAID', fg: C.gold }], aria: 'Multi-codebase summarization — walk many repos, extract structure, LLM-summarize each plus a rolled-up org summary; refreshes on push.' },
  { slug: 'pdf-to-markdown', arche: 'transform', tag: 'PDF · CUSTOM BLOCKS', title: 'PDF → *Markdown*', sub: 'Custom building blocks over a *folder of PDFs*', sourceLabel: 'INPUT.PDF', sourceGlyph: `<rect width="64" height="80" rx="3" fill="none" stroke="${C.peach}" stroke-width="1.6"/><text x="32" y="34" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="700" fill="${C.peach}">PDF</text><rect x="14" y="50" width="36" height="4" rx="2" fill="${C.peach}" fill-opacity="0.5"/>`, midLabel: 'CONVERT', midSub: 'docling', outLabel: 'MARKDOWN', outBody: `<text x="0" y="6" font-family="${MONO}" font-size="10" fill="${C.gold}"># Title</text>${[180, 150, 196, 130, 170].map((w, i) => `<rect x="0" y="${18 + i * 14}" width="${w}" height="6" rx="3" fill="${C.cream}" fill-opacity="${0.34 - i * 0.03}"/>`).join('')}`, chips: [{ label: 'LOCAL FS' }, { label: 'DOCLING', fg: C.coral }, { label: 'CUSTOM BLOCKS', fg: C.gold }], aria: 'PDF to Markdown — incremental conversion of a folder of PDFs to Markdown with custom building blocks.' },
  { slug: 'podcast-to-knowledge-graph', arche: 'graph', tag: 'PODCAST · GRAPH', title: 'Podcasts → *Knowledge Graph*', srcKind: 'podcast', store: 'SurrealDB', hub: { label: 'ep' }, nodes: [{ label: 'host', type: 'person', sym: 'H' }, { label: 'rust', type: 'topic', sym: '#' }, { label: 'claim', type: 'concept', sym: '“' }, { label: 'wasm', type: 'topic', sym: '#' }, { label: 'guest', type: 'person', sym: 'G' }], aria: 'Podcasts to knowledge graph — diarized YouTube transcription and two-step LLM extraction into a queryable graph.' },
  { slug: 'docs-to-knowledge-graph', arche: 'graph', tag: 'DOCS · TRIPLES', title: 'Docs → *Knowledge Graph*', srcKind: 'docs', store: 'Neo4j', hub: { label: 'doc' }, nodes: [{ label: 'coco', type: 'concept' }, { label: 'engine', type: 'topic', sym: '#' }, { label: 'flow', type: 'topic', sym: '#' }, { label: 'source', type: 'concept' }, { label: 'target', type: 'concept' }], aria: 'Docs to knowledge graph — turn Markdown docs into a Neo4j concept graph of LLM-extracted triples that stay in sync.' },
  { slug: 'meeting-notes-to-knowledge-graph', arche: 'graph', tag: 'MEETINGS · KNOWLEDGE GRAPH', title: 'Meeting Notes → *Knowledge Graph*', srcKind: 'meeting', store: 'Neo4j', hub: { label: 'meet' }, nodes: [{ label: 'alice', type: 'person', sym: 'A' }, { label: 'bob', type: 'person', sym: 'B' }, { label: 'topic', type: 'topic', sym: '#' }, { label: 'ship Q3', type: 'decision', sym: '✓' }, { label: 'draft PRD', type: 'action', sym: '→' }], aria: 'Meeting notes to knowledge graph — extract people, topics, decisions and action items into Neo4j with entity resolution.' },
  { slug: 'csv-to-kafka', arche: 'stream', tag: 'CSV · LIVE KAFKA', title: 'CSV → *Kafka*', sub: 'Watch a folder, publish each row — *sub-second*', sourceLabel: '📄 ORDERS.CSV', sourceRows: ['id  user  total', '101 alice 49.0', '102 bob   18.5', '103 carol 82.0', '104 dave  27.0 Δ'], hot: 4, midLabel: 'ROW', outLabel: 'KAFKA · TOPIC', msgs: ['{"id":101,"user":"alice"}', '{"id":102,"user":"bob"}', '{"id":103,"user":"carol"}', '{"id":104,"user":"dave"} Δ'], outhot: 3, chips: [{ label: 'KAFKA', fg: C.gold }, { label: 'STREAMING', fg: C.palm }, { label: 'LIVE MODE' }], aria: 'CSV to Kafka — watch a folder of CSVs and publish each row as a JSON message to a Kafka topic, incrementally.' },
  { slug: 'pdf-embedding', arche: 'search', tag: 'PDF · GPU · VECTORS', title: 'Semantic Search over *PDFs*', sub: 'docling on a GPU runner, *chunk, embed, store*', sourceLabel: '📕 PAPERS/*.PDF', sourceRows: ['report.pdf', 'spec.pdf', 'manual.pdf', '…'], midLabel: 'DOCLING', dim: '768-d', storeLabel: 'POSTGRES', storeNote: 'pgvector', chips: [{ label: 'DOCLING' }, { label: 'GPU', fg: C.coral }, { label: 'PGVECTOR', fg: C.palm }], aria: 'Semantic search over PDFs — convert PDFs to Markdown with docling on a GPU runner, chunk, embed, store in Postgres.' },
  { slug: 'image-search', arche: 'imageSearch', tag: 'IMAGES · CLIP', title: 'Search Images by *Text*', sub: 'Embed with CLIP, *search photos in language*', chips: [{ label: 'CLIP' }, { label: 'QDRANT', fg: C.palm }, { label: 'MULTIMODAL', fg: C.gold }], aria: 'Search images by text — embed images with CLIP, store vectors in Qdrant, search photos in natural language.' },
  { slug: 'audio-to-text', arche: 'audio', tag: 'AUDIO · LITELLM', title: 'Audio to *Text*', sub: 'Transcribe with a *LiteLLM speech-to-text model*', chips: [{ label: 'LITELLM' }, { label: 'POSTGRES', fg: C.palm }, { label: 'BEGINNER', fg: C.gold }], aria: 'Audio to text — transcribe local audio files with a LiteLLM speech-to-text model and store transcripts in Postgres.' },
  { slug: 'hackernews-trending-topics', arche: 'trending', tag: 'HN · TRENDING', title: 'Trending Topics from *HackerNews*', sub: 'Extract topics with an LLM, *rank trending*', chips: [{ label: 'HN API' }, { label: 'LLM', fg: C.coral }, { label: 'POSTGRES', fg: C.palm }], aria: 'Trending topics from HackerNews — scrape threads, extract topics with an LLM, rank trending in Postgres.' },
  { slug: 'paper-metadata', arche: 'extract', tag: 'PAPERS · FIELDS', title: 'Index *Academic Papers*', sub: 'LLM-extract title, authors, abstract — *typed rows*', sourceLabel: '📄 PAPER.PDF', sourceRows: ['Attention Is', 'All You Need', 'Vaswani et al', 'NeurIPS 2017'], midLabel: 'LLM', fields: [['title', 'str'], ['authors', 'list'], ['abstract', 'str'], ['year', 'int']], recordLabel: 'TYPED + EMBEDDED', chips: [{ label: 'PDF' }, { label: 'LLM', fg: C.coral }, { label: 'PGVECTOR', fg: C.palm }], aria: 'Index academic papers — LLM-extract title, authors and abstract from PDFs into typed rows with embeddings.' },
  { slug: 'patient-intake-baml', arche: 'extract', tag: 'FORMS · BAML', title: 'Patient Intake → *BAML*', sub: 'Schema-validated records, *type-safe BAML calls*', sourceLabel: '🏥 INTAKE.PDF', sourceRows: ['Name: J. Doe', 'DOB: 1984', 'Allergies:', 'penicillin'], midLabel: 'BAML', fields: [['name', 'str'], ['dob', 'date'], ['allergies', 'list'], ['meds', 'list']], recordLabel: 'BAML · VALIDATED', chips: [{ label: 'PDF' }, { label: 'BAML', fg: C.coral }, { label: 'TYPE-SAFE', fg: C.palm }], aria: 'Patient intake to typed JSON with BAML — extract schema-validated patient records from intake PDFs with type-safe BAML calls.' },
  { slug: 'patient-intake-dspy', arche: 'extract', tag: 'VISION · DSPY', title: 'Patient Intake → *DSPy*', sub: 'Render to images, *DSPy vision module → typed*', sourceLabel: '🖼 PAGE.IMG', sourceRows: ['[scanned form]', 'Name ▢▢▢', 'DOB  ▢▢▢', '…'], sourceGlyph: '', midLabel: 'DSPy', midSub: 'vision', fields: [['name', 'str'], ['dob', 'date'], ['symptoms', 'list'], ['plan', 'str']], recordLabel: 'DSPy · TYPED', chips: [{ label: 'PDF→IMG' }, { label: 'DSPY', fg: C.coral }, { label: 'VISION', fg: C.palm }], aria: 'Patient intake to typed JSON with DSPy — render intake PDFs to images and extract typed Patient data with a DSPy vision module.' },
  { slug: 'postgres-source', arche: 'db', tag: 'POSTGRES · SOURCE', title: 'Postgres as a *Source*', sub: 'Read rows, derive & embed, *write vectors back*', chips: [{ label: 'POSTGRES' }, { label: 'PGVECTOR', fg: C.palm }, { label: 'BEGINNER', fg: C.gold }], aria: 'Postgres as a source — read rows from a Postgres table, derive fields, embed each row, write vectors back.' },
  { slug: 'files-transform', arche: 'transform', tag: 'MARKDOWN · MARKDOWN-IT', title: 'Transform a *Folder of Files*', sub: 'Watch Markdown, *render each file to HTML*', sourceLabel: '📁 DOCS/', sourceGlyph: `<path d="M0 8 h22 l5 6 h33 a3 3 0 0 1 3 3 v44 a3 3 0 0 1 -3 3 H0 a3 3 0 0 1 -3 -3 V11 a3 3 0 0 1 3 -3 z" fill="none" stroke="${C.peach}" stroke-width="1.6"/><text x="30" y="46" text-anchor="middle" font-family="${MONO}" font-size="9" fill="${C.peach}">.md</text>`, midLabel: 'RENDER', midSub: 'markdown-it', outLabel: 'HTML OUTPUT', outBody: `<text x="0" y="6" font-family="${MONO}" font-size="9" fill="${C.gold}">&lt;h1&gt;…&lt;/h1&gt;</text>${[170, 196, 150].map((w, i) => `<rect x="0" y="${18 + i * 14}" width="${w}" height="6" rx="3" fill="${C.cream}" fill-opacity="${0.32 - i * 0.04}"/>`).join('')}<text x="0" y="76" font-family="${MONO}" font-size="8.5" fill="${C.palm}">→ local folder</text>`, chips: [{ label: 'LOCAL FS' }, { label: 'MARKDOWN-IT', fg: C.coral }, { label: 'CUSTOM BLOCKS', fg: C.gold }], aria: 'Transform a folder of files — watch Markdown, render each file to HTML, write outputs to a local folder.' },
  { slug: 'kafka-to-lancedb', arche: 'stream', tag: 'KAFKA · DISPATCH', title: 'Consume Kafka into *LanceDB*', sub: 'Dispatch each message *by shape into tables*', sourceLabel: '📨 KAFKA TOPIC', sourceRows: ['{type:order}', '{type:user}', '{type:order}', '{type:event}'], hot: -1, midLabel: 'SHAPE', outLabel: 'LANCEDB TABLES', msgs: ['orders  ▦ 1.2k', 'users   ▦ 840', 'events  ▦ 3.4k'], outhot: 0, chips: [{ label: 'KAFKA' }, { label: 'LANCEDB', fg: C.palm }, { label: 'DISPATCH', fg: C.gold }], aria: 'Consume Kafka into LanceDB — consume JSON messages off a Kafka topic and dispatch each by shape into matching LanceDB tables.' },
  { slug: 'entire-session-search', arche: 'search', tag: 'SESSIONS · EMBEDDINGS', title: 'Search Your *AI Coding Sessions*', sub: 'Index transcripts & prompts, *search by meaning*', sourceLabel: '💬 SESSIONS', sourceRows: ['▸ user: fix…', '◯ context', '▸ tool call', '…'], midLabel: 'EMBED', dim: '768-d', storeLabel: 'POSTGRES', storeNote: 'semantic search', chips: [{ label: 'TRANSCRIPTS' }, { label: 'PGVECTOR', fg: C.palm }, { label: 'BEGINNER', fg: C.gold }], aria: 'Search your AI coding sessions — index transcripts, prompts and context summaries into Postgres for semantic search.' },
  { slug: 'image-search-colpali', arche: 'colpali', tag: 'IMAGES · COLPALI', title: 'Image Search with *ColPali*', sub: 'Multi-vector bags, *rank with MaxSim*', chips: [{ label: 'COLPALI' }, { label: 'QDRANT', fg: C.palm }, { label: 'MAXSIM', fg: C.gold }], aria: 'Image search with ColPali — embed images and queries into multi-vector ColPali bags, store in Qdrant, rank with MaxSim.' },
  { slug: 'text-embedding-qdrant', arche: 'search', tag: 'MARKDOWN · QDRANT', title: 'Semantic Search with *Qdrant*', sub: 'Chunk, embed locally, *upsert into Qdrant*', sourceLabel: '📄 DOCS/*.MD', sourceRows: ['# guide', 'setup', 'usage', '…'], midLabel: 'EMBED', dim: '384-d', storeLabel: 'QDRANT', storeGlyph: G.cube, storeNote: 'managed collection', chips: [{ label: 'LOCAL FS' }, { label: 'QDRANT', fg: C.palm }, { label: 'MANAGED', fg: C.gold }], aria: 'Semantic search with Qdrant — chunk Markdown, embed locally, upsert vectors into a managed Qdrant collection.' },
  { slug: 'text-embedding-lancedb', arche: 'search', tag: 'MARKDOWN · LANCEDB', title: 'Semantic Search with *LanceDB*', sub: 'Embedded, file-based store — *no server*', sourceLabel: '📄 DOCS/*.MD', sourceRows: ['# guide', 'setup', 'usage', '…'], midLabel: 'EMBED', dim: '384-d', storeLabel: 'LANCEDB', storeGlyph: G.disk, storeNote: 'file-based · no server', chips: [{ label: 'LOCAL FS' }, { label: 'LANCEDB', fg: C.palm }, { label: 'EMBEDDED', fg: C.gold }], aria: 'Semantic search with LanceDB — chunk Markdown, embed each chunk, store vectors in an embedded file-based store with no server.' },
  { slug: 'text-embedding-turbopuffer', arche: 'search', tag: 'MARKDOWN · TURBOPUFFER', title: 'Semantic Search with *Turbopuffer*', sub: 'Embed, *upsert into a managed namespace*', sourceLabel: '📄 DOCS/*.MD', sourceRows: ['# guide', 'setup', 'usage', '…'], midLabel: 'EMBED', dim: '384-d', storeLabel: 'TURBOPUFFER', storeGlyph: G.cloud, storeNote: 'managed namespace', chips: [{ label: 'LOCAL FS' }, { label: 'TURBOPUFFER', fg: C.palm }, { label: 'MANAGED', fg: C.gold }], aria: 'Semantic search with Turbopuffer — chunk Markdown, embed, upsert vectors into a managed Turbopuffer namespace.' },
  { slug: 'amazon-s3-embedding', arche: 'search', tag: 'S3 · BUCKET', title: 'Embed Markdown from *Amazon S3*', sub: 'S3 bucket as the source — *chunk, embed, store*', sourceLabel: '🪣 S3 BUCKET', sourceRows: ['s3://docs/', 'guide.md', 'spec.md', '…'], midLabel: 'EMBED', dim: '384-d', storeLabel: 'POSTGRES', storeNote: 'pgvector', chips: [{ label: 'AMAZON S3', fg: C.gold }, { label: 'PGVECTOR', fg: C.palm }, { label: 'STARTER' }], aria: 'Embed Markdown from Amazon S3 — the Semantic Search 101 pipeline with an S3 bucket as the source.' },
  { slug: 'google-drive-embedding', arche: 'search', tag: 'DRIVE · VECTORS', title: 'Semantic Search over *Google Drive*', sub: 'Chunk & embed every doc, *store in Postgres*', sourceLabel: '🗂 GDRIVE', sourceRows: ['/Team Docs', 'plan.gdoc', 'notes.gdoc', '…'], midLabel: 'EMBED', dim: '768-d', storeLabel: 'POSTGRES', storeNote: 'pgvector', chips: [{ label: 'GOOGLE DRIVE', fg: C.gold }, { label: 'PGVECTOR', fg: C.palm }, { label: 'STARTER' }], aria: 'Semantic search over Google Drive — chunk and embed every document from Google Drive and store vectors in Postgres.' },
  { slug: 'oci-object-storage-embedding', arche: 'search', tag: 'OCI · OBJECTS', title: 'Embed *OCI Object Storage*', sub: 'Markdown objects from OCI, *into pgvector*', sourceLabel: '☁ OCI BUCKET', sourceRows: ['/oci/docs', 'guide.md', 'spec.md', '…'], midLabel: 'EMBED', dim: '384-d', storeLabel: 'POSTGRES', storeNote: 'pgvector', chips: [{ label: 'OCI', fg: C.gold }, { label: 'PGVECTOR', fg: C.palm }, { label: 'BEGINNER' }], aria: 'Embed OCI Object Storage — chunk and embed Markdown objects from Oracle Cloud Object Storage into Postgres pgvector.' },
  { slug: 'face-recognition', arche: 'face', tag: 'PHOTOS · FACES', title: 'Build Your Own *Face Search*', sub: 'Detect every face, *embed into 128-d, index*', chips: [{ label: 'FACE DETECT' }, { label: 'QDRANT', fg: C.palm }, { label: '128-D', fg: C.gold }], aria: 'Build your own face search — detect every face in a folder of photos, embed each into a 128-d vector, index in Qdrant.' },
  { slug: 'product-recommendation', arche: 'graph', tag: 'PRODUCTS · GRAPH', title: 'Product *Recommendation* Graph', srcKind: 'products', store: 'Neo4j', hub: { label: 'cart' }, nodes: [{ label: 'camera', type: 'product' }, { label: 'lens', type: 'topic' }, { label: 'tripod', type: 'decision' }, { label: 'bag', type: 'action' }, { label: 'sd card', type: 'concept' }], aria: 'Product recommendation graph — LLM-extract product information and pairings into a Neo4j graph powering recommendations.' },
  { slug: 'manuals-llm-extraction', arche: 'extract', tag: 'MANUALS · RECORDS', title: 'Manuals to *Structured Data*', sub: 'PDF manuals → Markdown → *typed module records*', sourceLabel: '📘 MANUAL.PDF', sourceRows: ['§ Module A', 'specs…', '§ Module B', 'specs…'], midLabel: 'LLM', fields: [['module', 'str'], ['summary', 'str'], ['specs', 'dict'], ['part_no', 'str']], recordLabel: 'TYPED RECORDS → PG', chips: [{ label: 'DOCLING' }, { label: 'LLM', fg: C.coral }, { label: 'POSTGRES', fg: C.palm }], aria: 'Manuals to structured data — convert PDF manuals to Markdown, LLM-extract typed module summaries, store records in Postgres.' },
  { slug: 'multi-format-indexing', arche: 'multiformat', tag: 'PDF+IMG · COLPALI', title: 'Multi-format *Visual Search*', sub: 'Index pages as screenshots — *no OCR, no chunking*', chips: [{ label: 'COLPALI' }, { label: 'QDRANT', fg: C.palm }, { label: 'VISUAL', fg: C.gold }], aria: 'Multi-format visual search — index PDFs and images as page screenshots with ColPali, no OCR or chunking, into Qdrant.' },
  { slug: 'slides-to-speech', arche: 'slides', tag: 'SLIDES · NARRATE', title: 'Slides to *Narrated Search*', sub: 'Vision notes, *Piper TTS, embed into LanceDB*', chips: [{ label: 'VISION LLM' }, { label: 'PIPER TTS', fg: C.gold }, { label: 'LANCEDB', fg: C.palm }], aria: 'Slides to narrated search — render slides, write speaker notes with a vision LLM, narrate with Piper TTS, embed into LanceDB.' },
  { slug: 'sec-edgar-analytics', arche: 'search', tag: 'FILINGS · HYBRID', title: 'SEC Filing *Hybrid Search*', sub: 'Vector + full-text, *fused with hybrid RRF*', sourceLabel: '📑 SEC FILING', sourceRows: ['10-K · 8-K', 'scrub + chunk', 'tag sections', '…'], midLabel: 'EMBED+FTS', dim: 'vec + a·z', storeLabel: 'HYBRID · RRF', storeNote: 'vector ⊕ full-text', storeGlyph: `<g transform="translate(20,30)" fill="none" stroke="${C.palm}" stroke-width="1.5" stroke-linecap="round"><circle cx="22" cy="20" r="13"/><path d="M22 7 v26 M9 20 h26" stroke-opacity="0.5"/><path d="M44 20 H86 M80 14 L86 20 L80 26"/><text x="64" y="14" font-family="${MONO}" font-size="9" fill="${C.gold}" stroke="none">RRF</text></g>`, chips: [{ label: 'PGVECTOR', fg: C.palm }, { label: 'FULL-TEXT' }, { label: 'HYBRID RRF', fg: C.gold }], aria: 'SEC filing hybrid search — scrub, chunk, embed and tag multi-format SEC filings with vector and full-text index, search with hybrid RRF.' },
];

let n = 0;
for (const s of SPECS) {
  s.titlePlain = plainTitle(s.title);
  const inner = ARCHE[s.arche](s);
  const svg = card(s, inner);
  const dir = OUT(s.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'card.svg'), svg);
  n++;
}
console.log(`wrote ${n} card(s): ${SPECS.map((x) => x.slug).join(', ')}`);

