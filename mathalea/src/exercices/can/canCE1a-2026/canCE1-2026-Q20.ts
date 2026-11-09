import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { cercle } from '../../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Trouver la fraction un demi (QCM)'
export const interactifReady = true

export const uuid = 'b5563'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q20 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  enonce() {
    let barres

    if (this.canOfficielle) {
      // Version officielle : selon l'image
      barres = [
        { nbParties: 4, grisees: [0], correcte: false }, // Barre 1 : 1/4
        { nbParties: 10, grisees: [0, 1, 2, 3, 4], correcte: true }, // Barre 2 : 5/10 = 1/2
        { nbParties: 6, grisees: [0], correcte: false }, // Barre 3 : 1/6
      ]
    } else {
      // Version aléatoire
      const barresAvecDemi = [
        { nbParties: 2, grisees: [0], correcte: true }, // 1/2
        { nbParties: 4, grisees: [0, 1], correcte: true }, // 2/4 = 1/2
        { nbParties: 6, grisees: [0, 1, 2], correcte: true }, // 3/6 = 1/2
        { nbParties: 8, grisees: [0, 1, 2, 3], correcte: true }, // 4/8 = 1/2
        { nbParties: 10, grisees: [0, 1, 2, 3, 4], correcte: true }, // 5/10 = 1/2
      ]

      const barresSansDemi = [
        { nbParties: 3, grisees: [0], correcte: false }, // 1/3
        { nbParties: 4, grisees: [0], correcte: false }, // 1/4
        { nbParties: 5, grisees: [0], correcte: false }, // 1/5
        { nbParties: 6, grisees: [0], correcte: false }, // 1/6
        { nbParties: 4, grisees: [0, 1, 2], correcte: false }, // 3/4
        { nbParties: 6, grisees: [0, 1], correcte: false }, // 2/6 = 1/3
        { nbParties: 8, grisees: [0, 1], correcte: false }, // 2/8 = 1/4
      ]

      const barreCorrecte = choice(barresAvecDemi)
      const barresIncorrectesDisponibles = [...barresSansDemi]
      const barresIncorrectes = []
      for (let i = 0; i < 2; i++) {
        const index = Math.floor(
          Math.random() * barresIncorrectesDisponibles.length,
        )
        barresIncorrectes.push(barresIncorrectesDisponibles[index])
        barresIncorrectesDisponibles.splice(index, 1)
      }

      barres = [barreCorrecte, ...barresIncorrectes]

      // Mélanger
      for (let i = barres.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[barres[i], barres[j]] = [barres[j], barres[i]]
      }
    }

    const positionCorrecte = barres.findIndex((b) => b.correcte) + 1

    const objets = []
    const yStart = 3
    const espacementY = 1.5
    const largeurPartie = 1.5
    const hauteur = 0.6

    // Créer les trois barres
    for (let i = 0; i < barres.length; i++) {
      const y = yStart - i * espacementY
      const nbParties = barres[i].nbParties
      const partiesGrisees = barres[i].grisees

      // Créer la barre
      for (let j = 0; j < nbParties; j++) {
        const xDebut = 1 + j * largeurPartie
        const A = pointAbstrait(xDebut, y)
        const B = pointAbstrait(xDebut + largeurPartie, y)
        const C = pointAbstrait(xDebut + largeurPartie, y + hauteur)
        const D = pointAbstrait(xDebut, y + hauteur)

        const rect = new Polygone([A, B, C, D])
        rect.epaisseur = 2

        // Si cette partie doit être grisée
        if (partiesGrisees.includes(j)) {
          rect.couleurDeRemplissage = colorToLatexOrHTML('gray')
          rect.opaciteDeRemplissage = 0.7
        }

        objets.push(rect)
      }

      // Ajouter le numéro entouré à gauche de chaque barre
      const centreY = y + hauteur / 2
      const C = cercle(pointAbstrait(-0.5, centreY), 0.4)
      C.epaisseur = 2
      objets.push(C)
      objets.push(
        latex2d(`${i + 1}`, -0.5, centreY, { letterSize: 'normalsize' }),
      )
    }

    this.autoCorrection[0] = {
      propositions: [
        {
          texte: 'Barre $1$',
          statut: positionCorrecte === 1,
        },
        {
          texte: 'Barre $2$',
          statut: positionCorrecte === 2,
        },
        {
          texte: 'Barre $3$',
          statut: positionCorrecte === 3,
        },
      ],
      options: { vertical: true },
    }

    this.formatInteractif = 'qcm'

    const dessin = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.consigne = `Coche la représentation de la fraction un demi.` + dessin

    const monQcm = propositionsQcm(this, 0)
    this.canEnonce = dessin + 'Coche la représentation de la fraction un demi.'
    this.question = `${monQcm.texte}`

    this.correction =
      monQcm.texteCorr +
      `La ${texteEnCouleurEtGras(`barre $\\mathbf{${positionCorrecte}}$`)} représente la fraction un demi.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    this.enonce()
  }
}
