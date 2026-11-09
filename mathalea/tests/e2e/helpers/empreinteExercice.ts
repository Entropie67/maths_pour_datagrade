/**
 * Empreintes de stabilité des exercices.
 *
 * Objectif : détecter qu'une modification d'exercice (ou d'un utilitaire
 * partagé) change les valeurs tirées au sort pour une graine donnée.
 * Les liens partagés par les utilisateurs (sujets et corrigés) contiennent la
 * graine *et* les paramètres (`s`, `s2`, `s3`) : si les tirages bougent, les
 * corrigés déjà distribués ne correspondent plus à l'énoncé.
 *
 * Une empreinte est calculée par combinaison de paramètres, avec une seule
 * graine : un tirage déplacé décale les valeurs quelle que soit la graine,
 * alors qu'une dérive cachée derrière `if (this.sup === 3)` ne se voit qu'en
 * changeant de paramètre.
 *
 * Chaque combinaison porte deux empreintes :
 * - `nb` : les nombres de l'énoncé. C'est le contrat bloquant.
 * - `tx` : le texte normalisé complet (énoncé + correction). Purement
 *   informatif : il bouge dès qu'on corrige une coquille, ce qui est autorisé.
 */

import { CRC32 } from '../../../src/modules/crc32'

/** Nombre de questions imposé lors du calcul d'une empreinte. */
export const NB_QUESTIONS_EMPREINTE = 3

/**
 * Nombre de valeurs testées pour `sup`, `sup2` et `sup3`.
 *
 * On prend toujours les premières valeurs (1, 2, 3…) plutôt qu'un
 * échantillonnage : ajouter un niveau à un formulaire ne doit jamais retirer
 * de la couverture à ceux qui existaient déjà.
 */
export const NB_VALEURS_PAR_PARAMETRE = [3, 2, 2]

/**
 * Nombre maximal de tirages aléatoires autorisés pour une génération.
 *
 * Certains exercices contiennent une boucle de rejet non gardée : ils tirent
 * jusqu'à trouver une valeur acceptable, et pour certains réglages cette valeur
 * n'existe pas. Le test doit signaler le problème, pas s'y bloquer.
 * Un exercice ordinaire consomme quelques milliers de tirages.
 */
export const MAX_TIRAGES_PAR_GENERATION = 2_000_000

export type GardeDeBoucle = {
  /** Ouvre le compteur avant une génération. */
  demarre: () => void
  /** Referme le compteur et renvoie le nombre de tirages consommés. */
  arrete: () => number
}

/**
 * Surveille la consommation de `Math.random` pour qu'une boucle de rejet sans
 * issue lève une exception au lieu de figer la suite de tests.
 *
 * `Math.random` est remplacé par un accesseur : `seedrandom(..., {global:true})`
 * réassigne `Math.random` à chaque génération, et le setter récupère ce nouveau
 * générateur sans que le compteur soit perdu.
 *
 * À n'appeler qu'une fois, au chargement du module de test.
 */
export function installeGardeDeBoucle(
  max: number = MAX_TIRAGES_PAR_GENERATION,
): GardeDeBoucle {
  let generateur: () => number = Math.random
  let compteur = 0
  let actif = false
  const compte = () => {
    if (actif && ++compteur > max) {
      actif = false
      throw new Error(
        `plus de ${max} tirages aléatoires consommés : boucle sans issue probable`,
      )
    }
    return generateur()
  }
  Object.defineProperty(Math, 'random', {
    configurable: true,
    get: () => compte,
    set: (nouveau: () => number) => {
      generateur = nouveau
    },
  })
  return {
    demarre: () => {
      compteur = 0
      actif = true
    },
    arrete: () => {
      actif = false
      return compteur
    },
  }
}

/**
 * Graine utilisée pour un exercice donné.
 * Elle est dérivée de l'uuid : elle a l'air aléatoire mais reste reproductible
 * d'une exécution à l'autre et d'une machine à l'autre.
 */
export function grainePourUuid(uuid: string): string {
  return CRC32.hex(`${uuid}#0`)
}

/**
 * Retire tout ce qui n'est pas du contenu affiché : balises SVG/HTML (et donc
 * les coordonnées de figures, les identifiants, les styles) et commentaires.
 * Le texte des balises `<text>` de mathalea2d, lui, est conservé : ce sont les
 * étiquettes visibles de la figure.
 */
export function texteAffiche(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extrait la suite des nombres d'un énoncé, dans l'ordre d'apparition.
 * Le signe est pris en compte : un `-` accolé aux chiffres en fait partie, de
 * sorte qu'un changement de signe est détecté. Les nombres sont normalisés
 * (virgule décimale française -> point, zéros inutiles supprimés) pour qu'un
 * simple changement de formatage ne déclenche pas de fausse alerte.
 */
export function nombresAffiches(html: string): string[] {
  const texte = texteAffiche(html)
    // signes unicode ramenés au tiret ASCII
    .replace(/[\u2212\u2013]/g, '-')
    // « 12 - 4 » et « 12-4 » donnent la même suite de nombres : un espacement
    // retouché ne doit pas passer pour un changement de valeur
    .replace(/-\s+(?=\d)/g, '-')
    // texNombre() sépare les milliers par un « \, » (ex: 818\,639) : sans ce
    // pont, l'extraction lirait deux nombres (818 et 639) au lieu d'un seul
    .replace(/(?<=\d)\\,(?=\d)/g, '')
  const trouves = texte.match(/-?\d+(?:[.,]\d+)?/g) ?? []
  return trouves.map(normaliseNombre)
}

function normaliseNombre(brut: string): string {
  const n = Number(brut.replace(',', '.'))
  return Number.isFinite(n) ? String(n) : brut
}

/**
 * Normalise un texte pour l'empreinte informative : on ignore les espaces, la
 * casse et les commandes d'espacement LaTeX qui varient sans changer le sens.
 */
export function normaliseTexte(html: string): string {
  return texteAffiche(html)
    .replace(/\\(?:,|;|:|!|quad|qquad|hspace\{[^}]*\})/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()
}

export type EmpreinteExercice = {
  /** Chemin du fichier de l'exercice, pour la lisibilité du diff. */
  ex: string
  /**
   * Empreintes par combinaison de paramètres. La clé reprend les paramètres
   * d'URL (`''` pour les valeurs par défaut, `s=2`, `s2=1`…), la valeur vaut
   * `"<nb>:<tx>"`.
   */
  v: Record<string, string>
}

/**
 * Empreinte d'un tirage : les nombres de l'énoncé d'un côté, le texte complet
 * de l'autre, réunis en `"<nb>:<tx>"`.
 */
export function empreinteTirage(
  questions: string[],
  corrections: string[],
): string {
  const nombres: string[] = []
  const textes: string[] = []
  for (const question of questions) {
    nombres.push(nombresAffiches(question).join(' '))
    textes.push(normaliseTexte(question))
  }
  for (const correction of corrections) {
    textes.push(normaliseTexte(correction))
  }
  return `${CRC32.hex(nombres)}:${CRC32.hex(textes)}`
}

/** Partie « nombres de l'énoncé » d'une empreinte de tirage. */
export function partieNombres(empreinte: string): string {
  return empreinte.split(':')[0]
}

/** Partie « texte » d'une empreinte de tirage. */
export function partieTexte(empreinte: string): string {
  return empreinte.split(':')[1] ?? ''
}

/** Ce qu'un exercice déclare pour un de ses paramètres (`sup`, `sup2`, `sup3`). */
export type DeclarationFormulaire = {
  numerique?: boolean | [string, number] | [string, number, string]
  texte?: boolean | [string, string]
  caseACocher?: boolean | [string] | [string, boolean]
}

/** Valeur d'un paramètre ; `undefined` signifie « valeur par défaut de l'exercice ». */
export type ValeurParametre = string | number | boolean | undefined

export type Combinaison = {
  /** Clé lisible reprenant les paramètres d'URL : `''`, `s=2`, `s2=1`… */
  cle: string
  /** Valeurs de `sup`, `sup2`, `sup3` ; `undefined` = on ne touche pas. */
  valeurs: ValeurParametre[]
}

const NOMS_PARAMETRES = ['s', 's2', 's3']

/**
 * Extrait les numéros d'options d'un formulaire texte, dont la description
 * liste les choix sous la forme `1 : Lancers de dés`.
 */
function optionsFormulaireTexte(description: string): number[] {
  const numeros: number[] = []
  for (const ligne of description.split('\n')) {
    const trouve = ligne.trim().match(/^(\d+)\s*:/)
    if (trouve) numeros.push(parseInt(trouve[1], 10))
  }
  return numeros.sort((a, b) => a - b)
}

/**
 * Valeurs testées pour un paramètre, dans l'ordre croissant et limitées à
 * `maxValeurs`. Renvoie un tableau vide si l'exercice ne déclare pas ce
 * paramètre.
 */
export function valeursParametre(
  declaration: DeclarationFormulaire | undefined,
  maxValeurs: number,
): ValeurParametre[] {
  if (!declaration) return []
  const { numerique, texte, caseACocher } = declaration
  if (Array.isArray(texte) && texte.length >= 2) {
    // la valeur attendue par gestionnaireFormulaireTexte est le numéro d'option
    return optionsFormulaireTexte(texte[1])
      .slice(0, maxValeurs)
      .map((n) => String(n))
  }
  if (Array.isArray(numerique) && numerique.length > 1) {
    const max = Number(numerique[1])
    const borne = Number.isNaN(max) ? 2 : max
    const valeurs: ValeurParametre[] = []
    for (let i = 1; i <= Math.min(borne, maxValeurs); i++) valeurs.push(i)
    return valeurs
  }
  if (caseACocher) return [true, false].slice(0, maxValeurs)
  return []
}

/**
 * Combinaisons de paramètres contrôlées pour un exercice.
 *
 * On fait varier un paramètre à la fois à partir des valeurs par défaut : c'est
 * ce qui met en évidence les branches du type `if (this.sup === 3)` sans faire
 * exploser le nombre de tirages comme le ferait un produit cartésien.
 *
 * @param declarations déclarations de `sup`, `sup2`, `sup3`
 * @param valeursParDefaut valeurs par défaut de l'exercice, pour éviter de
 *   recalculer une combinaison identique à celle par défaut
 */
export function combinaisonsParametres(
  declarations: (DeclarationFormulaire | undefined)[],
  valeursParDefaut: ValeurParametre[] = [],
): Combinaison[] {
  const combinaisons: Combinaison[] = [
    { cle: '', valeurs: [undefined, undefined, undefined] },
  ]
  for (let axe = 0; axe < NOMS_PARAMETRES.length; axe++) {
    const valeurs = valeursParametre(
      declarations[axe],
      NB_VALEURS_PAR_PARAMETRE[axe],
    )
    for (const valeur of valeurs) {
      if (String(valeur) === String(valeursParDefaut[axe])) continue
      const combinaison: ValeurParametre[] = [undefined, undefined, undefined]
      combinaison[axe] = valeur
      combinaisons.push({
        cle: `${NOMS_PARAMETRES[axe]}=${valeur}`,
        valeurs: combinaison,
      })
    }
  }
  return combinaisons
}

/**
 * Sélectionne les exercices à contrôler parmi le catalogue complet.
 *
 * - `STABILITY_UUIDS` : liste d'uuid séparés par des espaces ou des virgules.
 * - `STABILITY_FILTER` : préfixes de chemin séparés par `^`, ex. `6e/6N1^5e/`.
 * - `CHANGED_FILES` : les fichiers modifiés. Un utilitaire partagé
 *   (`src/lib/`, `src/modules/`) qui change ses tirages les décale tous : dans
 *   ce cas, tout le catalogue est contrôlé.
 * - sinon : tout le catalogue.
 *
 * @param tous couples `[uuid, chemin]` du catalogue, chemin relatif à `src/exercices/`
 * @param env variables d'environnement
 */
export function exercicesAControler(
  tous: [string, string][],
  env: Record<string, string | undefined>,
): [string, string][] {
  if (env.STABILITY_UUIDS) {
    const demandes = new Set(
      env.STABILITY_UUIDS.split(/[\s,]+/).filter(Boolean),
    )
    return tous.filter(([uuid]) => demandes.has(uuid))
  }
  if (env.STABILITY_FILTER) {
    const filtres = env.STABILITY_FILTER.split('^').filter(Boolean)
    return tous.filter(([, chemin]) =>
      filtres.some((f) => chemin.startsWith(f)),
    )
  }
  if (env.CHANGED_FILES !== undefined) {
    const fichiers = env.CHANGED_FILES.split(/[\s\n]+/).filter(Boolean)
    const cheminsCatalogue = new Set(tous.map(([, chemin]) => chemin))
    const utilitairePartageModifie = fichiers.some(
      (f) =>
        (f.startsWith('src/lib/') || f.startsWith('src/modules/')) &&
        !f.endsWith('.test.ts') &&
        !f.endsWith('.svelte'),
    )
    const exercicePartageModifie = fichiers.some((f) => {
      if (!f.startsWith('src/exercices/') || f.endsWith('.test.ts'))
        return false
      const chemin = f.replace(/^src\/exercices\//, '')
      return !cheminsCatalogue.has(chemin)
    })
    if (utilitairePartageModifie || exercicePartageModifie) return tous
    const modifies = new Set(
      fichiers
        .filter((f) => f.startsWith('src/exercices/'))
        .map((f) => f.replace(/^src\/exercices\//, '')),
    )
    if (modifies.size === 0) return []
    return tous.filter(([, chemin]) => modifies.has(chemin))
  }
  return tous
}

/** Vrai si la sélection couvre l'intégralité du catalogue. */
export function selectionComplete(
  env: Record<string, string | undefined>,
): boolean {
  return (
    !env.STABILITY_UUIDS &&
    !env.STABILITY_FILTER &&
    env.CHANGED_FILES === undefined
  )
}
