import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { traceBarre } from '../../lib/2d/diagrammes'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { repere } from '../../lib/2d/reperes'
import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  numAlpha,
  premiereLettreEnMajuscule,
} from '../../lib/outils/outilString'
import type { UneProposition, Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'

export const titre = 'Lire un diagramme en bâtons'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

/**
 * Lire un diagramme en bâtons
 * @author Erwan Duplessy
 * Conversion Amc et interactif par Jean-claude Lhote
 */

export const uuid = '17bce'

export const refs = {
  'fr-fr': ['6P1autoA', 'BP1AUTO027', '6AutoS1', 'CM1P1B-2', 'CM2P1B-2'],
  'fr-2016': ['6S10'],
  'fr-ch': ['9R1FA2B-1', '9R2FA2B-1', '9R3FA2B-1', 'PRQPF01A-2'],
}

type PropositionDiagramme = UneProposition & {
  statut: boolean
  reponse?: { texte: string }
}

type ChampDiagramme = 'champ1' | 'champ2' | 'champ3'

export default class LectureDiagrammeBaton extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Nombre d'espèces différentes",
      3,
      '1 : 4 espèces\n2 : 5 espèces\n3 : 6 espèces',
    ]
    this.besoinFormulaire2Numerique = [
      'Valeurs numériques',
      2,
      '1 : Entre 1 et 100\n2 : Entre 100 et 1 000',
    ]
    this.besoinFormulaire3Texte = [
      'Types de questions',
      "0: Toutes les questions\n1 : Les animaux les plus nombreux\n2 : Les animaux les moins nombreux\n3 : Encadrement du nombre d'un animal",
    ]

    // this.consigne = "Répondre aux questions à l'aide du graphique."
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = 1
    this.sup2 = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.sup3 = '1-2-3'
  }

  nouvelleVersion() {
    let listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      nbQuestions: 0,
      min: 1,
      max: 3,
      melange: 0,
      defaut: 0,
      shuffle: false,
      enleveDoublons: true,
    }).map((v) => Number(v) - 1)
    if (listeTypeDeQuestions.length === 0) listeTypeDeQuestions = [0, 1, 2]

    const bornesinf = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
    const lstAnimaux = [
      'girafes',
      'zèbres',
      'gnous',
      'buffles',
      'gazelles',
      'crocodiles',
      'rhinocéros',
      'léopards',
      'guépards',
      'hyènes',
      'lycaons',
      'servals',
      'phacochères',
    ]
    let nbAnimaux = 4 // nombre d'animaux différents dans l'énoncé

    // coefficient pour gérer les deux types d'exercices (entre 1 et 100) ou (entre 10 et 1000)
    let coef = 1
    switch (this.sup2) {
      case 1:
        coef = 1
        break
      case 2:
        coef = 10
        break
    }
    const r = repere({
      grilleX: false,
      grilleY: true,
      xThickListe: false,
      xLabelListe: false,
      yUnite: 0.1 / coef,
      yThickDistance: 10 * coef,
      yMax: 100 * coef,
      xMin: 0,
      xMax: 10,
      yMin: 0,
      axeXStyle: '',
      yLegende: "Nombre d'individus",
      yLegendePosition: [2, 10.5],
    })

    switch (this.sup) {
      case 1:
        nbAnimaux = 4
        break
      case 2:
        nbAnimaux = 5
        break
      case 3:
        nbAnimaux = 6
        break
      default:
        nbAnimaux = 4
    }
    const lstAnimauxExo: string[] = [] // liste des animaux uniquement cités dans l'exercice
    const lstNombresAnimaux: number[] = [] // liste des effectifs de chaque animal
    let lstVal = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] // liste des valeurs à éviter pour les effectifs
    let N = 0
    let nom

    for (let i = 0; i < nbAnimaux; i++) {
      N = randint(2, 100, lstVal) // choisit un nombre entre 2 et 100 sauf dans les valeurs à éviter
      lstNombresAnimaux.push(N * coef)
      lstVal = lstVal.concat([N - 1, N, N + 1]) // valeurs à supprimer pour éviter des valeurs proches
    }

    for (let i = 0; i < nbAnimaux; i++) {
      nom = choice(lstAnimaux, lstAnimauxExo) // choisit un animal au hasard sauf parmi ceux déjà utilisés
      lstAnimauxExo.push(nom)
    }
    const nMin = Math.min(...lstNombresAnimaux)
    const nMax = Math.max(...lstNombresAnimaux)

    const lstNomParc = [
      'Dramve',
      'Fatenmin',
      'Batderfa',
      'Vihi',
      'Genser',
      'Barbetdou',
      'Dramrendu',
      'Secai',
      'Cipeudram',
      'Cigel',
      'Lisino',
      'Fohenlan',
      'Farnfoss',
      'Kinecardine',
      'Zeffari',
      'Barmwich',
      'Swadlincote',
      'Swordbreak',
      'Loshull',
      'Ruyron',
      'Fluasall',
      'Blueross',
      'Vlane',
    ]
    this.consigne =
      'Dans le parc naturel de ' +
      choice(lstNomParc) +
      ", il y a beaucoup d'animaux.<br><br>Voici un diagramme en bâtons qui donne le nombre d'individus pour chaque espèce.<br>"
    const numAnimal = randint(0, nbAnimaux - 1)
    const reponse =
      lstNombresAnimaux[lstAnimauxExo.indexOf(lstAnimauxExo[numAnimal])]
    const reponseinf = 10 * coef * Math.floor(reponse / (10 * coef))
    const reponsesup = reponseinf + 10 * coef
    const textesQuestions = listeTypeDeQuestions.map((typeQuestion) => {
      switch (typeQuestion) {
        case 0:
          return 'Quels sont les animaux les plus nombreux ?<br>'
        case 1:
          return 'Quels sont les animaux les moins nombreux ?<br>'
        case 2:
        default:
          return this.sup2 === 1
            ? `Donner un encadrement, à la dizaine, du nombre de ${lstAnimauxExo[numAnimal]} ?<br>`
            : `Donner un encadrement, à la centaine, du nombre de ${lstAnimauxExo[numAnimal]} ?<br>`
      }
    })
    const lstElementGraph = []
    const props: PropositionDiagramme[][] = []
    const bornesAEviter = [
      10 *
        coef *
        Math.floor(
          lstNombresAnimaux[lstAnimauxExo.indexOf(lstAnimauxExo[numAnimal])] /
            (10 * coef),
        ),
    ]
    for (let i = 0; i < nbAnimaux; i++) {
      lstElementGraph.push(
        traceBarre(
          ((r.xMax - r.xMin) / (nbAnimaux + 1)) * (i + 1),
          lstNombresAnimaux[i],
          premiereLettreEnMajuscule(lstAnimauxExo[i]),
          { unite: 0.1 / coef },
        ),
      )
    }

    const diag = mathalea2d(
      Object.assign(
        { zoom: 1, scale: 0.5 },
        fixeBordures([r, ...lstElementGraph]),
      ),
      r,
      lstElementGraph,
    )
    for (let i = 0; i < listeTypeDeQuestions.length; i++) {
      switch (listeTypeDeQuestions[i]) {
        case 0:
          {
            const reponsea = { texte: `${i + 1}) Animaux les plus nombreux :` }
            props[i] = [
              ...lstAnimauxExo.map((_, index) => ({
                texte: premiereLettreEnMajuscule(lstAnimauxExo[index]),
                statut: index === lstNombresAnimaux.indexOf(nMax),
                reponse: index === 0 ? reponsea : undefined,
              })),
            ]
          }
          break
        case 1:
          {
            const reponseb = { texte: `${i + 1}) Animaux les moins nombreux :` }
            props[i] = [
              ...lstAnimauxExo.map((_, index) => ({
                texte: premiereLettreEnMajuscule(lstAnimauxExo[index]),
                statut: index === lstNombresAnimaux.indexOf(nMin),
                reponse: index === 0 ? reponseb : undefined,
              })),
            ]
          }

          break
        case 2:
          props[i] = [
            ...lstAnimauxExo.map((_, index) => {
              if (index === numAnimal) {
                return Object.assign(
                  {},
                  {
                    texte: `entre $${bornesAEviter[0]}$ et $${texNombre(bornesAEviter[0] + 10 * coef)}$`,
                    statut: true,
                    reponse: {
                      texte: `${i + 1}) Encadrement du nombre de ${lstAnimauxExo[numAnimal]} :`,
                    },
                  },
                )
              } else {
                const borne = choice(bornesinf, bornesAEviter)
                bornesAEviter.push(borne)
                return Object.assign(
                  {},
                  {
                    texte: `entre $${coef * borne}$ et $${texNombre((borne + 10) * coef)}$`,
                    statut: false,
                    reponse: {
                      texte: `${i + 1}) Encadrement du nombre de ${lstAnimauxExo[numAnimal]} :`,
                    },
                  },
                )
              }
            }),
          ]
          break
      }
    }
    const dataOptions: DataOptionsMultiMathfield = {}
    const reponsesInteractives: Valeur = {}
    const avecNumerotation = listeTypeDeQuestions.length > 1
    const lignesQuestions = listeTypeDeQuestions.map(
      (typeQuestion, indexQuestion) => {
        const field = `champ${indexQuestion + 1}` as ChampDiagramme
        const bonnesReponses = props[indexQuestion]
          .filter((proposition) => proposition.statut)
          .map((proposition) => proposition.texte)
        dataOptions[field] = {
          qcm: props[indexQuestion].map((proposition) => ({
            label: proposition.texte,
            value: proposition.texte,
          })),
          vertical: nbAnimaux > 5 || typeQuestion === 2,
        }
        reponsesInteractives[field] = { value: bonnesReponses[0] }
        return `${avecNumerotation ? numAlpha(indexQuestion) : ''}${textesQuestions[indexQuestion]} %{${field}}`
      },
    )

    this.listeQuestions[0] =
      diag +
      '<br>' +
      addMultiMathfield(this, 0, {
        dataTemplate: lignesQuestions.join('\n'),
        dataOptions,
      })
    // debut de la correction
    // question 1
    const listeCorrections = []
    for (let i = 0; i < listeTypeDeQuestions.length; i++) {
      switch (listeTypeDeQuestions[i]) {
        case 0:
          listeCorrections[i] =
            'Les animaux les plus nombreux sont les ' +
            texteEnCouleurEtGras(
              lstAnimauxExo[lstNombresAnimaux.indexOf(nMax)],
            ) +
            '.<br>'
          break
        case 1:
          listeCorrections[i] =
            'Les animaux les moins nombreux sont les ' +
            texteEnCouleurEtGras(
              lstAnimauxExo[lstNombresAnimaux.indexOf(nMin)],
            ) +
            '.<br>'
          break
        case 2:
          {
            listeCorrections[i] =
              `Il y a ${texteEnCouleurEtGras(`entre ${reponseinf} et ${stringNombre(reponsesup)}`)} ${lstAnimauxExo[numAnimal]}.<br>`
          }
          break
      }
    }

    this.listeCorrections[0] = listeCorrections
      .map(
        (correction, indexQuestion) =>
          `${avecNumerotation ? numAlpha(indexQuestion) : ''}${correction}`,
      )
      .join('')

    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce: '',
        propositions: listeTypeDeQuestions.map((_, indexQuestion) => ({
          type: 'qcmMono',
          propositions: props[indexQuestion],
          options: { ordered: false },
          enonce:
            (indexQuestion === 0 ? diag + '<br>' : '') +
            (avecNumerotation ? numAlpha(indexQuestion) : '') +
            textesQuestions[indexQuestion],
        })),
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    } else {
      handleAnswers(this, 0, reponsesInteractives, {
        formatInteractif: 'multi-mathfield',
      })
    }
    listeQuestionsToContenu(this)
  }
}
