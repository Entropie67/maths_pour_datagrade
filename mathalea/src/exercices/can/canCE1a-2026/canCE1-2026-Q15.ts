import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver la figure avec deux angles droits (QCM)'
export const interactifReady = true

export const uuid = 'b949c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q15 extends ExerciceCan {
  enonce() {
    let figuresOrdonnees
    let positionCorrecte

    if (this.canOfficielle) {
      // Version officielle : figures dans l'ordre de l'image
      figuresOrdonnees = [
        'maison', // Figure 1 - avec 2 angles droits (la bonne réponse)
        'trapeze_quelconque', // Figure 2 - sans 2 angles droits
        'quadrilatere_quelconque', // Figure 3 - sans 2 angles droits
        'triangle_quelconque', // Figure 4 - sans 2 angles droits
      ]
      positionCorrecte = 1 // La maison est en position 1
    } else {
      // Version aléatoire
      const figuresAvecDeuxAnglesDroits = [
        'maison',
        'trapeze_rectangle',
        'trapeze_rectangle2',
      ]

      const figuresSansDeuxAnglesDroits = [
        'triangle_rectangle',
        'quadrilatere_quelconque',
        'triangle_quelconque',
        'trapeze_quelconque',
        'losange',
      ]

      const figureCorrecte = choice(figuresAvecDeuxAnglesDroits)
      const figuresIncorrectesDisponibles = [...figuresSansDeuxAnglesDroits]
      const figuresIncorrectes = []
      for (let i = 0; i < 3; i++) {
        const index = Math.floor(
          Math.random() * figuresIncorrectesDisponibles.length,
        )
        figuresIncorrectes.push(figuresIncorrectesDisponibles[index])
        figuresIncorrectesDisponibles.splice(index, 1)
      }

      const toutesLesFigures = [figureCorrecte, ...figuresIncorrectes]
      const positions = shuffle([0, 1, 2, 3])
      figuresOrdonnees = positions.map((pos) => toutesLesFigures[pos])
      positionCorrecte = positions.indexOf(0) + 1
    }

    const espacementX = 3.5
    const polys = []

    // Créer tous les points et polygones pour chaque figure
    for (let index = 0; index < figuresOrdonnees.length; index++) {
      const fig = figuresOrdonnees[index]
      const offsetX = index * espacementX

      if (fig === 'maison') {
        const A = pointAbstrait(0 + offsetX, 0)
        const B = pointAbstrait(0 + offsetX, 2)
        const C = pointAbstrait(1 + offsetX, 3)
        const D = pointAbstrait(2 + offsetX, 2)
        const E = pointAbstrait(2 + offsetX, 0)
        const poly = polygone([A, B, C, D, E], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1 + offsetX,
          centreY: 1,
          numero: index + 1,
        })
      } else if (fig === 'trapeze_rectangle') {
        const A = pointAbstrait(0 + offsetX, 0)
        const B = pointAbstrait(0 + offsetX, 2)
        const C = pointAbstrait(2 + offsetX, 2)
        const D = pointAbstrait(2.5 + offsetX, 0)
        const poly = polygone([A, B, C, D], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1.25 + offsetX,
          centreY: 1,
          numero: index + 1,
        })
      } else if (fig === 'trapeze_rectangle2') {
        const A = pointAbstrait(0 + offsetX, 0)
        const B = pointAbstrait(0 + offsetX, 2.5)
        const C = pointAbstrait(2.5 + offsetX, 2)
        const D = pointAbstrait(2.5 + offsetX, 0)
        const poly = polygone([A, B, C, D], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1.25 + offsetX,
          centreY: 1.25,
          numero: index + 1,
        })
      } else if (fig === 'trapeze_quelconque') {
        // Trapèze sans angles droits (comme dans l'image)
        const A = pointAbstrait(0.3 + offsetX, 0)
        const B = pointAbstrait(0 + offsetX, 1.5)
        const C = pointAbstrait(2.2 + offsetX, 1.5)
        const D = pointAbstrait(2.5 + offsetX, 0)
        const poly = polygone([A, B, C, D], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1.25 + offsetX,
          centreY: 0.75,
          numero: index + 1,
        })
      } else if (fig === 'triangle_rectangle') {
        const A = pointAbstrait(0 + offsetX, 0)
        const B = pointAbstrait(2 + offsetX, 0)
        const C = pointAbstrait(2 + offsetX, 2.5)
        const poly = polygone([A, B, C], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1.3 + offsetX,
          centreY: 0.8,
          numero: index + 1,
        })
      } else if (fig === 'quadrilatere_quelconque') {
        // Quadrilatère quelconque (comme dans l'image)
        const A = pointAbstrait(0 + offsetX, 0)
        const B = pointAbstrait(0.5 + offsetX, 1.5)
        const C = pointAbstrait(2.2 + offsetX, 1.8)
        const D = pointAbstrait(2.5 + offsetX, 0.3)
        const poly = polygone([A, B, C, D], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1.25 + offsetX,
          centreY: 0.9,
          numero: index + 1,
        })
      } else if (fig === 'triangle_quelconque') {
        // Triangle quelconque (comme dans l'image)
        const A = pointAbstrait(0.3 + offsetX, 0)
        const B = pointAbstrait(2.3 + offsetX, 0)
        const C = pointAbstrait(1.5 + offsetX, 2.5)
        const poly = polygone([A, B, C], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1.3 + offsetX,
          centreY: 0.8,
          numero: index + 1,
        })
      } else if (fig === 'losange') {
        const A = pointAbstrait(1 + offsetX, 0)
        const B = pointAbstrait(0 + offsetX, 1.5)
        const C = pointAbstrait(1 + offsetX, 3)
        const D = pointAbstrait(2 + offsetX, 1.5)
        const poly = polygone([A, B, C, D], 'black')
        poly.epaisseur = 2
        polys.push({
          poly,
          centreX: 1 + offsetX,
          centreY: 1.5,
          numero: index + 1,
        })
      }
    }

    const xmin = -0.5
    const ymin = -0.5
    const xmax = 14
    const ymax = 4
    const objets = []

    // Ajouter tous les polygones et numéros
    for (const p of polys) {
      objets.push(p.poly)
      objets.push(
        latex2d(`${p.numero}`, p.centreX, p.centreY, {
          letterSize: 'normalsize',
        }),
      )
    }

    this.autoCorrection[0] = {
      propositions: [
        {
          texte: 'Figure $1$',
          statut: positionCorrecte === 1,
        },
        {
          texte: 'Figure $2$',
          statut: positionCorrecte === 2,
        },
        {
          texte: 'Figure $3$',
          statut: positionCorrecte === 3,
        },
        {
          texte: 'Figure $4$',
          statut: positionCorrecte === 4,
        },
      ],
      options: { vertical: !context.isHtml },
    }

    this.formatInteractif = 'qcm'

    const dessin = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 25,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.6,
        center: !context.isHtml,
      },
      objets,
    )

    this.consigne =
      'Coche le numéro de la figure qui a deux angles droits.' + dessin + '<br>'

    const monQcm = propositionsQcm(this, 0)
    this.canEnonce =
      'Coche le numéro de la figure qui a deux angles droits.<br>' + dessin

    this.question = `${monQcm.texte}`

    this.correction =
      monQcm.texteCorr +
      `La ${texteEnCouleurEtGras(`figure $\\mathbf{${positionCorrecte}}$`)} possède exactement deux angles droits. Les autres figures n'en ont pas deux.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    this.enonce()
  }
}
