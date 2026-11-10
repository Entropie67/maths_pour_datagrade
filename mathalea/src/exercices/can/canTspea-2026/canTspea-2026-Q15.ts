import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

import { choice } from '../../../lib/outils/arrayOutils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Exprimer une variable en fonction d'une autre à partir d'une formule"
export const interactifReady = true

export const uuid = '1z5ph'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ15 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { calculFormel: true }
    this.formatChampTexte = `${KeyboardType.clavierEmvx} ${KeyboardType.clavierDeBaseAvecVariable}`
  }

  enonce(cas?: number): void {
    if (cas == null) {
      cas = choice([1, 2, 3])
    }

    switch (cas) {
      case 1: // Ec = 1/2 m v² → m = 2Ec/v²
        this.question = `En physique, l'énergie cinétique $E$ d'un solide s'exprime en fonction de la masse $m$, de la vitesse $v$ par $E=\\dfrac{1}{2}m\\times v^2$. Alors :<br>`
        this.reponse = ['\\dfrac{2E}{v^2}', '\\dfrac{2\\times E}{v^2}']
        this.correction = `$E=\\dfrac{1}{2}mv^2$ équivaut à $2E=mv^2$, soit $m=${miseEnEvidence('\\dfrac{2E}{v^2}')}$.`
        if (this.interactif) {
          this.question += '$m=$'
        } else {
          this.question += '$m=\\ldots$'
        }
        this.canEnonce = `En physique, l'énergie cinétique $E$ d'un solide s'exprime en fonction de la masse $m$, de la vitesse $v$ par $E=\\dfrac{1}{2}m\\times v^2$. Alors :`
        this.canReponseACompleter = '$m=\\ldots$'
        break
      case 2: // A = 1/2 × b × h → h = 2A/b
        this.question = `L'aire $\\mathscr{A}$ d'un triangle est donnée par $\\mathscr{A}=\\dfrac{1}{2}\\times b\\times h$, où $b$ est la base et $h$ la hauteur. Alors :<br>`
        this.reponse = [
          '\\dfrac{2\\mathscr{A}}{b}',
          '\\dfrac{2\\times\\mathscr{A}}{b}',
          '\\dfrac{2A}{b}',
        ]
        this.correction = `$\\mathscr{A}=\\dfrac{1}{2}bh$ équivaut à $2\\mathscr{A}=bh$, soit $h=${miseEnEvidence('\\dfrac{2\\mathscr{A}}{b}')}$.`
        if (this.interactif) {
          this.question += '$h=$'
        } else {
          this.question += '$h=\\ldots$'
        }
        this.canEnonce = `L'aire $\\mathscr{A}$ d'un triangle est donnée par $\\mathscr{A}=\\dfrac{1}{2}\\times b\\times h$. Alors :`
        this.canReponseACompleter = '$h=\\ldots$'
        break
      case 3: // Ep = 1/2 k x² → k = 2Ep/x²
      default:
        this.question = `En physique, l'énergie potentielle élastique $E_p$ d'un ressort est donnée par $E=\\dfrac{1}{2}k\\times x^2$, où $k$ est la constante de raideur et $x$ l'allongement. Alors :<br>`
        this.reponse = ['\\dfrac{2E}{x^2}', '\\dfrac{2\\times E_p}{x^2}']
        this.correction = `$E=\\dfrac{1}{2}kx^2$ équivaut à $2E=kx^2$, soit $k=${miseEnEvidence('\\dfrac{2E}{x^2}')}$.`
        if (this.interactif) {
          this.question += '$k=$'
        } else {
          this.question += '$k=\\ldots$'
        }
        this.canEnonce = `En physique, l'énergie potentielle élastique $E_p$ d'un ressort est donnée par $E_p=\\dfrac{1}{2}k\\times x^2$. Alors :`
        this.canReponseACompleter = '$k=\\ldots$'
        break
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1)
    else this.enonce()
  }
}
