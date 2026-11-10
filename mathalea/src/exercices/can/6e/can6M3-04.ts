import { fixeBordures } from '../../../lib/2d/fixeBordures'
import {
  ajouteCanvas3d,
  type Elements3DDescription,
} from '../../../lib/3d/3d_dynamique/Canvas3DElement'
import { paveLPH3d } from '../../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { createUuid } from '../../../lib/outils/aleatoires'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Volume de pavé droit par dénombrement de cubes unités'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '04/07/2022'

/**
 * @author Jean-claude Lhote
 *

 */
export const uuid = 'e332d'

export const refs = {
  'fr-fr': ['can6M3-04', '6M3C-flash1'],
  'fr-ch': ['NR'],
}
export default class VolumePaveCubes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.besoinFormulaireCaseACocher = ['3D dynamique', false]
    this.nbQuestions = 1
    this.sup = false
  }

  nouvelleVersion() {
    const l = this.quotaRandint('l', 2, 5)
    const L = this.quotaRandint('L', 2, 4)
    const h = randint(2, 6, [l, L])
    this.question = ''
    if (this.sup && context.isHtml) {
      // Prépare la liste des cubes
      const cubes: {
        pos: [number, number, number]
        size: number
        edges: boolean
      }[] = []
      for (let x = 0; x < L; x++) {
        for (let y = 0; y < l; y++) {
          for (let z = 0; z < h; z++) {
            cubes.push({ pos: [x, z, y], size: 1, edges: true })
          }
        }
      }

      // Génère un id unique pour le canvas-3d
      const canvasId = `canvas3d-can6M11-${createUuid()}`
      // Ajoute le canvas-3d dans la question
      this.question =
        "Ce pavé droit est composé de cubes identiques. En prenant comme unité l'un de ces cubes, quel est le volume de ce pavé droit ?<br>"
      // Listener pour peupler la scène
      // Cast each object to Elements3DDescription to satisfy type checking
      const content = {
        objects: [
          ...cubes.map((cube) => ({ type: 'cube' as const, ...cube })),
          { type: 'ambientLight' as const, color: 0xffffff, intensity: 0.8 },
          {
            type: 'directionalLight' as const,
            color: 0xffffff,
            intensity: 1.2,
            position: [5, 5, 5],
          },
        ] as Elements3DDescription[],
        autoCenterZoomMargin: 1.2,
      }

      this.question += ajouteCanvas3d({
        id: canvasId,
        content,
        width: 200,
        height: 200,
      })
    } else {
      const pave = paveLPH3d(0, 0, 0, 0.75, L, l, h)
      this.question += mathalea2d(
        Object.assign({}, fixeBordures(pave.c2d)),
        pave.c2d,
      )
    }
    this.reponse = L * l * h
    this.correction = `Le volume de ce pavé droit est : $${L}\\times ${l}\\times ${h}=${miseEnEvidence(this.reponse)}$ cubes`

    this.canReponseACompleter = '$\\dots$ unités'
    this.optionsChampTexte = { texteApres: ' unités' }
  }
}
