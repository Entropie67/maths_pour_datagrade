import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import { renderSheetMarkup } from '../../lib/customElements/MySpreadSheet'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { nomDuJour } from '../../lib/outils/dateEtHoraires'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'

import { bleuMathalea } from '../../lib/colors'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import {
  creerSerieDeMoyenneEtEtendue,
  creerSerieDeValeurs,
} from '../../modules/outilsStat'
import Exercice from '../Exercice'

export const titre = 'Programmer des calculs sur tableur'
export const dateDePublication = '05/07/2026'

export const interactifReady = true

/*
 * Programmer des calculs sur tableur : New programme de 6eme 2025
 * @author Jean-claude Lhote
 * revisité par Jean-claude Lhote (intoduction du custom élément sheet-element) et modification de la librairie utilisée.
 */

export const uuid = 'ae07e'

export const refs = {
  'fr-fr': ['3I13-1'],
  'fr-ch': [],
}

export default class ExerciceTableur3T10 extends Exercice {
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
      latexStyles: ExerciceTableur3T10.styles,
      latexOptions,
      appendFeedbackBlocks: options.interactif,
    })
  }

  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Types de questions',
      `Nombres séparés par des tirets\n${ExerciceTableur3T10.listeTypeDeQuestions.map((type, index) => `${index + 1} : ${type}`).join('\n')}\n0: Mélange`,
    ]
    this.sup = '1-2' // `${ExerciceTableur3T10.listeTypeDeQuestions.length + 1}`
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
    'Moyenne de notes',
    'Somme de dés',
    'Aire de rectangle',
    'Prix TTC',
    'Quatrième proportionnelle',
    'Fréquence',
    'Température moyenne',
  ]

  static readonly styles = {
    style_id_blanc: {
      fs: 12,
      bg: ExerciceTableur3T10.colors.blanc,
    },
  }

  questionMoyenneNotes(q: number): { texte: string; texteCorr: string } {
    // On crée une série de notes aléatoires
    const serie = creerSerieDeMoyenneEtEtendue({
      mean: randint(8, 12),
      range: 8,
      n: randint(4, 6),
      isInteger: true,
    })
    // cellDatas pour la génération du tableau en latex
    const cellDatas: Record<number, Record<number, { v: number }>> = {
      0: {
        0: { v: serie[0] },
      },
    }
    for (let i = 0; i < serie.length - 1; i++) {
      cellDatas[0][i + 1] = {
        v: serie[i + 1],
      }
    }
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[]]
    data[0][0] = cellDatas[0][0].v
    for (let i = 0; i < serie.length - 1; i++) {
      data[0][i + 1] = cellDatas[0][i + 1].v
    }

    let texte = 'On a saisi une série de notes sur la ligne $1$ :<br>'
    texte += this.interactif
      ? `Saisir dans la cellule A2 la formule pour obtenir la moyenne de cette série.<br>`
      : 'Quelle formule doit-on saisir dans la cellule A2 pour obtenir la moyenne de cette série ?<br>'

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
                formula: `=MOYENNE(A1:${String.fromCharCode(
                  'A'.charCodeAt(0) + serie.length - 1,
                )}1)`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `A1:${String.fromCharCode(
                  'A'.charCodeAt(0) + serie.length - 1,
                )}1`,
                rangeValues: [1, 20],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule A2 :<br>${texteEnCouleurEtGras(
      `=MOYENNE(A1:${String.fromCharCode(
        'A'.charCodeAt(0) + serie.length - 1,
      )}1)`,
    )}`
    return { texte, texteCorr }
    // Question sur la moyenne de notes
  }

  questionSommeDes(q: number): { texte: string; texteCorr: string } {
    // Question sur la somme de dés
    const nbFacesDe = choice([4, 6, 8, 10, 12, 20])
    const nbDes = randint(3, 6)
    // cellDatas pour la génération du tableau en latex
    const cellDatas: Record<number, Record<number, { v: number }>> = {
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

  questionAireRectangle(q: number): { texte: string; texteCorr: string } {
    let texte = ''

    const largeur = randint(20, 30)
    const longueur = randint(largeur + 1, 50)
    // Question sur l'aire d'un rectangle
    const cellDatas = {
      0: {
        0: { v: 'Largeur' },
        1: { v: largeur },
      },
      1: {
        0: { v: 'Longueur' },
        1: { v: longueur },
      },
      2: {
        0: { v: 'Aire' },
      },
    }
    texte = `On a saisi dans le tableur les dimensions d'un rectangle :<br>
    Quelle formule doit-on saisir dans la cellule B3 pour obtenir l'aire de ce rectangle ?<br>`
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[], [], []]
    data[0][0] = cellDatas[0][0].v
    data[0][1] = cellDatas[0][1].v
    data[1][0] = cellDatas[1][0].v
    data[1][1] = cellDatas[1][1].v
    data[2][0] = cellDatas[2][0].v

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [4, 3],
        columns: [{ width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'B3',
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
                ref: 'B3',
                formula: `=B1*B2`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `B1:B2`,
                rangeValues: [1, 50],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule B3 :<br>${texteEnCouleurEtGras(
      `=B1*B2`,
    )}`
    return { texte, texteCorr }
  }

  questionPrixTTC(q: number): { texte: string; texteCorr: string } {
    let texte = ''

    const prixHT = randint(10, 100)
    const tauxTVA = choice([5.5, 10, 20])
    // Question sur le prix TTC
    const cellDatas = {
      0: {
        0: { v: 'Prix HT' },
        1: { v: prixHT },
      },
      1: {
        0: { v: 'Taux TVA' },
        1: { v: tauxTVA },
      },
      2: {
        0: { v: 'Prix TTC' },
      },
    }
    texte = `On a saisi dans le tableur le prix hors taxe et le taux de TVA d'un produit :<br>
    Quelle formule doit-on saisir dans la cellule B3 pour obtenir le prix toutes taxes comprises (TTC) de ce produit ?<br>`
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[], [], []]
    data[0][0] = cellDatas[0][0].v
    data[0][1] = cellDatas[0][1].v
    data[1][0] = cellDatas[1][0].v
    data[1][1] = cellDatas[1][1].v
    data[2][0] = cellDatas[2][0].v

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [4, 3],
        columns: [{ width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'B3',
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
                ref: 'B3',
                formula: `=B1*(1+B2/100)`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `B1:B2`,
                rangeValues: [1, 50],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule B3 :<br>${texteEnCouleurEtGras(
      `=B1*(1+B2/100)`,
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
    Quelle formule doit-on saisir dans la cellule B2 pour obtenir la quatrième proportionnelle ?<br>`
    const cellDatas = {
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
        minDimensions: [4, 2],
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

  questionFrequence(q: number): { texte: string; texteCorr: string } {
    // Question sur la fréquence
    let texte = ''
    const nbEleves = randint(20, 30)
    const indexPointureChoisie = randint(0, 3)
    const serie = creerSerieDeValeurs([38, 39, 40, 41], nbEleves)
    texte = `On a demandé aux $${nbEleves}$ élèves de la classe leur pointure de chaussure.<br>
    Les réponses sont résumées dans ce tableur.<br>
    Quelle formule doit-on saisir dans la cellule ${String.fromCharCode(66 + indexPointureChoisie)}3 pour obtenir la fréquence de la pointure $${38 + indexPointureChoisie}$ dans cette série ?<br>`
    const cellDatas = {
      0: {
        0: { v: 'Pointure' },
        1: { v: 38 },
        2: { v: 39 },
        3: { v: 40 },
        4: { v: 41 },
      },
      1: {
        0: { v: 'Effectif' },
        1: { v: serie[0][1] },
        2: { v: serie[1][1] },
        3: { v: serie[2][1] },
        4: { v: serie[3][1] },
      },
    }

    const data: (number | string)[][] = [[], []]
    data[0][0] = cellDatas[0][0].v
    data[0][1] = cellDatas[0][1].v
    data[0][2] = cellDatas[0][2].v
    data[0][3] = cellDatas[0][3].v
    data[0][4] = cellDatas[0][4].v
    data[1][0] = cellDatas[1][0].v
    data[1][1] = cellDatas[1][1].v
    data[1][2] = cellDatas[1][2].v
    data[1][3] = cellDatas[1][3].v
    data[1][4] = cellDatas[1][4].v

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [6, 3],
        columns: [{ width: 90 }, { width: 90 }, { width: 90 }, { width: 90 }],
        interactif: this.interactif,
        showVerifyButton: false,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: `${String.fromCharCode(66 + indexPointureChoisie)}3`,
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
                ref: `${String.fromCharCode(66 + indexPointureChoisie)}3`,
                formula: `=${String.fromCharCode(66 + indexPointureChoisie)}2/SOMME(B2:E2)`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `B2:E2`,
                rangeValues: [1, nbEleves],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }

    const texteCorr = `Voici la formule à saisir en cellule ${String.fromCharCode(66 + indexPointureChoisie)}3 :<br>${texteEnCouleurEtGras(
      `=${String.fromCharCode(66 + indexPointureChoisie)}2/SOMME(B2:E2)`,
    )}`
    return { texte, texteCorr }
  }

  questionTemperatureMoyenne(q: number): { texte: string; texteCorr: string } {
    // Question sur la température moyenne
    let texte = ''
    const jours = 7
    const temperatures = Array.from({ length: jours }, () =>
      randint(10, 25),
    ).join(', ')
    texte = `On a relevé les températures (en °C) d'une semaine : ${temperatures}.<br>
    Quelle formule doit-on saisir dans la cellule H2 pour obtenir la température moyenne de cette semaine ?<br>`
    const cellDatas = {
      0: {
        0: { v: nomDuJour(1) },
        1: { v: nomDuJour(2) },
        2: { v: nomDuJour(3) },
        3: { v: nomDuJour(4) },
        4: { v: nomDuJour(5) },
        5: { v: nomDuJour(6) },
        6: { v: nomDuJour(7) },
      },
      1: {
        0: { v: temperatures.split(', ')[0] },
        1: { v: temperatures.split(', ')[1] },
        2: { v: temperatures.split(', ')[2] },
        3: { v: temperatures.split(', ')[3] },
        4: { v: temperatures.split(', ')[4] },
        5: { v: temperatures.split(', ')[5] },
        6: { v: temperatures.split(', ')[6] },
      },
    }
    // On crée les données pour le tableur en HTML
    const data: (number | string)[][] = [[], []]
    data[0][0] = cellDatas[0][0].v
    data[0][1] = cellDatas[0][1].v
    data[0][2] = cellDatas[0][2].v
    data[0][3] = cellDatas[0][3].v
    data[0][4] = cellDatas[0][4].v
    data[0][5] = cellDatas[0][5].v
    data[0][6] = cellDatas[0][6].v
    data[1][0] = cellDatas[1][0].v
    data[1][1] = cellDatas[1][1].v
    data[1][2] = cellDatas[1][2].v
    data[1][3] = cellDatas[1][3].v
    data[1][4] = cellDatas[1][4].v
    data[1][5] = cellDatas[1][5].v
    data[1][6] = cellDatas[1][6].v

    texte += this.renderSheetMarkup(
      q,
      {
        data,
        minDimensions: [8, 3],
        columns: [
          { width: 90 },
          { width: 90 },
          { width: 90 },
          { width: 90 },
          { width: 90 },
          { width: 90 },
          { width: 90 },
        ],
        interactif: this.interactif,
        showVerifyButton: false,
        nbColonnesCachees: 0,
        nbLignesCachees: 0,
      },
      cellDatas,
      {
        formule: true,
        formuleTexte: '=?',
        formuleCellule: 'H2',
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
                ref: `H2`,
                formula: `=MOYENNE(A2:G2)`,
              },
            ],
            sheetTestDatas: [
              {
                ref: `A2:G2`,
                rangeValues: [10, 25],
              },
            ],
          },
        },
        { formatInteractif: 'my-spreadsheet' },
      )
    }
    const texteCorr = `Voici la formule à saisir en cellule H2 :<br>${texteEnCouleurEtGras(
      `=MOYENNE(A2:G2)`,
    )}`
    return { texte, texteCorr }
  }

  nouvelleVersion(): void {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: ExerciceTableur3T10.listeTypeDeQuestions.length,
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
          ;({ texte, texteCorr } = this.questionMoyenneNotes(q))
          break
        case 2:
          ;({ texte, texteCorr } = this.questionSommeDes(q))
          break
        case 3:
          ;({ texte, texteCorr } = this.questionAireRectangle(q))
          break
        case 4:
          ;({ texte, texteCorr } = this.questionPrixTTC(q))
          break
        case 5:
          ;({ texte, texteCorr } = this.questionQuatriemeProportionnelle(q))
          break
        case 6:
          ;({ texte, texteCorr } = this.questionFrequence(q))
          break
        case 7:
          ;({ texte, texteCorr } = this.questionTemperatureMoyenne(q))
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
