/**
 * Nom accessible des champs de réponse (RGAA 11.1 et 11.2).
 *
 * Sans `aria-label`, MathLive annonce « math input field » : en anglais et sans
 * contexte. Le nom est calculé depuis le DOM une fois le champ connecté, et non
 * dans le HTML de l'énoncé : le numéro affiché reste juste quel que soit l'index
 * interne du champ (`2 * i + 100`…), et les sorties LaTeX, Typst et AMC ne
 * changent pas.
 *
 * @see documentation/developpement/maintenance-moteur/interactivite/custom-elements.md
 */

/** Attribut d'un conteneur qui remplace « Exercice n, question q » (ex. Course aux nombres). */
const ATTRIBUT_PREFIXE = 'data-prefixe-champs'
const ID_QUESTION = /^exercice(\d+)Q(\d+)$/
/** `champTexteEx2Q3L1C2`, `MetaInteractif2dEx0Q1field2`, `multi-mathfieldEx0Q1-champ1`… */
const ID_CHAMP = /Ex(\d+)Q(\d+)/
const ID_CELLULE = /L\d+C\d+$/
/** Composants dont le shadow DOM contient des champs. */
const HOTES_SHADOW = 'multi-mathfield, tableau-signes-variations'
const SELECTEUR_CHAMPS = `math-field, mathalea-textfield input, ${HOTES_SHADOW}`

const SYMBOLES_LATEX: Record<string, string> = {
  approx: ' ≈ ',
  div: ' ÷ ',
  dots: '…',
  ge: ' ≥ ',
  geq: ' ≥ ',
  in: ' ∈ ',
  infty: '∞',
  ldots: '…',
  le: ' ≤ ',
  leq: ' ≤ ',
  ne: ' ≠ ',
  neq: ' ≠ ',
  pi: 'π',
  times: ' × ',
}

/** « Exercice 2, question 3 », à partir des index internes (qui commencent à 0). */
export function prefixeChamp(
  numeroExercice: number,
  questionIndex: number,
): string {
  return `Exercice ${numeroExercice + 1}, question ${questionIndex + 1}`
}

/** « réponse » pour un champ seul, « réponse 2 sur 4 » pour plusieurs champs. */
export function reponseNumerotee(rang: number, total: number): string {
  return total > 1 ? `réponse ${rang} sur ${total}` : 'réponse'
}

/** « ligne 2 (Prix), colonne 3 » : les entêtes précisent la position quand ils sont lisibles. */
export function positionDansTableau(
  ligne: number,
  colonne: number,
  enteteLigne = '',
  enteteColonne = '',
): string {
  const precise = (entete: string) => (entete === '' ? '' : ` (${entete})`)
  return `ligne ${ligne}${precise(enteteLigne)}, colonne ${colonne}${precise(enteteColonne)}`
}

/** Exercice et question d'un identifiant de champ, s'il les contient. */
export function lireIdentifiantChamp(
  id: string,
): { numeroExercice: number; questionIndex: number } | null {
  const trouve = ID_CHAMP.exec(id)
  if (trouve == null) return null
  return {
    numeroExercice: Number(trouve[1]),
    questionIndex: Number(trouve[2]),
  }
}

/**
 * Transcrit un LaTeX simple en texte lisible par une synthèse vocale, ou renvoie
 * `null` s'il contient une commande qu'on ne sait pas lire : un nom sans
 * fragment de code vaut mieux qu'un nom complet mais illisible.
 */
export function latexVersTexte(latex: string): string | null {
  let texte = latex.replace(/\\(?:left|right|displaystyle)\b/g, '')
  const commandeAContenu =
    /\\(?:text|textbf|textit|mathrm|mathbf|mathit|mathcal|mathbb|mathscr|operatorname|boldsymbol)\{([^{}]*)\}/g
  texte = texte.replace(commandeAContenu, '$1')
  texte = texte
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
    .replace(/\{,\}/g, ',')
    .replace(/\\%/g, '%')
    .replace(/\\(?:[,;:! ]|quad\b|qquad\b)|~/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, (commande, nom: string) => {
      return SYMBOLES_LATEX[nom] ?? commande
    })
    .replace(/\^\{?2\}?/g, '²')
    .replace(/\^\{?3\}?/g, '³')
    .replace(/_\{?(\w+)\}?/g, ' indice $1')
    .replace(/\^\{?(-?\w+)\}?/g, ' puissance $1')
    .replace(/[{}]/g, '')
  if (/[\\^_]/.test(texte)) return null
  return texte
    .replace(/\s*=\s*/g, ' = ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Nettoie un libellé visible dont les formules sont entre `$` : renvoie `''` s'il
 * contient une formule illisible ou s'il n'apporte rien (« = », « : »…).
 */
export function libellePourNom(source: string): string {
  const morceaux = source.split('$').map((morceau, index) => {
    return index % 2 === 1 ? latexVersTexte(morceau) : morceau
  })
  if (morceaux.includes(null)) return ''
  const libelle = morceaux
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s:]+$/, '')
    .trim()
  if (!/[\p{L}\p{N}]/u.test(libelle)) return ''
  return libelle.toLowerCase() === 'réponse' ? '' : libelle
}

/**
 * Texte d'un élément, formules KaTeX remises sous leur forme source : lire les
 * nœuds tels quels donnerait la formule en double (MathML et HTML), plus son
 * annotation LaTeX.
 */
function texteSource(noeud: Node): string {
  if (noeud.nodeType === Node.TEXT_NODE) return noeud.textContent ?? ''
  if (noeud.nodeType !== Node.ELEMENT_NODE) return ''
  const element = noeud as Element
  if (element.matches('math-field, script, style, svg, [aria-hidden="true"]')) {
    return ''
  }
  if (element.classList.contains('katex')) {
    const latex = element.querySelector('annotation')?.textContent
    // Une commande inconnue rend tout le libellé illisible (voir `latexVersTexte`).
    return `$${latex ?? '\\illisible'}$`
  }
  return Array.from(element.childNodes).map(texteSource).join('')
}

function parentComposite(element: Element): Element | null {
  if (element.parentElement != null) return element.parentElement
  const racine = element.getRootNode()
  return racine instanceof ShadowRoot ? racine.host : null
}

/** Première ancêtre (shadow DOM compris) qui représente une question affichée. */
function conteneurDeQuestion(depart: Element): Element | null {
  for (
    let element: Element | null = depart;
    element != null;
    element = parentComposite(element)
  ) {
    if (element.hasAttribute(ATTRIBUT_PREFIXE) || ID_QUESTION.test(element.id))
      return element
  }
  return null
}

function prefixeDuConteneur(conteneur: Element): string {
  const prefixe = conteneur.getAttribute(ATTRIBUT_PREFIXE)
  if (prefixe != null && prefixe !== '') return prefixe
  const [, numeroExercice, questionIndex] = ID_QUESTION.exec(conteneur.id) ?? []
  return prefixeChamp(Number(numeroExercice), Number(questionIndex))
}

/** Les champs d'une racine dans l'ordre du document, shadow DOM des composants compris. */
function champsDe(racine: ParentNode): HTMLElement[] {
  const champs: HTMLElement[] = []
  racine.querySelectorAll<HTMLElement>(SELECTEUR_CHAMPS).forEach((element) => {
    if (element.matches(HOTES_SHADOW)) {
      if (element.shadowRoot != null)
        champs.push(...champsDe(element.shadowRoot))
    } else {
      champs.push(element)
    }
  })
  return champs
}

function nomPrecis(champ: HTMLElement): string {
  return champ.dataset.nomAccessible?.trim() ?? ''
}

function descriptionCellule(cellule: HTMLTableCellElement): string {
  const ligne = cellule.parentElement as HTMLTableRowElement
  const table = cellule.closest('table')
  const entete = (candidate?: HTMLTableCellElement) => {
    if (candidate == null || candidate === cellule) return ''
    return candidate.tagName === 'TH'
      ? libellePourNom(texteSource(candidate))
      : ''
  }
  return positionDansTableau(
    ligne.rowIndex + 1,
    cellule.cellIndex + 1,
    entete(ligne.cells[0]),
    entete(table?.rows[0]?.cells[cellule.cellIndex]),
  )
}

function celluleDuChamp(champ: HTMLElement): HTMLTableCellElement | null {
  if (!ID_CELLULE.test(champ.id) && champ.dataset.cellId == null) return null
  return champ.closest('td, th')
}

/** Un `math-field` à trous n'a qu'un point de focus, même avec plusieurs blancs. */
function nombreDeTrous(champ: HTMLElement): number {
  return (champ.textContent?.match(/\\placeholder\[/g) ?? []).length
}

function libelleVisible(champ: HTMLElement): string {
  if (champ.id === '') return ''
  const racine = champ.getRootNode() as ParentNode
  const label = Array.from(racine.querySelectorAll('label[for]')).find(
    (candidat) => candidat.getAttribute('for') === champ.id,
  )
  // Hors cellule, dans la légende d'un tableau : « Moyenne : [champ] » (ex. 2S20-10).
  const libelle =
    label ?? (champ.closest('caption') == null ? null : champ.parentElement)
  return libelle == null ? '' : libellePourNom(texteSource(libelle))
}

function descriptionChamp(
  champ: HTMLElement,
  rang: number,
  total: number,
): string {
  const precis = nomPrecis(champ)
  if (precis !== '') return precis
  const cellule = celluleDuChamp(champ)
  if (cellule != null) return descriptionCellule(cellule)
  const reponse = reponseNumerotee(rang, total)
  const trous = nombreDeTrous(champ)
  if (trous > 1) {
    const aCompleter = `${trous} réponses à compléter`
    return total > 1 ? `${reponse}, ${aCompleter}` : aCompleter
  }
  const libelle = libelleVisible(champ)
  return libelle === '' ? reponse : `${reponse}, ${libelle}`
}

const nomsPoses = new WeakMap<HTMLElement, string>()

/** Pose le nom, sans écraser un `aria-label` écrit par ailleurs (ex. par un exercice). */
function poseNom(champ: HTMLElement, nom: string): void {
  const actuel = champ.getAttribute('aria-label')
  if (actuel != null && actuel !== nomsPoses.get(champ)) return
  if (actuel !== nom) champ.setAttribute('aria-label', nom)
  nomsPoses.set(champ, nom)
}

function nommeGroupe(champs: HTMLElement[], prefixe: string): void {
  const total = champs.filter((champ) => nomPrecis(champ) === '').length
  let rang = 0
  for (const champ of champs) {
    if (nomPrecis(champ) === '') rang++
    poseNom(champ, `${prefixe} : ${descriptionChamp(champ, rang, total)}`)
  }
}

/**
 * Nomme tous les champs de la question de `depart` (un champ ou un composant) :
 * le rang « 2 sur 4 » dépend des autres champs, donc chaque champ ajouté ou retiré
 * doit renommer toute la question. Sans question identifiable (ex. page de test),
 * rien n'est posé et MathLive garde son nom par défaut.
 * @returns les champs examinés
 */
export function nommeChampsAutourDe(depart: Element): HTMLElement[] {
  const racine = depart.getRootNode({ composed: true })
  if (!(racine instanceof Document)) return []
  const conteneur = conteneurDeQuestion(depart)
  if (conteneur != null) {
    const champs = champsDe(conteneur)
    nommeGroupe(champs, prefixeDuConteneur(conteneur))
    return champs
  }
  const reference = lireIdentifiantChamp(depart.id)
  if (reference == null) return []
  const champs = champsDe(racine).filter((champ) => {
    const autre = lireIdentifiantChamp(champ.id)
    return (
      autre?.numeroExercice === reference.numeroExercice &&
      autre?.questionIndex === reference.questionIndex
    )
  })
  nommeGroupe(
    champs,
    prefixeChamp(reference.numeroExercice, reference.questionIndex),
  )
  return champs
}

/**
 * Nomme les champs d'une zone déjà rendue, y compris ceux écrits en HTML brut
 * qu'aucun composant ne prend en charge (`tableau2x2`, certains exercices).
 */
export function nommeChampsDe(racine: ParentNode): void {
  const vus = new Set<HTMLElement>()
  for (const champ of champsDe(racine)) {
    if (vus.has(champ)) continue
    nommeChampsAutourDe(champ).forEach((autre) => vus.add(autre))
  }
}
