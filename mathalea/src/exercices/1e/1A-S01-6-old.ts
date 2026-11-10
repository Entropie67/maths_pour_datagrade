// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 5a571 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '5a571'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Exploiter les aires des rectangles d’un histogramme'
export const dateDePublication = '07/08/2026'

/**
 * @author Stéphane Guyon
 */
export default class ExploiterHistogrammeAgesOld extends ExerciceQcmA {
  private construireRectangle(
    xMin: number,
    xMax: number,
    hauteur: number,
  ): ObjetMathalea2D {
    const rectangle = polygone(
      [
        pointAbstrait(xMin, 0),
        pointAbstrait(xMin, hauteur),
        pointAbstrait(xMax, hauteur),
        pointAbstrait(xMax, 0),
      ],
      'black',
    )
    rectangle.epaisseur = 3
    rectangle.couleurDeRemplissage = colorToLatexOrHTML('#E6BE96')
    rectangle.opaciteDeRemplissage = 0.7
    return rectangle
  }

  private construireHistogramme(
    largeurs: number[],
    hauteurs: number[],
    pasAge: number,
    habitantsParCarreau: number,
  ): string {
    const largeurTotale = largeurs.reduce(
      (somme, largeur) => somme + largeur,
      0,
    )
    const hauteurMax = Math.max(...hauteurs)
    const bornesClasses = [0]
    for (const largeur of largeurs) {
      bornesClasses.push(bornesClasses[bornesClasses.length - 1] + largeur)
    }
    const objets: ObjetMathalea2D[] = []
    let abscisse = 0
    for (let index = 0; index < largeurs.length; index++) {
      objets.push(
        this.construireRectangle(
          abscisse,
          abscisse + largeurs[index],
          hauteurs[index],
        ),
      )
      abscisse += largeurs[index]
    }

    const axe = repere({
      xMin: 0,
      xMax: largeurTotale,
      yMin: 0,
      yMax: hauteurMax + 3,
      xThickDistance: 1,
      yThickDistance: 1,
      xLabelListe: bornesClasses.map((borne) => ({
        valeur: borne,
        texte: `${pasAge * borne}`,
      })),
      labelsYareVisible: false,
      grilleXDistance: 1,
      grilleYDistance: 1,
    })
    const xUnite = Math.max(1, largeurTotale - 2)
    const yUnite = hauteurMax + 1
    const carreauUnite = polygone(
      [
        pointAbstrait(xUnite, yUnite),
        pointAbstrait(xUnite, yUnite + 1),
        pointAbstrait(xUnite + 1, yUnite + 1),
        pointAbstrait(xUnite + 1, yUnite),
      ],
      '#D2691E',
    )
    carreauUnite.epaisseur = 2
    carreauUnite.couleurDeRemplissage = colorToLatexOrHTML('#E6BE96')
    carreauUnite.opaciteDeRemplissage = 0.7
    objets.push(
      axe,
      carreauUnite,
      texteParPosition(
        `${habitantsParCarreau} habitants`,
        xUnite - 1.6,
        yUnite + 0.5,
        0,
        'black',
        0.9,
      ),
      texteParPosition(
        'Âge (en années)',
        largeurTotale / 2,
        -1.35,
        0,
        'black',
        1,
      ),
    )

    return mathalea2d(
      {
        xmin: -1,
        xmax: largeurTotale + 1,
        ymin: -2,
        ymax: hauteurMax + 3.5,
        pixelsParCm: 28,
        scale: 0.7,
        center: !context.isHtml,
      },
      objets,
    )
  }

  private appliquerLesValeurs(): void {
    const largeurs = choice([
      [2, 2, 2, 2, 2],
      [2, 2, 2, 2, 3],
      [1, 2, 2, 3, 2],
      [2, 1, 2, 3, 3],
      [1, 1, 1, 2, 3, 2],
      [1, 2, 1, 1, 3, 3],
    ])
    const nombreClasses = largeurs.length
    const pasAge = 10
    let borneInferieure = 0
    const hauteurs = largeurs.map((largeur) => {
      const borneSuperieure = borneInferieure + largeur * pasAge
      const hauteur =
        borneInferieure >= 80
          ? 1
          : borneSuperieure > 80
            ? randint(1, 2)
            : borneInferieure >= 60
              ? randint(1, 3)
              : randint(2, 5)
      borneInferieure = borneSuperieure
      return hauteur
    })
    const habitantsParCarreau = choice([10, 20, 25, 50])
    const indiceSeuil = randint(1, nombreClasses - 2)
    const seuil =
      pasAge *
      largeurs
        .slice(0, indiceSeuil)
        .reduce((somme, largeur) => somme + largeur, 0)
    const aires = largeurs.map((largeur, index) => largeur * hauteurs[index])
    const aireTotale = aires.reduce((somme, aire) => somme + aire, 0)
    const aireApresSeuil = aires
      .slice(indiceSeuil)
      .reduce((somme, aire) => somme + aire, 0)
    const effectifTotal = habitantsParCarreau * aireTotale
    const effectifApresSeuil = habitantsParCarreau * aireApresSeuil
    const resultat = nombreClasses + effectifTotal + effectifApresSeuil

    const candidats = [
      nombreClasses * (effectifTotal + effectifApresSeuil),
      nombreClasses * effectifTotal + effectifApresSeuil,
      effectifTotal + effectifApresSeuil,
      nombreClasses + effectifTotal - effectifApresSeuil,
      effectifTotal,
      effectifApresSeuil,
    ].filter((valeur) => valeur > 0 && valeur !== resultat)
    const reponses = [resultat]
    for (const candidat of candidats) {
      if (!reponses.includes(candidat)) reponses.push(candidat)
      if (reponses.length === 4) break
    }
    this.reponses = reponses.map((reponse) => `$${texNombre(reponse, 0)}$`)

    const figure = this.construireHistogramme(
      largeurs,
      hauteurs,
      pasAge,
      habitantsParCarreau,
    )
    this.enonce = `L'histogramme ci-dessous représente la répartition des âges des habitants d'un village des Cévennes.<br>
      ${figure}<br>
      On note $c$ le nombre de classes d'âge, $N$ le nombre total d'habitants du village et $n$ le nombre d'habitants âgés de $${seuil}$ ans ou plus.<br>
      Soit $t=c+N+n$. Alors $t$ est égal à :`

    const calculAireTotale = aires.join('+')
    const calculAireApresSeuil = aires.slice(indiceSeuil).join('+')
    this.correction = `Dans un histogramme, les effectifs sont proportionnels aux aires des rectangles.<br>
      Un carreau représente ici $${habitantsParCarreau}$ habitants.<br><br>
      Il y a $${nombreClasses}$ rectangles, donc $c=${nombreClasses}$.<br><br>
      L'aire totale des rectangles est de $${calculAireTotale}=${aireTotale}$ carreaux.<br>
      Ainsi, $N=${aireTotale}\\times ${habitantsParCarreau}=${texNombre(effectifTotal)}$.<br><br>
      À partir de $${seuil}$ ans, l'aire des rectangles est de $${calculAireApresSeuil}=${aireApresSeuil}$ carreaux.<br>
      Ainsi, $n=${aireApresSeuil}\\times ${habitantsParCarreau}=${texNombre(effectifApresSeuil)}$.<br><br>
      On obtient donc :<br>
      $t=${nombreClasses}+${texNombre(effectifTotal)}+${texNombre(effectifApresSeuil)}=${miseEnEvidence(texNombre(resultat, 0))}$.`
  }

  versionAleatoire: () => void = () => {
    this.appliquerLesValeurs()
  }

  constructor() {
    super()
    this.options.ordered = context.isTypst
    this.versionAleatoire()
  }
}
