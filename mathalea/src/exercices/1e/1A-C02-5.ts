import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '03/12/2025'
export const uuid = '2a4f4'
// @Author Gilles Mora (factorisé par Claude)
export const refs = {
  'fr-fr': ['1A-C02-5', '2A-N2-5'],
  'fr-ch': ['11CTQCMNO-7', '11LCQCMNO-7', '11LSQCMNO-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Trouver l'égalité correcte avec des calculs de fractions"
export default class auto1AC025 extends ExerciceQcmA {
  // Fonction helper pour créer une correction de bonne réponse
  correctionBonneReponse(egalite: string, calcul: string): string {
    return `$\\bullet$ La seule égalité correcte est : $${miseEnEvidence(egalite)}$.<br>${calcul}<br>`
  }

  // Fonction helper pour créer une correction de mauvaise réponse
  correctionMauvaiseReponse(egalite: string, explication: string): string {
    return `$\\bullet$ L'égalité $${egalite}$ est fausse.<br>${explication}<br>`
  }

  versionOriginale: () => void = () => {
    this.enonce =
      'Parmi les égalités suivantes, une seule est correcte. Laquelle ?'

    const f1 = new FractionEtendue(2, 3)
    const f2 = new FractionEtendue(5, 6)
    const f3 = new FractionEtendue(9, 10)
    const diviseur = 3

    this.correction = `$\\bullet$ L'égalité $${miseEnEvidence(`${f1.texFraction}\\times${f3.texFraction}= ${f1.produitFraction(f3).texFractionSimplifiee}`)}$ est la seule correcte.<br>`
    this.correction += ` $${f1.texFraction}\\times${f3.texFraction}=\\dfrac{${f1.num}\\times ${f3.num}}{${f1.den}\\times ${f3.den}}=\\dfrac{${f1.num * f3.num}}{${f1.den * f3.den}}=${f1.produitFraction(f3).texFractionSimplifiee}$<br>`
    this.correction += `$\\bullet$ L'égalité $${f1.texFraction}+${f2.texFraction}=\\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$ est fausse.<br><br>`
    this.correction += ` $${f1.texFraction}+${f2.texFraction}=\\dfrac{${f1.num}\\times ${f2.den}+${f2.num}\\times ${f1.den}}{${f1.den}\\times ${f2.den}}=\\dfrac{${f1.num * f2.den + f2.num * f1.den}}{${f1.den * f2.den}}=${f1.sommeFraction(f2).texFractionSimplifiee}\\neq \\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$. On ne peut pas additionner directement les numérateurs et les dénominateurs.<br>`
    this.correction += `$\\bullet$ L'égalité $\\dfrac{${f2.texFraction}}{${diviseur}}=\\dfrac{${f2.num * diviseur}}{${f2.den}}$ est fausse.<br><br>`
    this.correction += `$\\dfrac{${f2.texFraction}}{${diviseur}}=\\dfrac{${f2.num}}{${f2.den}\\times ${diviseur}}=\\dfrac{${f2.num}}{${f2.den * diviseur}}\\neq \\dfrac{${f2.num * diviseur}}{${f2.den}}$<br>`
    this.correction += `$\\bullet$ L'égalité $${diviseur}\\times ${f2.texFraction}=\\dfrac{${f2.num * diviseur}}{${f2.den * diviseur}}$ est fausse.<br><br>`
    this.correction += `$\\bullet$ $${diviseur}\\times ${f2.texFraction}=\\dfrac{${diviseur}\\times ${f2.num}}{${f2.den}}=\\dfrac{${diviseur * f2.num}}{${f2.den}}\\neq \\dfrac{${f2.num * diviseur}}{${f2.den * diviseur}}$<br>`

    this.reponses = [
      `$${f1.texFraction}\\times${f3.texFraction}= ${f1.produitFraction(f3).texFractionSimplifiee}$`,
      `$${f1.texFraction}+${f2.texFraction}=\\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$`,
      `$\\dfrac{${f2.texFraction}}{${diviseur}}=\\dfrac{${f2.num * diviseur}}{${f2.den}}$`,
      `$${diviseur}\\times ${f2.texFraction}=\\dfrac{${f2.num * diviseur}}{${f2.den * diviseur}}$`,
    ]
  }

  versionAleatoire = () => {
    const listeFrac1 = [
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [2, 5],
      [3, 5],
      [4, 5],
    ]
    const listeFrac2 = [
      [6, 7],
      [8, 7],
      [5, 6],
      [7, 6],
      [9, 7],
    ]

    const frac1 = choice(listeFrac1)
    const frac2 = choice(listeFrac2)
    const f1 = new FractionEtendue(frac1[0], frac1[1])
    const f2 = new FractionEtendue(frac2[0], frac2[1])

    const a = frac2[1] * randint(2, 7)
    const k = randint(2, 6) * 2
    const f3 = new FractionEtendue(frac1[1] * k, frac1[1] * k + 1)
    const f4 = new FractionEtendue(k, k - 2)
    const kdec = choice([1.5, 2.5])
    const diviseur = randint(2, 6)

    // Précalculs des résultats
    const resDiv1 = new FractionEtendue(f1.num, f1.den * diviseur)
    const resProd1 = f1.produitFraction(f3)
    const diff = f2.differenceFraction(f1)
    const resProd2 = f2.produitFraction(a)
    const resDiv2 = f1.diviseFraction(f2)
    const resSommeSimplif = new FractionEtendue(
      f1.num + diviseur,
      f1.den + diviseur,
    )

    // Bonnes réponses avec leurs corrections
    const bonnesReponses = [
      {
        texte: `$\\dfrac{${f1.texFraction}}{${diviseur}}= ${resDiv1.texFractionSimplifiee}$`,
        corr: this.correctionBonneReponse(
          `\\dfrac{${f1.texFraction}}{${diviseur}}= ${resDiv1.texFractionSimplifiee}`,
          `$\\dfrac{${f1.texFraction}}{${diviseur}}=${f1.texFraction}\\times \\dfrac{1}{${diviseur}}=\\dfrac{${f1.num}}{${f1.den}\\times ${diviseur}}=${resDiv1.texFractionSimplifiee}$`,
        ),
      },
      {
        texte: `$${f4.texFraction}= \\dfrac{${texNombre(kdec * f4.num)}}{${kdec * f4.den}}$`,
        corr: this.correctionBonneReponse(
          `${f4.texFraction}= \\dfrac{${texNombre(kdec * f4.num)}}{${kdec * f4.den}}`,
          `$${f4.texFraction}=\\dfrac{${f4.num}\\times ${texNombre(kdec)}}{${f4.den}\\times ${texNombre(kdec)}}=\\dfrac{${texNombre(kdec * f4.num)}}{${kdec * f4.den}}$`,
        ),
      },
      {
        texte: `$${f1.texFraction}\\times${f3.texFraction}= ${resProd1.texFractionSimplifiee}$`,
        corr: this.correctionBonneReponse(
          `${f1.texFraction}\\times${f3.texFraction}= ${resProd1.texFractionSimplifiee}`,
          `$${f1.texFraction}\\times${f3.texFraction}=\\dfrac{${f1.num}\\times ${f3.num}}{${f1.den}\\times ${f3.den}}=\\dfrac{${f1.num * f3.num}}{${f1.den * f3.den}}=${resProd1.texFractionSimplifiee}$`,
        ),
      },
      {
        texte: `$${f1.texFraction}${diff.texFractionSignee}=${f2.texFraction}$`,
        corr: this.correctionBonneReponse(
          `${f1.texFraction}${diff.texFractionSignee}=${f2.texFraction}`,
          `$${f1.texFraction}${diff.texFractionSignee}=${f1.sommeFraction(diff).texFractionSimplifiee}=${f2.texFraction}$`,
        ),
      },
      {
        texte: `$${a}\\times${f2.texFraction}= ${resProd2.texFractionSimplifiee}$`,
        corr: this.correctionBonneReponse(
          `${a}\\times${f2.texFraction}= ${resProd2.texFractionSimplifiee}`,
          `$${a}\\times${f2.texFraction}=\\dfrac{${a}\\times ${f2.num}}{${f2.den}}=\\dfrac{${a * f2.num}}{${f2.den}}=${resProd2.texFractionSimplifiee}$`,
        ),
      },
      {
        texte: `$${f1.texFraction}\\div ${diviseur}= ${resDiv1.texFractionSimplifiee}$`,
        corr: this.correctionBonneReponse(
          `${f1.texFraction}\\div ${diviseur}= ${resDiv1.texFractionSimplifiee}`,
          `$${f1.texFraction}\\div ${diviseur}=${f1.texFraction}\\times \\dfrac{1}{${diviseur}}=\\dfrac{${f1.num}}{${f1.den}\\times ${diviseur}}=\\dfrac{${f1.num}}{${f1.den * diviseur}}=${resDiv1.texFractionSimplifiee}$`,
        ),
      },
      {
        texte: `$${f1.texFraction}\\div ${f2.texFraction}= ${resDiv2.texFractionSimplifiee}$`,
        corr: this.correctionBonneReponse(
          `${f1.texFraction}\\div ${f2.texFraction}= ${resDiv2.texFractionSimplifiee}`,
          `$${f1.texFraction}\\div ${f2.texFraction}=${f1.texFraction}\\times \\dfrac{${f2.den}}{${f2.num}}=\\dfrac{${f1.num}\\times ${f2.den}}{${f1.den}\\times ${f2.num}}=\\dfrac{${f1.num * f2.den}}{${f1.den * f2.num}}=${resDiv2.texFractionSimplifiee}$`,
        ),
      },
    ]

    // Mauvaises réponses avec leurs corrections
    const mauvaisesReponses = [
      {
        texte: `$\\dfrac{${f2.texFraction}}{${diviseur}}=\\dfrac{${f2.num * diviseur}}{${f2.den}}$`,
        corr: this.correctionMauvaiseReponse(
          `\\dfrac{${f2.texFraction}}{${diviseur}}=\\dfrac{${f2.num * diviseur}}{${f2.den}}`,
          `$\\dfrac{${f2.texFraction}}{${diviseur}}=\\dfrac{${f2.num}}{${f2.den}\\times ${diviseur}}=\\dfrac{${f2.num}}{${f2.den * diviseur}}\\neq \\dfrac{${f2.num * diviseur}}{${f2.den}}$`,
        ),
      },
      {
        texte: `$${f1.texFraction}-${diviseur}=${f1.differenceFraction(diviseur).oppose().texFractionSimplifiee}$`,
        corr: this.correctionMauvaiseReponse(
          `${f1.texFraction}-${diviseur}=${f1.differenceFraction(diviseur).oppose().texFractionSimplifiee}`,
          `$${f1.texFraction}-${diviseur}=${f1.texFraction}-\\dfrac{${diviseur}}{1}=\\dfrac{${f1.num}-${f1.den * diviseur}}{${f1.den}}=${f1.differenceFraction(diviseur).texFractionSimplifiee}\\neq ${f1.differenceFraction(diviseur).oppose().texFractionSimplifiee}$`,
        ),
      },
      {
        texte: `$${f1.texFraction}+${f2.texFraction}=\\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$`,
        corr: this.correctionMauvaiseReponse(
          `${f1.texFraction}+${f2.texFraction}=\\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}`,
          `On ne peut pas additionner directement les numérateurs et les dénominateurs. <br>
          Il faut d'abord mettre au même dénominateur : $${f1.texFraction}+${f2.texFraction}=${f1.sommeFraction(f2).texFractionSimplifiee}\\neq \\dfrac{${f1.num + f2.num}}{${f1.den + f2.den}}$.`,
        ),
      },
      {
        texte: `$\\dfrac{${f1.num}+${diviseur}}{${f1.den}+${diviseur}}=${f1.texFraction}$`,
        corr: this.correctionMauvaiseReponse(
          `\\dfrac{${f1.num}+${diviseur}}{${f1.den}+${diviseur}}=${f1.texFraction}`,
          `On ne peut pas simplifier par $${diviseur}$ car $${diviseur}$ est additionné au numérateur et au dénominateur et pas multiplié.<br>On peut écrire : $\\dfrac{${f1.num}+${diviseur}}{${f1.den}+${diviseur}}=\\dfrac{${f1.num + diviseur}}{${f1.den + diviseur}}${resSommeSimplif.texSimplificationAvecEtapes(true)}\\neq ${f1.texFraction}$.`,
        ),
      },
      {
        texte: `$${f2.texFraction}=\\dfrac{${f2.num ** 2}}{${f2.den ** 2}}$`,
        corr: this.correctionMauvaiseReponse(
          `${f2.texFraction}=\\dfrac{${f2.num ** 2}}{${f2.den ** 2}}`,
          `$\\dfrac{${f2.num ** 2}}{${f2.den ** 2}}=\\left(${f2.texFraction}\\right)^2\\neq ${f2.texFraction}$`,
        ),
      },
      {
        texte: `$${f2.texFraction}\\times\\dfrac{${f2.num + 2}}{${f2.den}}=\\dfrac{${f2.num * (f2.num + 2)}}{${f2.den}}$`,
        corr: this.correctionMauvaiseReponse(
          `${f2.texFraction}\\times\\dfrac{${f2.num + 2}}{${f2.den}}=\\dfrac{${f2.num * (f2.num + 2)}}{${f2.den}}`,
          `$${f2.texFraction}\\times\\dfrac{${f2.num + 2}}{${f2.den}}=\\dfrac{${f2.num}\\times ${f2.num + 2}}{${f2.den}\\times ${f2.den}}=\\dfrac{${f2.num * (f2.num + 2)}}{${f2.den ** 2}}\\neq \\dfrac{${f2.num * (f2.num + 2)}}{${f2.den}}$`,
        ),
      },
      {
        texte: `$${diviseur}\\times ${f2.texFraction}=\\dfrac{${f2.num * diviseur}}{${f2.den * diviseur}}$`,
        corr: this.correctionMauvaiseReponse(
          `${diviseur}\\times ${f2.texFraction}=\\dfrac{${f2.num * diviseur}}{${f2.den * diviseur}}`,
          `$${diviseur}\\times ${f2.texFraction}=\\dfrac{${diviseur}\\times ${f2.num}}{${f2.den}}=\\dfrac{${f2.num * diviseur}}{${f2.den}}\\neq \\dfrac{${f2.num * diviseur}}{${f2.den * diviseur}}$`,
        ),
      },
      {
        texte: `$${diviseur}\\div ${f2.texFraction}=\\dfrac{${f2.num}}{${f2.den * diviseur}}$`,
        corr: this.correctionMauvaiseReponse(
          `${diviseur}\\div ${f2.texFraction}=\\dfrac{${f2.num}}{${f2.den * diviseur}}`,
          `$${diviseur}\\div ${f2.texFraction}=${diviseur}\\times \\dfrac{${f2.den}}{${f2.num}}=\\dfrac{${diviseur}\\times ${f2.den}}{${f2.num}}=\\dfrac{${diviseur * f2.den}}{${f2.num}}\\neq \\dfrac{${f2.num}}{${f2.den * diviseur}}$`,
        ),
      },
    ]

    // Sélection aléatoire et construction de la correction
    const bonneReponse = choice(bonnesReponses)
    const mauvaisesList = shuffle(mauvaisesReponses).slice(0, 3)

    this.enonce =
      'Parmi les égalités suivantes, une seule est correcte. Laquelle ?'

    this.correction = bonneReponse.corr
    for (const mauvaise of mauvaisesList) {
      this.correction += mauvaise.corr
    }

    this.reponses = [
      bonneReponse.texte,
      mauvaisesList[0].texte,
      mauvaisesList[1].texte,
      mauvaisesList[2].texte,
    ]
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Dans un QCM, on peut procéder par élimination.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Observer l'opération écrite dans chaque proposition.</li>
    <li>Éliminer les propositions clairement fausses.</li>
    <li>Tester les propositions restantes une par une.</li>
    <li>Vérifier qu'une seule proposition résiste aux calculs.</li>
  </ul>`
    this.spacingCorr = 3
    this.versionAleatoire()
  }
}
