import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Lire un nombre sur une droite graduée'
export const interactifReady = true

export const uuid = 'u9t07'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ28 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(min?: number, max?: number, nbPas?: number, position?: number) {
    if (min == null || max == null || nbPas == null || position == null) {
      min = 0
      max = 1
      nbPas = randint(4, 8) // Nombre de graduations entre 0 et 1
      position = randint(1, nbPas - 1) // Position du point A
    }

    const abscisse = new FractionEtendue(position, nbPas)

    const d = droiteGraduee({
      Min: -1,
      Max: 2 * nbPas + 1,
      Unite: 1,
      labelsPrincipaux: false,
      thickDistance: 2,
      thickOffset: 0.5,
      pointListe: [[2 * position, 'A']],
      labelListe: [
        [0, String(min)],
        [2 * nbPas, String(max)],
      ],
      axePosition: 'H',
    })

    this.question = `${mathalea2d(Object.assign({ scale: 0.45, pixelsParCm: 15 }, fixeBordures(d.objets!)), d.objets!)}
    Le nombre repéré par le point $A$ est `

    this.correction = `Entre $${min}$ et $${max}$, il y a $${nbPas}$ intervalles.<br>
    Le point $A$ se trouve à la graduation numéro $${position}$.<br>
    L'abscisse du point $A$ est donc : 
    ${abscisse.texFractionSimplifiee !== abscisse.texFraction ? `$${abscisse.texFraction}=${miseEnEvidence(abscisse.texFractionSimplifiee)}$.` : `$${miseEnEvidence(abscisse.texFractionSimplifiee)}$.`}`

    this.canEnonce = `${mathalea2d(Object.assign({ scale: 0.5 }, fixeBordures(d.objets!)), d.objets!)}`
    this.canReponseACompleter =
      'Le nombre repéré par le point $A$ est : $\\ldots$'

    this.reponse = abscisse

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0, 1, 5, 2)
    else this.enonce()
  }
}
