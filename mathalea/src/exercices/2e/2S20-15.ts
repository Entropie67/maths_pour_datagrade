import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer graphiquement l'étendue d'une série représentée par un diagramme cartésien"
export const dateDePublication = '29/08/2026'
export const dateDeModifImportante = '31/08/2026'
export const uuid = 'e7f8e'
export const refs = {
  'fr-fr': ['2S20-15'],
  'fr-ch': [],
}
export const interactifReady = true

type Scenario = {
  introduction: string
  xLegende: string
  yLegende: string
  caractere: string
  caracteresFaux: string[]
  unite: string
  minimum: number
  maximum: number
  abscisses: number[]
  valeursIntermediaires: number[]
  xThickDistance: number
  yThickDistance: number
}

function profilEnValeurs(
  minimum: number,
  maximum: number,
  pas: number,
  profils: number[][],
): number[] {
  const profil = choice(profils)
  const nombreDePas = (maximum - minimum) / pas
  return profil.map(
    (proportion) => minimum + Math.round(proportion * nombreDePas) * pas,
  )
}

function scenarioTemperature(): Scenario {
  const minimum = randint(-5, 8)
  const maximum = minimum + randint(6, 12)
  const valeurs = profilEnValeurs(minimum, maximum, 1, [
    [0.3, 0, 0.25, 0.7, 1, 0.65, 0.35],
    [0.45, 0.15, 0, 0.45, 0.9, 1, 0.55],
    [0.2, 0, 0.4, 1, 0.85, 0.55, 0.3],
    [0.1, 0.25, 0.65, 1, 0.75, 0.4, 0],
    [0.4, 0, 0.15, 0.55, 1, 0.8, 0.45],
  ])
  return {
    introduction:
      "On a relevé la température toutes les quatre heures au cours d'une journée. Le graphique ci-dessous représente les températures obtenues.",
    xLegende: 'Heure',
    yLegende: 'Température (en °C)',
    caractere: 'la température',
    caracteresFaux: ["l'heure du relevé", 'la journée étudiée'],
    unite: '^\\circ\\text{C}',
    minimum,
    maximum,
    abscisses: [0, 4, 8, 12, 16, 20, 24],
    valeursIntermediaires: valeurs,
    xThickDistance: 4,
    yThickDistance: 1,
  }
}

function scenarioAltitude(): Scenario {
  const minimum = randint(4, 7) * 100
  const maximum = minimum + randint(3, 6) * 100
  const valeurs = profilEnValeurs(minimum, maximum, 100, [
    [0, 0.2, 0.55, 1, 0.75, 0.35, 0.1],
    [0.15, 0, 0.35, 0.7, 1, 0.65, 0.25],
    [0, 0.3, 0.75, 0.55, 1, 0.5, 0.15],
    [0.2, 0.55, 1, 0.7, 0.8, 0.35, 0],
    [0, 0.45, 0.3, 0.75, 1, 0.6, 0.2],
  ])
  return {
    introduction:
      "Lors d'une randonnée, on a relevé toutes les heures l'altitude atteinte. Le graphique ci-dessous représente les altitudes obtenues.",
    xLegende: 'Heure',
    yLegende: 'Altitude (en m)',
    caractere: "l'altitude",
    caracteresFaux: ["l'heure du relevé", 'la randonnée'],
    unite: '\\text{m}',
    minimum,
    maximum,
    abscisses: [0, 1, 2, 3, 4, 5, 6],
    valeursIntermediaires: valeurs,
    xThickDistance: 1,
    yThickDistance: 100,
  }
}

function scenarioNiveauEau(): Scenario {
  const minimum = randint(2, 6)
  const maximum = minimum + randint(4, 8)
  const valeurs = profilEnValeurs(minimum, maximum, 1, [
    [0.2, 0, 0.35, 0.85, 1, 0.6, 0.15],
    [0.8, 1, 0.55, 0.1, 0, 0.35, 0.75],
    [0, 0.25, 0.8, 1, 0.7, 0.2, 0.45],
    [1, 0.75, 0.3, 0, 0.2, 0.65, 0.9],
    [0.35, 0.8, 1, 0.55, 0, 0.2, 0.7],
  ])
  return {
    introduction:
      "On a relevé la hauteur d'eau dans un bassin à différents moments de la journée. Le graphique ci-dessous représente les hauteurs obtenues.",
    xLegende: 'Heure',
    yLegende: "Hauteur d'eau (en cm)",
    caractere: "la hauteur d'eau",
    caracteresFaux: ["l'heure du relevé", 'le bassin'],
    unite: '\\text{cm}',
    minimum,
    maximum,
    abscisses: [6, 8, 10, 12, 14, 16, 18],
    valeursIntermediaires: valeurs,
    xThickDistance: 2,
    yThickDistance: 1,
  }
}

function scenarioFrequentation(): Scenario {
  const minimum = randint(2, 5) * 10
  const maximum = minimum + randint(4, 8) * 10
  const valeurs = profilEnValeurs(minimum, maximum, 10, [
    [0, 0.2, 0.75, 1, 0.65, 0.25, 0.4],
    [0.15, 0.5, 1, 0.7, 0.4, 0.2, 0],
    [0, 0.4, 0.8, 0.6, 1, 0.55, 0.25],
    [0.25, 0, 0.45, 1, 0.8, 0.35, 0.15],
    [0, 0.3, 0.9, 0.55, 0.75, 1, 0.4],
  ])
  return {
    introduction:
      'Une médiathèque a compté le nombre de visiteurs présents à différentes heures. Le graphique ci-dessous représente les effectifs obtenus.',
    xLegende: 'Heure',
    yLegende: 'Nombre de visiteurs',
    caractere: 'le nombre de visiteurs',
    caracteresFaux: ["l'heure du relevé", 'la médiathèque'],
    unite: '\\text{visiteurs}',
    minimum,
    maximum,
    abscisses: [10, 11, 12, 13, 14, 15, 16],
    valeursIntermediaires: valeurs,
    xThickDistance: 1,
    yThickDistance: 10,
  }
}

const generateursDeScenarios = [
  scenarioTemperature,
  scenarioAltitude,
  scenarioNiveauEau,
  scenarioFrequentation,
]

/**
 * Lire les valeurs extrêmes d'une série sur un diagramme cartésien et en
 * calculer l'étendue.
 *
 * @author Stéphane Guyon
 */
export default class EtendueRepresentationGraphique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.sup = '5'
    this.besoinFormulaireTexte = [
      'Scénario',
      '1 : Température\n2 : Altitude lors d’une randonnée\n3 : Hauteur d’eau dans un bassin\n4 : Fréquentation d’une médiathèque\n5 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const numerosScenarios = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0; i < this.nbQuestions; i++) {
      const numeroScenario = numerosScenarios[i]
      const genereScenario =
        numeroScenario >= 1 && numeroScenario <= 4
          ? generateursDeScenarios[numeroScenario - 1]
          : choice(generateursDeScenarios)
      const scenario = genereScenario()
      const demandeMinimum = choice([true, false])
      const valeurExtreme = demandeMinimum ? scenario.minimum : scenario.maximum
      const nomValeurExtreme = demandeMinimum ? 'minimum' : 'maximum'
      const etendue = scenario.maximum - scenario.minimum
      const choixCaractere = [
        { label: 'Choisir…', value: '' },
        ...shuffle([scenario.caractere, ...scenario.caracteresFaux]).map(
          (reponse) => ({ label: reponse, value: reponse }),
        ),
      ]
      const xUnite = 9 / (scenario.abscisses.at(-1)! - scenario.abscisses[0])
      const yUnite =
        7 / (scenario.maximum - scenario.minimum + 4 * scenario.yThickDistance)
      const points = scenario.abscisses.map((abscisse, index) =>
        pointAbstrait(
          abscisse * xUnite,
          scenario.valeursIntermediaires[index] * yUnite,
        ),
      )
      const ligneBrisee = polyline(points, bleuMathalea)
      ligneBrisee.epaisseur = 2
      const marques = tracePoint(...points, bleuMathalea)
      marques.style = 'o'
      marques.taille = 4

      const graphique = repere({
        xMin: scenario.abscisses[0],
        xMax: scenario.abscisses.at(-1)!,
        yMin: scenario.minimum - 2 * scenario.yThickDistance,
        yMax: scenario.maximum + 2 * scenario.yThickDistance,
        xUnite,
        yUnite,
        xThickDistance: scenario.xThickDistance,
        xLabelListe: scenario.abscisses,
        yThickDistance: scenario.yThickDistance,
        xLegende: scenario.xLegende,
        xLegendePosition: [
          scenario.abscisses.at(-1)! * xUnite + 0.5,
          Math.max(0, scenario.minimum - 2 * scenario.yThickDistance) * yUnite +
            0.5,
        ],
        yLegende: scenario.yLegende,
        yLegendePosition: [
          scenario.abscisses[0] * xUnite + 0.5,
          (scenario.maximum + 2 * scenario.yThickDistance) * yUnite + 0.5,
        ],
        grilleXDistance: scenario.xThickDistance * xUnite,
        grilleYDistance: scenario.yThickDistance * yUnite,
      })
      const diagramme = mathalea2d(
        Object.assign({}, fixeBordures([graphique, ligneBrisee, marques]), {
          pixelsParCm: 25,
          scale: 0.8,
        }),
        graphique,
        ligneBrisee,
        marques,
      )

      let questions = `a) Quel est le caractère étudié ?<br>
b) Quel est le ${nomValeurExtreme} de cette série ?<br>
c) Quelle est l'étendue de cette série statistique ?`
      if (this.interactif) {
        questions = addMultiMathfield(this, i, {
          dataTemplate: `a) Le caractère étudié est %{champ1}.<br>
b) Le ${nomValeurExtreme} de cette série est %{champ2}.<br>
c) L'étendue de cette série statistique est %{champ3}.`,
          dataOptions: {
            champ1: { choices: choixCaractere },
            champ2: {
              keyboard: KeyboardType.clavierDeBase,
              texteApres: ` $${scenario.unite}$`,
            },
            champ3: {
              keyboard: KeyboardType.clavierNumbers,
              texteApres: ` $${scenario.unite}$`,
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            champ1: { value: scenario.caractere },
            champ2: { value: valeurExtreme },
            champ3: { value: etendue },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      this.listeQuestions[i] =
        `${scenario.introduction}<br><br>${diagramme}<br>${questions}`
      this.listeCorrections[i] =
        `a) Le caractère étudié est ${texteEnCouleurEtGras(scenario.caractere)}.<br>
b) Le ${nomValeurExtreme} de la série est $${miseEnEvidence(`${texNombre(valeurExtreme)}\\,${scenario.unite}`)}$.<br>
c) La plus petite valeur est $${texNombre(scenario.minimum)}\\,${scenario.unite}$ et la plus grande est $${texNombre(scenario.maximum)}\\,${scenario.unite}$. L'étendue est donc :<br>
$${texNombre(scenario.maximum)}-${ecritureParentheseSiNegatif(scenario.minimum)}=${miseEnEvidence(`${texNombre(etendue)}\\,${scenario.unite}`)}$.`
    }
    listeQuestionsToContenu(this)
  }
}
