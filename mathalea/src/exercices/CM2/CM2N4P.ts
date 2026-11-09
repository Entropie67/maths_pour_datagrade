import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Multiplier un nombre décimal par $5$'
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Multiplier un décimal (au dixième ou au centième) par 5 : multiplier par 10 puis diviser par 2
 * @author Rémi Angot
 */
export const uuid = 'd528e'

export const refs = {
  'fr-fr': ['CM2N4P'],
  'fr-ch': ['9R1NO6C-8', '9R2NO6C-8', '9R3NO6C-8'],
}
export default class MultiplierPar5 extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Nombre non entier : un chiffre après la virgule, ou deux chiffres dont le dernier est pair
      const unChiffre = choice([true, false])
      const n = unChiffre ? randint(11, 99) : randint(51, 499) * 2
      if (n % 10 === 0) {
        cpt++
        continue
      }
      const nombre = new Decimal(n).div(unChiffre ? 10 : 100)
      const precision = nombre.decimalPlaces()
      const resultat = nombre.mul(5)
      const apresDecalage = nombre.mul(10)

      let texte = `$${texNombre(nombre, precision)}\\times5$`
      const explication = texteEnCouleur(
        'Multiplier par $5$ revient à multiplier par $10$ puis diviser par $2$.',
        bleuMathalea,
      )
      const texteCorr = `${explication}<br>$${texNombre(nombre, precision)}\\times5=(${texNombre(nombre, precision)}\\times10)\\div2=${texNombre(apresDecalage, 2)}\\div2=${miseEnEvidence(texNombre(resultat, 2))}$`

      handleAnswers(this, i, { reponse: { value: resultat } })
      if (this.interactif) {
        texte += `$=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
      }

      if (this.questionJamaisPosee(i, nombre)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
