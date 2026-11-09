import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer la moyenne d'une série regroupée en classes"
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = 'eae1d'

export const refs = {
  'fr-fr': ['2S20-9'],
  'fr-ch': [],
}

type Scenario = {
  introduction: string
  bornes: number[]
  intituleClasses: string
  intituleEffectifs: string
  question: string
  unite: string
  conclusion: (moyenne: string) => string
}

const scenarios: Scenario[] = [
  {
    introduction:
      'Un centre de sauvegarde de la faune a mesuré la longueur de la carapace de $40$ jeunes tortues. Les résultats sont regroupés en classes de même amplitude dans le tableau ci-dessous.',
    bornes: [20, 30, 40, 50, 60, 70],
    intituleClasses: 'Longueur de la carapace (en cm)',
    intituleEffectifs: 'Nombre de tortues',
    question:
      'Estimer la longueur moyenne de la carapace de ces jeunes tortues.',
    unite: '\\text{cm}',
    conclusion: (moyenne) =>
      `La longueur moyenne de leur carapace est estimée à $${moyenne}~\\text{cm}$. Il s'agit bien d'une estimation puisqu'on ne connaît pas précisément la longueur de la carapace de chaque tortue.`,
  },
  {
    introduction:
      'Une pépinière a mesuré la hauteur de $40$ jeunes plants six semaines après leur mise en terre. Les résultats sont regroupés en classes de même amplitude dans le tableau ci-dessous.',
    bornes: [10, 20, 30, 40, 50, 60],
    intituleClasses: 'Hauteur (en cm)',
    intituleEffectifs: 'Nombre de plants',
    question: 'Estimer la hauteur moyenne de ces jeunes plants.',
    unite: '\\text{cm}',
    conclusion: (moyenne) =>
      `La hauteur moyenne des jeunes plants est estimée à $${moyenne}~\\text{cm}$. Il s'agit bien d'une estimation puisqu'on ne connaît pas précisément la hauteur de chaque plant.`,
  },
  {
    introduction:
      "Une exploitation maraîchère a pesé $40$ tomates d'une même variété au moment de la récolte. Les résultats sont regroupés en classes de même amplitude dans le tableau ci-dessous.",
    bornes: [80, 100, 120, 140, 160, 180],
    intituleClasses: 'Masse (en g)',
    intituleEffectifs: 'Nombre de tomates',
    question: 'Estimer la masse moyenne de ces tomates.',
    unite: '\\text{g}',
    conclusion: (moyenne) =>
      `La masse moyenne des tomates est estimée à $${moyenne}~\\text{g}$. Il s'agit bien d'une estimation puisqu'on ne connaît pas précisément la masse de chaque tomate.`,
  },
]

const distributions = [
  [2, 6, 12, 14, 6],
  [4, 8, 14, 10, 4],
  [2, 8, 16, 10, 4],
]

function ecritureClasse(borneInferieure: number, borneSuperieure: number) {
  return `\\left[${borneInferieure}\\,;\\,${borneSuperieure}\\right[`
}

/**
 * Calculer une moyenne à partir d'une série regroupée en classes de même amplitude.
 * @author Stéphane Guyon
 */
export default class MoyenneSerieRegroupeeEnClasses extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Scénario',
      4,
      '1 : Taille de tortues\n2 : Hauteur de jeunes plants\n3 : Masse de tomates\n4 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const numeroScenario = Number(this.sup)
    const scenario =
      numeroScenario >= 1 && numeroScenario <= 3
        ? scenarios[numeroScenario - 1]
        : choice(scenarios)
    const effectifs = choice(distributions)
    const centres = scenario.bornes
      .slice(0, -1)
      .map((borne, indice) => (borne + scenario.bornes[indice + 1]) / 2)
    const produits = centres.map((centre, indice) => centre * effectifs[indice])
    const effectifTotal = effectifs.reduce(
      (somme, effectif) => somme + effectif,
      0,
    )
    const sommeProduits = produits.reduce(
      (somme, produit) => somme + produit,
      0,
    )
    const moyenne = sommeProduits / effectifTotal
    const moyenneTex = texNombre(moyenne, 2)
    const classes = scenario.bornes
      .slice(0, -1)
      .map((borne, indice) =>
        ecritureClasse(borne, scenario.bornes[indice + 1]),
      )

    const tableauEnonce = tableauColonneLigne(
      [`\\text{\\textbf{${scenario.intituleClasses}}}`, ...classes],
      [`\\text{\\textbf{${scenario.intituleEffectifs}}}`],
      effectifs,
      1.8,
    )
    const tableauCorrection = tableauColonneLigne(
      [`\\text{\\textbf{${scenario.intituleClasses}}}`, ...classes],
      [
        `\\text{\\textbf{${scenario.intituleEffectifs}}}`,
        '\\text{\\textbf{Centre de la classe}}',
      ],
      [...effectifs, ...centres],
      1.8,
    )

    let question = `${scenario.introduction}<br><br>${tableauEnonce}<br>`
    if (this.interactif) {
      question += `La moyenne estimée est ${ajouteChampTexteMathLive(
        this,
        0,
        KeyboardType.clavierDeBase,
        { texteApres: `$~${scenario.unite}$` },
      )}`
    } else {
      question += scenario.question
    }
    handleAnswers(this, 0, {
      reponse: { value: String(moyenne) },
    })
    this.listeQuestions[0] = question
    this.listeCorrections[0] = `Pour estimer la moyenne d'une série regroupée en classes, on calcule les centres de classes.<br>Le centre d'une classe est la moyenne de ses deux bornes.<br>Par exemple :<br>
Le centre de la première classe est $\\dfrac{${scenario.bornes[0]}+${scenario.bornes[1]}}{2}=${centres[0]}$.<br><br>
On complète alors le tableau :<br><br>
${tableauCorrection}<br>
L'effectif total est $N=${effectifs.map((effectif) => texNombre(effectif, 0)).join('+')}=${texNombre(effectifTotal, 0)}$.<br>
On calcule une moyenne pondérée en prenant comme valeurs les centres des classes.<br>
La moyenne est donc :<br>
$\\begin{aligned}
\\overline{x}&=\\dfrac{${effectifs.map((effectif, indice) => `${texNombre(effectif, 0)}\\times${texNombre(centres[indice])}`).join('+')}}{${texNombre(effectifTotal, 0)}}\\\\
&=\\dfrac{${produits.map((produit) => texNombre(produit)).join('+')}}{${texNombre(effectifTotal, 0)}}\\\\
&=\\dfrac{${texNombre(sommeProduits)}}{${texNombre(effectifTotal, 0)}}\\\\
&=${miseEnEvidence(moyenneTex)}.
\\end{aligned}$<br>
${scenario.conclusion(miseEnEvidence(moyenneTex))}`

    listeQuestionsToContenu(this)
  }
}
