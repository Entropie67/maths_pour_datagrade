import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '22/12/2025'
export const uuid = '6850f'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-R01-5', '2A-R1-5'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer avec des pourcentages'
export default class AutoARO1e extends ExerciceQcmA {
  private appliquerLesValeurs(
    p1: number,
    n1: number,
    r1: number,
    p2: number,
    n2: number,
    r2: number,
    p3: number,
    n3: number,
    r3: number,
    p4: number,
    n4: number,
    r4: number,
    max: number,
  ): void {
    this.enonce = `Parmi les nombres suivants, lequel est le plus grand ?`

    let correctionTexte =
      "• Prendre $25\\,\\%$ d'une valeur revient à la diviser par $4$.<br>"
    correctionTexte +=
      "• Prendre $10\\,\\%$ d'une valeur revient à la diviser par $10$.<br>"
    correctionTexte +=
      "• Prendre $20\\,\\%$ d'une valeur revient à en prendre deux fois $10\\,\\%$.<br>"
    correctionTexte +=
      "• Prendre $5\\,\\%$ d'une valeur revient à en prendre la moitié de $10\\,\\%$.<br>"

    const calculs = [
      { pourcent: p1, nombre: n1, resultat: r1 },
      { pourcent: p2, nombre: n2, resultat: r2 },
      { pourcent: p3, nombre: n3, resultat: r3 },
      { pourcent: p4, nombre: n4, resultat: r4 },
    ]

    for (const calc of calculs) {
      if (calc.pourcent === 25) {
        correctionTexte += `$${calc.pourcent}\\,\\%$ de $${calc.nombre}=\\dfrac{${calc.nombre}}{4}=${texNombre(calc.resultat)}$<br>`
      } else if (calc.pourcent === 10) {
        correctionTexte += `$${calc.pourcent}\\,\\%$ de $${calc.nombre}=\\dfrac{${calc.nombre}}{10}=${texNombre(calc.resultat)}$<br>`
      } else if (calc.pourcent === 20) {
        const dixPourcent = calc.nombre / 10
        correctionTexte += `$${calc.pourcent}\\,\\%$ de $${calc.nombre}=2\\times \\dfrac{${calc.nombre}}{10}=2\\times ${texNombre(dixPourcent)}=${texNombre(calc.resultat)}$<br>`
      } else if (calc.pourcent === 5) {
        const dixPourcent = calc.nombre / 10
        correctionTexte += `$${calc.pourcent}\\,\\%$ de $${calc.nombre}=\\dfrac{1}{2}\\times \\dfrac{${calc.nombre}}{10}=\\dfrac{${dixPourcent}}{2}=${texNombre(calc.resultat)}$<br>`
      }
    }

    // Trouver quel calcul donne le max pour la conclusion
    let pBon, nBon
    if (r1 === max) {
      pBon = p1
      nBon = n1
    } else if (r2 === max) {
      pBon = p2
      nBon = n2
    } else if (r3 === max) {
      pBon = p3
      nBon = n3
    } else {
      pBon = p4
      nBon = n4
    }
    const bonCalculTexte = `$${miseEnEvidence(pBon + '\\,\\%')}$ ${texteEnCouleurEtGras('de')} $${miseEnEvidence(nBon)}$`

    correctionTexte += `Le plus grand résultat est donc donné par le calcul ${bonCalculTexte} $ =${texNombre(max)}$.`

    this.correction = correctionTexte

    // La première réponse est la bonne (celle qui donne max)
    let bonCalcul = ''
    if (r1 === max) bonCalcul = `$${p1}\\,\\%$ de $${n1}$`
    else if (r2 === max) bonCalcul = `$${p2}\\,\\%$ de $${n2}$`
    else if (r3 === max) bonCalcul = `$${p3}\\,\\%$ de $${n3}$`
    else if (r4 === max) bonCalcul = `$${p4}\\,\\%$ de $${n4}$`

    this.reponses = [
      bonCalcul,
      `$${p1}\\,\\%$ de $${n1}$`,
      `$${p2}\\,\\%$ de $${n2}$`,
      `$${p3}\\,\\%$ de $${n3}$`,
      `$${p4}\\,\\%$ de $${n4}$`,
    ].filter((item, index, self) => self.indexOf(item) === index)

    this.reponses = this.reponses.slice(0, 4)
  }

  versionOriginale: () => void = () => {
    // 25% de 72 = 18
    // 10% de 193 = 19.3 (max)
    // 5% de 350 = 17.5
    // 20% de 95 = 19
    this.appliquerLesValeurs(
      25,
      72,
      18,
      10,
      193,
      19.3,
      5,
      350,
      17.5,
      20,
      95,
      19,
      19.3,
    )
  }

  versionAleatoire: () => void = () => {
    const listeModeles = [
      // Modèle 1: max = 10% (résultat ~20)
      // Contraintes: n10/10 > n25/4, n10/10 > n5/20, n10/10 > n20/5
      {
        base25: [72, 76], // /4 = 18-19
        base10: [201, 204], // /10 = 20.1-20.4 MAX
        base5: [380, 390], // /20 = 19-19.5
        base20: [90, 95], // /5 = 18-19
        maxType: 10,
      },

      // Modèle 2: max = 5% (résultat ~24)
      // Contraintes: n5/20 > n25/4, n5/20 > n10/10, n5/20 > n20/5
      {
        base25: [84, 88], // /4 = 21-22
        base10: [215, 220], // /10 = 21.5-22
        base5: [480, 490], // /20 = 24-24.5 MAX
        base20: [110, 115], // /5 = 22-23
        maxType: 5,
      },

      // Modèle 3: max = 10% (résultat ~18.5)
      {
        base25: [64, 68], // /4 = 16-17
        base10: [184, 187], // /10 = 18.4-18.7 MAX
        base5: [340, 350], // /20 = 17-17.5
        base20: [85, 90], // /5 = 17-18
        maxType: 10,
      },

      // Modèle 4: max = 10% (résultat ~27.5)
      {
        base25: [80, 100], // /4 = 20-25
        base10: [274, 277], // /10 = 27.4-27.7 MAX
        base5: [500, 530], // /20 = 25-26.5
        base20: [120, 130], // /5 = 24-26
        maxType: 10,
      },

      // Modèle 5: max = 20% (résultat ~33)
      // Contraintes: n20/5 > n25/4, n20/5 > n10/10, n20/5 > n5/20
      {
        base25: [120, 124], // /4 = 30-31
        base10: [310, 320], // /10 = 31-32
        base5: [600, 620], // /20 = 30-31
        base20: [165, 170], // /5 = 33-34 MAX
        maxType: 20,
      },

      // Modèle 6: max = 10% (résultat ~15.5)
      {
        base25: [56], // /4 = 14
        base10: [152, 155], // /10 = 15.2-15.5 MAX
        base5: [290], // /20 = 14.5
        base20: [72], // /5 = 14.4
        maxType: 10,
      },

      // Modèle 7: max = 25% (résultat ~25)
      // Contraintes: n25/4 > n10/10, n25/4 > n5/20, n25/4 > n20/5
      {
        base25: [96, 100], // /4 = 24-25 MAX
        base10: [220, 230], // /10 = 22-23
        base5: [440, 460], // /20 = 22-23
        base20: [105, 115], // /5 = 21-23
        maxType: 25,
      },

      // Modèle 8: max = 20% (résultat ~22)
      {
        base25: [72], // /4 = 18
        base10: [190], // /10 = 19
        base5: [390], // /20 = 19.5
        base20: [110, 115], // /5 = 22-23 MAX
        maxType: 20,
      },

      // Modèle 9: max = 5% (résultat ~29)
      {
        base25: [108], // /4 = 27
        base10: [265], // /10 = 26.5
        base5: [580, 590], // /20 = 29-29.5 MAX
        base20: [140], // /5 = 28
        maxType: 5,
      },

      // Modèle 10: max = 25% (résultat ~17.5)
      {
        base25: [68, 72], // /4 = 17-18 MAX
        base10: [160], // /10 = 16
        base5: [330], // /20 = 16.5
        base20: [82], // /5 = 16.4
        maxType: 25,
      },

      // Modèle 11: max = 20% (résultat ~24)
      {
        base25: [80, 84], // /4 = 20-21
        base10: [205, 208, 210], // /10 = 20.5-21
        base5: [400, 420], // /20 = 20-21
        base20: [120, 125], // /5 = 24-25 MAX
        maxType: 20,
      },

      // Modèle 12: max = 25% (résultat ~26-27)
      {
        base25: [104, 108], // /4 = 26-27 MAX
        base10: [240, 245], // /10 = 24-24.5
        base5: [490, 500], // /20 = 24.5-25
        base20: [120, 125], // /5 = 24-25
        maxType: 25,
      },
    ]

    const modele = choice(listeModeles)

    // Générer les valeurs aléatoires pour chaque type de calcul
    const n1 = choice(modele.base25)
    const r1 = n1 / 4

    const n2 = choice(modele.base10)
    const r2 = n2 / 10

    const n3 = choice(modele.base5)
    const r3 = n3 / 20

    const n4 = choice(modele.base20)
    const r4 = n4 / 5

    // Déterminer le max selon le type
    let max: number = r2
    if (modele.maxType === 25) max = r1
    else if (modele.maxType === 10) max = r2
    else if (modele.maxType === 5) max = r3
    else if (modele.maxType === 20) max = r4

    this.appliquerLesValeurs(25, n1, r1, 10, n2, r2, 5, n3, r3, 20, n4, r4, max)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacingCorr = 2.5
  }
}
