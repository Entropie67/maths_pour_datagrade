import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import Decimal from 'decimal.js'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
export const titre =
  'Compléter une somme contenant une fraction avec un décimal'
export const interactifReady = true

export const dateDePublication = '24/11/2024'
export const uuid = '779eb'
export const refs = {
  'fr-fr': ['can5C4-06', '5N3autoB-3'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class fractionsDecimaux extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const listeFractions = [
        [1, 2],
        [1, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [3, 4],
      ]
      const fraction = choice(listeFractions)
      const laFraction = new FractionEtendue(fraction[0], fraction[1])
      const laFractionDecimale = new Decimal(fraction[0]).div(fraction[1])
      const decimal = new Decimal(randint(1, 19)).div(100)
      const somme = new Decimal(fraction[0]).div(fraction[1]).add(decimal)

      const reponse = texNombre(decimal, 2)

      texte = `Compléter l'égalité avec un nombre décimal.<br>
            `
      handleAnswers(this, i, { champ1: { value: reponse } })
      texte += remplisLesBlancs(
        this,
        i,
        `${laFraction.texFraction} +~ %{champ1} =${texNombre(somme, 2)}`,
        'fillInTheBlank',
        '\\ldots',
      )
      texteCorr = `Comme $${laFraction.texFraction}=${texNombre(laFractionDecimale, 2)}$, alors : <br>
             $${laFraction.texFraction}+ ${miseEnEvidence(reponse)} =${texNombre(somme, 2)}$`
      this.canEnonce = "Compléter l'égalité avec un nombre décimal."
      this.canReponseACompleter = `$${laFraction.texFraction} +~ \\ldots ~ =${texNombre(somme, 2)}$`

      if (this.questionJamaisPosee(i, ...fraction, decimal, somme)) {
        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = this.canReponseACompleter

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
