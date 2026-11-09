import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { cercle } from '../../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { rotation } from '../../../lib/2d/transformations'
import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Trouve l'heure sur une horloge (QCM)"
export const interactifReady = true

export const uuid = 'a2993'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q18 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  creerHorloge(
    heures: number,
    minutes: number,
    offsetX: number,
    offsetY: number,
  ) {
    const horloge = []
    const O = pointAbstrait(offsetX, offsetY)
    const C = cercle(O, 2)
    horloge.push(C)

    // Marques des heures (grands traits)
    const s = segment(
      pointAbstrait(offsetX + 1.5, offsetY),
      pointAbstrait(offsetX + 1.9, offsetY),
    )
    for (let i = 0; i < 4; i++) {
      horloge.push(rotation(s, O, 90 * i))
    }

    // Marques des 5 minutes (petits traits)
    const t = segment(
      pointAbstrait(offsetX + 1.7, offsetY),
      pointAbstrait(offsetX + 1.9, offsetY),
    )
    for (let i = 0; i < 4; i++) {
      horloge.push(rotation(t, O, 30 + i * 90), rotation(t, O, 60 + i * 90))
    }

    // Calcul des angles pour les aiguilles
    const alpha = 90 - (heures % 12) * 30 - minutes / 2
    const beta = 90 - minutes * 6

    // Grande aiguille (minutes) - rouge
    const grandeAiguille = rotation(
      segment(O, pointAbstrait(offsetX + 1.5, offsetY)),
      O,
      beta,
    )
    grandeAiguille.color = context.isHtml
      ? colorToLatexOrHTML('red')
      : colorToLatexOrHTML('black')
    grandeAiguille.epaisseur = 2

    // Petite aiguille (heures) - bleue
    const petiteAiguille = rotation(
      segment(O, pointAbstrait(offsetX + 1, offsetY)),
      O,
      alpha,
    )
    petiteAiguille.color = context.isHtml
      ? colorToLatexOrHTML(bleuMathalea)
      : colorToLatexOrHTML('black')
    petiteAiguille.epaisseur = 4

    horloge.push(petiteAiguille, grandeAiguille)

    return horloge
  }

  enonce(heureCorrecte?: number, minutesCorrectes?: number) {
    let horloges

    if (this.canOfficielle) {
      // Version officielle avec les pendules exactes de l'image
      horloges = [
        { h: 16, m: 30, correcte: true }, // Bonne réponse
        { h: 15, m: 30, correcte: false }, // Mauvaise réponse 1
        { h: 18, m: 20, correcte: false }, // Mauvaise réponse 2
      ]
      heureCorrecte = 16
      minutesCorrectes = 30
    } else {
      // Version aléatoire
      if (heureCorrecte == null || minutesCorrectes == null) {
        heureCorrecte = randint(13, 23) // Horaires de l'après-midi
        minutesCorrectes = choice([0, 15, 30, 45])
      }

      // Générer deux horaires incorrects
      const heuresDisponibles = []
      for (let h = 13; h <= 23; h++) {
        for (const m of [0, 15, 30, 45]) {
          if (h !== heureCorrecte || m !== minutesCorrectes) {
            heuresDisponibles.push({ h, m })
          }
        }
      }

      const incorrectes = []
      for (let i = 0; i < 2; i++) {
        const index = Math.floor(Math.random() * heuresDisponibles.length)
        incorrectes.push(heuresDisponibles[index])
        heuresDisponibles.splice(index, 1)
      }

      // Mélanger les trois horloges
      horloges = [
        { h: heureCorrecte, m: minutesCorrectes, correcte: true },
        { h: incorrectes[0].h, m: incorrectes[0].m, correcte: false },
        { h: incorrectes[1].h, m: incorrectes[1].m, correcte: false },
      ]

      // Mélanger aléatoirement
      for (let i = horloges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[horloges[i], horloges[j]] = [horloges[j], horloges[i]]
      }
    }

    const positionCorrecte = horloges.findIndex((h) => h.correcte) + 1

    const objets = []
    const espacementX = 5

    // Créer les trois horloges
    for (let i = 0; i < 3; i++) {
      const offsetX = i * espacementX
      const horlogeObjets = this.creerHorloge(
        horloges[i].h,
        horloges[i].m,
        offsetX,
        0,
      )
      objets.push(...horlogeObjets)

      // Ajouter le numéro entouré au-dessus de chaque horloge
      const cercleNumero = cercle(pointAbstrait(offsetX, 2.7), 0.4)
      cercleNumero.epaisseur = 1
      objets.push(cercleNumero)
      objets.push(
        latex2d(`${i + 1}`, offsetX, 2.7, { letterSize: 'normalsize' }),
      )
    }

    this.autoCorrection[0] = {
      propositions: [
        {
          texte: 'Pendule $1$',
          statut: positionCorrecte === 1,
        },
        {
          texte: 'Pendule $2$',
          statut: positionCorrecte === 2,
        },
        {
          texte: 'Pendule $3$',
          statut: positionCorrecte === 3,
        },
      ],
      options: { vertical: !context.isHtml },
    }

    this.formatInteractif = 'qcm'

    const xmin = -3
    const ymin = -3
    const xmax = 13
    const ymax = 3.5

    const dessin = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        scale: 0.5,
        center: !context.isHtml,
      },
      objets,
    )

    const heureAffichage = `$${heureCorrecte}\\text{ h}${minutesCorrectes === 0 ? '' : `\\;${minutesCorrectes}`}$`

    this.consigne = `Coche la pendule qui indique ${heureAffichage}.<br>${dessin}<br>`

    const monQcm = propositionsQcm(this, 0)
    this.canEnonce = `${dessin}<br>Coche la pendule qui indique ${heureAffichage}.`
    this.question = `${monQcm.texte}`

    this.correction =
      monQcm.texteCorr +
      `La ${texteEnCouleurEtGras(`pendule $\\mathbf{${positionCorrecte}}$`)} indique ${heureAffichage}.`
    this.canReponseACompleter = monQcm.texte
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(16, 30)
    else this.enonce()
  }
}
