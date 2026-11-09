import {
  OMR_COLONNES_DEFAUT,
  OMR_GUTTER_DEFAUT,
  type OmrCarryOver,
} from './buildOmrDocument'

/**
 * Relecture des réglages de mise en page dans le gabarit.
 *
 * La palette de l'aperçu ne tient aucun état à elle : elle écrit dans le code,
 * et le code est relu. C'est ce qui permet à un réglage fait à la souris de
 * survivre à une régénération du gabarit (changement de police, nouvelles
 * données) et, réciproquement, à une retouche faite au clavier d'être reprise
 * par les pastilles. Même principe que `harvestCarryOver` de la vue
 * « Impression » et `harvestSlidesCarryOver` du diaporama, en beaucoup plus
 * petit : trois formes de lignes seulement.
 */

/** `#let ex3-colonnes = 2` */
const LIGNE_COLONNES = /^#let ex(\d+)-colonnes = (.+)$/gm
/** `#let ex3-gutter = 1.2em` */
const LIGNE_GUTTER = /^#let ex(\d+)-gutter = (.+)$/gm
/** `  "2": [#pagebreak(weak: true)],` dans le bloc `#let omr-insertions` */
const LIGNE_INSERTION = /^ {2}"(\d+)": \[(.*)\],$/gm

/** Saut de page insérable après un exercice depuis la palette. */
export const OMR_SAUT_DE_PAGE = '#pagebreak(weak: true)'

/**
 * Texte libre insérable après un exercice.
 *
 * Le texte est passé comme **chaîne** Typst, jamais comme contenu `[...]` :
 * un crochet ou un dièse saisis par le professeur y resteraient des caractères
 * ordinaires, au lieu d'ouvrir un bloc de contenu ou d'appeler une fonction au
 * milieu du gabarit. Restent à échapper le backslash et le guillemet, qui
 * termineraient la chaîne elle-même.
 */
export function omrSnippetTexte(texte: string): string {
  const echappe = texte.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `#block(above: 1em, below: 1em, text(weight: "bold", "${echappe}"))`
}

/**
 * Découpe le contenu d'une entrée d'insertion en fragments distincts.
 *
 * Les fragments sont concaténés séparés d'une espace à l'écriture ; les
 * redécouper est ce qui permet d'en supprimer un seul depuis la palette. Les
 * sauts de page servent de bornes ; ce qui les sépare est un fragment libre.
 */
export function decouperInsertions(contenu: string): string[] {
  const texte = contenu.trim()
  if (texte === '') return []
  const fragments: string[] = []
  let curseur = 0
  for (const match of texte.matchAll(/#pagebreak\(weak: true\)/g)) {
    const avant = texte.slice(curseur, match.index).trim()
    if (avant !== '') fragments.push(avant)
    fragments.push(match[0])
    curseur = (match.index ?? 0) + match[0].length
  }
  const apres = texte.slice(curseur).trim()
  if (apres !== '') fragments.push(apres)
  return fragments
}

/**
 * Nombre d'exercices que le gabarit sait mettre en page.
 *
 * Le gabarit déclare une variable par exercice ; un document qui en compterait
 * davantage — un exercice dont la version d'un élève produit des questions là
 * où celle de l'aperçu n'en produisait pas — référencerait une variable
 * inexistante et ne compilerait pas. C'est ce que ce décompte permet de
 * détecter avant de lancer la génération finale.
 */
export function nombreExercicesDeclares(gabarit: string): number {
  const numeros = [...gabarit.matchAll(LIGNE_COLONNES)].map((match) =>
    Number(match[1]),
  )
  return numeros.length === 0 ? 0 : Math.max(...numeros)
}

/** Relit dans le gabarit les colonnes, espacements et insertions réglés. */
export function harvestOmrCarryOver(gabarit: string): OmrCarryOver {
  const layout: NonNullable<OmrCarryOver['layout']> = {}
  const insertions: NonNullable<OmrCarryOver['insertions']> = {}

  for (const match of gabarit.matchAll(LIGNE_COLONNES)) {
    const numero = Number(match[1])
    const valeur = match[2].trim()
    // les valeurs par défaut ne sont pas mémorisées : elles seront de toute
    // façon réémises, et les garder ferait diverger deux gabarits identiques
    if (valeur !== OMR_COLONNES_DEFAUT) {
      layout[numero] = { ...layout[numero], colonnes: valeur }
    }
  }
  for (const match of gabarit.matchAll(LIGNE_GUTTER)) {
    const numero = Number(match[1])
    const valeur = match[2].trim()
    if (valeur !== OMR_GUTTER_DEFAUT) {
      layout[numero] = { ...layout[numero], gutter: valeur }
    }
  }
  for (const match of gabarit.matchAll(LIGNE_INSERTION)) {
    const fragments = decouperInsertions(match[2])
    if (fragments.length > 0) insertions[Number(match[1])] = fragments
  }

  const carryOver: OmrCarryOver = {}
  if (Object.keys(layout).length > 0) carryOver.layout = layout
  if (Object.keys(insertions).length > 0) carryOver.insertions = insertions
  return carryOver
}

/**
 * Renumérote les réglages quand la liste des exercices change.
 *
 * Un réglage est attaché au *rang* de l'exercice, pas à l'exercice lui-même :
 * supprimer le premier ferait glisser les colonnes de l'exercice 2 sur
 * l'exercice 3. On les décale donc en même temps que la liste.
 *
 * @param retire rang supprimé, ou `undefined` pour une insertion
 * @param insere rang créé, ou `undefined` pour une suppression
 */
export function decalerOmrCarryOver(
  carryOver: OmrCarryOver,
  { retire, insere }: { retire?: number; insere?: number },
): OmrCarryOver {
  const rang = (numero: number): number | null => {
    let suivant = numero
    if (retire != null) {
      if (numero === retire) return null
      if (numero > retire) suivant -= 1
    }
    if (insere != null && suivant >= insere) suivant += 1
    return suivant
  }
  const layout: NonNullable<OmrCarryOver['layout']> = {}
  for (const [cle, valeur] of Object.entries(carryOver.layout ?? {})) {
    const suivant = rang(Number(cle))
    if (suivant != null) layout[suivant] = valeur
  }
  const insertions: NonNullable<OmrCarryOver['insertions']> = {}
  for (const [cle, fragments] of Object.entries(carryOver.insertions ?? {})) {
    const numero = Number(cle)
    // le repère 0 précède le premier exercice : il ne bouge jamais, et
    // l'insertion qui suivait un exercice supprimé se rattache au précédent
    const suivant = numero === 0 ? 0 : (rang(numero) ?? numero - 1)
    insertions[suivant] = [...(insertions[suivant] ?? []), ...fragments]
  }
  const suivant: OmrCarryOver = {}
  if (Object.keys(layout).length > 0) suivant.layout = layout
  if (Object.keys(insertions).length > 0) suivant.insertions = insertions
  return suivant
}

/** Échange les réglages de deux exercices (déplacement dans la liste). */
export function echangerOmrCarryOver(
  carryOver: OmrCarryOver,
  a: number,
  b: number,
): OmrCarryOver {
  const permute = (numero: number) =>
    numero === a ? b : numero === b ? a : numero
  const layout: NonNullable<OmrCarryOver['layout']> = {}
  for (const [cle, valeur] of Object.entries(carryOver.layout ?? {})) {
    layout[permute(Number(cle))] = valeur
  }
  const insertions: NonNullable<OmrCarryOver['insertions']> = {}
  for (const [cle, fragments] of Object.entries(carryOver.insertions ?? {})) {
    const numero = Number(cle)
    insertions[numero === 0 ? 0 : permute(numero)] = fragments
  }
  const suivant: OmrCarryOver = {}
  if (Object.keys(layout).length > 0) suivant.layout = layout
  if (Object.keys(insertions).length > 0) suivant.insertions = insertions
  return suivant
}

/** Valeur courante d'un réglage de mise en page, telle qu'écrite au gabarit. */
export function lireReglage(
  gabarit: string,
  numero: number,
  nom: 'colonnes' | 'gutter',
): string | undefined {
  const motif = new RegExp(`^#let ex${numero}-${nom} = (.*)$`, 'm')
  return gabarit.match(motif)?.[1].trim()
}

/**
 * Réécrit une ligne `#let exN-colonnes = …` ou `#let exN-gutter = …`.
 *
 * @returns le gabarit inchangé quand la ligne n'existe pas — la palette peut
 *   viser un exercice que le gabarit courant ne décrit plus (code réécrit à la
 *   main), et c'est sans conséquence
 */
export function remplacerReglage(
  gabarit: string,
  numero: number,
  nom: 'colonnes' | 'gutter',
  valeur: string,
): string {
  const motif = new RegExp(`^#let ex${numero}-${nom} = .*$`, 'm')
  return gabarit.replace(motif, `#let ex${numero}-${nom} = ${valeur}`)
}

/** Réécrit l'entrée d'insertion du point `numero` dans `#let omr-insertions`. */
export function remplacerInsertions(
  gabarit: string,
  numero: number,
  fragments: readonly string[],
): string {
  const motif = new RegExp(`^ {2}"${numero}": \\[.*\\],$`, 'm')
  return gabarit.replace(motif, `  "${numero}": [${fragments.join(' ')}],`)
}
