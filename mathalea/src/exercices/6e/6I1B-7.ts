import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { renderSheetMarkup } from '../../lib/customElements/MySpreadSheet'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'

import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des calculs sur tableur'
export const dateDePublication = '15/06/2026'
export const dateDeModifImportante = '23/05/2026'
export const interactifReady = true
export const uuid = 'e0f6b'

export const refs = {
  'fr-fr': ['6I1B-7'],
  'fr-ch': [],
}

export default class ExerciceTableurCalculs6e extends Exercice {
  private renderSheetMarkup(
    q: number,
    options: {
      data: (number | string)[][]
      minDimensions: [number, number]
      columns: unknown[]
      interactif: boolean
      showVerifyButton: boolean
      style?: Record<string, string>
      nbColonnesCachees?: number
      nbLignesCachees?: number
      readOnlyCells?: string[]
    },
    latexData: Record<number, Record<number, { v: string | number }>>,
    latexOptions: {
      formule?: boolean
      formuleTexte?: string
      formuleCellule?: string
      firstColHeaderWidth?: string
    },
  ): string {
    return renderSheetMarkup({
      ...options,
      numeroExercice: this.numeroExercice,
      questionIndex: q,
      latexData,
      latexStyles: ExerciceTableurCalculs6e.styles,
      latexOptions,
      appendFeedbackBlocks: options.interactif,
    })
  }

  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Types de questions',
      `Nombres séparés par des tirets\n${ExerciceTableurCalculs6e.listeTypeDeQuestions.map((type, index) => `${index + 1} : ${type}`).join('\n')}\n0: Mélange`,
    ]
    this.sup = '1-2' // `${ExerciceTableurCalculs6e.listeTypeDeQuestions.length + 1}`
  }

  static readonly colors = {
    orange: orangeMathalea,
    vert: '#7adb7a',
    jaune: '#e6e66a',
    bleu: bleuMathalea,
    violet: '#f8a3f8',
    rouge: '#eca2a2',
    blanc: '#ffffff',
  }

  static readonly listeTypeDeQuestions = [
    'Somme de 4 nombres',
    'Produit de 3 nombres',
    'Règle de trois',
    'Produire un nombre décimal',
  ]

  static readonly styles = {
    style_id_blanc: {
      fs: 12,
      bg: ExerciceTableurCalculs6e.colors.blanc,
    },
  }

  questionSommeDes(q: number): { texte: string; texteCorr: string } {
    // Question sur la somme de dés
    const nbFacesDe = choice([4, 6, 8, 10, 12, 20])
    const nbDes = 4
    // cellDatas pour la génération du tableau en latex
    const cellDatas: Record<number, Record<number, { v: string | number }>> = {
      0: {
        0: { v: randint(1, nbFacesDe) },
      },
    }
    for (let i = 0; i < nbDes - 1; i++) {
      cellDatas[0][i + 1] = {
        v: randint(1, nbFacesDe),
      }
    }
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[]]
    data[0][0] = cellDatas[0][0].v
    for (let i = 0; i < nbDes - 1; i++) {
      data[0][i + 1] = cellDatas[0][i + 1].v
    }

    let texte = `On a saisi les résultats de $${nbDes}$ lancers de dé à $${nbFacesDe}$ faces sur la ligne $1$ :<br>`
    texte += this.interactif
      ? `Saisir dans la cellule A2 la formule pour obtenir la somme de ces résultats.<br>`
      : 'Quelle formule doit-on saisir dans la cellule A2 pour obtenir la somme de ces résultats ?<br>'

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [4, 2],
        columns: [{ width: 90 }, { width: 90 }, { width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'A2',
      },
    )
    if (this.interactif) {
      handleAnswers(
        this,
        q,
        {
          sheetAnswer: {
            goodAnswerFormulas: [
              {
                ref: 'A2',
                formula: `=SOMME(A1:${String.fromCharCode(
                  'A'.charCodeAt(0) + nbDes - 1,
                )}1)`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `A1:${String.fromCharCode(
                  'A'.charCodeAt(0) + nbDes - 1,
                )}1`,
                rangeValues: [4, 20],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule A2 :<br>${texteEnCouleurEtGras(
      `=SOMME(A1:${String.fromCharCode('A'.charCodeAt(0) + nbDes - 1)}1)`,
    )}`
    return { texte, texteCorr }
  }

  questionVolumePave(q: number): { texte: string; texteCorr: string } {
    let texte = ''

    const largeur = randint(20, 30)
    const longueur = randint(largeur + 1, 50)
    const hauteur = randint(10, 20)
    // Question sur le volume d'un pavé droit
    const cellDatas: Record<number, Record<number, { v: string | number }>> = {
      0: {
        0: { v: 'Largeur' },
        1: { v: largeur },
      },
      1: {
        0: { v: 'Longueur' },
        1: { v: longueur },
      },
      2: {
        0: { v: 'Hauteur' },
        1: { v: hauteur },
      },
      3: {
        0: { v: 'Volume' },
      },
    }
    texte = `On a saisi dans le tableur les dimensions d'un pavé droit :<br>
    Quelle formule doit-on saisir dans la cellule B4 pour obtenir le volume de ce pavé droit ?<br>`
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[], [], [], []]
    data[0][0] = cellDatas[0][0].v
    data[0][1] = cellDatas[0][1].v
    data[1][0] = cellDatas[1][0].v
    data[1][1] = cellDatas[1][1].v
    data[2][0] = cellDatas[2][0].v
    data[2][1] = cellDatas[2][1].v
    data[3][0] = cellDatas[3][0].v

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [2, 3],
        columns: [{ width: 300 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'B4',
        firstColHeaderWidth: '3cm',
      },
    )
    if (this.interactif) {
      handleAnswers(
        this,
        q,
        {
          sheetAnswer: {
            goodAnswerFormulas: [
              {
                ref: 'B4',
                formula: `=B1*B2*B3`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `B1:B3`,
                rangeValues: [1, 50],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule B4 :<br>${texteEnCouleurEtGras(
      `=B1*B2*B3`,
    )}`
    return { texte, texteCorr }
  }

  questionQuatriemeProportionnelle(q: number): {
    texte: string
    texteCorr: string
  } {
    let texte = ''
    // Question sur la quatrième proportionnelle
    const a = randint(2, 20)
    const b = randint(2, 20, a)
    const c = randint(2, 20, [a, b])
    texte = `On a saisi dans le tableur les nombres suivants :<br>
    A1=${a}, A2=${b}, B1=${c}.<br>
    Quelle formule doit-on saisir dans la cellule B2 pour former un tableau de proportionnalité ?<br>`
    const cellDatas: Record<number, Record<number, { v: string | number }>> = {
      0: {
        0: { v: a },
        1: { v: c },
      },
      1: {
        0: { v: b },
      },
    }
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[], []]
    data[0][0] = a
    data[0][1] = c
    data[1][0] = b

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [2, 2],
        columns: [{ width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'B2',
      },
    )
    if (this.interactif) {
      handleAnswers(
        this,
        q,
        {
          sheetAnswer: {
            goodAnswerFormulas: [
              {
                ref: 'B2',
                formula: `=A2*B1/A1`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `A1:A2`,
                rangeValues: [1, 10],
              },
              {
                ref: `B1`,
                rangeValues: [1, 10],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }

    const texteCorr = `Voici la formule à saisir en cellule B2 :<br>${texteEnCouleurEtGras(
      `=A2*B1/A1`,
    )}`
    return { texte, texteCorr }
  }

  questionNombreDecimal(q: number): { texte: string; texteCorr: string } {
    // Fabriquer un nombre décima à partir de sa partie entière et de sa partie décimale
    let texte = ''
    const partieEntiere = randint(1, 999)
    const partieDecimale = randint(1, 9)
    const positionDecimale = choice([
      ['de dixièmes', 10],
      ['de centièmes', 100],
      ['de millièmes', 1000],
    ])
    const positionEntiere = choice([
      ['d‘unité', 1],
      ['de dizaines', 10],
      ['de centaines', 100],
    ])

    texte = `Un nombre décimal est défini par les renseignements présents dans le tableau ci-dessous. Quelle formule doit-on saisir dans la cellule A3 pour obtenir ce nombre décimal ?<br>`
    const cellDatas: Record<number, Record<number, { v: string | number }>> = {
      0: {
        0: { v: `Nombre ${positionEntiere[0]}` },
        1: { v: `Nombre ${positionDecimale[0]}` },
      },
      1: {
        0: { v: partieEntiere },
        1: { v: partieDecimale },
      },
    }
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[], []]
    data[0][0] = cellDatas[0][0].v
    data[0][1] = cellDatas[0][1].v
    data[1][0] = cellDatas[1][0].v
    data[1][1] = cellDatas[1][1].v

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [2, 3],
        columns: [{ width: 300 }, { width: 300 }],
        interactif: this.interactif,
        showVerifyButton: false,
        nbColonnesCachees: 0,
        nbLignesCachees: 0,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'A3',
      },
    )
    if (this.interactif) {
      handleAnswers(
        this,
        q,
        {
          sheetAnswer: {
            goodAnswerFormulas: [
              {
                ref: `A3`,
                formula: `=A2*${positionEntiere[1]}+B2/${positionDecimale[1]}`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `A2:B2`,
                rangeValues: [10, 25],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule A3 :<br>${texteEnCouleurEtGras(
      `=A2*${positionEntiere[1]}+B2/${positionDecimale[1]}`,
    )}`
    return { texte, texteCorr }
  }

  nouvelleVersion(): void {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: ExerciceTableurCalculs6e.listeTypeDeQuestions.length,
      melange: 0,
      defaut: 0,
    }).map(Number)
    for (
      let q = 0, cpt = 0, texte, texteCorr: string;
      q < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      switch (typesDeQuestions[q]) {
        case 1:
          ;({ texte, texteCorr } = this.questionSommeDes(q))
          break
        case 2:
          ;({ texte, texteCorr } = this.questionVolumePave(q))
          break
        case 3:
          ;({ texte, texteCorr } = this.questionQuatriemeProportionnelle(q))
          break
        case 4:
          ;({ texte, texteCorr } = this.questionNombreDecimal(q))
          break
        default:
          console.error(
            `Type de question invalide : ${typesDeQuestions[q]} pour la question ${q}`,
          )
          continue
      }

      /****************************************************/
      if (this.questionJamaisPosee(q, texte)) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr
        q++
      }
      listeQuestionsToContenu(this)
    }
  }
}
