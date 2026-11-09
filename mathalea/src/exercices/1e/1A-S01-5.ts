import { diagrammeCirculaire, traceBarre } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'bcd5e'
export const refs = {
  'fr-fr': ['1A-S01-5'],
  'fr-ch': ['9R1FA2C-4', '9R2FA2C-4', '9R3FA2C-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Choisir une représentation graphique adaptée'
export const dateDePublication = '20/08/2026'

type Scenario = {
  introduction: string
  tableau: string
  bonneReponse: number
  justification: string
  diagramme: string
}

function construireDiagrammeBarres(
  etiquettes: string[],
  effectifs: number[],
  titreAbscisses: string,
  titreGraphique: string,
  histogramme = false,
): string {
  const objets: NestedObjetMathalea2dArray = []
  const maximum = Math.max(...effectifs)
  const hauteurGraphique = histogramme ? 4.5 : 8
  const uniteY = hauteurGraphique / maximum
  const largeurClasse = histogramme ? 2 : 1
  const axeHorizontal = segment(0, 0, histogramme ? 11 : 6.2, 0, 'black', '->')
  const axeVertical = segment(0, 0, 0, hauteurGraphique + 0.6, 'black', '->')
  objets.push(axeHorizontal, axeVertical)

  effectifs.forEach((effectif, index) => {
    const x = histogramme ? (index + 0.5) * largeurClasse : index + 0.8
    objets.push(
      traceBarre(x, effectif * uniteY, '', {
        epaisseur: histogramme ? largeurClasse : 0.55,
        couleurDeRemplissage: bleuMathalea,
        opaciteDeRemplissage: 0.45,
        angle: 0,
      }),
      latex2d(
        String(effectif),
        x,
        effectif * uniteY + (histogramme ? 0.25 : 0.5),
        {
          letterSize: 'scriptsize',
        },
      ),
      histogramme
        ? latex2d(`\\text{${etiquettes[index]}}`, x, -0.35, {
            letterSize: 'scriptsize',
          })
        : texteParPosition(
            etiquettes[index],
            x,
            0,
            -90,
            'black',
            0.8,
            'gauche',
          ),
    )
  })
  objets.push(
    latex2d(
      `\\textbf{${titreGraphique}}`,
      histogramme ? 5 : 3.1,
      hauteurGraphique + 1.15,
      { letterSize: 'scriptsize' },
    ),
    texteParPosition(
      'Effectif',
      -0.65,
      hauteurGraphique,
      90,
      'black',
      1,
      'milieu',
    ),
    texteParPosition(
      titreAbscisses,
      histogramme ? 8.5 : 3.5,
      histogramme ? -1 : -0.9,
      0,
      'black',
      1,
      'milieu',
    ),
  )

  return mathalea2d(
    {
      ...fixeBordures(objets, {
        rxmin: 0.2,
        rxmax: 0.2,
        rymin: 0.3,
        rymax: 0.2,
      }),
      xmin: histogramme ? -1.6 : -2,
      xmax: histogramme ? 11.5 : 9.5,
      ymin: -1.6,
      ymax: hauteurGraphique + 1.7,
      pixelsParCm: histogramme ? 28 : 24,
      scale: histogramme ? 0.9 : 0.75,
      center: true,
    },
    objets,
  )
}

function construireDiagrammeCirculaire(
  postes: string[],
  frequences: number[],
): string {
  const diagramme = diagrammeCirculaire({
    effectifs: frequences,
    labels: postes,
    rayon: 4,
    legendeAffichage: true,
    legendePosition: 'droite',
    pourcents: Array(frequences.length).fill(true),
    visibles: Array(frequences.length).fill(true),
    remplissage: Array(frequences.length).fill(true),
  })
  const titreGraphique = latex2d(
    '\\textbf{Diagramme circulaire -- budget mensuel}',
    4,
    8.8,
    { letterSize: 'scriptsize' },
  )
  return mathalea2d(
    {
      ...fixeBordures([diagramme, titreGraphique], {
        rxmin: 0.2,
        rxmax: 0.5,
        rymin: 0.2,
        rymax: 0.2,
      }),
      pixelsParCm: 22,
      scale: 0.7,
      center: true,
    },
    [diagramme, titreGraphique],
  )
}

function construireDiagrammeCartesien(
  distances: number[],
  consommations: number[],
): string {
  const objets: NestedObjetMathalea2dArray = []
  const maxDistance = Math.max(...distances)
  const maxConsommation = Math.max(...consommations)
  objets.push(segment(0, 0, 7, 0, 'black', '->'))
  objets.push(segment(0, 0, 0, 5.2, 'black', '->'))

  distances.forEach((distance, index) => {
    const x = (6.4 * distance) / maxDistance
    const y = (4.5 * consommations[index]) / maxConsommation
    const point = tracePoint(pointAbstrait(x, y), bleuMathalea)
    point.style = 'x'
    point.taille = 4
    objets.push(
      point,
      latex2d(String(distance), x, -0.3, { letterSize: 'scriptsize' }),
    )
  })
  for (let valeur = 0; valeur <= maxConsommation; valeur += 2) {
    const y = (4.5 * valeur) / maxConsommation
    objets.push(
      segment(-0.08, y, 0.08, y, 'black'),
      latex2d(String(valeur), -0.35, y, { letterSize: 'scriptsize' }),
    )
  }
  objets.push(
    latex2d(
      '\\textbf{Diagramme cartésien -- consommation et distance}',
      3.2,
      6.4,
      { letterSize: 'scriptsize' },
    ),
    texteParPosition('Distance (en km)', 5.7, -0.8, 0, 'black', 1, 'milieu'),
    latex2d('\\text{Carburant consommé (en L)}', 1.5, 5.45, {
      letterSize: 'scriptsize',
    }),
  )

  return mathalea2d(
    {
      ...fixeBordures(objets, {
        rxmin: 0.2,
        rxmax: 0.2,
        rymin: 0.2,
        rymax: 0.2,
      }),
      xmin: -2.5,
      xmax: 10.5,
      ymin: -1.3,
      ymax: 7,
      pixelsParCm: 25,
      scale: 0.75,
      center: true,
    },
    objets,
  )
}

/**
 * @author Stéphane Guyon
 */
export default class ChoisirRepresentationGraphique extends ExerciceQcmA {
  private scenarioDiagrammeBatons(): Scenario {
    const activites = [
      'Football',
      'Basket-ball',
      'Théâtre',
      'Musique',
      'Échecs',
    ]
    const effectifs = activites.map(() => randint(12, 45))
    const tableau = tableauColonneLigne(
      ['\\text{Activité choisie}', '\\text{Effectif}'],
      activites.map((activite) => `\\text{${activite}}`),
      effectifs,
    )
    return {
      introduction: `On a relevé l'activité extrascolaire principale choisie par des élèves. On souhaite comparer facilement les effectifs des différentes activités.`,
      tableau,
      bonneReponse: 0,
      justification: `Le caractère étudié est qualitatif et l'objectif est de comparer les effectifs de plusieurs catégories. La représentation la plus adaptée est donc ${texteEnCouleurEtGras('un diagramme en bâtons')}.`,
      diagramme: construireDiagrammeBarres(
        activites,
        effectifs,
        'Activité choisie',
        'Diagramme en bâtons -- activités extrascolaires',
      ),
    }
  }

  private scenarioDiagrammeCirculaire(): Scenario {
    const postes = [
      'Logement',
      'Alimentation',
      'Transport',
      'Loisirs',
      'Autres',
    ]
    const frequences = choice([
      [35, 25, 18, 12, 10],
      [40, 22, 16, 14, 8],
      [32, 28, 20, 12, 8],
      [38, 24, 18, 11, 9],
    ])
    const tableau = tableauColonneLigne(
      ['\\text{Poste de dépense}', '\\text{Part du budget (en \\%)}'],
      postes.map((poste) => `\\text{${poste}}`),
      frequences,
    )
    return {
      introduction: `Le tableau donne la répartition du budget mensuel d'un foyer. On souhaite visualiser la part occupée par chaque poste dans le budget total.`,
      tableau,
      bonneReponse: 1,
      justification: `Les fréquences décrivent les parts d'un même total et leur somme vaut $100\\,\\%$. Pour visualiser la répartition de ce total, la représentation la plus adaptée est donc ${texteEnCouleurEtGras('un diagramme circulaire')}.`,
      diagramme: construireDiagrammeCirculaire(postes, frequences),
    }
  }

  private scenarioHistogramme(): Scenario {
    const debut = 10 * randint(0, 2)
    const amplitude = choice([5, 10])
    const classes = Array.from(
      { length: 5 },
      (_, index) =>
        `[${debut + amplitude * index};${debut + amplitude * (index + 1)}[`,
    )
    const effectifs = Array.from({ length: 5 }, () => randint(5, 30))
    const tableau = tableauColonneLigne(
      ['\\text{Durée (en min)}', '\\text{Effectif}'],
      classes,
      effectifs,
    )
    return {
      introduction: `On a mesuré la durée d'un trajet pour plusieurs personnes. Les durées, qui constituent des données continues, ont été regroupées en intervalles.`,
      tableau,
      bonneReponse: 2,
      justification: `La durée est un caractère quantitatif continu et ses valeurs sont regroupées en classes. La représentation la plus adaptée est donc ${texteEnCouleurEtGras('un histogramme')}.`,
      diagramme: construireDiagrammeBarres(
        classes,
        effectifs,
        'Durée (en min)',
        'Histogramme -- durées de trajet',
        true,
      ),
    }
  }

  private scenarioDiagrammeCartesien(): Scenario {
    const pasDistance = choice([20, 25])
    const distances = [1, 2, 3, 4, 5, 6].map((valeur) => valeur * pasDistance)
    const consommations = distances.map((distance) =>
      Math.round(distance * choice([0.06, 0.07, 0.08]) + randint(0, 2)),
    )
    const tableau = tableauColonneLigne(
      [
        '\\text{Trajet}',
        '\\text{A}',
        '\\text{B}',
        '\\text{C}',
        '\\text{D}',
        '\\text{E}',
        '\\text{F}',
      ],
      ['\\text{Distance (en km)}', '\\text{Carburant consommé (en L)}'],
      [...distances, ...consommations],
    )
    return {
      introduction: `Pour six trajets, on a relevé simultanément la distance parcourue et la quantité de carburant consommée. On souhaite étudier graphiquement le lien entre ces deux grandeurs.`,
      tableau,
      bonneReponse: 3,
      justification: `Chaque trajet fournit un couple de valeurs quantitatives : une distance et une consommation. Pour étudier la relation entre deux grandeurs, la représentation la plus adaptée est donc ${texteEnCouleurEtGras('un diagramme cartésien')}.<br>
      Un diagramme en bâtons conviendrait moins bien, car il sert surtout à comparer des catégories ou des effectifs.`,
      diagramme: construireDiagrammeCartesien(distances, consommations),
    }
  }

  private appliquerLesValeurs(numeroScenario: number): void {
    const scenarios = [
      this.scenarioDiagrammeBatons(),
      this.scenarioDiagrammeCirculaire(),
      this.scenarioHistogramme(),
      this.scenarioDiagrammeCartesien(),
    ]
    const scenario = scenarios[numeroScenario]
    const propositions = [
      'Un diagramme en bâtons',
      'Un diagramme circulaire',
      'Un histogramme',
      'Un diagramme cartésien',
    ]
    this.reponses = [
      propositions[scenario.bonneReponse],
      ...propositions.filter((_, index) => index !== scenario.bonneReponse),
    ]
    this.bonnesReponses = undefined

    this.enonce = `${scenario.introduction}<br><br>
      ${scenario.tableau}<br><br>
      Quel diagramme semble être le plus adapté pour représenter ces données ?`
    this.correction = `${scenario.justification}<br><br>
      ${scenario.diagramme}`
  }

  versionAleatoire: () => void = () => {
    this.appliquerLesValeurs(randint(0, 3))
  }

  constructor() {
    super()
    this.options.ordered = context.isTypst
    this.options.vertical = true
    this.versionAleatoire()
  }
}
