"""Copie reprenable des ressources publiques référencées par le catalogue importé."""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import time
import threading
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'mathalea' / 'public'
BASES = ['https://mathalea-static.s3-website.fr-par.scw.cloud/alea/', 'https://coopmaths.fr/alea/']
SOURCES_FILE = ROOT / 'resources/annales-sources.json'
SOURCES = json.loads(SOURCES_FILE.read_text(encoding='utf-8')) if SOURCES_FILE.exists() else {}
FORGE_LOCK = threading.Lock()

def safe_target(path):
    if not path.startswith(('static/', 'assets/crpe/', 'assets/bac/', 'assets/dnb/', 'assets/e3c/', 'assets/evacom/', 'assets/taf/')) or any(p in ('..', '') for p in path.split('/')) or '\\' in path:
        raise ValueError('Chemin interdit')
    target = (DEST / path).resolve()
    if not target.is_relative_to(DEST.resolve()):
        raise ValueError('Chemin hors destination')
    return target

def valid(data, path, mime):
    if not data or 'text/html' in mime or data.lstrip().lower().startswith((b'<!doctype html', b'<html', b'<?xml')):
        return False
    if path.lower().endswith('.png'): return data.startswith(b'\x89PNG\r\n\x1a\n')
    if path.lower().endswith('.pdf'): return data.startswith(b'%PDF-')
    return True

def download(item, previous):
    path = item['path']
    target = safe_target(path)
    old = previous.get(path)
    if old and old.get('status') == 'ok' and target.is_file():
        content = target.read_bytes()
        if hashlib.sha256(content).hexdigest() == old['sha256']:
            return old | {'cached': True}
    errors = list(old.get('errors', [])) if old else []
    urls = [base + urllib.parse.quote(path, safe='/') for base in BASES]
    parts = path.split('/')
    if parts[0] in ('static', 'assets') and parts[1] in SOURCES:
        source = SOURCES[parts[1]]
        relative = '/'.join(parts[2:])
        urls.append(f"https://forge.apps.education.fr/api/v4/projects/{source['projectId']}/repository/files/{urllib.parse.quote(relative, safe='')}/raw?ref={source['commit']}")
    if old and old.get('status') == 'missing':
        # Une réponse définitive déjà constatée ne justifie pas un nouveau téléchargement.
        urls = [url for url in urls if not any((url.startswith(error.split(': HTTP')[0])) and ('HTTP 403' in error or 'HTTP 404' in error) for error in old.get('errors', []))]
    for url in urls:
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'DataGrade-Mathalea-resource-import/1.0'})
                if 'forge.apps.education.fr' in url:
                    with FORGE_LOCK:
                        time.sleep(1.1)
                with urllib.request.urlopen(req, timeout=40) as response:
                    data = response.read()
                    mime = response.headers.get('Content-Type', '')
                if not valid(data, path, mime):
                    raise ValueError('Réponse vide ou format inattendu : ' + mime)
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_name(target.name + '.part')
                temporary.write_bytes(data)
                temporary.replace(target)
                return {'path': path, 'status': 'ok', 'source': url, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'contentType': mime}
            except urllib.error.HTTPError as exc:
                errors.append(f'{url}: HTTP {exc.code}')
                if exc.code in (403, 404): break
                if exc.code == 429: time.sleep(10 * (attempt + 1))
                else: time.sleep(2 ** attempt)
            except Exception as exc:
                errors.append(f'{url}: {type(exc).__name__}: {exc}')
                time.sleep(2 ** attempt)
    return {'path': path, 'status': 'missing', 'errors': list(dict.fromkeys(errors))}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--workers', type=int, default=6)
    parser.add_argument('--limit', type=int)
    args = parser.parse_args()
    inventory = json.loads((ROOT / 'resources/annales-inventory.json').read_text(encoding='utf-8'))
    journal = ROOT / 'resources/annales-downloads.jsonl'
    previous = {}
    report_file = ROOT / 'resources/annales-download-report.json'
    if report_file.exists():
        previous = {entry['path']: entry for entry in json.loads(report_file.read_text(encoding='utf-8'))['results']}
    if journal.exists():
        for line in journal.read_text(encoding='utf-8').splitlines():
            try:
                entry = json.loads(line)
                previous[entry['path']] = entry
            except (ValueError, KeyError): pass
    items = inventory['assets'][:args.limit] if args.limit else inventory['assets']
    ok = missing = total = 0
    start = time.monotonic()
    with journal.open('a', encoding='utf-8') as output, concurrent.futures.ThreadPoolExecutor(max_workers=min(args.workers, 8)) as pool:
        futures = [pool.submit(download, item, previous) for item in items]
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            result = future.result()
            output.write(json.dumps(result, ensure_ascii=False) + '\n')
            output.flush()
            previous[result['path']] = result
            if result['status'] == 'ok':
                ok += 1
                total += result['bytes']
            else: missing += 1
            if i % 100 == 0 or i == len(items):
                print(f'{i}/{len(items)} : {ok} OK, {missing} manquants, {total/1024**2:.1f} Mio, {time.monotonic()-start:.0f}s', flush=True)
    results = [previous[item['path']] for item in items]
    (ROOT / 'resources/annales-download-report.json').write_text(json.dumps({'requested':len(items),'ok':ok,'missing':missing,'bytes':total,'results':results},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return 1 if missing else 0

if __name__ == '__main__':
    raise SystemExit(main())
