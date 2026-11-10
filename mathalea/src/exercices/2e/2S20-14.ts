import {
  diagrammeCirculaire,
  type DiagrammeCirculaire,
} from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  miseEnEvidenceAvecUnite,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Analyser un diagramme semi-circulaire'
export const dateDePublication = '24/08/2026'
export const uuid = '9c7f2'
export const refs = {
  'fr-fr': ['2S20-14', '5D1C-1'],
  'fr-ch': ['9R1FA2B-13', '9R2FA2B-13', '9R3FA2B-13'],
}
export const interactifReady = true

type TypeQuestion = 1 | 2 | 3

const themes = [
  {
    introduction:
      'On a interrogé des élèves sur leur moyen principal de transport pour venir au lycée.',
    labels: ['À pied', 'Vélo', 'Bus', 'Voiture'],
  },
  {
    introduction:
      'On a demandé à des élèves quelle activité ils préféraient pendant une sortie scolaire.',
    labels: ['Musée', 'Atelier', 'Sport', 'Spectacle'],
  },
  {
    introduction:
      'On a relevé la destination choisie par des familles pour une journée de vacances.',
    labels: ['Mer', 'Montagne', 'Ville', 'Campagne'],
  },
  {
    introduction:
      'On a demandé à des élèves quel type de livre ils lisaient le plus souvent.',
    labels: ['Roman', 'BD', 'Documentaire', 'Manga'],
  },
]

const repartitionsAngles = [
  [36, 45, 54, 45],
  [27, 36, 45, 72],
  [18, 45, 54, 63],
  [36, 54, 72, 18],
  [45, 45, 36, 54],
  [27, 63, 36, 54],
]

const effectifsTotaux = [120, 180, 200, 240, 300, 360]

function construitDiagramme(
  angles: number[],
  labels: string[],
  indexAngleMasque?: number,
): string {
  const mesures = angles.map((_, index) => index !== indexAngleMasque)
  const diagramme: DiagrammeCirculaire = diagrammeCirculaire({
    effectifs: angles,
    labels,
    semi: true,
    rayon: 5,
    legendeAffichage: true,
    legendePosition: 'droite',
    mesures,
    visibles: Array(angles.length).fill(true),
    remplissage: Array(angles.length).fill(true),
  })

  return mathalea2d(
    Object.assign(
      {
        display: 'block',
        pixelsParCm: 20,
        scale: 0.65,
      } as const,
      fixeBordures([diagramme], {
        rxmin: 0,
        rymin: 0,
        rxmax: 3,
        rymax: 0,
      }),
    ),
    diagramme,
  )
}

function valeursDistinctes(
  bonneReponse: number,
  candidats: number[],
): (string | number)[] {
  return candidats
    .filter(
      (valeur, index) =>
        valeur > 0 &&
        valeur !== bonneReponse &&
        candidats.findIndex((autre) => autre === valeur) === index,
    )
    .slice(0, 3)
}

function formatPourcentage(valeur: number): string {
  return `$${texNombre(valeur)}\\,\\%$`
}

function formatAngle(valeur: number): string {
  return `$${texNombre(valeur)}^\\circ$`
}

/**
 * Lire et interpréter un diagramme semi-circulaire.
 * @author Jean-Claude Lhote
 */
export default class AnalyserDiagrammeSemiCirculaire extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.versionQcmDisponible = true
    this.versionQcmOptions = { radio: true }
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de question',
      '1 : Trouver un pourcentage à partir d’un angle\n2 : Trouver un effectif à partir d’un angle\n3 : Trouver un angle manquant\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const typeQuestion = this.fromQuestionPlan<TypeQuestion>(
      'types-de-questions',
      (nbQuestions) =>
        gestionnaireFormulaireTexte({
          saisie: this.sup,
          min: 1,
          max: 3,
          defaut: 1,
          melange: 4,
          nbQuestions,
        }) as TypeQuestion[],
    )
    const theme = choice(themes)
    const angles = shuffle(choice(repartitionsAngles))
    const indexCible = randint(0, angles.length - 1)
    const labelCible = theme.labels[indexCible]
    const angleCible = angles[indexCible]
    const total = choice(effectifsTotaux)
    const effectifCible = (angleCible * total) / 180
    const pourcentageCible = (angleCible * 100) / 180
    const diagramme = construitDiagramme(
      angles,
      theme.labels,
      typeQuestion === 3 ? indexCible : undefined,
    )

    this.question = `${theme.introduction}<br>
Le diagramme semi-circulaire ci-dessous représente les résultats obtenus.<br><br>
${diagramme}<br>`

    switch (typeQuestion) {
      case 2: {
        this.question += `L'enquête porte sur $${total}$ personnes. Combien de personnes correspondent à la catégorie «${sp()}${labelCible}${sp()}» ?`
        this.correction = `Le diagramme est semi-circulaire : la somme des angles de ces secteurs circulaires est donc de  $180^\\circ$.<br>
Le secteur «${sp()}${labelCible}${sp()}» mesure $${angleCible}^\\circ$, donc l'effectif correspondant est :<br>
$\\dfrac{${angleCible}}{180}\\times ${total}=${miseEnEvidence(texNombre(effectifCible))}$.`
        this.reponse = effectifCible
        this.distracteurs = valeursDistinctes(effectifCible, [
          (angleCible * total) / 360,
          (angleCible * total) / 200,
          angleCible,
          total - effectifCible,
        ])
        this.optionsChampTexte = {}
        break
      }

      case 3: {
        const sommeAnglesConnus = angles.reduce(
          (somme, angle, index) =>
            index === indexCible ? somme : somme + angle,
          0,
        )
        this.question += `La mesure du secteur «${sp()}${labelCible}${sp()}» n'est pas indiquée. Quelle est cette mesure ?`
        this.correction = `Le diagramme est semi-circulaire : la somme des angles vaut $180^\\circ$.<br>
Les angles indiqués ont pour somme $${sommeAnglesConnus}^\\circ$.<br>
La mesure manquante est donc :<br>
$180-${sommeAnglesConnus}=${miseEnEvidenceAvecUnite(texNombre(angleCible), '^\\circ', this.interactif && !this.versionQcm)}$.`
        const distracteurs = valeursDistinctes(angleCible, [
          360 - sommeAnglesConnus,
          180 - angleCible,
          sommeAnglesConnus,
          180,
        ])
        this.reponse = this.versionQcm ? formatAngle(angleCible) : angleCible
        this.distracteurs = this.versionQcm
          ? distracteurs.map((distracteur) => formatAngle(Number(distracteur)))
          : distracteurs
        this.optionsChampTexte = { texteApres: '$^\\circ$' }
        break
      }

      case 1:
      default: {
        this.question += `Le secteur «${sp()}${labelCible}${sp()}» mesure $${angleCible}^\\circ$. Quelle proportion cela représente-t-il ?`
        this.correction = `Le diagramme est semi-circulaire : il représente donc $180^\\circ$, soit $100\\,\\%$.<br>
La proportion correspondant au secteur «${sp()}${labelCible}${sp()}» est donc :<br>
$\\dfrac{${angleCible}}{180}\\times 100=${miseEnEvidenceAvecUnite(texNombre(pourcentageCible), '\\,\\%', this.interactif && !this.versionQcm)}$.`
        const distracteurs = valeursDistinctes(pourcentageCible, [
          (angleCible * 100) / 360,
          angleCible / 2,
          angleCible,
          100 - pourcentageCible,
        ])
        this.reponse = this.versionQcm
          ? formatPourcentage(pourcentageCible)
          : pourcentageCible
        this.distracteurs = this.versionQcm
          ? distracteurs.map((distracteur) =>
              formatPourcentage(Number(distracteur)),
            )
          : distracteurs
        this.optionsChampTexte = { texteApres: '$\\,\\%$' }
        break
      }
    }
  }
}
