import { context } from '../../modules/context'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Calculer des effectifs et des fréquences cumulés'
export const dateDePublication = '18/08/2026'
export const uuid = 'ce942'

export const refs = {
  'fr-fr': ['2S20-8'],
  'fr-ch': [],
}

type Scenario = {
  introduction: string
  valeurs: number[]
  intituleValeurs: string
  intituleEffectifs: string
  questionEffectif: (seuil: number) => string
  questionProportion: string
  rechercheProportion: string
  interpretationEffectif: (effectif: number, seuil: number) => string
  interpretationProportion: (proportion: number) => string
  seuilEffectif: number
  indicesProportion: number[]
}

const scenarios: Scenario[] = [
  {
    introduction:
      "Une association de réparation d'objets défectueux a relevé le nombre d'objets réparés par chacun de ses membres lors d'un atelier. Les résultats sont regroupés dans le tableau ci-dessous.",
    valeurs: [0, 1, 2, 3, 4, 5],
    intituleValeurs: "Nombre d'objets réparés",
    intituleEffectifs: 'Nombre de membres',
    questionEffectif: (seuil) =>
      `Combien de membres ont réparé au plus $${seuil}$ objets ?`,
    questionProportion:
      'Quelle est la proportion, exprimée en pourcentage, de membres ayant réparé moins de deux objets ?',
    rechercheProportion:
      "Moins de deux objets, cela veut dire au plus un objet.<br>On lit donc l'effectif des membres ayant réparé au plus un objet dans la ligne des E.C.C. pour $1$ objet.",
    interpretationEffectif: (effectif, seuil) =>
      `$${miseEnEvidence(effectif)}$ membres ont réparé au plus $${seuil}$ objets.`,
    interpretationProportion: (proportion) =>
      `$${miseEnEvidence(`${texNombre(proportion)}\\,\\%`)}$ des membres ont réparé moins de deux objets.`,
    seuilEffectif: 3,
    indicesProportion: [0, 1],
  },
  {
    introduction:
      "Une médiathèque a relevé le nombre de livres empruntés par ses abonnés durant l'été. Les résultats sont regroupés dans le tableau ci-dessous.",
    valeurs: [0, 1, 2, 3, 4, 5],
    intituleValeurs: 'Nombre de livres empruntés',
    intituleEffectifs: "Nombre d'abonnés",
    questionEffectif: (seuil) =>
      `Combien d'abonnés ont emprunté au plus $${seuil}$ livres ?`,
    questionProportion:
      "Quelle est la proportion, exprimée en pourcentage, d'abonnés ayant emprunté moins de deux livres ?",
    rechercheProportion:
      "Moins de deux livres, cela veut dire au plus un livre.<br>On lit donc l'effectif des abonnés ayant emprunté au plus un livre dans la ligne des E.C.C. pour $1$ livre.",
    interpretationEffectif: (effectif, seuil) =>
      `$${miseEnEvidence(effectif)}$ abonnés ont emprunté au plus $${seuil}$ livres.`,
    interpretationProportion: (proportion) =>
      `$${miseEnEvidence(`${texNombre(proportion)}\\,\\%`)}$ des abonnés ont emprunté moins de deux livres.`,
    seuilEffectif: 3,
    indicesProportion: [0, 1],
  },
  {
    introduction:
      "Un club sportif a relevé le nombre de séances d'entraînement suivies par ses membres pendant une semaine. Les résultats sont regroupés dans le tableau ci-dessous.",
    valeurs: [0, 1, 2, 3, 4],
    intituleValeurs: "Nombre de séances d'entraînement",
    intituleEffectifs: 'Nombre de membres',
    questionEffectif: (seuil) =>
      `Combien de membres ont suivi au plus $${seuil}$ séances ?`,
    questionProportion:
      'Quelle est la proportion, exprimée en pourcentage, de membres ayant suivi moins de deux séances ?',
    rechercheProportion:
      "Moins de deux séances, cela veut dire au plus une séance.<br>On lit donc l'effectif des membres ayant suivi au plus une séance dans la ligne des E.C.C. pour $1$ séance.",
    interpretationEffectif: (effectif, seuil) =>
      `$${miseEnEvidence(effectif)}$ membres ont suivi au plus $${seuil}$ séances.`,
    interpretationProportion: (proportion) =>
      `$${miseEnEvidence(`${texNombre(proportion)}\\,\\%`)}$ des membres ont suivi moins de deux séances.`,
    seuilEffectif: 2,
    indicesProportion: [0, 1],
  },
]

const distributionsSixValeurs = [
  [2, 4, 8, 12, 8, 6],
  [2, 6, 10, 12, 6, 4],
  [4, 4, 8, 10, 8, 6],
]

const distributionsCinqValeurs = [
  [4, 8, 12, 10, 6],
  [6, 8, 12, 8, 6],
  [4, 10, 12, 8, 6],
]

function construitSchemaEcc(
  scenario: Scenario,
  effectifs: number[],
  effectifsCumules: number[],
): string {
  const objets: NestedObjetMathalea2dArray = []
  const largeurEtiquette = 4.2
  const largeurColonne = 2.1
  const hauteurLigne = 1.2
  const largeur = largeurEtiquette + largeurColonne * scenario.valeurs.length
  const hauteur = 3 * hauteurLigne
  const couleursCalculs = [
    bleuMathalea,
    '#C62828',
    vertMathalea,
    '#7B1FA2',
    '#E65100',
  ]

  for (let ligne = 0; ligne <= 3; ligne++) {
    objets.push(segment(0, ligne * hauteurLigne, largeur, ligne * hauteurLigne))
  }
  objets.push(segment(0, 0, 0, hauteur))
  objets.push(segment(largeurEtiquette, 0, largeurEtiquette, hauteur))
  for (let colonne = 1; colonne <= scenario.valeurs.length; colonne++) {
    const x = largeurEtiquette + colonne * largeurColonne
    objets.push(segment(x, 0, x, hauteur))
  }

  objets.push(
    latex2d('\\textbf{Valeur}', largeurEtiquette / 2, 3, {}),
    latex2d('\\textbf{Effectif}', largeurEtiquette / 2, 1.8, {}),
    latex2d('\\textbf{E.C.C.}', largeurEtiquette / 2, 0.6, {}),
  )
  for (let indice = 0; indice < scenario.valeurs.length; indice++) {
    const x = largeurEtiquette + (indice + 0.5) * largeurColonne
    const couleur =
      couleursCalculs[Math.max(0, indice - 1) % couleursCalculs.length]
    objets.push(
      latex2d(String(scenario.valeurs[indice]), x, 3, {}),
      latex2d(String(effectifs[indice]), x, 1.8, {
        color: couleur,
      }),
      latex2d(String(effectifsCumules[indice]), x, 0.6, {
        color: couleur,
      }),
    )
  }

  for (let indice = 1; indice < scenario.valeurs.length; indice++) {
    const xPrecedent = largeurEtiquette + (indice - 0.5) * largeurColonne
    const xCourant = largeurEtiquette + (indice + 0.5) * largeurColonne
    const couleurCalcul = couleursCalculs[(indice - 1) % couleursCalculs.length]
    const flecheDiagonale = segment(
      xPrecedent + 0.25,
      0.85,
      xCourant - 0.3,
      1.55,
      couleurCalcul,
    )
    const flecheVerticale = segment(xCourant, 1.5, xCourant, 0.9, couleurCalcul)
    flecheDiagonale.styleExtremites = '->'
    flecheVerticale.styleExtremites = '->'
    flecheDiagonale.epaisseur = 2
    flecheVerticale.epaisseur = 2
    objets.push(flecheDiagonale, flecheVerticale)
  }

  return mathalea2d(
    {
      xmin: -0.2,
      xmax: largeur + 0.2,
      ymin: -0.2,
      ymax: hauteur + 0.2,
      pixelsParCm: 25,
      scale: 0.65,
      center: !context.isHtml,
    },
    objets,
  )
}

/**
 * Calculer des effectifs et des fréquences cumulés.
 * @author Stéphane Guyon
 */
export default class EffectifsEtFrequencesCumules extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Scénario',
      4,
      "1 : Objets réparés\n2 : Livres empruntés\n3 : Séances d'entraînement\n4 : Mélange",
    ]
  }

  nouvelleVersion(): void {
    const numeroScenario = Number(this.sup)
    const scenario =
      numeroScenario >= 1 && numeroScenario <= 3
        ? scenarios[numeroScenario - 1]
        : choice(scenarios)
    const effectifs = choice(
      scenario.valeurs.length === 6
        ? distributionsSixValeurs
        : distributionsCinqValeurs,
    )
    const effectifTotal = effectifs.reduce((somme, valeur) => somme + valeur, 0)
    const effectifsCumules: number[] = []
    effectifs.reduce((cumul, valeur) => {
      const nouveauCumul = cumul + valeur
      effectifsCumules.push(nouveauCumul)
      return nouveauCumul
    }, 0)
    const frequences = effectifs.map(
      (effectif) => (100 * effectif) / effectifTotal,
    )
    const frequencesCumulees = effectifsCumules.map(
      (effectif) => (100 * effectif) / effectifTotal,
    )
    const premiereFrequenceDecimale = effectifs[0] / effectifTotal
    const indiceSeuil = scenario.valeurs.indexOf(scenario.seuilEffectif)
    const effectifSousSeuil = effectifsCumules[indiceSeuil]
    const effectifProportion = scenario.indicesProportion.reduce(
      (somme, indice) => somme + effectifs[indice],
      0,
    )
    const indiceProportion = Math.max(...scenario.indicesProportion)
    const proportion = (100 * effectifProportion) / effectifTotal

    const tableauEnonce = tableauColonneLigne(
      [
        `\\text{\\textbf{${scenario.intituleValeurs}}}`,
        ...scenario.valeurs.map(String),
      ],
      [`\\text{\\textbf{${scenario.intituleEffectifs}}}`],
      effectifs,
      1.5,
    )
    const tableauCorrection = tableauColonneLigne(
      [
        `\\text{\\textbf{${scenario.intituleValeurs}}}`,
        ...scenario.valeurs.map(String),
      ],
      [
        `\\text{\\textbf{${scenario.intituleEffectifs}}}`,
        '\\text{\\textbf{E.C.C.}}',
        '\\text{\\textbf{Fréquence (en \\%)}}',
        '\\text{\\textbf{F.C.C. (en \\%)}}',
      ],
      [
        ...effectifs,
        ...effectifsCumules.map((effectif, indice) =>
          indice === indiceSeuil ? miseEnEvidence(effectif) : effectif,
        ),
        ...frequences.map((frequence) => texNombre(frequence)),
        ...frequencesCumulees.map((frequence, indice) =>
          indice === indiceProportion
            ? miseEnEvidence(texNombre(frequence))
            : texNombre(frequence),
        ),
      ],
      1.5,
    )
    const tableauSchemaEcc = construitSchemaEcc(
      scenario,
      effectifs,
      effectifsCumules,
    )

    const questions = createList({
      items: [
        'Recopier et compléter le tableau avec les effectifs cumulés croissants (E.C.C.), les fréquences et les fréquences cumulées croissantes (F.C.C.).',
        scenario.questionEffectif(scenario.seuilEffectif),
        scenario.questionProportion,
      ],
      style: 'nombres',
    })
    const calculs = createList({
      items: [
        `L'effectif total est $N=${effectifs.join('+')}=${effectifTotal}$.<br>Les effectifs cumulés croissants s'obtiennent en additionnant successivement les effectifs. Le premier E.C.C. est le premier effectif, puis on ajoute chaque nouvel effectif au résultat précédent :<br><br>
${tableauSchemaEcc}<br><br>
Une fréquence est le quotient de l'effectif étudié par l'effectif total. Par exemple :<br>
$\\begin{aligned}
\\text{Fréquence}&=\\dfrac{${effectifs[0]}}{${effectifTotal}}=${texNombre(premiereFrequenceDecimale, 3)}\\\\
\\text{Fréquence en pourcentage}&=${texNombre(premiereFrequenceDecimale, 3)}\\times100=${texNombre(frequences[0])}\\,\\%.
\\end{aligned}$<br>
Une fréquence cumulée peut être calculée directement à partir de l'effectif cumulé correspondant.<br><br>${tableauCorrection}`,
        `On lit l'effectif cumulé correspondant à la valeur $${scenario.seuilEffectif}$ : il est égal à $${effectifSousSeuil}$.<br>${scenario.interpretationEffectif(effectifSousSeuil, scenario.seuilEffectif)}`,
        `${scenario.rechercheProportion}<br>Cet effectif est $${effectifProportion}$. Ainsi :<br>$\\dfrac{${effectifProportion}}{${effectifTotal}}\\times100=${texNombre(proportion)}\\,\\%$.<br>On retrouve directement ce résultat dans la ligne des F.C.C.<br>${scenario.interpretationProportion(proportion)}`,
      ],
      style: 'nombres',
    })

    this.listeQuestions[0] = `${scenario.introduction}<br><br>${tableauEnonce}<br>${questions}`
    this.listeCorrections[0] = calculs
    listeQuestionsToContenu(this)
  }
}
