import { traceBarre } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  'Construire un diagramme en bâtons et déterminer des indicateurs statistiques'
export const dateDePublication = '18/08/2026'
export const uuid = 'd7e4b'

export const refs = {
  'fr-fr': ['2S20-6'],
  'fr-ch': [],
}

type Scenario = {
  introduction: string
  valeurs: number[]
  titreValeurs: string
  titreEffectifs: string
  uniteAbscisses: string
  individus: string
  caractere: string
}

const scenarios: Scenario[] = [
  {
    introduction:
      "Une enquête a été réalisée sur le nombre d'occupants par véhicule lors du passage à un péage d'autoroute.",
    valeurs: [1, 2, 3, 4, 5],
    titreValeurs: "Nombre d'occupants",
    titreEffectifs: 'Nombre de véhicules',
    uniteAbscisses: "Nombre d'occupants par véhicule",
    individus: 'véhicules',
    caractere: "le nombre d'occupants par véhicule",
  },
  {
    introduction:
      'Une enquête a été réalisée auprès des élèves d’un lycée sur le nombre de livres lus durant l’été.',
    valeurs: [0, 1, 2, 3, 4],
    titreValeurs: "Nombre de livres lus durant l'été",
    titreEffectifs: "Nombre d'élèves",
    uniteAbscisses: "Nombre de livres lus durant l'été",
    individus: 'élèves',
    caractere: "le nombre de livres lus durant l'été",
  },
  {
    introduction:
      "Une enquête a été réalisée auprès des membres d'un club sur le nombre de séances de sport pratiquées pendant une semaine.",
    valeurs: [0, 1, 2, 3, 4],
    titreValeurs: 'Nombre de séances',
    titreEffectifs: 'Nombre de membres',
    uniteAbscisses: 'Nombre de séances dans la semaine',
    individus: 'membres du club',
    caractere: 'le nombre de séances pratiquées pendant la semaine',
  },
]

const repartitions = [
  [4, 7, 3, 4, 2],
  [3, 8, 3, 4, 2],
  [4, 8, 2, 3, 3],
  [2, 4, 3, 6, 5],
  [3, 3, 3, 7, 4],
  [2, 3, 4, 7, 4],
]

function valeurAuRang(
  rang: number,
  valeurs: number[],
  effectifsCumules: number[],
): number {
  const indice = effectifsCumules.findIndex((effectif) => effectif >= rang)
  return valeurs[indice]
}

function construitDiagramme(scenario: Scenario, effectifs: number[]): string {
  const objets: NestedObjetMathalea2dArray = []
  const maximumEnCentaines = Math.ceil(Math.max(...effectifs) / 100)
  const axeHorizontal = segment(0, 0, 6.2, 0, 'black')
  const axeVertical = segment(0, 0, 0, maximumEnCentaines + 0.8, 'black')
  axeHorizontal.styleExtremites = '->'
  axeVertical.styleExtremites = '->'
  objets.push(axeHorizontal, axeVertical)

  for (let centaine = 0; centaine <= maximumEnCentaines; centaine++) {
    objets.push(
      segment(-0.1, centaine, 0.1, centaine, 'black'),
      latex2d(texNombre(100 * centaine), -0.45, centaine, {
        letterSize: 'scriptsize',
      }),
    )
    if (centaine > 0) {
      const ligneGuide = segment(0, centaine, 5.7, centaine, 'gray')
      ligneGuide.opacite = 0.18
      objets.push(ligneGuide)
    }
  }

  for (let indice = 0; indice < effectifs.length; indice++) {
    const x = indice + 1
    const hauteur = effectifs[indice] / 100
    objets.push(
      traceBarre(x, hauteur, texNombre(scenario.valeurs[indice], 0), {
        epaisseur: 0.45,
        couleurDeRemplissage: bleuMathalea,
        opaciteDeRemplissage: 0.35,
        angle: 0,
      }),
      latex2d(texNombre(effectifs[indice]), x, hauteur + 0.35, {
        letterSize: 'scriptsize',
      }),
    )
  }
  const titreHorizontal = texteParPosition(
    scenario.uniteAbscisses,
    3,
    -0.85,
    0,
    'black',
    1,
    'milieu',
  )
  const titreVertical = texteParPosition(
    scenario.titreEffectifs,
    -1.25,
    (maximumEnCentaines + 0.8) / 2,
    90,
    'black',
    1,
    'milieu',
  )
  objets.push(titreHorizontal, titreVertical)

  return mathalea2d(
    {
      ...fixeBordures(objets, {
        rxmin: -0.4,
        rxmax: 0.4,
        rymin: -0.4,
        rymax: 0.5,
      }),
      pixelsParCm: 25,
      scale: 0.7,
      center: true,
    },
    objets,
  )
}

function construitSchemaQuartiles(
  effectifTotal: number,
  q1: number,
  mediane: number,
  q3: number,
): string {
  const objets: NestedObjetMathalea2dArray = []
  const yAxe = 2.2
  const longueur = 12
  const axe = segment(0, yAxe, longueur + 0.4, yAxe, 'black')
  axe.styleExtremites = '->'
  objets.push(axe)

  const reperes = [
    {
      x: 3,
      indicateur: `Q_1=${q1}`,
      rang: `\\text{rang }${texNombre(effectifTotal / 4)}`,
    },
    {
      x: 6,
      indicateur: `\\operatorname{Med}=${texNombre(mediane)}`,
      rang: `\\text{rangs }${texNombre(effectifTotal / 2)}\\text{ et }${texNombre(effectifTotal / 2 + 1)}`,
    },
    {
      x: 9,
      indicateur: `Q_3=${q3}`,
      rang: `\\text{rang }${texNombre((3 * effectifTotal) / 4)}`,
    },
  ]

  for (const repere of reperes) {
    objets.push(
      segment(repere.x, yAxe - 0.15, repere.x, yAxe + 0.25, 'black'),
      latex2d(repere.indicateur, repere.x, 3.25, {
        letterSize: 'small',
      }),
      latex2d(repere.rang, repere.x, 2.75, {
        letterSize: 'scriptsize',
      }),
    )
  }

  objets.push(
    latex2d('\\text{rang }1', 0, 2.65, { letterSize: 'scriptsize' }),
    latex2d(`\\text{rang }${texNombre(effectifTotal)}`, longueur, 2.65, {
      letterSize: 'scriptsize',
    }),
  )

  for (let quart = 0; quart < 4; quart++) {
    const debut = 3 * quart
    const fin = debut + 3
    const milieu = (debut + fin) / 2
    const accolade = polyline(
      pointAbstrait(debut, 1.65),
      pointAbstrait(debut + 0.15, 1.65),
      pointAbstrait(debut + 0.3, 1.4),
      pointAbstrait(milieu - 0.2, 1.35),
      pointAbstrait(milieu, 1.1),
      pointAbstrait(milieu + 0.2, 1.35),
      pointAbstrait(fin - 0.3, 1.4),
      pointAbstrait(fin - 0.15, 1.65),
      pointAbstrait(fin, 1.65),
    )
    accolade.epaisseur = 1.2
    objets.push(
      accolade,
      latex2d('25\\,\\%', milieu, 0.75, { letterSize: 'scriptsize' }),
    )
  }

  return mathalea2d(
    {
      xmin: -0.8,
      xmax: 12.9,
      ymin: 0.35,
      ymax: 3.65,
      pixelsParCm: 25,
      scale: 0.72,
      center: true,
    },
    objets,
  )
}

/**
 * Construire un diagramme en bâtons, puis déterminer et interpréter les
 * quartiles et la médiane d'une série statistique discrète.
 * @author Stéphane Guyon
 */
export default class DiagrammeBatonsEtQuartiles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Scénario',
      4,
      '1 : Nombre de livres lus\n2 : Nombre de passagers par véhicule\n3 : Nombre de séances d’entraînement\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const numeroScenario = Number(this.sup)
    const scenario =
      numeroScenario === 1
        ? scenarios[1]
        : numeroScenario === 2
          ? scenarios[0]
          : numeroScenario === 3
            ? scenarios[2]
            : choice(scenarios)
    const effectifTotal = choice([1600, 2000, 2400])
    const coefficient = effectifTotal / 20
    const effectifs = choice(repartitions).map(
      (proportion) => proportion * coefficient,
    )
    const effectifsCumules: number[] = []
    effectifs.reduce((cumul, effectif) => {
      const nouveauCumul = cumul + effectif
      effectifsCumules.push(nouveauCumul)
      return nouveauCumul
    }, 0)

    const rangQ1 = effectifTotal / 4
    const rangMedian1 = effectifTotal / 2
    const rangMedian2 = rangMedian1 + 1
    const rangQ3 = (3 * effectifTotal) / 4
    const q1 = valeurAuRang(rangQ1, scenario.valeurs, effectifsCumules)
    const mediane1 = valeurAuRang(
      rangMedian1,
      scenario.valeurs,
      effectifsCumules,
    )
    const mediane2 = valeurAuRang(
      rangMedian2,
      scenario.valeurs,
      effectifsCumules,
    )
    const mediane = (mediane1 + mediane2) / 2
    const q3 = valeurAuRang(rangQ3, scenario.valeurs, effectifsCumules)

    const tableau = tableauColonneLigne(
      [
        `\\text{\\textbf{${scenario.titreValeurs}}}`,
        ...scenario.valeurs.map((x) => texNombre(x, 0)),
      ],
      [`\\text{\\textbf{${scenario.titreEffectifs}}}`],
      effectifs.map((x) => texNombre(x, 0)),
      1.5,
    )
    const tableauCumule = tableauColonneLigne(
      [
        `\\text{\\textbf{${scenario.titreValeurs}}}`,
        ...scenario.valeurs.map((x) => texNombre(x, 0)),
      ],
      ['\\text{\\textbf{Effectifs cumulés croissants}}'],
      effectifsCumules.map((x) => texNombre(x, 0)),
      1.5,
    )
    const diagramme = construitDiagramme(scenario, effectifs)
    const schemaQuartiles = construitSchemaQuartiles(
      effectifTotal,
      q1,
      mediane,
      q3,
    )
    const calculsParametres = createList({
      items: [
        `Le premier quartile est la valeur de rang $\\dfrac{${texNombre(effectifTotal)}}{4}=${rangQ1}$. D'après les effectifs cumulés, $${miseEnEvidence(`Q_1=${q1}`)}$.`,
        `Comme l'effectif total $${texNombre(effectifTotal)}$ est pair, la médiane est une valeur comprise entre la $${texNombre(rangMedian1)}^{\\text{e}}$ valeur et la $${texNombre(rangMedian2)}^{\\text{e}}$ valeur de la série ordonnée. Ces deux valeurs sont toutes les deux égales à $${mediane}$, donc $${miseEnEvidence(`\\operatorname{Med}=${texNombre(mediane)}`)}$.`,
        `Le troisième quartile est la valeur de rang $\\dfrac{3\\times${texNombre(effectifTotal)}}{4}=${texNombre(rangQ3)}$. D'après les effectifs cumulés, $${miseEnEvidence(`Q_3=${q3}`)}$.`,
      ],
      style: 'fleches',
    })
    const interpretations = createList({
      items: [
        `Pour au moins $25\\,\\%$ des ${scenario.individus}, ${scenario.caractere} est inférieur ou égal à $${q1}$.`,
        `Pour au moins la moitié des ${scenario.individus}, ${scenario.caractere} est inférieur ou égal à $${texNombre(mediane)}$ et, pour au moins la moitié, il est supérieur ou égal à $${texNombre(mediane)}$.`,
        `Pour au moins $75\\,\\%$ des ${scenario.individus}, ${scenario.caractere} est inférieur ou égal à $${q3}$.`,
      ],
      style: 'fleches',
    })
    const organisationCorrection = createList({
      items: [
        `<b>Calcul des paramètres</b><br>
L'effectif total est :<br>
$${effectifs.map((effectif) => texNombre(effectif)).join('+')}=${texNombre(effectifTotal)}$.<br>
Pour repérer les rangs des quartiles et de la médiane, on calcule les effectifs cumulés croissants :<br><br>
${tableauCumule}<br>
${calculsParametres}`,
        `<b>Schéma explicatif</b><br>${schemaQuartiles}`,
        `<b>Interprétations</b><br>${interpretations}`,
      ],
      style: 'fleches',
    })

    this.listeQuestions[0] = `${scenario.introduction}<br>
Les résultats de cette enquête sont consignés dans le tableau suivant :<br><br>
${tableau}<br>
1. Construire un diagramme en bâtons représentant cette étude.<br><br>
2. Déterminer la médiane, le premier quartile et le troisième quartile de cette série statistique. Interpréter ces valeurs.`

    this.listeCorrections[0] = `<b>1.</b> Sur l'axe horizontal, on place les différentes valeurs du caractère étudié. La hauteur de chaque bâton est égale à l'effectif correspondant.<br>
${diagramme}<br>
<b>2.</b><br>
${organisationCorrection}`

    listeQuestionsToContenu(this)
  }
}
