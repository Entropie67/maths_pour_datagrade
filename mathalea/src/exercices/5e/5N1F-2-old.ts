// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c8f4e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import DragAndDrop, { type Etiquette } from '../../lib/interactif/DragAndDrop'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { range } from '../../lib/outils/nombres'
import {
  listeQuestionsToContenu,
  gestionnaireFormulaireTexte,
} from '../../modules/outils'
import Exercice from '../Exercice'
import choisirExpressionNumerique from './_choisirExpressionNumerique'

export const titre =
  'Traduire une expression par une phrase avec des étiquettes'
export const amcReady = false
export const interactifReady = true
export const dateDeModifImportante = '17/09/2026'
export const uuid = 'c8f4e'
export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

const operations = ['somme', 'différence', 'produit', 'quotient']

const pronoms = ['du', 'de', 'le', 'la']

const connecteurs = ['par', 'et', 'entre']

/** Met la formulation de la phrase sous la forme des étiquettes proposées. */
function normalisePhrase(phrase: string): string {
  return phrase
    .replace(/^La /, 'la ')
    .replace(/^Le /, 'le ')
    .replace(/ de le /g, ' du ')
    .replace(/ et de /g, ' et ')
}

function construitEtiquettes(phrase: string): {
  etiquettes: Etiquette[][]
  reponses: string[]
} {
  const phraseNormalisee = normalisePhrase(phrase)
  const nombres =
    phraseNormalisee.match(/\d+(?:[ \u202f]\d+)*(?:[,.]\d+)?/g) ?? []
  const idsNombres = new Map<string, string>()
  nombres.forEach((nombre, index) => {
    if (!idsNombres.has(nombre)) idsNombres.set(nombre, `n${index}`)
  })
  const etiquettes: Etiquette[] = []
  idsNombres.forEach((id, contenu) => etiquettes.push({ id, contenu }))
  operations.forEach((contenu, index) => {
    etiquettes.push({ id: `o${index}`, contenu })
  })
  pronoms.forEach((contenu, index) => {
    etiquettes.push({ id: `p${index}`, contenu })
  })
  connecteurs.forEach((contenu, index) => {
    etiquettes.push({ id: `c${index}`, contenu })
  })

  const morceaux = phraseNormalisee.split(
    /(somme|différence|produit|quotient|entre|du|de|le|la|par|et|\d+(?:[ \u202f]\d+)*(?:[,.]\d+)?)/g,
  )
  const ids: string[] = []
  for (const morceau of morceaux) {
    if (!morceau || /^\s+$/.test(morceau)) continue
    const contenu = morceau.trim()
    const operationIndex = operations.indexOf(contenu)
    if (operationIndex >= 0) {
      ids.push(`o${operationIndex}`)
    } else {
      const pronomIndex = pronoms.indexOf(contenu)
      if (pronomIndex >= 0) {
        ids.push(`p${pronomIndex}`)
      } else {
        const connecteurIndex = connecteurs.indexOf(contenu)
        if (connecteurIndex >= 0) ids.push(`c${connecteurIndex}`)
        else if (idsNombres.has(contenu)) {
          ids.push(idsNombres.get(contenu)!)
        }
      }
    }
  }

  const sequences = ids.reduce<string[][]>(
    (variantes, id) =>
      variantes.flatMap((variante) =>
        id === 'p0'
          ? [
              [...variante, 'p0'],
              [...variante, 'p1', 'p2'],
            ]
          : [[...variante, id]],
      ),
    [[]],
  )
  return {
    etiquettes: [etiquettes],
    reponses: sequences.map((sequence) => sequence.join('|')),
  }
}

export default class TraduireUneExpressionParUnePhraseAvecEtiquettesOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.sup2 = false
    this.sup3 = true
    this.sup4 = '1-2-3'
    this.besoinFormulaire4Texte = [
      "Nombre d'opérations par expression",
      'Nombres séparés par des tirets :\n1 : Expressions à 1 opération\n2 : Expressions à 2 opérations\n3 : Expressions à 3 opérations\n4 : Expressions à 4 opérations\n5 : Expressions à 5 opérations\n6 : Mélange',
    ]
    this.dragAndDrops = []
  }

  nouvelleVersion() {
    this.dragAndDrops = []
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const sousCas = [
      combinaisonListes(range(3), this.nbQuestions),
      combinaisonListes(range(9), this.nbQuestions),
      combinaisonListes(range(13), this.nbQuestions),
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const resultats = choisirExpressionNumerique(
        types[i],
        1,
        this.sup3,
        false,
        sousCas[types[i] - 1]?.[i],
      )
      const expression = String(resultats[1]).split(' ou ')[0]
      const phrase = normalisePhrase(String(resultats[0]))
      const { etiquettes, reponses } = construitEtiquettes(String(resultats[0]))
      const reponse = reponses[0]
      if (!this.questionJamaisPosee(i, types[i], expression, phrase)) continue
      const indiceQuestion = i

      const dragAndDrop = new DragAndDrop({
        exercice: this,
        question: i,
        consigne: 'Former la phrase avec les étiquettes proposées.',
        etiquettes,
        enonceATrous: '%{rectangle1}.',
      })
      this.dragAndDrops[i] = dragAndDrop
      handleAnswers(
        this,
        i,
        {
          bareme: () => {
            if (typeof document === 'undefined') return [0, 2]
            const rectangle =
              document.querySelector(
                `#rectangleEx${this.numeroExercice ?? 0}Q${indiceQuestion}R1`,
              ) ??
              document.querySelector(
                `[id^="rectangleEx"][id$="Q${indiceQuestion}R1"]`,
              )
            const ids = Array.from(
              rectangle?.querySelectorAll<HTMLElement>('.etiquette') ?? [],
            ).map(
              (etiquette) => etiquette.id.split('I').pop()?.split('-')[0] ?? '',
            )
            const correction = reponse.split('|')
            const nombresEtOperationsCorrection = correction.filter((id) =>
              /^(n|o)\d+$/.test(id),
            )
            const nombresEtOperationsSaisies = ids.filter((id) =>
              /^(n|o)\d+$/.test(id),
            )
            const nombresEtOperationsDansLeBonOrdre =
              nombresEtOperationsCorrection.length ===
                nombresEtOperationsSaisies.length &&
              nombresEtOperationsCorrection.every(
                (id, index) => id === nombresEtOperationsSaisies[index],
              )
            const phraseExacte = reponses.some((variante) => {
              const correctionVariante = variante.split('|')
              return (
                correctionVariante.length === ids.length &&
                correctionVariante.every((id, index) => id === ids[index])
              )
            })
            return [
              phraseExacte ? 2 : nombresEtOperationsDansLeBonOrdre ? 1 : 0,
              2,
            ]
          },
          rectangle1: {
            value: reponses,
            options: {
              ordered: true,
              multi: true,
              feedbackOnLabels: true,
            },
          },
        },
        { formatInteractif: 'dnd' },
      )
      this.listeQuestions[i] =
        `${expression} : ${this.interactif ? dragAndDrop.ajouteDragAndDrop({ melange: false, duplicable: true }) : '$\\dotfill$'}`
      this.listeCorrections[i] =
        `${expression} s'écrit : ${texteEnCouleurEtGras(phrase)}.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
