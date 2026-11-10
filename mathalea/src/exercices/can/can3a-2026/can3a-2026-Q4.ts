import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Effectuer une conversion d'unités"
export const interactifReady = true

export const uuid = 'ssrbd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can3026Q4 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
  }

  enonce(valeur?: number, uniteDepart?: string, uniteArrivee?: string) {
    if (valeur == null || uniteDepart == null || uniteArrivee == null) {
      // Version aléatoire
      const cas = this.quotaChoice('cas', ['dm_m', 'm_dm', 'm_mm'])
      if (cas === 'dm_m') {
        // dm vers m
        valeur = randint(3, 15)
        uniteDepart = 'dm'
        uniteArrivee = 'm'
      } else if (cas === 'm_dm') {
        // m vers dm
        valeur = randint(15, 60)
        uniteDepart = 'm'
        uniteArrivee = 'dm'
      } else {
        // m vers mm
        valeur = randint(2, 9) / 10
        uniteDepart = 'm'
        uniteArrivee = 'mm'
      }
    }

    if (uniteDepart === 'dm' && uniteArrivee === 'm') {
      // dm vers m
      this.formatChampTexte = KeyboardType.clavierDeBase
      this.reponse = new FractionEtendue(valeur, 10).texFraction
      this.question = `Complète : <br>$${valeur}\\text{ dm}=$`
      this.correction = `Comme $1\\text{ m}$ $=10\\text{ dm}$, alors $1\\text{ dm}=0,1\\text{ m}$.<br>
Ainsi, pour passer des $\\text{dm}$ aux $\\text{m}$, on divise par $10$.<br>
Comme $${valeur}\\div 10 =${texNombre(valeur / 10, 1)}$, alors $${valeur}\\text{ dm}=${miseEnEvidence(texNombre(valeur / 10, 1))}\\text{ m}$.`
      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$${valeur}\\text{ dm}=\\ldots\\text{ m}$`
      if (this.interactif) {
        this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
      } else {
        this.question += `${context.isHtml ? '$\\ldots\\text{ m}$' : ''}`
      }
    } else if (uniteDepart === 'm' && uniteArrivee === 'dm') {
      // m vers dm
      this.formatChampTexte = KeyboardType.clavierNumbers
      this.reponse = valeur * 10
      this.question = `Complète : <br>$${texNombre(valeur, 0)}\\text{ m}$ $=$`
      this.correction = `Comme $1\\text{ m}$ $=10\\text{ dm}$, pour passer des $\\text{m}$ aux $\\text{dm}$, on multiplie par $10$.<br>
Comme $${texNombre(valeur, 1)}\\times 10 =${texNombre(valeur * 10, 0)}$, alors $${texNombre(valeur, 2)}\\text{ m}=${miseEnEvidence(texNombre(valeur * 10, 0))}\\text{ dm}$.`
      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$${texNombre(valeur, 0)}\\text{ m}$ $= \\ldots\\text{ dm}$`
      if (this.interactif) {
        this.optionsChampTexte = { texteApres: ' $\\text{dm}$' }
      } else {
        this.question += `${context.isHtml ? ' $\\ldots\\text{dm}$' : ''}`
      }
    } else if (uniteDepart === 'm' && uniteArrivee === 'mm') {
      // m vers mm
      this.formatChampTexte = KeyboardType.clavierNumbers
      this.reponse = valeur * 1000
      this.question = `Complète : <br>$${texNombre(valeur, 1)}\\text{ m}$ $=$`
      this.correction = `Comme $1\\text{ m}$ $=${texNombre(1000)}\\text{ mm}$, pour passer des $\\text{m}$ aux $\\text{mm}$, on multiplie par $${texNombre(1000)}$.<br>
Comme $${texNombre(valeur, 1)}\\times ${texNombre(1000)} =${texNombre(valeur * 1000, 0)}$, alors $${texNombre(valeur, 1)}\\text{ m}=${miseEnEvidence(texNombre(valeur * 1000, 0))}\\text{ mm}$.`
      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$${texNombre(valeur, 1)}\\text{ m}$ $= \\ldots\\text{ mm}$`
      if (this.interactif) {
        this.optionsChampTexte = { texteApres: ' $\\text{mm}$' }
      } else {
        this.question += `${context.isHtml ? ' $\\ldots\\text{mm}$' : ''}`
      }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.6, 'm', 'mm')
    else this.enonce()
  }
}
