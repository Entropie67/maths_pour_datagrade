import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Ajouter deux nombres décimaux inférieurs à $10$, s'écrivant avec au plus un chiffre après la virgule"
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Ajouter deux nombres décimaux inférieurs à 10 avec au plus un chiffre après la virgule
 * @author Rémi Angot
 */
export const uuid = '422be'

export const refs = {
  'fr-fr': ['CM2N4I'],
  'fr-ch': ['9R1NO6B-11', '9R2NO6B-11', '9R3NO6B-11'],
}
export default class AjouterDeuxDecimaux extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
    this.nbQuestions = 8
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Au moins un des deux nombres n'est pas entier
      const a = new Decimal(randint(11, 98)).div(10)
      const b = new Decimal(randint(11, 98)).div(10)
      if (a.mod(1).isZero() && b.mod(1).isZero()) {
        cpt++
        continue
      }
      const somme = a.add(b)
      const partieEntiereA = a.floor()
      const partieEntiereB = b.floor()
      const partieDecimaleA = a.sub(partieEntiereA)
      const partieDecimaleB = b.sub(partieEntiereB)
      const sommeEntieres = partieEntiereA.add(partieEntiereB)
      const sommeDecimales = partieDecimaleA.add(partieDecimaleB)

      let texte = `$${texNombre(a, 1)}+${texNombre(b, 1)}$`
      const explication = texteEnCouleur(
        `On additionne les parties entières : $${texNombre(partieEntiereA, 0)}+${texNombre(partieEntiereB, 0)}=${texNombre(sommeEntieres, 0)}$, puis les parties décimales : $${texNombre(partieDecimaleA, 1)}+${texNombre(partieDecimaleB, 1)}=${texNombre(sommeDecimales, 1)}$.`,
        bleuMathalea,
      )
      const texteCorr = `${explication}<br>$${texNombre(a, 1)}+${texNombre(b, 1)}=${texNombre(sommeEntieres, 0)}+${texNombre(sommeDecimales, 1)}=${miseEnEvidence(texNombre(somme, 1))}$`

      handleAnswers(this, i, { reponse: { value: somme } })
      if (this.interactif) {
        texte += `$=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
      }

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
