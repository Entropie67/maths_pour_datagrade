import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { spline, type NoeudSpline } from '../../lib/mathFonctions/Spline'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenom } from '../../lib/outils/Personne'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'cea09'
export const refs = {
  'fr-fr': ['3AutoP04'],
  'fr-ch': ['10CTGM4B-12', '10LCGM4B-12', '10LSGM4B-12', 'PRQMG04E-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Lire une durée sur un graphique'
export const dateDePublication = '11/08/2026'

const cosDeg = (x: number) => Math.cos((x * Math.PI) / 180)

const formatDuree = (dureeEnDemiHeures: number) => {
  const heures = Math.floor(dureeEnDemiHeures / 2)
  const minutes = dureeEnDemiHeures % 2 === 0 ? 0 : 30
  return minutes === 0
    ? `${heures}\\text{ h}`
    : `${heures}\\text{ h }${minutes}\\text{ min}`
}

const formatHeure = (heureEnDemiHeures: number) => {
  const heures = Math.floor(heureEnDemiHeures / 2)
  const minutes = heureEnDemiHeures % 2 === 0 ? '' : ' 30'
  return `${heures} h${minutes}`
}

const noeudsSplineMaree = (
  heureDebut: number,
  heureFin: number,
  hauteurMax: number,
): NoeudSpline[] => {
  if (
    !Number.isFinite(heureDebut) ||
    !Number.isFinite(heureFin) ||
    heureDebut <= 13 ||
    heureFin >= 20 ||
    heureDebut >= heureFin
  ) {
    throw Error(
      `Noeuds de spline invalides pour la marée : début ${heureDebut}, fin ${heureFin}.`,
    )
  }

  return [
    {
      x: 13,
      y: Math.max(2.4, 4 - 0.55 * (heureDebut - 13)),
      deriveeGauche: 0.2,
      deriveeDroit: 0.2,
      isVisible: false,
    },
    {
      x: heureDebut,
      y: 4,
      deriveeGauche: 0.8,
      deriveeDroit: 0.8,
      isVisible: false,
    },
    {
      x: (heureDebut + heureFin) / 2,
      y: hauteurMax,
      deriveeGauche: 0,
      deriveeDroit: 0,
      isVisible: false,
    },
    {
      x: heureFin,
      y: 4,
      deriveeGauche: -0.8,
      deriveeDroit: -0.8,
      isVisible: false,
    },
    {
      x: 20,
      y: Math.max(2.4, 4 - 0.55 * (20 - heureFin)),
      deriveeGauche: -0.2,
      deriveeDroit: -0.2,
      isVisible: false,
    },
  ]
}

const graphiqueMaree = (
  heureDebut?: number,
  heureFin?: number,
  hauteurMax = 4.8,
) => {
  const r = repere({
    xMin: 12.5,
    xMax: 20,
    yMin: 2,
    yMax: 5,
    xUnite: 1,
    yUnite: 1,
    xLabelMin: 13,
    xLabelMax: 20,
    yLabelMin: 2,
    yLabelMax: 5,
    xThickDistance: 1,
    xThickMin: 13,
    xThickMax: 20,
    yThickDistance: 1,
    yThickMin: 2,
    yThickMax: 5,
    grilleXDistance: 1,
    grilleXMin: 13,
    grilleXMax: 20,
    grilleYDistance: 1,
    grilleYMin: 2,
    grilleYMax: 5,
    grilleSecondaire: true,
    grilleSecondaireXDistance: 0.5,
    grilleSecondaireYDistance: 0.5,
  })
  const courbes =
    heureDebut == null || heureFin == null
      ? [
          courbe((x) => 2.4 + 2.45 * cosDeg((x - 17) * 20), {
            repere: r,
            xMin: 13,
            xMax: 17,
            yMin: 2,
            yMax: 5,
            color: 'red',
            epaisseur: 2,
            step: 0.05,
          }),
          courbe((x) => 2.6 + 2.25 * cosDeg((x - 17) * 25.5), {
            repere: r,
            xMin: 17,
            xMax: 20,
            yMin: 2,
            yMax: 5,
            color: 'red',
            epaisseur: 2,
            step: 0.05,
          }),
        ]
      : [
          spline(noeudsSplineMaree(heureDebut, heureFin, hauteurMax)).courbe({
            color: 'red',
            epaisseur: 2,
            ajouteNoeuds: false,
          }),
        ]
  const objets = [
    r,
    ...courbes,

    texteParPosition('Heure (en h)', 20.1, 1.75, 0, 'black', 0.4, 'droite'),
    texteParPosition(
      "Hauteur d'eau (en m)",
      12.2,
      5.1,
      0,
      'black',
      0.4,
      'gauche',
    ),
  ]
  return mathalea2d(
    {
      xmin: 12,
      xmax: 20.4,
      ymin: 1.5,
      ymax: 5.6,
      scale: 0.65,
      pixelsParCm: 30,
    },
    objets,
  )
}

const distracteursDuree = (duree: number) => {
  const candidats = shuffle([
    duree - 2,
    duree - 1,
    duree + 1,
    duree + 2,
    duree + 3,
    duree + 4,
  ])
    .filter((valeur) => valeur >= 2 && valeur <= 14 && valeur !== duree)
    .slice(0, 3)
  return candidats.map((valeur) => `$${formatDuree(valeur)}$`)
}

/**
 * DNB Centres étrangers juin 2026 - Question 9
 * @author Jean-Claude Lhote
 */
export default class AutoQ9CentresEtrangersBrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(heureDebut?: number, heureFin?: number): void {
    const officiel = heureDebut == null || heureFin == null
    const duree = officiel ? 9 : 2 * (heureFin - heureDebut)
    const quidam = prenom()
    this.enonce = `Le graphique suivant donne la hauteur d'eau ${officiel ? 'dans le port de Quiberon le 23 juillet 2025' : `dans le port où ${quidam} passe ses vacances`}.<br>
${graphiqueMaree(heureDebut, heureFin)}<br>
Avec la précision permise par le graphique, recopier la durée pendant laquelle la hauteur d'eau dans le port a été supérieure à $4\\text{ m}$.`
    this.reponses = [
      `$${formatDuree(duree)}$`,
      ...(officiel
        ? [
            '$2\\text{ h }30\\text{ min}$',
            '$5\\text{ h }30\\text{ min}$',
            '$7\\text{ h}$',
          ]
        : distracteursDuree(duree)),
    ]
    this.correction = officiel
      ? `On lit graphiquement que la hauteur d'eau dépasse $4\\text{ m}$ environ de $14\\text{ h }45\\text{ min}$ à $19\\text{ h }15\\text{ min}$.<br>
La durée correspondante est donc environ $${miseEnEvidence('4\\text{ h }30\\text{ min}')}$.`
      : `On lit graphiquement que la hauteur d'eau dépasse $4\\text{ m}$ environ de $${formatHeure(2 * heureDebut).replace(' h', '\\text{ h}')}$ à $${formatHeure(2 * heureFin).replace(' h', '\\text{ h}')}$.<br>
La durée correspondante est donc $${miseEnEvidence(formatDuree(duree))}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs()
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const debutEnDemiHeures = randint(27, 31)
    const dureeEnDemiHeures = randint(5, Math.min(11, 39 - debutEnDemiHeures))
    const finEnDemiHeures = debutEnDemiHeures + dureeEnDemiHeures
    this.appliquerLesValeurs(debutEnDemiHeures / 2, finEnDemiHeures / 2)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
