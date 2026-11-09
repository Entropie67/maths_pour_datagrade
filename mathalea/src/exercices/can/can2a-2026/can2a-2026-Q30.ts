import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polyline } from '../../../lib/2d/Polyline'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer la longueur d'une ligne brisée"
export const interactifReady = true

export const uuid = 'ehwt2'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
const creerQuestionLigneBrisee = () => {
  // Choix aléatoire de la longueur de l'unité (en carreaux)
  const longueurUnite = choice([3, 4, 5, 6])

  // Définir les limites de la grille
  const xmin = -1
  const ymin = -2
  const xmax = 7
  const ymax = 5

  // Créer la grille
  const grilleObj = grille(-2, ymin, xmax, ymax - 1, 'gray', 1, 1)

  // Créer le segment unité en haut
  const G = pointAbstrait(0, 4, 'G', 'above')
  const H = pointAbstrait(longueurUnite, 4, 'H', 'above')
  const segmentUnite = segment(G, H)
  segmentUnite.epaisseur = 2
  segmentUnite.styleExtremites = '<->'
  segmentUnite.tailleExtremites = context.isHtml ? 6 : 2

  // Générer aléatoirement une ligne brisée
  // La ligne brisée aura entre longueurUnite et 3*longueurUnite carreaux de longueur
  const longueurLigneBrisee = randint(longueurUnite + 1, 3 * longueurUnite)

  // Créer les points de la ligne brisée
  // On commence à (0, 2) et on crée des segments horizontaux et verticaux
  const points = [pointAbstrait(0, 2)]
  let xActuel = 0
  let yActuel = 2
  let longueurRestante = longueurLigneBrisee
  const xMaxLigne = 6 // Limite horizontale pour la ligne brisée
  let longueurReelle = 0 // Longueur réelle de la ligne brisée créée

  while (longueurRestante > 0) {
    // Alterner entre segments horizontaux et verticaux
    if (points.length % 2 === 1) {
      // Segment horizontal
      // Calculer la longueur maximale possible sans sortir de la grille
      const longueurMax = Math.min(xMaxLigne - xActuel, longueurRestante)
      if (longueurMax <= 0) {
        // Si on ne peut plus avancer horizontalement, on arrête
        break
      }
      const longueur = Math.min(randint(1, 3), longueurMax)
      xActuel += longueur
      points.push(pointAbstrait(xActuel, yActuel))
      longueurRestante -= longueur
      longueurReelle += longueur
    } else {
      // Segment vertical
      const direction = choice([-1, 1])
      const longueur = Math.min(randint(1, 2), longueurRestante)
      const nouveauY = yActuel + direction * longueur
      // Limiter y entre 0 et 3 et calculer la longueur effective
      const yFinal = Math.max(0, Math.min(3, nouveauY))
      const longueurEffective = Math.abs(yFinal - yActuel)
      yActuel = yFinal
      points.push(pointAbstrait(xActuel, yActuel))
      longueurRestante -= longueurEffective
      longueurReelle += longueurEffective
    }
  }
  const ligneBrisee = polyline(...points)
  ligneBrisee.epaisseur = 3

  // Assembler les objets
  const objets = []
  objets.push(
    latex2d('1 u.\\ell.', milieu(G, H).x, milieu(G, H).y + 0.6, {
      letterSize: 'normalsize',
    }),
    grilleObj,
    segmentUnite,
    ligneBrisee,
  )

  return {
    objets,
    longueurUnite,
    longueurLigneBrisee: longueurReelle, // Retourner la longueur réelle
    xmin,
    ymin,
    xmax,
    ymax,
  }
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q30 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteAvant: ' ', texteApres: 'u.l.' }
  }

  enonce(): void {
    let questionData
    // Fonction pour créer aléatoirement une question de ligne brisée sur grille
    if (this.canOfficielle || this.sup) {
      const objets: NestedObjetMathalea2dArray = []
      objets.push(grille(0, 0, 7, 4, 'gray', 1, 1))
      const G = pointAbstrait(0, 4)
      const H = pointAbstrait(3, 4)
      const segmentUnite = segmentAvecExtremites(G, H)
      segmentUnite.epaisseur = 2
      segmentUnite.styleExtremites = '<->'
      segmentUnite.tailleExtremites = context.isHtml ? 6 : 2
      objets.push(segmentUnite)
      objets.push(
        latex2d('1 u.\\ell.', milieu(G, H).x, milieu(G, H).y + 0.6, {
          letterSize: 'normalsize',
        }),
      )
      const ligneBrisee = polyline(
        pointAbstrait(1, 3),
        pointAbstrait(1, 1),
        pointAbstrait(3, 1),
        pointAbstrait(3, 3),
        pointAbstrait(5, 3),
        pointAbstrait(5, 1),
        pointAbstrait(6, 1),
        pointAbstrait(6, 3),
      )
      ligneBrisee.epaisseur = 3
      objets.push(ligneBrisee)
      questionData = {
        objets,
        longueurUnite: 3,
        longueurLigneBrisee: 13,
        xmin: -0.2,
        ymin: 0,
        xmax: 7,
        ymax: 5,
      }
    } else {
      questionData = creerQuestionLigneBrisee()
    }
    const b = questionData.longueurUnite
    const longueurCarreaux = questionData.longueurLigneBrisee

    this.reponse = new FractionEtendue(longueurCarreaux, b)

    this.question = 'Longueur de la ligne brisée en u.l.<br>'
    this.question +=
      mathalea2d(
        {
          xmin: questionData.xmin - 0.5,
          ymin: questionData.ymin,
          xmax: questionData.xmax,
          ymax: questionData.ymax,
          pixelsParCm: 20,
          scale: 0.5,
          center: !context.isHtml,
        },
        questionData.objets,
      ) + `<br>`

    this.correction = `Une unité correspond à $${b}$ carreaux, la ligne brisée mesure $${longueurCarreaux}$ carreaux, soit $${miseEnEvidence(this.reponse.texFraction)}$ u.l. `

    this.canReponseACompleter = '$\\ldots$ u.l.'
  }

  nouvelleVersion(): void {
    this.enonce()
  }
}
