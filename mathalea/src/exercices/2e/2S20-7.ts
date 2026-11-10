import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { renderSheetMarkup } from '../../lib/customElements/MySpreadSheet'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Utiliser le vocabulaire statistique et un tableur'
export const dateDePublication = '18/08/2026'
export const interactifReady = true

export const uuid = '9f3c1'

export const refs = {
  'fr-fr': ['2S20-7'],
  'fr-ch': [],
}

/**
 * Identifier une population et un caractère statistique, puis calculer des fréquences avec un tableur.
 *
 * @author Stéphane Guyon
 */

type Scenario = {
  introduction: string
  entete: string
  modalites: Array<string | number>
  effectifs: number[]
  population: string
  populationsFausses: string[]
  caractere: string
  caracteresFaux: string[]
  nature: string
}

const spreadsheetStyles = {
  entete: { bg: '#dce6f1', fs: 11 },
  total: { bg: '#e9eff6', fs: 11 },
}

export default class VocabulaireStatistiqueTableur extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 5
    this.besoinFormulaireNumerique = [
      'Scénario',
      5,
      '1 : Médiathèque\n2 : Pointures vendues\n3 : Moyens de transport\n4 : Séances d’entraînement\n5 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const premierePointure = choice([35, 36, 37])
    const scenarios: Scenario[] = [
      {
        introduction:
          'Une médiathèque relève le genre littéraire de chaque livre emprunté pendant un week-end.',
        entete: 'Genre littéraire',
        modalites: [
          'Roman',
          'Bande dessinée',
          'Documentaire',
          'Poésie et théâtre',
        ],
        effectifs: [
          randint(22, 34),
          randint(16, 27),
          randint(10, 20),
          randint(4, 11),
        ].map((n) => n * 5),
        population: 'les livres empruntés pendant ce week-end',
        populationsFausses: [
          'les genres littéraires',
          'les effectifs',
          'la médiathèque',
        ],
        caractere: 'le genre littéraire de chaque livre emprunté',
        caracteresFaux: [
          'le nombre total de livres empruntés',
          "la durée d'emprunt de chaque livre",
          'le nombre de livres de chaque genre',
        ],
        nature: 'qualitatif',
      },
      {
        introduction:
          'Un magasin relève la pointure de chaque paire de chaussures vendue pendant une opération promotionnelle.',
        entete: 'Pointure',
        modalites: Array.from({ length: 5 }, (_, i) => premierePointure + i),
        effectifs: [
          randint(12, 20),
          randint(20, 30),
          randint(25, 36),
          randint(16, 27),
          randint(8, 16),
        ].map((n) => n * 5),
        population: "les paires de chaussures vendues pendant l'opération",
        populationsFausses: [
          'les clients du magasin',
          'les différentes pointures',
          'toutes les chaussures du magasin',
        ],
        caractere: 'la pointure de chaque paire vendue',
        caracteresFaux: [
          'le nombre de paires vendues',
          "le prix d'une paire de chaussures",
          'le modèle de chaque paire vendue',
        ],
        nature: 'quantitatif discret',
      },
      {
        introduction:
          "À l'entrée d'un lycée, on interroge des élèves sur leur moyen de transport principal pour venir au lycée.",
        entete: 'Moyen de transport',
        modalites: ['À pied', 'Vélo', 'Transports en commun', 'Voiture'],
        effectifs: [
          randint(8, 15),
          randint(5, 12),
          randint(18, 28),
          randint(10, 20),
        ].map((n) => n * 10),
        population: "les élèves interrogés à l'entrée du lycée",
        populationsFausses: [
          'tous les élèves du lycée',
          'les moyens de transport',
          'les trajets effectués pendant une semaine',
        ],
        caractere:
          'le moyen de transport principal utilisé pour venir au lycée',
        caracteresFaux: [
          'la durée du trajet pour venir au lycée',
          "le nombre d'élèves du lycée",
          'la distance entre le domicile et le lycée',
        ],
        nature: 'qualitatif',
      },
      {
        introduction:
          "Une association sportive relève le nombre de séances d'entraînement suivies par chacun de ses adhérents pendant un mois.",
        entete: 'Nombre de séances',
        modalites: [0, 1, 2, 3, 4, 5],
        effectifs: [
          randint(4, 8),
          randint(7, 13),
          randint(12, 18),
          randint(14, 21),
          randint(8, 15),
          randint(3, 8),
        ].map((n) => n * 5),
        population: "les adhérents de l'association sportive",
        populationsFausses: [
          "le nombre de séances d'entraînement",
          'les effectifs',
          "l'association sportive",
        ],
        caractere:
          'le nombre de séances suivies par chaque adhérent pendant le mois',
        caracteresFaux: [
          "la durée d'une séance d'entraînement",
          "le nombre total d'adhérents",
          'le sport pratiqué par chaque adhérent',
        ],
        nature: 'quantitatif discret',
      },
    ]

    const scenario =
      this.sup >= 1 && this.sup <= 4
        ? scenarios[this.sup - 1]
        : choice(scenarios)
    const total = scenario.effectifs.reduce(
      (somme, effectif) => somme + effectif,
      0,
    )
    const ligneTotal = scenario.modalites.length + 2
    const formule = `=B2/$B$${ligneTotal}`
    const formuleAffichee = context.isHtml
      ? `<code>${formule}</code>`
      : `\\texttt{${formule.replaceAll('$', '\\$')}}`
    const donnees: Array<Array<string | number>> = [
      [scenario.entete, 'Effectif', 'Fréquence'],
      ...scenario.modalites.map((modalite, i) => [
        modalite,
        scenario.effectifs[i],
        '',
      ]),
      ['Total', total, ''],
    ]
    const donneesCorrection: Array<Array<string | number>> = [
      [scenario.entete, 'Effectif', 'Fréquence'],
      ...scenario.modalites.map((modalite, i) => [
        modalite,
        scenario.effectifs[i],
        Math.round((scenario.effectifs[i] / total) * 10000) / 10000,
      ]),
      ['Total', total, 1],
    ]
    const style: Record<string, string> = {}
    for (const cellule of ['A1', 'B1', 'C1']) {
      style[cellule] =
        'background-color:#dce6f1;font-weight:bold;text-align:center;'
    }
    for (const cellule of [
      `A${ligneTotal}`,
      `B${ligneTotal}`,
      `C${ligneTotal}`,
    ]) {
      style[cellule] = 'background-color:#e9eff6;font-weight:bold;'
    }
    const latexData = donnees.map((ligne, i) =>
      Object.fromEntries(
        ligne.map((valeur, j) => [
          j,
          {
            v: valeur,
            t: typeof valeur === 'number' ? 2 : 1,
            s: i === 0 ? 'entete' : i === ligneTotal - 1 ? 'total' : undefined,
          },
        ]),
      ),
    )
    const latexDataCorrection = donneesCorrection.map((ligne, i) =>
      Object.fromEntries(
        ligne.map((valeur, j) => [
          j,
          {
            v: valeur,
            t: typeof valeur === 'number' ? 2 : 1,
            s: i === 0 ? 'entete' : i === ligneTotal - 1 ? 'total' : undefined,
          },
        ]),
      ),
    )

    const tableur = renderSheetMarkup({
      numeroExercice: this.numeroExercice,
      questionIndex: 10,
      data: donnees,
      minDimensions: [3, donnees.length],
      style,
      columns: [{ width: 220 }, { width: 110 }, { width: 120 }],
      interactif: false,
      showVerifyButton: false,
      readOnlyCells: [`A1:C${ligneTotal}`],
      latexData,
      latexStyles: spreadsheetStyles,
      appendFeedbackBlocks: false,
    })
    const tableurCorrection = renderSheetMarkup({
      data: donneesCorrection,
      minDimensions: [3, donneesCorrection.length],
      style,
      columns: [{ width: 220 }, { width: 110 }, { width: 120 }],
      interactif: false,
      showVerifyButton: false,
      readOnlyCells: [`A1:C${ligneTotal}`],
      latexData: latexDataCorrection,
      latexStyles: spreadsheetStyles,
      appendFeedbackBlocks: false,
    })

    const liste = (bonneReponse: string, mauvaisesReponses: string[]) => [
      { label: 'Choisir…', value: '' },
      ...shuffle([bonneReponse, ...mauvaisesReponses]).map((reponse) => ({
        label: reponse,
        value: reponse,
      })),
    ]
    const choixPopulation = liste(
      scenario.population,
      scenario.populationsFausses,
    )
    const choixCaractere = liste(scenario.caractere, scenario.caracteresFaux)
    const choixNature = liste(scenario.nature, [
      scenario.nature === 'qualitatif' ? 'quantitatif discret' : 'qualitatif',
      'quantitatif continu',
    ])
    const choixFormule = liste(formule, [
      `=B2/B${ligneTotal}`,
      `=$B$2/B${ligneTotal}`,
      `=B2/$B2`,
    ])

    let texte = `${scenario.introduction}<br>Les données recueillies sont présentées dans le tableur ci-dessous.<br><br>${tableur}<br>`
    if (this.interactif) {
      texte += addMultiMathfield(this, 0, {
        dataTemplate: `1. Quelle est la population étudiée ? %{champ1}<br>
          2. Quel est le caractère étudié ? %{champ2}<br>
          S'agit-il d'un caractère qualitatif ou quantitatif ? %{champ3}<br>
          3. Quelle formule peut-on saisir dans la cellule C2, puis tirer vers le bas pour compléter la colonne C ? %{champ4}`,
        dataOptions: {
          champ1: { choices: choixPopulation },
          champ2: { choices: choixCaractere },
          champ3: { choices: choixNature },
          champ4: { choices: choixFormule },
        },
      })
    } else {
      texte += `1. Quelle est la population étudiée ?<br>
        2. Quel est le caractère étudié ? S'agit-il d'un caractère qualitatif ou quantitatif ?<br>
        3. Quelle formule peut-on saisir dans la cellule C2, puis tirer vers le bas pour compléter la colonne C ?`
    }

    if (this.interactif) {
      handleAnswers(
        this,
        0,
        {
          champ1: { value: scenario.population },
          champ2: { value: scenario.caractere },
          champ3: { value: scenario.nature },
          champ4: { value: formule },
        },
        { formatInteractif: 'multi-mathfield' },
      )
    }

    let texteCorr = `La population étudiée est ${texteEnCouleurEtGras(scenario.population)}.<br>`
    texteCorr += `Le caractère étudié est ${texteEnCouleurEtGras(scenario.caractere)}. Il s'agit d'un caractère ${texteEnCouleurEtGras(scenario.nature)}.<br>`
    texteCorr += `La fréquence d'une modalité est le quotient de son effectif par l'effectif total.<br>`
    texteCorr += `Dans la cellule C2, on saisit donc ${texteEnCouleurEtGras(formuleAffichee)}. Les symboles «${sp()}dollar${sp()}» devant B et ${ligneTotal} rendent la référence à la cellule B${ligneTotal} absolue : elle reste fixe lorsque la formule est tirée vers le bas.<br>`
    texteCorr += `On obtient le tableur complété suivant.<br><br>${tableurCorrection}`

    this.listeQuestions = [texte]
    this.listeCorrections = [texteCorr]
    listeQuestionsToContenu(this)
  }
}
