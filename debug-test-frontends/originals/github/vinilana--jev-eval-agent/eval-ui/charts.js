// Shared chart + formatting helpers (used by index.html and slides.html)

// ---------- language ----------------------------------------------------------
// English is the default. Order of precedence: ?lang= in the URL > language embedded
// in a standalone export (window.__LANG__) > localStorage > "en".
const LANGS = ["en", "pt"];
let LANG = (() => {
  try { const q = new URLSearchParams(location.search).get("lang"); if (LANGS.includes(q)) { try { localStorage.setItem("lang", q); } catch {} return q; } } catch {}
  if (LANGS.includes(window.__LANG__)) return window.__LANG__;
  try { const s = localStorage.getItem("lang"); if (LANGS.includes(s)) return s; } catch {}
  return "en";
})();
const LOCALE = () => (LANG === "pt" ? "pt-BR" : "en-US");
document.documentElement.lang = LOCALE();
/** Switch language in place: persist, update <html lang>, re-render the page. */
function setLang(l) {
  if (!LANGS.includes(l) || l === LANG) return;
  LANG = l;
  try { localStorage.setItem("lang", l); } catch {}
  document.documentElement.lang = LOCALE();
  if (typeof render === "function") render();
}
/** Build a dictionary proxy: T.key resolves in the current language, falling back to English. */
const dict = (STR) => new Proxy({}, { get: (_, k) => STR[LANG]?.[k] ?? STR.en[k] ?? String(k) });
const CHART_STR = { en: { noData: "no data", attractive: "sweet spot" }, pt: { noData: "sem dados", attractive: "mais atraente" } };
const CT = dict(CHART_STR);

const fmt = (n, d = 0) => n == null || Number.isNaN(n) ? "–" : Number(n).toLocaleString(LOCALE(), { maximumFractionDigits: d });
const compact = (n) => n == null ? "–" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(Math.round(n));
const usd = (n) => n == null ? "–" : (LANG === "pt" ? "US$ " : "$") + n.toFixed(n < 0.01 ? 4 : 3);
const secs = (ms) => ms == null ? "–" : (ms / 1000).toFixed(1) + " s";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sum = (arr, f) => arr.reduce((a, r) => a + (f(r) ?? 0), 0);
const avg = (arr, f) => arr.length ? sum(arr, f) / arr.length : null;


// ---------- svg helpers -----------------------------------------------------
function niceTop(max) {
  if (!(max > 0)) return 1;
  if (max < 4) { const p = Math.pow(10, Math.floor(Math.log10(max))); const n = max / p; const step = n <= 1.2 ? 0.25 * p : n <= 2.5 ? 0.5 * p : p; return Math.ceil(max / step) * step; }
  const step = max <= 5 ? 1 : max <= 12 ? 2 : max <= 30 ? 5 : max <= 100 ? 20 : Math.pow(10, Math.floor(Math.log10(max))) / 2;
  return Math.ceil(max / step) * step;
}
function yTicks(top) { const n = 4; return Array.from({ length: n + 1 }, (_, i) => Math.round((top * i / n) * 100) / 100); }

/** grouped vertical bars: groups = x labels, series = [{label,color,values[],tip?}] */
function groupedBars({ groups, series, ideal, fmtV = (v) => fmt(v, 1), height = 230, W = 600 }) {
  const padL = 40, padR = 10, padT = 14, padB = 34, H = height;
  const vals = series.flatMap((s) => s.values).filter((v) => v != null);
  const top = niceTop(Math.max(1, ...vals, ...(ideal ? ideal.filter(Boolean) : [])));
  const y = (v) => padT + (H - padT - padB) * (1 - v / top);
  const gw = (W - padL - padR) / groups.length;
  const bw = Math.max(6, Math.min(34, (gw - 16) / series.length - 2));
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">`;
  s += `<g class="grid">${yTicks(top).map((t) => `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}"/><text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end">${compact(t)}</text>`).join("")}</g>`;
  s += `<g class="axis"><line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/></g>`;
  groups.forEach((g, i) => {
    const total = series.length * bw + (series.length - 1) * 2;
    const gx = padL + gw * i + (gw - total) / 2;
    series.forEach((sr, j) => {
      const v = sr.values[i];
      const x = gx + j * (bw + 2);
      if (v == null) { s += `<text x="${x + bw / 2}" y="${y(0) - 6}" text-anchor="middle" style="fill:var(--text-3)">–</text>`; return; }
      const h = Math.max(0, y(0) - y(v));
      s += `<rect class="bar" x="${x}" y="${y(v)}" width="${bw}" height="${h}" rx="3" fill="${sr.color}" data-tip="${esc(`${sr.label}\n${g}: ${fmtV(v)}`)}"/>`;
      if (h > 4) s += `<rect x="${x}" y="${y(0) - 3}" width="${bw}" height="3" fill="${sr.color}"/>`;
      if (series.length <= 4) s += `<text class="val" x="${x + bw / 2}" y="${y(v) - 4}" text-anchor="middle">${fmtV(v)}</text>`;
    });
    if (ideal && ideal[i]) s += `<line class="ideal" x1="${gx - 5}" x2="${gx + total + 5}" y1="${y(ideal[i])}" y2="${y(ideal[i])}"><title>ideal: ${ideal[i]}</title></line>`;
    s += `<text x="${padL + gw * i + gw / 2}" y="${H - padB + 16}" text-anchor="middle">${esc(g)}</text>`;
  });
  return s + `</svg>`;
}

/** horizontal bars: rows = [{label, value, color, tip?, sub?}] */
function hBars({ rows, fmtV = (v) => fmt(v), W = 560, rowH = 24, labelW = 200, stacked = false }) {
  const H = rows.length * rowH + 10;
  const hasSub = rows.some((r) => r.sub);
  const max = Math.max(1e-9, ...rows.map((r) => stacked ? sum(r.parts, (p) => p.value) : r.value ?? 0));
  const x0 = labelW, x1 = W - (hasSub ? 190 : 90);
  const x = (v) => x0 + (x1 - x0) * (v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${Math.max(60, H * 1.4)}px" role="img">`;
  rows.forEach((r, i) => {
    const y = 5 + i * rowH;
    s += `<text x="${x0 - 8}" y="${y + rowH / 2 + 4}" text-anchor="end" class="val">${esc(r.label)}</text>`;
    if (stacked) {
      let acc = 0;
      for (const p of r.parts) {
        if (!p.value) continue;
        s += `<rect class="bar" x="${x(acc) + (acc ? 2 : 0)}" y="${y + 5}" width="${Math.max(0, x(acc + p.value) - x(acc) - (acc ? 2 : 0))}" height="${rowH - 10}" rx="3" fill="${p.color}" data-tip="${esc(`${r.label}\n${p.label}: ${fmtV(p.value)}`)}"/>`;
        acc += p.value;
      }
      s += `<text x="${x(acc) + 6}" y="${y + rowH / 2 + 4}" class="val">${fmtV(acc)}</text>`;
    } else {
      s += `<rect class="bar" x="${x0}" y="${y + 5}" width="${Math.max(0, x(r.value) - x0)}" height="${rowH - 10}" rx="3" fill="${r.color}" data-tip="${esc(r.tip ?? `${r.label}: ${fmtV(r.value)}`)}"/>`;
      s += `<text x="${x(r.value) + 6}" y="${y + rowH / 2 + 4}" class="val">${fmtV(r.value)}${r.sub ? ` <tspan style="fill:var(--text-3)">${esc(r.sub)}</tspan>` : ""}</text>`;
    }
  });
  return s + `</svg>`;
}

/** donut: slices = [{label, value, color}] */
function donut({ slices, fmtV = (v) => fmt(v), size = 190, title = "" }) {
  const total = sum(slices, (s) => s.value);
  const R = size / 2 - 4, r = R * 0.62, cx = size / 2, cy = size / 2;
  let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">`;
  if (!total) return s + `<text x="${cx}" y="${cy}" text-anchor="middle">${CT.noData}</text></svg>`;
  for (const sl of slices) {
    if (!sl.value) continue;
    const a1 = a0 + (sl.value / total) * Math.PI * 2 - 0.02;
    const p = (a, rr) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    s += `<path class="slice" d="M${p(a0, R)} A${R},${R} 0 ${large} 1 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 ${large} 0 ${p(a0, r)} Z" fill="${sl.color}" data-tip="${esc(`${sl.label}: ${fmtV(sl.value)} (${fmt(sl.value / total * 100)}%)`)}"/>`;
    const mid = (a0 + a1) / 2;
    if (sl.value / total > 0.07) s += `<text class="val" x="${cx + (R + r) / 2 * Math.cos(mid)}" y="${cy + (R + r) / 2 * Math.sin(mid) + 4}" text-anchor="middle" style="font-size:10px">${fmt(sl.value / total * 100)}%</text>`;
    a0 = a1 + 0.02;
  }
  s += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" class="val" style="font-size:15px;font-weight:600">${fmtV(total)}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" style="font-size:10px">${esc(title)}</text>`;
  return s + `</svg>`;
}

/** scatter: pts = [{x,y,label,color}] */
function scatter({ pts, xLabel, yLabel, W = 600, H = 280, fmtX = compact, fmtY = (v) => fmt(v) }) {
  const padL = 44, padR = 16, padT = 14, padB = 40;
  const xMax = niceTop(Math.max(1, ...pts.map((p) => p.x))), yMax = niceTop(Math.max(1, ...pts.map((p) => p.y)));
  const x = (v) => padL + (W - padL - padR) * (v / xMax), y = (v) => padT + (H - padT - padB) * (1 - v / yMax);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">`;
  s += `<g class="grid">${yTicks(yMax).map((t) => `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}"/><text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end">${fmtY(t)}</text>`).join("")}${yTicks(xMax).map((t) => `<text x="${x(t)}" y="${H - padB + 16}" text-anchor="middle">${fmtX(t)}</text>`).join("")}</g>`;
  s += `<g class="axis"><line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/><line x1="${padL}" x2="${padL}" y1="${padT}" y2="${y(0)}"/></g>`;
  s += `<text x="${W - padR}" y="${H - 4}" text-anchor="end" style="fill:var(--text-3)">${esc(xLabel)} →</text><text x="${padL + 4}" y="${padT}" style="fill:var(--text-3)">↑ ${esc(yLabel)}</text>`;
  for (const p of pts) {
    s += `<circle class="pt" cx="${x(p.x)}" cy="${y(p.y)}" r="7" fill="${p.color}" stroke="var(--surface)" stroke-width="2" data-tip="${esc(`${p.label}\n${xLabel}: ${fmtX(p.x)} · ${yLabel}: ${fmtY(p.y)}`)}"/>`;
    const right = x(p.x) > W * 0.62;
    s += `<text class="val" x="${x(p.x) + (right ? -10 : 10)}" y="${y(p.y) + 4}" text-anchor="${right ? "end" : "start"}" style="font-size:10px">${esc(p.label)}</text>`;
  }
  return s + `</svg>`;
}


// ---------- comparison charts (dashboard) -------------------------------------
/** Hatch pattern defs, one per model color; reference as url(#hatch-<i>). */
function hatchDefs(colors) {
  return `<svg width="0" height="0" style="position:absolute"><defs>${colors.map((c, i) => `<pattern id="hatch-${i}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect width="7" height="7" fill="${c}" opacity=".28"/><line x1="0" y1="0" x2="0" y2="7" stroke="${c}" stroke-width="2.5"/></pattern>`).join("")}</defs></svg>`;
}

/**
 * Ranked horizontal bars (Artificial-Analysis style): rows sorted, fill per row,
 * optional highlight set (dims the rest), value labels at the end.
 * rows: [{label, value, fill, key, sub?}]
 */
function rankedBars({ rows, fmtV = (v) => fmt(v), W = 520, rowH = 28, labelW = 190, highlight = null, max = null, better = "high" }) {
  const H = rows.length * rowH + 8;
  const top = max ?? Math.max(1e-9, ...rows.map((r) => r.value ?? 0));
  const x0 = labelW, x1 = W - 84;
  const x = (v) => x0 + (x1 - x0) * (v / top);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H * 1.35}px" role="img">`;
  rows.forEach((r, i) => {
    const y = 4 + i * rowH;
    const dim = highlight && highlight.size && !highlight.has(r.key);
    const o = dim ? 0.28 : 1;
    s += `<g style="opacity:${o}" data-key="${esc(r.key ?? "")}"><text x="${x0 - 8}" y="${y + rowH / 2 + 4}" text-anchor="end" class="val">${esc(r.label)}</text>`;
    s += `<rect class="bar" x="${x0}" y="${y + 6}" width="${Math.max(2, x(r.value) - x0)}" height="${rowH - 12}" rx="3" fill="${r.fill}" data-key="${esc(r.key ?? "")}" data-tip="${esc(r.tip ?? `${r.label}: ${fmtV(r.value)}`)}"/>`;
    s += `<text x="${x(r.value) + 6}" y="${y + rowH / 2 + 4}" class="val">${fmtV(r.value)}${r.sub ? ` <tspan style="fill:var(--text-3)">${esc(r.sub)}</tspan>` : ""}</text></g>`;
  });
  return s + `</svg>`;
}

/**
 * Dumbbell: one row per group with two points (a → b) connected by a line.
 * rows: [{label, a, b, color, key}]
 */
function dumbbell({ rows, fmtV = (v) => fmt(v), W = 620, rowH = 34, labelW = 180, aLabel = "direto", bLabel = "jev", highlight = null }) {
  const H = rows.length * rowH + 30;
  const vals = rows.flatMap((r) => [r.a, r.b]).filter((v) => v != null);
  const top = niceTop(Math.max(1e-9, ...vals));
  const x0 = labelW, x1 = W - 70;
  const x = (v) => x0 + (x1 - x0) * (v / top);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H * 1.3}px" role="img">`;
  s += `<g class="grid">${yTicks(top).map((t) => `<line x1="${x(t)}" x2="${x(t)}" y1="4" y2="${H - 26}"/><text x="${x(t)}" y="${H - 10}" text-anchor="middle">${fmtV(t)}</text>`).join("")}</g>`;
  rows.forEach((r, i) => {
    const y = 8 + i * rowH + rowH / 2;
    const dim = highlight && highlight.size && !highlight.has(r.key);
    s += `<g style="opacity:${dim ? 0.28 : 1}"><text x="${x0 - 8}" y="${y + 4}" text-anchor="end" class="val">${esc(r.label)}</text>`;
    if (r.a != null && r.b != null) s += `<line x1="${x(r.a)}" x2="${x(r.b)}" y1="${y}" y2="${y}" stroke="${r.color}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
    if (r.a != null) s += `<circle cx="${x(r.a)}" cy="${y}" r="7" fill="${r.color}" stroke="var(--surface)" stroke-width="2" data-tip="${esc(`${r.label} · ${aLabel}: ${fmtV(r.a)}`)}"/>`;
    if (r.b != null) s += `<circle cx="${x(r.b)}" cy="${y}" r="7" fill="url(#hatch-${r.ci})" stroke="${r.color}" stroke-width="2" data-tip="${esc(`${r.label} · ${bLabel}: ${fmtV(r.b)}`)}"/>`;
    if (r.a != null && r.b != null) { const pct = r.a ? (r.b - r.a) / r.a : 0; s += `<text x="${Math.max(x(r.a), x(r.b)) + 12}" y="${y + 4}" class="val" style="font-size:10.5px">${pct > 0 ? "+" : ""}${fmt(pct * 100)}%</text>`; }
    s += `</g>`;
  });
  return s + `</svg>`;
}

/**
 * Heatmap matrix. rows: [{label,key}], cols: [labels], cells: (ri, ci) => {value, text} | null
 * scale: (value) => color
 */
function heatmap({ rows, cols, cell, scale, W = 700, rowH = 30, labelW = 210, highlight = null }) {
  const H = rows.length * rowH + 30;
  const cw = (W - labelW - 8) / cols.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H * 1.3}px" role="img">`;
  cols.forEach((c, j) => { s += `<text x="${labelW + j * cw + cw / 2}" y="16" text-anchor="middle">${esc(c)}</text>`; });
  rows.forEach((r, i) => {
    const y = 24 + i * rowH;
    const dim = highlight && highlight.size && !highlight.has(r.key);
    s += `<g style="opacity:${dim ? 0.28 : 1}"><text x="${labelW - 8}" y="${y + rowH / 2 + 4}" text-anchor="end" class="val">${esc(r.label)}</text>`;
    cols.forEach((c, j) => {
      const v = cell(i, j);
      const x = labelW + j * cw;
      if (!v) { s += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${rowH - 2}" rx="3" fill="var(--surface-2)"/><text x="${x + cw / 2}" y="${y + rowH / 2 + 4}" text-anchor="middle" style="fill:var(--text-3)">–</text>`; return; }
      s += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${rowH - 2}" rx="3" fill="${scale(v.value)}" data-tip="${esc(v.tip ?? `${r.label} · ${c}: ${v.text}`)}"/><text x="${x + cw / 2}" y="${y + rowH / 2 + 4}" text-anchor="middle" style="fill:${v.dark ? "#0b0b0b" : "#fff"};font-weight:600">${esc(v.text)}</text>`;
    });
    s += `</g>`;
  });
  return s + `</svg>`;
}

/** Scatter with a shaded "attractive" quadrant. pts: [{x,y,label,color,fill,key}] */
function quadrantScatter({ pts, xLabel, yLabel, W = 640, H = 340, fmtX = (v) => fmt(v), fmtY = (v) => fmt(v), highlight = null, quadrant = "top-left", quadLabel = CT.attractive }) {
  const padL = 46, padR = 16, padT = 16, padB = 42;
  const xMax = niceTop(Math.max(1e-9, ...pts.map((p) => p.x)) * 1.08), yMax = 100;
  const yMin = Math.max(0, Math.floor((Math.min(100, ...pts.map((p) => p.y)) - 12) / 10) * 10);
  const x = (v) => padL + (W - padL - padR) * (v / xMax), y = (v) => padT + (H - padT - padB) * (1 - (v - yMin) / (yMax - yMin));
  const xm = avg(pts, (p) => p.x) ?? xMax / 2, ym = avg(pts, (p) => p.y) ?? 50;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">`;
  if (quadrant === "top-left") s += `<rect x="${padL}" y="${padT}" width="${Math.max(0, x(xm) - padL)}" height="${Math.max(0, y(ym) - padT)}" fill="var(--lime)" opacity=".06"/><text x="${padL + 8}" y="${padT + 14}" style="fill:var(--lime)">${esc(quadLabel)}</text>`;
  const yt = []; for (let t = yMin; t <= yMax; t += (yMax - yMin) / 5) yt.push(Math.round(t));
  s += `<g class="grid">${yt.map((t) => `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}"/><text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end">${fmtY(t)}</text>`).join("")}${yTicks(xMax).map((t) => `<text x="${x(t)}" y="${H - padB + 16}" text-anchor="middle">${fmtX(t)}</text>`).join("")}</g>`;
  s += `<g class="axis"><line x1="${padL}" x2="${W - padR}" y1="${y(yMin)}" y2="${y(yMin)}"/><line x1="${padL}" x2="${padL}" y1="${padT}" y2="${y(yMin)}"/></g>`;
  s += `<line class="ideal" x1="${x(xm)}" x2="${x(xm)}" y1="${padT}" y2="${y(yMin)}"/><line class="ideal" x1="${padL}" x2="${W - padR}" y1="${y(ym)}" y2="${y(ym)}"/>`;
  s += `<text x="${W - padR}" y="${H - 4}" text-anchor="end" style="fill:var(--text-3)">${esc(xLabel)} →</text><text x="${padL + 4}" y="${H - padB - 4}" style="fill:var(--text-3)">↑ ${esc(yLabel)}</text>`;
  const placed = [];
  for (const p of pts) {
    const dim = highlight && highlight.size && !highlight.has(p.key);
    const right = x(p.x) > W * 0.6;
    let ly = y(p.y) + 4;
    // nudge labels apart vertically when they would overlap a previous one
    for (let guard = 0; guard < 12; guard++) { const clash = placed.find((q) => Math.abs(q.ly - ly) < 12 && Math.abs(q.lx - x(p.x)) < 150); if (!clash) break; ly = clash.ly + 12; }
    placed.push({ lx: x(p.x), ly });
    s += `<g style="opacity:${dim ? 0.25 : 1}"><circle class="pt" cx="${x(p.x)}" cy="${y(p.y)}" r="8" fill="${p.fill}" stroke="${p.color}" stroke-width="2" data-key="${esc(p.key)}" data-tip="${esc(`${p.label}\n${xLabel}: ${fmtX(p.x)} · ${yLabel}: ${fmtY(p.y)}`)}"/>${Math.abs(ly - (y(p.y) + 4)) > 6 ? `<line x1="${x(p.x) + (right ? -9 : 9)}" y1="${y(p.y)}" x2="${x(p.x) + (right ? -11 : 11)}" y2="${ly - 4}" stroke="var(--text-3)" stroke-width="1"/>` : ""}<text class="val" x="${x(p.x) + (right ? -12 : 12)}" y="${ly}" text-anchor="${right ? "end" : "start"}" style="font-size:10.5px">${esc(p.label)}</text></g>`;
  }
  return s + `</svg>`;
}
