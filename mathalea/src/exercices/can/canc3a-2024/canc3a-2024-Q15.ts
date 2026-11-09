import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latexParCoordonnees } from '../../../lib/2d/textes'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = "Calculer le périmètre d'un rectangle"
export const interactifReady = true

export const uuid = 'f828d'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class PerimetreRectangleCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: ' $\\text{cm}$.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let hauteur: number
    let grandeBase: number
    if (this.canOfficielle) {
      hauteur = 2
      grandeBase = 4
    } else {
      hauteur = randint(2, 4)
      grandeBase = randint(hauteur + 1, 4 + hauteur)
    }
    const A = new PointAbstrait(0, 0)
    const B = new PointAbstrait(grandeBase, 0)
    const C = new PointAbstrait(grandeBase, hauteur)
    const D = new PointAbstrait(0, hauteur)
    const rectangle = new Polygone([A, B, C, D])
    const angle1 = codageAngleDroit(D, A, B)
    const angle2 = codageAngleDroit(A, B, C)
    const angle3 = codageAngleDroit(B, C, D)
    const angle4 = codageAngleDroit(C, D, A)
    const horizontale1 = segment(
      pointAbstrait(0, -0.5),
      pointAbstrait(grandeBase, -0.5),
    )
    horizontale1.styleExtremites = '<->'
    const verticale1 = segment(
      pointAbstrait(grandeBase + 0.5, 0),
      pointAbstrait(grandeBase + 0.5, hauteur),
    )
    verticale1.styleExtremites = '<->'
    const horizontale2 = segment(
      pointAbstrait(0, hauteur + 0.5),
      pointAbstrait(grandeBase, hauteur + 0.5),
    )
    horizontale2.styleExtremites = '<->'
    const verticale2 = segment(
      pointAbstrait(-0.5, 0),
      pointAbstrait(-0.5, hauteur),
    )
    verticale2.styleExtremites = '<->'
    const largeur01 = latexParCoordonnees(
      `\\text{${String(hauteur) + ' cm'}}`,
      grandeBase + 0.9,
      hauteur / 2,
      'black',
      0,
      0,
      'white',
      8,
    )
    const longueur1 = latexParCoordonnees(
      `\\text{${String(grandeBase) + ' cm'}}`,
      grandeBase / 2,
      -0.5,
      'black',
      0,
      0,
      'white',
      8,
    )
    const largeur02 = latexParCoordonnees(
      `\\text{${String(hauteur) + ' cm'}}`,
      -1,
      hauteur / 2,
      'black',
      0,
      0,
      'white',
      8,
    )
    const longueur2 = latexParCoordonnees(
      `\\text{${String(grandeBase) + ' cm'}}`,
      grandeBase / 2,
      hauteur + 0.7,
      'black',
      0,
      0,
      'white',
      8,
    )
    const objets = [
      rectangle,
      angle1,
      angle2,
      angle3,
      angle4,
      verticale1,
      horizontale1,
      verticale2,
      horizontale2,
      largeur01,
      longueur1,
      largeur02,
      longueur2,
    ]

    this.question = mathalea2d(
      Object.assign(
        {
          scale: grandeBase > 5 ? 0.75 : 1,
          display: 'block',
          pixelsParCm: grandeBase > 5 ? 20 : 25,
        } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    this.question +=
      'Le périmètre de ce rectangle est égal à ' +
      (this.interactif ? '' : '$\\ldots\\text{ cm}$.')

    this.canEnonce = mathalea2d(
      Object.assign(
        {
          scale: grandeBase > 5 ? 0.6 : 0.9,
          pixelsParCm: grandeBase > 5 ? 20 : 30,
        },
        fixeBordures(objets),
      ),
      objets,
    )
    this.canReponseACompleter =
      'Le périmètre de ce rectangle est égal à $\\ldots\\text{ cm}$.'
    this.reponse = String((hauteur + grandeBase) * 2)
    this.correction = `Le périmètre du rectangle est égal à : <br>$(${String(grandeBase)}+${String(hauteur)})\\times 2=${String(grandeBase + hauteur)}\\times 2 = ${miseEnEvidence(this.reponse)}\\text{ cm}$.`
  }
}
