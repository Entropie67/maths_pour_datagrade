import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une valeur remarquable'
export const interactifReady = true

export const uuid = '7x3rt'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class ValeurRemarquable2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.optionsDeComparaison = { sansTrigo: true }
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const annee = 2026
    const signe = this.canOfficielle ? 1 : choice([1, -1])
    const choix = this.canOfficielle ? 1 : choice([4])

    if (choix === 1) {
      // cos(±annee·π)
      const signeTexte = signe === 1 ? '' : '-'
      if (annee % 2 === 0) {
        // Année paire : cos(±2n·π) = 1
        const quotient = annee / 2
        this.question = `$\\cos(${signeTexte}${texNombre(annee, 0)}\\pi)$ `
        this.correction = `$\\cos(${signeTexte}${texNombre(annee, 0)}\\pi)=\\cos(${texNombre(annee, 0)}\\pi)=\\cos(2\\times${texNombre(quotient, 0)}\\pi)=${miseEnEvidence('1')}$`
        this.reponse = 1
      } else {
        // Année impaire : cos(±(2n+1)·π) = -1
        const anneeMoins1 = annee - 1
        const quotient = anneeMoins1 / 2
        this.question = `$\\cos(${signeTexte}${texNombre(annee, 0)}\\pi)$ `
        this.correction = `$\\cos(${signeTexte}${texNombre(annee, 0)}\\pi)=\\cos(${texNombre(annee, 0)}\\pi)=\\cos(${texNombre(anneeMoins1, 0)}\\pi+\\pi)=\\cos(2\\times${texNombre(quotient, 0)}\\pi+\\pi)=\\cos(\\pi)=${miseEnEvidence('-1')}$`
        this.reponse = -1
      }
      this.canReponseACompleter = `$\\cos(${signeTexte}${texNombre(annee, 0)}\\pi)=\\ldots$`
    } else if (choix === 2) {
      // sin(±annee·π)
      const signeTexte = signe === 1 ? '' : '-'
      const quotient = Math.floor(annee / 2)
      this.question = `$\\sin(${signeTexte}${texNombre(annee, 0)}\\pi)$ `
      if (annee % 2 === 0) {
        this.correction = `$\\sin(${signeTexte}${texNombre(annee, 0)}\\pi)=\\sin(${texNombre(annee, 0)}\\pi)=\\sin(2\\times${texNombre(quotient, 0)}\\pi)=${miseEnEvidence('0')}$`
      } else {
        this.correction = `$\\sin(${signeTexte}${texNombre(annee, 0)}\\pi)=\\sin(${texNombre(annee, 0)}\\pi)=\\sin(${texNombre(annee - 1, 0)}\\pi+\\pi)=\\sin(2\\times${texNombre(quotient, 0)}\\pi+\\pi)=\\sin(\\pi)=${miseEnEvidence('0')}$`
      }
      this.reponse = 0
      this.canReponseACompleter = `$\\sin(${signeTexte}${texNombre(annee, 0)}\\pi)=\\ldots$`
    } else if (choix === 3) {
      // sin(annee·π) + cos(annee·π)
      let valCos
      let corrCos
      const quotient = Math.floor(annee / 2)

      if (annee % 2 === 0) {
        valCos = 1
        corrCos = `\\cos(${texNombre(annee, 0)}\\pi)=\\cos(2\\times${texNombre(quotient, 0)}\\pi)=1`
      } else {
        valCos = -1
        const anneeMoins1 = annee - 1
        const quotient2 = anneeMoins1 / 2
        corrCos = `\\cos(${texNombre(annee, 0)}\\pi)=\\cos(${texNombre(anneeMoins1, 0)}\\pi+\\pi)=\\cos(2\\times${texNombre(quotient2, 0)}\\pi+\\pi)=\\cos(\\pi)=-1`
      }

      const corrSin =
        annee % 2 === 0
          ? `\\sin(${texNombre(annee, 0)}\\pi)=\\sin(2\\times${texNombre(quotient, 0)}\\pi)=0`
          : `\\sin(${texNombre(annee, 0)}\\pi)=\\sin(${texNombre(annee - 1, 0)}\\pi+\\pi)=\\sin(2\\times${texNombre(quotient, 0)}\\pi+\\pi)=\\sin(\\pi)=0`

      this.question = `$\\sin(${texNombre(annee, 0)}\\pi)+\\cos(${texNombre(annee, 0)}\\pi)$ `
      this.correction = `$\\sin(${texNombre(annee, 0)}\\pi)+\\cos(${texNombre(annee, 0)}\\pi)$<br>$${corrSin}$<br>$${corrCos}$<br>Donc : $\\sin(${texNombre(annee, 0)}\\pi)+\\cos(${texNombre(annee, 0)}\\pi)=0+${valCos}=${miseEnEvidence(valCos.toString())}$`
      this.reponse = valCos
      this.canReponseACompleter = `$\\sin(${texNombre(annee, 0)}\\pi)+\\cos(${texNombre(annee, 0)}\\pi)=\\ldots$`
    } else {
      // a·sin(annee·π) + b·cos(annee·π)
      const a = this.quotaChoice('a', [2, 3, 4, 5])
      const b = this.quotaChoice('b', [2, 3, 4, 5])
      const valSin = 0 // sin(n·π) = 0 pour tout n entier
      let valCos
      let corrCos
      const quotient = Math.floor(annee / 2)

      if (annee % 2 === 0) {
        valCos = 1
        corrCos = `\\cos(${texNombre(annee, 0)}\\pi)=\\cos(2\\times${texNombre(quotient, 0)}\\pi)=1`
      } else {
        valCos = -1
        const anneeMoins1 = annee - 1
        const quotient2 = anneeMoins1 / 2
        corrCos = `\\cos(${texNombre(annee, 0)}\\pi)=\\cos(${texNombre(anneeMoins1, 0)}\\pi+\\pi)=\\cos(2\\times${texNombre(quotient2, 0)}\\pi+\\pi)=\\cos(\\pi)=-1`
      }

      const corrSin =
        annee % 2 === 0
          ? `\\sin(${texNombre(annee, 0)}\\pi)=\\sin(2\\times${texNombre(quotient, 0)}\\pi)=0`
          : `\\sin(${texNombre(annee, 0)}\\pi)=\\sin(${texNombre(annee - 1, 0)}\\pi+\\pi)=\\sin(2\\times${texNombre(quotient, 0)}\\pi+\\pi)=\\sin(\\pi)=0`

      const resultat = a * valSin + b * valCos
      this.question = `$${a}\\sin(${texNombre(annee, 0)}\\pi)+${b}\\cos(${texNombre(annee, 0)}\\pi)$ `
      this.correction = `$${a}\\sin(${texNombre(annee, 0)}\\pi)+${b}\\cos(${texNombre(annee, 0)}\\pi)$<br>$${corrSin}$<br>$${corrCos}$<br>Donc : $${a}\\sin(${texNombre(annee, 0)}\\pi)+${b}\\cos(${texNombre(annee, 0)}\\pi)=${a}\\times 0+${b}\\times ${valCos}=${miseEnEvidence(resultat.toString())}$`
      this.reponse = resultat
      this.canReponseACompleter = `$${a}\\sin(${texNombre(annee, 0)}\\pi)+${b}\\cos(${texNombre(annee, 0)}\\pi)=\\ldots$`
    }
    if (!this.interactif) {
      this.question += '$=\\ldots$'
    }

    this.canEnonce = 'Compléter.'
  }
}
