// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f586a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Déterminer une courbe à partir d’un tableau de variations'
export const dateDePublication = '06/08/2026'
export const uuid = 'f586a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

type Position = '+' | '-'
type PointCourbe = { x: number; y: number }

/**
 * @author Stéphane Guyon
 */
export default class CourbeDepuisTableauDeVariationsOld extends ExerciceQcmA {
  private construireTableau(
    abscisses: number[],
    images: number[],
    positions: Position[],
  ): string {
    const ligneAbscisses: (string | number)[] = []
    const ligneVariations: (string | number)[] = ['Var', 10]

    for (let index = 0; index < abscisses.length; index++) {
      ligneAbscisses.push(`$${texNombre(abscisses[index], 0)}$`, 10)
      ligneVariations.push(
        `${positions[index]}/$${texNombre(images[index], 0)}$`,
        10,
      )
    }

    return tableauDeVariation({
      tabInit: [
        [
          ['$x$', 1.5, 10],
          ['$f(x)$', 4, 30],
        ],
        ligneAbscisses,
      ],
      tabLines: [ligneVariations],
      espcl: 2.4,
      deltacl: 0.9,
      lgt: 2,
      scale: 0.75,
      hauteurLignes: [18, 18],
    })
  }

  private construireCourbe(points: PointCourbe[]): string {
    const pointsTries = [...points].sort((a, b) => a.x - b.x)
    const noeuds = pointsTries.map(({ x, y }, index) => ({
      x,
      y,
      deriveeGauche:
        index === 0 ? Math.sign(pointsTries[1].y - pointsTries[0].y) : 0,
      deriveeDroit:
        index === pointsTries.length - 1
          ? Math.sign(pointsTries.at(-1)!.y - pointsTries.at(-2)!.y)
          : 0,
      isVisible: false,
    }))
    const maSpline = spline(noeuds)
    const repere1 = repere({
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
    })
    const courbe = maSpline.courbe({
      epaisseur: 1.7,
      ajouteNoeuds: false,
      color: bleuMathalea,
    })
    const origine = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)

    return mathalea2d(
      {
        xmin: -6,
        xmax: 6,
        ymin: -6,
        ymax: 6,
        pixelsParCm: 25,
        scale: 0.42,
        center: !context.isHtml,
      },
      repere1,
      courbe,
      origine,
    )
  }

  private appliquerLesValeurs(): void {
    const decalageX = choice([-1, 0, 1])
    const decalageY = choice([-1, 1])
    const coefficientY = choice([-1, 1])
    const abscisses = [-4, -2, 1, 3, 5].map((x) => x + decalageX)
    const images = [1, 4, -2, 3, 0].map((y) => coefficientY * y + decalageY)
    const positionsCorrectes: Position[] =
      coefficientY === 1 ? ['-', '+', '-', '+', '-'] : ['+', '-', '+', '-', '+']
    const pointsCorrects = abscisses.map((x, index) => ({
      x,
      y: images[index],
    }))

    const tableau = this.construireTableau(
      abscisses,
      images,
      positionsCorrectes,
    )
    const courbeCorrecte = this.construireCourbe(pointsCorrects)

    // Les rôles des abscisses et des images sont échangés.
    const courbeAxesInverses = this.construireCourbe(
      pointsCorrects.map(({ x, y }) => ({ x: y, y: x })),
    )

    // Toutes les variations sont inversées.
    const courbeVariationsInversees = this.construireCourbe(
      pointsCorrects.map(({ x, y }) => ({
        x,
        y: 2 * decalageY - y,
      })),
    )

    // Un extremum du tableau n'apparaît pas sur la courbe.
    const indexOublie = choice([1, 3])
    const courbeExtremumOublie = this.construireCourbe(
      pointsCorrects.filter((_, index) => index !== indexOublie),
    )

    this.enonce = `Le tableau de variations d'une fonction $f$ est donné ci-dessous.<br>
    ${tableau}<br><br>
    Quelle courbe peut représenter la fonction $f$ ?`
    this.reponses = [
      courbeCorrecte,
      courbeAxesInverses,
      courbeVariationsInversees,
      courbeExtremumOublie,
    ].map((courbe) =>
      context.isHtml
        ? `<div style="margin: 1rem 1.25rem;">${courbe}</div>`
        : courbe,
    )

    const intervalles = abscisses
      .slice(0, -1)
      .map((borne, index) => {
        const sens =
          images[index + 1] > images[index] ? 'croissante' : 'décroissante'
        return `Sur $[${texNombre(borne, 0)}\\,;\\,${texNombre(abscisses[index + 1], 0)}]$, $f$ est ${sens}`
      })
      .join(' ;<br>')
    const pointsLus = abscisses
      .map(
        (abscisse, index) =>
          `$(${texNombre(abscisse, 0)}\\,;\\,${texNombre(images[index], 0)})$`,
      )
      .join(', ')
    this.correction = `En lisant le tableau de variations, on obtient :<br>
    ${intervalles}.<br>
    Les deux lignes du tableau donnent également les coordonnées de points de la courbe. Celle-ci doit donc passer par les points ${pointsLus}.<br>
    La courbe qui respecte toutes ces informations est :<br>
    ${courbeCorrecte}`
  }

  versionAleatoire: () => void = () => {
    do {
      this.appliquerLesValeurs()
    } while (nombreElementsDifferents(this.reponses) < 4)
  }

  nouvelleVersion(): void {
    super.nouvelleVersion()
    if (!context.isHtml) {
      this.listeQuestions = this.listeQuestions.map((question) =>
        question.replaceAll(
          '\\begin{qcmprop}[cols=4]',
          '\\begin{qcmprop}[cols=2]',
        ),
      )
      this.listeCorrections = this.listeCorrections.map((correction) =>
        correction.replaceAll(
          '\\begin{qcmprop}[cols=4',
          '\\begin{qcmprop}[cols=2',
        ),
      )
    }
  }

  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    this.options.vertical = true
    this.versionAleatoire()
  }
}
