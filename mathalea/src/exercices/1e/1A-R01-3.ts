import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'

export const dateDePublication = '08/07/2025'
export const uuid = 'b41f1'

export const refs = {
  'fr-fr': ['1A-R01-3', '2A-R1-3', 'BP1SP06'],
  'fr-ch': ['10CTFA1C-7', '10LCFA1C-7', '10LSFA1C-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un pourcentage (opération)'

export default class Pourcentages extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = "L'opération qui permet de calculer $25\\,\\%$ de $480$ est :"
    this.correction = `Pour calculer $25\\,\\%$ de $480$, on peut utiliser la formule :<br>
    $\\text{Pourcentage} = \\dfrac{\\text{taux}}{100} \\times \\text{nombre}$.<br><br>
    Donc : $25\\,\\% \\text{ de } 480 = \\dfrac{25}{100} \\times 480 = ${miseEnEvidence('\\dfrac{25 \\times 480}{100}')}$.<br><br>
    On peut aussi écrire : $25\\,\\% = \\dfrac{25}{100} = \\dfrac{1}{4}$.<br>
    Donc : $25\\,\\% \\text{ de } 480 = \\dfrac{1}{4} \\times 480 = ${miseEnEvidence('120')}$.`

    this.reponses = [
      '$\\dfrac{1}{4} \\times 480$',
      '$\\dfrac{480}{25\\times 100}$',
      '$25 \\times 480 \\times 0,1$',
      '$\\dfrac{480\\times 100}{25}$',
    ]
  }

  versionAleatoire = () => {
    // Génération d'un pourcentage multiple de 5 ou 10
    const pourcentagesMultiples = [
      5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80, 90,
    ]
    const pourcentage = choice(pourcentagesMultiples)

    // Génération d'un nombre multiple de 10
    const multiples10 = [
      120, 140, 160, 180, 200, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420,
      440, 460, 480, 500, 520, 540, 560, 580, 600,
    ]
    const nombre = choice(multiples10)

    // Calcul de la fraction simplifiée si possible
    const pgcd = (a: number, b: number): number => {
      while (b !== 0) {
        const temp = b
        b = a % b
        a = temp
      }
      return a
    }

    const diviseur = pgcd(pourcentage, 100)
    const numSimp = pourcentage / diviseur
    const denSimp = 100 / diviseur

    this.enonce = `L'opération qui permet de calculer $${pourcentage}\\,\\%$ de $${texNombre(nombre)}$ est :`

    // Tableau des bonnes réponses possibles
    const bonnesReponses = [
      `$\\dfrac{${pourcentage} \\times ${texNombre(nombre)}}{100}$`,
      `$\\dfrac{${pourcentage}}{100} \\times ${texNombre(nombre)}$`,
      `$${texNombre(pourcentage / 100, 2)} \\times ${texNombre(nombre)}$`,
    ]

    // Ajouter la fraction simplifiée si elle existe
    if (denSimp !== 100) {
      bonnesReponses.push(
        `$\\dfrac{${numSimp}}{${denSimp}} \\times ${texNombre(nombre)}$`,
      )
    }

    // Ajouter d'autres formes équivalentes selon le pourcentage
    if (pourcentage === 25) {
      bonnesReponses.push(`$\\dfrac{${texNombre(nombre)}}{4}$`)
    } else if (pourcentage === 20) {
      bonnesReponses.push(`$\\dfrac{${texNombre(nombre)}}{5}$`)
    } else if (pourcentage === 10) {
      bonnesReponses.push(`$\\dfrac{${texNombre(nombre)}}{10}$`)
    } else if (pourcentage === 5) {
      bonnesReponses.push(`$\\dfrac{${texNombre(nombre)}}{20}$`)
    } else if (pourcentage === 40) {
      bonnesReponses.push(`$\\dfrac{2 \\times ${texNombre(nombre)}}{5}$`)
    } else if (pourcentage === 35) {
      bonnesReponses.push(`$\\dfrac{7 \\times ${texNombre(nombre)}}{20}$`)
    } else if (pourcentage === 30) {
      bonnesReponses.push(`$\\dfrac{3 \\times ${texNombre(nombre)}}{10}$`)
    } else if (pourcentage === 15) {
      bonnesReponses.push(`$\\dfrac{3 \\times ${texNombre(nombre)}}{20}$`)
    } else if (pourcentage === 60) {
      bonnesReponses.push(`$\\dfrac{3 \\times ${texNombre(nombre)}}{5}$`)
    } else if (pourcentage === 70) {
      bonnesReponses.push(`$\\dfrac{7 \\times ${texNombre(nombre)}}{10}$`)
    } else if (pourcentage === 75) {
      bonnesReponses.push(`$\\dfrac{3 \\times ${texNombre(nombre)}}{4}$`)
    } else if (pourcentage === 80) {
      bonnesReponses.push(`$\\dfrac{4 \\times ${texNombre(nombre)}}{5}$`)
    } else if (pourcentage === 90) {
      bonnesReponses.push(`$\\dfrac{9 \\times ${texNombre(nombre)}}{10}$`)
    } else if (pourcentage === 45) {
      bonnesReponses.push(`$\\dfrac{9 \\times ${texNombre(nombre)}}{20}$`)
    } else if (pourcentage === 55) {
      bonnesReponses.push(`$\\dfrac{11 \\times ${texNombre(nombre)}}{20}$`)
    } else if (pourcentage === 65) {
      bonnesReponses.push(`$\\dfrac{13 \\times ${texNombre(nombre)}}{20}$`)
    }

    // Tableau des mauvaises réponses possibles
    const mauvaisesReponses = [
      `$\\dfrac{${texNombre(nombre)}}{${pourcentage} \\times 100}$`, // Division au lieu de multiplication
      `$\\dfrac{${texNombre(nombre)} \\times 100}{${pourcentage}}$`, // Formule inversée
      `$${pourcentage} \\times ${texNombre(nombre)} \\times 0,1$`, // Multiplication par 0,1 au lieu de division par 100
      `$${texNombre(pourcentage, 2)} \\times ${texNombre(nombre)}\\times 100$`, // Multiplication par 0,01 (confusion avec décimal)
      `$${texNombre(nombre)} \\times ${texNombre(pourcentage / 1000)}$`, // Confusion avec les millièmes
      `$\\dfrac{${pourcentage}}{${texNombre(nombre)}} \\times 100$`, // Ordre inversé
      `$${texNombre(nombre)} \\times ${pourcentage} \\times 0,001$`, // Facteur complètement faux
    ]
    if (pourcentage !== 10) {
      // Cas particulier à éviter : 10% = 1/10 !
      mauvaisesReponses.push(`$\\dfrac{${texNombre(nombre)}}{${pourcentage}}$`)
    }

    // Sélection d'une bonne réponse
    const bonneReponse = choice(bonnesReponses)

    // Sélection de 3 mauvaises réponses distinctes
    const mauvaisesReponsesFiltrees = mauvaisesReponses.filter(
      (rep) => rep !== bonneReponse,
    )
    const troisMauvaisesReponses: string[] = []

    while (
      troisMauvaisesReponses.length < 3 &&
      mauvaisesReponsesFiltrees.length > 0
    ) {
      const mauvaise = choice(mauvaisesReponsesFiltrees)
      if (!troisMauvaisesReponses.includes(mauvaise)) {
        troisMauvaisesReponses.push(mauvaise)
      }
      // Retirer la réponse sélectionnée pour éviter les doublons
      const index = mauvaisesReponsesFiltrees.indexOf(mauvaise)
      mauvaisesReponsesFiltrees.splice(index, 1)
    }

    const calculDeBase = `${texNombre(pourcentage / 100, 2)} \\times ${texNombre(nombre)}`
    const bonneReponseSansSymboles = bonneReponse.replace(/\$/g, '')

    // Vérifier si la bonne réponse est différente du calcul de base
    if (bonneReponseSansSymboles === calculDeBase) {
      // Si c'est la même chose, pas besoin de "soit encore"
      this.correction = `Pour calculer $${pourcentage}\\,\\%$ de $${texNombre(nombre)}$, on effectue le calcul $${miseEnEvidence(calculDeBase)}$.`
    } else {
      // Si la bonne réponse est la fraction irréductible, on détaille le passage depuis la valeur décimale
      if (!bonneReponseSansSymboles.includes('100')) {
        this.correction = `Pour calculer $${pourcentage}\\,\\%$ de $${texNombre(nombre)}$, on effectue le calcul $${calculDeBase}$.<br>
        Comme $${texNombre(pourcentage / 100, 2)} = \\dfrac{${pourcentage}}{100} = \\dfrac{${numSimp}}{${denSimp}}$, alors $${pourcentage}\\,\\%$ de $${texNombre(nombre)}$ est égal à $${miseEnEvidence(bonneReponseSansSymboles)}$.`
      } else {
        // Si c'est différent, alors on peut dire "soit encore"
        this.correction = `Pour calculer $${pourcentage}\\,\\%$ de $${texNombre(nombre)}$, on effectue le calcul $${texNombre(pourcentage / 100, 2)} \\times ${texNombre(nombre)}$, soit encore $${miseEnEvidence(bonneReponseSansSymboles)}$.`
      }
    }
    // Construction du tableau final avec exactement 4 réponses
    this.reponses = [bonneReponse, ...troisMauvaisesReponses]
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
