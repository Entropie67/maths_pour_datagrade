import { context } from '../../modules/context'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { prenom } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { deDevant, sp } from '../../lib/outils/outilString'

export const titre = 'Interpréter et comparer deux diagrammes en boîte'
export const dateDePublication = '17/08/2026'
export const uuid = 'ae90a'

export const refs = {
  'fr-fr': ['2S21-2'],
  'fr-ch': [],
}

type ResumeStatistique = {
  min: number
  q1: number
  mediane: number
  q3: number
  max: number
}

function traceDeuxDiagrammes(
  premier: ResumeStatistique,
  second: ResumeStatistique,
  maximumAxe: number,
  pasGraduation: number,
): string {
  const objets: NestedObjetMathalea2dArray = []
  const echelleX = 17 / maximumAxe
  const yPremier = 2.5
  const ySecond = 1

  for (let valeur = 0; valeur <= maximumAxe; valeur += pasGraduation / 2) {
    const x = valeur * echelleX
    const ligneGrille = segment(x, 0.15, x, 3.15, 'gray')
    ligneGrille.opacite = valeur % pasGraduation === 0 ? 0.35 : 0.15
    objets.push(ligneGrille)
  }

  const axe = segment(0, 0.15, 17.5, 0.15, 'black')
  axe.styleExtremites = '->'
  objets.push(axe)
  for (let valeur = 0; valeur <= maximumAxe; valeur += pasGraduation) {
    const x = valeur * echelleX
    objets.push(
      segment(x, 0.05, x, 0.25, 'black'),
      latex2d(texNombre(valeur), x, -0.25, { letterSize: 'scriptsize' }),
    )
  }

  const ajouteDiagramme = (
    resume: ResumeStatistique,
    y: number,
    numero: number,
  ): void => {
    const xMin = resume.min * echelleX
    const xQ1 = resume.q1 * echelleX
    const xMediane = resume.mediane * echelleX
    const xQ3 = resume.q3 * echelleX
    const xMax = resume.max * echelleX
    const demiHauteur = 0.38
    const moustacheMin = segment(
      xMin,
      y - demiHauteur,
      xMin,
      y + demiHauteur,
      bleuMathalea,
    )
    const moustacheMax = segment(
      xMax,
      y - demiHauteur,
      xMax,
      y + demiHauteur,
      bleuMathalea,
    )
    const segmentGauche =
      xMin === xQ1 ? vide2d() : segment(xMin, y, xQ1, y, bleuMathalea)
    const segmentDroit =
      xMax === xQ3 ? vide2d() : segment(xQ3, y, xMax, y, bleuMathalea)
    const mediane = segment(
      xMediane,
      y - demiHauteur,
      xMediane,
      y + demiHauteur,
      bleuMathalea,
    )
    const boite = polygone(
      pointAbstrait(xQ1, y - demiHauteur),
      pointAbstrait(xQ1, y + demiHauteur),
      pointAbstrait(xQ3, y + demiHauteur),
      pointAbstrait(xQ3, y - demiHauteur),
    )
    boite.couleur = bleuMathalea
    boite.epaisseur = 2
    boite.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
    boite.opaciteDeRemplissage = 0.18
    for (const trait of [
      moustacheMin,
      moustacheMax,
      segmentGauche,
      segmentDroit,
      mediane,
    ]) {
      trait.epaisseur = 2
    }
    objets.push(
      boite,
      moustacheMin,
      moustacheMax,
      segmentGauche,
      segmentDroit,
      mediane,
      latex2d(`\\text{Diagramme ${numero}}`, -2, y, {
        letterSize: 'scriptsize',
      }),
    )
  }

  ajouteDiagramme(premier, yPremier, 1)
  ajouteDiagramme(second, ySecond, 2)

  return mathalea2d(
    {
      xmin: -3.3,
      xmax: 17.8,
      ymin: -0.55,
      ymax: 3.25,
      pixelsParCm: 25,
      scale: 0.75,
      center: !context.isHtml,
    },
    objets,
  )
}

function traceRappelBoite(): string {
  const objets: NestedObjetMathalea2dArray = []
  const y = 1.1
  const demiHauteur = 0.4
  const positions = [1, 3, 5, 7, 9]
  const [xMin, xQ1, xMediane, xQ3, xMax] = positions
  const boite = polygone(
    pointAbstrait(xQ1, y - demiHauteur),
    pointAbstrait(xQ1, y + demiHauteur),
    pointAbstrait(xQ3, y + demiHauteur),
    pointAbstrait(xQ3, y - demiHauteur),
  )
  boite.couleur = bleuMathalea
  boite.epaisseur = 2
  boite.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
  boite.opaciteDeRemplissage = 0.18

  const traits = [
    segment(xMin, y - demiHauteur, xMin, y + demiHauteur, bleuMathalea),
    segment(xMin, y, xQ1, y, bleuMathalea),
    segment(xMediane, y - demiHauteur, xMediane, y + demiHauteur, bleuMathalea),
    segment(xQ3, y, xMax, y, bleuMathalea),
    segment(xMax, y - demiHauteur, xMax, y + demiHauteur, bleuMathalea),
  ]
  for (const trait of traits) trait.epaisseur = 2

  objets.push(
    boite,
    ...traits,
    latex2d('\\text{minimum}', xMin, 0.15, { letterSize: 'scriptsize' }),
    latex2d('Q_1', xQ1, 0.15, { letterSize: 'scriptsize' }),
    latex2d('\\text{médiane}', xMediane, 0.15, {
      letterSize: 'scriptsize',
    }),
    latex2d('Q_3', xQ3, 0.15, { letterSize: 'scriptsize' }),
    latex2d('\\text{maximum}', xMax, 0.15, { letterSize: 'scriptsize' }),
  )

  return mathalea2d(
    {
      xmin: -0.3,
      xmax: 10.3,
      ymin: -0.15,
      ymax: 1.7,
      pixelsParCm: 25,
      scale: 0.8,
      center: !context.isHtml,
    },
    objets,
  )
}

type Scenario = {
  villeConcentree: string
  villeReguliere: string
  descriptionConcentree: string
  descriptionReguliere: string
  resumeConcentre: ResumeStatistique
  resumeRegulier: ResumeStatistique
  maximumAxe: number
  pasGraduation: number
}

/**
 * Interpréter deux diagrammes en boîte représentant des précipitations.
 * @author Stéphane Guyon
 */
export default class ComparerPrecipitations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 6
    this.besoinFormulaireNumerique = [
      'Couple de villes',
      6,
      '1 : Marseille et Lyon\n2 : Chennai et Londres\n3 : Perth et Auckland\n4 : Dakar et Bruxelles\n5 : Darwin et Melbourne\n6 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const [prenom1, prenom2] = prenom(2) as string[]
    const scenarios: Scenario[] = [
      {
        villeConcentree: 'Marseille',
        villeReguliere: 'Lyon',
        descriptionConcentree:
          "le climat est méditerranéen : l'été est très sec, les précipitations sont surtout concentrées en automne et en hiver, avec quelques épisodes très intenses",
        descriptionReguliere:
          "le climat est semi-continental : les précipitations sont réparties sur toute l'année et les épisodes extrêmes sont moins marqués",
        resumeConcentre: {
          min: choice([5, 10]),
          q1: 20,
          mediane: choice([45, 50, 55]),
          q3: choice([60, 65]),
          max: choice([95, 100, 105]),
        },
        resumeRegulier: {
          min: choice([50, 55, 60]),
          q1: choice([65, 70, 75]),
          mediane: choice([80, 85]),
          q3: choice([95, 100]),
          max: choice([110, 115, 120]),
        },
        maximumAxe: 130,
        pasGraduation: 10,
      },
      {
        villeConcentree: 'Chennai',
        villeReguliere: 'Londres',
        descriptionConcentree:
          'le climat est tropical à mousson : plusieurs mois sont relativement secs, tandis que les pluies sont très abondantes pendant la mousson, avec des épisodes extrêmes',
        descriptionReguliere:
          "le climat est océanique : les pluies, plus modérées, se répartissent sur toute l'année",
        resumeConcentre: {
          min: 10,
          q1: 20,
          mediane: choice([60, 70]),
          q3: choice([100, 110]),
          max: choice([240, 260, 280]),
        },
        resumeRegulier: {
          min: choice([40, 50]),
          q1: 50,
          mediane: 60,
          q3: 70,
          max: choice([70, 75, 80]),
        },
        maximumAxe: 300,
        pasGraduation: 20,
      },
      {
        villeConcentree: 'Perth',
        villeReguliere: 'Auckland',
        descriptionConcentree:
          "le climat est méditerranéen : les étés sont très secs et les pluies se concentrent principalement pendant l'hiver austral",
        descriptionReguliere:
          "le climat est océanique : les précipitations sont présentes toute l'année et leur répartition mensuelle est plus homogène",
        resumeConcentre: {
          min: 10,
          q1: 20,
          mediane: choice([40, 50]),
          q3: 90,
          max: choice([150, 160]),
        },
        resumeRegulier: {
          min: 70,
          q1: 80,
          mediane: 90,
          q3: 100,
          max: choice([120, 125, 130]),
        },
        maximumAxe: 180,
        pasGraduation: 20,
      },
      {
        villeConcentree: 'Dakar',
        villeReguliere: 'Bruxelles',
        descriptionConcentree:
          "le climat est tropical à saison sèche : les pluies sont presque absentes pendant une grande partie de l'année et se concentrent pendant quelques mois d'été",
        descriptionReguliere:
          "le climat est océanique : les précipitations, modérées, sont réparties tout au long de l'année",
        resumeConcentre: {
          min: 0,
          q1: 0,
          mediane: 5,
          q3: choice([30, 40]),
          max: choice([140, 160]),
        },
        resumeRegulier: {
          min: 50,
          q1: 60,
          mediane: 70,
          q3: 80,
          max: choice([80, 90]),
        },
        maximumAxe: 200,
        pasGraduation: 20,
      },
      {
        villeConcentree: 'Darwin',
        villeReguliere: 'Melbourne',
        descriptionConcentree:
          "le climat est tropical à mousson : l'hiver austral est presque sec, tandis que l'essentiel des pluies tombe pendant la saison humide",
        descriptionReguliere:
          "le climat est océanique tempéré : les précipitations sont moins abondantes et plus régulièrement réparties sur l'année",
        resumeConcentre: {
          min: 0,
          q1: choice([5, 10]),
          mediane: choice([45, 55, 65]),
          q3: choice([200, 225, 250]),
          max: choice([375, 400, 425]),
        },
        resumeRegulier: {
          min: choice([30, 35]),
          q1: choice([40, 45]),
          mediane: choice([50, 55]),
          q3: choice([60, 65]),
          max: choice([75, 80]),
        },
        maximumAxe: 500,
        pasGraduation: 50,
      },
    ]
    const numeroScenario = Number(this.sup)
    const scenario =
      numeroScenario >= 1 && numeroScenario <= scenarios.length
        ? scenarios[numeroScenario - 1]
        : choice(scenarios)
    const resumeConcentre = scenario.resumeConcentre
    const resumeRegulier = scenario.resumeRegulier
    const ordreInverse = choice([true, false])
    const premier = ordreInverse ? resumeRegulier : resumeConcentre
    const second = ordreInverse ? resumeConcentre : resumeRegulier
    const numeroConcentre = ordreInverse ? 2 : 1
    const numeroRegulier = ordreInverse ? 1 : 2
    const seuil = resumeRegulier.q1 + 5
    const etendueConcentree = resumeConcentre.max - resumeConcentre.min
    const etendueReguliere = resumeRegulier.max - resumeRegulier.min
    const eiqConcentre = resumeConcentre.q3 - resumeConcentre.q1
    const eiqRegulier = resumeRegulier.q3 - resumeRegulier.q1
    const villePlusDispersee =
      eiqConcentre > eiqRegulier
        ? scenario.villeConcentree
        : scenario.villeReguliere
    const comparaisonQuartileMediane =
      resumeConcentre.q3 > resumeRegulier.mediane
        ? 'supérieur à'
        : resumeConcentre.q3 < resumeRegulier.mediane
          ? 'inférieur à'
          : 'égal à'
    const figure = traceDeuxDiagrammes(
      premier,
      second,
      scenario.maximumAxe,
      scenario.pasGraduation,
    )
    const rappelBoite = traceRappelBoite()

    createQuestion(this, 0, {
      question: `Les deux diagrammes en boîte ci-dessous représentent les cumuls mensuels des précipitations, en mm, à ${scenario.villeConcentree} et à ${scenario.villeReguliere} au cours d'une année.<br>
    ${figure}<br>
    À ${scenario.villeConcentree}, ${scenario.descriptionConcentree}.<br>
    À ${scenario.villeReguliere}, ${scenario.descriptionReguliere}.`,
      correction: `${rappelBoite}<br>`,
      subQuestions: [
        {
          question: `Quel diagramme en boîte représente la pluviométrie de ${scenario.villeConcentree} ? Justifier.`,
          correction: `D'après l'énoncé, à ${scenario.villeConcentree}, plusieurs mois sont relativement secs, mais les mois pluvieux peuvent recevoir des précipitations nettement plus importantes. On s'attend donc à observer un minimum faible, un maximum élevé et ainsi une étendue importante.<br>
    L'étendue du diagramme $${numeroConcentre}$ vaut $${texNombre(resumeConcentre.max)}-${texNombre(resumeConcentre.min)}=${texNombre(etendueConcentree)}$ mm, contre $${texNombre(resumeRegulier.max)}-${texNombre(resumeRegulier.min)}=${texNombre(etendueReguliere)}$ mm pour l'autre diagramme.<br>
    Il s'agit du ${texteEnCouleurEtGras(`diagramme $\\mathbf{${numeroConcentre}}$`)}.`,
        },
        {
          question: `Estimer l'étendue des précipitations à ${scenario.villeReguliere}. Justifier.`,
          correction: `Sur le diagramme $${numeroRegulier}$, on lit un minimum de $${texNombre(resumeRegulier.min)}$ mm et un maximum de $${texNombre(resumeRegulier.max)}$ mm.<br>
    L'étendue est la différence entre le maximum et le minimum. Elle vaut donc<br>
    $${texNombre(resumeRegulier.max)}-${texNombre(resumeRegulier.min)}=${miseEnEvidence(texNombre(etendueReguliere))}$ mm.`,
        },
        {
          question: `Dans quelle ville l'écart interquartile des précipitations est-il le plus grand ? Justifier.`,
          correction: `L'écart interquartile est la différence $Q_3-Q_1$ ; il correspond à la longueur de la boîte.<br>
    Pour ${scenario.villeConcentree}, il vaut
    $${texNombre(resumeConcentre.q3)}-${texNombre(resumeConcentre.q1)}=${texNombre(eiqConcentre)}$ mm.<br>
    Pour ${scenario.villeReguliere}, il vaut
    $${texNombre(resumeRegulier.q3)}-${texNombre(resumeRegulier.q1)}=${texNombre(eiqRegulier)}$ mm.<br>
    L'écart interquartile est donc ${texteEnCouleurEtGras(`plus grand à ${villePlusDispersee}`)}.`,
        },
        {
          question: `«${sp()}Il y a au moins trois mois dans l'année où le cumul des précipitations est inférieur à $${texNombre(seuil)}$ mm à ${scenario.villeReguliere}${sp()}», affirme ${prenom1}. Cette affirmation est-elle correcte ? Justifier.`,
          correction: `Pour ${scenario.villeReguliere}, on lit $Q_1=${texNombre(resumeRegulier.q1)}$ mm. Par définition du premier quartile, au moins $25\\,\\%$ des valeurs lui sont inférieures ou égales.<br>
    Or $25\\,\\%$ de douze mois représentent $0{,}25\\times12=3$ mois. Au moins trois mois ont donc reçu au plus $${texNombre(resumeRegulier.q1)}$ mm de pluie. Comme $${texNombre(resumeRegulier.q1)}<${texNombre(seuil)}$, ces mois ont reçu moins de $${texNombre(seuil)}$ mm.<br>
    ${texteEnCouleurEtGras(`L'affirmation ${deDevant(prenom1)} est correcte.`)}`,
        },
        {
          question: `${prenom2} compare le troisième quartile des précipitations à ${scenario.villeConcentree} et la médiane des précipitations à ${scenario.villeReguliere}. Estimer ces deux nombres et interpréter ces résultats.`,
          correction: `Le troisième quartile est représenté par le côté droit de la boîte : on lit $Q_3=${texNombre(resumeConcentre.q3)}$ mm à ${scenario.villeConcentree}. La médiane est représentée par le trait situé dans la boîte : on lit $${texNombre(resumeRegulier.mediane)}$ mm à ${scenario.villeReguliere}.<br>
    Le troisième quartile des précipitations à ${scenario.villeConcentree} est donc ${comparaisonQuartileMediane} la médiane des précipitations à ${scenario.villeReguliere}.<br>
    Par définition, au moins $75\\,\\%$ des mois à ${scenario.villeConcentree}, soit au moins neuf mois, ont reçu au plus $${texNombre(resumeConcentre.q3)}$ mm de pluie. Au moins $50\\,\\%$ des mois à ${scenario.villeReguliere}, soit au moins six mois, ont reçu au plus $${texNombre(resumeRegulier.mediane)}$ mm.`,
        },
      ],
    })

    listeQuestionsToContenu(this)
  }
}
