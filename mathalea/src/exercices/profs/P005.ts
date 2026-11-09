import {
  grille,
  lignesHorizontales,
  lignesVerticales,
} from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser des grilles décimales'

export const refs = {
  'fr-fr': ['P005'],
  'fr-ch': [],
}
export const uuid = 'ad5f7'

/**
 * Fonction permettant aux enseignants de proposer des grilles décimale à colorier
 * @author Jean-claude Lhote
 */
export default class FeuilleDeGrilles extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'nombre de cases',
      'Nombres séparés par des tirets\n1 : 10\n2 : 100\n3 : 1000',
    ]

    this.sup = 1
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const typeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      nbQuestions: this.nbQuestions,
      shuffle: false,
      melange: 1000,
    }).map(Number)
    for (let i = 0; i < this.nbQuestions; i++) {
      const objets = []
      let fleche
      let A
      let B
      let C
      let D
      let texte = ''
      this.contenu = ''
      if (typeDeQuestion[i] === 1) {
        // On travaille au dixième
        for (let i = 0; i < 5; i++) {
          objets.length = 0
          // pixelsParCm=50
          objets.push(carre(pointAbstrait(1, 1), pointAbstrait(2, 1)))
          objets.push(texteParPosition('= 1 unité', 3.5, 1.5))
          objets.push(grille(15, -2, 19, 2, 'black', 1, 4))
          for (let j = 0; j < 11; j++) {
            A = pointAbstrait(0 + j * 1.1, -0.5)
            B = pointAbstrait(1 + j * 1.1, -0.5)
            C = pointAbstrait(1 + j * 1.1, 0.5)
            D = pointAbstrait(0 + j * 1.1, 0.5)
            objets.push(polygone(A, B, C, D))
          }
          objets.push(segment(pointAbstrait(11.5, 0.5), pointAbstrait(15, 2), 'gray'))
          objets.push(segment(pointAbstrait(11.5, -0.5), pointAbstrait(15, -2), 'gray'))
          fleche = segment(12, 0, 15, 0)
          fleche.styleExtremites = '->'
          objets.push(texteParPosition('ZOOM', 13.5, 0.4))
          objets.push(texteParPosition('x4', 13.5, -0.4))
          objets.push(fleche)
          objets.push(lignesHorizontales(15, -2, 19, 2, 'gray', 1, 0.8))
          objets.push(lignesVerticales(15, -2, 19, 2, 'gray', 1, 2))
          objets.push(lignesHorizontales(11, -0.5, 12, 0.5, 'gray', 0.8, 0.2))
          objets.push(lignesVerticales(11, -0.5, 12, 0.5, 'gray', 0.8, 0.5))

          texte = mathalea2d(
            {
              xmin: -0.5,
              ymin: -2.2,
              xmax: 21,
              ymax: 3,
              pixelsParCm: 30,
              scale: 0.8,
            },
            objets,
          )
          this.contenu = texte
          this.contenu += '<br>'
        }
      } else if (typeDeQuestion[i] === 2) {
        for (let i = 0; i < 4; i++) {
          objets.length = 0
          // pixelsParCm=50
          objets.push(carre(pointAbstrait(1, 1.5), pointAbstrait(2, 1.5)))
          objets.push(texteParPosition('= 1 unité', 3.5, 2))
          objets.push(grille(15, -2.5, 20, 2.5, 'black', 1, 0.5))
          objets.push(grille(11, -0.5, 12, 0.5, 'black', 0.3, 0.1))

          for (let j = 0; j < 11; j++) {
            A = pointAbstrait(0 + j * 1.1, -0.5)
            B = pointAbstrait(1 + j * 1.1, -0.5)
            C = pointAbstrait(1 + j * 1.1, 0.5)
            D = pointAbstrait(0 + j * 1.1, 0.5)
            objets.push(polygone(A, B, C, D))
          }
          objets.push(segment(pointAbstrait(11.5, 0.5), pointAbstrait(15, 2.5)))
          objets.push(segment(pointAbstrait(11.5, -0.5), pointAbstrait(15, -2.5)))
          fleche = segment(12, 0, 15, 0)
          fleche.styleExtremites = '->'
          objets.push(texteParPosition('ZOOM', 13.5, 0.5))
          objets.push(texteParPosition('x5', 13.5, -0.5))
          objets.push(fleche)
          texte = mathalea2d(
            {
              xmin: -0.5,
              ymin: -3,
              xmax: 26,
              ymax: 3,
              pixelsParCm: 30,
              scale: 0.775,
            },
            objets,
          )
          this.contenu = texte
          this.contenu += '<br>'
        }
      } else {
        for (let i = 0; i < 3; i++) {
          objets.length = 0
          // pixelsParCm=50
          for (let j = 0; j < 11; j++) {
            A = pointAbstrait(0 + j * 1.1, -0.5)
            B = pointAbstrait(1 + j * 1.1, -0.5)
            C = pointAbstrait(1 + j * 1.1, 0.5)
            D = pointAbstrait(0 + j * 1.1, 0.5)
            objets.push(polygone(A, B, C, D))
          }
          objets.push(carre(pointAbstrait(1, 1.5), pointAbstrait(2, 1.5)))
          objets.push(texteParPosition('= 1 unité', 3.5, 2))
          objets.push(segment(pointAbstrait(11.5, 0.5), pointAbstrait(15, 5)))
          objets.push(segment(pointAbstrait(11.5, -0.5), pointAbstrait(15, -5)))
          fleche = segment(12, 0, 15, 0)
          fleche.styleExtremites = '->'
          objets.push(texteParPosition('ZOOM', 13.5, 0.5))
          objets.push(texteParPosition('x10', 13.5, -0.5))
          objets.push(fleche)
          objets.push(lignesHorizontales(15, -5, 25, 5, 'gray', 0.8, 0.2))
          objets.push(lignesVerticales(15, -5, 25, 5, 'gray', 0.8, 0.5))
          objets.push(grille(15, -5, 25, 5, 'black', 1, 1))
          objets.push(grille(11, -0.5, 12, 0.5, 'black', 0.3, 0.1))
          texte = mathalea2d(
            {
              xmin: -0.1,
              ymin: -5.5,
              xmax: 26,
              ymax: 5.5,
              pixelsParCm: 25,
              scale: 0.65,
            },
            objets,
          )
        }
      }
      this.listeQuestions.push(texte)
    }
  }
}
