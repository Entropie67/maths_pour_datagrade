import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { verifieDeuxChampsSansOrdre } from '../../lib/interactif/verifieDeuxChampsSansOrdre'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Résoudre une équation complexe du second degré'
export const interactifReady = true
export const dateDePublication = '02/09/2026'
export const uuid = '79a7b'

export const refs = {
  'fr-fr': ['TEC1-43'],
  'fr-ch': [],
}

type SigneDelta = 'negatif' | 'nul' | 'positif'

/**
 * Résoudre dans C une équation du second degré à coefficients réels.
 *
 * @author Stéphane Guyon
 */
export default class EquationSecondDegreComplexe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.nbQuestionsModifiable = true
    this.spacing = 1.5
    this.spacingCorr = 2
    this.sup = 2
    this.besoinFormulaireNumerique = [
      'Signe du discriminant',
      2,
      '1 : Discriminant négatif\n2 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Résoudre dans $\\mathbb{C}$ l’équation suivante.'
        : 'Résoudre dans $\\mathbb{C}$ les équations suivantes.'
    const signesDelta: SigneDelta[] =
      Number(this.sup) === 1
        ? Array<SigneDelta>(this.nbQuestions).fill('negatif')
        : combinaisonListes<SigneDelta>(
            ['negatif', 'nul', 'positif'],
            this.nbQuestions,
          )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const signeDelta = signesDelta[i]
      const coefficientQuadratique = randint(1, 3)
      let coefficientLineaire: number
      let constante: number
      let delta: number
      let racineDelta: number
      let solutions: Complexe[]

      if (signeDelta === 'negatif') {
        const partieReelle = randint(-5, 5)
        const partieImaginaire = randint(1, 4)
        coefficientLineaire = -2 * coefficientQuadratique * partieReelle
        constante =
          coefficientQuadratique * (partieReelle ** 2 + partieImaginaire ** 2)
        delta =
          coefficientLineaire ** 2 - 4 * coefficientQuadratique * constante
        racineDelta = Math.sqrt(-delta)
        solutions = [
          new Complexe(partieReelle, -partieImaginaire),
          new Complexe(partieReelle, partieImaginaire),
        ]
      } else if (signeDelta === 'nul') {
        const racineDouble = randint(-5, 5)
        coefficientLineaire = -2 * coefficientQuadratique * racineDouble
        constante = coefficientQuadratique * racineDouble ** 2
        delta = 0
        racineDelta = 0
        solutions = [new Complexe(racineDouble, 0)]
      } else {
        const racine1 = randint(-5, 5)
        const racine2 = randint(-5, 5, racine1)
        const racines = [racine1, racine2].sort((x, y) => x - y)
        coefficientLineaire = -coefficientQuadratique * (racine1 + racine2)
        constante = coefficientQuadratique * racine1 * racine2
        delta =
          coefficientLineaire ** 2 - 4 * coefficientQuadratique * constante
        racineDelta = Math.sqrt(delta)
        solutions = [new Complexe(racines[0], 0), new Complexe(racines[1], 0)]
      }

      const equation = reduirePolynomeDegre3(
        0,
        coefficientQuadratique,
        coefficientLineaire,
        constante,
        'z',
      )
      let texte = `$${equation}=0$.`
      let texteCorr: string

      if (coefficientLineaire === 0) {
        const secondMembre = -constante / coefficientQuadratique
        const racineSecondMembre = Math.sqrt(Math.abs(secondMembre))
        texteCorr = `Le coefficient du terme en $z$ est nul. On isole directement $z^2$${sp()}:<br>
        $\\begin{aligned}
        ${equation}&=0\\\\
        ${rienSi1(coefficientQuadratique)}z^2&=${-constante}\\\\
        z^2&=${secondMembre}.
        \\end{aligned}$<br>`
        if (secondMembre > 0) {
          texteCorr += `Comme $${secondMembre}=${racineSecondMembre}^2$, on obtient $z=${racineSecondMembre}$ ou $z=-${racineSecondMembre}$.<br>
          Les solutions sont donc $z_1=${miseEnEvidence(solutions[0].tex())}$ et $z_2=${miseEnEvidence(solutions[1].tex())}$.`
        } else if (secondMembre < 0) {
          texteCorr += `On obtient donc $z=${rienSi1(racineSecondMembre)}i$ ou $z=-${rienSi1(racineSecondMembre)}i$.<br>
          Les solutions sont donc les deux nombres complexes conjugués $z_1=${miseEnEvidence(solutions[0].tex())}$ et $z_2=${miseEnEvidence(solutions[1].tex())}$.`
        } else {
          texteCorr += `L’égalité $z^2=0$ donne directement l’unique solution $z_0=${miseEnEvidence('0')}$.`
        }
      } else {
        texteCorr = `Pour résoudre cette équation du second degré, on calcule le discriminant${sp()}:<br>
        $\\begin{aligned}
        \\Delta
        &=(${coefficientLineaire})^2-4\\times ${coefficientQuadratique}\\times ${ecritureParentheseSiNegatif(constante)}\\\\
        &=${delta}.
        \\end{aligned}$<br>`

        if (signeDelta === 'negatif') {
          texteCorr += `Comme $\\Delta<0$, l’équation n’a pas de solution dans $\\mathbb{R}$, mais elle admet deux solutions dans $\\mathbb{C}$${sp()}:<br>
        
         $z_1=\\dfrac{-b+\\mathrm{i}\\sqrt{-\\Delta}}{2a}$ et $z_2=\\dfrac{-b-\\mathrm{i}\\sqrt{-\\Delta}}{2a}$. <br>On obtient ici${sp()}:<br>
        $\\begin{aligned}
        z_1&=\\dfrac{-(${coefficientLineaire})-${racineDelta}i}{2\\times ${coefficientQuadratique}}=${solutions[0].tex()},\\\\
        z_2&=\\dfrac{-(${coefficientLineaire})+${racineDelta}i}{2\\times ${coefficientQuadratique}}=${solutions[1].tex()}.
        \\end{aligned}$<br>
        Les solutions sont donc les deux nombres complexes conjugués $z_1=${miseEnEvidence(solutions[0].tex())}$ et $z_2=${miseEnEvidence(solutions[1].tex())}$`
        } else if (signeDelta === 'nul') {
          texteCorr += `Comme $\\Delta=0$, l’équation admet une solution double${sp()}:<br>
          $z_0=\\dfrac{-(${coefficientLineaire})}{2\\times ${coefficientQuadratique}}=${miseEnEvidence(solutions[0].tex())}$.`
        } else {
          texteCorr += `Comme $\\Delta>0$, l’équation admet deux solutions réelles${sp()}:<br>
          $\\begin{aligned}
          z_1&=\\dfrac{-(${coefficientLineaire})-${racineDelta}}{2\\times ${coefficientQuadratique}}=${solutions[0].tex()},\\\\
          z_2&=\\dfrac{-(${coefficientLineaire})+${racineDelta}}{2\\times ${coefficientQuadratique}}=${solutions[1].tex()}.
          \\end{aligned}$<br>
          Les solutions sont donc $z_1=${miseEnEvidence(solutions[0].tex())}$ et $z_2=${miseEnEvidence(solutions[1].tex())}$.`
        }
      }

      if (this.interactif) {
        const modeleReponse =
          solutions.length === 1
            ? 'z_0=%{champ1}'
            : 'z_1=%{champ1}\\quad\\text{et}\\quad z_2=%{champ2}'
        texte += `<br>${remplisLesBlancs(
          this,
          i,
          modeleReponse,
          KeyboardType.complexes,
        )}`
      }

      handleAnswers(
        this,
        i,
        solutions.length === 1
          ? { champ1: { value: solutions[0].tex() } }
          : {
              champ1: { value: solutions[0].tex() },
              champ2: { value: solutions[1].tex() },
              // Les deux solutions peuvent être saisies dans n'importe quel ordre.
              callback: verifieDeuxChampsSansOrdre([
                solutions[0].tex(),
                solutions[1].tex(),
              ]),
            },
        { formatInteractif: 'fill-in-the-blank' },
      )

      if (
        this.questionJamaisPosee(
          i,
          coefficientQuadratique,
          coefficientLineaire,
          constante,
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
