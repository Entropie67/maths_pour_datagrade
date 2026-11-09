import { fixeBordures } from '../2d/fixeBordures'
import { courbe } from '../2d/Courbe'
import { repere } from '../2d/reperes'
import { texteParPosition } from '../2d/textes'
import { bleuMathalea } from '../colors'
import {
  addTableauSignesVariations,
  creerTableauSignesVariations,
} from '../customElements/TableauSignesVariationsElement'
import { KeyboardType } from '../interactif/claviers/keyboard'
import {
  celluleFleche,
  celluleValeur,
  colonne,
  configCorrige,
  ligneVariation,
} from '../interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '../interactif/tableauSignesVariations/types'
import { choice } from '../outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../outils/ecritures'
import { miseEnEvidence } from '../outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type Exercice from '../../exercices/Exercice'

/**
 * Outils communs aux exercices « Dresser le tableau de variations de
 * `f(x)=ax²` ou `f(x)=ax²+c` » (à partir de l'expression ou de la courbe).
 */

export type ParametresParabole = {
  /** Nom de la fonction. */
  nom: string
  /** Coefficient de `x²` (non nul). */
  a: number
  /** Terme constant (0 pour `ax²`). */
  c: number
}

/**
 * Tableau de variations sur ℝ à compléter : l'abscisse du sommet, son image et
 * le sens de variation sur chaque intervalle sont à saisir. Les extrémités
 * (`-∞` et `+∞`) sont données.
 */
export function configTableauVariationsParabole({
  nom,
  a,
  c,
}: ParametresParabole): TableauSVConfig {
  return {
    variableName: 'x',
    colonnes: [
      colonne('-\\infty'),
      colonne('', {
        editable: true,
        expected: '0',
        clavier: KeyboardType.clavierDeBase,
      }),
      colonne('+\\infty'),
    ],
    lignes: [
      ligneVariation(
        `${nom}(x)`,
        [
          celluleValeur(''),
          celluleValeur('', {
            editable: true,
            expected: String(c),
            clavier: KeyboardType.clavierDeBase,
          }),
          celluleValeur(''),
        ],
        [
          celluleFleche('', {
            editable: true,
            expected: a > 0 ? 'bas' : 'haut',
          }),
          celluleFleche('', {
            editable: true,
            expected: a > 0 ? 'haut' : 'bas',
          }),
        ],
      ),
    ],
  }
}

/**
 * Représentation graphique de `x ↦ ax²+c` dans un repère dont la fenêtre
 * contient toujours l'origine et le sommet de la parabole.
 */
export function figureParabole(a: number, c: number): string {
  const yMin = a > 0 ? Math.min(c, 0) - 1 : Math.min(c, 0) - 6
  const yMax = a > 0 ? Math.max(c, 0) + 6 : Math.max(c, 0) + 1
  const r = repere({
    xMin: -4,
    xMax: 4,
    yMin,
    yMax,
    xUnite: 1,
    yUnite: 1,
    thickHauteur: 0.1,
    xLabelMin: -3,
    xLabelMax: 3,
    yLabelMin: yMin + 1,
    yLabelMax: yMax - 1,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleSecondaire: true,
    grilleSecondaireDistance: 1,
  })
  const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
  const f = (x: number) => a * x ** 2 + c
  const objets = [
    r,
    o,
    courbe(f, {
      repere: r,
      color: bleuMathalea,
      epaisseur: 2,
      xMin: -4,
      xMax: 4,
    }),
  ]
  return mathalea2d(
    Object.assign(
      { pixelsParCm: 25, scale: 0.6, center: !context.isHtml },
      fixeBordures(objets),
    ),
    objets,
  )
}

/** Intervalles de variation de `x ↦ ax²+c`, en LaTeX. */
function phraseVariations(nom: string, a: number): string {
  const decroit = `décroissante sur $]-\\infty\\,;\\,0]$`
  const croit = `croissante sur $[0\\,;\\,+\\infty[$`
  return a > 0
    ? `$${nom}$ est ${decroit} puis ${croit}`
    : `$${nom}$ est croissante sur $]-\\infty\\,;\\,0]$ puis décroissante sur $[0\\,;\\,+\\infty[$`
}

export type OptionsQuestionParabole = {
  /** `true` pour `ax²+c`, `false` pour `ax²`. */
  avecC: boolean
  /** Le tableau est à déduire de l'expression ou de la courbe. */
  source: 'expression' | 'courbe'
}

/**
 * Construit la question numéro `i` (énoncé, correction, tableau interactif) et
 * renvoie la clé qui identifie le tirage pour `questionJamaisPosee()`.
 */
export function questionVariationsParabole(
  exercice: Exercice,
  i: number,
  { avecC, source }: OptionsQuestionParabole,
): { texte: string; texteCorr: string; cle: string } {
  const a =
    source === 'courbe'
      ? choice([-1, 1]) * randint(1, 3)
      : choice([-1, 1]) * randint(1, 5)
  const c = avecC ? randint(-5, 5, 0) : 0
  const nom = choice(['f', 'g', 'h'])
  const config = configTableauVariationsParabole({ nom, a, c })
  const forme = avecC ? 'ax^2+c' : 'ax^2'
  const expression = `${rienSi1(a)}x^2${avecC ? ecritureAlgebrique(c) : ''}`
  const verbe = exercice.interactif ? 'Compléter' : 'Dresser'

  let texte: string
  if (source === 'expression') {
    texte = `Soit $${nom}$ la fonction définie sur $\\mathbb{R}$ par $${nom}(x)=${expression}$.<br>`
  } else {
    texte = `On a tracé ci-dessous la courbe représentative d'une fonction $${nom}$ définie sur $\\mathbb{R}$ par $${nom}(x)=${forme}$, où $a$ ${avecC ? 'et $c$ sont deux réels' : 'est un réel'}.<br>${figureParabole(a, c)}<br>`
  }
  texte += `${verbe} le tableau de variations de la fonction $${nom}$ sur $\\mathbb{R}$.<br>`

  const numeroExercice = exercice.numeroExercice
  if (exercice.interactif) {
    texte += addTableauSignesVariations(exercice, i, { config, bareme: 1 })
  } else {
    texte += creerTableauSignesVariations(config, {
      readonly: true,
      numeroExercice,
      numeroQuestion: i,
    })
  }

  let texteCorr = ''
  if (source === 'expression') {
    texteCorr += `La fonction $${nom}$ s'écrit sous la forme $${nom}(x)=${forme}$ avec $a=${a}$${avecC ? ` et $c=${c}$` : ''}.<br>`
    texteCorr += `La fonction carré est décroissante sur $]-\\infty\\,;\\,0]$ et croissante sur $[0\\,;\\,+\\infty[$.<br>`
    texteCorr +=
      a > 0
        ? `Comme $a=${a}>0$, multiplier par $a$ ne change pas le sens de variation`
        : `Comme $a=${a}<0$, multiplier par $a$ change le sens de variation`
    texteCorr += avecC ? `, et ajouter $c$ ne le modifie pas.<br>` : '.<br>'
    texteCorr += `Donc ${phraseVariations(nom, a)}.<br>`
    texteCorr += `De plus, $${nom}(0)=${a}\\times0^2${avecC ? ecritureAlgebrique(c) : ''}=${miseEnEvidence(c)}$.<br>`
  } else {
    texteCorr += `La courbe est une parabole de sommet le point de coordonnées $(0\\,;\\,${c})$, ${a > 0 ? 'tournée vers le haut' : 'tournée vers le bas'}.<br>`
    texteCorr += `Donc ${phraseVariations(nom, a)}.<br>`
    texteCorr += `Le sommet est le point d'abscisse $0$, et son ordonnée est ${a > 0 ? 'le minimum' : 'le maximum'} de $${nom}$ : $${nom}(0)=${miseEnEvidence(c)}$.<br>`
  }
  texteCorr += `On obtient le tableau de variations suivant :<br>`
  texteCorr += creerTableauSignesVariations(configCorrige(config), {
    readonly: true,
    numeroExercice,
    numeroQuestion: i,
  })

  return { texte, texteCorr, cle: `${a};${c}` }
}
