import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une abscisse sur une droite graduée'
export const interactifReady = true

export const uuid = '76dc1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2025CE1Q20 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const valMin = this.canOfficielle ? 150 : randint(11, 19) * 10
    const absSol = this.canOfficielle ? 220 : valMin + randint(2, 8) * 10
    const d = droiteGraduee({
      Unite: 0.1,
      Min: valMin,
      Max: valMin + 105,
      x: 0,
      y: 0,
      thickDistance: 10,
      axeStyle: '->',
      pointListe: [[absSol, '']],
      pointStyle: context.isHtml ? 'x' : '',
      pointTaille: 7,
      labelListe: [
        [valMin, String(valMin)],
        [valMin + 100, String(valMin + 100)],
      ],
      labelsPrincipaux: false,
    })
    this.reponse = absSol
    this.question = mathalea2d(
      {
        xmin: -1,
        ymin: -1.5,
        xmax: 12,
        ymax: 1.5,
        scale: 0.6,
        center: !context.isHtml,
      },
      d,
    )
    this.question += 'Quel nombre est repéré par la croix ? '
    this.correction = `Entre $${valMin}$ et $${valMin + 100}$, il y a $100$ unités. <br>
    Ces $100$ unités sont partagées en $10$ parts.<br>
      Chaque part correspond à $10$ unités car $10\\times 10=100$.<br>
      Ainsi, la croix repère le nombre $${miseEnEvidence(texNombre(absSol))}$.`

    this.canEnonce = `Place le nombre $${absSol}$.`
    this.canReponseACompleter = mathalea2d(
      {
        xmin: -1,
        ymin: -1.5,
        xmax: 12.2,
        ymax: 1.5,
        scale: 0.38,
        center: !context.isHtml,
      },
      d,
    )
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
