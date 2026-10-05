#!/usr/bin/env python3
"""Extract Archer's essay text and the numbers inside the downloaded JSON."""

import json
import re
import statistics
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path("/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/engineering/engineers/heron")
HTML = Path(
    "/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/pages/"
    "archerhume-jevs-architecture-unmasked.html"
)
DATA = ROOT / "data" / "archerhume"
CAPTURES = ROOT / "captures"


class Essay(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.started = False
        self.done = False
        self.blocks = []
        self.buf = []
        self.block = None
        self.list_stack = []
        self.katex = 0
        self.katex_ann = []
        self.in_ann = False
        self.skip_katex_html = 0
        self.href = None
        self.in_a = 0
        self.a_buf = []
        self.in_code = 0
        self.in_strong = 0
        self.in_em = 0
        self.pending_fig = None

    def _text(self, s):
        if self.done or not self.started:
            return
        if self.in_a:
            self.a_buf.append(s)
            return
        if self.block is None:
            return
        self.buf.append(s)

    def handle_starttag(self, tag, attrs):
        if self.done:
            return
        ad = {k: (v or "") for k, v in attrs}
        cls = ad.get("class", "")
        if tag in {"script", "style", "svg", "noscript"}:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "h1" and not self.started:
            self.started = True
        if not self.started:
            return
        if self.katex:
            if tag == "annotation":
                self.in_ann = True
                self.katex_ann = []
            return
        if tag == "span" and "katex" in cls.split() and "katex-html" not in cls and "katex-mathml" not in cls:
            self.katex = 1
            self.katex_ann = []
            return
        if tag == "span" and "katex-html" in cls:
            self.skip_katex_html += 1
            return
        if self.skip_katex_html:
            return
        if tag in {"h1", "h2", "h3", "h4"}:
            self._flush()
            self.block = tag
            self.buf = []
            return
        if tag == "p":
            self._flush()
            self.block = "p"
            self.buf = []
            if "italic" in cls and "Archer" in ad.get("class", ""):
                pass
            return
        if tag == "li":
            self._flush()
            self.block = "li"
            self.buf = []
            return
        if tag in {"ul", "ol"}:
            self.list_stack.append(tag)
            return
        if tag == "figure":
            self._flush()
            label = ad.get("aria-label") or cls
            self.pending_fig = label
            return
        if tag == "figcaption":
            self._flush()
            self.block = "figcaption"
            self.buf = []
            return
        if tag == "blockquote":
            self._flush()
            self.block = "blockquote"
            self.buf = []
            return
        if tag == "br":
            self._text("\n")
            return
        if tag == "a":
            self.in_a += 1
            self.href = ad.get("href", "")
            self.a_buf = []
            return
        if tag == "code":
            self.in_code += 1
            self._text("`")
            return
        if tag == "strong":
            self.in_strong += 1
            self._text("**")
            return
        if tag == "em":
            self.in_em += 1
            self._text("*")
            return
        if tag == "sup":
            return

    def handle_endtag(self, tag):
        if tag in {"script", "style", "svg", "noscript"} and self.skip:
            self.skip -= 1
            return
        if self.skip or self.done:
            return
        if self.katex:
            if tag == "annotation":
                self.in_ann = False
            if tag == "span":
                self.katex -= 1
                if self.katex == 0:
                    tex = "".join(self.katex_ann).strip()
                    self._text(f"${tex}$" if tex else "")
            return
        if self.skip_katex_html:
            if tag == "span":
                self.skip_katex_html -= 1
            return
        if not self.started:
            return
        if tag in {"h1", "h2", "h3", "h4", "p", "li", "figcaption", "blockquote"}:
            self._flush()
            return
        if tag in {"ul", "ol"} and self.list_stack:
            self.list_stack.pop()
            return
        if tag == "a" and self.in_a:
            self.in_a -= 1
            label = "".join(self.a_buf).strip()
            href = self.href or ""
            if label in {str(i) for i in range(1, 40)} and href.startswith("#ref-"):
                self._text(f"[{label}]")
            elif href and not href.startswith("#") and label:
                self._text(f"[{label}]({href})")
            else:
                self._text(label)
            self.a_buf = []
            return
        if tag == "code" and self.in_code:
            self.in_code -= 1
            self._text("`")
            return
        if tag == "strong" and self.in_strong:
            self.in_strong -= 1
            self._text("**")
            return
        if tag == "em" and self.in_em:
            self.in_em -= 1
            self._text("*")
            return
        if tag == "footer":
            self.done = True

    def handle_data(self, data):
        if self.skip or self.done:
            return
        if self.in_ann:
            self.katex_ann.append(data)
            return
        if self.katex or self.skip_katex_html:
            return
        if not self.started:
            return
        if data.strip() == "¶":
            return
        self._text(data)

    def _flush(self):
        if self.block is None:
            return
        raw = "".join(self.buf)
        text = re.sub(r"[ \t]+\n", "\n", raw)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]{2,}", " ", text)
        text = text.strip()
        text = text.replace("** ", "**").replace(" **", "**")
        text = re.sub(r"\*\*\s*\*\*", "", text)
        if text:
            kind = self.block
            if kind == "li":
                indent = "  " * max(0, len(self.list_stack) - 1)
                self.blocks.append(indent + "- " + text)
            elif kind == "h1":
                self.blocks.append("# " + text)
            elif kind == "h2":
                self.blocks.append("\n## " + text)
            elif kind == "h3":
                self.blocks.append("\n### " + text)
            elif kind == "h4":
                self.blocks.append("\n#### " + text)
            elif kind == "blockquote":
                self.blocks.append("> " + text.replace("\n", "\n> "))
            elif kind == "figcaption":
                note = ""
                if self.pending_fig:
                    note = f"\n\nOmitted figure ({self.pending_fig[:180]})."
                    self.pending_fig = None
                self.blocks.append(text + note)
            else:
                self.blocks.append(text)
            if text.startswith("— Archer") or text.startswith("—Archer"):
                self.done = True
        elif self.pending_fig and self.block == "figcaption":
            self.blocks.append(f"[Omitted figure: {self.pending_fig[:180]}]")
            self.pending_fig = None
        self.block = None
        self.buf = []


def write_essay():
    html = HTML.read_text()
    parser = Essay()
    parser.feed(html)
    body = "\n\n".join(parser.blocks)
    body = re.sub(r"\n{3,}", "\n\n", body)
    header = """# Jev’s Architecture Unmasked

> Text extract of Archer Hume’s essay. Source page: https://archerhume.com/posts/jevs-architecture-unmasked/?v=3
> Local HTML read: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/pages/archerhume-jevs-architecture-unmasked.html`
> Extracted 2026-10-01. Charts and the opening diagram are omitted.
>
> **The architecture diagram is the author’s reconstruction.** It is not a measurement and not a TypeSafe diagram. The essay separates published evidence, observed evidence, and inference. This copy keeps that separation. The sparse-expert guess is not a fact.

"""
    # drop duplicate h1 from body if present
    body = re.sub(r"^# Jev’s Architecture Unmasked\n+", "", body)
    path = CAPTURES / "jevs-architecture-unmasked.md"
    path.write_text(header + body.strip() + "\n")
    return path, path.stat().st_size, body.count("\n")


def med(xs):
    xs = [x for x in xs if isinstance(x, (int, float))]
    if not xs:
        return None
    return round(statistics.median(xs), 2)


def dump_numbers():
    lines = []
    A = lambda *a: lines.append(" ".join(str(x) for x in a))

    cal = json.loads((DATA / "calibration.json").read_text())
    A("## calibration")
    A("n", cal["n"], "ece", cal["ece"], "def", cal["definition"][:240])
    preds = cal["predictions"]
    correct = sum(1 for p in preds if p["correct"])
    A("accuracy", round(correct / len(preds), 4), "mean_p", round(sum(p["probability"] for p in preds) / len(preds), 4))
    A("n_ge_0.9", sum(1 for p in preds if p["probability"] >= 0.9), "n_eq_1", sum(1 for p in preds if p["probability"] == 1))
    for b in cal["bins"]:
        A("bin", b)

    ctx = json.loads((DATA / "context-limit.json").read_text())
    A("\n## context-limit meta", json.dumps(ctx["meta"])[:800])
    for t in ctx["trials"]:
        body = t.get("body")
        err = ""
        if isinstance(body, dict):
            err = json.dumps(body)[:180]
        elif isinstance(body, str):
            err = body[:180]
        A(
            "trial",
            t.get("label"),
            "status",
            t.get("status"),
            "in",
            t.get("in_tok"),
            "out",
            t.get("out_tok"),
            "server",
            t.get("server_ms"),
            "state_digits",
            t.get("state_digits"),
            "n_q",
            t.get("n_q"),
            "instr",
            t.get("instr_digits"),
            "long_q",
            t.get("long_q"),
            "body",
            err.replace("\n", " "),
        )

    ev = json.loads((DATA / "evidence.json").read_text())
    A("\n## evidence metadata", json.dumps(ev["metadata"], indent=0)[:2000])
    for key in [
        "benchmarks",
        "freshMath",
        "stateLength",
        "questionCount",
        "tokenAccounting",
        "optionOrder",
        "outputAccounting",
        "tokenizer",
        "iia",
        "questionIsolation",
        "optionVisibility",
        "noise",
        "confidence",
        "tokenizerDiagnostics",
    ]:
        A("\n###", key)
        obj = ev[key]
        if isinstance(obj, dict) and "rows" in obj:
            A("caveat/metric", json.dumps({k: obj[k] for k in obj if k != "rows"})[:1500])
            for row in obj["rows"]:
                A("row", json.dumps(row)[:500])
        else:
            A(json.dumps(obj)[:2500])

    fu = json.loads((DATA / "followup-summary.json").read_text())
    A("\n## followup-summary")
    A("attempted", fu["nAttempted"], "succeeded", fu["nSucceeded"], "unit", fu["sampleUnit"])
    for row in fu["relational"]:
        A("rel", json.dumps(row)[:400])
    for row in fu["odds"]:
        A("odds", json.dumps({k: row[k] for k in row if k != "logOddsByBlock"})[:300])
    for row in fu["pairedEffects"]:
        A("pair", json.dumps(row)[:500])

    lat = json.loads((DATA / "latency-rerun.json").read_text())
    A("\n## latency-rerun meta", json.dumps(lat["meta"]))
    groups = defaultdict(list)
    for t in lat["trials"]:
        groups[(t["sweep"], t["x"])].append(t)
    for k in sorted(groups, key=lambda z: (z[0], z[1])):
        ts = groups[k]
        A(
            "lat",
            k,
            "n",
            len(ts),
            "med_server",
            med([t["server_ms"] for t in ts]),
            "min_server",
            min(t["server_ms"] for t in ts),
            "max_server",
            max(t["server_ms"] for t in ts),
            "med_in",
            med([t["input_tokens"] for t in ts]),
            "med_out",
            med([t["output_tokens"] for t in ts]),
            "statuses",
            sorted({t["status"] for t in ts}),
        )

    oc = json.loads((DATA / "option-count-latency.json").read_text())
    A("\n## option-count main meta", json.dumps(oc["main"]["meta"])[:800])
    A("followup meta", json.dumps(oc["followup"]["meta"])[:800])
    g = defaultdict(list)
    for t in oc["main"]["trials"]:
        g[(t.get("n_q"), t.get("n_opt"), t.get("labels"))].append(t)
    for k in sorted(g, key=lambda z: (z[0] or 0, z[1] or 0, str(z[2]))):
        ts = g[k]
        A(
            "oc",
            k,
            "n",
            len(ts),
            "med_server",
            med([t.get("server_ms") for t in ts]),
            "med_in",
            med([t.get("input_tokens") or t.get("in_tok") for t in ts]),
            "med_out",
            med([t.get("output_tokens") or t.get("out_tok") for t in ts]),
            "keys",
            sorted(ts[0].keys()),
        )
    A("followup n", len(oc["followup"]["trials"]), "keys", sorted(oc["followup"]["trials"][0].keys()) if oc["followup"]["trials"] else None)
    fg = defaultdict(list)
    for t in oc["followup"]["trials"]:
        fg[json.dumps({k: t[k] for k in t if k in ("label", "kind", "name", "arm", "control", "n_opt", "n_q", "tag")}, sort_keys=True)[:200]].append(t)
    # print compact followup
    for t in oc["followup"]["trials"]:
        brief = {k: t[k] for k in t if k not in ("payload", "body", "response", "request")}
        A("ocf", json.dumps(brief)[:400])

    inj = json.loads((DATA / "option-injection.json").read_text())
    A("\n## option-injection meta", json.dumps(inj["meta"])[:1000])
    A("summary", json.dumps(inj["summary"])[:4000])
    A("phases type", type(inj["phases"]).__name__, "n", len(inj["phases"]) if hasattr(inj["phases"], "__len__") else "")
    if isinstance(inj["phases"], dict):
        A("phase keys", list(inj["phases"].keys())[:30])
    elif isinstance(inj["phases"], list) and inj["phases"]:
        A("phase0 keys", list(inj["phases"][0].keys()) if isinstance(inj["phases"][0], dict) else type(inj["phases"][0]))
        A("phase0", json.dumps(inj["phases"][0])[:500])

    pos = json.loads((DATA / "option-position.json").read_text())
    A("\n## option-position top", list(pos.keys()) if isinstance(pos, dict) else type(pos))
    if isinstance(pos, dict):
        for k, v in pos.items():
            if k != "trials" and not (isinstance(v, list) and len(v) > 5):
                A(k, json.dumps(v)[:1500])
        trials = pos.get("trials") or pos.get("results") or []
        if isinstance(trials, list) and trials and isinstance(trials[0], dict):
            A("ntrials", len(trials), "keys", sorted(trials[0].keys()))
            gg = defaultdict(list)
            # group by a few likely fields
            for t in trials:
                key = tuple(t.get(f) for f in ("n_opt", "nOptions", "position", "pos", "label", "arm", "correct_index") if f in t)
                gg[key].append(t)
            A("group count", len(gg))
            for k, ts in list(sorted(gg.items()))[:40]:
                A("posg", k, "n", len(ts), "sample", json.dumps({kk: ts[0][kk] for kk in ts[0] if kk not in ("payload", "body", "response", "request")})[:350])

    acc = json.loads((DATA / "output-token-accounting.json").read_text())
    A("\n## output-token top", list(acc.keys()) if isinstance(acc, dict) else type(acc))
    if isinstance(acc, dict):
        for k, v in acc.items():
            if isinstance(v, (str, int, float)) or (isinstance(v, dict) and len(json.dumps(v)) < 2000):
                A(k, json.dumps(v)[:1500])
            elif isinstance(v, list):
                A(k, "list", len(v), "item0", json.dumps(v[0])[:400] if v else None)
            elif isinstance(v, dict):
                A(k, "dict keys", list(v.keys())[:20])

    tok = json.loads((DATA / "tokenizer-fingerprint.json").read_text())
    A("\n## tokenizer top", list(tok.keys()) if isinstance(tok, dict) else type(tok))
    if isinstance(tok, dict):
        for k, v in tok.items():
            if isinstance(v, list):
                A(k, "list", len(v))
                if v and isinstance(v[0], dict):
                    A(" item keys", sorted(v[0].keys()))
                    A(" item0", json.dumps(v[0])[:400])
            else:
                s = json.dumps(v) if not isinstance(v, str) else v
                A(k, s[:1500])

    ft = json.loads((DATA / "followup-trials.json").read_text())
    A("\n## followup-trials", ft["date"], "planned", ft["plannedRequests"], "n", len(ft["trials"]), "notes", json.dumps(ft["notes"])[:800])
    exps = defaultdict(int)
    for t in ft["trials"]:
        exps[t.get("experiment")] += 1
    A("experiments", dict(exps))
    models = set()
    for t in ft["trials"]:
        resp = t.get("response") or {}
        if isinstance(resp, dict):
            models.add(resp.get("model") or resp.get("modelVersion"))
    A("response models", models)

    path = ROOT / "data" / "probe-log" / "numeric-extract.txt"
    path.write_text("\n".join(lines))
    return path, len(lines)


if __name__ == "__main__":
    p, n, lines = write_essay()
    print("essay", p, n, "newlines", lines)
    sp, sl = dump_numbers()
    print("stats", sp, "lines", sl)
