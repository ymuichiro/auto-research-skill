"""Measure one bilingual revision and check public source parity; does not judge prose quality."""
import html
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
BASELINE = "7567afbabd91518331036a3a100ef57e72c481b5"

class Body(HTMLParser):
    def __init__(self, raw):
        super().__init__(convert_charrefs=True)
        self.parts, self.urls, self.paragraphs, self.sections = [], [], 0, 0
        self.feed(raw)
    def handle_starttag(self, tag, attrs):
        if tag == "p": self.paragraphs += 1
        if tag == "section": self.sections += 1
        if tag == "a": self.urls.append(dict(attrs).get("href", ""))
    def handle_data(self, text):
        self.parts.append(text)
    def metrics(self):
        text = "".join(self.parts)
        return {"characters": len(re.sub(r"\s+", "", text)),
                "words": len(re.findall(r"[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*", text)),
                "paragraphs": self.paragraphs, "sections": self.sections,
                "body_citations": len(self.urls)}

article_id = sys.argv[1]
article = ROOT / "content/articles" / article_id
meta = json.loads((article / "meta.json").read_text())
public = {s["url"] for s in meta["publishedSources"]}
assert len(public) == len(meta["publishedSources"]), "duplicate public source"
assert all(s["publishedAt"] <= meta["date"] for s in meta["publishedSources"] if s.get("publishedAt")), "source after cutoff"
inventory = json.loads((OUT / f"{article_id}.sources.json").read_text())
eligible = {url for s in inventory["sources"] if s.get("eligible_for_target_date") is True
            for key in ("url", "public_url", "full_text_url", "final_url")
            if (url := s.get(key))}
assert public <= eligible, "public source lacks verified cutoff eligibility"
assert len(meta["seoDescriptionEn"]) <= 170
metrics, body_urls = {}, {}
for lang in ("ja", "en"):
    body = Body((article / f"body.{lang}.html").read_text())
    assert set(body.urls) == public, (lang, set(body.urls) ^ public)
    body_urls[lang] = set(body.urls)
    baseline = subprocess.check_output(["rtk", "proxy", "git", "show",
                                       f"{BASELINE}:content/articles/{article_id}/body.{lang}.html"],
                                      cwd=ROOT, text=True)
    metrics[lang] = body.metrics()
    metrics[lang]["baseline_characters"] = Body(baseline).metrics()["characters"]
assert body_urls["ja"] == body_urls["en"]
assert metrics["ja"]["paragraphs"] == metrics["en"]["paragraphs"]
assert metrics["ja"]["sections"] == metrics["en"]["sections"]
(OUT / f"{article_id}.metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2)+"\n")
print(json.dumps({"metrics":metrics,"source_parity":"passed","public_sources":len(public)},ensure_ascii=False))
