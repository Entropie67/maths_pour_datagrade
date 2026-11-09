import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { matrice } from '../../lib/mathFonctions/Matrice'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer l'inverse d'une matrice carrée d'ordre $2$"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '27/09/2026'

/**
 * Calculer le déterminant d'une matrice 2x2, justifier qu'elle est inversible
 * puis calculer son inverse.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '659d4'

export const refs = {
  'fr-fr': ['TEM1-21'],
  'fr-ch': [],
}
export default class InverseMatrice2x2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireNumerique = [
      "Coefficients de l'inverse",
      3,
      '1 : Entiers (déterminant égal à 1 ou -1)\n2 : Fractionnaires\n3 : Mélange',
    ]
    this.sup = 3
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes(
      this.sup === 3 ? [1, 2] : [this.sup],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      // On tire des coefficients non nuls jusqu'à obtenir un déterminant du type voulu.
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let det = 0
      for (let essai = 0; essai < 1000; essai++) {
        a = randint(-6, 6, 0)
        b = randint(-6, 6, 0)
        c = randint(-6, 6, 0)
        d = randint(-6, 6, 0)
        det = a * d - b * c
        if (
          typesDeQuestions[i] === 1 ? Math.abs(det) === 1 : Math.abs(det) >= 2
        )
          break
      }
      if (det === 0) continue
      const A = matrice([
        [a, b],
        [c, d],
      ])
      const coefficients = [d, -b, -c, a].map((k) =>
        fraction(k, det).simplifie(),
      )
      const texCoefficients = coefficients.map((f) => f.texFSD)

      let texte = `Soit $A=${A.toTex()}$.<br>Justifier que $A$ est inversible, puis calculer $A^{-1}$.`
      if (this.interactif) {
        texte +=
          '<br><br>$A^{-1}=$ ' +
          remplisLesBlancs(
            this,
            i,
            '\\begin{pmatrix}%{champ1} & %{champ2}\\\\%{champ3} & %{champ4}\\end{pmatrix}',
            KeyboardType.clavierDeBaseAvecFraction,
          )
      }
      handleAnswers(this, i, {
        bareme: toutPourUnPoint,
        champ1: { value: texCoefficients[0] },
        champ2: { value: texCoefficients[1] },
        champ3: { value: texCoefficients[2] },
        champ4: { value: texCoefficients[3] },
      })

      let texteCorr =
        'Pour une matrice $A=\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}$, on a $\\det(A)=\\begin{vmatrix}a & b\\\\c & d\\end{vmatrix}=ad-bc$.<br>'
      texteCorr += `Ici, $\\det(A)=\\begin{vmatrix}${a} & ${b}\\\\${c} & ${d}\\end{vmatrix}=${a}\\times ${ecritureParentheseSiNegatif(d)}-${ecritureParentheseSiNegatif(b)}\\times ${ecritureParentheseSiNegatif(c)}=${det}$.<br>`
      texteCorr +=
        'Or, on sait que si $\\det(A)\\neq 0$, alors $A$ est inversible et $A^{-1}=\\dfrac{1}{\\det(A)}\\begin{pmatrix}d & -b\\\\-c & a\\end{pmatrix}$.<br>'
      texteCorr += `Ici, $\\det(A)\\neq 0$ donc $A$ est inversible et on en déduit :<br>$A^{-1}=\\dfrac{1}{${det}}\\begin{pmatrix}${d} & ${-b}\\\\${-c} & ${a}\\end{pmatrix}$<br>`
      // On espace les lignes pour que les fractions ne se chevauchent pas.
      const sautDeLigne = coefficients.every((f) => f.estEntiere)
        ? '\\\\'
        : '\\\\[1em]'
      texteCorr += `Donc $A^{-1}=${miseEnEvidence(`\\begin{pmatrix}${texCoefficients[0]} & ${texCoefficients[1]}${sautDeLigne}${texCoefficients[2]} & ${texCoefficients[3]}\\end{pmatrix}`)}$`

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
