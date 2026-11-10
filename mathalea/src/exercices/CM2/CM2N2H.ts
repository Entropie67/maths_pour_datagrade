import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Effectuer des opérations simples avec des fractions'
export const interactifReady = true

export const dateDeModifImportante = '25/08/2024'

/**
 * Somme ou différence de deux fractions de même dénominateur simple, produit par un entier
 * @author Rémi Angot
 * refait en exercice classique par Jean-claude Lhote
 */
export const uuid = '3a087'

export const refs = {
  'fr-fr': ['CM2N2H', 'BP2AutoH26'],
  'fr-2016': ['c3C23', 'BP2AutoH26'],
  'fr-ch': ['NR'],
}
class CalculsFractionsSimples extends Exercice {
  version: string
  constructor() {
    super()
    this.nbQuestions = 6
    this.sup = '1-2'
    this.consigne = 'Calculer.'

    this.version = 'c3'
    this.besoinFormulaireTexte = [
      'Opérations',
      'Nombres séparés par des tirets :\n1 : Additions\n2 : Soustractions\n3: Multiplications par un entier\n4: Mélange',
    ]
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const den = choice([2, 3, 4, 5, 10])
      let a = randint(1, 10, [den, 2 * den, 3 * den, 4 * den])
      let b = randint(1, 10, [den, 2 * den, 3 * den, 4 * den])
      let num: number
      let texte: string
      let texteCorr: string
      let value: string
      switch (Number(listeTypeQuestions[i])) {
        case 1: // addition
          num = a + b
          texte = `$\\dfrac{${a}}{${den}}+\\dfrac{${b}}{${den}}=$`
          value = `\\frac{${a + b}}{${den}}`
          texteCorr = `$\\dfrac{${a}}{${den}}+\\dfrac{${b}}{${den}}=\\dfrac{${a}+${b}}{${den}}=${miseEnEvidence(`\\dfrac{${num}}{${den}}`)}$`
          break
        case 2: // soustraction
          if (a < b) [a, b] = [b, a]
          num = a - b
          texte = `$\\dfrac{${a}}{${den}}-\\dfrac{${b}}{${den}}=$`
          value = `\\frac{${a - b}}{${den}}`
          texteCorr = `$\\dfrac{${a}}{${den}}-\\dfrac{${b}}{${den}}=\\dfrac{${a}-${b}}{${den}}=${miseEnEvidence(`\\dfrac{${num}}{${den}}`)}$`
          break
        default: // multiplication par un entier
          a = randint(2, 10)
          num = a * b
          texte = `$${a}\\times\\dfrac{${b}}{${den}}=$`
          value = `\\frac{${a * b}}{${den}}`
          texteCorr = `$${a} \\times \\dfrac{${b}}{${den}}=\\dfrac{${a}\\times ${b}}{${den}}=${miseEnEvidence(`\\dfrac{${num}}{${den}}`)}$`
          break
      }
      if (this.questionJamaisPosee(i, a, b, den, listeTypeQuestions[i])) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        if (this.interactif)
          handleAnswers(this, i, {
            reponse: { value, options: { fractionEgale: true } },
          })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
export default CalculsFractionsSimples
