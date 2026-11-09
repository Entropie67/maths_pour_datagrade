import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Trouver un angle à partir de son cosinus et de son sinus'
export const interactifReady = true

export const uuid = '81uz0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  enonce(cas?: number): void {
    if (cas == null) {
      cas = choice([1, 2, 3, 4, 5, 6])
    }

    const intervalle = '[0\\,;\\,2\\pi['

    switch (cas) {
      case 1: // pi/6
        this.question = `$\\alpha$ est un réel de $${intervalle}$ vérifiant $\\cos(\\alpha)=\\dfrac{\\sqrt{3}}{2}$ et $\\sin(\\alpha)=\\dfrac{1}{2}$.<br>
        Valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\left(\\dfrac{\\pi}{6}\\right)=\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\left(\\dfrac{\\pi}{6}\\right)=\\dfrac{1}{2}$.<br><br>
          $\\dfrac{\\pi}{6}\\in ${intervalle}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{6}')}$.`
        this.reponse = '\\dfrac{\\pi}{6}'
        break
      case 2: // pi/3
        this.question = `$\\alpha$ est un réel de $${intervalle}$ vérifiant $\\cos(\\alpha)=\\dfrac{1}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{3}}{2}$.<br>
        Valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\left(\\dfrac{\\pi}{3}\\right)=\\dfrac{1}{2}$ et $\\sin \\left(\\dfrac{\\pi}{3}\\right)=\\dfrac{\\sqrt{3}}{2}$.<br><br>
          $\\dfrac{\\pi}{3}\\in ${intervalle}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{3}')}$.`
        this.reponse = '\\dfrac{\\pi}{3}'
        break
      case 3: // 2pi/3
        this.question = `$\\alpha$ est un réel de $${intervalle}$ vérifiant $\\cos(\\alpha)=-\\dfrac{1}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{3}}{2}$.<br>
        Valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\left(\\dfrac{2\\pi}{3}\\right)=-\\dfrac{1}{2}$ et $\\sin \\left(\\dfrac{2\\pi}{3}\\right)=\\dfrac{\\sqrt{3}}{2}$.<br><br>
          $\\dfrac{2\\pi}{3}\\in ${intervalle}$, donc $\\alpha=${miseEnEvidence('\\dfrac{2\\pi}{3}')}$.`
        this.reponse = '\\dfrac{2\\pi}{3}'
        break
      case 4: // 5pi/6
        this.question = `$\\alpha$ est un réel de $${intervalle}$ vérifiant $\\cos(\\alpha)=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin(\\alpha)=\\dfrac{1}{2}$.<br>
        Valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\left(\\dfrac{5\\pi}{6}\\right)=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\left(\\dfrac{5\\pi}{6}\\right)=\\dfrac{1}{2}$.<br><br>
          $\\dfrac{5\\pi}{6}\\in ${intervalle}$, donc $\\alpha=${miseEnEvidence('\\dfrac{5\\pi}{6}')}$.`
        this.reponse = '\\dfrac{5\\pi}{6}'
        break

      case 5: // pi/4
        this.question = `$\\alpha$ est un réel de $${intervalle}$ vérifiant $\\cos(\\alpha)=\\dfrac{\\sqrt{2}}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{2}}{2}$.<br>
        Valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\left(\\dfrac{\\pi}{4}\\right)=\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\left(\\dfrac{\\pi}{4}\\right)=\\dfrac{\\sqrt{2}}{2}$.<br><br>
          $\\dfrac{\\pi}{4}\\in ${intervalle}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{4}')}$.`
        this.reponse = '\\dfrac{\\pi}{4}'
        break
      case 6: // 3pi/4
        this.question = `$\\alpha$ est un réel de $${intervalle}$ vérifiant $\\cos(\\alpha)=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{2}}{2}$.<br>
        Valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\left(\\dfrac{3\\pi}{4}\\right)=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\left(\\dfrac{3\\pi}{4}\\right)=\\dfrac{\\sqrt{2}}{2}$.<br><br>
          $\\dfrac{3\\pi}{4}\\in ${intervalle}$, donc $\\alpha=${miseEnEvidence('\\dfrac{3\\pi}{4}')}$.`
        this.reponse = '\\dfrac{3\\pi}{4}'
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\alpha=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1)
    else this.enonce()
  }
}
