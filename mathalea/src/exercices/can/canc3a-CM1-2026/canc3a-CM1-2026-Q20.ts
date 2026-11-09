import { afficheCoteSegment } from '../../../lib/2d/AfficheCoteSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
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

export const uuid = 'fe2dd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM1Q20 extends ExerciceCan {
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

  enonce(base?: number, coteGauche?: number, coteDroit?: number) {
    if (base == null || coteGauche == null || coteDroit == null) {
      do {
        base = randint(5, 10)
        coteGauche = randint(3, 7)
        coteDroit = randint(3, 7)
      } while (
        coteDroit === coteGauche ||
        coteDroit === base ||
        coteGauche === base ||
        coteGauche + coteDroit <= base + 1
      )
    }

    const perimetre = base + coteGauche + coteDroit

    // On dessine un triangle proportionnel aux longueurs réelles
    // La base est horizontale, mise à l'échelle pour tenir dans ~5 cm de dessin
    const echelle = 5 / base
    const baseDessin = base * echelle
    // Le sommet C est placé de sorte que AC ≈ coteGauche et BC ≈ coteDroit
    // On utilise la formule du cosinus pour trouver les coordonnées de C
    // cos(A) = (coteGauche² + base² - coteDroit²) / (2 * coteGauche * base)
    const cosA =
      (coteGauche * coteGauche + base * base - coteDroit * coteDroit) /
      (2 * coteGauche * base)
    const sinA = Math.sqrt(1 - cosA * cosA)
    const cx = coteGauche * cosA * echelle
    const cy = coteGauche * sinA * echelle

    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(baseDessin, 0)
    const C = pointAbstrait(cx, cy)

    const triangle = polygone(A, B, C)
    triangle.epaisseur = 2

    const legendeBase = afficheCoteSegment(
      segment(B, A),
      `${base} \\text{ cm}`,
      0.3,
      'black',
      1,
      0.25,
      'black',
    )
    const legendeGauche = afficheCoteSegment(
      segment(A, C),
      `${coteGauche} \\text{ cm}`,
      0.3,
      'black',
      1,
      0.25,
      'black',
    )
    const legendeDroit = afficheCoteSegment(
      segment(C, B),
      this.interactif ? '\\text{? cm}' : '\\ldots \\text{ cm}',
      0.3,
      'black',
      1,
      0.25,
      'black',
    )

    const objets = [triangle, legendeBase, legendeGauche, legendeDroit]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.7 },
        fixeBordures(objets, {
          rxmin: 0.5,
          rxmax: 0.5,
          rymin: 0.5,
          rymax: 0.5,
        }),
      ),
      objets,
    )

    this.reponse = String(coteDroit)
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
      Les deux côtés connus mesurent $${base}\\text{ cm}$ et $${coteGauche}\\text{ cm}$, soit $${base} + ${coteGauche} = ${base + coteGauche}\\text{ cm}$.<br>
      Donc, le côté manquant mesure $${perimetre} - ${base + coteGauche} = ${miseEnEvidence(String(coteDroit))}\\text{ cm}$.`

    this.canEnonce = `Le périmètre de ce triangle est $${perimetre}\\text{ cm}$.<br>
      ${texteEnCouleurEtGras('Complète', 'black')}.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(7, 4, 6)
    else this.enonce()
  }
}
