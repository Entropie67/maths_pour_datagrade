import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  texteGras,
  texteItalique,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fb6e1'
export const refs = {
  'fr-fr': ['3Z1DNB-10'],
  'fr-ch': ['11CTFA2H-15', '11LCFA2H-5', '11LSFA2H-5'],
}
export const titre =
  'Préparation DNB : Fonctions, équation, statistiques, volume'
export const dateDePublication = '05/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3F14DNB2 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction =
      texteItalique(
        "D'après l'exercice $3$ du brevet Métropole Septembre 2023.",
      ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
    entrees: number[],
    L: number,
    l: number,
    p: number,
  ): void {
    const currentYear = new Date().getFullYear()
    this.enonce = `
Une piscine propose deux tarifs d'entrée pour l'année ${currentYear}.<br>
${texteGras('Tarif A')}${sp()}: $${texPrix(a)}$ € l'entrée.<br>
${texteGras('Tarif B')}${sp()}: $${texPrix(b)}$ € l'entrée avec une carte d'abonnement de $${texPrix(c)}$ € valable toute l'année.<br>`
    const listeQuestions1 = createList({
      items: [
        `Quel est le prix total pour $${d}$ entrées avec le tarif A${sp()}?`,
        `Quel est le prix total pour $${d}$ entrées avec le tarif B${sp()}?`,
      ],
      style: 'alpha',
    })
    const question2 = `On note $f$ et $g$ les fonctions qui modélisent les prix, en euro, respectivement du tarif A et du tarif B en fonction du nombre $x$ d'entrées.<br>
Donner l'expression de $f(x)$, puis celle de $g(x)$.`
    const listeQuestions3 = createList({
      items: [
        `Résoudre l'équation $${texPrix(a)}x = ${texPrix(b)}x + ${texPrix(c)}$.`,
        `Quel est le nombre d'entrées pour lequel les tarifs A et B donnent le même prix à payer${sp()}?`,
      ],
      style: 'alpha',
    })
    const tableau = tableauColonneLigne(
      [
        'Mois',
        'Jan.',
        'Fév.',
        'Mars',
        'Avr.',
        'Mai',
        'Juin',
        'Juil.',
        'Août',
        'Sept.',
        'Oct.',
        'Nov.',
        'Déc.',
      ].map((el) => `\\text{${el}}`),
      ['\\text{Entrées}'],
      entrees.map((el) => texNombre(el, 0)),
    )
    const listeQuestions4 = createList({
      items: [
        "Calculer le nombre moyen d'entrées par mois.",
        "Calculer l'étendue du nombre d'entrées par mois.",
      ],
      style: 'alpha',
    })
    const question4 = `On relève le nombre d'entrées par mois durant une année.

${tableau.replace('\\begin{array}', '\\hspace{-1.5cm}\n\\begin{array}')}
${listeQuestions4}`
    const question5 = `La piscine a la forme d'un pavé droit de longueur $${L}\\text{ m}$, de largeur $${l}\\text{ m}$ et de profondeur $${texNombre(p, 2)}\\text{ m}$.<br>
En admettant qu'elle soit entièrement remplie, déterminer en $\\text{ m}^3$, le volume d'eau qui sera évacué pour réaliser la vidange.`
    const listeQuestions = createList({
      items: [
        listeQuestions1,
        question2,
        listeQuestions3,
        question4,
        question5,
      ],
      style: 'nombres',
    })
    this.enonce += listeQuestions
    const listeCorrections1 = createList({
      items: [
        `Le prix total pour $${d}$ entrées avec le tarif A est de $${d}\\times ${texPrix(a)}=${miseEnEvidence(texPrix(a * d))}$ €.`,
        `Le prix total pour $${d}$ entrées avec le tarif B est de $${d}\\times ${texPrix(b)}+${texPrix(c)}=${texPrix(b * d)}+${texPrix(c)}=${miseEnEvidence(texPrix(b * d + c))}$ €.`,
      ],
      style: 'alpha',
    })
    const correction2 = `On note $f$ et $g$ les fonctions qui modélisent les prix, en euro, respectivement du tarif A et du tarif B en fonction du nombre $x$ d'entrées.<br>
$f(x) = ${miseEnEvidence(`${texPrix(a)}x`)}$ et $g(x) = ${miseEnEvidence(`${texPrix(b)}x + ${texPrix(c)}`)}$.`
    const listeCorrections3 = createList({
      items: [
        `On a $${texPrix(a)}x = ${texPrix(b)}x + ${texPrix(c)}$<br>
        d'où $${texPrix(a)}x - ${texPrix(b)}x = ${texPrix(c)}$<br>
        soit $${texPrix(a - b)}x = ${texPrix(c)}$<br>
        donc $x = \\dfrac{${texPrix(c)}}{${texPrix(a - b)}}$<br>
        soit $x = ${miseEnEvidence(texNombre(c / (a - b), 0))}$<br>`,
        `D'après la solution de l'équation précédente, le nombre d'entrées pour lequel les tarifs A et B donnent le même prix à payer est de $${miseEnEvidence(texNombre(c / (a - b), 0))}$ entrées.`,
      ],
      style: 'alpha',
    })
    const listeCorrections4 = createList({
      items: [
        `Le nombre moyen d'entrées par mois est de${sp()}:<br>$\\dfrac{${texNombre(entrees[0])}+${texNombre(entrees[1])}+\\ldots+${texNombre(entrees[11])}}{12}=\\dfrac{${texNombre(entrees.reduce((a, b) => a + b, 0))}}{12} = ${miseEnEvidence(texNombre(entrees.reduce((a, b) => a + b, 0) / 12, 0))}$ entrées.`,
        `L'étendue du nombre d'entrées par mois est de $${texNombre(Math.max(...entrees), 0)}-${texNombre(Math.min(...entrees), 0)}=${miseEnEvidence(texNombre(Math.max(...entrees) - Math.min(...entrees), 0))}$ entrées.`,
      ],
      style: 'alpha',
    })
    const correction4 = listeCorrections4
    const correction5 = `Le volume d'eau qui sera évacué pour réaliser la vidange est de${sp()}:<br>$${L}\\times ${l}\\times ${texNombre(p, 1)}=${miseEnEvidence(texNombre(L * l * p, 2))}\\text{ m}^3$.`
    const listeCorrections = createList({
      items: [
        listeCorrections1,
        correction2,
        listeCorrections3,
        correction4,
        correction5,
      ],
      style: 'nombres',
    })
    this.correction = listeCorrections
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      5.9,
      4.4,
      30,
      10,
      [
        12500, 13700, 10400, 13600, 12300, 11700, 10400, 11600, 10200, 13800,
        12600, 11800,
      ],
      50,
      25,
      3,
    )
  }

  versionAleatoire: () => void = () => {
    let a: number
    let b: number
    let c: number
    let d: number
    let coeff: number
    let diff: number
    do {
      a = (randint(4, 6) * 10 + randint(1, 8)) / 10
      diff = randint(6, 18, 10) / 5
      coeff = choice([5, 10, 15])
      d = choice([5, 10, 15, 20], [coeff])
      c = coeff * diff
      b = a - diff
    } while (Number.isInteger(b))
    const entreesParCent = []
    const dejaPris: number[] = [0]
    const moyenne = randint(101, 119, 110)
    for (let i = 0; i < 12; i += 2) {
      const delta = randint(0, 10, dejaPris)
      dejaPris.push(delta)
      entreesParCent.push(moyenne + delta * 3, moyenne - delta * 3)
    }
    const entrees = shuffle(entreesParCent).map((el) => el * 100)
    const L = choice([50, 25])
    const l = choice([22, 16, 20, 18])
    const p = choice([3, 2.5, 2, 1.8])
    this.appliquerLesValeurs(a, b, c, d, entrees, L, l, p)
  }
}
