import { BoiteBuilder } from '../../lib/2d/BoiteBuilder'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { bleuMathalea } from '../../lib/colors'
import {
  addSvgSelection,
  type SvgWithValue,
} from '../../lib/customElements/SvgSelectionElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Ajouter des barres fractionnaires'
export const interactifReady = true
export const uuid = '1574f'
export const refs = {
  'fr-fr': ['6AutoF3-3'],
  'fr-ch': ['PR-20', '9R3NO4J-3', '10CTNO3A-3', '10LCNO3A-3', '10LSNO3A-3'],
}

const fractionsPourCase1 = [
  fraction(2, 8),
  fraction(3, 8),
  fraction(5, 8),
  fraction(6, 8),
  fraction(7, 8),
  fraction(3, 4),
  fraction(1, 2),
  fraction(1, 4),
  fraction(3, 9),
  fraction(4, 9),
  fraction(5, 9),
  fraction(6, 9),
  fraction(7, 9),
  fraction(8, 9),
]
const fractionsPourCase2 = fractionsPourCase1.map((f: FractionEtendue) =>
  fraction(f.num + f.den, f.den),
)

/**
 * @author Jean-claude Lhote
 */
export default class AjouterDesLegosFractions extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de sommes',
      `Nombres séparés par des tirets\n1 : inférieures à 1 \n2 : supérieures à 1\n0 : Mélange`,
    ]
    this.sup = '1'
  }

  private findSolution(nombres: number[], targetSum: number): number[] {
    const n = nombres.length
    const results: number[][] = []

    // Générer toutes les combinaisons possibles de nombres
    for (let i = 0; i < 1 << n; i++) {
      const combination: number[] = []
      let sum = 0

      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          combination.push(j)
          sum += nombres[j]
        }
      }

      if (sum === targetSum) {
        results.push(combination)
        break
      }
    }

    // Retourner la première solution trouvée, ou une solution vide si aucune n'existe
    return results.length > 0 ? results[0] : []
  }

  nouvelleVersion(): void {
    const barre = function (longueur: number, colorBackground = 'white') {
      const boite = new BoiteBuilder({
        xMin: 0,
        yMin: 0,
        xMax: longueur,
        yMax: 1,
      })
        .addColor({
          color: 'black',
          colorBackground,
          opacity: 1,
          backgroudOpacity: 1,
        })
        .render()
      return mathalea2d(
        Object.assign(
          { scale: 0.5, display: 'inline-block' } as const,
          fixeBordures([boite], { rxmin: 0, rxmax: 0, rymin: 0, rymax: 0 }),
        ),
        boite,
      )
    }
    const barre8: SvgWithValue = { svg: barre(8, 'lightgray'), value: 1 }
    const barre4: SvgWithValue = { svg: barre(4, 'pink'), value: 0.5 }
    const barre2: SvgWithValue = { svg: barre(2, 'green'), value: 0.25 }
    const barre1: SvgWithValue = { svg: barre(1, 'yellow'), value: 0.125 }
    const barre8sur3: SvgWithValue = {
      svg: barre(8 / 3, bleuMathalea),
      value: 1 / 3,
    }
    const barre8sur9: SvgWithValue = {
      svg: barre(8 / 9, 'orange'),
      value: 1 / 9,
    }
    this.introduction = `On a représenté ci-dessous une unité en gris et différents partages de l'unité en dessous.<br><br>`
    this.introduction += `${barre8.svg}<br>
${barre4.svg}${barre4.svg}<br>
${barre2.svg}${barre2.svg}${barre2.svg}${barre2.svg}<br>
${barre1.svg}${barre1.svg}${barre1.svg}${barre1.svg}${barre1.svg}${barre1.svg}${barre1.svg}${barre1.svg}<br>
${barre8sur3.svg}${barre8sur3.svg}${barre8sur3.svg}<br>
${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}${barre8sur9.svg}
<br><br>
Dans ${this.nbQuestions > 1 ? 'les questions suivantes' : 'la question suivante'}, ${context.isHtml && this.interactif ? 'sélectionner ' : 'entourer '} les barres qui, ensemble forment la fraction demandée.`

    const typeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      nbQuestions: this.nbQuestions,
      defaut: 1,
    }).map(Number)
    const svgItems1: SvgWithValue[] = [
      barre4,
      barre2,
      barre1,
      barre8sur3,
      barre8sur9,
    ]
    const figForValue = (value: number): string => {
      if (value === 1) return barre8.svg
      if (value === 0.5) return barre4.svg
      if (value === 0.25) return barre2.svg
      if (value === 0.125) return barre1.svg
      if (value === 1 / 3) return barre8sur3.svg
      if (value === 1 / 9) return barre8sur9.svg
      return ''
    }
    const figsForFraction = (type: number, frac: FractionEtendue): string => {
      let result: string = ''
      const valeurs =
        type === 1
          ? [8, 8, 9, 9, 18, 18, 24, 24, 36, 36]
          : [8, 8, 8, 9, 9, 9, 18, 18, 18, 24, 24, 24, 36, 36, 36]
      const ppcm = 72
      const cibleNumerateur = frac.num * (ppcm / frac.den)

      // Utiliser l'algorithme findSolution pour trouver la combinaison exacte
      const solution = this.findSolution(valeurs, cibleNumerateur)

      for (const index of solution) {
        result += figForValue(valeurs[index] / ppcm)
      }

      return result
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let frac: FractionEtendue
      let figureLatex = ''
      const tikzPictures = svgItems1.map((item) => item.svg).join('\n')
      for (let j = 0; j < (typeDeQuestion[i] === 1 ? 2 : 3); j++) {
        figureLatex += tikzPictures + `\\\\[0.6em]\n`
      }
      switch (typeDeQuestion[i]) {
        case 1:
          frac = choice(fractionsPourCase1)
          handleAnswers(this, i, { reponse: { value: frac.num / frac.den } })
          texte += `$${frac.texFraction}$ :<br><br> ${context.isHtml ? addSvgSelection(this, i, { svgs: [[...svgItems1], [...svgItems1]] }) : figureLatex}`
          break
        case 2:
        default:
          frac = choice(fractionsPourCase2)
          handleAnswers(this, i, { reponse: { value: frac.num / frac.den } })
          texte += `$${frac.texFraction}$ :<br><br> ${context.isHtml ? addSvgSelection(this, i, { svgs: [[...svgItems1], [...svgItems1], [...svgItems1]] }) : figureLatex}`
          break
      }

      const objetsForCorrection = figsForFraction(typeDeQuestion[i], frac)

      if (this.questionJamaisPosee(i, frac.texFraction)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(
          `Voici un assemblage de barres qui correspond à $${frac.texFraction}$ :<br><br>${objetsForCorrection}`,
        )
        i++
      }
      cpt++
    }
  }
}
