"""Parse scripts/build-quotes.mjs and emit data/quotes.json."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "build-quotes.mjs"
OUT = ROOT / "data" / "quotes.json"

QUOTE_RE = re.compile(r'\{ text: "(.*?)", author: "(.*?)" \}', re.DOTALL)


def extract_array(name: str, text: str) -> list[dict]:
    m = re.search(rf"const {name} = \[(.*?)\n\];", text, re.DOTALL)
    if not m:
        raise SystemExit(f"Could not find array: {name}")
    return [{"text": t, "author": a} for t, a in QUOTE_RE.findall(m.group(1))]


def extract_authors(text: str) -> dict:
    m = re.search(r"const authors = \{(.*?)\n\};", text, re.DOTALL)
    if not m:
        raise SystemExit("Could not find authors map")
    authors = {}
    for line in m.group(1).splitlines():
        line = line.strip().rstrip(",")
        if not line:
            continue
        km = re.match(r'"([^"]+)":\s*"(.*)"$', line)
        if km:
            authors[km.group(1)] = km.group(2)
            continue
        km = re.match(r"(\w+):\s*\"(.*)\"$", line)
        if km:
            authors[km.group(1)] = km.group(2)
    return authors


def normalize(s: str) -> str:
    return " ".join(s.lower().split())


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    authors = extract_authors(text)
    uplifting = extract_array("uplifting", text)
    cunning = extract_array("cunning", text)
    funny = extract_array("funny", text)

    for name, arr in [("uplifting", uplifting), ("cunning", cunning), ("funny", funny)]:
        if len(arr) != 100:
            print(f"ERROR {name}: expected 100, got {len(arr)}", file=sys.stderr)
            sys.exit(1)

    all_q = uplifting + cunning + funny
    seen: dict[str, dict] = {}
    dupes = []
    for q in all_q:
        key = normalize(q["text"])
        if key in seen:
            dupes.append(q["text"])
        else:
            seen[key] = q

    if dupes:
        print("ERROR duplicate quotes:", file=sys.stderr)
        for d in dupes:
            print(f"  {d}", file=sys.stderr)
        sys.exit(1)

    extra_authors = {
        "Thomas Edison": "1847–1931",
        "Steve Martin": "b. 1945",
        "A. Whitney Brown": "b. 1952",
        "Les Dawson": "1931–1993",
        "Paul Merton": "b. 1957",
        "Richard Dawkins": "b. 1941",
        "James A. Garfield": "1831–1881",
        "Charles Lamb": "1775–1834",
        "Deng Xiaoping": "1904–1997",
        "Fred Allen": "1894–1956",
        "Orson Welles": "1915–1985",
    }
    authors.update(extra_authors)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {"authors": authors, "uplifting": uplifting, "cunning": cunning, "funny": funny},
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT.relative_to(ROOT)} — {len(all_q)} quotes")


if __name__ == "__main__":
    main()
