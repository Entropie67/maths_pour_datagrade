import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer des entiers à partir du quotient et du reste d’une division euclidienne'
export const dateDePublication = '23/09/2026'

export const uuid = '568c2'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TEA1-22'],
  'fr-ch': [],
}

/**
 * Déterminer les entiers naturels dont le quotient est égal au reste dans une
 * division euclidienne par un entier aléatoire.
 * @author Stéphane Guyon
 */
export default class QuotientEgalAuReste extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion(): void {
    for (let i = 0; i < this.nbQuestions; i++) {
      const diviseur = randint(3, 7)
      const restes = Array.from({ length: diviseur }, (_, reste) => reste)
      const solutions = restes.map((reste) => (diviseur + 1) * reste)
      const reponse = `\\{${solutions.map((solution) => texNombre(solution)).join(';')}\\}`
      const cas = restes.map(
        (reste) =>
          `Si $r=${texNombre(reste)}$, alors $q=${texNombre(reste)}$ et $n=${texNombre(diviseur)}\\times ${texNombre(reste)}+${texNombre(reste)}=${texNombre((diviseur + 1) * reste)}$`,
      )

      this.listeQuestions[i] =
        `Déterminer tous les entiers naturels $n$ qui, dans la division euclidienne par $${texNombre(diviseur)}$, donnent un quotient égal au reste.<br>` +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
          texteAvant: ' $S=$',
        })

      this.listeCorrections[i] =
        `Soit $n\\in\\mathbb N$. La division euclidienne de $n$ par $${texNombre(diviseur)}$ s’écrit $n=${texNombre(diviseur)}q+r$, avec $q\\in\\mathbb N$ et $r\\in\\{${restes.map((reste) => texNombre(reste)).join(';')}\\}$.<br>
      Le quotient étant égal au reste, on a $q=r$ ; il suffit donc d’examiner toutes les valeurs possibles de $r$ :<br>
      ${createList({ items: cas, style: 'fleches' })}<br>
      Dans chacune de ces égalités, on a $0\\leqslant r<${texNombre(diviseur)}$. Il s’agit donc bien de la division euclidienne de $n$ par $${texNombre(diviseur)}$. Son unicité garantit que la liste obtenue est exhaustive.<br>
      Ainsi, l’ensemble des solutions est $S=${miseEnEvidence(reponse)}$`

      handleAnswers(this, i, {
        reponse: { value: reponse, options: { ensembleDeNombres: true } },
      })
    }
    listeQuestionsToContenu(this)
  }
}
