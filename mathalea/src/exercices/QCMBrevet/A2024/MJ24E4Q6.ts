import { codageAngle } from '../../../lib/2d/angles'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { labelPoint, latex2d } from '../../../lib/2d/textes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '4e9ed'
export const refs = {
  'fr-fr': ['3G3QCM-1'],
  'fr-ch': ['1mT-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Trigonométrie dans le triangle rectangle (2023 Métropole)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJuin24Exo4Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    o: number,
    h: number,
    f: string,
  ): void {
    const bonneReponse = f === 'cos' ? a / h : f === 'sin' ? o / h : o / a
    const distracteur1 = f === 'cos' ? o / a : f === 'sin' ? a / h : o / h
    const distracteur2 = f === 'cos' ? o / h : f === 'sin' ? o / a : a / h

    this.reponses = [
      `$${texNombre(bonneReponse, 2)}$`,
      `$${texNombre(distracteur1, 2)}$`,
      `$${texNombre(distracteur2, 2)}$`,
    ]
    this.enonce = `Dans le triangle $ABC$ rectangle en $A$ ci-contre, qui n'est pas en vraie grandeur, quelle est la valeur de $\\${f} \\alpha$ ?`
    const triangle = polygone([
      pointAbstrait(0, 0, 'A', 'below left'),
      pointAbstrait(0, 3, 'C', 'above left'),
      pointAbstrait(4, 0, 'B', 'below right'),
    ])
    const angleDroit = codageAngleDroit(
      triangle.listePoints[1],
      triangle.listePoints[0],
      triangle.listePoints[2],
    )
    const labels = labelPoint(...triangle.listePoints)
    const angleAlpha = codageAngle(
      triangle.listePoints[0],
      triangle.listePoints[2],
      triangle.listePoints[1],
      1.5,
      '',
      'black',
      1,
      1,
      'none',
      0,
      false,
      false,
      '$\\alpha$',
    )
    const hypo = latex2d(`${h}`, 2.7, 1.7, {})
    const adjacent = latex2d(`${a}`, 1.7, -0.8, {})
    const oppose = latex2d(`${o}`, -1, 1.5, {})
    const objets = [
      triangle,
      labels,
      angleDroit,
      angleAlpha,
      hypo,
      adjacent,
      oppose,
    ]
    this.enonce += mathalea2d(
      Object.assign({ pixelsParCm: 20, scale: 1 }, fixeBordures(objets)),
      objets,
    )
    this.correction =
      f === 'cos'
        ? `$\\cos\\alpha=\\dfrac{AB}{BC}=\\dfrac{${a}}{${h}}=${miseEnEvidence(`${texNombre(bonneReponse, 2)}`)}$.`
        : f === 'sin'
          ? `$\\sin\\alpha=\\dfrac{AC}{BC}=\\dfrac{${o}}{${h}}=${miseEnEvidence(`${texNombre(bonneReponse, 2)}`)}$.`
          : `$\\tan\\alpha=\\dfrac{AC}{AB}=\\dfrac{${o}}{${a}}=${miseEnEvidence(`${texNombre(bonneReponse, 2)}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 3, 5, 'cos')
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const k = randint(2, 10)
      const f = choice(['cos', 'sin', 'tan'])
      const [a, o, h] = [4, 3, 5].map((el) => el * k)
      this.appliquerLesValeurs(a, o, h, f)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
