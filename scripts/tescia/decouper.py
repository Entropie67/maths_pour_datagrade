#!/usr/bin/env python3
"""Découpe les annales TeSciA (AORES) exercice par exercice pour la banque intégrée « tescia ».

Entrée : le dossier de l'archive « Annales-TeSciA » (un sous-dossier par année, puis par
épreuve, contenant Sujet-AORES.pdf, Corrige-QCM-AORES.pdf et, jusqu'en 2025, les
feuilles-réponses corrigées Corrige-feuille-triangle/rond-AORES.pdf).

Sortie : pour chaque exercice, png/<id>.png (énoncé) et png/<id>_cor.png (corrigé du QCM,
suivi des feuilles-réponses corrigées quand l'exercice comporte des questions L ou R),
et le manifest de la banque (schéma mathalea-banque-v1).

    python3 scripts/tescia/decouper.py <Annales-TeSciA> <dossier png> <manifest.json>

Chaque énoncé est précédé d'un rappel des conventions du concours (questions M, L, R),
qui ne figurent que sur la première page du sujet : un exercice isolé reste ainsi lisible.
Le script vérifie aussi que les exercices découpés couvrent toutes les questions du sujet.

Dépendances : poppler-utils (pdftotext, pdftoppm), Pillow et la police DejaVu Sans.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

DPI = 125            # énoncés et corrigés découpés
DPI_FEUILLE = 100    # feuilles-réponses manuscrites
MARGE = 6.0

EPREUVES = {
    'Epreuve-1': ('ep1', 'Épreuve 1'),
    'Epreuve-2-option-A': ('ep2a', 'Épreuve 2, option A'),
    'Epreuve-2-option-B': ('ep2b', 'Épreuve 2, option B'),
}

# Titres contenant une formule, que l'extraction de texte ne restitue pas
TITRES = {
    'tescia_2025_ep1_ex4': 'L’équation a^x = x^a',
}

MOT = re.compile(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>')
PAGE = re.compile(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', re.S)


def desechapper(t):
    return t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'").replace('&apos;', "'")


def lire_mots(pdf):
    """Liste, par page, des mots (x0, y0, x1, y1, texte) et hauteur de page."""
    with tempfile.NamedTemporaryFile(suffix='.html') as tmp:
        subprocess.run(['pdftotext', '-bbox', str(pdf), tmp.name], check=True, stderr=subprocess.DEVNULL)
        html = Path(tmp.name).read_text(encoding='utf-8')
    pages = []
    for _w, h, corps in PAGE.findall(html):
        mots = [(float(a), float(b), float(c), float(d), desechapper(t)) for a, b, c, d, t in MOT.findall(corps)]
        pages.append((float(h), mots))
    return pages


def lignes(mots):
    """Regroupe les mots en lignes : [(y_haut, y_bas, texte)] de haut en bas."""
    out = []
    for m in sorted(mots, key=lambda m: (m[1], m[0])):
        if out and abs(m[1] - out[-1][0]) < 4:
            out[-1] = (out[-1][0], max(out[-1][1], m[3]), out[-1][2] + ' ' + m[4])
        else:
            out.append((m[1], m[3], m[4]))
    return out


def bornes_pages(pages):
    """Zone utile de chaque page : {page: (haut, bas)}, sans l'en-tête courant ni le numéro de page.

    L'en-tête est la première ligne quand son texte revient en tête d'autres pages
    (« Épreuve 1 », « Mathématiques Générales »…) ; le pied est la dernière ligne
    quand elle ne contient qu'un numéro. Sujet et corrigé n'ont pas la même mise en page :
    rien n'est supposé sur les ordonnées.
    """
    tetes = {}
    par_page = {p: lignes(mots) for p, (_h, mots) in enumerate(pages) if mots}
    for ls in par_page.values():
        tetes[ls[0][2]] = tetes.get(ls[0][2], 0) + 1
    bornes = {}
    for p, ls in par_page.items():
        hauteur = pages[p][0]
        premiere, derniere = ls[0], ls[-1]
        est_entete = tetes[premiere[2]] >= 2 and premiere[1] < 0.2 * hauteur and not premiere[2].startswith('Exercice')
        haut = premiere[1] + 5 if est_entete else max(0.0, premiere[0] - 8)
        bas = derniere[0] - 4 if re.fullmatch(r'\d{1,2}', derniere[2].strip()) else hauteur - 28
        bornes[p] = (haut, bas)
    return bornes


def reperer_exercices(pages):
    """[(numero, titre, page, y)] pour chaque titre « Exercice N. … » (gros caractères)."""
    exos = []
    for p, (_h, mots) in enumerate(pages):
        for i, m in enumerate(mots):
            if m[4] == 'Exercice' and (m[3] - m[1]) > 13 and i + 1 < len(mots) and re.fullmatch(r'\d+\.', mots[i + 1][4]):
                # Le titre peut tenir sur deux lignes : on prend les mots en gros caractères qui suivent,
                # jusqu'à 45 points sous le début du titre (les formules, plus petites, sont ignorées).
                suite = [x for x in mots if (x[3] - x[1]) > 13 and m[1] - 4 <= x[1] <= m[1] + 45
                         and not (abs(x[1] - m[1]) < 4 and x[0] <= mots[i + 1][0])]
                titre = ' '.join(x[4] for x in sorted(suite, key=lambda x: (round(x[1] / 6), x[0]))).strip()
                titre = re.sub(r'\s+', ' ', titre).strip(' .:')
                exos.append((int(mots[i + 1][4][:-1]), titre, p, m[1]))
    return exos


def segments(pages, exos, k):
    """Bandes (page, y_haut, y_bas) couvertes par le k-ième exercice."""
    bornes = bornes_pages(pages)
    _n, _t, p0, y0 = exos[k]
    if k + 1 < len(exos):
        _, _, p1, y1 = exos[k + 1]
        fin = (p1, y1 - MARGE)
    else:
        dernier = max(bornes)
        fin = (dernier, bornes[dernier][1])
    bandes = []
    for p in range(p0, fin[0] + 1):
        if p not in bornes:
            continue
        haut = (y0 - MARGE) if p == p0 else bornes[p][0]
        bas = fin[1] if p == fin[0] else bornes[p][1]
        if bas - haut > 8:
            bandes.append((p, haut, bas))
    return bandes


def mots_exercice(pages, bandes):
    out = []
    for p, haut, bas in bandes:
        out += [m for m in pages[p][1] if haut <= m[1] < bas]
    return out


class Rendu:
    """Pages d'un PDF rendues à la demande en niveaux de gris."""

    def __init__(self, pdf, dpi):
        self.pdf, self.dpi, self.cache = pdf, dpi, {}
        self.tmp = tempfile.TemporaryDirectory()

    def page(self, p):
        if p not in self.cache:
            base = Path(self.tmp.name) / f'p{p}'
            subprocess.run(['pdftoppm', '-r', str(self.dpi), '-gray', '-f', str(p + 1), '-l', str(p + 1), '-singlefile', '-png', str(self.pdf), str(base)], check=True)
            self.cache[p] = Image.open(f'{base}.png').convert('L')
        return self.cache[p]

    def nb_pages(self):
        info = subprocess.run(['pdfinfo', str(self.pdf)], check=True, capture_output=True, text=True).stdout
        return int(re.search(r'Pages:\s+(\d+)', info).group(1))


def rogner(im, marge=10):
    """Retire les marges blanches."""
    fond = Image.new('L', im.size, 255)
    boite = ImageChops.difference(im, fond).point(lambda v: 255 if v > 24 else 0).getbbox()
    if not boite:
        return None
    x0, y0, x1, y1 = boite
    return im.crop((max(0, x0 - marge), max(0, y0 - marge), min(im.width, x1 + marge), min(im.height, y1 + marge)))


def retirer_filets(im, zone=70):
    """Coupe les filets horizontaux d'en-tête ou de pied restés au bord d'une bande.

    Un filet est une rangée sombre sur plus de la moitié de la largeur, à moins de
    `zone` pixels du haut ou du bas ; ce qui est au-delà (logo d'en-tête, numéro de
    page) part avec lui.
    """
    petit = im.resize((max(1, im.width // 4), im.height))
    px = petit.load()
    seuil = petit.width * 0.5
    sombres = [y for y in range(im.height) if sum(1 for x in range(petit.width) if px[x, y] < 110) > seuil]
    haut = max([y for y in sombres if y < zone], default=-1)
    bas = min([y for y in sombres if y > im.height - zone], default=im.height)
    if haut < 0 and bas == im.height:
        return im
    if bas - haut < 20:
        return im
    return im.crop((0, haut + 3 if haut >= 0 else 0, im.width, bas - 2 if bas < im.height else im.height))


def empiler(images, espace=14):
    images = [i for i in images if i is not None]
    largeur = max(i.width for i in images)
    hauteur = sum(i.height for i in images) + espace * (len(images) - 1)
    toile = Image.new('L', (largeur, hauteur), 255)
    y = 0
    for i in images:
        toile.paste(i, (0, y))
        y += i.height + espace
    return toile


def image_exercice(rendu, bandes):
    ech = rendu.dpi / 72.0
    morceaux = []
    for p, haut, bas in bandes:
        page = rendu.page(p)
        morceaux.append(rogner(retirer_filets(page.crop((0, int(haut * ech), page.width, int(bas * ech))))))
    return empiler(morceaux)


def feuille(pdf):
    """Toutes les pages d'une feuille-réponse corrigée, empilées."""
    r = Rendu(pdf, DPI_FEUILLE)
    return empiler([rogner(r.page(p)) for p in range(r.nb_pages())])


POLICE = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
REPERES = {
    'M': 'M : question à choix multiple, une seule bonne réponse.',
    'L': 'L : réponse brute, sans justification.',
    'R': 'R : réponse rédigée, à justifier.',
}


def bandeau_reperes(largeur, types):
    """Rappel, en tête d'énoncé, des conventions données sur la première page du sujet."""
    police = ImageFont.truetype(POLICE, 15)
    phrases = ['Repères TeSciA —'] + [REPERES[t] for t in 'MLR' if t in types]
    if 'L' in types or 'R' in types:
        phrases.append('Les symboles △ et ○ désignent la feuille-réponse du concours.')
    phrases.append('Les questions d’un même exercice peuvent dépendre les unes des autres.')
    lignes_texte, courante = [], ''
    for mot in ' '.join(phrases).split(' '):
        essai = f'{courante} {mot}'.strip()
        if courante and police.getlength(essai) > largeur - 24:
            lignes_texte.append(courante)
            courante = mot
        else:
            courante = essai
    lignes_texte.append(courante)
    interligne = 22
    bandeau = Image.new('L', (largeur, interligne * len(lignes_texte) + 18), 255)
    dessin = ImageDraw.Draw(bandeau)
    for i, ligne in enumerate(lignes_texte):
        dessin.text((12, 6 + i * interligne), ligne, font=police, fill=95)
    dessin.line((12, bandeau.height - 5, largeur - 12, bandeau.height - 5), fill=190, width=1)
    return bandeau


def verifier_couverture(dossier, pages, numeros):
    """Chaque question M, L ou R du sujet doit se retrouver dans un exercice découpé, sans trou."""
    for lettre in 'MLR':
        sujet = {int(m[4][1:]) for _h, mots in pages for m in mots if re.fullmatch(lettre + r'\d+', m[4])}
        decoupes = {n for (l, n) in numeros if l == lettre}
        if sujet != decoupes:
            raise SystemExit(f'{dossier} : questions {lettre} absentes des exercices découpés : {sorted(sujet - decoupes)}')
        if decoupes and decoupes != set(range(1, max(decoupes) + 1)):
            raise SystemExit(f'{dossier} : numérotation {lettre} incomplète : {sorted(set(range(1, max(decoupes) + 1)) - decoupes)}')


def enregistrer(im, chemin, couleurs=16):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    im.quantize(colors=couleurs, dither=Image.Dither.NONE).save(chemin, optimize=True)


def main(source, dossier_png, chemin_manifest):
    source, dossier_png = Path(source), Path(dossier_png)
    exercices = []
    for annee in sorted(p for p in source.iterdir() if p.is_dir() and p.name.isdigit()):
        for nom, (code, libelle) in EPREUVES.items():
            dossier = annee / nom
            sujet, corrige = dossier / 'Sujet-AORES.pdf', dossier / 'Corrige-QCM-AORES.pdf'
            if not sujet.exists():
                continue
            pages_s, pages_c = lire_mots(sujet), lire_mots(corrige)
            exos_s, exos_c = reperer_exercices(pages_s), reperer_exercices(pages_c)
            if [e[0] for e in exos_s] != [e[0] for e in exos_c]:
                raise SystemExit(f'{dossier} : exercices différents entre sujet {[e[0] for e in exos_s]} et corrigé {[e[0] for e in exos_c]}')
            rendu_s, rendu_c = Rendu(sujet, DPI), Rendu(corrige, DPI)
            feuilles = {}
            for forme in ('triangle', 'rond'):
                f = dossier / f'Corrige-feuille-{forme}-AORES.pdf'
                if f.exists():
                    feuilles[forme] = feuille(f)
            numeros = set()
            for k, (numero, titre, _p, _y) in enumerate(exos_s):
                ident = f'tescia_{annee.name}_{code}_ex{numero}'
                titre = TITRES.get(ident, titre)
                bandes_s, bandes_c = segments(pages_s, exos_s, k), segments(pages_c, exos_c, k)
                mots = mots_exercice(pages_s, bandes_s)
                types = {m[4][0] for m in mots if re.fullmatch(r'[MLR]\d+', m[4])}
                numeros |= {(m[4][0], int(m[4][1:])) for m in mots if re.fullmatch(r'[MLR]\d+', m[4])}
                enonce = image_exercice(rendu_s, bandes_s)
                enregistrer(empiler([bandeau_reperes(enonce.width, types), enonce], espace=10), dossier_png / f'{ident}.png')
                # Questions à réponse brute (L) ou rédigée (R) : leurs corrigés sont sur les feuilles-réponses
                besoin = set()
                for i, m in enumerate(mots):
                    if re.fullmatch(r'L\d+', m[4]):
                        besoin.add('triangle')
                    elif re.fullmatch(r'R\d+', m[4]):
                        besoin.add('triangle' if i and mots[i - 1][4] == '△' else 'rond')
                parties = [image_exercice(rendu_c, bandes_c)] + [feuilles[f] for f in ('triangle', 'rond') if f in besoin and f in feuilles]
                enregistrer(empiler(parties, espace=28), dossier_png / f'{ident}_cor.png')
                nb_m = len({m[4] for m in mots if re.fullmatch(r'M\d+', m[4])})
                nb_l = len({m[4] for m in mots if re.fullmatch(r'L\d+', m[4])})
                nb_r = len({m[4] for m in mots if re.fullmatch(r'R\d+', m[4])})
                exercices.append({
                    'id': ident,
                    'titre': f'{titre} (TeSciA {annee.name}, {libelle[0].lower() + libelle[1:]}, ex. {numero})',
                    'categorie': annee.name,
                    'sousCategorie': libelle,
                    'tags': [titre, f'TeSciA {annee.name}'] + ([f'{nb_m} QCM'] if nb_m else []) + (['réponses brutes'] if nb_l else []) + (['réponses rédigées'] if nb_r else []),
                    'png': f'png/{ident}.png',
                    'pngCor': f'png/{ident}_cor.png',
                })
                print(f'{ident:28} {titre[:46]:46} M{nb_m:<3} L{nb_l:<2} R{nb_r:<2} feuilles {sorted(besoin & set(feuilles))}')
            verifier_couverture(dossier, pages_s, numeros)
    manifest = {
        'schema': 'mathalea-banque-v1',
        'id': 'tescia',
        'titre': 'Annales TeSciA',
        'auteur': 'AORES (Association pour une Orientation Raisonnée vers l\'Enseignement supérieur Scientifique)',
        'licence': 'Sujets et corrigés diffusés librement par l\'AORES',
        'version': '1.0.0',
        'description': 'Annales du Test Scientifique d\'Aptitude (TeSciA), de 2022 à 2026 : sujets officiels découpés par exercice, corrigé des questions à choix multiple et feuilles-réponses corrigées.',
        'exercices': exercices,
    }
    Path(chemin_manifest).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(exercices)} exercices, manifest écrit dans {chemin_manifest}')


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
