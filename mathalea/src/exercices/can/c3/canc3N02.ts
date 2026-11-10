import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver un nombre sur une droite graduée'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Date de publication septembre 2021

 */
export const uuid = 'fc190'

export const refs = {
  'fr-fr': ['canc3N02'],
  'fr-ch': [],
}
export default class SuiteSurDroiteGraduee extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 6) // choix de la table = écart entre deux graduations
    const c = Math.floor(this.quotaRandint('c', 10, 40) / a) * a // premier nombre.
    const maListe: [number, string][] = []
    for (let i = 0; i < 3; i++) {
      maListe.push([c + a * i, texNombre(c + a * i)])
    }
    const d = droiteGraduee({
      Unite: 3 / a,
      Min: c - a,
      Max: c + 3 * a,
      x: 0,
      y: 0,
      thickDistance: a,
      thickSec: false,
      thickOffset: 0,
      axeStyle: '->',
      pointListe: [[c + a * 3, '']],
      labelListe: maListe,
      pointCouleur: bleuMathalea,
      pointStyle: 'x',
      labelsPrincipaux: false,
    })
    this.reponse = c + 3 * a
    this.question = `Quel est le nombre repéré par la croix ?<br>
    
    `

    this.question += mathalea2d(
      {
        xmin: -1,
        ymin: -1.5,
        xmax: 15,
        ymax: 1.5,
        scale: 0.6,
        center: !context.isHtml,
      },
      d,
    )
    this.correction = `Comme les graduations vont de $${a}$ en $${a}$, le nombre repéré par la croix correspond à $${texNombre(c + 2 * a)} + ${a}$, donc c'est $${miseEnEvidence(texNombre(c + 3 * a))}$.`
  }
}
