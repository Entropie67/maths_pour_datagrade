import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer tous les ensembles de nombres auxquels appartient un nombre'
export const dateDePublication = '25/09/2026'
export const uuid = 'ca9b7'
export const interactifReady = true
export const interactifType = 'qcm'
export const amcReady = true
export const amcType = 'qcmMult'

export const refs = { 'fr-fr': ['2N10-5'], 'fr-ch': ['11LCNO5A-2', '11LSNO5A-2'] }

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
  return `Ce nombre appartient donc à $${ensemble}$.`
}

function conclusionApresVirgule(ensemble: Ensemble): string {
  return `il appartient donc à $${ensemble}$.`
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
        correction: `$\\dfrac{${n}}{${d}}=${texNombre(n / d)}$. Ce nombre possède une écriture décimale sans être entier. Ce nombre appartient à $\\mathbb{D}$ mais pas à $\\mathbb{Z}$.`,
        reponse: '\\mathbb{D}',
      }
    }
    case 'sommeDecimale': {
      const a = randint(1, 9)
      const b = randint(1, 9)
      return {
        expression: `\\dfrac{${a}}{10}+\\dfrac{${b}}{100}`,
        correction: `$\\dfrac{${a}}{10}+\\dfrac{${b}}{100}=${texNombre(a / 10 + b / 100)}$. Ce nombre possède une écriture décimale sans être entier. Ce nombre appartient à $\\mathbb{D}$ mais pas à $\\mathbb{Z}$.`,
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

/** Tire nbQuestions familles en couvrant chaque ensemble dès qu'il y a au moins 5 questions (même tirage que 2N10-4). */
function choisirFamilles(nbQuestions: number): Famille[] {
  const familles: Famille[] =
    nbQuestions >= 5
      ? Object.values(famillesParEnsemble).map((liste) => choice(liste))
      : []
  let famillesDisponibles = shuffle(
    toutesLesFamilles.filter((famille) => !familles.includes(famille)),
  )
  while (familles.length < nbQuestions) {
    if (famillesDisponibles.length === 0) {
      famillesDisponibles = shuffle([...toutesLesFamilles])
    }
    familles.push(famillesDisponibles.pop() as Famille)
  }
  return shuffle(familles)
}

const ensemblesEmboites: Ensemble[] = [
  '\\mathbb{N}',
  '\\mathbb{Z}',
  '\\mathbb{D}',
  '\\mathbb{Q}',
  '\\mathbb{R}',
]

/** Mélange les ensembles en évitant l’ordre N, Z, D, Q, R. */
function melangeEnsembles(): Ensemble[] {
  let ensembles = shuffle(ensemblesEmboites)
  while (ensembles.every((ensemble, i) => ensemble === ensemblesEmboites[i])) {
    ensembles = shuffle(ensemblesEmboites)
  }
  return ensembles
}

function listeEnsembles(ensembles: Ensemble[]): string {
  const textes = ensembles.map((ensemble) => `$${miseEnEvidence(ensemble)}$`)
  if (textes.length === 1) return textes[0]
  return `${textes.slice(0, -1).join(', ')} et ${textes[textes.length - 1]}`
}

function genereNombre(ensemble: Ensemble): Calcul {
  switch (ensemble) {
    case '\\mathbb{N}': {
      const n = randint(0, 99)
      return {
        expression: `${n}`,
        correction: `$${n}$ est un entier positif, le plus petit ensemble auquel il appartient est donc $\\mathbb{N}$.`,
        reponse: ensemble,
      }
    }
    case '\\mathbb{Z}': {
      const n = randint(-99, -1)
      return {
        expression: `${n}`,
        correction: `$${n}$ est un entier négatif, le plus petit ensemble auquel il appartient est donc $\\mathbb{Z}$.`,
        reponse: ensemble,
      }
    }
    case '\\mathbb{D}': {
      const x =
        (choice([-1, 1]) *
          randint(1, 999, [100, 200, 300, 400, 500, 600, 700, 800, 900])) /
        100
      return {
        expression: texNombre(x),
        correction: `$${texNombre(x)}$ est un nombre décimal qui n’est pas entier, le plus petit ensemble auquel il appartient est donc $\\mathbb{D}$.`,
        reponse: ensemble,
      }
    }
    case '\\mathbb{Q}': {
      const d = choice([3, 6, 7, 9, 11, 12])
      const exclus = Array.from({ length: 3 * d }, (_, k) => k + 1).filter(
        (k) => gcd(k, d) !== 1,
      )
      const n = randint(1, 3 * d, exclus)
      const signe = choice(['', '-'])
      return {
        expression: `${signe}\\dfrac{${n}}{${d}}`,
        correction: `La fraction $${signe}\\dfrac{${n}}{${d}}$ est irréductible et son dénominateur a un facteur premier autre que $2$ et $5$, elle n’a donc pas d’écriture décimale. Le plus petit ensemble auquel ce nombre appartient est donc $\\mathbb{Q}$.`,
        reponse: ensemble,
      }
    }
    case '\\mathbb{R}': {
      const a = randint(2, 50, [4, 9, 16, 25, 36, 49])
      const k = randint(2, 9)
      const nombre = choice([
        [
          `\\sqrt{${a}}`,
          `$${a}$ n’est pas le carré d’un entier, donc $\\sqrt{${a}}$ est irrationnel.`,
        ],
        [
          `-\\sqrt{${a}}`,
          `$${a}$ n’est pas le carré d’un entier, donc $-\\sqrt{${a}}$ est irrationnel.`,
        ],
        [
          `${k}\\sqrt{${a}}`,
          `$\\sqrt{${a}}$ est irrationnel, donc $${k}\\sqrt{${a}}$ est irrationnel.`,
        ],
        ['\\pi', '$\\pi$ est irrationnel.'],
        [
          `${k}\\pi`,
          `$\\pi$ est irrationnel, donc $${k}\\pi$ est irrationnel.`,
        ],
      ])
      return {
        expression: nombre[0],
        correction: `${nombre[1]} Le plus petit ensemble auquel ce nombre appartient est donc $\\mathbb{R}$.`,
        reponse: ensemble,
      }
    }
  }
}

/** Cocher tous les ensembles de nombres auxquels appartient un nombre. @author Arnaud Meistermann */
export default class CocherEnsemblesNombres extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacing = 1.5
    this.besoinFormulaireTexte = [
      'Type de nombres',
      'Nombres séparés par des tirets :\n1 : Résultat d’un calcul\n2 : Nombre donné\n3 : Mélange',
    ]
    this.sup = '3'
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions === 1
        ? 'Cocher tous les ensembles de nombres auxquels appartient le nombre suivant.'
        : 'Pour chacun des nombres suivants, cocher tous les ensembles de nombres auxquels il appartient.'
    const typesDeNombres = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      defaut: 3,
      listeOfCase: ['calcul', 'nombre'],
      nbQuestions: this.nbQuestions,
      melange: 3,
    })
    // Les familles de calculs fixent l’ensemble de chaque question (tous les
    // ensembles sont couverts dès 5 questions). Un nombre donné remplace le
    // calcul par un nombre du même ensemble.
    const nombres: Calcul[] = choisirFamilles(this.nbQuestions).map(
      (famille, i) => {
        const calcul = genereCalcul(famille)
        return typesDeNombres[i] === 'nombre'
          ? genereNombre(calcul.reponse)
          : calcul
      },
    )
    nombres.forEach((nombre, i) => {
      const rang = ensemblesEmboites.indexOf(nombre.reponse)
      const ensemblesVrais = ensemblesEmboites.slice(rang)
      this.autoCorrection[i] = {
        enonce: `$${nombre.expression}$`,
        options: { vertical: false, ordered: true },
        propositions: melangeEnsembles().map((ensemble) => ({
          texte: `$${ensemble}$`,
          statut: ensemblesVrais.includes(ensemble),
        })),
      }
      const qcm = propositionsQcm(this, i)
      let correction = nombre.correction
      if (ensemblesVrais.length > 1) {
        correction += `<br>Comme $\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{D}\\subset\\mathbb{Q}\\subset\\mathbb{R}$, ce nombre appartient à ${listeEnsembles(ensemblesVrais)}.`
      } else {
        correction += `<br>Il appartient uniquement à $${miseEnEvidence('\\mathbb{R}')}$.`
      }
      this.listeQuestions[i] = `$${nombre.expression}$${qcm.texte}`
      this.listeCorrections[i] = `${qcm.texteCorr}${correction}`
    })
    listeQuestionsToContenu(this)
  }
}
