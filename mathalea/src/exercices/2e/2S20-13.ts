import {
  DiagrammeCirculaire,
  diagrammeCirculaire,
} from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Passer d'un pourcentage à un angle dans un diagramme circulaire"
export const dateDePublication = '22/08/2026'
export const uuid = 'a4f3c'
export const interactifReady = true

export const refs = {
  'fr-fr': ['2S20-13'],
  'fr-ch': ['10CTFA2B-4', '10LCFA2B-4', '10LSFA2B-4'],
}

type Constituant = {
  nom: string
  pourcentage: number
}

type Alliage = {
  nom: string
  description: string
  compositions: Constituant[][]
}

// Les normes donnent souvent des intervalles de composition. Les valeurs
// ci-dessous sont des compositions massiques simplifiées et représentatives.
const alliages: Alliage[] = [
  {
    nom: 'acier inoxydable 18/8',
    description: `L'acier inoxydable 18/8 contient principalement du fer, avec environ $18\\,\\%$ de chrome et $8\\,\\%$ de nickel.`,
    compositions: [
      [
        { nom: 'fer', pourcentage: 72 },
        { nom: 'chrome', pourcentage: 18 },
        { nom: 'nickel', pourcentage: 8 },
        { nom: 'autres éléments', pourcentage: 2 },
      ],
      [
        { nom: 'fer', pourcentage: 71 },
        { nom: 'chrome', pourcentage: 18 },
        { nom: 'nickel', pourcentage: 8 },
        { nom: 'manganèse', pourcentage: 2 },
        { nom: 'autres éléments', pourcentage: 1 },
      ],
    ],
  },
  {
    nom: 'laiton C260',
    description: 'Le laiton C260 est constitué de cuivre et de zinc.',
    compositions: [
      [
        { nom: 'cuivre', pourcentage: 70 },
        { nom: 'zinc', pourcentage: 30 },
      ],
    ],
  },
  {
    nom: 'cupronickel 70/30',
    description:
      'Le cupronickel 70/30 est un alliage de cuivre et de nickel notamment utilisé en milieu marin.',
    compositions: [
      [
        { nom: 'cuivre', pourcentage: 70 },
        { nom: 'nickel', pourcentage: 30 },
      ],
    ],
  },
  {
    nom: 'alliage de titane Ti-6Al-4V',
    description: `L'alliage Ti-6Al-4V contient, en composition simplifiée, $6\\,\\%$ d'aluminium et $4\\,\\%$ de vanadium, le reste étant du titane.`,
    compositions: [
      [
        { nom: 'titane', pourcentage: 90 },
        { nom: 'aluminium', pourcentage: 6 },
        { nom: 'vanadium', pourcentage: 4 },
      ],
    ],
  },
  {
    nom: "alliage d'aluminium 2024",
    description:
      "L'alliage 2024 est un alliage d'aluminium contenant principalement du cuivre, du magnésium et du manganèse.",
    compositions: [
      [
        { nom: 'aluminium', pourcentage: 94 },
        { nom: 'cuivre', pourcentage: 4 },
        { nom: 'magnésium', pourcentage: 1.5 },
        { nom: 'manganèse', pourcentage: 0.5 },
      ],
    ],
  },
]

function avecArticleDefini({ nom }: Constituant): string {
  if (nom === 'autres éléments') return 'les autres éléments'
  if (nom === 'aluminium') return "l'aluminium"
  return `le ${nom}`
}

function avecDeEtArticleDefini({ nom }: Constituant): string {
  if (nom === 'autres éléments') return 'des autres éléments'
  if (nom === 'aluminium') return "de l'aluminium"
  return `du ${nom}`
}

function construitDiagramme(composition: Constituant[]): string {
  const rayon = 3.2
  const diagramme: DiagrammeCirculaire = diagrammeCirculaire({
    effectifs: composition.map(({ pourcentage }) => pourcentage),
    labels: composition.map(({ nom }) => nom),
    rayon,
    legendeAffichage: true,
    legendePosition: 'droite',
    visibles: Array(composition.length).fill(true),
    remplissage: Array(composition.length).fill(true),
  })

  return mathalea2d(
    Object.assign(
      {
        display: 'block',
        pixelsParCm: 18,
        scale: 0.65,
      } as const,
      fixeBordures([diagramme], {
        rxmin: 0,
        rymin: 0,
        rxmax: 2.5,
        rymax: 0,
      }),
    ),
    diagramme,
  )
}

/**
 * Convertir des pourcentages en angles et réciproquement à partir de la
 * composition simplifiée d'alliages réels.
 * @author Stéphane Guyon
 */
export default class PourcentageAngleAlliages extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.sup = 6
    this.besoinFormulaireNumerique = [
      'Alliage',
      6,
      '1 : Acier inoxydable 18/8\n2 : Laiton C260\n3 : Cupronickel 70/30\n4 : Alliage de titane Ti-6Al-4V\n5 : Alliage d’aluminium 2024\n6 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const numeroAlliage = Number(this.sup)
    const alliagesChoisis: Alliage[] =
      numeroAlliage >= 1 && numeroAlliage <= alliages.length
        ? Array(this.nbQuestions).fill(alliages[numeroAlliage - 1])
        : combinaisonListes(alliages, this.nbQuestions)

    for (let i = 0; i < this.nbQuestions; i++) {
      const alliage = alliagesChoisis[i]
      const composition = choice(alliage.compositions)
      const [constituantPourcentage, constituantAngle] = shuffle(
        composition,
      ).slice(0, 2)
      const angleDonne = constituantPourcentage.pourcentage * 3.6
      const angleDemande = constituantAngle.pourcentage * 3.6
      const diagramme = construitDiagramme(composition)

      const questions = createList({
        items: [
          `L'angle du secteur représentant ${avecArticleDefini(constituantPourcentage)} mesure $${texNombre(angleDonne, 1)}^\\circ$. Quel est le pourcentage ${avecDeEtArticleDefini(constituantPourcentage)} dans cet alliage ?`,
          `La proportion ${avecDeEtArticleDefini(constituantAngle)} dans l'alliage est de $${texNombre(constituantAngle.pourcentage, 1)}\\,\\%$. Quelle est la mesure de l'angle du secteur représentant ${avecArticleDefini(constituantAngle)} ?`,
        ],
        style: 'alpha',
      })

      let questionsAffichees = questions
      if (this.interactif) {
        questionsAffichees = addMultiMathfield(this, i, {
          dataTemplate: `a. Le pourcentage ${avecDeEtArticleDefini(constituantPourcentage)} est %{champ1}.<br>
b. L'angle du secteur représentant ${avecArticleDefini(constituantAngle)} mesure %{champ2}.`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierNumbers,
              texteApres: ' %',
            },
            champ2: {
              keyboard: KeyboardType.clavierNumbers,
              texteApres: ' °',
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            champ1: { value: constituantPourcentage.pourcentage },
            champ2: { value: angleDemande },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      this.listeQuestions[i] = `${alliage.description}<br>
Le diagramme circulaire ci-dessous représente la composition massique simplifiée de cet alliage.<br><br>
${diagramme}<br>
${questionsAffichees}`

      this.listeCorrections[i] = createList({
        items: [
          `Un tour complet mesure $360^\\circ$ et représente $100\\,\\%$ de l'alliage.<br>
Le pourcentage ${avecDeEtArticleDefini(constituantPourcentage)} est donc :<br>
$\\dfrac{${texNombre(angleDonne, 1)}}{360}\\times 100=${miseEnEvidence(`${texNombre(constituantPourcentage.pourcentage, 1)}`)}$.`,
          `Le secteur représentant ${avecArticleDefini(constituantAngle)} correspond à $${texNombre(constituantAngle.pourcentage, 1)}\\,\\%$ d'un tour complet.<br>
La mesure de son angle est donc :<br>
$\\dfrac{${texNombre(constituantAngle.pourcentage, 1)}}{100}\\times 360^\\circ=${miseEnEvidence(`${texNombre(angleDemande, 1)}`)}^\\circ$.`,
        ],
        style: 'alpha',
      })
    }

    listeQuestionsToContenu(this)
  }
}
