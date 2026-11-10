import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  AddTabPropMathlive,
  type Icell,
  type Itableau,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = '91875'
export const titre =
  "Donner une mesure d'angle à l'aide de la bissectrice (tableau)"
export const interactifReady = true

export const dateDePublication = '31/09/2025'

export const refs = {
  'fr-fr': ['6G5A-1'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2D-7', '9R2ES2D-7', '9R3ES2D-7'],
}

/**
 * @author Jean-claude Lhote
 */
export default class QuestionBissectrice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3

    this.besoinFormulaireTexte = [
      'types de questions',
      'Nombres séparés par des tirets :\n1 : Utilisation directe\n2 : Utilisation indirecte\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets :\n1 : Moitié de nombres entiers pairs\n2 : Moitié de nombres entiers pairs ou impairs\n3 : Moitié de nombres décimaux\n4 : Mélange',
    ]

    this.sup = '3'
    this.sup2 = '4'
  }

  nouvelleVersion(): void {
    const typesQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: 5,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
    }).map(Number)
    const niveauxDifficulte = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const minuscule = choice(['x', 'y', 'z'])
      const lettres = choisitLettresDifferentes(4, 'XYZ')
      const A = lettres[0]
      const B = lettres[1]
      const C = lettres[2]
      const I = lettres[3]
      const alphas: number[] = []
      const alphas2: number[] = []
      const ligne1: Icell[] = [
        {
          texte: `\\widehat{${A}${B}${C}}`,
          latex: true,
          gras: true,
          color: 'black',
        },
      ]
      const ligne2: Icell[] = [
        {
          texte: `\\widehat{${A}${B}${I}}`,
          latex: true,
          gras: true,
          color: 'black',
        },
      ]
      const ligne1Corr: Icell[] = [
        {
          texte: `\\widehat{${A}${B}${C}}`,
          latex: true,
          gras: true,
          color: 'black',
        },
      ]
      const ligne2Corr: Icell[] = [
        {
          texte: `\\widehat{${A}${B}${I}}`,
          latex: true,
          gras: true,
          color: 'black',
        },
      ]

      for (let n = 0; n < 5; n++) {
        let alpha = 0
        if (niveauxDifficulte[i] === 1) {
          alpha = 2 * randint(2, 89, alphas)
        } else if (niveauxDifficulte[i] === 2) {
          alpha = randint(1, 189, alphas)
        } else {
          alpha = randint(10, 160, alphas.map(Math.round)) + randint(0, 9) / 10
        }
        alphas.push(alpha)
        alphas2.push(alpha / 2)
        if (typesQuestions[n] === 1) {
          ligne1.push({
            texte: `${texNombre(alpha, 1)}^\\circ`,
            latex: true,
            color: 'black',
            gras: false,
            style: `gray;`,
          })
          ligne1Corr.push({
            texte: `${texNombre(alpha, 1)}^\\circ`,
            latex: true,
            color: 'black',
            gras: false,
            style: `gray;`,
          })

          ligne2.push({
            texte: '',
            latex: true,
            gras: false,
            color: 'black',
          })
          ligne2Corr.push({
            texte: miseEnEvidence(`${texNombre(alpha / 2, 1)}^\\circ`),
            latex: true,
            color: orangeMathalea,
            gras: false,
          })
        } else {
          ligne2.push({
            texte: `${texNombre(alpha / 2, 1)}^\\circ`,
            latex: true,
            color: 'black',
            gras: false,
            style: `gray;`,
          })
          ligne1.push({
            texte: '',
            latex: true,
            gras: false,
            color: 'black',
          })
          ligne1Corr.push({
            texte: miseEnEvidence(`${texNombre(alpha, 1)}^\\circ`),
            latex: true,
            color: 'black',
            gras: false,
          })
          ligne2Corr.push({
            texte: `${texNombre(alpha / 2, 1)}^\\circ`,
            latex: true,
            color: 'black',
            gras: false,
            style: `gray;`,
          })
        }
      }
      const iTab: Itableau = {
        nbColonnes: 6,
        ligne1,
        ligne2,
      }

      let styleCorr = {}
      let style = {}
      for (let c = 1; c < 6; c++) {
        if (ligne1[c].texte !== '') {
          style = {
            ...style,
            [`L0C${c}`]: `lightgray;black`,
          }
          styleCorr = {
            ...styleCorr,
            [`L1C${c}`]: `;${orangeMathalea}`,
          }
          styleCorr = { ...styleCorr, [`L0C${c}`]: `lightgray;black` }
        }
        if (ligne2[c].texte !== '') {
          style = {
            ...style,
            [`L1C${c}`]: `lightgray;black`,
          }
          styleCorr = {
            ...styleCorr,
            [`L0C${c}`]: `;${orangeMathalea}`,
          }
          styleCorr = { ...styleCorr, [`L1C${c}`]: `lightgray;black` }
        }
      }
      const tableauCorr = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        i,
        {
          nbColonnes: 6,
          ligne1: ligne1Corr,
          ligne2: ligne2Corr,
        },
        KeyboardType.angles ?? 'angles',
        false,
        styleCorr,
      )
      const tableau = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        i,
        iTab,
        KeyboardType.nombresEtDegre ?? '',
        this.interactif,
        style,
      )
      const objetReponse = Object.fromEntries(
        rangeMinMax(1, 5).map((n) =>
          ligne1[n].texte === ''
            ? [
                `L0C${n}`,
                { value: `${alphas[n - 1]}°`, options: { unite: true } },
              ]
            : [
                `L1C${n}`,
                { value: `${alphas2[n - 1]}°`, options: { unite: true } },
              ],
        ),
      )
      handleAnswers(this, i, objetReponse, {
        formatInteractif: 'tableau-mathlive',
      })
      const texte =
        'Compléter le tableau.<br>' +
        `$${I}$ est un point de la demi-droite $\\left[${B}${minuscule}\\right)$, bissectrice de l'angle $\\widehat{${A}${B}${C}}$.<br>` +
        (context.isHtml ? tableau.output : tableau.latexOutput)
      const texteCorr = context.isHtml
        ? tableauCorr.output
        : tableauCorr.latexOutput

      if (this.questionJamaisPosee(i, alphas.join('-'))) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
