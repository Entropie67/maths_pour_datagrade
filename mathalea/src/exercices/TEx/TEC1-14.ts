import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Développer des identités remarquables avec des nombres complexes'
export const interactifReady = true
export const dateDePublication = '01/09/2026'
export const uuid = '7c335'

export const refs = {
  'fr-fr': ['TEC1-14'],
  'fr-ch': [],
}

type TypeQuestion = 'carre' | 'produitConjugues'

/**
 * Calculer le carré d'un nombre complexe ou le produit de deux nombres
 * complexes conjugués.
 *
 * @author Stéphane Guyon
 */
export default class CalculsAvecNombresComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      'Effectuer le calcul, puis donner le résultat sous forme algébrique.'
    const typesQuestions = combinaisonListes<TypeQuestion>(
      ['carre', 'produitConjugues'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeQuestion = typesQuestions[i]
      const a = randint(-5, 5, 0)
      const b = randint(-5, 5, 0)
      const z = new Complexe(a, b)
      const zConjugue = z.conjugue()
      const resultat = typeQuestion === 'carre' ? z.pow(2) : z.mul(zConjugue)
      const expression =
        typeQuestion === 'carre'
          ? `${z.parentheseSiComplexe()}^2`
          : `${z.parentheseSiComplexe()}${zConjugue.parentheseSiComplexe()}`

      let texte = `$${expression}=$`
      let texteCorr: string

      if (typeQuestion === 'carre') {
        texteCorr = `On utilise l'identité $(x+y)^2=x^2+2xy+y^2$ et l'égalité $i^2=-1$ :<br>
        $\\begin{aligned}
        ${expression}
        &=${a}^2+2\\times ${ecritureParentheseSiNegatif(a)}\\times ${Math.abs(b) === 1 ? (b < 0 ? '(-i)' : 'i') : `${ecritureParentheseSiNegatif(b)}i`}+${ecritureParentheseSiNegatif(b)}^2i^2\\\\
        &=${a ** 2}-${b ** 2}${ecritureAlgebrique(2 * a * b)}i\\\\
        &=${miseEnEvidence(resultat.tex())}.
        \\end{aligned}$`
      } else {
        texteCorr = `On utilise l'identité remarquable : pour tous $x,y\\in\\mathbb{C}$, $(x+y)(x-y)=x^2-y^2$, ainsi que l'égalité $i^2=-1$ :<br>
        $\\begin{aligned}
        ${expression}
        &=${a}^2-(${rienSi1(b)}i)^2\\\\
        &=${a ** 2}-${rienSi1(b ** 2)}i^2\\\\
        &=${a ** 2}+${b ** 2}\\\\
        &=${miseEnEvidence(resultat.tex())}.
        \\end{aligned}$`
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
          texteAvant: '<br>',
        })
      }
      handleAnswers(this, i, { reponse: { value: resultat.tex() } })

      if (this.questionJamaisPosee(i, typeQuestion, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
