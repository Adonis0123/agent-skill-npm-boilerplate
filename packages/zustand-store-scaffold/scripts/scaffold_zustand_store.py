#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys

NAME_RE = re.compile(r"^[A-Z][A-Za-z0-9]*$")


def to_camel(name: str) -> str:
    return name[:1].lower() + name[1:]


def render_template(template: str, values: dict[str, str]) -> str:
    rendered = template
    for key, value in values.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", value)
    return rendered


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(str(path))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scaffold Zustand stores following repo patterns.",
    )
    parser.add_argument("--pattern", choices=["web", "core"], required=True)
    parser.add_argument(
        "--name",
        required=True,
        help="PascalCase store name, e.g. ToolList",
    )
    parser.add_argument("--path", required=True, help="Target directory for the store")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    if not NAME_RE.match(args.name):
        print("Error: --name must be PascalCase (e.g. ToolList).", file=sys.stderr)
        return 2

    store_name = args.name
    values = {
        "StoreName": store_name,
        "storeName": to_camel(store_name),
        "ContextName": f"{store_name}Context",
        "ProviderName": f"{store_name}Provider",
        "StoreType": f"{store_name}Store",
        "StateType": f"{store_name}StoreState",
        "ActionsType": f"{store_name}StoreActions",
        "PropsType": f"{store_name}Props",
    }

    skill_root = Path(__file__).resolve().parents[1]
    template_root = skill_root / "assets" / "templates" / args.pattern

    if args.pattern == "web":
        file_map = {
            "index.ts": template_root / "index.ts.tpl",
            "context.ts": template_root / "context.ts.tpl",
            "provider.tsx": template_root / "provider.tsx.tpl",
        }
    else:
        file_map = {
            "index.ts": template_root / "index.ts.tpl",
            "slices/core.ts": template_root / "slices" / "core.ts.tpl",
        }

    target_root = Path(args.path).expanduser()

    for rel_path, template_path in file_map.items():
        if not template_path.exists():
            print(f"Missing template: {template_path}", file=sys.stderr)
            return 3
        template = template_path.read_text(encoding="utf-8")
        content = render_template(template, values)
        output_path = target_root / rel_path
        try:
            write_file(output_path, content, args.force)
        except FileExistsError:
            print(f"File exists (use --force to overwrite): {output_path}", file=sys.stderr)
            return 4
        print(f"Created {output_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
