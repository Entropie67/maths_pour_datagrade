import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { verifieDeuxChampsSansOrdre } from '../../lib/interactif/verifieDeuxChampsSansOrdre'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusByPlusC,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une équation complexe avec un conjugué'
export const interactifReady = true
export const dateDePublication = '01/09/2026'
export const uuid = 'f3ebd'

export const refs = {
  'fr-fr': ['TEC1-42'],
  'fr-ch': [],
}

type TypeQuestion = 1 | 2

/**
 * Résoudre des équations complexes faisant intervenir z et son conjugué.
 *
 * @author Stéphane Guyon
 */
export default class EquationsAvecConjugue extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 1.5
    this.spacingCorr = 2
    this.sup = 3
    this.besoinFormulaireNumerique = [
      "Type d'équations",
      3,
      '1 : az+bz̅=c avec a, b et c complexes\n2 : azz̅=bz+c avec a, b et c réels\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Résoudre dans $\\mathbb{C}$ l'équation suivante."
        : 'Résoudre dans $\\mathbb{C}$ les équations suivantes.'
    const typeSelectionne = Number(this.sup)
    const typesQuestions: TypeQuestion[] =
      typeSelectionne === 3
        ? combinaisonListes<TypeQuestion>([1, 2], this.nbQuestions)
        : Array<TypeQuestion>(this.nbQuestions).fill(
            typeSelectionne as TypeQuestion,
          )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const typeQuestion = typesQuestions[i]
      let texte: string
      let texteCorr: string

      if (typeQuestion === 1) {
        const solution = new Complexe(randint(-4, 4), randint(-4, 4, 0))
        const coefficientA = new Complexe(randint(-3, 3, 0), randint(-3, 3, 0))
        const coefficientB = new Complexe(randint(-3, 3, 0), randint(-3, 3, 0))
        const ar = Number(coefficientA.re)
        const ai = Number(coefficientA.im)
        const br = Number(coefficientB.re)
        const bi = Number(coefficientB.im)
        const coefficientXReel = ar + br
        const coefficientYReel = bi - ai
        const coefficientXImaginaire = ai + bi
        const coefficientYImaginaire = ar - br
        const determinant =
          coefficientXReel * coefficientYImaginaire -
          coefficientYReel * coefficientXImaginaire

        if (
          determinant === 0 ||
          [
            coefficientXReel,
            coefficientYReel,
            coefficientXImaginaire,
            coefficientYImaginaire,
          ].includes(0)
        ) {
          continue
        }

        const coefficientC = coefficientA
          .mul(solution)
          .add(coefficientB.mul(solution.conjugue()))
        const cr = Number(coefficientC.re)
        const ci = Number(coefficientC.im)
        const x = Number(solution.re)
        const y = Number(solution.im)
        const membreDroitCombinaisonX =
          cr * coefficientYImaginaire - coefficientYReel * ci
        const membreDroitCombinaisonY =
          coefficientXReel * ci - coefficientXImaginaire * cr
        const membreGauche = `${coefficientA.parentheseSiComplexe()}z+${coefficientB.parentheseSiComplexe()}\\overline{z}`
        let resolutionSysteme: string

        if (Math.abs(coefficientYReel) === Math.abs(coefficientYImaginaire)) {
          const coefficientsEgaux = coefficientYReel === coefficientYImaginaire
          const operation = coefficientsEgaux ? '-' : '+'
          const coefficientX = coefficientsEgaux
            ? coefficientXReel - coefficientXImaginaire
            : coefficientXReel + coefficientXImaginaire
          const membreDroit = coefficientsEgaux ? cr - ci : cr + ci
          const membreDroitPourY = cr - coefficientXReel * x
          const natureCoefficients = coefficientsEgaux ? 'égaux' : 'opposés'
          const calculX =
            coefficientX === 1
              ? `x&=${membreDroit}.`
              : coefficientX === -1
                ? `-x&=${membreDroit}\\\\
          x&=${-membreDroit}.`
                : `${rienSi1(coefficientX)}x&=${membreDroit}\\\\
          x&=\\dfrac{${membreDroit}}{${coefficientX}}=${x}.`
          const calculY =
            coefficientYReel === 1
              ? `y&=${membreDroitPourY}.`
              : coefficientYReel === -1
                ? `-y&=${membreDroitPourY}\\\\
          y&=${-membreDroitPourY}.`
                : `${rienSi1(coefficientYReel)}y&=${membreDroitPourY}\\\\
          y&=\\dfrac{${membreDroitPourY}}{${coefficientYReel}}=${y}.`
          resolutionSysteme = `Les coefficients de $y$ sont ${natureCoefficients}. On élimine donc d'abord $y$ en effectuant $(E_1)${operation}(E_2)$ :<br>
          $\\begin{aligned}
          ${calculX}
          \\end{aligned}$<br>
          On remplace ensuite $x$ par $${x}$ dans $(E_1)$ :<br>
          $\\begin{aligned}
          ${ecritureParentheseSiNegatif(coefficientXReel)}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebriqueSauf1(coefficientYReel)}y&=${cr}\\\\
          ${calculY}
          \\end{aligned}$<br>`
        } else {
          const calculX =
            determinant === 1
              ? `x&=${membreDroitCombinaisonX}.`
              : determinant === -1
                ? `-x&=${membreDroitCombinaisonX}\\\\
          x&=${-membreDroitCombinaisonX}.`
                : `${rienSi1(determinant)}x&=${membreDroitCombinaisonX}\\\\
          x&=\\dfrac{${membreDroitCombinaisonX}}{${determinant}}=${x}.`
          const calculY =
            determinant === 1
              ? `y&=${membreDroitCombinaisonY}.`
              : determinant === -1
                ? `-y&=${membreDroitCombinaisonY}\\\\
          y&=${-membreDroitCombinaisonY}.`
                : `${rienSi1(determinant)}y&=${membreDroitCombinaisonY}\\\\
          y&=\\dfrac{${membreDroitCombinaisonY}}{${determinant}}=${y}.`
          resolutionSysteme = `Pour éliminer $y$, on effectue la combinaison linéaire $${ecritureParentheseSiNegatif(coefficientYImaginaire)}\\times(E_1)-${ecritureParentheseSiNegatif(coefficientYReel)}\\times(E_2)$ :<br>
          $\\begin{aligned}
          ${calculX}
          \\end{aligned}$<br>
          Pour éliminer $x$, on effectue la combinaison linéaire $${ecritureParentheseSiNegatif(coefficientXReel)}\\times(E_2)-${ecritureParentheseSiNegatif(coefficientXImaginaire)}\\times(E_1)$ :<br>
          $\\begin{aligned}
          ${calculY}
          \\end{aligned}$<br>`
        }

        texte = `$${membreGauche}=${coefficientC.tex()}$.`
        texteCorr = `On pose $z=x+iy$, avec $x$ et $y$ réels. Alors $\\overline{z}=x-iy$.<br>
        Développons séparément les deux termes du membre de gauche :<br>
        $\\begin{aligned}
        ${coefficientA.parentheseSiComplexe()}z
        &=${coefficientA.parentheseSiComplexe()}(x+iy)\\\\
        &=\\left(${reduireAxPlusByPlusC(ar, -ai, 0)}\\right)+i\\left(${reduireAxPlusByPlusC(ai, ar, 0)}\\right),\\\\[0.5em]
        ${coefficientB.parentheseSiComplexe()}\\overline{z}
        &=${coefficientB.parentheseSiComplexe()}(x-iy)\\\\
        &=\\left(${reduireAxPlusByPlusC(br, bi, 0)}\\right)+i\\left(${reduireAxPlusByPlusC(bi, -br, 0)}\\right).
        \\end{aligned}$<br>
        En additionnant ces deux expressions, on obtient :<br>
        $${membreGauche}=\\left(${reduireAxPlusByPlusC(coefficientXReel, coefficientYReel, 0)}\\right)+i\\left(${reduireAxPlusByPlusC(coefficientXImaginaire, coefficientYImaginaire, 0)}\\right)$.<br>
        En identifiant les parties réelles et imaginaires avec celles de $${coefficientC.tex()}$, on obtient le système :<br>
        $\\begin{cases}
        ${reduireAxPlusByPlusC(coefficientXReel, coefficientYReel, 0)}=${cr} & (E_1)\\\\
        ${reduireAxPlusByPlusC(coefficientXImaginaire, coefficientYImaginaire, 0)}=${ci} & (E_2)
        \\end{cases}$<br>
        ${resolutionSysteme}
        Vérifions que le couple $(${x}\\,;\\,${y})$ satisfait bien les deux équations du système de départ :<br>
        $\\begin{aligned}
        ${ecritureParentheseSiNegatif(coefficientXReel)}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(coefficientYReel)}\\times ${ecritureParentheseSiNegatif(y)}&=${cr},\\\\
        ${ecritureParentheseSiNegatif(coefficientXImaginaire)}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(coefficientYImaginaire)}\\times ${ecritureParentheseSiNegatif(y)}&=${ci}.
        \\end{aligned}$<br>
        Le couple $(${x}\\,;\\,${y})$ est donc bien solution du système.<br>
        La solution de l'équation est donc le nombre complexe $z=${miseEnEvidence(solution.tex())}$.`

        if (this.interactif) {
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: '<br>$z=$',
          })
        }
        handleAnswers(this, i, { reponse: { value: solution.tex() } })

        if (
          !this.questionJamaisPosee(
            i,
            typeQuestion,
            coefficientA.tex(),
            coefficientB.tex(),
            coefficientC.tex(),
          )
        ) {
          continue
        }
      } else {
        const coefficientA = randint(1, 3)
        const racine1 = randint(-5, 5, 0)
        const racine2 = randint(-5, 5, [0, racine1, -racine1])
        const racines = [racine1, racine2].sort((x, y) => x - y)
        const coefficientB = coefficientA * (racine1 + racine2)
        const coefficientC = -coefficientA * racine1 * racine2
        const coefficientLineaire = -coefficientB
        const constante = -coefficientC
        const delta = coefficientLineaire ** 2 - 4 * coefficientA * constante
        const racineDelta = Math.sqrt(delta)
        const solution1 = new Complexe(racines[0], 0)
        const solution2 = new Complexe(racines[1], 0)
        const trinome = reduirePolynomeDegre3(
          0,
          coefficientA,
          -coefficientB,
          -coefficientC,
          'x',
        )

        texte = `$${rienSi1(coefficientA)}z\\overline{z}=${rienSi1(coefficientB)}z${ecritureAlgebrique(coefficientC)}$.`
        texteCorr = `On pose $z=x+iy$, avec $x$ et $y$ réels. Alors :<br>
        $z\\overline{z}=(x+iy)(x-iy)=x^2+y^2$.<br>
        L'équation s'écrit donc :<br>
        $${rienSi1(coefficientA)}(x^2+y^2)=${rienSi1(coefficientB)}x${ecritureAlgebrique(coefficientC)}${ecritureAlgebriqueSauf1(coefficientB)}iy$.<br>
        En identifiant les parties réelles et imaginaires, on obtient :<br>
        $\\begin{cases}
        ${rienSi1(coefficientA)}(x^2+y^2)=${rienSi1(coefficientB)}x${ecritureAlgebrique(coefficientC)}\\\\
        ${rienSi1(coefficientB)}y=0
        \\end{cases}$<br>
        La seconde équation donne $y=0$. La première devient alors :<br>
        $${trinome}=0$.<br>
        Le discriminant de cette équation du second degré vaut :<br>
        $\\begin{aligned}
        \\Delta
        &=(${coefficientLineaire})^2-4\\times ${coefficientA}\\times ${ecritureParentheseSiNegatif(constante)}\\\\
        &=${delta}>0.
        \\end{aligned}$<br>
        Cette équation du second degré admet donc deux solutions réelles pour $x$ :<br>
        $\\begin{aligned}
        x_1&=\\dfrac{-(${coefficientLineaire})-${racineDelta}}{2\\times ${coefficientA}}=${racines[0]},\\\\
        x_2&=\\dfrac{-(${coefficientLineaire})+${racineDelta}}{2\\times ${coefficientA}}=${racines[1]}.
        \\end{aligned}$<br>
        Comme $y=0$, les solutions de l'équation initiale sont donc les nombres complexes $z_1=${miseEnEvidence(solution1.tex())}$ et $z_2=${miseEnEvidence(solution2.tex())}$.`

        if (this.interactif) {
          texte += `<br>${remplisLesBlancs(
            this,
            i,
            'z_1=%{champ1}\\quad\\text{et}\\quad z_2=%{champ2}',
            KeyboardType.complexes,
          )}`
        }
        handleAnswers(
          this,
          i,
          {
            champ1: { value: solution1.tex() },
            champ2: { value: solution2.tex() },
            // Les deux solutions peuvent être saisies dans n'importe quel ordre.
            callback: verifieDeuxChampsSansOrdre([
              solution1.tex(),
              solution2.tex(),
            ]),
          },
          { formatInteractif: 'fill-in-the-blank' },
        )

        if (
          !this.questionJamaisPosee(
            i,
            typeQuestion,
            coefficientA,
            coefficientB,
            coefficientC,
          )
        ) {
          continue
        }
      }

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
