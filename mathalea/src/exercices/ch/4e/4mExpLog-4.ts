import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import {
    lireFormulaireComplexe,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { isEqual, sameInterval, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Associer des transformations de la fonction logarithme à leurs courbes'
export const dateDePublication = '27/10/2026'
export const uuid = 'c8872'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-4'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'liste',
      nom: 'fonctions',
      label: 'Fonctions proposées',
      items: [
        { nom: 'plusK', label: 'ln(x) + k' },
        { nom: 'decale', label: 'ln(x + k)' },
        { nom: 'oppose', label: '-ln(x)' },
        { nom: 'symetrique', label: 'ln(-x)' },
        { nom: 'absLn', label: '|ln(x)|' },
        { nom: 'lnAbs', label: 'ln|x|' },
        { nom: 'double', label: '2 ln(x)' },
      ],
    },
    {
      type: 'case',
      nom: 'domaine',
      label: "Demander aussi l'ensemble de définition",
      defaut: false,
    },
  ],
}

const xMin = -4
const xMax = 5
const yMin = -3
const yMax = 3
const unite = 0.8

type Transformation = {
  /** f(x) en LaTeX. */
  tex: string
  f: (x: number) => number
  /** Ensemble de définition, sous forme d'intervalle ou de réunion d'intervalles. */
  domaine: string
  /** Écriture plus courte de l'ensemble de définition, s'il y en a une. */
  domaineCourt?: string
  /** Pourquoi cette courbe : transformation de la courbe de ln. */
  explication: string
}

function tirer(nom: string): Transformation {
  const surRPlus = ']0;+\\infty['
  switch (nom) {
    case 'plusK': {
      const k = choice([-2, -1, 1, 2])
      return {
        tex: `\\ln(x)${ecritureAlgebrique(k)}`,
        f: (x) => Math.log(x) + k,
        domaine: surRPlus,
        explication: `la courbe de $\\ln$ translatée de $${Math.abs(k)}$ ${k > 0 ? 'vers le haut' : 'vers le bas'} : elle coupe l'axe des abscisses en $x=\\mathrm{e}^{${-k}}$ et passe par $(1;${k})$`,
      }
    }
    case 'decale': {
      const k = choice([-2, -1, 1, 2, 3])
      return {
        tex: `\\ln(x${ecritureAlgebrique(k)})`,
        f: (x) => Math.log(x + k),
        domaine: `]${-k};+\\infty[`,
        explication: `la courbe de $\\ln$ translatée de $${Math.abs(k)}$ ${k > 0 ? 'vers la gauche' : 'vers la droite'} : elle est définie pour $x>${-k}$ et coupe l'axe des abscisses en $x=${1 - k}$`,
      }
    }
    case 'oppose':
      return {
        tex: '-\\ln(x)',
        f: (x) => -Math.log(x),
        domaine: surRPlus,
        explication:
          "la symétrique de la courbe de $\\ln$ par rapport à l'axe des abscisses : elle est décroissante sur $]0;+\\infty[$",
      }
    case 'symetrique':
      return {
        tex: '\\ln(-x)',
        f: (x) => Math.log(-x),
        domaine: ']-\\infty;0[',
        explication:
          "la symétrique de la courbe de $\\ln$ par rapport à l'axe des ordonnées : elle est définie pour $x\\lt 0$",
      }
    case 'absLn':
      return {
        tex: '\\left|\\ln(x)\\right|',
        f: (x) => Math.abs(Math.log(x)),
        domaine: surRPlus,
        explication:
          "la courbe de $\\ln$ dont la partie située sous l'axe des abscisses (pour $0\\lt x\\lt 1$) est remplacée par sa symétrique : elle est toujours au-dessus de l'axe et le touche en $x=1$",
      }
    case 'lnAbs':
      return {
        tex: '\\ln\\left|x\\right|',
        f: (x) => Math.log(Math.abs(x)),
        domaine: ']-\\infty;0[\\cup]0;+\\infty[',
        domaineCourt: '\\mathbb{R}^*',
        explication:
          "la courbe de $\\ln$ complétée par sa symétrique par rapport à l'axe des ordonnées : elle est définie de part et d'autre de $0$",
      }
    default:
      return {
        tex: '2\\ln(x)',
        f: (x) => 2 * Math.log(x),
        domaine: surRPlus,
        explication:
          "la courbe de $\\ln$ étirée verticalement d'un facteur $2$ : elle passe par $(1;0)$ et par $(\\mathrm{e};2)$",
      }
  }
}

/** ]-\infty;0[ → \left]-\infty;0\right[ : sans \left, le signe - est espacé comme une soustraction. */
const intervalleTex = (domaine: string) =>
  domaine
    .split('\\cup')
    .map(
      (morceau) => `\\left${morceau.slice(0, -1)}\\right${morceau.slice(-1)}`,
    )
    .join('\\cup ')

/** Petit repère avec la courbe numéro `numero`. */
function figure(t: Transformation, numero: number): string {
  // La lettre x se place au-dessus de l'axe, ou dessous si la courbe passe à sa hauteur
  // près de la flèche (ln(x - 1), ln(x) - 1…).
  const xLettre = xMax * unite - 0.3
  const passePres = (yCm: number) =>
    Array.from({ length: 21 }, (_, n) => (xLettre - 0.5 + n * 0.05) / unite)
      .map(t.f)
      .some((y) => Math.abs(y * unite - yCm) < 0.4)
  const yLettre = passePres(0.5) ? -0.5 : 0.5
  const r = repere({
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite: unite,
    yUnite: unite,
    grille: false,
    // Convention : x au-dessus de l'axe et y à sa droite, près des flèches.
    xLegende: '$x$',
    xLegendePosition: [xLettre, yLettre],
    yLegende: '$y$',
    yLegendePosition: [0.7, yMax * unite - 0.25],
    xThickMax: xMax - 0.5,
    xLabelMax: xMax - 0.5,
    // Sans 4 : la lettre x, sous l'axe quand la courbe passe au-dessus, le toucherait.
    xLabelListe: [-3, -2, -1, 1, 2, 3],
    yThickMax: yMax - 0.5,
    yLabelMax: yMax - 0.5,
    // Sans -1 : il toucherait le -1 de l'axe des abscisses.
    yLabelListe: [-2, 1, 2],
  })
  const c = courbe(t.f, {
    repere: r,
    color: bleuMathalea,
    epaisseur: 2,
    step: 0.01,
    xMin,
    xMax,
    yMin,
    yMax,
  })
  const nom = latex2d(
    `\\mathcal{C}_{${numero}}`,
    (xMin + 0.8) * unite,
    (yMax - 0.3) * unite,
    { letterSize: 'normalsize' },
  )
  return mathalea2d(
    {
      xmin: xMin * unite - 0.3,
      xmax: xMax * unite + 0.3,
      ymin: yMin * unite - 0.3,
      ymax: yMax * unite + 0.3,
      pixelsParCm: 25,
      scale: 0.8,
      display: 'inline-block',
    },
    r,
    c,
    nom,
  )
}

/**
 * Quatre transformations de ln (translation, symétrie, valeur absolue, dilatation) à
 * associer à leurs courbes, avec en option leur ensemble de définition.
 * @author Nathan Scheinmann
 */
export default class AssocierTransformationsLn extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.comment =
      "Quatre fonctions sont tirées parmi les transformations cochées (s'il y en a moins de quatre, les autres complètent). Chaque courbe est tracée dans son propre repère : $|\\ln(x)|$, $\\ln|x|$ et $\\ln(x)$ coïncident sur $[1;+\\infty[$ et se confondraient dans un même repère. Avec l'ensemble de définition, la réponse attendue est un intervalle ou une réunion d'intervalles (l'écriture $\\mathbb{R}^*$ n'est pas reconnue par la saisie)."
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const avecDomaine = params.case('domaine')
    const tous = params.liste('fonctions').map((item) => item.nom)
    const coches = params.listeActive('fonctions').map((item) => item.nom)
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const noms = [
        ...shuffle(coches),
        ...shuffle(tous.filter((nom) => !coches.includes(nom))),
      ].slice(0, 4)
      const fonctions = noms.map(tirer)
      // Ordre des courbes : position de chaque fonction parmi les courbes.
      const ordre = shuffle([0, 1, 2, 3])
      const numeros = fonctions.map((_, k) => ordre.indexOf(k) + 1)
      if (!this.questionJamaisPosee(i, ...fonctions.map((f) => f.tex))) continue

      let texte = `On considère les fonctions $f_1$, $f_2$, $f_3$ et $f_4$ définies par :<br>`
      texte += fonctions
        .map((f, k) => `$f_{${k + 1}}(x)=${f.tex}$`)
        .join('$\\qquad$')
      texte += `<br>${avecDomaine ? "Donner l'ensemble de définition de chaque fonction (sous forme d'intervalle ou de réunion d'intervalles) et associer" : 'Associer'} chaque fonction à sa courbe.<br>`
      // En LaTeX, un espace fixe : une espace ordinaire serait étirée par la justification.
      texte += ordre
        .map((k, n) => figure(fonctions[k], n + 1))
        .join(context.isHtml || context.isTypst ? ' ' : '\\quad ')
      if (this.interactif) {
        texte += '<br>'
        texte += addMultiMathfield(this, i, {
          dataTemplate: fonctions
            .map(
              (_, k) =>
                (avecDomaine
                  ? `$\\text{Dom}_{f_${k + 1}}=$ %{champ${k + 5}}, `
                  : '') +
                `numéro de la courbe de $f_{${k + 1}}$ : %{champ${k + 1}}.`,
            )
            .join('<br>'),
          dataOptions: Object.fromEntries(
            fonctions.flatMap((_, k) => [
              [`champ${k + 1}`, { keyboard: KeyboardType.clavierDeBase }],
              [`champ${k + 5}`, { keyboard: KeyboardType.clavierEnsemble }],
            ]),
          ),
        })
      }
      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          ...Object.fromEntries(
            fonctions.flatMap((f, k) => [
              [
                `champ${k + 1}`,
                { value: String(numeros[k]), compare: seq([isEqual()]) },
              ],
              ...(avecDomaine
                ? [
                    [
                      `champ${k + 5}`,
                      { value: f.domaine, compare: seq([sameInterval()]) },
                    ],
                  ]
                : []),
            ]),
          ),
        },
        { formatInteractif: 'multi-mathfield' },
      )

      const correction = fonctions
        .map((f, k) => {
          const domaine = avecDomaine
            ? `Son ensemble de définition est $\\text{Dom}_{f_${k + 1}}=${miseEnEvidence(intervalleTex(f.domaine))}$${f.domaineCourt ? `, c'est-à-dire $${f.domaineCourt}$` : ''}. `
            : ''
          return `$f_{${k + 1}}(x)=${f.tex}$. ${domaine}Sa courbe est ${f.explication}. C'est la courbe $\\mathcal{C}_{${miseEnEvidence(numeros[k])}}$.`
        })
        .join('<br>')
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
