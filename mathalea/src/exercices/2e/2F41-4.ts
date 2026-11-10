import { bleuMathalea } from '../../lib/colors'
import type { FonctionBareme } from '../../lib/interactif/baremeExercice'
import { compareDoubleInequalityParts } from '../../lib/interactif/doubleInequalityParts'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import type { FillInTheBlankElementLike } from './2F41-2'

export const titre =
  "Encadrer le carré, l'inverse ou la racine carrée d'une expression affine"
export const dateDePublication = '12/10/2026'
export const interactifReady = true

/**
 * Encadrer f(mx+p) à partir d'un encadrement de x, pour f carré, inverse ou racine carrée.
 * Première étape : encadrer mx+p. Seconde étape : utiliser les variations de f.
 * @author Rémi Angot
 */
export const uuid = '11542'

export const refs = {
  'fr-fr': ['2F41-4'],
  'fr-ch': [],
}

type FonctionReference = 'carré' | 'inverse' | 'racine carrée'
type PositionIntervalle = 'positif' | 'negatif'

/** Symbole d'inégalité « dans le sens croissant » (a < b) ou « décroissant » (a > b). */
function symbole(large: boolean, croissant: boolean): string {
  if (croissant) return large ? '\\leqslant' : '<'
  return large ? '\\geqslant' : '>'
}

/** Écriture de 1/n (n entier non nul) sans dénominateur inutile. */
function inverseTex(n: number): string {
  if (n === 1) return '1'
  if (n === -1) return '-1'
  return n > 0 ? `\\dfrac{1}{${n}}` : `-\\dfrac{1}{${-n}}`
}

/** Écriture de la racine carrée de n (entier positif), simplifiée si n est un carré parfait. */
function racineTex(n: number): string {
  const racine = Math.sqrt(n)
  return Number.isInteger(racine) ? String(racine) : `\\sqrt{${n}}`
}

/** Nombre de lignes d'encadrements successifs demandées en mode interactif. */
const nbLignes = 3

/**
 * Deux points par question : 2 si les trois encadrements sont justes, 1 si seul
 * l'encadrement final est juste, 0 si l'encadrement final est faux.
 * Les points reçus sont `[encadrement final, étapes intermédiaires]` (1 ou 0).
 */
const baremeDeuxPoints: FonctionBareme = ([final, etapes]) => [
  final === 1 ? 1 + (etapes ?? 1) : 0,
  2,
]

/** Touches du clavier : chiffres, signe moins, symboles d'inégalité et, selon la fonction, fraction ou racine. */
function touchesDuClavier(fonction: FonctionReference): string[][] {
  const touches = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
    ['<', '>', '\\leqslant', '\\geqslant'],
  ]
  if (fonction === 'inverse') touches.push(['\\dfrac{#0}{#1}'])
  if (fonction === 'racine carrée') touches.push(['\\sqrt{#0}'])
  return touches
}

/**
 * Vérifie les trois lignes d'encadrements (champ1 à champ6) et attribue les points.
 * Chaque ligne est acceptée dans les deux sens : `-3 < -x < -1` comme `-1 > -x > -3`.
 */
function verifieEncadrements(
  fillInTheBlank: FillInTheBlankElementLike | null,
  reponses: Record<string, { value: string }>,
) {
  if (fillInTheBlank == null) {
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 2 },
    }
  }
  const lignesJustes: boolean[] = []
  for (let ligne = 0; ligne < nbLignes; ligne++) {
    const gauche = `champ${2 * ligne + 1}`
    const droite = `champ${2 * ligne + 2}`
    const { left, right } = compareDoubleInequalityParts({
      inputLeft: fillInTheBlank.getPromptValue(gauche),
      inputRight: fillInTheBlank.getPromptValue(droite),
      expectedLeft: reponses[gauche].value,
      expectedRight: reponses[droite].value,
    })
    lignesJustes.push(left && right)
    fillInTheBlank.setPromptState(gauche, left ? 'correct' : 'incorrect', true)
    fillInTheBlank.setPromptState(droite, right ? 'correct' : 'incorrect', true)
  }
  const finalJuste = lignesJustes[nbLignes - 1]
  const etapesJustes = lignesJustes.slice(0, nbLignes - 1).every(Boolean)
  const [nbBonnesReponses, nbReponses] = baremeDeuxPoints([
    finalJuste ? 1 : 0,
    etapesJustes ? 1 : 0,
  ])
  let feedback = ''
  if (!finalJuste) feedback = "L'encadrement final n'est pas correct."
  else if (!etapesJustes) {
    feedback = "L'encadrement final est correct, mais une étape est fausse."
  }
  return {
    isOk: finalJuste && etapesJustes,
    feedback,
    score: { nbBonnesReponses, nbReponses },
  }
}

export default class EncadrerImageExpressionAffine extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions ',
      'Nombres séparés par des tirets :\n1 : Carré\n2 : Inverse\n3 : Racine carrée\n4 : Mélange',
    ]
    this.nbQuestions = 3
    this.sup = '4'
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    this.consigne = this.interactif
      ? "Compléter chaque ligne par l'encadrement le plus précis possible."
      : "Compléter avec l'encadrement le plus précis possible."
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['carré', 'inverse', 'racine carrée'] as FonctionReference[],
    }) as FonctionReference[]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const fonction = listeTypeQuestions[i]

      // Encadrement de x : a ⋄ x ⋄ b
      const a = randint(-6, 6)
      const b = a + randint(1, 3)
      const large1 = choice([true, false])
      const large2 = choice([true, false])
      // Expression affine : m x + p
      const m = choice([-4, -3, -2, -1, 2, 3, 4])
      const minimumDeMx = Math.min(m * a, m * b)
      const maximumDeMx = Math.max(m * a, m * b)

      // On fixe p pour que l'encadrement de mx+p convienne à la fonction choisie.
      let position: PositionIntervalle
      // Pour le carré, les deux bornes ont le même signe (l'intervalle ne contient pas 0 en son intérieur).
      if (fonction === 'racine carrée') {
        position = 'positif'
      } else {
        position = choice(['positif', 'negatif'])
      }
      let p: number
      if (position === 'positif') {
        // Pour l'inverse, le dénominateur doit rester non nul.
        p = randint(fonction === 'inverse' ? 1 : 0, 5) - minimumDeMx
      } else {
        p = -randint(fonction === 'inverse' ? 1 : 0, 5) - maximumDeMx
      }
      if (p === 0) continue

      // Encadrement de u = mx+p : borneInf ⋄ u ⋄ borneSup
      const borneInf = minimumDeMx + p
      const borneSup = maximumDeMx + p
      const largeInf = m > 0 ? large1 : large2
      const largeSup = m > 0 ? large2 : large1

      const u = `${rienSi1(m)}x${ecritureAlgebrique(p)}`
      const hypothese = `${a} ${symbole(large1, true)} x ${symbole(large2, true)} ${b}`

      // Résultat : gauche ⋄ f(u) ⋄ droite
      let gauche: string
      let droite: string
      let largeGauche: boolean
      let largeDroite: boolean
      let expressionFonction: string
      let justification: string
      switch (fonction) {
        case 'carré':
          expressionFonction = `(${u})^2`
          if (position === 'positif') {
            gauche = String(borneInf ** 2)
            droite = String(borneSup ** 2)
            largeGauche = largeInf
            largeDroite = largeSup
            justification = `La fonction carré est strictement croissante sur $[0;+\\infty[$ et les nombres $${borneInf}$ et $${borneSup}$ sont positifs${sp()}: elle conserve l'ordre.`
          } else {
            gauche = String(borneSup ** 2)
            droite = String(borneInf ** 2)
            largeGauche = largeSup
            largeDroite = largeInf
            justification = `La fonction carré est strictement décroissante sur $]-\\infty;0]$ et les nombres $${borneInf}$ et $${borneSup}$ sont négatifs${sp()}: elle change l'ordre.`
          }
          break
        case 'inverse':
          expressionFonction = `\\dfrac{1}{${u}}`
          // L'inverse est strictement décroissante sur chaque intervalle où elle est définie.
          gauche = inverseTex(borneSup)
          droite = inverseTex(borneInf)
          largeGauche = largeSup
          largeDroite = largeInf
          justification =
            position === 'positif'
              ? `Les nombres $${borneInf}$ et $${borneSup}$ sont strictement positifs et la fonction inverse est strictement décroissante sur $]0;+\\infty[$${sp()}: elle change l'ordre.`
              : `Les nombres $${borneInf}$ et $${borneSup}$ sont strictement négatifs et la fonction inverse est strictement décroissante sur $]-\\infty;0[$${sp()}: elle change l'ordre.`
          break
        case 'racine carrée':
        default:
          expressionFonction = `\\sqrt{${u}}`
          gauche = racineTex(borneInf)
          droite = racineTex(borneSup)
          largeGauche = largeInf
          largeDroite = largeSup
          justification = `Les nombres $${borneInf}$ et $${borneSup}$ sont positifs et la fonction racine carrée est strictement croissante sur $[0;+\\infty[$${sp()}: elle conserve l'ordre.`
          break
      }
      const symboleGauche = symbole(largeGauche, true)
      const symboleDroite = symbole(largeDroite, true)

      // Lignes d'encadrements successifs : mx, puis mx+p, puis f(mx+p)
      const monome = `${rienSi1(m)}x`
      const symboleBorneInf = symbole(largeInf, true)
      const symboleBorneSup = symbole(largeSup, true)
      const texteACompleter = this.interactif
        ? remplisLesBlancs(
            this,
            i,
            `\\begin{aligned}%{champ1}&${monome}%{champ2}\\\\%{champ3}&${u}%{champ4}\\\\%{champ5}&${expressionFonction}%{champ6}\\end{aligned}`,
            KeyboardType.clavierEntierementPersonnalisable,
            '\\ldots',
            { dataKeys: touchesDuClavier(fonction) },
          )
        : `$\\ldots\\ldots$  $${expressionFonction}$  $\\ldots\\ldots$`
      const texte = this.interactif
        ? `Si $${hypothese}$ alors${sp()}:<br>${texteACompleter}`
        : `Si $${hypothese}$ alors, ${sp(3)} ${texteACompleter}`

      // Étape 1 : encadrer mx+p
      const symboleX1 = symbole(large1, m > 0)
      const symboleX2 = symbole(large2, m > 0)
      let texteCorr = texteEnCouleur(
        `Étape $1$${sp()}: encadrer $${u}$ à partir de $${hypothese}$.`,
        bleuMathalea,
      )
      texteCorr += `<br>$${hypothese}$<br>`
      texteCorr += texteEnCouleur(
        `On multiplie par $${m}$ qui est ${m > 0 ? `strictement positif${sp()}: le sens des inégalités ne change pas` : `strictement négatif${sp()}: le sens des inégalités change`}.`,
        bleuMathalea,
      )
      texteCorr += `<br>$${m}\\times ${ecritureParentheseSiNegatif(a)} ${symboleX1} ${rienSi1(m)}x ${symboleX2} ${m}\\times ${ecritureParentheseSiNegatif(b)}$<br>`
      texteCorr += `$${m * a} ${symboleX1} ${rienSi1(m)}x ${symboleX2} ${m * b}$<br>`
      texteCorr += texteEnCouleur(
        `On ${p > 0 ? 'ajoute' : 'retranche'} $${abs(p)}$.`,
        bleuMathalea,
      )
      texteCorr += `<br>$${m * a + p} ${symboleX1} ${u} ${symboleX2} ${m * b + p}$`
      if (m < 0) {
        texteCorr += `, ${texteEnCouleur('soit', bleuMathalea)} $${borneInf} ${symbole(largeInf, true)} ${u} ${symbole(largeSup, true)} ${borneSup}$`
      }
      texteCorr += '.<br>'

      // Étape 2 : appliquer la fonction de référence
      texteCorr += texteEnCouleur(
        `Étape $2$${sp()}: encadrer $${expressionFonction}$.`,
        bleuMathalea,
      )
      texteCorr += `<br>${texteEnCouleur(justification, bleuMathalea)}<br>`
      if (fonction === 'carré' && position === 'positif') {
        texteCorr += `$${ecritureParentheseSiNegatif(borneInf)}^2 ${symboleGauche} (${u})^2 ${symboleDroite} ${ecritureParentheseSiNegatif(borneSup)}^2$, soit `
      } else if (fonction === 'carré' && position === 'negatif') {
        texteCorr += `$${ecritureParentheseSiNegatif(borneSup)}^2 ${symboleGauche} (${u})^2 ${symboleDroite} ${ecritureParentheseSiNegatif(borneInf)}^2$, soit `
      } else if (fonction === 'inverse') {
        texteCorr += `$\\dfrac{1}{${borneSup}} ${symboleGauche} \\dfrac{1}{${u}} ${symboleDroite} \\dfrac{1}{${borneInf}}$, soit `
      } else if (fonction === 'racine carrée') {
        texteCorr += `$\\sqrt{${borneInf}} ${symboleGauche} \\sqrt{${u}} ${symboleDroite} \\sqrt{${borneSup}}$, soit `
      }
      texteCorr += `$${miseEnEvidence(`${gauche} ${symboleGauche}`)} ${expressionFonction} ${miseEnEvidence(`${symboleDroite} ${droite}`)}$.`

      if (
        this.questionJamaisPosee(
          i,
          fonction,
          a,
          b,
          m,
          p,
          Number(large1),
          Number(large2),
        )
      ) {
        const reponseValue = {
          champ1: { value: `${minimumDeMx} ${symboleBorneInf}` },
          champ2: { value: `${symboleBorneSup} ${maximumDeMx}` },
          champ3: { value: `${borneInf} ${symboleBorneInf}` },
          champ4: { value: `${symboleBorneSup} ${borneSup}` },
          champ5: { value: `${gauche} ${symboleGauche}` },
          champ6: { value: `${symboleDroite} ${droite}` },
        }
        handleAnswers(
          this,
          i,
          {
            ...reponseValue,
            bareme: baremeDeuxPoints,
            callback: (exercice, question) => {
              const fillInTheBlank = document.querySelector(
                `fill-in-the-blank[mathfield-id="champTexteEx${exercice.numeroExercice}Q${question}"]`,
              ) as FillInTheBlankElementLike | null
              return verifieEncadrements(fillInTheBlank, reponseValue)
            },
          },
          { formatInteractif: 'fill-in-the-blank' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
