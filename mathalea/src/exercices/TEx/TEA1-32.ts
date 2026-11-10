import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Déterminer si deux nombres sont congrus'
export const interactifReady = true
export const dateDePublication = '04/09/2026'
export const uuid = 'd0027'

export const refs = {
  'fr-fr': ['TEA1-32'],
  'fr-ch': [],
}

/**
 * @author Arnaud Meistermann
 */
export default class ExerciceCongruence extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? `L'affirmation suivante est-elle vraie ou fausse${sp()}?`
        : `Les affirmations suivantes sont-elles vraies ou fausses${sp()}?`
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(-50, 50)
      const c = choice([3, 4, 5, 6, 7, 8, 9])
      const resteDeA = ((a % c) + c) % c
      const estVraie = choice([true, false])
      const quotient = choice([-2, -1, 1, 2])
      const b = estVraie ? a + c * quotient : (resteDeA + choice([1, 2])) % c
      const difference = b - a
      const texte = `$${a} \\equiv ${b} \\, [${c}]$`
      const correction = estVraie
        ? `Rappel${sp()}: $a \\equiv b \\, [c]$ si et seulement si $b-a$ est divisible par $c$.<br>
        $${ecritureParentheseSiMoins(b)}-${ecritureParentheseSiMoins(a)}=${difference}$<br>
        Or, $${difference}$ est divisible par $${c}$.<br>${texteEnCouleurEtGras("L'affirmation est vraie.")}`
        : `Rappel${sp()}: $a \\equiv b \\, [c]$ si et seulement si $b-a$ est divisible par $c$.<br>
        $${ecritureParentheseSiMoins(b)}-${ecritureParentheseSiMoins(a)}=${difference}$<br>
        Or, $${difference}$ n'est pas divisible par $${c}$.<br>${texteEnCouleurEtGras("L'affirmation est fausse.")}`

      this.autoCorrection[i] = {
        options: { ordered: true, vertical: false, radio: true },
        enonce: texte,
        propositions: [
          { texte: 'Vrai', statut: estVraie },
          { texte: 'Faux', statut: !estVraie },
        ],
      }
      const props = propositionsQcm(this, i)
      const texteInteractif = this.interactif ? texte + props.texte : texte

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texteInteractif
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
