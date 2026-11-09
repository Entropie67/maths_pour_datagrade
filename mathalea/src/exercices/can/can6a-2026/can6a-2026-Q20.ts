import { afficheCoteSegment } from '../../../lib/2d/AfficheCoteSegment'
import { cercle } from '../../../lib/2d/cercle'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { pointIntersectionCC } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer une longueur à partir d'un périmètre"
export const interactifReady = true

export const uuid = 'j71zy'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q20 extends ExerciceCan {
  constructor() {
    super()
    this.optionsChampTexte = {
      texteAvant: '$? =$ ',
      texteApres: '$\\text{ cm}$',
    }
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(base?: number, cote?: number) {
    if (base == null || cote == null) {
      base = randint(6, 12)
      cote = randint(Math.floor(base / 2) + 1, base - 1)
    }

    const perimetre = base + 2 * cote
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(4, 1.5)
    const C1 = cercle(A, 3)
    const C2 = cercle(B, 3)
    const C = pointIntersectionCC(C1, C2, '', 1)
    const AB = segment(B, A)
    const triangle = polygone(A, B, C)
    triangle.epaisseur = 2
    const marques = codageSegments('||', 'black', A, C, C, B)
    const legendeBase = afficheCoteSegment(
      AB,
      `${base} \\text{ cm}`,
      0.25,
      'black',
      1,
      0.25,
      'black',
    )
    const legendeCote = afficheCoteSegment(
      segment(C, B),
      this.interactif ? `\\text{? cm}` : `\\ldots \\text{ cm}`,
      0.25,
      'black',
      1,
      0.25,
      'black',
    )
    const objets = [triangle, legendeBase, legendeCote, marques]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.9 },
        fixeBordures(objets, { rxmin: 0, rxmax: 0, rymin: 0, rymax: 0 }),
      ),
      objets,
    )

    this.reponse = String(cote)
    if (this.interactif) {
      this.question =
        `Le périmètre de ce triangle est $${perimetre}\\text{ cm}$.<br>
      Quelle est la longueur manquante ?` + figure
    } else {
      this.question =
        `Le périmètre de ce triangle est $${perimetre}\\text{ cm}$.<br>
      Complète.` + figure
      this.canReponseACompleter = figure
    }

    this.correction = `Le périmètre d'un triangle est égal à la somme de la longueur de ses côtés.<br>
      Ici, le périmètre est égal à $${base} + 2\\times \\text{?} = ${perimetre}\\text{ cm}$.<br>
      Donc, $2\\times \\text{?} = ${perimetre} - ${base} = ${perimetre - base}\\text{ cm}$.<br>
      Donc, la longueur manquante est $${miseEnEvidence(cote)}\\text{ cm}$.`

    this.canEnonce = `Le périmètre de ce triangle est $${perimetre}\\text{ cm}$.<br>
      ${texteEnCouleurEtGras('Complète', 'black')}.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(7, 5)
    else this.enonce()
  }
}
