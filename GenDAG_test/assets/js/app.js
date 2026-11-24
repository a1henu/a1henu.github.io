/* GenDAG project page. All interaction, no dependencies. Data: assets/data/*.json. */
(async () => {
'use strict';
const DATA_FILES = ['tables', 'figures', 'plans', 'gallery', 'samples'];
const D = Object.assign({}, ...(await Promise.all(DATA_FILES.map(n => fetch(`assets/data/${n}.json`).then(r => {
  if (!r.ok) throw new Error(`assets/data/${n}.json: ${r.status}`);
  return r.json();
})))));
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];

function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k instanceof Node ? k : document.createTextNode(k));
  return e;
}
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f2 = v => (v == null ? '—' : v.toFixed(2));
const fx = v => v.toFixed(2);
const sgn = (v, d = 2) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d)}`;

/* ------------------------------------------------------------------ tooltip */
const tip = $('#tooltip');
function showTip(ev, html) {
  tip.innerHTML = html; tip.hidden = false;
  const pad = 14, w = tip.offsetWidth, hh = tip.offsetHeight;
  let x = ev.clientX + pad, y = ev.clientY + pad;
  if (x + w > innerWidth - 8) x = ev.clientX - w - pad;
  if (y + hh > innerHeight - 8) y = ev.clientY - hh - pad;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
const hideTip = () => { tip.hidden = true; };
function bindTip(el, html) {
  el.addEventListener('mousemove', ev => showTip(ev, typeof html === 'function' ? html() : html));
  el.addEventListener('mouseleave', hideTip);
}
const bindTips = root => $$('[data-tip]', root).forEach(el => bindTip(el, el.dataset.tip));

/* ------------------------------------------------------------------ operators & icons */
const OPC = { Analyze: '#2a78d6', SearchText: '#eb6834', SearchImage: '#eb6834', SkillQuery: '#eb6834', Reason: '#1baf7a',
  Rewrite: '#c98500', SelectStyle: '#0e9fa8', CodeExec: '#475569', Generate: '#d55181', Edit: '#d55181', RefineLoop: '#a8326a',
  Decompose: '#5a54d6', $refs: '#64748b' };
const GROUPS = [['Interpret', ['Analyze', 'Decompose']], ['Retrieve', ['SearchText', 'SearchImage', 'SkillQuery']],
  ['Transform', ['Reason', 'Rewrite', 'SelectStyle', 'CodeExec']], ['Produce', ['Generate', 'Edit', 'RefineLoop']]];
const ALL_OPS = GROUPS.flatMap(g => g[1]);
const SIG = Object.fromEntries(D.tables.operators.map(o => [o.op, o]));
const parsePorts = s => s.split(',').map(t => t.trim()).filter(Boolean).map(t => ({ opt: t.startsWith('['), type: t.replace(/[\[\]]/g, '').replace(/ list$/, '').trim(), list: / list\]?$/.test(t) }));

function glyph(op, cx, cy, r) {
  const s = r * .5, f = v => v.toFixed(2);
  const st = `fill="none" stroke="#fff" stroke-width="${(r * .15).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (op) {
    case 'Analyze': return `<circle cx="${f(cx - s * .2)}" cy="${f(cy - s * .2)}" r="${f(s * .62)}" ${st}/><path d="M${f(cx + s * .25)},${f(cy + s * .25)} L${f(cx + s * .8)},${f(cy + s * .8)}" ${st}/>`;
    case 'SearchText': return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * .85)}" ${st}/><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(s * .38)}" ry="${f(s * .85)}" ${st}/><path d="M${f(cx - s * .85)},${f(cy)} H${f(cx + s * .85)}" ${st}/>`;
    case 'Reason': return `<path d="M${f(cx - s * .35)},${f(cy + s * .35)} C${f(cx - s * .9)},${f(cy - s * .05)} ${f(cx - s * .6)},${f(cy - s * .95)} ${f(cx)},${f(cy - s * .95)} C${f(cx + s * .6)},${f(cy - s * .95)} ${f(cx + s * .9)},${f(cy - s * .05)} ${f(cx + s * .35)},${f(cy + s * .35)} Z" ${st}/><path d="M${f(cx - s * .3)},${f(cy + s * .62)} H${f(cx + s * .3)} M${f(cx - s * .2)},${f(cy + s * .88)} H${f(cx + s * .2)}" ${st}/>`;
    case 'Rewrite': return `<path d="M${f(cx - s * .75)},${f(cy + s * .75)} L${f(cx - s * .55)},${f(cy + s * .1)} L${f(cx + s * .35)},${f(cy - s * .8)} L${f(cx + s * .8)},${f(cy - s * .35)} L${f(cx - s * .1)},${f(cy + s * .55)} Z" ${st}/><path d="M${f(cx + s * .1)},${f(cy - s * .55)} L${f(cx + s * .55)},${f(cy - s * .1)}" ${st}/>`;
    case 'Generate': case '$refs': return `<rect x="${f(cx - s * .85)}" y="${f(cy - s * .7)}" width="${f(s * 1.7)}" height="${f(s * 1.4)}" rx="${f(s * .2)}" ${st}/><path d="M${f(cx - s * .7)},${f(cy + s * .5)} L${f(cx - s * .2)},${f(cy - s * .05)} L${f(cx + s * .15)},${f(cy + s * .3)} L${f(cx + s * .38)},${f(cy + s * .1)} L${f(cx + s * .72)},${f(cy + s * .5)}" ${st}/><circle cx="${f(cx + s * .4)}" cy="${f(cy - s * .3)}" r="${f(s * .12)}" fill="#fff"/>`;
    case 'SearchImage': return `<rect x="${f(cx - s * .85)}" y="${f(cy - s * .75)}" width="${f(s * 1.3)}" height="${f(s * 1.1)}" rx="${f(s * .15)}" ${st}/><circle cx="${f(cx + s * .35)}" cy="${f(cy + s * .35)}" r="${f(s * .38)}" ${st}/><path d="M${f(cx + s * .62)},${f(cy + s * .62)} L${f(cx + s * .9)},${f(cy + s * .9)}" ${st}/>`;
    case 'Decompose': return [-.55, 0, .55].map(dy => `<path d="M${f(cx - s * .8)},${f(cy + dy * s)} l${f(s * .18)},${f(s * .18)} l${f(s * .3)},${f(-s * .3)} M${f(cx - s * .1)},${f(cy + dy * s)} H${f(cx + s * .85)}" ${st}/>`).join('');
    case 'RefineLoop': {
      const rr = s * .82, a0 = -60 * Math.PI / 180, a1 = 235 * Math.PI / 180;
      const p0 = [cx + rr * Math.cos(a0), cy + rr * Math.sin(a0)], p1 = [cx + rr * Math.cos(a1), cy + rr * Math.sin(a1)];
      const tx = -Math.sin(a1), ty = Math.cos(a1), ah = s * .42;
      const hx = p1[0] + tx * ah * .15, hy = p1[1] + ty * ah * .15;
      const b1 = [hx - tx * ah + (-ty) * ah * .6, hy - ty * ah + tx * ah * .6], b2 = [hx - tx * ah - (-ty) * ah * .6, hy - ty * ah - tx * ah * .6];
      return `<path d="M${f(p0[0])},${f(p0[1])} A${f(rr)},${f(rr)} 0 1 1 ${f(p1[0])},${f(p1[1])}" ${st}/><path d="M${f(b1[0])},${f(b1[1])} L${f(hx)},${f(hy)} L${f(b2[0])},${f(b2[1])}" ${st}/><path d="M${f(cx - s * .34)},${f(cy + s * .02)} L${f(cx - s * .08)},${f(cy + s * .28)} L${f(cx + s * .36)},${f(cy - s * .2)}" ${st}/>`;
    }
    case 'SelectStyle': return `<path d="M${f(cx)},${f(cy - s * .85)} A${f(s * .85)},${f(s * .85)} 0 1 0 ${f(cx + s * .3)},${f(cy + s * .8)} C${f(cx)},${f(cy + s * .3)} ${f(cx + s * .9)},${f(cy + s * .4)} ${f(cx + s * .85)},${f(cy)} A${f(s * .85)},${f(s * .85)} 0 0 0 ${f(cx)},${f(cy - s * .85)} Z" ${st}/>` + [[-.4, -.25], [0, -.5], [-.45, .25]].map(([dx, dy]) => `<circle cx="${f(cx + dx * s)}" cy="${f(cy + dy * s)}" r="${f(s * .12)}" fill="#fff"/>`).join('');
    case 'SkillQuery': return `<path d="M${f(cx)},${f(cy - s * .5)} C${f(cx - s * .3)},${f(cy - s * .72)} ${f(cx - s * .65)},${f(cy - s * .72)} ${f(cx - s * .9)},${f(cy - s * .58)} V${f(cy + s * .66)} C${f(cx - s * .65)},${f(cy + s * .52)} ${f(cx - s * .3)},${f(cy + s * .52)} ${f(cx)},${f(cy + s * .74)} C${f(cx + s * .3)},${f(cy + s * .52)} ${f(cx + s * .65)},${f(cy + s * .52)} ${f(cx + s * .9)},${f(cy + s * .66)} V${f(cy - s * .58)} C${f(cx + s * .65)},${f(cy - s * .72)} ${f(cx + s * .3)},${f(cy - s * .72)} ${f(cx)},${f(cy - s * .5)} V${f(cy + s * .74)}" ${st}/>`;
    case 'CodeExec': return `<path d="M${f(cx - s * .3)},${f(cy - s * .6)} L${f(cx - s * .88)},${f(cy)} L${f(cx - s * .3)},${f(cy + s * .6)} M${f(cx + s * .3)},${f(cy - s * .6)} L${f(cx + s * .88)},${f(cy)} L${f(cx + s * .3)},${f(cy + s * .6)}" ${st}/>`;
    case 'Edit': return `<rect x="${f(cx - s * .85)}" y="${f(cy - s * .55)}" width="${f(s * 1.2)}" height="${f(s * 1.3)}" rx="${f(s * .18)}" ${st}/><path d="M${f(cx - s * .2)},${f(cy + s * .45)} L${f(cx - s * .1)},${f(cy + s * .05)} L${f(cx + s * .55)},${f(cy - s * .6)} L${f(cx + s * .85)},${f(cy - s * .3)} L${f(cx + s * .2)},${f(cy + s * .35)} Z" ${st}/>`;
  }
  return '';
}
const opIcon = (op, size = 26) => `<svg viewBox="0 0 30 30" width="${size}" height="${size}" aria-hidden="true"><circle cx="15" cy="15" r="14" fill="${OPC[op] || '#64748b'}"/>${glyph(op, 15, 15, 14)}</svg>`;
const MARK = {
  y: '<svg class="mk" viewBox="0 0 16 16" aria-label="satisfied"><circle cx="8" cy="8" r="7.5" fill="#16a34a"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  w: '<svg class="mk" viewBox="0 0 16 16" aria-label="partly"><circle cx="8" cy="8" r="7.5" fill="#f08c00"/><path d="M8 4.2v4.6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><circle cx="8" cy="11.4" r="1.1" fill="#fff"/></svg>',
  n: '<svg class="mk" viewBox="0 0 16 16" aria-label="failed"><circle cx="8" cy="8" r="7.5" fill="#e5484d"/><path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
};
const BENCH_FULL = { wise: 'WISE', geneval2: 'GenEval2', corebench: 'T2I-CoReBench', agentgen: 'AgentGen-Bench', mindbench: 'Mind-Bench' };
const METRIC = { wise: 'WiScore', geneval2: 'soft TIFA', corebench: 'CoRe score', agentgen: 'Overall9', mindbench: 'CSA' };
const scoreText = (bench, v) => (v == null ? null : (bench === 'wise' || bench === 'mindbench') ? `${Math.round(v)}/1` : (100 * v).toFixed(1));

/* ------------------------------------------------------------------ DAG layout & render */
function layoutDag(plan, COL, ROW) {
  const nodes = plan.nodes.map(n => ({ ...n }));
  const edges = plan.edges.filter(e => e.from !== '$query');
  if (edges.some(e => e.from === '$refs') && !nodes.some(n => n.id === '$refs')) nodes.unshift({ id: '$refs', op: '$refs' });
  const ids = nodes.map(n => n.id), byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const preds = Object.fromEntries(ids.map(i => [i, []])), succs = Object.fromEntries(ids.map(i => [i, []]));
  for (const e of edges) if (byId[e.from] && byId[e.to]) { preds[e.to].push(e.from); succs[e.from].push(e.to); }
  const L = {};
  const visit = i => { if (L[i] != null) return L[i]; L[i] = 0; let m = 0; for (const p of preds[i]) m = Math.max(m, visit(p) + 1); return (L[i] = m); };
  ids.forEach(visit);
  for (const i of ids) if (!preds[i].length && succs[i].length) L[i] = Math.min(...succs[i].map(s => L[s])) - 1;
  const minL = Math.min(...ids.map(i => L[i]));
  ids.forEach(i => { L[i] -= minL; });
  const nL = Math.max(...ids.map(i => L[i])) + 1;
  const layers = Array.from({ length: nL }, () => []);
  ids.forEach(i => layers[L[i]].push(i));
  const y = {};
  const place = () => layers.forEach(ls => ls.forEach((i, k) => { y[i] = (k - (ls.length - 1) / 2) * ROW; }));
  place();
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  for (let it = 0; it < 4; it++) {
    for (let l = 1; l < nL; l++) layers[l].sort((a, b) => (preds[a].length ? mean(preds[a].map(p => y[p])) : 0) - (preds[b].length ? mean(preds[b].map(p => y[p])) : 0));
    place();
    for (let l = nL - 2; l >= 0; l--) layers[l].sort((a, b) => (succs[a].length ? mean(succs[a].map(p => y[p])) : 0) - (succs[b].length ? mean(succs[b].map(p => y[p])) : 0));
    place();
  }
  nodes.forEach(n => { n.x = L[n.id] * COL; n.y = y[n.id]; n.layer = L[n.id]; });
  return { nodes, edges, byId };
}
function edgePath(a, b, g, k, R) {
  let blocked = false;
  if (b.layer - a.layer > 1) {
    for (const n of g.nodes) {
      if (n.layer > a.layer && n.layer < b.layer) {
        const t = (n.x - a.x) / (b.x - a.x), ly = a.y + (b.y - a.y) * t;
        if (Math.abs(ly - n.y) < R + 10) { blocked = true; break; }
      }
    }
  }
  if (!blocked) {
    const x1 = a.x + R, x2 = b.x - R - 3, dx = (x2 - x1) / 2;
    return { d: `M${fx(x1)},${fx(a.y)} C${fx(x1 + dx)},${fx(a.y)} ${fx(x2 - dx)},${fx(b.y)} ${fx(x2)},${fx(b.y)}`, top: Math.min(a.y, b.y), bot: Math.max(a.y, b.y), mid: [(x1 + x2) / 2, (a.y + b.y) / 2], arc: false };
  }
  const up = (a.y + b.y) / 2 <= 0, span = b.layer - a.layer;
  const bump = R * 2.2 + 14 * k + 6 * span;
  const yc = up ? Math.min(a.y, b.y) - bump : Math.max(a.y, b.y) + bump;
  const c1 = [a.x + (b.x - a.x) * .22, yc], c2 = [b.x - (b.x - a.x) * .22, yc];
  const u = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], m = Math.hypot(dx, dy) || 1; return [dx / m, dy / m]; };
  const ua = u([a.x, a.y], c1), ub = u([b.x, b.y], c2);
  const s = [a.x + ua[0] * R, a.y + ua[1] * R], e = [b.x + ub[0] * (R + 3), b.y + ub[1] * (R + 3)];
  return { d: `M${fx(s[0])},${fx(s[1])} C${fx(c1[0])},${fx(c1[1])} ${fx(c2[0])},${fx(c2[1])} ${fx(e[0])},${fx(e[1])}`, top: up ? yc * .78 + Math.min(a.y, b.y) * .22 : Math.min(a.y, b.y), bot: up ? Math.max(a.y, b.y) : yc * .78 + Math.max(a.y, b.y) * .22, arc: true };
}
let dagUid = 0;
function renderDag(container, plan, opts = {}) {
  const R = opts.radius || 19, COL = opts.col || 112, ROW = opts.row || 82, LS = opts.labelSize || 12.5;
  const g = layoutDag(plan, COL, ROW), uid = ++dagUid;
  let top = -R, bot = R + LS + 14;
  const arcK = { up: 0, down: 0 }, edgeEls = [], labels = [], labeled = new Set();
  g.edges.forEach((e, i) => {
    const a = g.byId[e.from], b = g.byId[e.to];
    if (!a || !b) return;
    const side = (a.y + b.y) / 2 <= 0 ? 'up' : 'down';
    const p = edgePath(a, b, g, b.layer - a.layer > 1 ? arcK[side] : 0, R);
    if (p.arc) arcK[side]++;
    top = Math.min(top, p.top - 8); bot = Math.max(bot, p.bot + 8);
    const bad = opts.badEdge && opts.badEdge.from === e.from && opts.badEdge.to === e.to && opts.badEdge.port === e.port;
    edgeEls.push({ e, i, d: p.d, bad });
    if (opts.typeLabels && !p.arc && !labeled.has(e.type) && b.layer - a.layer === 1) {
      labeled.add(e.type);
      labels.push(`<text x="${fx(p.mid[0])}" y="${fx(p.mid[1] - 5)}" text-anchor="middle" font-size="${LS * .82}" font-weight="600" fill="#64748b" paint-order="stroke" stroke="#fff" stroke-width="3">${esc(e.type)}</text>`);
    }
  });
  const paths = edgeEls.map(({ i, d, bad }) => `<path class="eg" data-i="${i}" d="${d}" fill="none" stroke="${bad ? '#e5484d' : '#a3afc0'}" stroke-width="${bad ? 2.4 : 1.6}" ${bad ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#arw${bad ? 'bad' : ''}${uid})"/>`).join('');
  const hits = edgeEls.map(({ i, d }) => `<path class="eh" data-i="${i}" d="${d}" fill="none" stroke="transparent" stroke-width="14"/>`).join('');
  let loop = '';
  const out = g.byId[plan.output];
  if (out && opts.loop !== false) {
    const lx = out.x, ly = out.y - R;
    loop = `<path class="loop" d="M${fx(lx - R * .45)},${fx(ly + 1)} C${fx(lx - R * 1.35)},${fx(ly - R * 1.8)} ${fx(lx + R * 1.35)},${fx(ly - R * 1.8)} ${fx(lx + R * .45)},${fx(ly + 1)}" fill="none" stroke="${OPC.Generate}" stroke-width="1.8" marker-end="url(#arwloop${uid})"/>`;
    top = Math.min(top, ly - R * 1.8);
  }
  const nodesSvg = g.nodes.map(n => {
    const c = OPC[n.op] || '#64748b', label = n.op === '$refs' ? 'Input image' : n.op, bad = opts.badNode === n.id;
    let inner;
    if (n.op === '$refs' && opts.refThumb) {
      inner = `<clipPath id="clip${uid}"><rect x="${fx(n.x - R)}" y="${fx(n.y - R)}" width="${2 * R}" height="${2 * R}" rx="7"/></clipPath><image href="${opts.refThumb}" x="${fx(n.x - R)}" y="${fx(n.y - R)}" width="${2 * R}" height="${2 * R}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip${uid})"/><rect x="${fx(n.x - R)}" y="${fx(n.y - R)}" width="${2 * R}" height="${2 * R}" rx="7" fill="none" stroke="#fff" stroke-width="2"/>`;
    } else {
      inner = `<circle cx="${fx(n.x)}" cy="${fx(n.y + 1.2)}" r="${R + .5}" fill="#0f172a" fill-opacity=".10"/><circle cx="${fx(n.x)}" cy="${fx(n.y)}" r="${R}" fill="${c}" stroke="#fff" stroke-width="2"/>` + glyph(n.op, n.x, n.y, R * .96);
    }
    return `<g class="nd" data-id="${esc(n.id)}" tabindex="${opts.onSelect ? 0 : -1}" role="button" aria-label="${esc(label)}"><circle class="nd-sel" cx="${fx(n.x)}" cy="${fx(n.y)}" r="${R + 5}" fill="none" stroke="${bad ? '#e5484d' : c}" stroke-width="2.4" opacity="${bad ? 1 : 0}"/>${inner}<text x="${fx(n.x)}" y="${fx(n.y + R + LS + 3)}" text-anchor="middle" font-size="${LS}" font-weight="600" fill="#334155" paint-order="stroke" stroke="#fff" stroke-width="3.5" stroke-linejoin="round">${esc(label)}</text></g>`;
  }).join('');
  const xs = g.nodes.map(n => n.x), ys = g.nodes.map(n => n.y);
  const minX = Math.min(...xs) - R - 40, maxX = Math.max(...xs) + R + 40;
  top = Math.min(top, Math.min(...ys) - R - 8); bot = Math.max(bot, Math.max(...ys) + R + LS + 10);
  const mk = (id, col, sz = 7) => `<marker id="${id}${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="${sz}" markerHeight="${sz}" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="${col}"/></marker>`;
  const W = maxX - minX;
  container.innerHTML = `<svg viewBox="${fx(minX)} ${fx(top - 4)} ${fx(W)} ${fx(bot - top + 8)}" style="max-width:${Math.round(W * (opts.maxScale || 1.25))}px;margin:0 auto" role="img" aria-label="Plan graph"><defs>${mk('arw', '#a3afc0')}${mk('arwhi', '#334155')}${mk('arwbad', '#e5484d')}${mk('arwloop', OPC.Generate, 6)}</defs><g>${paths}</g>${labels.join('')}${loop}<g>${hits}</g>${nodesSvg}</svg>`;
  const svg = container.querySelector('svg');
  const egs = $$('.eg', svg);
  $$('.eh', svg).forEach(el => { const e = g.edges[+el.dataset.i]; bindTip(el, () => `<b>${esc(e.type)}</b> <span class="tt-sub">${esc(e.from === '$refs' ? 'input image' : e.from)} → ${esc(e.to)}.${esc(e.port)}</span>`); });
  const loopEl = $('.loop', svg);
  if (loopEl && opts.onSelect) { loopEl.style.cursor = 'pointer'; bindTip(loopEl, '<b>Final visual checks</b>'); loopEl.addEventListener('click', () => opts.onSelect('__checks')); }
  const select = sel => {
    const ids = [].concat(sel || []), id = ids[0] || null;
    $$('.nd', svg).forEach(n => { const s = $('.nd-sel', n); if (opts.badNode !== n.dataset.id) s.setAttribute('opacity', ids.includes(n.dataset.id) ? 1 : 0); });
    egs.forEach(el => {
      const e = g.edges[+el.dataset.i];
      if (el.getAttribute('stroke') === '#e5484d') return;
      const on = id && (ids.includes(e.to) || ids.includes(e.from));
      el.setAttribute('stroke', on ? '#334155' : '#a3afc0');
      el.setAttribute('stroke-opacity', id && !on ? .5 : 1);
      el.setAttribute('marker-end', `url(#arw${on ? 'hi' : ''}${uid})`);
    });
  };
  $$('.nd', svg).forEach(n => {
    const id = n.dataset.id, node = g.byId[id];
    bindTip(n, () => opts.nodeTip ? opts.nodeTip(node) : `<b>${esc(node.op === '$refs' ? 'Input image' : node.op)}</b>${SIG[node.op] ? ` <span class="tt-sub">→ ${esc(SIG[node.op].output)}</span>` : ''}`);
    if (opts.onSelect) {
      n.addEventListener('click', () => opts.onSelect(id));
      n.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); opts.onSelect(id); } });
    } else n.style.cursor = opts.onHover ? 'default' : 'default';
    if (opts.onHover) { n.addEventListener('mouseenter', () => opts.onHover(id)); n.addEventListener('mouseleave', () => opts.onHover(null)); }
  });
  return { select, graph: g, svg };
}

/* ------------------------------------------------------------------ paper-style DAG (same scheme as paper Fig. 3) */
// Units follow the figure: node radius 5, slot spacing 17.2, row spacing 18; spine Analyze 0 / Rewrite 2.7 / output 4.
function bez(P, t) { const u = 1 - t; return [0, 1].map(i => u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i]); }
function subBez(P, t0, t1) {
  const split = (Q, t) => {
    const a = [0, 1, 2].map(i => [0, 1].map(k => Q[i][k] + (Q[i + 1][k] - Q[i][k]) * t));
    const b = [0, 1].map(i => [0, 1].map(k => a[i][k] + (a[i + 1][k] - a[i][k]) * t));
    const c = [0, 1].map(k => b[0][k] + (b[1][k] - b[0][k]) * t);
    return [[Q[0], a[0], b[0], c], [c, b[1], a[2], Q[3]]];
  };
  const right = split(P, t0)[1];
  return split(right, (t1 - t0) / (1 - t0))[0];
}
/* ------------------------------------------------------------------ plan DAG with labelled pills (teaser style, paper Fig. 3 slot layout) */
// Slots follow the paper figures (Analyze 0, branches 1.35, Rewrite 2.7, output 4; rows in units of RY);
// nodes are pills with an operator icon and name, as in the teaser's GenDAG plan.
const PL = { SX: 120, RY: 70, PH: 30, FONT: 12.5, EDGE: '#9aa8bb', X0: -78, X1: 598, Y0: -122, Y1: 104 };
let _measure;
function textW(t) {
  if (!_measure) { _measure = document.createElement('canvas').getContext('2d'); }
  _measure.font = `600 ${PL.FONT}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif`;
  return _measure.measureText(t).width;
}
function renderPillDag(container, c, lay, opts = {}) {
  const { SX, RY, PH, EDGE } = PL, uid = ++dagUid;
  const SPINE = { Analyze: 0, Rewrite: 2.7 };
  const slot = {};
  for (const n of c.nodes) {
    if (lay.pos[n.id]) slot[n.id] = lay.pos[n.id];
    else if (n.id === c.output) slot[n.id] = [4, 0];
    else if (SPINE[n.op] != null) slot[n.id] = [SPINE[n.op], 0];
  }
  const hasRefs = c.edges.some(e => e.from === '$refs');
  if (hasRefs) slot.$refs = lay.pos.$refs || [1.35, 1];
  let free = -1;
  for (const n of c.nodes) if (!slot[n.id]) { slot[n.id] = [1.35, free]; free += 1; }
  const opOf = Object.fromEntries(c.nodes.map(n => [n.id, n.op]));
  const P = id => [slot[id][0] * SX, slot[id][1] * RY];
  const TH = 40;
  const half = {};
  for (const id of Object.keys(slot)) half[id] = id === '$refs' ? [TH / 2, TH / 2] : [(textW(opOf[id]) + 44) / 2, PH / 2];
  const inside = (id, q, pad) => { const [x, y] = P(id), [hw, hh] = half[id]; return Math.abs(q[0] - x) < hw + pad && Math.abs(q[1] - y) < hh + pad; };
  const arcs = Object.fromEntries((lay.arcs || []).map(([a, b, r]) => [`${a}>${b}`, r]));
  const curve = (a, b) => {
    const [xa, ya] = P(a), [xb, yb] = P(b), dx = xb - xa;
    const arc = arcs[`${a}>${b}`];
    if (arc != null) { const hgt = (Math.min(ya, yb) - arc * RY) / .75; return [[xa, ya], [xa + .18 * dx, ya - hgt], [xb - .18 * dx, yb - hgt], [xb, yb]]; }
    if (b === c.output && yb < ya - 1 && dx > 1.2 * SX) return [[xa, ya], [xa + .6 * dx, ya], [xb - 40, yb + 30], [xb, yb]];
    if (Math.abs(dx) < 1) return [[xa, ya], [xa, ya + (yb - ya) / 3], [xb, yb - (yb - ya) / 3], [xb, yb]];
    return [[xa, ya], [xa + .5 * dx, ya], [xb - .5 * dx, yb], [xb, yb]];
  };
  const edges = c.edges.filter(e => slot[e.from] && slot[e.to]);
  const ts = Array.from({ length: 401 }, (_, k) => k / 400);
  const paths = edges.map((e, i) => {
    const Q = curve(e.from, e.to);
    const t0 = ts.find(t => !inside(e.from, bez(Q, t), 1)) ?? 0;
    const t1 = [...ts].reverse().find(t => !inside(e.to, bez(Q, t), 4)) ?? 1;
    const S = subBez(Q, t0, Math.max(t0 + .01, t1));
    return { i, e, d: `M${fx(S[0][0])},${fx(S[0][1])} C${fx(S[1][0])},${fx(S[1][1])} ${fx(S[2][0])},${fx(S[2][1])} ${fx(S[3][0])},${fx(S[3][1])}` };
  });
  const mk = (id, col) => `<marker id="${id}${uid}" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="${col}"/></marker>`;
  const { X0, X1, Y0, Y1 } = PL;
  let s = `<defs>${mk('pg', EDGE)}${mk('ph', '#475569')}${mk('pp', OPC.Generate)}<filter id="psh${uid}" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.6" flood-color="#0f172a" flood-opacity=".10"/></filter></defs>`;
  s += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="14" fill="#f3f7fd" stroke="#dbe7f7"/>`;
  s += paths.map(p => `<path class="eg" data-i="${p.i}" d="${p.d}" fill="none" stroke="${EDGE}" stroke-width="1.8" stroke-linecap="round" marker-end="url(#pg${uid})"/>`).join('');
  const [ox, oy] = P(c.output), ohw = half[c.output][0];
  s += `<path class="loop" d="M${fx(ox + 12)},${fx(oy - PH / 2)} C${fx(ox + 16)},${fx(oy - PH / 2 - 34)} ${fx(ox - 16)},${fx(oy - PH / 2 - 34)} ${fx(ox - 12)},${fx(oy - PH / 2 - 3)}" fill="none" stroke="${OPC.Generate}" stroke-width="2" stroke-linecap="round" marker-end="url(#pp${uid})"/>`;
  s += `<path d="M${fx(ox + ohw + 4)},${fx(oy)} H${fx(X1 - 4)}" stroke="${EDGE}" stroke-width="1.8" marker-end="url(#pg${uid})"/>`;
  s += paths.map(p => `<path class="eh" data-i="${p.i}" d="${p.d}" fill="none" stroke="transparent" stroke-width="12"/>`).join('');
  for (const id of Object.keys(slot)) {
    const [x, y] = P(id), [hw, hh] = half[id];
    let inner, ring;
    if (id === '$refs') {
      ring = `<rect class="nd-sel" x="${fx(x - hw - 4)}" y="${fx(y - hh - 4)}" width="${2 * hw + 8}" height="${2 * hh + 8}" rx="10" fill="none" stroke="#64748b" stroke-width="2" opacity="0"/>`;
      inner = `<clipPath id="rc${uid}"><rect x="${fx(x - hw)}" y="${fx(y - hh)}" width="${2 * hw}" height="${2 * hh}" rx="7"/></clipPath>` +
        `<rect x="${fx(x - hw)}" y="${fx(y - hh)}" width="${2 * hw}" height="${2 * hh}" rx="7" fill="#fff" filter="url(#psh${uid})"/>` +
        (opts.refThumb ? `<image href="${opts.refThumb}" x="${fx(x - hw)}" y="${fx(y - hh)}" width="${2 * hw}" height="${2 * hh}" preserveAspectRatio="xMidYMid slice" clip-path="url(#rc${uid})"/>` : '') +
        `<rect x="${fx(x - hw)}" y="${fx(y - hh)}" width="${2 * hw}" height="${2 * hh}" rx="7" fill="none" stroke="#fff" stroke-width="2"/>` +
        `<text x="${fx(x)}" y="${fx(y + hh + 15)}" text-anchor="middle" font-size="11.5" font-weight="600" fill="#64748b">Input image</text>`;
    } else {
      const op = opOf[id], r = 10.5, cx = x - hw + 6 + r;
      ring = `<rect class="nd-sel" x="${fx(x - hw - 3.5)}" y="${fx(y - hh - 3.5)}" width="${fx(2 * hw + 7)}" height="${2 * hh + 7}" rx="${hh + 3.5}" fill="none" stroke="${OPC[op]}" stroke-width="2.2" opacity="0"/>`;
      inner = `<rect x="${fx(x - hw)}" y="${fx(y - hh)}" width="${fx(2 * hw)}" height="${2 * hh}" rx="${hh}" fill="#fff" stroke="#e2e8f0" filter="url(#psh${uid})"/>` +
        `<circle cx="${fx(cx)}" cy="${fx(y)}" r="${r}" fill="${OPC[op]}"/>${glyph(op, cx, y, r * .96)}` +
        `<text x="${fx(cx + r + 6)}" y="${fx(y + 4.4)}" font-size="${PL.FONT}" font-weight="600" fill="#0f172a">${esc(op)}</text>`;
    }
    s += `<g class="nd" data-id="${esc(id)}" tabindex="0" role="button" aria-label="${esc(id === '$refs' ? 'Input image' : opOf[id])}">${ring}${inner}</g>`;
  }
  container.innerHTML = `<svg viewBox="${X0} ${Y0} ${X1 - X0} ${Y1 - Y0}" role="img" aria-label="Plan graph">${s}</svg>`;
  const svg = container.querySelector('svg'), egs = $$('.eg', svg);
  $$('.eh', svg).forEach(el => { const e = edges[+el.dataset.i]; bindTip(el, () => `<b>${esc(e.type)}</b> <span class="tt-sub">${esc(e.from === '$refs' ? 'input image' : e.from)} → ${esc(e.to)}.${esc(e.port)}</span>`); });
  const loop = $('.loop', svg);
  if (loop && opts.onSelect) { loop.style.cursor = 'pointer'; bindTip(loop, '<b>Final visual checks</b>'); loop.addEventListener('click', () => opts.onSelect('__checks')); }
  const select = id => {
    $$('.nd', svg).forEach(n => $('.nd-sel', n).setAttribute('opacity', n.dataset.id === id ? 1 : 0));
    egs.forEach(el => {
      const e = edges[+el.dataset.i], on = id && (e.to === id || e.from === id);
      el.setAttribute('stroke', on ? '#475569' : EDGE); el.setAttribute('stroke-opacity', id && !on ? .5 : 1);
      el.setAttribute('marker-end', `url(#p${on ? 'h' : 'g'}${uid})`);
    });
  };
  $$('.nd', svg).forEach(n => {
    const id = n.dataset.id, op = id === '$refs' ? '$refs' : opOf[id];
    if (SIG[op]) bindTip(n, `<b>${esc(op)}</b> <span class="tt-sub">${esc(SIG[op].inputs)} → ${esc(SIG[op].output)}</span>`);
    if (opts.onSelect) { n.addEventListener('click', () => opts.onSelect(id)); n.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); opts.onSelect(id); } }); }
  });
  return { select, graph: { edges } };
}

/* ------------------------------------------------------------------ lightbox */
const lb = $('#lightbox'), lbImg = $('.lb-img', lb), lbCap = $('.lb-cap', lb), lbStrip = $('.lb-strip', lb), lbCount = $('.lb-count', lb);
let lbItems = [], lbIdx = 0;
function lbRender() {
  const it = lbItems[lbIdx];
  lbImg.src = it.src; lbImg.alt = it.title || '';
  lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  lbCap.innerHTML = `${it.title ? `<b>${esc(it.title)}</b>` : ''}${it.score ? `<span class="sc">${esc(it.score)}</span>` : ''}${it.prompt ? `<span class="pr" title="Click to expand">${esc(it.prompt)}</span>` : ''}`;
  const pr = $('.pr', lbCap); if (pr) pr.addEventListener('click', ev => { ev.stopPropagation(); pr.classList.toggle('open'); });
  lbCount.textContent = lbItems.length > 1 ? `${lbIdx + 1} / ${lbItems.length}` : '';
  lbStrip.innerHTML = '';
  if (lbItems.length > 1) lbItems.forEach((x, i) => lbStrip.append(h('button', { class: i === lbIdx ? 'sel' : '', 'aria-label': x.title || `Image ${i + 1}`, onclick: () => { lbIdx = i; lbRender(); } }, h('img', { src: x.thumb || x.src, alt: '' }))));
  $$('.lb-nav', lb).forEach(b => { b.hidden = lbItems.length < 2; });
}
function openLB(items, idx = 0) { lbItems = items.filter(x => x.src); lbIdx = Math.max(0, Math.min(idx, lbItems.length - 1)); if (!lbItems.length) return; lbRender(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); }
function closeLB() { lb.hidden = true; document.body.style.overflow = ''; }
const lbStep = d => { lbIdx = (lbIdx + d + lbItems.length) % lbItems.length; lbRender(); };
lb.addEventListener('click', ev => { if (ev.target === lb || ev.target.classList.contains('lb-stage')) closeLB(); });
$('.lb-close', lb).addEventListener('click', closeLB);
$('.lb-prev', lb).addEventListener('click', () => lbStep(-1));
$('.lb-next', lb).addEventListener('click', () => lbStep(1));
document.addEventListener('keydown', ev => {
  if (lb.hidden) return;
  if (ev.key === 'Escape') closeLB();
  if (ev.key === 'ArrowLeft' && lbItems.length > 1) lbStep(-1);
  if (ev.key === 'ArrowRight' && lbItems.length > 1) lbStep(1);
});

/* ------------------------------------------------------------------ nav */
const nav = $('.topnav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
const navLinks = $$('.nav-links a');
const spy = new IntersectionObserver(ents => {
  for (const en of ents) if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}, { rootMargin: '-45% 0px -50% 0px' });
['overview', 'explorer', 'results', 'gallery'].forEach(id => spy.observe(document.getElementById(id)));

function seg(el, items, cur, onPick) {
  el.innerHTML = '';
  const btns = items.map(([k, label]) => {
    const b = h('button', { class: k === cur ? 'sel' : '', role: 'tab', 'aria-selected': String(k === cur) }, label);
    b.addEventListener('click', () => { btns.forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-selected', String(x === b)); }); onPick(k); });
    return b;
  });
  el.append(...btns);
  return btns;
}
function svgEl(w, hh, inner, label) { return `<svg viewBox="0 0 ${w} ${hh}" role="img" aria-label="${esc(label || '')}">${inner}</svg>`; }
const barPath = (x0, y, w, hh, r = 4) => {
  if (w <= 0) return '';
  r = Math.min(r, w, hh / 2);
  return `M${fx(x0)},${fx(y)} H${fx(x0 + w - r)} Q${fx(x0 + w)},${fx(y)} ${fx(x0 + w)},${fx(y + r)} V${fx(y + hh - r)} Q${fx(x0 + w)},${fx(y + hh)} ${fx(x0 + w - r)},${fx(y + hh)} H${fx(x0)} Z`;
};
const colPath = (x, y0, w, hh, r = 3) => {
  if (hh <= 0) return '';
  r = Math.min(r, w / 2, hh);
  return `M${fx(x)},${fx(y0)} V${fx(y0 - hh + r)} Q${fx(x)},${fx(y0 - hh)} ${fx(x + r)},${fx(y0 - hh)} H${fx(x + w - r)} Q${fx(x + w)},${fx(y0 - hh)} ${fx(x + w)},${fx(y0 - hh + r)} V${fx(y0)} Z`;
};
function legend(el, items) { el.innerHTML = items.map(([c, label, kind]) => `<span><i class="${kind || ''}" style="${kind === 'ring' ? `border-color:${c}` : `background:${c}`}"></i>${esc(label)}</span>`).join(''); }

/* ------------------------------------------------------------------ figure overlays (teaser / overview are the paper PDFs as SVG) */
const SVGNS = 'http://www.w3.org/2000/svg';
function figure(root, fig, alt) {
  const wrap = h('div', { class: 'fig-wrap' });
  wrap.append(h('object', { class: 'fig-base', type: 'image/svg+xml', data: fig.src, 'aria-label': alt, style: `aspect-ratio: ${fig.w} / ${fig.h}` }));
  const hi = document.createElementNS(SVGNS, 'svg'), ov = document.createElementNS(SVGNS, 'svg');
  for (const s of [hi, ov]) { s.setAttribute('viewBox', `0 0 ${fig.w} ${fig.h}`); s.setAttribute('preserveAspectRatio', 'none'); }
  hi.setAttribute('class', 'fig-hi'); ov.setAttribute('class', 'fig-ov');
  wrap.append(hi, ov);
  root.append(wrap);
  return { wrap, hi, ov };
}
const R4 = (r, pad = 0) => `x="${fx(r[0] - pad)}" y="${fx(r[1] - pad)}" width="${fx(r[2] - r[0] + 2 * pad)}" height="${fx(r[3] - r[1] + 2 * pad)}"`;

/* ------------------------------------------------------------------ teaser */
(function teaser() {
  const T = D.teaser, G = D.teaser_geo, root = $('#teaser-root');
  const { hi, ov } = figure(root, D.figures.teaser, 'GenDAG teaser: a melted-snowman request answered by Qwen-Image-2.1, GPT-Image-2, GEMS and GenDAG');
  const SYS = { qwen: 'Qwen-Image-2.1', gpt: 'GPT-Image-2', gems: 'GEMS', ours: 'GenDAG w/ Qwen-Image-2.1' };
  // highlight layer (multiply): prompt phrases, checklist rows, checklist columns
  let s = '';
  for (const [k, rects] of Object.entries(G.phrases)) for (const r of rects) s += `<rect class="hl" data-key="${k}" ${R4(r, 1.5)} rx="3"/>`;
  for (const r of G.rows) s += `<rect class="hl row" data-key="${r.key}" ${R4(r.band)} rx="4"/>`;
  for (const [k, x] of Object.entries(G.colx)) s += `<rect class="hl col" data-col="${k}" x="${x - 4}" y="92" width="24" height="210" rx="6"/>`;
  hi.innerHTML = s;
  // interaction layer
  const bg = '#f3f7fe';  // benchmark panel fill in the PDF
  let o = G.cover.map(r => `<rect ${R4(r, 1.2)} fill="${bg}"/>`).join('');
  for (const [k, r] of Object.entries(G.photos)) o += `<rect class="outline" data-col="${k}" ${R4(r, 1)} rx="10"/>`;
  // bars: dimmers and value labels per series
  const val = Object.fromEntries(D.tables.main.map(r => [r.name, r]));
  const color = Object.fromEntries(G.legend.map(l => [l.name, l.color]));
  for (const b of G.bars) o += `<rect class="dim" data-series="${esc(b.series)}" ${R4(b.rect, .6)} fill="${bg}"/>`;
  for (const b of G.bars) {
    const v = val[b.series][b.bench];
    const tc = ['Qwen-Image-2.1', 'Nano Banana Pro'].includes(b.series) ? '#64748b' : b.series === 'GEMS†' ? '#6d4fd6' : color[b.series];
    const mark = b.series === 'GEMS†' && b.bench === 'mb_all' ? '†' : '';
    o += `<text class="val" data-series="${esc(b.series)}" x="${fx((b.rect[0] + b.rect[2]) / 2)}" y="${fx(b.rect[1] - 5)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="700" fill="${tc}">${v.toFixed(1)}${mark}</text>`;
  }
  for (const l of G.legend) o += `<rect class="dim" data-series="${esc(l.name)}" ${R4(l.rect, 1.5)} fill="${bg}"/>`;
  // hit areas
  for (const [k, r] of Object.entries(G.photos)) o += `<rect class="hit photo" data-col="${k}" ${R4(r)} />`;
  for (const r of G.rows) o += `<rect class="hit row" data-key="${r.key}" ${R4(r.band)} />`;
  G.feedback.forEach((r, i) => { o += `<rect class="hit fb" data-i="${i}" ${R4(r)} />`; });
  for (const [k, r] of Object.entries(G.pills)) o += `<rect class="hit pill" data-pill="${k}" ${R4(r)} rx="20"/>`;
  for (const l of G.legend) o += `<rect class="hit series" data-series="${esc(l.name)}" ${R4(l.rect, 2)} />`;
  for (const b of G.bars) o += `<rect class="hit series" data-series="${esc(b.series)}" x="${fx(b.rect[0] - 2)}" y="${fx(b.rect[1] - 18)}" width="${fx(b.rect[2] - b.rect[0] + 4)}" height="${fx(b.rect[3] - b.rect[1] + 18)}" />`;
  ov.innerHTML = o;
  const setKey = k => $$('.hl[data-key]', hi).forEach(e => e.classList.toggle('on', e.dataset.key === k));
  const setCol = k => { $$('.hl.col', hi).forEach(e => e.classList.toggle('on', e.dataset.col === k)); $$('.outline', ov).forEach(e => e.classList.toggle('on', e.dataset.col === k)); };
  const setSeries = n => {
    ov.classList.toggle('series-on', !!n);
    $$('.dim', ov).forEach(e => e.classList.toggle('on', !!n && e.dataset.series !== n));
    $$('.val', ov).forEach(e => e.classList.toggle('on', e.dataset.series === n));
  };
  const photoItems = Object.keys(SYS).map(k => ({ src: T.photos[k].l, thumb: T.photos[k].s, title: SYS[k], prompt: T.prompt_full }));
  $$('.hit.row', ov).forEach(e => { e.addEventListener('mouseenter', () => setKey(e.dataset.key)); e.addEventListener('mouseleave', () => setKey(null)); });
  $$('.hit.photo', ov).forEach(e => {
    e.addEventListener('mouseenter', () => setCol(e.dataset.col)); e.addEventListener('mouseleave', () => setCol(null));
    e.addEventListener('click', () => openLB(photoItems, Object.keys(SYS).indexOf(e.dataset.col)));
  });
  $$('.hit.series', ov).forEach(e => { e.addEventListener('mouseenter', () => setSeries(e.dataset.series)); e.addEventListener('mouseleave', () => setSeries(null)); });
  const fbItems = T.rounds.map((r, i) => ({ src: r.image.l, thumb: r.image.s, title: i ? `Regeneration ${i}` : 'Plan output', score: `${[...r.marks].filter(m => m === 'P').length}/8 checks pass` }));
  $$('.hit.fb', ov).forEach(e => {
    const i = +e.dataset.i;
    bindTip(e, `<b>${fbItems[i].title}</b> <span class="tt-sub">${fbItems[i].score}</span>`);
    e.addEventListener('click', () => openLB(fbItems, i));
  });
  const O = D.overview;
  const PILL = {
    Analyze: 'Recognizes the remnants of a melted snowman.',
    Search: `Two searches: “${O.search[0].query}” and “${O.search[1].query}”.`,
    Reason: 'Maps each remnant to its place: stones → buttons, carrot → nose, hat → head, scarf → neck.',
    Rewrite: 'Writes one detailed prompt that contains every inferred part.',
    Generate: 'Generates the image, checks it against 8 questions, and regenerates until all pass.',
  };
  $$('.hit.pill', ov).forEach(e => bindTip(e, `<b>${e.dataset.pill}</b><br><span class="tt-sub">${esc(PILL[e.dataset.pill])}</span>`));
})();

/* ------------------------------------------------------------------ overview */
(function overview() {
  const O = D.overview, G = D.overview_geo, root = $('#overview-root');
  const { hi, ov } = figure(root, D.figures.overview, 'GenDAG overview: plan loop with planner, checker and proposed DAG; execution with visual feedback');
  const cap = h('div', { class: 'ov-caption', 'aria-live': 'polite' });
  root.append(cap);
  let s = '';
  for (const [k, rects] of Object.entries(G.phrases)) for (const r of rects) s += `<rect class="hl" data-key="${k}" ${R4(r, 1.2)} rx="3"/>`;
  hi.innerHTML = s;
  const W = D.figures.overview.w, H = D.figures.overview.h;
  let o = `<defs><mask id="ovmask"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/><g class="holes"></g></mask></defs>`;
  o += `<rect class="dimmer" x="0" y="0" width="${W}" height="${H}" fill="#fff" mask="url(#ovmask)"/><g class="outlines"></g>`;
  for (const [k, r] of Object.entries(G.rows)) o += `<rect class="hit clue" data-key="${k}" ${R4(r)} />`;
  for (const [k, rects] of Object.entries(G.phrases)) for (const r of rects) o += `<rect class="hit phr" data-key="${k}" ${R4(r)} />`;
  G.rounds.forEach((r, i) => { o += `<rect class="hit round" data-i="${i}" ${R4(r)} />`; });
  G.dots.forEach((row, ri) => row.forEach((r, qi) => { o += `<circle class="hit dot" data-r="${ri}" data-q="${qi}" cx="${fx((r[0] + r[2]) / 2)}" cy="${fx((r[1] + r[3]) / 2)}" r="3.2"/>`; }));
  ov.innerHTML = o;
  // clue tracing across request, Reason and Rewrite
  const setKey = k => $$('.hl', hi).forEach(e => e.classList.toggle('on', e.dataset.key === k));
  $$('.hit.clue, .hit.phr', ov).forEach(e => { e.addEventListener('mouseenter', () => setKey(e.dataset.key)); e.addEventListener('mouseleave', () => setKey(null)); });
  // rounds and check dots
  const items = O.rounds.map((r, i) => ({ src: r.image.l, thumb: r.image.s, title: i ? `Regeneration ${i}` : 'Plan output', score: `${[...r.marks].filter(m => m === 'P').length}/8 checks pass` }));
  $$('.hit.round', ov).forEach(e => {
    const i = +e.dataset.i, f = [...O.rounds[i].marks].map((m, q) => (m === 'F' ? O.questions[q] : null)).filter(Boolean);
    bindTip(e, `<b>${items[i].title}</b> <span class="tt-sub">${items[i].score}</span>${f.length ? `<br>${f.map(q => '✕ ' + esc(q)).join('<br>')}` : ''}`);
    e.addEventListener('click', () => openLB(items, i));
  });
  $$('.hit.dot', ov).forEach(e => {
    const ri = +e.dataset.r, qi = +e.dataset.q, ok = O.rounds[ri].marks[qi] === 'P';
    bindTip(e, `<b>${ok ? 'Pass' : 'Fail'}</b> <span class="tt-sub">${esc(O.questions[qi])}</span>`);
  });
  // what each panel does in this run, shown under the figure while the panel is hovered
  const q = t => `“${esc(t.length > 64 ? t.slice(0, 62).replace(/\s+\S*$/, '') + ' …' : t)}”`;
  const passes = O.rounds.map(r => [...r.marks].filter(m => m === 'P').length);
  const STAGE = {
    input: ['Request', 'A T2I-CoReBench request that describes melted remnants and asks for the scene before melting, without naming the snowman.'],
    planner: ['Planner', `Chooses ${new Set(O.plan.nodes.map(n => n.op)).size} of the 12 operators for this request and wires each input to its source.`],
    checker: ['Checker', 'Verifies ports, types and dependencies before anything runs. An invalid plan returns typed diagnostics and the planner revises it.'],
    dag: ['Proposed DAG', 'The checked plan. Intent, Facts and the PromptSpec flow along typed edges. Hover a node to see where it runs.'],
    analyze: ['Analyze', 'Recognizes the puddle, stones, carrot, hat and scarf as the remains of a snowman and sets what to search and reason about.'],
    search: ['Search', `Two text searches: ${q(O.search[0].query)} and ${q(O.search[1].query)}.`],
    reason: ['Reason', `Infers ${O.facts.length} facts that map each remnant to its place on the snowman. Hover a clue to trace it through the request and the prompt.`],
    rewrite: ['Rewrite', 'Writes one generation prompt that places every inferred part: buttons, nose, hat and scarf on the snowman, and no puddle.'],
    generate: ['Generate', `The plan's image passes ${passes[0]} of 8 checks. Three regenerations pass ${passes.slice(1).join(', ')}, and the last image is returned. Click an image to enlarge it.`],
  };
  const ICON = { analyze: 'Analyze', search: 'SearchText', reason: 'Reason', rewrite: 'Rewrite', generate: 'Generate' };
  const DEFAULT = '<span class="cap-hint">Hover any panel to see what it does in this run.</span>';
  cap.innerHTML = DEFAULT;
  const holes = $('.holes', ov), outlines = $('.outlines', ov), dimmer = $('.dimmer', ov);
  let cur = null;
  function focus(stage, pill) {
    const key = `${stage}|${pill}`;
    if (key === cur) return;
    cur = key;
    holes.innerHTML = ''; outlines.innerHTML = '';
    if (!stage) { dimmer.classList.remove('on'); cap.innerHTML = DEFAULT; return; }
    const rects = [G.boxes[stage]];
    if (pill) rects.push(G.pills[pill]);
    else if (G.pills[stage]) rects.push(G.pills[stage]);
    rects.forEach((r, i) => {
      const pad = i ? 2 : 3, rx = i ? 20 : 12;
      holes.insertAdjacentHTML('beforeend', `<rect ${R4(r, pad)} rx="${rx}" fill="#000"/>`);
      outlines.insertAdjacentHTML('beforeend', `<rect class="ol-glow" ${R4(r, pad)} rx="${rx}"/><rect class="ol${i ? ' pill' : ''}" ${R4(r, pad)} rx="${rx}"/>`);
    });
    dimmer.classList.add('on');
    const [title, text] = STAGE[stage];
    cap.innerHTML = `${ICON[stage] ? opIcon(ICON[stage], 20) : ''}<b>${title}</b><span>${text}</span>`;
  }
  const inside = (r, p) => p.x >= r[0] && p.x <= r[2] && p.y >= r[1] && p.y <= r[3];
  ov.addEventListener('mousemove', ev => {
    const pt = ov.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(ov.getScreenCTM().inverse());
    const pill = Object.keys(G.pills).find(k => inside(G.pills[k], p));
    if (pill) { focus(pill, pill); return; }   // a DAG node lights up the panel where it runs
    focus(Object.keys(G.boxes).find(k => inside(G.boxes[k], p)) || null);
  });
  ov.addEventListener('mouseleave', () => focus(null));
})();

/* ------------------------------------------------------------------ operator catalog */
(function catalog() {
  const root = $('#catalog');
  const groups = h('div', { class: 'cat-groups' });
  const btns = {};
  for (const [gname, ops] of GROUPS) {
    const col = h('div', { class: 'cat-group' }, h('h4', {}, gname));
    for (const op of ops) {
      const b = h('button', { class: 'op-btn', html: opIcon(op, 24) + `<span>${op}</span>` });
      b.addEventListener('click', () => pickOp(op));
      btns[op] = b; col.append(b);
    }
    groups.append(col);
  }
  const chips = h('div', { class: 'type-chips' }), info = h('div', { class: 'cat-info' }), chipEls = {};
  for (const t of D.tables.types) { const c = h('button', { class: 'type-chip', onclick: () => pickType(t.type) }, t.type); chipEls[t.type] = c; chips.append(c); }
  root.append(groups, h('div', { class: 'cat-side' }, chips, info));
  const reset = () => { Object.values(btns).forEach(b => b.classList.remove('sel', 'dim', 'prod', 'cons')); Object.values(chipEls).forEach(c => c.classList.remove('sel', 'in', 'out')); };
  let pickType = function (t) {
    reset(); chipEls[t].classList.add('sel');
    const prod = [], cons = [];
    for (const o of D.tables.operators) {
      const isP = o.output === t, isC = parsePorts(o.inputs).some(p => p.type === t), b = btns[o.op];
      if (isP) { b.classList.add('prod'); prod.push(o.op); }
      if (isC) { b.classList.add('cons'); cons.push(o.op); }
      if (!isP && !isC) b.classList.add('dim');
    }
    const ty = D.tables.types.find(x => x.type === t);
    chipEls[t].classList.add('sel');
    info.innerHTML = `<b style="font-family:var(--mono)">${esc(t)}</b>: ${esc(ty.content)}.<div style="margin-top:6px"><b>Produced by</b> ${prod.length ? prod.join(', ') : (t === 'Query' ? 'the user' : '—')}<br><b>Consumed by</b> ${cons.length ? cons.join(', ') : '—'}</div><div class="key"><span class="k-prod">produces</span><span class="k-cons">consumes</span></div>`;
  };
  let pickOp = function (op) {
    reset(); btns[op].classList.add('sel');
    const o = SIG[op], ins = parsePorts(o.inputs);
    ins.forEach(p => chipEls[p.type] && chipEls[p.type].classList.add('in'));
    chipEls[o.output] && chipEls[o.output].classList.add('out');
    const tag = (t, cls) => `<span class="io-t ${cls}">${esc(t)}</span>`;
    info.innerHTML = `<b>${esc(op)}</b>: ${esc(o.function)}.` +
      `<div class="io"><div class="io-box in"><h6>Input</h6>${ins.map(p => tag(p.opt ? `[${p.type}]` : p.type, 'in')).join('')}</div>` +
      `<div class="io-arrow">→</div><div class="io-box out"><h6>Output</h6>${tag(o.output, 'out')}</div></div>` +
      `<span class="muted">Brackets mark optional inputs.</span>`;
  };
  const HINT = '<span class="muted">Select a value type to see which operators produce and consume it, or an operator to see its inputs and output.</span>';
  let current = null;
  const clear = () => { reset(); current = null; info.innerHTML = HINT; };
  const pT = pickType, pO = pickOp;
  pickType = t => { if (current === 't:' + t) return clear(); current = 't:' + t; pT(t); };
  pickOp = op => { if (current === 'o:' + op) return clear(); current = 'o:' + op; pO(op); };
  clear();
})();

/* ------------------------------------------------------------------ checker demo + repair chart */
(function checker() {
  const C = D.checker, root = $('#checker');
  const toPlan = plan => {
    const opOf = Object.fromEntries(plan.nodes.map(n => [n.id, n.op])), edges = [];
    for (const n of plan.nodes) for (const [port, src] of Object.entries(n.inputs || {})) for (const s of [].concat(src)) if (s !== '$query') edges.push({ from: s, to: n.id, port, type: D.op_types[opOf[s]] || '?' });
    return { nodes: plan.nodes, edges, output: plan.output };
  };
  const badSrc = [].concat(((C.initial.nodes.find(n => n.id === C.typed.node_id) || {}).inputs || {})[C.typed.port] || [])[0];
  const title = h('div', { class: 'chk-title' }), dag = h('div', { class: 'dag-box' });
  const left = h('div', { class: 'chk-dag' }, title, dag);
  const segEl = h('div', { class: 'seg seg-small' }), msg = h('div', { class: 'msg' }), note = h('p', { class: 'chk-note' });
  const repairBtn = h('button', { class: 'btn-sm' });
  const mid = h('div', { class: 'chk-mid' }, segEl, msg, note, repairBtn);
  const right = h('div', {});
  root.append(left, mid, right);
  let mode = 'typed', repaired = false;
  const draw = () => {
    if (repaired) {
      title.textContent = 'Repaired plan · accepted';
      renderDag(dag, toPlan(C.repaired), { loop: false, maxScale: 1 });
      msg.className = 'msg ok'; msg.innerHTML = `<span class="k">check passed</span>  output: ${esc(C.repaired.output)} (RefineLoop)`;
      note.textContent = 'The agent removed the extra Generate node and passed on its first resubmission.';
      repairBtn.textContent = '← First plan';
    } else {
      title.textContent = 'First plan · rejected';
      renderDag(dag, toPlan(C.initial), { loop: false, maxScale: 1, badEdge: { from: badSrc, to: C.typed.node_id, port: C.typed.port }, badNode: C.typed.node_id });
      msg.className = 'msg';
      msg.innerHTML = mode === 'typed' ? `<span class="k">${esc(C.typed.code)}</span>  ${esc(C.typed.message)}\n<span class="k">hint</span>    ${esc(C.typed.hint)}` : esc(C.opaque);
      note.textContent = mode === 'typed' ? 'The diagnostic names the node, the port and the expected type.' : 'A bare rejection leaves the agent to find the error itself.';
      repairBtn.textContent = 'Show repaired plan →';
    }
  };
  const segBtns = seg(segEl, [['opaque', 'Bare rejection'], ['typed', 'Typed diagnostic']], mode, k => { mode = k; repaired = false; draw(); });
  repairBtn.addEventListener('click', () => { repaired = !repaired; if (repaired) { mode = 'typed'; segBtns.forEach((b, i) => b.classList.toggle('sel', i === 1)); } draw(); });
  draw();
  const rows = D.tables.repair, groups = [...new Set(rows.map(r => r.group))];
  const W = 330, lab = 112, xw = W - lab - 50, bh = 15, gap = 4, gh = 2 * bh + gap + 28;
  let s = '';
  groups.forEach((gname, gi) => {
    const y0 = gi * gh + 12;
    s += `<text x="0" y="${y0}" font-size="11.5" font-weight="650" fill="#334155">${esc(gname.replace('Backend: ', 'Planner: '))}</text>`;
    rows.filter(r => r.group === gname).forEach((r, k) => {
      const y = y0 + 7 + k * (bh + gap), w = xw * r.fix1 / 100, typed = r.name.startsWith('Typed');
      s += `<text x="${lab - 6}" y="${y + bh / 2 + 4}" text-anchor="end" font-size="11.5" fill="#334155">${typed ? 'Typed diagnostic' : 'Bare rejection'}</text>`;
      s += `<path class="hit" d="${barPath(lab, y, w, bh, 3)}" fill="${typed ? '#2a78d6' : '#c9d1dc'}" data-tip="${esc(`<b>${r.name}</b><br>Fix@1 ${f2(r.fix1)}% · Fix@2 ${f2(r.fix2)}% · ${f2(r.checks)} checks`)}"/>`;
      s += `<text x="${lab + w + 5}" y="${y + bh / 2 + 4}" font-size="11.5" font-weight="650" fill="#0f172a">${r.fix1.toFixed(1)}%</text>`;
    });
  });
  right.innerHTML = `<div class="chk-title">Repaired on the first resubmission</div><div class="chart">${svgEl(W, groups.length * gh + 2, s, 'Fix at 1')}</div><p class="fine" style="margin-top:4px">Same invalid first plans, no image generation. With diagnostics, every plan is repaired within two checks.</p>`;
  bindTips(right);
})();

/* ------------------------------------------------------------------ explorer */
(function explorer() {
  const picker = $('#case-picker'), view = $('#explorer-view'), cases = D.explorer;
  cases.forEach((c, i) => picker.append(h('button', { class: 'case-btn', role: 'tab', 'aria-selected': 'false', onclick: () => show(i) },
    h('img', { src: c.final.s, alt: '', loading: 'lazy' }), h('div', { class: 'cb-bench' }, { wise: 'WISE', geneval2: 'GenEval2', corebench: 'CoReBench', agentgen: 'AgentGen', mindbench: 'Mind-Bench' }[c.bench]), h('div', { class: 'cb-title' }, c.title))));
  function show(i) {
    [...picker.children].forEach((b, k) => { b.classList.toggle('sel', k === i); b.setAttribute('aria-selected', String(k === i)); });
    const c = cases[i];
    view.innerHTML = '';
    const reqBody = h('div', {}, h('div', { class: 'req-text' }, c.prompt || ''), h('div', { class: 'req-meta' }, `${c.blurb}`));
    const req = h('div', { class: 'ex-request ex-request-in' }, h('div', { class: 'req-row' }, ...c.inputs.map(im => { const el = h('img', { src: im.s, alt: 'Input image', title: 'Input image' }); el.addEventListener('click', () => openLB([{ src: im.l, title: 'Input image' }])); return el; }), reqBody));
    const jsonBtn = h('button', { class: 'linkish', style: 'margin:0;font-size:12px;text-transform:none;letter-spacing:0' }, 'Plan JSON');
    const dagBox = h('div', { class: 'dag-box' });
    const dagCard = h('div', { class: 'ex-card ex-dag pill' }, req, h('div', { class: 'ex-label' }, h('span', {}, `Plan · ${c.nodes.length} operators`), jsonBtn), dagBox);
    const st = scoreText(c.bench, c.score);
    const finalImg = h('img', { src: c.final.l, alt: 'Final image' });
    const strip = h('div', { class: 'checks-strip' });
    const side = h('div', { class: 'ex-card ex-side' }, h('div', { class: 'ex-label' }, h('span', {}, 'Output'), h('span', { style: 'text-transform:none;letter-spacing:0;font-weight:500' }, st ? `${METRIC[c.bench]} ${st}${c.bench === 'wise' || c.bench === 'mindbench' ? '' : ' / 100'}` : '')),
      h('div', { class: 'final' }, finalImg), strip);
    finalImg.addEventListener('click', () => openLB([{ src: c.final.l, title: 'GenDAG w/ Qwen-Image-2.1', score: st ? `${METRIC[c.bench]} ${st}` : '', prompt: c.prompt }]));
    const detail = h('div', { class: 'ex-card ex-detail' });
    view.append(dagCard, side, detail);
    // final-check strip
    const rounds = c.checks;
    let best = 0; rounds.forEach((r, k) => { if ((r.pass_ratio ?? 0) > (rounds[best].pass_ratio ?? 0)) best = k; });
    if (rounds.length > 1) {
      strip.append(h('span', { class: 'cs-label' }, 'Final', h('br'), 'checks'));
      rounds.forEach((r, k) => { const b = h('button', { class: k === best ? 'best' : '', 'aria-label': k ? `Regeneration ${k}` : 'Plan output', html: `<img src="${r.image ? r.image.s : ''}" alt=""><span class="pc">${Math.round(100 * (r.pass_ratio ?? 0))}%</span>` }); b.addEventListener('click', () => sel('__checks')); strip.append(b); });
    } else strip.append(h('span', { class: 'cs-label', html: rounds[0] && rounds[0].correct ? `${MARK.y} The plan's output passed every final check.` : `Final checks: ${Math.round(100 * ((rounds[0] || {}).pass_ratio || 0))}% passed.` }));
    const dag = renderPillDag(dagBox, c, D.layouts[c.case_id] || { pos: {}, arcs: [] }, { onSelect: id => sel(id), refThumb: c.inputs[0] && c.inputs[0].s });
    jsonBtn.addEventListener('click', () => { sel('__json'); });
    function sel(id) { dag.select(id && !id.startsWith('__') ? id : null); renderDetail(c, id, detail, dag.graph, best); }
    sel((c.nodes.find(n => n.op === 'Reason') || c.nodes.find(n => n.op === 'SearchText') || c.nodes[0]).id);
  }
  const list = items => h('ul', {}, items.map(t => h('li', {}, t)));
  const sec = t => h('h5', {}, t);
  function head(el, iconOp, name, sub, right) {
    el.append(h('div', { class: 'det-head', html: (iconOp ? opIcon(iconOp, 28) : '') + `<div><div class="det-op">${esc(name)}</div>${sub ? `<div class="det-sig">${esc(sub)}</div>` : ''}</div>${right ? `<div class="det-reads">${esc(right)}</div>` : ''}` }));
  }
  function renderDetail(c, id, el, g, best) {
    el.innerHTML = '';
    el.scrollTop = 0;
    if (id === '__json') {
      head(el, null, 'Plan JSON', 'as written by the agent');
      el.append(h('div', { class: 'plan-json' }, h('pre', {}, JSON.stringify(c.plan_json, null, 1))));
      return;
    }
    if (id === '__checks') {
      head(el, 'Generate', 'Final visual checks', 'yes/no questions from the request, the facts and the prompt');
      const rounds = c.checks;
      const items = rounds.map((r, k) => ({ src: r.image && r.image.l, thumb: r.image && r.image.s, title: k ? `Regeneration ${k}` : 'Plan output', score: `${Math.round(100 * (r.pass_ratio ?? 0))}% of checks` }));
      const grid = h('div', { class: 'rounds' }, rounds.map((r, k) => { const im = h('img', { src: r.image ? r.image.s : '', alt: items[k].title }); im.addEventListener('click', () => openLB(items, k)); return h('div', { class: 'round' + (k === best ? ' pass' : '') }, im, h('div', { class: 'r-label', html: `<span class="pip ${r.correct ? 'ok' : 'no'}"></span>${k ? `Regen ${k}` : 'Plan'} · <b>${Math.round(100 * (r.pass_ratio ?? 0))}%</b>` })); }));
      const fails = rounds.flatMap((r, k) => r.failed.map(t => h('li', {}, h('span', { class: 'r-tag' }, k ? `Regen ${k}` : 'Plan'), t)));
      el.append(h('div', { class: 'det-body det-cols' }, h('div', {}, sec('Candidates'), grid), h('div', {}, sec('Failed checks'), fails.length ? h('ul', { class: 'fails' }, fails) : h('p', { style: 'margin:0' }, 'None.'))));
      return;
    }
    if (id === '$refs') { head(el, '$refs', 'Input image', 'supplied with the request'); return; }
    const n = c.nodes.find(x => x.id === id), d = c.details[id] || {}, sig = SIG[n.op];
    const label = nid => { if (nid === '$refs') return 'the input image'; const op = (c.nodes.find(x => x.id === nid) || {}).op || nid; const same = c.nodes.filter(x => x.op === op); return same.length > 1 ? `${op} ${same.findIndex(x => x.id === nid) + 1}` : op; };
    const ins = g.edges.filter(e => e.to === id), outs = [...new Set(g.edges.filter(e => e.from === id).map(e => e.to))];
    const reads = ins.length ? `reads ${ins.map(e => `${e.type} from ${label(e.from)}`).join(', ')}` : 'reads the request';
    head(el, n.op, label(id), sig ? `${sig.inputs} → ${sig.output}` : '', reads + (outs.length ? ` · feeds ${outs.map(label).join(', ')}` : ''));
    const body = h('div', { class: 'det-body det-cols' });
    const one = () => body.classList.add('one');
    switch (d.kind) {
      case 'analyze':
        const noS = !c.nodes.some(x => x.op === 'SearchText'), noI = !c.nodes.some(x => x.op === 'SearchImage');
        body.append(h('div', {}, d.search_text.length ? [sec(`What to look up${noS ? ' (no search planned)' : ''}`), list(d.search_text)] : [], d.search_image.length ? [sec(`Reference images${noI ? ' (none planned)' : ''}`), list(d.search_image)] : []),
          h('div', {}, d.reason.length ? [sec('What to reason about'), list(d.reason)] : []));
        break;
      case 'search':
        body.append(h('div', {}, sec('Query'), d.queries.map(q => h('div', { class: 'q' }, q))),
          h('div', {}, sec(`Top hits (${d.hits.length})`), d.hits.map(x => h('div', { class: 'hit-item' }, h('div', { class: 'hit-title' }, x.title), h('div', { class: 'hit-dom' }, x.domain), (x.snippet.split(' ').length / Math.max(1, x.snippet.length)) > .1 ? h('div', { class: 'hit-snip' }, x.snippet) : null))));
        break;
      case 'search_image':
        one(); body.append(h('div', {}, sec('Queries'), d.queries.map(q => h('div', { class: 'q' }, q)), h('p', {}, `${d.count} reference images were retrieved and passed on.`)));
        break;
      case 'reason':
        body.append(h('div', {}, sec('Questions'), list(d.targets)), h('div', {}, sec(`Inferred facts (${d.facts.length})`), list(d.facts)));
        break;
      case 'decompose':
        body.append(h('div', {}, sec('Entities'), list(d.entities)), h('div', {}, sec(`Checklist (${d.constraints.length})`), h('ul', {}, d.constraints.map(x => h('li', {}, h('span', { class: 'tag' }, x.type), x.text)))));
        break;
      case 'style':
        one(); body.append(h('div', {}, sec('Selected pattern'), h('p', { style: 'margin:0' }, `${(d.summary || '').replace(/^[\w-]+:\s*/, '')}${d.family ? ` (layout family: ${d.family})` : ''}`)));
        break;
      case 'rewrite':
        one(); body.append(h('div', {}, sec('Generation prompt'), h('div', { class: 'prompt-box' }, d.prompt)));
        break;
      case 'generate': {
        one();
        const im = h('img', { src: d.image ? d.image.s : '', alt: '', style: 'width:150px;border-radius:6px;cursor:zoom-in' });
        im.addEventListener('click', () => openLB([{ src: d.image.l, title: 'Generate output', prompt: 'Before the final checks' }]));
        body.append(h('div', { style: 'display:flex;gap:16px;align-items:flex-start' }, d.image ? im : null, h('p', { style: 'margin:0' }, d.refs ? `Generated from the rewritten prompt with ${d.refs} reference image${d.refs > 1 ? 's' : ''}.` : 'Generated from the rewritten prompt.')));
        break;
      }
      case 'refine': {
        const items = d.rounds.map((r, k) => ({ src: r.image && r.image.l, thumb: r.image && r.image.s, title: `RefineLoop round ${k + 1}`, score: r.verify ? `${r.verify.passed}/${r.verify.total} checks` : '' }));
        const grid = h('div', { class: 'rounds' }, d.rounds.map((r, k) => { const ok = r.verify && r.verify.passed === r.verify.total; const im = h('img', { src: r.image ? r.image.s : '', alt: items[k].title }); im.addEventListener('click', () => openLB(items, k)); return h('div', { class: 'round' + (ok ? ' pass' : '') }, im, h('div', { class: 'r-label', html: `<span class="pip ${ok ? 'ok' : 'no'}"></span>R${k + 1} · <b>${r.verify ? `${r.verify.passed}/${r.verify.total}` : '—'}</b>` })); }));
        const fails = d.rounds.flatMap((r, k) => (r.verify ? r.verify.failed.map(t => h('li', {}, h('span', { class: 'r-tag' }, `R${k + 1}`), t)) : []));
        body.append(h('div', {}, sec(`Rounds${d.checklist_size ? ` · ${d.checklist_size}-item checklist` : ''}`), grid),
          h('div', {}, sec('Failed checks that drove revision'), fails.length ? h('ul', { class: 'fails' }, fails) : h('p', { style: 'margin:0' }, 'None: the first image passed every item.')));
        break;
      }
      default: one(); body.append(h('p', {}, 'No recorded output for this node.'));
    }
    el.append(body);
  }
  show(0);
})();

/* ------------------------------------------------------------------ main results */
const BENCHES = [['wise', 'WISE'], ['geneval2', 'GenEval2'], ['corebench', 'T2I-CoReBench'], ['agentgen', 'AgentGen-Bench'], ['mindbench', 'Mind-Bench']];
const COLOR_OF = n => n.startsWith('GenDAG w/ Qwen') ? '#2a78d6' : n.startsWith('GenDAG w/ GPT') ? '#184f95' : (n === 'GPT-Image-2' || n === 'Nano Banana Pro') ? '#8a96a8' : '#c9d1dc';
(function mainResults() {
  let bench = 'wise', mb = 'mb_all';
  const chart = $('#main-chart'), mbTabs = $('#mb-tabs'), tableEl = $('#main-table'), tgl = $('#table-toggle');
  legend($('#main-legend'), [['#2a78d6', 'GenDAG w/ Qwen-Image-2.1'], ['#184f95', 'GenDAG w/ GPT-Image-2'], ['#8a96a8', 'Commercial generators'], ['#c9d1dc', 'Qwen-Image-2.1 and open agents']]);
  seg($('#bench-tabs'), BENCHES, bench, k => { bench = k; draw(); });
  seg(mbTabs, [['mb_all', 'All'], ['mb_t2i', 'T2I'], ['mb_i2i', 'I2I']], mb, k => { mb = k; draw(); });
  const dq = D.tables.backends.find(r => r.group === 'Backend: Qwen-Image-2.1' && r.name.startsWith('Δ'));
  let method = 'GenDAG w/ Qwen-Image-2.1';
  const samplesEl = $('#main-samples');
  function drawSamples() {
    const key = bench === 'mindbench' ? mb : bench;
    const group = bench !== 'mindbench' ? bench : { mb_all: 'mindbench_all', mb_t2i: 'mindbench_t2i', mb_i2i: 'mindbench_i2i' }[key];
    const sb = bench === 'mindbench' ? 'mindbench' : bench;
    const name = method.replace('†', '');
    const rows = (D.samples[group] || {})[method] || [];
    const items = rows.map(r => ({ src: r.img.l, thumb: r.img.s, title: name, score: `${METRIC[sb]} ${scoreText(sb, r.v)}${sb === 'wise' || sb === 'mindbench' ? '' : ' / 100'}`, prompt: r.prompt }));
    samplesEl.innerHTML = '';
    const where = `${BENCHES.find(b => b[0] === bench)[1]}${bench === 'mindbench' && key !== 'mb_all' ? ` ${key === 'mb_i2i' ? 'I2I' : 'T2I'}` : ''}`;
    samplesEl.append(h('div', { class: 'samples-head' }, h('b', {}, name), ` on ${where}: six first-execution results sampled to reflect its overall score${bench === 'agentgen' ? ' (English prompts)' : ''}. Click any row above to switch methods.`));
    const strip = h('div', { class: 'samples' });
    if (!rows.length) strip.append(h('div', { class: 'g-tile empty', style: 'grid-column: 1 / -1; aspect-ratio: auto; padding: 18px' }, 'No image inputs, so no results on this split.'));
    rows.forEach((r, i) => {
      const st = scoreText(sb, r.v), low = (sb === 'wise' || sb === 'mindbench') && r.v < .5;
      const t = h('button', { class: 'g-tile', 'aria-label': `${name} sample ${i + 1}`, title: r.prompt }, h('img', { src: r.img.s, alt: '', loading: 'lazy' }), st ? h('span', { class: 'badge' + (low ? ' low' : '') }, st) : null);
      t.addEventListener('click', () => openLB(items, i));
      if ((r.inputs || []).length) {
        const inset = h('span', { class: 'inset', title: 'Input image', role: 'button' }, h('img', { src: r.inputs[0].s, alt: 'Input image' }));
        inset.addEventListener('click', ev => { ev.stopPropagation(); openLB([{ src: r.inputs[0].l, title: 'Input image', prompt: r.prompt }]); });
        t.append(inset);
      }
      strip.append(t);
    });
    samplesEl.append(strip);
  }
  function draw() {
    mbTabs.hidden = bench !== 'mindbench'; $('#mb-note').hidden = bench !== 'mindbench';
    const key = bench === 'mindbench' ? mb : bench, dKey = { mb_all: 'mindbench' }[key] || key;
    const rows = D.tables.main.filter(r => r[key] != null).map(r => ({ ...r, v: r[key], t2iOnly: r.name.endsWith('†') && key === 'mb_all' })).sort((a, b) => b.v - a.v);
    if (!rows.some(r => r.name === method)) method = 'GenDAG w/ Qwen-Image-2.1';
    const W = 1000, lab = 244, bh = 21, gap = 9, top = 4, xw = W - lab - 64;
    let s = '';
    let grid = '';
    [0, 25, 50, 75, 100].forEach(t => { const x = lab + xw * t / 100; grid += `<line x1="${x}" x2="${x}" y1="0" y2="${top + rows.length * (bh + gap)}" stroke="#e9ecf0" pointer-events="none"/>`; s += `<text x="${x}" y="${top + rows.length * (bh + gap) + 14}" text-anchor="middle" font-size="11.5" fill="#94a3b8">${t}</text>`; });
    rows.forEach((r, i) => {
      const y = top + i * (bh + gap), w = xw * r.v / 100, ours = r.name.startsWith('GenDAG'), name = r.name.replace('†', '');
      const dag = r.name === 'GenDAG w/ Qwen-Image-2.1' && dq[dKey] != null ? ` · ${sgn(dq[dKey])} over direct` : '';
      const sel = r.name === method;
      s += `<g class="mrow${sel ? ' sel' : ''}" data-name="${esc(r.name)}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="${esc(name)} ${f2(r.v)}" data-tip="${esc(`<b>${name}</b> · ${f2(r.v)}${dag}${r.t2iOnly ? '<br>text-to-image subset only' : ''}<br><span class='tt-sub'>Click to see its outputs below</span>`)}">`;
      s += `<rect class="rowbg" x="0" y="${y - gap / 2}" width="${W}" height="${bh + gap}" rx="7"/>`;
      if (sel) s += `<path d="M10,${y + bh / 2 - 5} l7,5 -7,5 z" fill="#2a78d6"/>`;
      s += `<text x="${lab - 10}" y="${y + bh / 2 + 4.5}" text-anchor="end" font-size="13" font-weight="${ours || sel ? 700 : 500}" fill="${ours || sel ? '#0f172a' : '#334155'}">${esc(name)}${r.name.endsWith('†') && bench === 'mindbench' && key !== 'mb_t2i' ? ' †' : ''}</text>`;
      s += `<path d="${barPath(lab, y, w, bh)}" fill="${COLOR_OF(r.name)}" ${r.t2iOnly ? 'fill-opacity=".45"' : ''}/>`;
      s += `<text x="${lab + w + 7}" y="${y + bh / 2 + 4.5}" font-size="13" font-weight="${ours || sel ? 700 : 500}" fill="#0f172a">${f2(r.v)}</text></g>`;
    });
    chart.innerHTML = svgEl(W, top + rows.length * (bh + gap) + 20, `<g class="grid">${grid}</g>` + s, 'System comparison');
    bindTips(chart);
    $$('.mrow', chart).forEach(el => {
      el.addEventListener('click', () => { method = el.dataset.name; draw(); });
      el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); method = el.dataset.name; draw(); $(`.mrow[data-name="${CSS.escape(method)}"]`, chart).focus(); } });
    });
    drawSamples();
  }
  function table() {
    const cols = [['wise', 'WISE'], ['geneval2', 'GenEval2'], ['corebench', 'T2I-CoReBench'], ['agentgen', 'AgentGen'], ['mb_t2i', 'Mind T2I'], ['mb_i2i', 'Mind I2I'], ['mb_all', 'Mind All']];
    const groups = [...new Set(D.tables.main.map(r => r.group))];
    let html = `<table class="data"><thead><tr><th>Method</th>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>`;
    for (const gname of groups) {
      const rs = D.tables.main.filter(r => r.group === gname), rank = {};
      for (const [k] of cols) { const vals = rs.filter(r => r[k] != null && !(k === 'mb_all' && r.name.endsWith('†'))).map(r => r[k]).sort((a, b) => b - a); rank[k] = [vals[0], vals[1]]; }
      html += `<tr class="group"><td colspan="${cols.length + 1}">${esc(gname)}</td></tr>`;
      for (const r of rs) {
        html += `<tr class="${r.name.startsWith('GenDAG') ? 'ours' : ''}"><td>${esc(r.name)}</td>` + cols.map(([k]) => {
          const v = r[k], ex = k === 'mb_all' && r.name.endsWith('†');
          return `<td class="${v == null || ex ? '' : v === rank[k][0] ? 'best' : v === rank[k][1] ? 'second' : ''}">${v == null ? '—' : f2(v)}</td>`;
        }).join('') + '</tr>';
      }
    }
    tableEl.innerHTML = html + '</tbody></table>';
  }
  tgl.addEventListener('click', () => {
    const open = tableEl.hidden;
    if (open && !tableEl.innerHTML) table();
    tableEl.hidden = !open; chart.hidden = open; $('#main-legend').hidden = open; $('#bench-tabs').hidden = open; mbTabs.hidden = open || bench !== 'mindbench';
    tgl.textContent = open ? 'Chart' : 'Table'; tgl.setAttribute('aria-expanded', String(open));
  });
  draw();
})();

/* ------------------------------------------------------------------ CoReBench dimensions (full width) */
(function coreChart() {
  const DIMS = [['Composition', [['MI', 'Multi-instance'], ['MA', 'Multi-attribute'], ['MR', 'Multi-relation'], ['TR', 'Text rendering']]],
    ['Reasoning', [['LR', 'Logical'], ['RR', 'Reconstructive'], ['HR', 'Hypothetical'], ['BR', 'Behavioral'], ['GR', 'Generalization'], ['CR', 'Commonsense'], ['AR', 'Analogical'], ['PR', 'Procedural']]]];
  const row = n => D.tables.core.find(r => r.name === n);
  const direct = row('Qwen-Image-2.1'), ours = row('GenDAG w/ Qwen-Image-2.1'), gpt = row('GPT-Image-2'), nbp = row('Nano Banana Pro');
  const delta = D.tables.core.find(r => r.group && r.group.startsWith('Open') && r.name.startsWith('Δ'));
  legend($('#core-legend'), [['#a3afc0', 'Qwen-Image-2.1', 'dot'], ['#2a78d6', 'GenDAG w/ Qwen-Image-2.1', 'dot'], ['#eb6834', 'GPT-Image-2', 'ring'], ['#1baf7a', 'Nano Banana Pro', 'ring']]);
  // two panels side by side: composition (4) and reasoning (8) share one x scale; rows sized so both panels end together
  const W = 1000, gap = 40, pw = (W - gap) / 2, lab = 116, dcol = 56, xw = pw - lab - dcol, rows = 8, rh = 27, top = 22;
  let s = '';
  DIMS.forEach(([gname, dims], pi) => {
    const x0 = pi * (pw + gap), X = v => x0 + lab + xw * v / 100;
    const step = rh;
    const extra = pi === 0 ? [['C-Avg', 'Composition avg'], ['R-Avg', 'Reasoning avg'], ['All', 'Overall']] : [];
    s += `<text x="${x0}" y="12" font-size="11.5" font-weight="650" fill="#64748b" letter-spacing=".06em">${gname.toUpperCase()}</text><text x="${x0 + pw}" y="12" text-anchor="end" font-size="11" fill="#94a3b8">Δ</text>`;
    [0, 25, 50, 75, 100].forEach(t => { s += `<line x1="${X(t)}" x2="${X(t)}" y1="${top}" y2="${top + rows * rh}" stroke="#eef0f3"/><text x="${X(t)}" y="${top + rows * rh + 14}" text-anchor="middle" font-size="10.5" fill="#94a3b8">${t}</text>`; });
    dims.forEach(([k, label], i) => {
      const cy = top + step * (i + .5), a = direct[k], b = ours[k], d = delta[k];
      s += `<g class="hit" data-tip="${esc(`<b>${label}</b><br>Qwen-Image-2.1 ${f2(a)} → GenDAG ${f2(b)} (${sgn(d)})<br><span class='tt-sub'>GPT-Image-2 ${f2(gpt[k])} · Nano Banana Pro ${f2(nbp[k])}</span>`)}"><rect x="${x0}" y="${cy - step / 2}" width="${pw}" height="${step}" fill="transparent"/>`;
      s += `<text x="${x0 + lab - 10}" y="${cy + 4}" text-anchor="end" font-size="12.5" fill="#334155">${label}</text>`;
      s += `<line x1="${X(Math.min(a, b))}" x2="${X(Math.max(a, b))}" y1="${cy}" y2="${cy}" stroke="#2a78d6" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`;
      s += `<circle cx="${X(gpt[k])}" cy="${cy}" r="4.5" fill="#fff" stroke="#eb6834" stroke-width="2.2"/><circle cx="${X(nbp[k])}" cy="${cy}" r="4.5" fill="#fff" stroke="#1baf7a" stroke-width="2.2"/>`;
      s += `<circle cx="${X(a)}" cy="${cy}" r="5" fill="#a3afc0" stroke="#fff" stroke-width="2"/><circle cx="${X(b)}" cy="${cy}" r="5.5" fill="#2a78d6" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="${x0 + pw}" y="${cy + 4}" text-anchor="end" font-size="12" font-weight="600" fill="#334155">${sgn(d)}</text></g>`;
    });
    if (extra.length) s += `<line x1="${x0}" x2="${x0 + pw}" y1="${top + rh * 4.5}" y2="${top + rh * 4.5}" stroke="#e5e7eb"/>`;
    extra.forEach(([k, label], i) => {
      const cy = top + rh * (5 + i + .5), a = direct[k], b = ours[k], d = delta[k];
      s += `<g class="hit" data-tip="${esc(`<b>${label}</b><br>Qwen-Image-2.1 ${f2(a)} → GenDAG ${f2(b)} (${sgn(d)})<br><span class='tt-sub'>GPT-Image-2 ${f2(gpt[k])} · Nano Banana Pro ${f2(nbp[k])}</span>`)}"><rect x="${x0}" y="${cy - rh / 2}" width="${pw}" height="${rh}" fill="transparent"/>`;
      s += `<text x="${x0 + lab - 10}" y="${cy + 4}" text-anchor="end" font-size="12.5" font-weight="650" fill="#0f172a">${label}</text>`;
      s += `<line x1="${X(Math.min(a, b))}" x2="${X(Math.max(a, b))}" y1="${cy}" y2="${cy}" stroke="#2a78d6" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`;
      s += `<circle cx="${X(gpt[k])}" cy="${cy}" r="4.5" fill="#fff" stroke="#eb6834" stroke-width="2.2"/><circle cx="${X(nbp[k])}" cy="${cy}" r="4.5" fill="#fff" stroke="#1baf7a" stroke-width="2.2"/>`;
      s += `<circle cx="${X(a)}" cy="${cy}" r="5" fill="#a3afc0" stroke="#fff" stroke-width="2"/><circle cx="${X(b)}" cy="${cy}" r="5.5" fill="#2a78d6" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="${x0 + pw}" y="${cy + 4}" text-anchor="end" font-size="12" font-weight="700" fill="#0f172a">${sgn(d)}</text></g>`;
    });
  });
  $('#core-chart').innerHTML = svgEl(W, top + rows * rh + 20, s, 'T2I-CoReBench by dimension');
  bindTips($('#core-chart'));
})();

/* ------------------------------------------------------------------ backend generalization */
(function backendChart() {
  const rows = D.tables.backends, groups = ['Backend: Qwen-Image-2.1', 'Backend: Qwen-Image-2512 / Edit-2511', 'Backend: GPT-Image-2'];
  const benches = [['wise', 'WISE'], ['geneval2', 'GenEval2'], ['corebench', 'T2I-CoReBench'], ['agentgen', 'AgentGen-Bench'], ['mindbench', 'Mind-Bench']];
  legend($('#backend-legend'), [['#a3afc0', 'Direct', 'dot'], ['#2a78d6', 'GenDAG with the same generator', 'dot']]);
  const W = 1000, lab = 118, gap = 28, pw = (W - lab - gap * 2) / 3, rh = 34, top = 30;
  let s = '';
  groups.forEach((gname, gi) => {
    const x0 = lab + gi * (pw + gap), xw = pw - 46, X = v => x0 + xw * v / 100;
    s += `<text x="${x0}" y="14" font-size="12.5" font-weight="650" fill="#0f172a">${esc(gname.replace('Backend: ', ''))}</text>`;
    [0, 50, 100].forEach(t => { s += `<line x1="${X(t)}" x2="${X(t)}" y1="${top - 6}" y2="${top + benches.length * rh - 8}" stroke="#eef0f3"/><text x="${X(t)}" y="${top + benches.length * rh + 6}" text-anchor="middle" font-size="10.5" fill="#94a3b8">${t}</text>`; });
    const dr = rows.find(r => r.group === gname && r.name === 'Direct'), gr = rows.find(r => r.group === gname && r.name === 'GenDAG'), dl = rows.find(r => r.group === gname && r.name.startsWith('Δ'));
    benches.forEach(([k, bl], bi) => {
      const cy = top + bi * rh + 6, a = dr[k], b = gr[k], d = dl[k];
      s += `<g class="hit" data-tip="${esc(`<b>${bl}</b> · ${gname.replace('Backend: ', '')}<br>Direct ${f2(a)} → GenDAG ${f2(b)} (${sgn(d)})`)}"><rect x="${x0 - 4}" y="${cy - rh / 2}" width="${pw}" height="${rh}" fill="transparent"/>`;
      s += `<line x1="${X(Math.min(a, b))}" x2="${X(Math.max(a, b))}" y1="${cy}" y2="${cy}" stroke="${d >= 0 ? '#2a78d6' : '#64748b'}" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`;
      s += `<circle cx="${X(a)}" cy="${cy}" r="4.6" fill="#a3afc0" stroke="#fff" stroke-width="2"/><circle cx="${X(b)}" cy="${cy}" r="5.2" fill="#2a78d6" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="${x0 + pw - 2}" y="${cy + 4}" text-anchor="end" font-size="12" font-weight="600" fill="#334155">${sgn(d)}</text></g>`;
      if (gi === 0) s += `<text x="${lab - 14}" y="${cy + 4}" text-anchor="end" font-size="12.5" fill="#334155">${bl}</text>`;
    });
  });
  $('#backend-chart').innerHTML = svgEl(W, top + benches.length * rh + 12, s, 'Backend generalization');
  bindTips($('#backend-chart'));
})();

/* ------------------------------------------------------------------ plan statistics heatmap */
(function heatmap() {
  const rows = D.tables.plan_stats;
  const cols = [['text', 'SearchText'], ['image', 'SearchImage'], ['reason', 'Reason'], ['refine', 'RefineLoop']];
  const NAMES = { 'CoReBench comp.': 'T2I-CoReBench · composition', 'CoReBench reas.': 'T2I-CoReBench · reasoning', 'AgentGen': 'AgentGen-Bench', 'Mind-Bench T2I': 'Mind-Bench · T2I', 'Mind-Bench I2I': 'Mind-Bench · I2I', 'All': 'All' };
  const ramp = ['#f5f8fc', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'];
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const colorAt = v => { const t = Math.max(0, Math.min(1, v / 100)) * (ramp.length - 1), i = Math.min(ramp.length - 2, Math.floor(t)), u = t - i, a = hex(ramp[i]), b = hex(ramp[i + 1]); return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * u)).join(',')})`; };
  const W = 1000, lab = 220, gap = 4, numW = 90, cw = (W - lab - 2 * numW - cols.length * gap) / cols.length, rh = 32, top = 34;
  let s = '';
  cols.forEach(([k, op], ci) => { const x = lab + ci * (cw + gap) + cw / 2; s += `<g transform="translate(${x - 46},${top - 28})">${opIcon(op, 18)}</g><text x="${x - 22}" y="${top - 14}" font-size="12.5" font-weight="650" fill="#0f172a">${op}</text>`; });
  const nx = lab + cols.length * (cw + gap);
  s += `<text x="${nx + numW / 2}" y="${top - 14}" text-anchor="middle" font-size="12.5" font-weight="650" fill="#0f172a">Nodes</text><text x="${nx + numW * 1.5}" y="${top - 14}" text-anchor="middle" font-size="12.5" font-weight="650" fill="#0f172a">Graphs</text>`;
  rows.forEach((r, ri) => {
    const all = r.name === 'All', y = top + ri * (rh + gap) + (all ? 8 : 0);
    if (all) s += `<line x1="0" x2="${W}" y1="${y - 6}" y2="${y - 6}" stroke="#e5e7eb"/>`;
    s += `<text x="${lab - 14}" y="${y + rh / 2 + 4.5}" text-anchor="end" font-size="13" font-weight="${all ? 700 : 500}" fill="#334155">${esc(NAMES[r.name] || r.name)}</text>`;
    cols.forEach(([k, op], ci) => {
      const v = r[k], x = lab + ci * (cw + gap);
      s += `<g class="hit" data-tip="${esc(`<b>${NAMES[r.name] || r.name}</b><br>${f2(v)}% of plans contain ${op}`)}"><rect x="${x}" y="${y}" width="${cw}" height="${rh}" rx="4" fill="${colorAt(v)}"/><text x="${x + cw / 2}" y="${y + rh / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${v > 52 ? '#fff' : '#0f172a'}">${v.toFixed(1)}%</text></g>`;
    });
    s += `<text x="${nx + numW / 2}" y="${y + rh / 2 + 4.5}" text-anchor="middle" font-size="12.5" fill="#334155">${f2(r.nodes)}</text><text x="${nx + numW * 1.5}" y="${y + rh / 2 + 4.5}" text-anchor="middle" font-size="12.5" fill="#334155">${Math.round(r.graphs)}</text>`;
  });
  $('#heatmap').innerHTML = `<div style="overflow-x:auto">${svgEl(W, top + rows.length * (rh + gap) + 10, s, 'Plan statistics').replace('<svg', '<svg style="min-width:700px"')}</div>`;
  bindTips($('#heatmap'));
})();

/* ------------------------------------------------------------------ DAG vs ReAct (two panels) */
(function policies() {
  const rows = D.tables.policies, groups = [...new Set(rows.map(r => r.group))];
  legend($('#policy-legend'), [['#c9d1dc', 'ReAct'], ['#2a78d6', 'GenDAG']]);
  const metrics = [['score', 'Score', 2, false], ['llm', 'LLM requests', 2, true], ['tokens_k', 'LLM tokens (k)', 1, true], ['search', 'Search requests', 2, true], ['image', 'Image requests', 2, true]];
  const W = 1000, gap = 40, pw = (W - gap) / 2, lab = 112, dcol = 62, xw = pw - lab - dcol - 40, bh = 12, mh = 2 * bh + 3 + 12, top = 22;
  let s = '';
  groups.forEach((gname, gi) => {
    const x0 = gi * (pw + gap), react = rows.find(r => r.group === gname && r.name === 'ReAct'), ours = rows.find(r => r.group === gname && r.name === 'Ours');
    s += `<text x="${x0}" y="12" font-size="12.5" font-weight="650" fill="#0f172a">${esc(gname)}</text><text x="${x0 + pw}" y="12" text-anchor="end" font-size="11" fill="#94a3b8">GenDAG vs. ReAct</text>`;
    metrics.forEach(([k, label, dp, perExec], mi) => {
      const y = top + mi * mh, scale = k === 'score' ? 100 : Math.max(react[k], ours[k]) * 1.04;
      s += `<text x="${x0 + lab - 10}" y="${y + bh + 3}" text-anchor="end" font-size="12.5" fill="#334155">${label}</text>`;
      [[react, '#c9d1dc', 'ReAct'], [ours, '#2a78d6', 'GenDAG']].forEach(([r, c, n], j) => {
        const yy = y + j * (bh + 3), w = xw * r[k] / scale;
        s += `<path class="hit" d="${barPath(x0 + lab, yy, w, bh, 3)}" fill="${c}" data-tip="${esc(`<b>${n}</b> · ${gname}<br>${label}${perExec ? ' per successful execution' : ''}: ${r[k].toFixed(dp)}`)}"/><text x="${x0 + lab + w + 5}" y="${yy + bh - 1.5}" font-size="11" fill="#334155">${r[k].toFixed(dp)}</text>`;
      });
      const d = k === 'score' ? ours[k] - react[k] : 100 * (ours[k] - react[k]) / react[k];
      s += `<text x="${x0 + pw}" y="${y + bh + 3}" text-anchor="end" font-size="12.5" font-weight="650" fill="#0f172a">${k === 'score' ? sgn(d) : sgn(d, 1) + '%'}</text>`;
    });
  });
  $('#policy-chart').innerHTML = svgEl(W, top + metrics.length * mh + 2, s, 'GenDAG vs ReAct') + '<p class="fine">Requests and tokens are averaged per successful execution.</p>';
  bindTips($('#policy-chart'));
})();

/* ------------------------------------------------------------------ gallery */
(function galleryView() {
  const grid = $('#gallery-grid'), tabs = $('#gallery-tabs'), all = $('#all-systems');
  const SHORT = { gpt: ['GPT-Image-2', 'commercial'], nbp: ['Nano Banana Pro', 'commercial'], direct: ['Qwen-Image-2.1', 'direct'], direct_pe: ['Qwen-Image-2.1', '+ PE'],
    gems: ['GEMS', 'agent'], mind_brush: ['Mind-Brush', 'agent'], genrouter: ['GenRouter', 'agent'], scope: ['SCOPE', 'agent'], ours: ['GenDAG', 'ours'] };
  let bench = 'wise';
  seg(tabs, BENCHES, bench, k => { bench = k; draw(); });
  all.addEventListener('change', draw);
  function draw() {
    const methods = D.methods.filter(m => all.checked || !['mind_brush', 'genrouter'].includes(m.key));
    const cols = `repeat(${methods.length}, minmax(0, 1fr))`;
    grid.innerHTML = '';
    grid.append(h('div', { class: 'g-header', style: `grid-template-columns:${cols}` }, methods.map(m => h('div', { class: m.key === 'ours' ? 'ours' : '' }, SHORT[m.key][0], h('small', {}, SHORT[m.key][1])))));
    D.gallery.filter(r => r.bench === bench).forEach(r => {
      const txt = h('span', { class: 'g-text', title: 'Click to expand' }, r.prompt);
      txt.addEventListener('click', () => txt.classList.toggle('open'));
      const tiles = h('div', { class: 'g-tiles', style: `grid-template-columns:${cols}` });
      const avail = methods.filter(m => r.cells[m.key]);
      const items = avail.map(m => { const c = r.cells[m.key]; return { src: c.img.l, thumb: c.img.s, title: m.name, score: c.score ? `${METRIC[r.bench]} ${c.score.text}${c.score.max === 100 ? ' / 100' : ''}` : '', prompt: r.prompt }; });
      methods.forEach(m => {
        const c = r.cells[m.key];
        if (!c) { tiles.append(h('div', { class: 'g-tile empty' }, 'no image input')); return; }
        const low = c.score && c.score.max === 1 && c.score.v < .5;
        const t = h('button', { class: 'g-tile' + (m.key === 'ours' ? ' ours' : ''), 'aria-label': `${m.name} image` }, h('img', { src: c.img.s, alt: m.name, loading: 'lazy' }), c.score ? h('span', { class: 'badge' + (low ? ' low' : '') }, c.score.text) : null);
        t.addEventListener('click', () => openLB(items, avail.indexOf(m)));
        tiles.append(t);
      });
      grid.append(h('div', { class: 'g-row' }, h('div', { class: 'g-prompt' }, h('span', { class: 'g-bench' }, r.bench_name), txt), tiles));
    });
  }
  draw();
})();

/* ------------------------------------------------------------------ direct vs GenDAG with each generator */
(function pairsView() {
  const root = $('#pairs'), present = [...new Set(D.pairs.map(p => p.bench))];
  const GEN = [['gpt', 'GPT-Image-2'], ['qwen2512', 'Qwen-Image-2512'], ['qwen21', 'Qwen-Image-2.1']];
  let gen = 'gpt', bench = present[0];
  seg($('#pair-gen'), GEN, gen, k => { gen = k; draw(); });
  seg($('#pair-tabs'), present.map(b => [b, BENCH_FULL[b]]), bench, k => { bench = k; draw(); });
  const fmt = sc => (sc ? `${sc.text}${sc.max === 100 ? ' / 100' : ''}` : '');
  function draw() {
    root.innerHTML = '';
    const gname = GEN.find(g => g[0] === gen)[1];
    D.pairs.filter(p => p.bench === bench && p.backends[gen]).forEach(p => {
      const b = p.backends[gen];
      const items = [{ src: b.direct.img.l, thumb: b.direct.img.s, title: `${gname} (direct)`, score: `${METRIC[p.bench]} ${fmt(b.direct.score)}`, prompt: p.prompt },
        { src: b.ours.img.l, thumb: b.ours.img.s, title: `GenDAG w/ ${gname}`, score: `${METRIC[p.bench]} ${fmt(b.ours.score)}`, prompt: p.prompt }];
      const fig = (it, i, cell) => {
        const low = cell.score && cell.score.max === 1 && cell.score.v < .5;
        const im = h('div', { class: 'im' + (i ? ' ours' : ''), role: 'button', tabindex: '0' }, h('img', { src: it.thumb, alt: it.title, loading: 'lazy' }), cell.score ? h('span', { class: 'badge' + (low ? ' low' : '') }, cell.score.text) : null);
        im.addEventListener('click', () => openLB(items, i));
        return h('figure', {}, im, h('figcaption', { class: i ? 'ours' : '' }, it.title));
      };
      const pr = h('p', { class: 'pair-prompt', title: 'Click to expand' }, p.prompt);
      pr.addEventListener('click', () => pr.classList.toggle('open'));
      root.append(h('div', { class: 'pair' }, h('div', { class: 'pair-imgs' }, fig(items[0], 0, b.direct), fig(items[1], 1, b.ours)), pr));
    });
  }
  draw();
})();
})();
