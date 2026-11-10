/**
 * Outils pour manipuler des formules de tableur sous forme de texte :
 * décalage des références lors d'une recopie (avec ou sans `$`),
 * évaluation de formules simples et mise en forme pour l'affichage.
 *
 * Les opérations gérées sont `+ - * / ^`, les parenthèses, les références
 * (`B2`, `$B2`, `B$2`, `$B$2`), les plages (`B2:B6`) et les fonctions
 * `SUM`/`SOMME`, `AVERAGE`/`MOYENNE`, `SQRT`/`RACINE`, `MIN` et `MAX`
 * (noms en majuscules ou en minuscules).
 */

export type Reference = {
  colonne: number
  ligne: number
  colonneAbsolue: boolean
  ligneAbsolue: boolean
}

/** Valeur d'une cellule : `undefined` ou `''` désigne une cellule vide. */
export type ValeurCellule = number | string | undefined

const REGEX_REFERENCE =
  /(?<![A-Za-z0-9_$])(\$?)([A-Z]{1,2})(\$?)(\d+)(?![A-Za-z0-9_(])/g

/** 0 → 'A', 25 → 'Z', 26 → 'AA' */
export function indexVersLettres(index: number): string {
  let n = index + 1
  let lettres = ''
  while (n > 0) {
    const reste = (n - 1) % 26
    lettres = String.fromCharCode(65 + reste) + lettres
    n = Math.floor((n - 1) / 26)
  }
  return lettres
}

/** 'A' → 0, 'Z' → 25, 'AA' → 26 */
export function lettresVersIndex(lettres: string): number {
  let index = 0
  for (const caractere of lettres.toUpperCase()) {
    index = index * 26 + (caractere.charCodeAt(0) - 64)
  }
  return index - 1
}

export function analyseReference(ref: string): Reference | null {
  const m = ref
    .trim()
    .toUpperCase()
    .match(/^(\$?)([A-Z]{1,2})(\$?)(\d+)$/)
  if (m == null) return null
  return {
    colonneAbsolue: m[1] === '$',
    colonne: lettresVersIndex(m[2]),
    ligneAbsolue: m[3] === '$',
    ligne: Number(m[4]) - 1,
  }
}

export function formateReference(r: Reference): string {
  return `${r.colonneAbsolue ? '$' : ''}${indexVersLettres(r.colonne)}${r.ligneAbsolue ? '$' : ''}${r.ligne + 1}`
}

/** Référence sans `$`, ex. `refCellule(1, 2)` → `'B3'` */
export function refCellule(colonne: number, ligne: number): string {
  return `${indexVersLettres(colonne)}${ligne + 1}`
}

/**
 * Formule obtenue en recopiant une formule d'une cellule vers une autre
 * décalée de `dColonnes` colonnes et `dLignes` lignes : les références
 * relatives sont décalées, celles précédées d'un `$` restent fixes.
 * Une référence qui sort de la feuille devient `#REF!`.
 */
export function decaleFormule(
  formule: string,
  dColonnes: number,
  dLignes: number,
): string {
  return formule.replace(
    REGEX_REFERENCE,
    (
      _,
      dollarCol: string,
      lettres: string,
      dollarLigne: string,
      num: string,
    ) => {
      const colonne =
        lettresVersIndex(lettres) + (dollarCol === '$' ? 0 : dColonnes)
      const ligne = Number(num) - 1 + (dollarLigne === '$' ? 0 : dLignes)
      if (colonne < 0 || ligne < 0) return '#REF!'
      return `${dollarCol}${indexVersLettres(colonne)}${dollarLigne}${ligne + 1}`
    },
  )
}

/** Formule obtenue en recopiant la formule de `origine` vers `destination`. */
export function recopieFormule(
  formule: string,
  origine: string,
  destination: string,
): string {
  const o = analyseReference(origine)
  const d = analyseReference(destination)
  if (o == null || d == null) {
    throw new Error(`Cellule invalide : ${origine} ou ${destination}`)
  }
  return decaleFormule(formule, d.colonne - o.colonne, d.ligne - o.ligne)
}

/** Majuscules, sans espaces : permet de comparer deux saisies de formules. */
export function normaliseFormule(formule: string): string {
  return formule.replaceAll(/\s/g, '').toUpperCase().replaceAll(',', '.')
}

const FONCTIONS_FRANCAISES: Record<string, string> = {
  SOMME: 'SUM',
  MOYENNE: 'AVERAGE',
  RACINE: 'SQRT',
}

/**
 * Convertit en notation anglo-saxonne (fonctions de jspreadsheet) :
 * `RACINE` → `SQRT`, `SOMME` → `SUM`, `MOYENNE` → `AVERAGE`, quelle que soit
 * la casse, et le séparateur d'arguments `;` → `,`.
 */
export function formuleAnglaise(formule: string): string {
  return formule
    .replaceAll(
      /\b(SOMME|MOYENNE|RACINE)\s*\(/gi,
      (_, nom: string) => `${FONCTIONS_FRANCAISES[nom.toUpperCase()]}(`,
    )
    .replaceAll(';', ',')
}

/**
 * Écrit une formule pour un `$...$` KaTeX/LaTeX : texte droit, `$` et `^`
 * protégés.
 */
export function formuleEnTex(formule: string): string {
  const protege = formule
    .replaceAll('\\', '\\textbackslash{}')
    .replaceAll('$', '\\$')
    .replaceAll('^', '\\textasciicircum{}')
    .replaceAll('%', '\\%')
    .replaceAll('#', '\\#')
    .replaceAll('_', '\\_')
    .replaceAll('&', '\\&')
  return `\\text{${protege}}`
}

type Jeton =
  | { type: 'nombre'; valeur: number }
  | { type: 'reference'; ref: string }
  | { type: 'plage'; debut: string; fin: string }
  | { type: 'fonction'; nom: string }
  | { type: 'operateur'; valeur: string }

const FONCTIONS = new Set([
  'SUM',
  'SOMME',
  'AVERAGE',
  'MOYENNE',
  'MIN',
  'MAX',
  'SQRT',
  'RACINE',
])

function decoupe(expression: string): Jeton[] {
  const jetons: Jeton[] = []
  const texte = expression.replaceAll(/\s/g, '').toUpperCase()
  let i = 0
  while (i < texte.length) {
    const reste = texte.slice(i)
    let m = reste.match(/^\d+([.,]\d+)?/)
    if (m != null) {
      jetons.push({ type: 'nombre', valeur: Number(m[0].replace(',', '.')) })
      i += m[0].length
      continue
    }
    m = reste.match(/^\$?[A-Z]{1,2}\$?\d+:\$?[A-Z]{1,2}\$?\d+/)
    if (m != null) {
      const [debut, fin] = m[0].split(':')
      jetons.push({ type: 'plage', debut, fin })
      i += m[0].length
      continue
    }
    m = reste.match(/^\$?[A-Z]{1,2}\$?\d+(?![A-Z0-9(])/)
    if (m != null) {
      jetons.push({ type: 'reference', ref: m[0] })
      i += m[0].length
      continue
    }
    m = reste.match(/^[A-Z]+(?=\()/)
    if (m != null && FONCTIONS.has(m[0])) {
      jetons.push({ type: 'fonction', nom: m[0] })
      i += m[0].length
      continue
    }
    if ('+-*/^();'.includes(texte[i])) {
      jetons.push({ type: 'operateur', valeur: texte[i] })
      i++
      continue
    }
    throw new Error(`Caractère inattendu « ${texte[i]} » dans ${expression}`)
  }
  return jetons
}

/**
 * Évalue une formule (avec ou sans `=` initial).
 * @param formule - ex. `'=B2*C2+1'`
 * @param valeurDeCellule - valeur d'une cellule désignée par sa référence sans `$` (ex. `'B2'`)
 * @throws si la formule est mal formée, si une cellule texte est utilisée
 * dans un calcul ou en cas de division par zéro
 */
export function evalueFormule(
  formule: string,
  valeurDeCellule: (ref: string) => ValeurCellule,
): number {
  const sansEgal = formule.trim().replace(/^=/, '')
  const jetons = decoupe(sansEgal)
  let position = 0

  const nombreDeCellule = (ref: string): number | null => {
    const analysee = analyseReference(ref)
    if (analysee == null) throw new Error(`Référence invalide : ${ref}`)
    const v = valeurDeCellule(refCellule(analysee.colonne, analysee.ligne))
    if (v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
    if (Number.isNaN(n))
      throw new Error(`La cellule ${ref} ne contient pas un nombre`)
    return n
  }

  const suivant = (): Jeton | undefined => jetons[position]
  const estOperateur = (valeur: string): boolean => {
    const j = suivant()
    return j?.type === 'operateur' && j.valeur === valeur
  }

  const argumentsFonction = (): number[] => {
    const valeurs: number[] = []
    if (estOperateur(')')) return valeurs
    let encore = true
    while (encore) {
      const j = suivant()
      if (j?.type === 'plage') {
        position++
        const debut = analyseReference(j.debut)!
        const fin = analyseReference(j.fin)!
        for (
          let l = Math.min(debut.ligne, fin.ligne);
          l <= Math.max(debut.ligne, fin.ligne);
          l++
        ) {
          for (
            let c = Math.min(debut.colonne, fin.colonne);
            c <= Math.max(debut.colonne, fin.colonne);
            c++
          ) {
            const n = nombreDeCellule(refCellule(c, l))
            if (n != null) valeurs.push(n)
          }
        }
      } else {
        valeurs.push(expression())
      }
      encore = estOperateur(';')
      if (encore) position++
    }
    return valeurs
  }

  const atome = (): number => {
    const j = suivant()
    if (j == null) throw new Error(`Formule incomplète : ${formule}`)
    position++
    if (j.type === 'nombre') return j.valeur
    if (j.type === 'reference') return nombreDeCellule(j.ref) ?? 0
    if (j.type === 'plage') throw new Error('Plage de cellules hors fonction')
    if (j.type === 'fonction') {
      if (!estOperateur('('))
        throw new Error(`Parenthèse attendue après ${j.nom}`)
      position++
      const valeurs = argumentsFonction()
      if (!estOperateur(')')) throw new Error('Parenthèse fermante manquante')
      position++
      if (j.nom === 'SUM' || j.nom === 'SOMME') {
        return valeurs.reduce((a, b) => a + b, 0)
      }
      if (valeurs.length === 0) throw new Error(`${j.nom} sans argument`)
      if (j.nom === 'SQRT' || j.nom === 'RACINE') {
        if (valeurs.length !== 1 || valeurs[0] < 0) {
          throw new Error(`Argument invalide pour ${j.nom}`)
        }
        return Math.sqrt(valeurs[0])
      }
      if (j.nom === 'MIN') return Math.min(...valeurs)
      if (j.nom === 'MAX') return Math.max(...valeurs)
      return valeurs.reduce((a, b) => a + b, 0) / valeurs.length
    }
    if (j.valeur === '(') {
      const v = expression()
      if (!estOperateur(')')) throw new Error('Parenthèse fermante manquante')
      position++
      return v
    }
    throw new Error(`Symbole inattendu « ${j.valeur} » dans ${formule}`)
  }

  const unaire = (): number => {
    if (estOperateur('-')) {
      position++
      return -unaire()
    }
    if (estOperateur('+')) {
      position++
      return unaire()
    }
    const base = atome()
    if (estOperateur('^')) {
      position++
      return Math.pow(base, unaire())
    }
    return base
  }

  const terme = (): number => {
    let v = unaire()
    while (estOperateur('*') || estOperateur('/')) {
      const op = (suivant() as { valeur: string }).valeur
      position++
      const d = unaire()
      if (op === '/' && d === 0) throw new Error('Division par zéro')
      v = op === '*' ? v * d : v / d
    }
    return v
  }

  const expression = (): number => {
    let v = terme()
    while (estOperateur('+') || estOperateur('-')) {
      const op = (suivant() as { valeur: string }).valeur
      position++
      const d = terme()
      v = op === '+' ? v + d : v - d
    }
    return v
  }

  const resultat = expression()
  if (position < jetons.length) {
    throw new Error(`Formule mal formée : ${formule}`)
  }
  // évite les artefacts du type 0.1 + 0.2
  return Math.round(resultat * 1e10) / 1e10
}

/** Contenu brut des cellules d'une feuille, indexé par référence (`'B2'`). */
export type Cellules = Record<string, string | number>

/**
 * Valeur d'une cellule : les formules (texte commençant par `=`) sont
 * calculées récursivement.
 * @throws si la formule est invalide ou si les cellules se référencent en boucle
 */
export function valeurAffichee(
  cellules: Cellules,
  ref: string,
  enCours: string[] = [],
): ValeurCellule {
  const cle = ref.toUpperCase()
  const brut = cellules[cle]
  if (typeof brut === 'string' && brut.startsWith('=')) {
    if (enCours.includes(cle)) throw new Error('Référence circulaire')
    return evalueFormule(brut, (r) =>
      valeurAffichee(cellules, r, [...enCours, cle]),
    )
  }
  return brut
}

/**
 * Contenu tel qu'un tableur l'afficherait : un résultat d'erreur est
 * remplacé par `#DIV/0!` ou `#ERROR!`.
 */
export function texteAffiche(cellules: Cellules, ref: string): string | number {
  try {
    return valeurAffichee(cellules, ref) ?? ''
  } catch (erreur) {
    return erreur instanceof Error && erreur.message === 'Division par zéro'
      ? '#DIV/0!'
      : '#ERROR!'
  }
}

/**
 * Calcul (en LaTeX) obtenu en remplaçant dans une formule chaque référence par
 * la valeur de la cellule : `=A1+B2*C3` → `3+5\\times 2`.
 */
export function expressionNumerique(
  formule: string,
  cellules: Cellules,
): string {
  return formule
    .replace(/^=/, '')
    .replaceAll(
      /\$?([A-Z]{1,2})\$?(\d+)/g,
      (_, lettres: string, num: string) => {
        const v = valeurAffichee(cellules, `${lettres}${num}`) ?? 0
        const texte = String(v).replace('.', '{,}')
        return typeof v === 'number' && v < 0 ? `(${texte})` : texte
      },
    )
    .replaceAll('*', '\\times ')
    .replaceAll('/', '\\div ')
    .replaceAll(/(?:RACINE|SQRT)\(([^()]*)\)/gi, '\\sqrt{$1}')
}
