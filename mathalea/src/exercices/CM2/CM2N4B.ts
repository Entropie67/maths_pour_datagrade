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
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Connaître la moitié des nombres impairs jusqu'à 15"
export const dateDePublication = '03/11/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Moitié d'un nombre impair de 1 à 15 : on décompose n en (n - 1) + 1
 * @author Rémi Angot
 */
export const uuid = '92a34'

export const refs = {
  'fr-fr': ['CM2N4B'],
  'fr-ch': [],
}

const impairs = [1, 3, 5, 7, 9, 11, 13, 15]

export default class MoitieImpairs extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter.'
    this.nbQuestions = 8
    this.nbCols = 2
    this.nbColsCorr = 1
  }

  nouvelleVersion() {
    // Les 8 nombres impairs sont tous posés avant qu'un nombre ne revienne
    const nombres = combinaisonListes(impairs, this.nbQuestions)
    for (let i = 0; i < this.nbQuestions; i++) {
      const n = nombres[i]
      const pair = n - 1
      const moitie = n / 2
      const explication =
        n === 1
          ? texteEnCouleur(
              `Une unité, c'est $10$ dixièmes. La moitié de $10$ dixièmes est $5$ dixièmes.`,
              bleuMathalea,
            )
          : texteEnCouleur(
              `$${n}=${pair}+1$. La moitié de $${pair}$ est $${pair / 2}$ et la moitié de $1$ est $0{,}5$.`,
              bleuMathalea,
            )
      handleAnswers(this, i, { reponse: { value: moitie } })
      this.listeQuestions[i] =
        `La moitié de $${n}$ est ` +
        (this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers) + '.'
          : '$\\dots$.')
      this.listeCorrections[i] =
        `${explication}<br>La moitié de $${n}$ est $${miseEnEvidence(texNombre(moitie, 1))}$.`
    }
    listeQuestionsToContenu(this)
  }
}
