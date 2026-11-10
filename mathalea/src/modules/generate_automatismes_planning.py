from __future__ import annotations

import json
import re
import zipfile
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "outputs" / "automatismes-3e"
OUTPUT_FILE = OUTPUT_DIR / "planning_automatismes_3e.xlsx"
ALEA_BASE_URL = "https://coopmaths.fr/alea/"

CATEGORIES = ["G", "I", "M", "N", "P", "L", "S"]
CATEGORY_LABELS = {
    "G": "Espace et géométrie",
    "I": "Algorithmique et programmation",
    "M": "Mesure",
    "N": "Nombres et calculs",
    "P": "Statistiques",
    "L": "Calcul littéral",
    "S": "Proportionnalité et fonctions",
}


def natural_key(ref: str) -> list[object]:
    return [int(part) if part.isdigit() else part for part in re.split(r"(\d+)", ref)]


def load_automatismes() -> list[dict[str, str]]:
    ref_to_uuid = json.loads((ROOT / "src/json/refToUuidFR.json").read_text())
    uuid_to_url = json.loads((ROOT / "src/json/uuidsToUrlFR.json").read_text())
    exercices = json.loads((ROOT / "src/json/exercicesFR.json").read_text())
    rows: list[dict[str, str]] = []
    for ref, uuid in ref_to_uuid.items():
        match = re.match(r"^3Auto([GIMNPLS])", ref)
        if not match:
            continue
        interactif = exercices.get(ref, {}).get("features", {}).get("interactif", {})
        if interactif.get("isActive") is not True:
            continue
        if interactif.get("type") == "'custom'":
            continue
        url = uuid_to_url.get(uuid)
        if not url:
            continue
        cat = match.group(1)
        rows.append(
            {
                "Catégorie": cat,
                "Domaine": CATEGORY_LABELS[cat],
                "Référence": ref,
                "UUID": uuid,
                "URL source": url,
            }
        )
    rows.sort(key=lambda row: (row["Catégorie"], natural_key(row["Référence"])))
    return rows


def build_schedule(
    automatismes: list[dict[str, str]],
) -> tuple[list[list[object]], list[list[object]]]:
    queues: dict[str, list[dict[str, str]]] = defaultdict(list)
    for item in automatismes:
        queues[item["Catégorie"]].append(item)

    total = len(automatismes)
    initial_counts = {cat: len(queues[cat]) for cat in CATEGORIES}
    used_counts = {cat: 0 for cat in CATEGORIES}
    introduced = 0

    calendar_rows: list[list[object]] = []
    cycle_rows: list[list[object]] = []
    cycle = 1

    while introduced < total:
        picked_this_cycle: list[dict[str, str]] = []
        categories_this_cycle: set[str] = set()

        for seance in range(1, 6):
            available = [
                cat for cat in CATEGORIES if queues[cat] and cat not in categories_this_cycle
            ]
            if not available:
                available = [cat for cat in CATEGORIES if queues[cat]]
            if not available:
                break

            slot = introduced + 1
            cat = max(
                available,
                key=lambda c: (
                    initial_counts[c] / total * slot - used_counts[c],
                    len(queues[c]),
                    -CATEGORIES.index(c),
                ),
            )
            item = queues[cat].pop(0)
            used_counts[cat] += 1
            introduced += 1
            categories_this_cycle.add(cat)
            picked_this_cycle.append(item)

            calendar_rows.append(
                [
                    cycle,
                    (cycle - 1) * 6 + seance,
                    seance,
                    "Nouvel automatisme",
                    item["Catégorie"],
                    item["Domaine"],
                    item["Référence"],
                    item["UUID"],
                    item["URL source"],
                    f"{ALEA_BASE_URL}?uuid={item['UUID']}",
                    "",
                    "",
                    "À planifier",
                ]
            )

        refs = [item["Référence"] for item in picked_this_cycle]
        uuids = [item["UUID"] for item in picked_this_cycle]
        cats = [item["Catégorie"] for item in picked_this_cycle]
        test_label = ", ".join(refs)
        test_url = ALEA_BASE_URL + "?" + "&".join(f"uuid={uuid}" for uuid in uuids)
        calendar_rows.append(
            [
                cycle,
                cycle * 6,
                6,
                "Test de cycle",
                "+".join(cats),
                "Mix des automatismes du cycle",
                " + ".join(refs),
                "",
                "",
                test_url,
                test_label,
                len(refs),
                "À planifier",
            ]
        )
        cycle_rows.append(
            [
                cycle,
                cycle * 6 - 5,
                cycle * 6,
                len(refs),
                ", ".join(cats),
                test_label,
                test_url,
                ", ".join(sorted(set(cats), key=CATEGORIES.index)),
            ]
        )
        cycle += 1

    return calendar_rows, cycle_rows


def col_name(index: int) -> str:
    name = ""
    while index:
        index, rem = divmod(index - 1, 26)
        name = chr(65 + rem) + name
    return name


def sheet_xml(
    rows: list[list[object]],
    hyperlink_columns: set[int] | None = None,
) -> tuple[str, list[tuple[str, str]]]:
    hyperlink_columns = hyperlink_columns or set()
    hyperlinks: list[tuple[str, str]] = []
    out = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheetViews><sheetView showGridLines="0" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
        "<sheetData>",
    ]
    for r_idx, row in enumerate(rows, 1):
        out.append(f'<row r="{r_idx}">')
        for c_idx, value in enumerate(row, 1):
            cell = f"{col_name(c_idx)}{r_idx}"
            style = 1 if r_idx == 1 else 0
            if isinstance(value, int):
                out.append(f'<c r="{cell}" s="{style}"><v>{value}</v></c>')
            else:
                text = escape("" if value is None else str(value))
                out.append(
                    f'<c r="{cell}" s="{style}" t="inlineStr"><is><t>{text}</t></is></c>'
                )
                if (
                    r_idx > 1
                    and c_idx in hyperlink_columns
                    and str(value).startswith("https://")
                ):
                    hyperlinks.append((cell, str(value)))
        out.append("</row>")
    out.append("</sheetData>")
    if hyperlinks:
        out.append("<hyperlinks>")
        for rel_idx, (cell, _) in enumerate(hyperlinks, 1):
            out.append(f'<hyperlink ref="{cell}" r:id="rId{rel_idx}"/>')
        out.append("</hyperlinks>")
    out.append("</worksheet>")
    return "".join(out), hyperlinks


def relationships_xml(hyperlinks: list[tuple[str, str]]) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + "".join(
            f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="{escape(url)}" TargetMode="External"/>'
            for i, (_, url) in enumerate(hyperlinks, 1)
        )
        + "</Relationships>"
    )


def write_xlsx(sheets: list[tuple[str, list[list[object]], set[int]]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT_FILE, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            + "".join(
                f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                for i in range(1, len(sheets) + 1)
            )
            + "</Types>",
        )
        zf.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            "</Relationships>",
        )
        zf.writestr(
            "xl/_rels/workbook.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            + "".join(
                f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>'
                for i in range(1, len(sheets) + 1)
            )
            + f'<Relationship Id="rId{len(sheets) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            + "</Relationships>",
        )
        zf.writestr(
            "xl/workbook.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            "<sheets>"
            + "".join(
                f'<sheet name="{escape(name)}" sheetId="{i}" r:id="rId{i}"/>'
                for i, (name, _, _) in enumerate(sheets, 1)
            )
            + "</sheets></workbook>",
        )
        zf.writestr(
            "xl/styles.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            '<fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts>'
            '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF244765"/><bgColor indexed="64"/></patternFill></fill></fills>'
            '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>'
            '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            "</styleSheet>",
        )
        for i, (_, rows, hyperlink_columns) in enumerate(sheets, 1):
            xml, hyperlinks = sheet_xml(rows, hyperlink_columns)
            zf.writestr(f"xl/worksheets/sheet{i}.xml", xml)
            if hyperlinks:
                zf.writestr(
                    f"xl/worksheets/_rels/sheet{i}.xml.rels",
                    relationships_xml(hyperlinks),
                )


def main() -> None:
    automatismes = load_automatismes()
    calendar_rows, cycle_rows = build_schedule(automatismes)
    inventory = [
        ["Catégorie", "Domaine", "Référence", "UUID", "URL source"],
        *[
            [
                row["Catégorie"],
                row["Domaine"],
                row["Référence"],
                row["UUID"],
                row["URL source"],
            ]
            for row in automatismes
        ],
    ]
    summary = [["Catégorie", "Domaine", "Disponibles", "Planifiés"]]
    for cat in CATEGORIES:
        available = sum(1 for row in automatismes if row["Catégorie"] == cat)
        planned = sum(
            1
            for row in calendar_rows
            if row[3] == "Nouvel automatisme" and row[4] == cat
        )
        summary.append([cat, CATEGORY_LABELS[cat], available, planned])
    summary.extend(
        [
            [],
            ["Paramètre", "Valeur"],
            ["Automatismes disponibles", len(automatismes)],
            ["Cycles générés", len(cycle_rows)],
            ["Séances générées", len(calendar_rows)],
            ["Règle", "5 nouveautés par cycle, puis test sur les nouveautés du cycle"],
            ["Généré le", datetime.now().strftime("%Y-%m-%d %H:%M")],
        ]
    )

    calendar = [
        [
            "Cycle",
            "Séance année",
            "Séance cycle",
            "Type",
            "Catégorie",
            "Domaine",
            "Référence",
            "UUID",
            "URL source",
            "URL Coopmaths",
            "Références du test",
            "Nombre de questions test",
            "Statut",
        ],
        *calendar_rows,
    ]
    cycles = [
        [
            "Cycle",
            "Première séance",
            "Séance test",
            "Nouveautés",
            "Catégories dans l'ordre",
            "Références du test",
            "URL Coopmaths du test",
            "Catégories test",
        ],
        *cycle_rows,
    ]
    write_xlsx(
        [
            ("Calendrier", calendar, {10}),
            ("Cycles tests", cycles, {7}),
            ("Réservoir", inventory, set()),
            ("Synthèse", summary, set()),
        ]
    )
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
