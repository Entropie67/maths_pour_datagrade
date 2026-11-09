import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des calculs avec deux nombres complexes'
export const interactifReady = true
export const dateDePublication = '29/08/2026'
export const uuid = '5c37f'

export const refs = {
  'fr-fr': ['TEC1-13'],
  'fr-ch': [],
}

type TypeCalcul = 'somme' | 'produit' | 'sommeCarres'

/**
 * Calculer une somme, un produit ou une somme de carrés de deux complexes.
 *
 * @author Stéphane Guyon
 */
export default class CalculsDeuxComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacing = 1.5
    this.spacingCorr = 2
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type de calcul',
      4,
      '1 : Somme\n2 : Produit\n3 : Somme des carrés\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne = ''

    const typeChoisi: TypeCalcul =
      this.sup === 1 ? 'somme' : this.sup === 2 ? 'produit' : 'sommeCarres'
    const typesCalculs =
      this.sup === 4
        ? combinaisonListes<TypeCalcul>(
            ['somme', 'produit', 'sommeCarres'],
            this.nbQuestions,
          )
        : combinaisonListes<TypeCalcul>([typeChoisi], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = randint(-5, 5, 0)
      const b = randint(-5, 5, 0)
      const c = randint(-5, 5, 0)
      const d = randint(-5, 5, 0)
      const z1 = new Complexe(a, b)
      const z2 = new Complexe(c, d)
      const typeCalcul = typesCalculs[i]
      let calcul = ''
      let resultat: Complexe
      let calculIntermediaire = ''

      if (typeCalcul === 'somme') {
        calcul = 'z_1+z_2'
        resultat = z1.add(z2)
        calculIntermediaire = `(${a}${ecritureAlgebrique(c)})+(${b}${ecritureAlgebrique(d)})i`
      } else if (typeCalcul === 'produit') {
        calcul = 'z_1\\times z_2'
        resultat = z1.mul(z2)
        calculIntermediaire = `${a}\\times${ecritureParentheseSiNegatif(c)}${ecritureAlgebriqueSauf1(a * d)}i${ecritureAlgebriqueSauf1(b * c)}i${ecritureAlgebriqueSauf1(b * d)}i^2\\\\
        &=${a * c - b * d}${ecritureAlgebriqueSauf1(a * d + b * c)}i`
      } else {
        calcul = 'z_1^2+z_2^2'
        resultat = z1.mul(z1).add(z2.mul(z2))
        calculIntermediaire = `(${ecritureParentheseSiNegatif(a)}^2${ecritureAlgebrique(2 * a * b)}i-${ecritureParentheseSiNegatif(b)}^2)+(${ecritureParentheseSiNegatif(c)}^2${ecritureAlgebrique(2 * c * d)}i-${ecritureParentheseSiNegatif(d)}^2)\\\\
        &=${a ** 2 - b ** 2 + c ** 2 - d ** 2}${ecritureAlgebrique(2 * a * b + 2 * c * d)}i`
      }

      if (resultat.isReal || resultat.isImaginary) continue

      let texte = `Soient $z_1$ et $z_2$ deux nombres complexes définis par $z_1=${z1.tex()}$ et $z_2=${z2.tex()}$.<br>
      Déterminer la forme algébrique de $${calcul}$.`
      const texteCorr = `$\\begin{aligned}
      ${calcul}&=${typeCalcul === 'somme' ? `${z1.parentheseSiComplexe()}+${z2.parentheseSiComplexe()}` : typeCalcul === 'produit' ? `${z1.parentheseSiComplexe()}\\times${z2.parentheseSiComplexe()}` : `${z1.parentheseSiComplexe()}^2+${z2.parentheseSiComplexe()}^2`}\\\\
      &=${calculIntermediaire}\\\\
      &=${miseEnEvidence(resultat.tex())}.
      \\end{aligned}$`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
          texteAvant: '<br>',
        })
      }
      handleAnswers(this, i, { reponse: { value: resultat.tex() } })

      if (this.questionJamaisPosee(i, typeCalcul, a, b, c, d)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
