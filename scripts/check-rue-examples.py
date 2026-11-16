#!/usr/bin/env python3
"""Compile, test and format check the Rue examples in the docs.

Every ```rue block in docs/ is written to its own file and checked with the `rue` CLI:

- It must compile without errors or warnings. Unused items are allowed, since most examples only
  declare the items they show. If it has a `main` function, `rue build` must succeed as well.
- Any `test fn` in it must pass.
- It must already be formatted the way `rue fmt` formats it.

The info string after ```rue changes what's checked:

- ```rue ignore  Skip the block, such as a fragment that continues an earlier block, a file of a
                 multi-file example, or a definition that's only there to be read.
- ```rue error   The block deliberately shows an error, so it must fail to compile.
- ```rue warn    The block deliberately shows a warning, so warnings are allowed.
- ```rue nofmt   Don't check the formatting. Only use this where `rue fmt`'s output is clearly worse
                 to read, and say why in a comment next to the block.

The examples are written against the Rue version in `.rue-version`, and the CLI being used must be
that version.

Usage:
  scripts/check-rue-examples.py [PAGE.md ...] [--rue PATH]

  PAGE.md     Only check these pages (default: every page in docs/).
  --rue PATH  The `rue` binary to use (default: `rue` on PATH), for example one built from a local
              checkout to check the docs against an unreleased change.
"""

import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
VERSION_FILE = ROOT / ".rue-version"
FENCE = re.compile(r"^(\s*)```rue\b(.*)$")
MODES = {"ignore", "error", "warn", "nofmt"}


def parse_args(argv):
    pages, rue = [], "rue"
    i = 0
    while i < len(argv):
        if argv[i] == "--rue":
            rue = str(Path(argv[i + 1]).resolve())
            i += 2
        elif argv[i] in ("-h", "--help"):
            print(__doc__)
            sys.exit(0)
        else:
            pages.append(Path(argv[i]).resolve())
            i += 1
    return pages or sorted(DOCS.rglob("*.md")), rue


def extract(page):
    """Yields (line number, modes, code) for every rue block in a page."""
    lines = page.read_text().split("\n")
    i = 0
    while i < len(lines):
        match = FENCE.match(lines[i])
        i += 1
        if not match:
            continue
        indent, info = match.groups()
        start, body = i, []
        while i < len(lines) and not lines[i].strip().startswith("```"):
            line = lines[i]
            body.append(line[len(indent) :] if line.startswith(indent) else line)
            i += 1
        i += 1
        yield start, set(info.split()), "\n".join(body) + "\n"


def run(rue, args, cwd):
    result = subprocess.run([rue, *args], cwd=cwd, capture_output=True, text=True)
    return result.returncode, (result.stdout + result.stderr).strip()


def diagnostics(output, prefix):
    return [line for line in output.splitlines() if line.startswith(prefix)]


def cli_version(rue):
    """The version of the CLI, which `rue init` writes to the manifest it creates."""
    with tempfile.TemporaryDirectory() as tmp:
        code, output = run(rue, ["init", "project"], tmp)
        if code != 0:
            sys.exit(f"`{rue} init` failed:\n{output}")
        manifest = (Path(tmp) / "project" / "Rue.toml").read_text()
        match = re.search(r'^version\s*=\s*"([^"]+)"', manifest, re.M)
        if not match:
            sys.exit(f"Couldn't find the version in the manifest that `{rue} init` created")
        return match.group(1)


def check(rue, modes, code, tmp):
    """Returns the problems with a block, if any."""
    unknown = modes - MODES
    if unknown:
        return [f"Unknown info string {', '.join(sorted(unknown))} (expected one of {', '.join(sorted(MODES))})"]

    file = Path(tmp) / "main.rue"
    file.write_text(code)

    status, output = run(rue, ["test", "-A", "unused", "main.rue"], tmp)
    errors = diagnostics(output, "Error")
    warnings = diagnostics(output, "Warning")

    if "error" in modes:
        return [] if errors else ["Expected the block to fail to compile, but it compiled"]

    problems = []
    if errors or status != 0:
        problems.append(output or f"`rue test` exited with status {status}")
    elif warnings and "warn" not in modes:
        problems.extend(warnings)

    if not problems and re.search(r"\bfn\s+main\b", code):
        status, output = run(rue, ["build", "-A", "unused", "main.rue"], tmp)
        if status != 0:
            problems.append(f"`rue build` failed:\n{output}")

    if "nofmt" in modes:
        return problems

    status, output = run(rue, ["fmt", "--check", "main.rue"], tmp)
    if status != 0:
        run(rue, ["fmt", "main.rue"], tmp)
        problems.append(f"Not formatted. `rue fmt` formats it as:\n{file.read_text()}")

    return problems


def main():
    pages, rue = parse_args(sys.argv[1:])

    expected = VERSION_FILE.read_text().strip()
    actual = cli_version(rue)
    if actual != expected:
        sys.exit(
            f"The docs are written against Rue {expected} (see .rue-version), but `{rue}` is {actual}. "
            "Install the right version with `cargo install rue-cli --version "
            f"{expected}`, or pass a different binary with --rue."
        )

    checked = failed = 0
    for page in pages:
        relative = page.relative_to(ROOT)
        for line, modes, code in extract(page):
            if "ignore" in modes:
                continue
            checked += 1
            with tempfile.TemporaryDirectory() as tmp:
                problems = check(rue, modes, code, tmp)
            if problems:
                failed += 1
                print(f"{relative}:{line}")
                for problem in problems:
                    print("    " + problem.replace("\n", "\n    "))

    print(f"Checked {checked} examples against Rue {actual}: {checked - failed} passed, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
