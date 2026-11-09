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
  "Calculer la moitié d'un nombre décimal dans des cas simples"
export const dateDePublication = '01/10/2026'
export const interactifReady = true

/**
 * Moitié d'un décimal : partie entière et dixièmes pairs, partie entière impaire, entier impair, nombre inférieur à 1
 * @author Rémi Angot
 */
export const uuid = 'af28f'

export const refs = {
  'fr-fr': ['CM2N4N-1'],
  'fr-ch': ['9R1NO6C-5', '9R2NO6C-5', '9R3NO6C-5'],
}
export default class MoitieDecimal extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let nombre: Decimal
      let explication: string
      switch (typesDeQuestions[i]) {
        case 1: {
          // partie entière paire et dixièmes pairs
          const entier = randint(1, 24) * 2
          const dixiemes = randint(1, 4) * 2
          nombre = new Decimal(entier).add(new Decimal(dixiemes).div(10))
          explication = `La moitié de $${entier}$ est $${entier / 2}$ et la moitié de $${texNombre(new Decimal(dixiemes).div(10), 1)}$ est $${texNombre(new Decimal(dixiemes / 2).div(10), 1)}$.`
          break
        }
        case 2: {
          // partie entière impaire et dixièmes pairs
          const entier = randint(1, 24) * 2 + 1
          const dixiemes = randint(1, 4) * 2
          nombre = new Decimal(entier).add(new Decimal(dixiemes).div(10))
          const reste = new Decimal(1).add(new Decimal(dixiemes).div(10))
          explication = `On écrit $${texNombre(nombre, 1)}=${entier - 1}+${texNombre(reste, 1)}$. La moitié de $${entier - 1}$ est $${(entier - 1) / 2}$ et la moitié de $${texNombre(reste, 1)}$ est $${texNombre(reste.div(2), 2)}$.`
          break
        }
        case 3: {
          // entier impair
          const entier = randint(1, 24) * 2 + 1
          nombre = new Decimal(entier)
          explication = `On écrit $${entier}=${entier - 1}+1$. La moitié de $${entier - 1}$ est $${(entier - 1) / 2}$ et la moitié de $1$ est $${texNombre(0.5, 1)}$.`
          break
        }
        default: {
          // nombre inférieur à 1
          const dixiemes = randint(1, 4) * 2
          nombre = new Decimal(dixiemes).div(10)
          explication = `La moitié de $${dixiemes}$ dixièmes est $${dixiemes / 2}$ dixièmes.`
          break
        }
      }
      const precision = nombre.decimalPlaces()
      const moitie = nombre.div(2)

      let texte = `La moitié de $${texNombre(nombre, precision)}$`
      const texteCorr = `${texteEnCouleur(explication, bleuMathalea)}<br>La moitié de $${texNombre(nombre, precision)}$ est $${miseEnEvidence(texNombre(moitie, 2))}$.`

      handleAnswers(this, i, { reponse: { value: moitie } })
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
