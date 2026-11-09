import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la mesure d'un angle à partir de son sinus"
export const interactifReady = true

export const uuid = 'ge9fy'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ29 extends ExerciceCan {
  enonce(choix?: { sin: string; angle: string }): void {
    if (choix == null) {
      const listeValeurs = [
        { sin: '\\dfrac{1}{2}', angle: '\\dfrac{\\pi}{6}' },
        { sin: '-\\dfrac{1}{2}', angle: '-\\dfrac{\\pi}{6}' },
        { sin: '\\dfrac{\\sqrt{2}}{2}', angle: '\\dfrac{\\pi}{4}' },
        { sin: '-\\dfrac{\\sqrt{2}}{2}', angle: '-\\dfrac{\\pi}{4}' },
        { sin: '\\dfrac{\\sqrt{3}}{2}', angle: '\\dfrac{\\pi}{3}' },
        { sin: '-\\dfrac{\\sqrt{3}}{2}', angle: '-\\dfrac{\\pi}{3}' },
      ]
      choix = choice(listeValeurs)
    }

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.reponse = choix.angle

    this.question = `Résoudre sur $\\left[-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right]$ l'équation : $\\sin(x) = ${choix.sin}$.`

    this.correction = `On cherche le réel $x$ appartenant à l'intervalle $\\left[-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right]$ dont le sinus vaut $${choix.sin}$.<br>`
    this.correction += `D'après les valeurs remarquables du cercle trigonométrique, on sait que $\\sin\\left(${choix.angle}\\right) = ${choix.sin}$.<br>`
    this.correction += `Puisque $${choix.angle} \\in \\left[-\\dfrac{\\pi}{2}\\;;\\;\\dfrac{\\pi}{2}\\right]$, on en déduit l'unique solution :<br>`
    this.correction += `$x = ${miseEnEvidence(choix.angle)}$`

    if (this.interactif) {
      this.question += '<br>$x=$'
    } else {
      this.question += '<br>$x=\\ldots$'
    }

    this.canEnonce = `Résoudre sur $\\left[-\\dfrac{\\pi}{2}\\;;\\;\\dfrac{\\pi}{2}\\right]$ l'équation : $\\sin(x) = ${choix.sin}$.`
    this.canReponseACompleter = '$x=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce({
          sin: '-\\dfrac{\\sqrt{3}}{2}',
          angle: '-\\dfrac{\\pi}{3}',
        })
    else this.enonce()
  }
}
