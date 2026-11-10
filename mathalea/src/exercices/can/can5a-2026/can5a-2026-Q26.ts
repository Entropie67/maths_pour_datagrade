import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { latex2d } from '../../../lib/2d/textes'
import { point3d } from '../../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Déterminer le volume d'un pavé droit"
export const interactifReady = true

export const uuid = 'ltsv8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q26 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$.' }
  }

  enonce(longueur?: number, largeur?: number, hauteur?: number) {
    if (longueur == null || largeur == null || hauteur == null) {
      // Génération aléatoire pour avoir des volumes faciles à calculer
      longueur = randint(5, 9)
      largeur = randint(3, 6, longueur)
      hauteur = randint(2, 5, [longueur, largeur])
    }

    const A = point3d(0, 0, 0)
    const B = point3d(6, 0, 0)
    const C = point3d(0, 3, 0)
    const D = point3d(0, 0, -3)
    const pav = pave3d(A, B, C, D)

    const la = latex2d(`${texNombre(hauteur, 0)}\\text{ cm}`, -1, -1.5, {})
    const lb = latex2d(`${texNombre(largeur, 0)}\\text{ cm}`, 7.5, -3, {})
    const lc = latex2d(`${texNombre(longueur, 0)}\\text{ cm}`, 3, -3.4, {})

    const volume = longueur * largeur * hauteur
    this.reponse = volume

    this.question = `${mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.6 },
        fixeBordures([pav.c2d, la], { rxmin: -1.5, rxmax: 1.5, rymin: -1 }),
      ),
      [pav.c2d, la, lb, lc],
    )}
Le volume de ce pavé droit est `

    this.correction = `Le volume d'un pavé droit est : longueur $\\times$ largeur $\\times$ hauteur.<br>
On a : $${longueur}\\times ${largeur}\\times ${hauteur}=${miseEnEvidence(texNombre(volume, 0))}\\text{ cm}^3$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'

    this.formatChampTexte = KeyboardType.clavierDeBase
    if (!this.interactif && context.isHtml) {
      this.question += '$\\ldots\\text{ cm}^3$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7, 3, 4)
    else this.enonce()
  }
}
