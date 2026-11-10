import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { PointAbstrait, pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { texteParPoint } from '../../../lib/2d/textes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'

export const titre = "Déterminer l'aire d'un trapèze rectangle en ua"
export const interactifReady = true

export const uuid = '693b3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/
export default class AireTrapezeRectangle extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: ' ua' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let hauteur: number
    let grandeBase: number
    let petiteBase: number
    if (this.canOfficielle) {
      hauteur = 2
      grandeBase = 5
      petiteBase = 3
    } else {
      hauteur = randint(1, 2) * 2
      grandeBase = randint(2 + hauteur, 6 + hauteur)
      petiteBase =
        Math.random() < 0.5 ? grandeBase - hauteur / 2 : grandeBase - hauteur
    }

    const grillage = grille(0, 0, grandeBase + 2, hauteur + 2, 'gray', 1, 1)
    const A = pointAbstrait(1, 1)
    const B = pointAbstrait(1 + grandeBase, 1)
    const C = pointAbstrait(1 + petiteBase, 1 + hauteur)
    const D = pointAbstrait(1, 1 + hauteur)
    const trapeze = polygone([A, B, C, D])
    const unite = polygone([
      pointAbstrait(grandeBase + 2, hauteur + 2),
      pointAbstrait(grandeBase + 2, hauteur + 1),
      pointAbstrait(grandeBase + 1, hauteur + 1),
      pointAbstrait(grandeBase + 1, hauteur + 2),
    ])
    unite.couleurDesBordures = 'black'
    // unite.epaisseur = 2
    // unite.hachures = 'checkerboard'
    // trapeze.epaisseur = 2
    trapeze.couleurDeRemplissage = colorToLatexOrHTML('gray')
    const figureA = texteParPoint(
      'Figure A',
      new PointAbstrait(2, 0.5),
      0,
      'black',
      1,
      'gauche',
    )
    const ua = texteParPoint(
      '1 ua',
      new PointAbstrait(grandeBase + 1.5, hauteur + 0.5),
      0,
      'black',
      1,
      'milieu',
    )
    const objets = [grillage, trapeze, figureA, unite, ua]
    this.question =
      "Quelle est l'aire de la figure A en unités d'aire (ua) ?<br>"
    this.question += mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.canReponseACompleter = '$\\ldots$ ua'
    this.reponse = (((petiteBase + grandeBase) * hauteur) / 2).toFixed(0)
    this.correction = `On commence par compter le nombre de carreaux entiers, puis on ajoute les carreaux qui se complètent. <br>
    L'aire de la figure A est égale à $${miseEnEvidence(this.reponse)}$ ua.`
  }
}
