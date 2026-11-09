"""Ajoute les figures requises par les sources LaTeX téléchargées."""
import json
from pathlib import Path, PurePosixPath
import re

ROOT = Path(__file__).resolve().parents[1]
manifest_file = ROOT / 'resources/annales-inventory.json'
manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
assets = {item['path']: item for item in manifest['assets']}
added = 0
for file in (ROOT / 'mathalea/public/static').rglob('*.tex'):
    relative = file.relative_to(ROOT / 'mathalea/public').as_posix()
    content = file.read_text(encoding='utf-8', errors='replace')
    content = '\n'.join(re.split(r'(?<!\\)%', line)[0] for line in content.splitlines())
    parts = relative.split('/')
    if len(parts) < 4: continue
    family, year = parts[1:3]
    for name in re.findall(r'\\includegraphics\*?(?:\s*\[[^\]]*\])?\s*\{([^{}]+)\}', content):
        name = name.strip()
        if any(c in name for c in ['\\', '#', '..', ':']): continue
        suffix = PurePosixPath(name).suffix
        if suffix:
            extension = suffix[1:]
            stem = name[:-len(suffix)]
        else:
            extension = 'png' if family == 'crpe' else 'eps'
            stem = name
        # Convention utilisée par buildImagesUrlsList dans src/lib/Latex.ts.
        path = f'static/{family}/{year}/images/{stem}.{extension}' if family == 'crpe' else f'static/{family}/{year}/tex/{extension}/{stem}.{extension}'
        if path not in assets:
            assets[path] = {'path':path,'exercises':[],'kinds':['latex-figure'],'optional':False,'referencedBy':[relative]}
            added += 1
        elif relative not in assets[path].get('referencedBy',[]):
            assets[path].setdefault('referencedBy',[]).append(relative)
manifest['assets'] = sorted(assets.values(),key=lambda x:x['path'])
manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{added} figures ajoutées ; {len(assets)} ressources au total.')
