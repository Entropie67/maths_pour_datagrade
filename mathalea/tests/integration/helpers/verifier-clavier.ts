import { alphanumericLayouts } from '../../../src/components/keyboard/layouts/alphanumericRows'
import { keyboardBlocks } from '../../../src/components/keyboard/layouts/keysBlocks'
import { keys as touchesConnues } from '../../../src/components/keyboard/lib/keycaps'
import {
  litTouchesPersonnalisees,
  toucheDepuisCle,
} from '../../../src/components/keyboard/lib/touchesPersonnalisees'
import { isAnswerType, type IExercice } from '../../../src/lib/types'

export type ResultatClavier = {
  questionIndex: number
  reponse: string
  clavier: string
  symbolesManquants: string[]
  isOk: boolean
}

type Regle = {
  nom: string
  requiert: (latexNettoye: string, latexBrut: string) => boolean
  satisfaitPar: string[]
  /** Satisfait aussi si une touche disponible insère un texte correspondant
   * (ex : une touche d'unité qui insère déjà `cm^2`, exposant compris). */
  satisfaitSiInsertionContient?: RegExp
}

/**
 * Retire les séquences LaTeX (commandes, `\text{...}`) pour ne garder que les
 * lettres, chiffres, parenthèses et opérateurs réellement affichés, sans être
 * trompé par des lettres internes à une commande (le `x` de `\times` par
 * exemple).
 */
function nettoie(latex: string): string {
  return latex
    .replace(/\\text\{[^{}]*\}/g, ' ')
    .replace(
      /\\(mathbb|mathrm|operatorname|overline|underline|vec|widehat)\{[^{}]*\}/g,
      ' ',
    )
    .replace(/\\[a-zA-Z]+/g, ' ')
}

const VARIABLES = ['x', 'y', 'z', 'a', 'b', 'c', 'k', 'n', 'h']

const REGLES: Regle[] = [
  {
    nom: 'parenthèses',
    requiert: (nettoyee) => /[()]/.test(nettoyee),
    satisfaitPar: ['(', ')', 'PARENTHESES'],
  },
  ...VARIABLES.map((lettre) => ({
    nom: `variable ${lettre}`,
    requiert: (nettoyee: string) =>
      new RegExp(`(?<![a-zA-Z0-9])${lettre}(?![a-zA-Z0-9])`).test(nettoyee),
    // `HOUR` insère aussi un `h` (texte des durées), sans être une variable.
    satisfaitPar:
      lettre === 'h'
        ? [`${lettre}Math`, lettre, 'HOUR']
        : [`${lettre}Math`, lettre],
  })),
  {
    nom: 'addition',
    requiert: (nettoyee) => /\+/.test(nettoyee),
    // `PLUS_INFTY` insère directement `+\infty`, signe compris.
    satisfaitPar: ['ADD', 'PLUS_INFTY'],
  },
  {
    nom: 'soustraction',
    requiert: (nettoyee) => /-/.test(nettoyee),
    satisfaitPar: ['SUB', 'MINUS_INFTY'],
  },
  {
    nom: 'multiplication',
    requiert: (_nettoyee, brut) => /\\times|\*/.test(brut),
    satisfaitPar: ['MULT', 'AST'],
  },
  {
    nom: 'division',
    requiert: (_nettoyee, brut) => /\\div/.test(brut),
    satisfaitPar: ['DIV'],
  },
  {
    nom: 'puissance au carré',
    requiert: (_nettoyee, brut) => /\^2\b|\^\{2\}/.test(brut),
    // Les touches d'unités (aire, volume...) insèrent déjà l'exposant, ex :
    // `\operatorname{cm}^2`, sans passer par une touche `SQ`/`POW` dédiée.
    satisfaitPar: ['SQ', 'POW'],
    satisfaitSiInsertionContient: /\^2\b|\^\{2\}/,
  },
  {
    nom: 'fraction',
    requiert: (_nettoyee, brut) => /\\d?frac\{/.test(brut),
    satisfaitPar: ['FRAC'],
  },
  {
    nom: 'racine carrée',
    requiert: (_nettoyee, brut) => /\\sqrt\b/.test(brut),
    satisfaitPar: ['SQRT'],
  },
  {
    nom: 'virgule',
    requiert: (nettoyee) => /,/.test(nettoyee),
    satisfaitPar: ['COMMA'],
  },
  {
    nom: 'point-virgule',
    requiert: (nettoyee) => /;/.test(nettoyee),
    satisfaitPar: ['SEMICOLON', ';'],
  },
  {
    // Équation attendue (`y=2x+1`, `x=3`…) : le signe `=` doit être saisissable.
    nom: 'égalité',
    requiert: (nettoyee) => /=/.test(nettoyee),
    satisfaitPar: ['='],
  },
]

/**
 * Le bloc `alphanumeric` n'est pas dans `keyboardBlocks` : c'est un clavier
 * QWERTY complet (lettres, chiffres, opérateurs, parenthèses...) affiché par
 * `Alphanumeric.svelte` à partir de `alphanumericLayouts`.
 */
const clesAlphanumeric = new Set(
  Object.values(alphanumericLayouts)
    .flat(2)
    .map((cle) => String(cle)),
)

function clesDuClavier(dataKeyboard: string): Set<string> {
  const cles = new Set<string>()
  const blocs = keyboardBlocks as unknown as Record<
    string,
    { keycaps: { inline: unknown[]; block: unknown[] } }
  >
  for (const nomBloc of dataKeyboard.split(' ').filter(Boolean)) {
    if (nomBloc === 'alphanumeric') {
      for (const cle of clesAlphanumeric) cles.add(cle)
      continue
    }
    const bloc = blocs[nomBloc]
    if (!bloc) continue
    for (const cle of [...bloc.keycaps.inline, ...bloc.keycaps.block]) {
      cles.add(String(cle))
    }
  }
  return cles
}

/** Texte réellement inséré par une touche (repli sur son affichage). */
function insertionDe(nomCle: string): string {
  const touche = (
    touchesConnues as Record<string, { insert?: string; display?: string }>
  )[nomCle]
  return touche?.insert ?? touche?.display ?? ''
}

/**
 * Associe à chaque indice de champ MathLive (celui passé à
 * `ajouteChampTexteMathLive`/`handleAnswers`, retrouvable dans l'attribut
 * `mathfield-id="champTexteEx{numeroExercice}Q{i}"`) le clavier qui lui a
 * réellement été assigné.
 *
 * On ne peut pas supposer que `exercice.listeQuestions[i]` contient le champ
 * de `exercice.autoCorrection[i]` : une question composée de plusieurs
 * sous-parties (plusieurs champs MathLive) n'occupe qu'une seule case de
 * `listeQuestions` alors que chacun de ses champs a sa propre case dans
 * `autoCorrection`. Les deux tableaux ont alors des longueurs et des index
 * différents ; seul le `mathfield-id` fait foi.
 */
type ChampMathLive = {
  clavier: string
  /** Touches ajoutées via `dataKeys` (voir `touchesPersonnalisees.ts`), en
   * plus des blocs habituels de `data-keyboard` (ex : `KeyboardType.clavierPersonnalisable`). */
  touchesPersonnalisees: string[][]
}

/** Inverse `escapeHtmlAttribute` (`MathaleaCustomElement.ts`) sur un attribut HTML. */
function nettoieEntitesHtml(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function indexerClaviersParChamp(
  exercice: IExercice,
): Map<number, ChampMathLive> {
  const index = new Map<number, ChampMathLive>()
  const reBaliseMathfield = /<mathalea-mathfield\b[^>]*>/g
  for (const html of exercice.listeQuestions ?? []) {
    if (!html) continue
    // `multi-mathfield` compose son propre clavier par champ (JSON encodé
    // dans `data-options`) : un `<mathalea-mathfield>` isolé peut traîner
    // ailleurs dans le même HTML sans rapport avec ces champs. On ne sait pas
    // encore l'analyser correctement, donc on ne se prononce pas sur les
    // champs de ce bloc.
    if (/<multi-mathfield\b/.test(html)) continue
    for (const balise of html.match(reBaliseMathfield) ?? []) {
      const idMatch = balise.match(/\bmathfield-id="champTexteEx\d+Q(\d+)"/)
      if (!idMatch) continue
      const clavierMatch = balise.match(/\bdata-keyboard="([^"]*)"/)
      const dataKeysMatch = balise.match(/\bdata-keys="([^"]*)"/)
      const touchesPersonnalisees = litTouchesPersonnalisees(
        dataKeysMatch ? nettoieEntitesHtml(dataKeysMatch[1]) : undefined,
      )
      index.set(Number(idMatch[1]), {
        clavier: clavierMatch?.[1] ?? '',
        touchesPersonnalisees,
      })
    }
  }
  return index
}

/**
 * Compare, pour chaque champ MathLive d'un exercice déjà généré (nouvelleVersion
 * exécutée avec `interactif = true` et `context.isHtml = true`), les symboles
 * requis par la réponse attendue aux touches réellement fournies par le
 * clavier assigné à la question. Permet de repérer les exercices où le
 * clavier ne permet pas de saisir sa propre réponse (ex : `x` ou les
 * parenthèses manquants).
 */
export function verifyKeyboardCoverage(exercice: IExercice): ResultatClavier[] {
  const results: ResultatClavier[] = []
  const claviersParChamp = indexerClaviersParChamp(exercice)
  for (let i = 0; i < exercice.autoCorrection.length; i++) {
    const ac = exercice.autoCorrection[i]
    const format = ac?.formatInteractif ?? 'mathlive'
    if (format !== 'mathlive') continue
    const valeur = ac?.valeur
    if (!valeur) continue
    // Une vérification par callback (voir `verifier-comparison.ts`) accepte
    // n'importe quelle notation équivalente : la valeur de référence n'est
    // pas ce que l'élève doit reproduire caractère pour caractère.
    if (typeof (valeur as { callback?: unknown }).callback === 'function') {
      continue
    }

    const champ = claviersParChamp.get(i)
    if (champ === undefined) continue
    const claviers = [champ.clavier]

    const clesDisponibles = new Set<string>()
    for (const clavier of claviers) {
      for (const cle of clesDuClavier(clavier)) clesDisponibles.add(cle)
    }
    // Résoudre les touches comme le clavier : seuls certains noms sont des
    // raccourcis ; « SEMICOLON », par exemple, insère ce mot et non « ; ».
    const insertionsPersonnalisees = champ.touchesPersonnalisees
      .flat()
      .map((cle) => {
        const touche = toucheDepuisCle(cle)
        return touche.insert ?? touche.display
      })
    const insertionsDisponibles = [
      ...[...clesDisponibles].map(insertionDe),
      ...insertionsPersonnalisees,
    ]

    for (const [key, answer] of Object.entries(valeur)) {
      if (key === 'bareme' || key === 'feedback') continue
      if (typeof answer === 'function') continue
      if (!isAnswerType(answer)) continue
      // Une vérification par callback (voir `verifier-comparison.ts`) accepte
      // n'importe quelle notation équivalente : la valeur de référence n'est
      // pas ce que l'élève doit reproduire caractère pour caractère.
      if (typeof (answer as { callback?: unknown }).callback === 'function') {
        continue
      }
      // Les ensembles, n-uplets et suites se saisissent aussi dans ce champ :
      // leurs séparateurs doivent donc être disponibles sur son clavier.
      const options = answer.options ?? {}
      // Quand plusieurs formulations sont acceptées (ex : `f(3)=5` et `5`),
      // il suffit qu'une seule soit intégralement saisissable avec le clavier
      // assigné : l'élève n'a pas besoin de taper précisément la première du
      // tableau.
      const alternatives = Array.isArray(answer.value)
        ? answer.value.map(String)
        : [String(answer.value)]
      let meilleurReponse = alternatives[0]
      let meilleursManquants: string[] | null = null
      for (const alternative of alternatives) {
        const nettoyee = nettoie(alternative)
        const manquants: string[] = []
        for (const regle of REGLES) {
          if (!regle.requiert(nettoyee, alternative)) continue
          // `handleFraction` accepte l'écriture décimale avant de juger la
          // fraction : la touche FRAC n'est alors pas indispensable.
          if (regle.nom === 'fraction' && options.nombreDecimalSeulement) {
            continue
          }
          // Pour un intervalle, la valeur de référence donne les bornes
          // `[a;b]` mais l'élève ne saisit qu'un nombre dans l'intervalle.
          if (
            regle.nom === 'point-virgule' &&
            (options.estDansIntervalle || options.estDecimalDansIntervalle)
          ) {
            continue
          }
          const satisfait =
            regle.satisfaitPar.some((cle) => clesDisponibles.has(cle)) ||
            regle.satisfaitPar.some((cle) =>
              insertionsPersonnalisees.includes(insertionDe(cle) || cle),
            ) ||
            (regle.satisfaitSiInsertionContient != null &&
              insertionsDisponibles.some((insertion) =>
                regle.satisfaitSiInsertionContient!.test(insertion),
              ))
          if (!satisfait) manquants.push(regle.nom)
        }
        if (manquants.length === 0) {
          meilleurReponse = alternative
          meilleursManquants = manquants
          break
        }
        if (
          meilleursManquants === null ||
          manquants.length < meilleursManquants.length
        ) {
          meilleurReponse = alternative
          meilleursManquants = manquants
        }
      }
      results.push({
        questionIndex: i,
        reponse: meilleurReponse,
        clavier: claviers.join(' '),
        symbolesManquants: meilleursManquants ?? [],
        isOk: (meilleursManquants ?? []).length === 0,
      })
    }
  }
  return results
}
