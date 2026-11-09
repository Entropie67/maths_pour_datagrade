"""Vérifie les octets livrés et produit la couverture, sans accès réseau."""
import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
inventory = json.loads((ROOT / 'resources/annales-inventory.json').read_text(encoding='utf-8'))
report = json.loads((ROOT / 'resources/annales-download-report.json').read_text(encoding='utf-8'))
results = {r['path']: r for r in report['results']}
assert len(results) == len(inventory['assets']), 'Rapport incomplet'
families = defaultdict(lambda: {'available': 0, 'missing': 0, 'bytes': 0})
missing = []
active = {e['uuid'] for e in inventory['exercises'] if e['activeCatalogue']}
assets = {item['path']: item for item in inventory['assets']}
invalid_image_references = []
seen = set()
for item in inventory['assets']:
    path = item['path']
    assert path.casefold() not in seen, f'Collision de chemins : {path}'
    seen.add(path.casefold())
    result = results[path]
    family = path.split('/')[1]
    if any('image' in kind for kind in item['kinds']) and not path.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp')):
        invalid_image_references.append(item)
    if result['status'] == 'ok':
        target = (ROOT / 'mathalea/public' / path).resolve()
        assert target.is_relative_to((ROOT / 'mathalea/public').resolve())
        data = target.read_bytes()
        assert len(data) == result['bytes'], path
        assert hashlib.sha256(data).hexdigest() == result['sha256'], path
        families[family]['available'] += 1
        families[family]['bytes'] += len(data)
    else:
        families[family]['missing'] += 1
        uuids = set(item['exercises'])
        for parent in item.get('referencedBy', []):
            uuids.update(assets.get(parent, {}).get('exercises', []))
        missing.append(item | {'activeCatalogue': bool(uuids & active)})
summary = {'families': dict(sorted(families.items())), 'missing': missing,
           'invalidImageReferences': invalid_image_references,
           'missingActiveCatalogue': sum(item['activeCatalogue'] for item in missing),
           'verifiedFiles': sum(f['available'] for f in families.values()),
           'verifiedBytes': sum(f['bytes'] for f in families.values())}
(ROOT / 'resources/annales-coverage.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k not in ('missing', 'invalidImageReferences')}, ensure_ascii=False, indent=2))
