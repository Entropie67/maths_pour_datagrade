import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Calculer le double d'un nombre décimal dans des cas simples"
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Double d'un décimal : dixièmes sans retenue, dixièmes avec retenue, a,5 et a,25 ou a,75
 * @author Rémi Angot
 */
export const uuid = '28379'

export const refs = {
  'fr-fr': ['CM2N4M'],
  'fr-ch': ['9R1NO6C-4', '9R2NO6C-4', '9R3NO6C-4'],
}
export default class DoubleDecimal extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const entier = randint(1, 49)
      let decimale: Decimal
      switch (typesDeQuestions[i]) {
        case 1: // dixièmes de 1 à 4 : pas de retenue
          decimale = new Decimal(randint(1, 4)).div(10)
          break
        case 2: // dixièmes de 5 à 9 : retenue
          decimale = new Decimal(randint(5, 9)).div(10)
          break
        case 3: // 0,25 ou 0,75
          decimale = new Decimal(randint(0, 1) * 50 + 25).div(100)
          break
        default: // petit nombre inférieur à 1
          decimale = new Decimal(randint(1, 9)).div(10)
          break
      }
      const nombre =
        typesDeQuestions[i] === 4 ? decimale : new Decimal(entier).add(decimale)
      const precision = decimale.decimalPlaces()
      const double = nombre.mul(2)
      const doubleEntier = nombre.floor().mul(2)
      const doubleDecimale = nombre.sub(nombre.floor()).mul(2)

      let texte = `Le double de $${texNombre(nombre, precision)}$`
      let explication: string
      if (nombre.lt(1)) {
        explication = texteEnCouleur(
          `Le double de $${texNombre(nombre.mul(10), 0)}$ dixièmes est $${texNombre(double.mul(10), 0)}$ dixièmes.`,
          bleuMathalea,
        )
      } else {
        explication = texteEnCouleur(
          `On double la partie entière : $2\\times${texNombre(nombre.floor(), 0)}=${texNombre(doubleEntier, 0)}$, puis la partie décimale : $2\\times${texNombre(nombre.sub(nombre.floor()), precision)}=${texNombre(doubleDecimale, precision)}$.`,
          bleuMathalea,
        )
      }
      const texteCorr = `${explication}<br>Le double de $${texNombre(nombre, precision)}$ est $${miseEnEvidence(texNombre(double, precision))}$.`

      handleAnswers(this, i, { reponse: { value: double } })
      if (this.interactif) {
        texte += ` : ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)}`
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
