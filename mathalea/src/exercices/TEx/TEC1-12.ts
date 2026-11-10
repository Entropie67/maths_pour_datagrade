import { choice } from '../../lib/outils/arrayOutils'
import { createList } from '../../lib/format/lists'
import { texteGras } from '../../lib/format/style'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer quand deux nombres complexes sont égaux'
export const dateDePublication = '30/08/2026'
export const dateDeModifImportante = '31/08/2026'
export const uuid = 'c4196'
export const refs = { 'fr-fr': ['TEC1-12'], 'fr-ch': [] }

type NatureEquation = 'deuxRacines' | 'racineDouble' | 'aucuneRacine'
type EquationSecondDegre = {
  coefficientQuadratique: number
  coefficientLineaire: number
  constante: number
  delta: number
  racineDelta: number
  solutions: number[]
  nature: NatureEquation
}

function genereEquationSecondDegre(
  coefficientQuadratique: number,
): EquationSecondDegre {
  const nature = choice<NatureEquation>([
    'deuxRacines',
    'racineDouble',
    'aucuneRacine',
  ])
  const centre = randint(-4, 4, 0)
  if (nature === 'deuxRacines') {
    const autreRacine = randint(-4, 4, [0, centre, -centre])
    const coefficientLineaire = -coefficientQuadratique * (centre + autreRacine)
    const constante = coefficientQuadratique * centre * autreRacine
    const delta =
      coefficientLineaire ** 2 - 4 * coefficientQuadratique * constante
    return {
      coefficientQuadratique,
      coefficientLineaire,
      constante,
      delta,
      racineDelta: Math.sqrt(delta),
      solutions: [centre, autreRacine].sort((x, y) => x - y),
      nature,
    }
  }
  const coefficientLineaire = -2 * coefficientQuadratique * centre
  if (nature === 'racineDouble') {
    return {
      coefficientQuadratique,
      coefficientLineaire,
      constante: coefficientQuadratique * centre ** 2,
      delta: 0,
      racineDelta: 0,
      solutions: [centre],
      nature,
    }
  }
  const constante = coefficientQuadratique * centre ** 2 + randint(1, 3)
  const delta =
    coefficientLineaire ** 2 - 4 * coefficientQuadratique * constante
  return {
    coefficientQuadratique,
    coefficientLineaire,
    constante,
    delta,
    racineDelta: 0,
    solutions: [],
    nature,
  }
}

function resolutionEquation(
  equation: EquationSecondDegre,
  inconnue: 'a' | 'b',
): string {
  const { coefficientQuadratique, coefficientLineaire, racineDelta } = equation
  if (equation.nature === 'deuxRacines') {
    return `Comme $\\Delta_${inconnue}>0$, l'équation admet deux solutions réelles :<br>
    $${inconnue}_1=\\dfrac{-(${coefficientLineaire})-${racineDelta}}{2\\times ${coefficientQuadratique}}=${equation.solutions[0]},\\quad
    ${inconnue}_2=\\dfrac{-(${coefficientLineaire})+${racineDelta}}{2\\times ${coefficientQuadratique}}=${equation.solutions[1]}$<br>`
  }
  if (equation.nature === 'racineDouble') {
    return `Comme $\\Delta_${inconnue}=0$, l'équation admet une unique solution réelle :<br>
    $${inconnue}=\\dfrac{-(${coefficientLineaire})}{2\\times ${coefficientQuadratique}}=${equation.solutions[0]}$<br>`
  }
  return `Comme $\\Delta_${inconnue}<0$, cette équation n'admet aucune solution réelle.<br>`
}

/**
 * Déterminer deux réels pour que deux nombres complexes soient égaux.
 * @author Stéphane Guyon
 */
export default class EgaliteDeuxComplexes extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const equationA = genereEquationSecondDegre(randint(1, 3))
      const equationB = genereEquationSecondDegre(1)
      const coefficientA2 = equationA.coefficientQuadratique + 1
      const coefficientA = -equationA.coefficientLineaire
      const coefficientB = -equationB.coefficientLineaire
      const partieReelleZ1 = reduirePolynomeDegre3(0, 1, coefficientA, 0, 'a')
      const partieReelleZ2 = reduirePolynomeDegre3(
        0,
        coefficientA2,
        0,
        equationA.constante,
        'a',
      )
      const equationReelle = reduirePolynomeDegre3(
        0,
        equationA.coefficientQuadratique,
        equationA.coefficientLineaire,
        equationA.constante,
        'a',
      )
      const coefficientIb = `${ecritureAlgebriqueSauf1(coefficientB)}ib`
      const texte = `Soient $a$ et $b$ deux réels et $z_1$ et $z_2$ les deux nombres complexes définis par :<br>
      $z_1=${partieReelleZ1}+i(b^2${ecritureAlgebrique(equationB.constante)})$ et $z_2=${partieReelleZ2}${coefficientIb}$.<br>
      Déterminer l'ensemble des valeurs de $a$ et $b$ telles que $z_1=z_2$.`

      let texteCorr = `Deux nombres complexes sont égaux si et seulement si leurs parties réelles sont égales et leurs parties imaginaires sont égales.<br>
      Ainsi, $z_1=z_2$ équivaut à :
      $\\begin{cases}
      ${partieReelleZ1}=${partieReelleZ2}\\\\
      b^2${ecritureAlgebrique(equationB.constante)}=${coefficientB}b
      \\end{cases}$<br>`
      const correctionPartieReelle = `<br>$\\begin{aligned}
      ${partieReelleZ1}&=${partieReelleZ2}\\\\
      \\iff ${equationReelle}&=0
      \\end{aligned}$<br>
      Le discriminant de cette équation du second degré vaut :<br>
      $\\begin{aligned}
      \\Delta_a&=(${equationA.coefficientLineaire})^2-4\\times ${equationA.coefficientQuadratique}\\times(${equationA.constante})\\\\
      &=${equationA.delta}
      \\end{aligned}$<br>${resolutionEquation(equationA, 'a')}`
      const correctionPartieImaginaire = `<br>$\\begin{aligned}
      b^2${ecritureAlgebrique(equationB.constante)}&=${coefficientB}b\\\\
      \\iff b^2${ecritureAlgebrique(equationB.coefficientLineaire)}b${ecritureAlgebrique(equationB.constante)}&=0
      \\end{aligned}$<br>
      Le discriminant de cette équation du second degré vaut :<br>
      $\\begin{aligned}
      \\Delta_b&=(${equationB.coefficientLineaire})^2-4\\times1\\times(${equationB.constante})\\\\
      &=${equationB.delta}
      \\end{aligned}$<br>${resolutionEquation(equationB, 'b')}`
      const itemsCorrection = [
        {
          description: texteGras('Partie réelle'),
          text: correctionPartieReelle,
        },
      ]
      if (equationA.solutions.length > 0) {
        itemsCorrection.push({
          description: texteGras('Partie imaginaire'),
          text: correctionPartieImaginaire,
        })
      }
      texteCorr += createList({
        items: itemsCorrection,
        style: 'fleches',
      })

      const couples = equationA.solutions.flatMap((a) =>
        equationB.solutions.map((b) => `(${a}\\,;\\,${b})`),
      )
      const ensembleSolutions =
        couples.length === 0
          ? 'S=\\varnothing'
          : `S=\\left\\{${couples.join('\\,;\\,')}\\right\\}`
      texteCorr += `L'ensemble des solutions est donc $${miseEnEvidence(ensembleSolutions)}$.`

      if (
        this.questionJamaisPosee(
          i,
          equationA.coefficientQuadratique,
          equationA.coefficientLineaire,
          equationA.constante,
          equationB.coefficientLineaire,
          equationB.constante,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
