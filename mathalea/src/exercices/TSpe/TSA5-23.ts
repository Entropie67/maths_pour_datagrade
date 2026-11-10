import { sameIntervalCondition, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer un seuil pour une suite géométrique à l'aide du logarithme"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '06/11/2026'
export const uuid = 'd935c'
export const refs = {
  'fr-fr': ['TSA5-23', 'TCA4-23'],
  'fr-ch': [],
}

const symboleInverse: Record<string, string> = {
  '<': '>',
  '>': '<',
  '\\leqslant': '\\geqslant',
  '\\geqslant': '\\leqslant',
}

/** Garde trois chiffres significatifs d'un nombre dont la valeur absolue est au moins 10. */
function arrondiATroisChiffres(nombre: number): number {
  const precision =
    10 ** Math.max(0, Math.floor(Math.log10(Math.abs(nombre))) - 2)
  return Math.round(nombre / precision) * precision
}

/**
 * Résoudre dans N une inéquation u_n < S (ou >, ≤, ≥) pour une suite
 * géométrique, selon le signe de u_0 et la position de q par rapport à 1.
 * @author Rémi Angot
 */
export default class SeuilSuiteGeometrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Type de suite',
      [
        'Nombres séparés par des tirets :',
        '1 : Premier terme positif et q > 1',
        '2 : Premier terme positif et 0 < q < 1',
        '3 : Premier terme négatif et q > 1',
        '4 : Premier terme négatif et 0 < q < 1',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypesDeSuite = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 4,
        melange: 5,
        defaut: 5,
        nbQuestions: this.nbQuestions,
      }),
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeDeSuite = Number(listeTypesDeSuite[i])
      const premierTermePositif = typeDeSuite <= 2
      const raisonSuperieureA1 = typeDeSuite % 2 === 1
      const u0 = (premierTermePositif ? 1 : -1) * randint(11, 99) * 10
      const q = raisonSuperieureA1
        ? randint(102, 195) / 100
        : randint(30, 98) / 100

      // Le seuil tombe entre deux termes et reste entier : on limite le rang pour que
      // |seuil| reste entre 10 et 1 000 000.
      const amplitudeMax = raisonSuperieureA1
        ? 1e6 / Math.abs(u0)
        : Math.abs(u0) / 10
      const rangMax =
        Math.floor(Math.log(amplitudeMax) / Math.abs(Math.log(q))) - 1
      const rang = randint(1, Math.min(15, Math.max(1, rangMax)))
      const seuil = arrondiATroisChiffres(
        u0 * q ** (rang + randint(20, 80) / 100),
      )

      // L'arrondi du seuil peut le rapprocher d'un terme de la suite : on écarte ce cas,
      // où l'on ne distinguerait plus les inégalités larges et strictes.
      const quotient = Math.log(seuil / u0) / Math.log(q)
      if (quotient < 1.05 || Math.abs(quotient - Math.round(quotient)) < 0.05)
        continue
      if (!this.questionJamaisPosee(i, u0, q, seuil)) continue

      const symbole = choice(['<', '\\leqslant', '>', '\\geqslant'])
      const symboleApresDivision = u0 < 0 ? symboleInverse[symbole] : symbole
      const symboleFinal =
        q < 1 ? symboleInverse[symboleApresDivision] : symboleApresDivision
      const solutionsMajorees =
        symboleFinal === '<' || symboleFinal === '\\leqslant'
      const borne = solutionsMajorees
        ? Math.floor(quotient)
        : Math.ceil(quotient)

      const reponse = solutionsMajorees
        ? `n\\leqslant ${borne}`
        : `n\\geqslant ${borne}`
      // n est un entier naturel : n>4 équivaut à n⩾5, et n⩽3 à 0⩽n⩽3.
      const reponsesAcceptees = solutionsMajorees
        ? [reponse, `n<${borne + 1}`, `0\\leqslant n\\leqslant ${borne}`]
        : [reponse, `n>${borne - 1}`]

      const u0Tex = texNombre(u0, 0)
      const qTex = texNombre(q, 2)
      const seuilTex = texNombre(seuil, 0)
      const termeGeneral = `${u0Tex}\\times ${qTex}^n`
      const fraction = `\\dfrac{${texNombre(Math.abs(seuil), 0)}}{${texNombre(Math.abs(u0), 0)}}`
      const logFraction = `\\ln\\left(${fraction}\\right)`
      const logQ = `\\ln(${qTex})`

      createQuestion(this, i, {
        question: `On considère la suite géométrique $(u_n)$ de premier terme $u_0=${u0Tex}$ et de raison $q=${qTex}$.<br>
On cherche pour quelles valeurs de l'entier naturel $n$ on a $u_n${symbole} ${seuilTex}$.<br>
Résoudre dans $\\mathbb{N}$ l'inéquation $${termeGeneral}${symbole} ${seuilTex}$.`,
        correction: `La suite $(u_n)$ est géométrique, donc pour tout entier naturel $n$, $u_n=u_0\\times q^n$, soit $u_n=${termeGeneral}$.<br>
On en déduit${sp()}:<br>
$\\begin{aligned}
${termeGeneral}${symbole} ${seuilTex} &\\iff ${qTex}^n ${symboleApresDivision} ${fraction} \\quad \\text{car } {${u0Tex}}${u0 > 0 ? '>' : '<'}0\\\\
&\\iff \\ln\\left(${qTex}^n\\right) ${symboleApresDivision} ${logFraction} \\quad \\text{car } \\ln \\text{ est strictement croissante sur } ]0\\;;\\;+\\infty[\\\\
&\\iff n${logQ} ${symboleApresDivision} ${logFraction}\\\\
&\\iff n ${symboleFinal} \\dfrac{${logFraction}}{${logQ}} \\quad \\text{car } ${logQ}${q > 1 ? '>' : '<'}0
\\end{aligned}$<br>
Or, $\\dfrac{${logFraction}}{${logQ}}\\approx ${texNombre(quotient, 2)}$.<br>
Comme $n$ est un entier naturel, les solutions sont les entiers tels que $${miseEnEvidence(reponse)}$.`,
        answer: {
          value: reponsesAcceptees,
          compare: seq([
            sameIntervalCondition({
              variable: 'n',
              feedbackKo:
                'Écrire une inégalité portant sur $n$, avec une borne entière, et vérifier son sens.',
            }),
          ]),
        },
        field: {
          keyboard: `${KeyboardType.clavierSuite} ${KeyboardType.clavierCompare}`,
          texteAvant: `<br>Quelle inégalité portant sur $n$, avec une borne entière, décrit ces solutions${sp()}?<br>`,
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
