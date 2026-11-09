import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le plus petit ensemble auquel appartient le résultat d’un calcul'
export const dateDePublication = '24/09/2026'
export const uuid = 'ec6e7'
export const interactifReady = true

export const refs = { 'fr-fr': ['2N10-4'], 'fr-ch': ['11LCNO5A-3', '11LSNO5A-3'] }

type Ensemble =
  '\\mathbb{N}' | '\\mathbb{Z}' | '\\mathbb{D}' | '\\mathbb{Q}' | '\\mathbb{R}'
type Famille =
  | 'quotientDifference'
  | 'sommeFractionsUn'
  | 'differenceFractionRacineNaturel'
  | 'racineNegative'
  | 'differenceRacines'
  | 'soustractionNegative'
  | 'differenceFractionRacineRelatif'
  | 'fractionDecimale'
  | 'sommeDecimale'
  | 'fractionRationnelle'
  | 'sommeRationnelle'
  | 'racineIrrationnelle'
  | 'entierPlusRacine'
  | 'multiplePi'
type Calcul = { expression: string; correction: string; reponse: Ensemble }

const famillesParEnsemble: Record<Ensemble, Famille[]> = {
  '\\mathbb{N}': [
    'quotientDifference',
    'sommeFractionsUn',
    'differenceFractionRacineNaturel',
  ],
  '\\mathbb{Z}': [
    'racineNegative',
    'differenceRacines',
    'soustractionNegative',
    'differenceFractionRacineRelatif',
  ],
  '\\mathbb{D}': ['fractionDecimale', 'sommeDecimale'],
  '\\mathbb{Q}': ['fractionRationnelle', 'sommeRationnelle'],
  '\\mathbb{R}': ['racineIrrationnelle', 'entierPlusRacine', 'multiplePi'],
}
const toutesLesFamilles = Object.values(famillesParEnsemble).flat()
function conclusion(ensemble: Ensemble): string {
  return `Ce nombre appartient donc à $${miseEnEvidence(ensemble)}$.`
}

function conclusionApresVirgule(ensemble: Ensemble): string {
  return `il appartient donc à $${miseEnEvidence(ensemble)}$.`
}

function nomCalcul(indice: number): string {
  let rang = indice + 1
  let nom = ''
  while (rang > 0) {
    rang--
    nom = String.fromCharCode(65 + (rang % 26)) + nom
    rang = Math.floor(rang / 26)
  }
  return nom
}

function genereCalcul(famille: Famille): Calcul {
  switch (famille) {
    case 'quotientDifference': {
      const d = randint(2, 7)
      const n = randint(1, 12)
      const b = randint(1, 9)
      const a = d * n + b
      return {
        expression: `\\dfrac{${a}-${b}}{${d}}`,
        correction: `$\\dfrac{${a}-${b}}{${d}}=\\dfrac{${d * n}}{${d}}=${n}$. ${conclusion('\\mathbb{N}')}`,
        reponse: '\\mathbb{N}',
      }
    }
    case 'sommeFractionsUn': {
      const somme = choice([
        [
          '\\dfrac{1}{2}+\\dfrac{1}{3}+\\dfrac{1}{6}',
          '\\dfrac{3}{6}+\\dfrac{2}{6}+\\dfrac{1}{6}=1',
        ],
        [
          '\\dfrac{1}{2}+\\dfrac{1}{4}+\\dfrac{1}{4}',
          '\\dfrac{2}{4}+\\dfrac{1}{4}+\\dfrac{1}{4}=1',
        ],
        ['\\dfrac{1}{3}+\\dfrac{1}{3}+\\dfrac{1}{3}', '\\dfrac{3}{3}=1'],
      ])
      return {
        expression: somme[0],
        correction: `$${somme[0]}=${somme[1]}$. ${conclusion('\\mathbb{N}')}`,
        reponse: '\\mathbb{N}',
      }
    }
    case 'differenceFractionRacineNaturel': {
      const racine = randint(2, 12)
      const resultat = randint(1, 8)
      const dividende = 2 * (racine + resultat)
      return {
        expression: `\\dfrac{${dividende}}{2}-\\sqrt{${racine ** 2}}`,
        correction: `$\\dfrac{${dividende}}{2}-\\sqrt{${racine ** 2}}=${racine + resultat}-${racine}=${resultat}$. ${conclusion('\\mathbb{N}')}`,
        reponse: '\\mathbb{N}',
      }
    }
    case 'racineNegative': {
      const a = randint(2, 12)
      return {
        expression: `-\\sqrt{${a ** 2}}`,
        correction: `$-\\sqrt{${a ** 2}}=-${a}$. Ce nombre est un entier négatif, ${conclusionApresVirgule('\\mathbb{Z}')}`,
        reponse: '\\mathbb{Z}',
      }
    }
    case 'differenceRacines': {
      const a = randint(2, 8)
      const b = randint(a + 1, 12)
      return {
        expression: `\\sqrt{${a ** 2}}-\\sqrt{${b ** 2}}`,
        correction: `$\\sqrt{${a ** 2}}-\\sqrt{${b ** 2}}=${a}-${b}=${a - b}$. Ce nombre est un entier négatif, ${conclusionApresVirgule('\\mathbb{Z}')}`,
        reponse: '\\mathbb{Z}',
      }
    }
    case 'soustractionNegative': {
      const a = randint(1, 12)
      const b = randint(a + 1, a + 15)
      return {
        expression: `${a}-${b}`,
        correction: `$${a}-${b}=${a - b}$. Ce nombre est un entier négatif, ${conclusionApresVirgule('\\mathbb{Z}')}`,
        reponse: '\\mathbb{Z}',
      }
    }
    case 'differenceFractionRacineRelatif': {
      const racine = randint(3, 12)
      const valeurAbsolue = randint(1, racine - 1)
      const dividende = 2 * (racine - valeurAbsolue)
      return {
        expression: `\\dfrac{${dividende}}{2}-\\sqrt{${racine ** 2}}`,
        correction: `$\\dfrac{${dividende}}{2}-\\sqrt{${racine ** 2}}=${racine - valeurAbsolue}-${racine}=-${valeurAbsolue}$. Ce nombre est un entier négatif, ${conclusionApresVirgule('\\mathbb{Z}')}`,
        reponse: '\\mathbb{Z}',
      }
    }
    case 'fractionDecimale': {
      const d = choice([2, 4, 5, 8, 10, 20, 25])
      const n = randint(1, 2 * d - 1, [d])
      return {
        expression: `\\dfrac{${n}}{${d}}`,
        correction: `$\\dfrac{${n}}{${d}}=${texNombre(n / d)}$. Ce nombre possède une écriture décimale sans être entier. ${conclusion('\\mathbb{D}')}`,
        reponse: '\\mathbb{D}',
      }
    }
    case 'sommeDecimale': {
      const a = randint(1, 9)
      const b = randint(1, 9)
      return {
        expression: `\\dfrac{${a}}{10}+\\dfrac{${b}}{100}`,
        correction: `$\\dfrac{${a}}{10}+\\dfrac{${b}}{100}=${texNombre(a / 10 + b / 100)}$. Ce nombre possède une écriture décimale sans être entier. ${conclusion('\\mathbb{D}')}`,
        reponse: '\\mathbb{D}',
      }
    }
    case 'fractionRationnelle': {
      const d = choice([3, 7, 11, 13])
      const n = randint(1, 2 * d - 1, [d])
      return {
        expression: `\\dfrac{${n}}{${d}}`,
        correction: `La fraction $\\dfrac{${n}}{${d}}$ n’a donc pas d’écriture décimale. ${conclusion('\\mathbb{Q}')}`,
        reponse: '\\mathbb{Q}',
      }
    }
    case 'sommeRationnelle': {
      const a = randint(1, 4)
      const d = choice([3, 7])
      const n = randint(1, d - 1)
      return {
        expression: `${a}+\\dfrac{${n}}{${d}}`,
        correction: `$${a}+\\dfrac{${n}}{${d}}=\\dfrac{${a * d + n}}{${d}}$. Cette fraction est irréductible et n’a pas d’écriture décimale. ${conclusion('\\mathbb{Q}')}`,
        reponse: '\\mathbb{Q}',
      }
    }
    case 'racineIrrationnelle': {
      const a = randint(2, 50, [4, 9, 16, 25, 36, 49])
      return {
        expression: `\\sqrt{${a}}`,
        correction: `$${a}$ n’est pas le carré d’un entier, donc $\\sqrt{${a}}$ est irrationnel. ${conclusion('\\mathbb{R}')}`,
        reponse: '\\mathbb{R}',
      }
    }
    case 'entierPlusRacine': {
      const n = randint(1, 9)
      const a = randint(2, 30, [4, 9, 16, 25])
      return {
        expression: `${n}+\\sqrt{${a}}`,
        correction: `$\\sqrt{${a}}$ est irrationnel, donc $${n}+\\sqrt{${a}}$ est également irrationnel. ${conclusion('\\mathbb{R}')}`,
        reponse: '\\mathbb{R}',
      }
    }
    case 'multiplePi': {
      const a = randint(2, 9)
      return {
        expression: `${a}\\pi`,
        correction: `$\\pi$ est irrationnel, donc $${a}\\pi$ est irrationnel. ${conclusion('\\mathbb{R}')}`,
        reponse: '\\mathbb{R}',
      }
    }
  }
}

/** Classer des calculs tirés dans des familles variées. @author Stéphane Guyon */
export default class ClasserResultatsCalculs extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Parmi $\\mathbb{R}$, $\\mathbb{Q}$, $\\mathbb{D}$, $\\mathbb{Z}$ et $\\mathbb{N}$, déterminer le plus petit ensemble de nombres auquel appartient chacun des nombres suivants.'
    this.nbQuestions = 8
    this.listeAvecNumerotation = false
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion(): void {
    const familles: Famille[] =
      this.nbQuestions >= 5
        ? Object.values(famillesParEnsemble).map((liste) => choice(liste))
        : []
    let famillesDisponibles = shuffle(
      toutesLesFamilles.filter((famille) => !familles.includes(famille)),
    )
    while (familles.length < this.nbQuestions) {
      if (famillesDisponibles.length === 0) {
        famillesDisponibles = shuffle([...toutesLesFamilles])
      }
      familles.push(famillesDisponibles.pop() as Famille)
    }
    const famillesMelangees = shuffle(familles)

    famillesMelangees.map(genereCalcul).forEach((calcul, indice) => {
      let texte = `$${nomCalcul(indice)}=${calcul.expression}\\in$`
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            indice,
            KeyboardType.clavierEnsemblePredefini,
          )
        : '$\\ldots$'
      this.listeQuestions[indice] = texte
      this.listeCorrections[indice] = calcul.correction
      handleAnswers(this, indice, {
        reponse: {
          value: calcul.reponse,
          options: { intervalle: true },
        },
      })
    })
    listeQuestionsToContenu(this)
  }
}
