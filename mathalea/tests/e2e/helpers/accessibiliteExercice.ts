/**
 * Contrôle informatif de l'accessibilité des exercices (`pnpm a11y:check`) :
 * sélection des exercices, analyse du HTML généré et rédaction du rapport.
 * Voir documentation/tests/controle-accessibilite.md
 */
import { execFileSync } from 'node:child_process'

/** Défauts certains, puis points soumis à une relecture humaine. */
export type CodeConstat =
  'figure' | 'description' | 'champ' | 'image' | 'demandeLaVue' | 'designation'

const DEFAUTS: CodeConstat[] = ['figure', 'description', 'champ', 'image']

export type ConstatBrut = { code: CodeConstat; extrait?: string }

/** Morceau de HTML généré, avec sa place dans l'exercice. */
export type Fragment = { lieu: string; html: string; enonce: boolean }

/** Tirage en cours d'analyse, cité dans le rapport pour le reproduire. */
export type Tirage = { graine: string; cle: string; interactif: boolean }

const GUIDE =
  'documentation/developpement/auteurs-exercices/rediger-un-exercice.md'

const CONSEILS: Record<
  CodeConstat,
  { titre: string; conseil: string; ancre: string }
> = {
  figure: {
    titre: 'sans `description` ni `decorative`',
    conseil:
      'Ajouter à cet appel de mathalea2d `description` (valeurs tirées, sans la réponse) ou `decorative: true`. Figure d’un utilitaire sans cette option : donner son information dans l’énoncé.',
    ancre: 'décrire-chaque-figure',
  },
  description: {
    titre: 'description qui n’est pas en texte brut',
    conseil:
      'Écrire sans `$` ni LaTeX : `stringNombre()` et non `texNombre()`, qui donnerait `3{,}5`.',
    ancre: 'décrire-chaque-figure',
  },
  champ: {
    titre: 'champ écrit à la main',
    conseil:
      'Utiliser un champ du moteur : `ajouteChampTexteMathLive()`, `remplisLesBlancs()`, `createQuestion()`…',
    ancre: 'champs-et-formats-du-moteur',
  },
  image: {
    titre: '`<img>` sans attribut `alt`',
    conseil:
      'Ajouter `alt` : le contenu de l’image, ou `alt=""` si elle n’apporte rien.',
    ancre: 'images',
  },
  demandeLaVue: {
    titre: '`demandeLaVue` déclaré',
    conseil:
      'Vérifier que décrire la figure donnerait vraiment la réponse et que le constructeur en donne la raison.',
    ancre: 'quand-la-description-donnerait-la-réponse',
  },
  designation: {
    titre: 'désignation possible par la couleur ou la position',
    conseil:
      'Si cet élément n’est désigné que comme cela, le nommer. Sinon, ignorer ce signalement.',
    ancre: 'désigner-sans-couleur-ni-position',
  },
}

// ---------------------------------------------------------------------------
// Sélection des exercices
// ---------------------------------------------------------------------------

/**
 * Décode un chemin tel que l'écrit git quand `core.quotepath` est actif :
 * `"src/exercices/mod\303\250lesExos/a.ts"` (octets UTF-8 en octal).
 */
export function decodeCheminGit(brut: string): string {
  if (brut.length < 2 || !brut.startsWith('"') || !brut.endsWith('"')) {
    return brut
  }
  const interieur = brut.slice(1, -1)
  const speciaux: Record<string, number> = {
    a: 7,
    b: 8,
    t: 9,
    n: 10,
    v: 11,
    f: 12,
    r: 13,
  }
  const octets: number[] = []
  for (let i = 0; i < interieur.length; i++) {
    if (interieur[i] !== '\\') {
      const caractere = String.fromCodePoint(interieur.codePointAt(i) as number)
      octets.push(...Buffer.from(caractere))
      i += caractere.length - 1
      continue
    }
    const octal = interieur.slice(i + 1, i + 4)
    if (/^[0-7]{3}$/.test(octal)) {
      octets.push(parseInt(octal, 8))
      i += 3
    } else {
      i++
      octets.push(speciaux[interieur[i]] ?? interieur.charCodeAt(i))
    }
  }
  return Buffer.from(octets).toString('utf8')
}

/**
 * Chemins relatifs à `src/exercices/` lus dans une liste libre (`CHANGED_FILES`) :
 * un chemin par ligne ou séparés par des espaces ou des virgules, éventuellement
 * entre guillemets par git. Une ligne entière reste candidate, car un nom de
 * fichier peut contenir une espace (`2N13-3 old.ts`) : seuls les chemins présents
 * dans le catalogue seront retenus.
 */
export function lisCheminsModifies(liste: string): string[] {
  const chemins = new Set<string>()
  for (const ligne of liste.split('\n')) {
    const propre = ligne.trim()
    if (propre === '') continue
    const morceaux = propre.match(/"(?:[^"\\]|\\.)*"|[^\s,"]+/g) ?? []
    for (const brut of [propre, ...morceaux]) {
      const chemin = decodeCheminGit(brut).normalize('NFC')
      const relatif = chemin.replace(/^.*?src\/exercices\//, '')
      // Une ligne de plusieurs chemins n'est pas un chemin.
      if (relatif !== chemin && !relatif.includes('src/exercices/')) {
        chemins.add(relatif)
      }
    }
  }
  return [...chemins]
}

/**
 * Exercices modifiés depuis le départ de la branche : commits, fichiers en cours
 * et nouveaux fichiers. `null` si git ne permet pas de le savoir.
 */
export function cheminsModifiesParGit(racine: string): string[] | null {
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'core.quotepath=off', ...args], {
      cwd: racine,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  try {
    let base = 'HEAD'
    for (const reference of ['origin/main', 'main']) {
      try {
        base = git('merge-base', reference, 'HEAD')
        break
      } catch {
        // Référence absente, par exemple dans un clone superficiel.
      }
    }
    const modifies = git('diff', '--name-only', '--diff-filter=ACMRT', base)
    const nouveaux = git(
      'ls-files',
      '--others',
      '--exclude-standard',
      '--full-name',
      '--',
      'src/exercices',
    )
    return lisCheminsModifies(`${modifies}\n${nouveaux}`)
  } catch {
    return null
  }
}

/** Archives et outils : `modèlesExos` reste analysable, les auteurs le recopient. */
const estAnalysable = (chemin: string) =>
  chemin.endsWith('.ts') &&
  !/old\d*\.ts$/i.test(chemin) &&
  !/^(apps|ressources|profs|beta)\//.test(chemin)

export type Selection = {
  cibles: [string, string][]
  explication: string[]
  /** `.ts` modifiés dans `src/exercices/` mais écartés : archive, parent, outil. */
  ecartes: string[]
}

const POUR_CIBLER =
  'Pour cibler : CHANGED_FILES="src/exercices/6e/6N1E.ts" pnpm a11y:check ou A11Y_FILTER="6e/6N1E" pnpm a11y:check.'

/**
 * Choisit les exercices à analyser. Sans `CHANGED_FILES` ni `A11Y_FILTER`, ce sont
 * ceux de la branche : le catalogue n'est pas encore décrit et le parcourir
 * signalerait des milliers de figures sans rapport avec le travail de l'auteur.
 */
export function selectionneExercices(
  catalogue: [string, string][],
  env: Record<string, string | undefined>,
  depuisGit: () => string[] | null,
): Selection {
  const normalise = catalogue.map(([uuid, chemin]): [string, string] => [
    uuid,
    chemin.normalize('NFC'),
  ])
  const filtre = env.A11Y_FILTER
  if (filtre) {
    const cibles = normalise.filter(
      ([uuid, chemin]) =>
        estAnalysable(chemin) &&
        (chemin.includes(filtre.normalize('NFC')) || uuid === filtre),
    )
    const explication = [`Sélection : A11Y_FILTER="${filtre}".`]
    if (cibles.length === 0) {
      explication.push(`Aucun exercice ne correspond. ${POUR_CIBLER}`)
    }
    return { cibles, explication, ecartes: [] }
  }

  const explication: string[] = []
  let modifies: string[] | null
  if (env.CHANGED_FILES !== undefined) {
    modifies = lisCheminsModifies(env.CHANGED_FILES)
    explication.push('Sélection : exercices de CHANGED_FILES.')
  } else {
    modifies = depuisGit()
    explication.push(
      modifies === null
        ? 'CHANGED_FILES absent et git indisponible : rien à analyser.'
        : 'CHANGED_FILES absent : analyse des exercices modifiés depuis le départ de la branche (origin/main), commits, fichiers en cours et nouveaux fichiers.',
      'Le catalogue entier n’est pas analysé : les exercices déjà publiés ne sont pas migrés et produiraient des milliers de signalements.',
    )
  }
  const demandes = new Set(modifies ?? [])
  const cibles = normalise.filter(
    ([, chemin]) => demandes.has(chemin) && estAnalysable(chemin),
  )
  const retenus = new Set(cibles.map(([, chemin]) => chemin))
  const connus = new Set(normalise.map(([, chemin]) => chemin))
  const ecartes = [...demandes].filter(
    (chemin) =>
      !retenus.has(chemin) &&
      chemin.endsWith('.ts') &&
      !chemin.endsWith('.test.ts') &&
      (connus.has(chemin) || !/\s/.test(chemin)),
  )
  if (cibles.length === 0) {
    explication.push(`Aucun exercice modifié à analyser. ${POUR_CIBLER}`)
  }
  return { cibles, explication, ecartes }
}

// ---------------------------------------------------------------------------
// Analyse du HTML
// ---------------------------------------------------------------------------

const DEBUT = '(?<![\\p{L}\\p{N}])'
const FIN = '(?![\\p{L}\\p{N}])'
const COULEURS =
  '(?:rouge|bleue?|verte?|jaune|orange|violette?|rose|noire?|blanc(?:he)?|grise?|marron|turquoise|mauve|cyan|magenta)s?'
// Éléments d'une figure. Pas d'objet du quotidien (boule, dé, jeton, carte…) :
// dans « 3 boules rouges », la couleur est une donnée de l'énoncé.
const ELEMENTS =
  '(?:segment|droite|demi-droite|courbe|point|figure|triangle|carré|rectangle|losange|parallélogramme|polygone|quadrilatère|cercle|disque|arc|angle|côté|sommet|vecteur|flèche|trait|tracé|zone|surface|partie|région|domaine|case|cellule|ligne|colonne|forme|barre|portion|bande|graphique|représentation|diagramme)s?'

const MOTIF_ATTRIBUT = new RegExp(
  `${DEBUT}${ELEMENTS}\\s+(?:de\\s+couleur\\s+)?(?:${COULEURS}|grisée?s?|coloriée?s?|colorée?s?)${FIN}(?!\\s*§)`,
  'giu',
)
const MOTIF_EN_COULEUR = new RegExp(`${DEBUT}en\\s+${COULEURS}${FIN}`, 'giu')
const MOTIF_COTE = new RegExp(`${DEBUT}à\\s+(?:gauche|droite)${FIN}`, 'giu')
const MOTIF_CI = new RegExp(
  `${DEBUT}${ELEMENTS}(?:\\s+(?:représentée?s?|tracée?s?|donnée?s?))?\\s+ci-(?:dessous|dessus|contre)${FIN}`,
  'giu',
)
// « en rouge la tangente $T$ », « en rouge, la médiatrice du segment $[AB]$ » :
// l'élément est nommé juste après la couleur.
const NOMME_ENSUITE =
  /^\s*,?\s*(?:la|le|les|l['’]|une?|des)\s*(?:[\p{L}'’-]+\s+){0,4}§/iu
// « Le vecteur doit être en vert » : ce que l'élève doit produire.
const ATTENDU_EN_COULEUR = /(?<!\p{L})(?:soit|doit\s+être)\s+$/iu

// Consigne à faire en couleur : l'élève produit, personne ne désigne.
const ACTION_EN_COULEUR =
  /(?:^|[^\p{L}])(?:colorier|colorie|coloriez|tracer|trace|tracez|construire|repasser|écrire|entourer|surligner|hachurer|placer|représenter|dessiner|griser|souligner|marquer)(?![\p{L}])/iu

const avant = (texte: string, index: number, longueur: number) =>
  texte.slice(Math.max(0, index - longueur), index)

/** Début de la phrase qui précède `index`. */
const debutDePhrase = (texte: string, index: number) => {
  const precedent = avant(texte, index, 200)
  return precedent.slice(precedent.search(/[^.!?:;]*$/))
}

const extraitAutour = (texte: string, index: number, longueur: number) =>
  `${texte.slice(Math.max(0, index - 25), index + longueur + 25)}`
    .replaceAll('§', '…')
    .trim()

/** Sens mathématique ou sens de lecture : pas une désignation d'un élément. */
function coteEstUnSens(texte: string, index: number, longueur: number) {
  const suite = texte.slice(index + longueur, index + longueur + 40)
  const precedent = avant(texte, index, 30)
  return (
    // Limite, dérivée ou continuité à gauche, membre et lecture de gauche à droite.
    /(?:limite|dérivée?|dérivable|continu\p{L}*|tangente|demi-tangente)s?\s+$/iu.test(
      precedent,
    ) ||
    /(?:^|\s)de\s+(?:gauche|droite)\s+$/iu.test(precedent) ||
    // « en haut à gauche » : place d'un nombre dans une case de grille.
    /(?<!\p{L})en\s+(?:haut|bas)\s+$/iu.test(precedent) ||
    /(?<!\p{L})(?:tourn\p{L}*|pivot\p{L}*|avanc\p{L}*|recul\p{L}*|décal\p{L}*|déplac\p{L}*|translat\p{L}*|gliss\p{L}*|va|vont|aller|allez)\s+$/iu.test(
      precedent,
    ) ||
    // Relatif à un élément nommé : « à gauche de $A$ », « à droite de la virgule ».
    /^\s*(?:de|du|des|d’|d')\s*(?:§|la\s+virgule|l[’']unité|ce\s+chiffre|chaque\s+chiffre|la\s+barre|l[’']égalité|signe|symbole|nombre|chiffre|zéro)/iu.test(
      suite,
    )
  )
}

/**
 * Heuristique de la vérification 5 : texte d'un énoncé, hors formules, figures
 * et champs. `$…$` devient `§` pour reconnaître un élément nommé.
 *
 * « La figure ci-dessous » est écartée quand il n'y a qu'une figure : elle est sans
 * ambiguïté, et ce motif formait presque tous les signalements sur un échantillon
 * de 400 exercices. Il ne compte qu'à partir de deux figures.
 */
export function chercheDesignations(texte: string, nbFigures = 0): string[] {
  const propre = texte
    .replace(/\$\$[^$]*\$\$/g, '§')
    .replace(/\$[^$]*\$/g, '§')
    .replace(/\s+/g, ' ')
  const trouves: string[] = []
  const ajoute = (index: number, longueur: number) =>
    trouves.push(extraitAutour(propre, index, longueur))

  for (const m of propre.matchAll(MOTIF_ATTRIBUT)) ajoute(m.index, m[0].length)
  for (const m of propre.matchAll(MOTIF_EN_COULEUR)) {
    const phrase = debutDePhrase(propre, m.index)
    // « Tracer … en rouge » est une consigne ; « $(d)$ en rouge » nomme déjà l'élément.
    if (ACTION_EN_COULEUR.test(phrase) || phrase.includes('§')) continue
    if (ATTENDU_EN_COULEUR.test(phrase)) continue
    if (NOMME_ENSUITE.test(propre.slice(m.index + m[0].length))) continue
    ajoute(m.index, m[0].length)
  }
  for (const m of propre.matchAll(MOTIF_COTE)) {
    if (!coteEstUnSens(propre, m.index, m[0].length))
      ajoute(m.index, m[0].length)
  }
  if (nbFigures >= 2) {
    for (const m of propre.matchAll(MOTIF_CI)) ajoute(m.index, m[0].length)
  }
  return trouves
}

const NON_BRUT = /[$\\{}]|<\/?(?:br|span|sub|sup|b|i|em|strong)\b[^<>]*>/
const VALEUR_CASSEE =
  /(?<![\p{L}])(?:undefined|NaN)(?![\p{L}])|\[object Object\]/u

const aUnAncetrePersonnalise = (element: Element) => {
  for (let p = element.parentElement; p; p = p.parentElement) {
    if (p.localName.includes('-')) return true
  }
  return false
}

/**
 * Le moteur écrit lui-même les cases de QCM (`name="checkEx…"`) et les champs
 * placés dans un élément personnalisé (`<mathalea-textfield>`…).
 */
const estChampDuMoteur = (champ: Element) =>
  (champ.getAttribute('name') ?? '').startsWith('checkEx') ||
  aUnAncetrePersonnalise(champ)

export type AnalyseFragment = { figures: number; constats: ConstatBrut[] }

/** Analyse un morceau de HTML généré, sans exécuter ses éléments personnalisés. */
export function analyseFragment(
  html: string,
  enonce: boolean,
): AnalyseFragment {
  // Un document de DOMParser n'a pas de contexte de navigation : aucun élément
  // personnalisé n'y écrit son contenu, seul reste le HTML produit par l'exercice.
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const constats: ConstatBrut[] = []

  const figures = Array.from(doc.querySelectorAll('svg.mathalea2d'))
  for (const figure of figures) {
    const nom = (figure.getAttribute('aria-label') ?? '').trim()
    const estNommee = figure.getAttribute('role') === 'img' && nom !== ''
    if (!estNommee && figure.getAttribute('aria-hidden') !== 'true') {
      constats.push({ code: 'figure' })
    }
    if (nom !== '' && (NON_BRUT.test(nom) || VALEUR_CASSEE.test(nom))) {
      constats.push({ code: 'description', extrait: nom.slice(0, 90) })
    }
  }
  for (const champ of doc.querySelectorAll('input, select, textarea')) {
    if (estChampDuMoteur(champ)) continue
    constats.push({ code: 'champ', extrait: `<${champ.localName}>` })
  }
  for (const image of doc.querySelectorAll('img:not([alt])')) {
    const source = (image.getAttribute('src') ?? '').split('/').pop() ?? ''
    constats.push({ code: 'image', extrait: source.slice(0, 60) })
  }
  if (enonce) {
    doc
      .querySelectorAll('svg, .svgContainer, script, style, math-field')
      .forEach((element) => element.remove())
    const noeuds: string[] = []
    const parcours = doc.createTreeWalker(
      doc.body,
      4 /* NodeFilter.SHOW_TEXT */,
    )
    while (parcours.nextNode())
      noeuds.push(parcours.currentNode.nodeValue ?? '')
    for (const extrait of chercheDesignations(
      noeuds.join(' '),
      figures.length,
    )) {
      constats.push({ code: 'designation', extrait })
    }
  }
  return { figures: figures.length, constats }
}

// ---------------------------------------------------------------------------
// Bilan et rapport
// ---------------------------------------------------------------------------

type Occurrence = {
  nombre: number
  premier: string
  extraits: Map<string, string>
}

export class BilanExercice {
  figures = 0
  readonly erreurs: string[] = []
  readonly occurrences = new Map<CodeConstat, Occurrence>()

  constructor(
    readonly chemin: string,
    readonly uuid: string,
  ) {}

  private note(code: CodeConstat, premier: string, extrait?: string) {
    const occurrence = this.occurrences.get(code) ?? {
      nombre: 0,
      premier,
      extraits: new Map<string, string>(),
    }
    occurrence.nombre++
    if (extrait) {
      // Une même phrase revient à chaque tirage avec d'autres nombres et noms.
      const cle = extrait.replace(/\d+/g, '#').replace(/\b[A-Z]\b/g, '#')
      if (!occurrence.extraits.has(cle)) occurrence.extraits.set(cle, extrait)
    }
    this.occurrences.set(code, occurrence)
  }

  ajouteFragment({ lieu, html, enonce }: Fragment, tirage: Tirage) {
    const { figures, constats } = analyseFragment(html, enonce)
    this.figures += figures
    const reglages = [
      `graine ${tirage.graine}`,
      ...(tirage.cle ? [tirage.cle] : []),
      ...(tirage.interactif ? ['interactif'] : []),
      `${enonce ? '' : 'correction, '}${lieu}`,
    ].join(', ')
    for (const { code, extrait } of constats) {
      this.note(code, reglages, extrait)
    }
  }

  signaleDemandeLaVue() {
    if (!this.occurrences.has('demandeLaVue')) {
      this.note('demandeLaVue', 'constructeur')
    }
  }

  get nbDefauts() {
    return DEFAUTS.filter((code) => this.occurrences.has(code)).length
  }

  get nbARelire() {
    return this.occurrences.size - this.nbDefauts
  }
}

function lignesConstat(code: CodeConstat, bilan: BilanExercice) {
  const occurrence = bilan.occurrences.get(code)
  if (!occurrence) return []
  const { titre, conseil } = CONSEILS[code]
  const estDefaut = DEFAUTS.includes(code)
  const combien =
    code === 'figure'
      ? `${occurrence.nombre} figure(s) sur ${bilan.figures} `
      : code === 'demandeLaVue'
        ? ''
        : `${occurrence.nombre} fois : `
  const extraits = [...occurrence.extraits.values()].slice(0, 3)
  const citation = extraits.length
    ? ` : ${extraits.map((extrait) => `« ${extrait} »`).join(' ; ')}`
    : ''
  const lieu = code === 'demandeLaVue' ? '' : ` (${occurrence.premier})`
  return [
    `  ${estDefaut ? 'Défaut' : 'À relire'} : ${combien}${titre}${lieu}${citation}.`,
    `    → ${conseil} Guide : ${GUIDE}#${CONSEILS[code].ancre}`,
  ]
}

const ORDRE: CodeConstat[] = [...DEFAUTS, 'demandeLaVue', 'designation']

/** Rapport complet, affiché à la fin du test. Il ne décide de rien : il informe. */
export function redigeRapport(selection: Selection, bilans: BilanExercice[]) {
  const lignes = [
    '',
    '═══ Contrôle d’accessibilité (informatif : ne bloque jamais une livraison) ═══',
    ...selection.explication,
  ]
  if (selection.ecartes.length) {
    lignes.push(
      `Non analysés (archive, outil ou fichier parent sans uuid) : ${selection.ecartes.join(', ')}.`,
    )
  }
  const signales = bilans.filter(
    (bilan) => bilan.occurrences.size > 0 || bilan.erreurs.length > 0,
  )
  for (const bilan of signales) {
    lignes.push(
      '',
      `${bilan.chemin} (uuid ${bilan.uuid}) : ${bilan.nbDefauts} défaut(s), ${bilan.nbARelire} à relire`,
    )
    for (const code of ORDRE) lignes.push(...lignesConstat(code, bilan))
    for (const erreur of bilan.erreurs) {
      lignes.push(`  Non analysé : ${erreur}.`)
    }
  }
  const nbDefauts = bilans.reduce((total, bilan) => total + bilan.nbDefauts, 0)
  const nbARelire = bilans.reduce((total, bilan) => total + bilan.nbARelire, 0)
  lignes.push('')
  if (signales.length > 0) {
    lignes.push(
      'Exercice déjà publié : traiter ce que la modification ajoute ou retouche ; ne pas migrer tout le fichier. Ne pas changer l’ordre des tirages (pnpm stability:check).',
    )
  }
  lignes.push(
    `Bilan : ${bilans.length} exercice(s) analysé(s), ${nbDefauts} type(s) de défaut, ${nbARelire} point(s) à relire. Documentation : documentation/tests/controle-accessibilite.md`,
    '',
  )
  return lignes.join('\n')
}
